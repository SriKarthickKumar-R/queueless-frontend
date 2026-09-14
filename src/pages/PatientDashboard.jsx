import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function PatientDashboard() {

  const [queue, setQueue] = useState(null);

  const [appointments, setAppointments] =
    useState([]);

  const [patient, setPatient] =
    useState(null);

  const [hospitalCount, setHospitalCount] =
    useState(0);

  const [showTurnNotification, setShowTurnNotification] =
    useState(false);


  // =========================================
  // LOAD DASHBOARD DATA
  // =========================================

  useEffect(() => {

    const savedPatient =
      localStorage.getItem("patient");

    if (savedPatient) {

      const patientData =
        JSON.parse(savedPatient);

      setPatient(patientData);

      loadQueue(patientData);

    }

    loadAppointments();

    loadHospitalCount();


    // Refresh queue every 3 seconds

    const interval =
      setInterval(() => {

        const currentPatient =
          localStorage.getItem("patient");

        if (currentPatient) {

          const patientData =
            JSON.parse(currentPatient);

          loadQueue(patientData);

        }

      }, 3000);


    return () =>
      clearInterval(interval);

  }, []);


  // =========================================
  // LOAD CURRENT QUEUE
  // =========================================

  async function loadQueue(
    patientData
  ) {

    try {

      const savedQueue =
        JSON.parse(
          localStorage.getItem("myQueue")
        );


      // No queue

      if (!savedQueue) {

        setQueue(null);

        setShowTurnNotification(false);

        return;

      }


      // Get today's queue

      const response =
        await axios.get(
          `${API_URL}/queues/doctor/${savedQueue.doctorId}/today`
        );


      const queueData =
        response.data;


      // Find patient's queue entry

      const myQueue =
        queueData.find(
          (entry) =>
            entry.id === savedQueue.id &&
            entry.patientId === patientData.id
        );


      // Queue entry not found

      if (!myQueue) {

        setQueue(null);

        setShowTurnNotification(false);

        localStorage.removeItem(
          "myQueue"
        );

        return;

      }


      // =====================================
      // CHECK PATIENT STATUS
      // =====================================

      if (
        myQueue.status === "SERVING"
      ) {

        setShowTurnNotification(true);

      } else {

        setShowTurnNotification(false);

      }


      // =====================================
      // COMPLETED
      // =====================================

      if (
        myQueue.status === "COMPLETED"
      ) {

        setQueue(null);

        setShowTurnNotification(false);

        localStorage.removeItem(
          "myQueue"
        );

        return;

      }


      // =====================================
      // CANCELLED
      // =====================================

      if (
        myQueue.status === "CANCELLED"
      ) {

        setQueue(null);

        setShowTurnNotification(false);

        localStorage.removeItem(
          "myQueue"
        );

        return;

      }


      // =====================================
      // CURRENT SERVING PATIENT
      // =====================================

      const currentServing =
        queueData.find(
          (entry) =>
            entry.status === "SERVING"
        );


      // =====================================
      // PEOPLE AHEAD
      // =====================================

      const peopleAhead =
        queueData.filter(
          (entry) =>
            entry.status === "WAITING" &&
            entry.tokenNumber <
              myQueue.tokenNumber
        ).length;


      // =====================================
      // ESTIMATED WAIT
      // =====================================

      const estimatedWait =
        peopleAhead * 4;


      // =====================================
      // SAVE QUEUE
      // =====================================

      setQueue({

        id:
          myQueue.id,

        tokenNumber:
          myQueue.tokenNumber,

        status:
          myQueue.status,

        currentToken:
          currentServing
            ? currentServing.tokenNumber
            : null,

        peopleAhead:
          peopleAhead,

        estimatedWait:
          estimatedWait,

        doctorId:
          myQueue.doctorId,

        departmentId:
          myQueue.departmentId,

        hospitalId:
          myQueue.hospitalId

      });


    } catch (error) {

      console.error(
        "Error loading queue:",
        error
      );

    }

  }


  // =========================================
  // LOAD APPOINTMENTS
  // =========================================

  function loadAppointments() {

    const savedAppointments =
      JSON.parse(
        localStorage.getItem("appointments") ||
        "[]"
      );

    setAppointments(
      savedAppointments
    );

  }


  // =========================================
  // LOAD HOSPITAL COUNT
  // =========================================

  async function loadHospitalCount() {

    try {

      const response =
        await axios.get(
          `${API_URL}/hospitals`
        );


      setHospitalCount(
        response.data.length
      );


    } catch (error) {

      console.error(
        "Error loading hospitals:",
        error
      );

    }

  }


  // =========================================
  // APPOINTMENT FILTER
  // =========================================

  const activeAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "CONFIRMED"
    );


  const upcomingAppointment =
    activeAppointments.length > 0
      ? activeAppointments[
          activeAppointments.length - 1
        ]
      : null;


  // =========================================
  // GREETING
  // =========================================

  const currentHour =
    new Date().getHours();


  let greeting =
    "Good morning";


  if (
    currentHour >= 12 &&
    currentHour < 17
  ) {

    greeting =
      "Good afternoon";

  }


  if (
    currentHour >= 17
  ) {

    greeting =
      "Good evening";

  }


  // =========================================
  // PATIENT NAME
  // =========================================

  const patientName =
    patient
      ? patient.name
      : "Patient";


  // =========================================
  // QUEUE STATUS
  // =========================================

  function getQueueStatus() {

    if (!queue) {

      return null;

    }


    if (
      queue.status === "SERVING"
    ) {

      return "🟢 YOUR TURN";

    }


    if (
      queue.status === "HOLD"
    ) {

      return "🟡 ON HOLD";

    }


    return "🟠 WAITING";

  }


  return (

    <div className="patient-dashboard">


      {/* ===================================== */}
      {/* YOUR TURN NOTIFICATION */}
      {/* ===================================== */}

      {showTurnNotification &&
        queue &&
        queue.status === "SERVING" && (

        <div className="turn-notification">

          <div className="turn-notification-icon">
            🔔
          </div>


          <div className="turn-notification-content">

            <strong>
              It's your turn!
            </strong>


            <p>

              Token A-{queue.tokenNumber}
              {" "}is now being served.
              Please proceed to the
              consultation area.

            </p>

          </div>


          <button
            onClick={() =>
              setShowTurnNotification(false)
            }
            aria-label="Close notification"
          >
            ✕
          </button>

        </div>

      )}


      {/* ===================================== */}
      {/* WELCOME */}
      {/* ===================================== */}

      <div className="dashboard-welcome">

        <div>

          <h1>

            {greeting},{" "}
            {patientName} 👋

          </h1>

          <p>

            Here's what's happening with your
            healthcare today.

          </p>

        </div>


        <div className="welcome-date">

          <span>
            Today
          </span>

          <strong>

            {new Date().toLocaleDateString(
              "en-IN",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            )}

          </strong>

        </div>

      </div>


      {/* ===================================== */}
      {/* OVERVIEW */}
      {/* ===================================== */}

      <div className="overview-grid">


        {/* MY QUEUE */}

        <div className="overview-card">

          <div className="overview-icon">
            🎫
          </div>


          <div className="overview-content">

            <span className="overview-label">
              My Queue
            </span>


            {queue ? (

              <>

                <h2>
                  A-{queue.tokenNumber}
                </h2>


                <p>

                  <strong>
                    {getQueueStatus()}
                  </strong>

                </p>


                <p>

                  {queue.peopleAhead}
                  {" "}people ahead

                </p>

              </>

            ) : (

              <>

                <h2>
                  No Queue
                </h2>

                <p>
                  You haven't joined a queue
                </p>

              </>

            )}

          </div>


          <Link to="/my-queue">

            <button className="small-button">

              {queue
                ? "View Queue →"
                : "Join Queue →"}

            </button>

          </Link>

        </div>


        {/* APPOINTMENT */}

        <div className="overview-card">

          <div className="overview-icon appointment-icon">
            📅
          </div>


          <div className="overview-content">

            <span className="overview-label">
              Next Appointment
            </span>


            {upcomingAppointment ? (

              <>

                <h2>
                  {upcomingAppointment.time}
                </h2>


                <p>
                  {upcomingAppointment.doctor}
                </p>

              </>

            ) : (

              <>

                <h2>
                  None
                </h2>

                <p>
                  No upcoming appointments
                </p>

              </>

            )}

          </div>


          <Link to="/appointments">

            <button className="small-button">
              View →
            </button>

          </Link>

        </div>


        {/* HOSPITALS */}

        <div className="overview-card">

          <div className="overview-icon hospital-icon">
            🏥
          </div>


          <div className="overview-content">

            <span className="overview-label">
              Hospitals
            </span>


            <h2>
              {hospitalCount}
            </h2>


            <p>
              Hospitals available
            </p>

          </div>


          <Link to="/hospitals">

            <button className="small-button">
              Find Hospital →
            </button>

          </Link>

        </div>

      </div>


      {/* ===================================== */}
      {/* CURRENT QUEUE DETAILS */}
      {/* ===================================== */}

      {queue && (

        <>

          <div className="section-heading">

            <div>

              <h2>
                Current Queue 🎫
              </h2>

              <p>
                Track your position without
                opening the queue page.
              </p>

            </div>

          </div>


          <div className="overview-grid">


            {/* TOKEN */}

            <div className="overview-card">

              <div className="overview-icon">
                🎫
              </div>


              <div className="overview-content">

                <span className="overview-label">
                  Your Token
                </span>


                <h2>
                  A-{queue.tokenNumber}
                </h2>


                <p>
                  {getQueueStatus()}
                </p>

              </div>

            </div>


            {/* NOW SERVING */}

            <div className="overview-card">

              <div className="overview-icon">
                🏃
              </div>


              <div className="overview-content">

                <span className="overview-label">
                  Now Serving
                </span>


                <h2>

                  {queue.currentToken
                    ? `A-${queue.currentToken}`
                    : "None"}

                </h2>


                <p>
                  Current patient
                </p>

              </div>

            </div>


            {/* PEOPLE AHEAD */}

            <div className="overview-card">

              <div className="overview-icon">
                👥
              </div>


              <div className="overview-content">

                <span className="overview-label">
                  People Ahead
                </span>


                <h2>
                  {queue.peopleAhead}
                </h2>


                <p>
                  patients before you
                </p>

              </div>

            </div>


            {/* WAIT TIME */}

            <div className="overview-card">

              <div className="overview-icon">
                ⏱️
              </div>


              <div className="overview-content">

                <span className="overview-label">
                  Estimated Wait
                </span>


                <h2>
                  {queue.estimatedWait} min
                </h2>


                <p>
                  approximate waiting time
                </p>

              </div>

            </div>

          </div>

        </>

      )}


      {/* ===================================== */}
      {/* QUICK ACTIONS */}
      {/* ===================================== */}

      <div className="section-heading">

        <div>

          <h2>
            Quick Actions
          </h2>

          <p>
            Get things done faster.
          </p>

        </div>

      </div>


      <div className="quick-actions">


        {/* FIND HOSPITAL */}

        <div className="action-card">

          <div className="action-icon">
            🏥
          </div>


          <div className="action-content">

            <h3>
              Find a Hospital
            </h3>


            <p>

              Find a hospital and join a
              digital queue without waiting
              in line.

            </p>


            <Link to="/hospitals">

              <button>
                Find Hospital →
              </button>

            </Link>

          </div>

        </div>


        {/* APPOINTMENT */}

        <div className="action-card">

          <div className="action-icon appointment-action">
            📅
          </div>


          <div className="action-content">

            <h3>
              Book an Appointment
            </h3>


            <p>

              Choose a doctor, date and
              available time slot for your
              consultation.

            </p>


            <Link to="/appointments/book">

              <button>
                Book Appointment →
              </button>

            </Link>

          </div>

        </div>

      </div>


      {/* ===================================== */}
      {/* HOW IT WORKS */}
      {/* ===================================== */}

      <div className="section-heading">

        <div>

          <h2>
            How QueueLess Works
          </h2>

          <p>
            Skip the waiting room in three
            simple steps.
          </p>

        </div>

      </div>


      <div className="steps-grid">


        {/* STEP 1 */}

        <div className="step-card">

          <div className="step-number">
            01
          </div>


          <h3>
            Choose a Hospital
          </h3>


          <p>

            Select the hospital and department
            you want to visit.

          </p>

        </div>


        {/* STEP 2 */}

        <div className="step-card">

          <div className="step-number">
            02
          </div>


          <h3>
            Get Your Token
          </h3>


          <p>

            Join the digital queue and receive
            your token number.

          </p>

        </div>


        {/* STEP 3 */}

        <div className="step-card">

          <div className="step-number">
            03
          </div>


          <h3>
            Track Your Turn
          </h3>


          <p>

            Monitor your queue and arrive when
            your turn is approaching.

          </p>

        </div>

      </div>

    </div>

  );

}

export default PatientDashboard;