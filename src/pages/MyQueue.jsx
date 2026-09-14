import { useEffect, useState } from "react";
import axios from "axios";

function MyQueue() {

  // =========================================
  // API URL
  // =========================================

  const API_URL = import.meta.env.VITE_API_URL;


  const [queueInfo, setQueueInfo] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const [hospital, setHospital] = useState(null);
  const [department, setDepartment] = useState(null);
  const [doctor, setDoctor] = useState(null);

  const [lastUpdated, setLastUpdated] = useState(
    new Date()
  );


  // =========================================
  // GET LOGGED-IN PATIENT
  // =========================================

  const patient =
    JSON.parse(
      localStorage.getItem("patient")
    );

  const savedQueue =
    JSON.parse(
      localStorage.getItem("myQueue")
    );


  // =========================================
  // LOAD HOSPITAL / DEPARTMENT / DOCTOR
  // =========================================

  async function loadDetails() {

    if (!savedQueue) {
      return;
    }

    try {

      const [
        hospitalResponse,
        departmentResponse,
        doctorResponse
      ] = await Promise.all([

        axios.get(
          `${API_URL}/hospitals/${savedQueue.hospitalId}`
        ),

        axios.get(
          `${API_URL}/departments/${savedQueue.departmentId}`
        ),

        axios.get(
          `${API_URL}/doctors/${savedQueue.doctorId}`
        )

      ]);


      setHospital(
        hospitalResponse.data
      );

      setDepartment(
        departmentResponse.data
      );

      setDoctor(
        doctorResponse.data
      );

    } catch (error) {

      console.error(
        "Error loading hospital/department/doctor:",
        error
      );

    }

  }


  // =========================================
  // LOAD QUEUE
  // =========================================

  async function loadQueue() {

    if (!patient || !savedQueue) {

      setLoading(false);

      return;

    }


    try {

      const response =
        await axios.get(
          `${API_URL}/queues/doctor/${savedQueue.doctorId}/today`
        );


      const queue =
        response.data;


      setQueueData(queue);

      setLastUpdated(
        new Date()
      );


      // =====================================
      // FIND THIS PATIENT
      // =====================================

      const myPatientQueue =
        queue.find(
          (entry) =>
            entry.id === savedQueue.id &&
            entry.patientId === patient.id
        );


      if (!myPatientQueue) {

        setQueueInfo(null);

        return;

      }


      // =====================================
      // COMPLETED / CANCELLED
      // =====================================

      if (
        myPatientQueue.status === "CANCELLED" ||
        myPatientQueue.status === "COMPLETED"
      ) {

        localStorage.removeItem(
          "myQueue"
        );

        setQueueInfo(null);

        return;

      }


      // =====================================
      // CURRENTLY SERVING
      // =====================================

      const currentServing =
        queue.find(
          (entry) =>
            entry.status === "SERVING"
        );


      // =====================================
      // PEOPLE AHEAD
      // =====================================

      const peopleAhead =
        queue.filter(
          (entry) =>
            entry.status === "WAITING" &&
            entry.tokenNumber <
              myPatientQueue.tokenNumber
        ).length;


      // =====================================
      // ESTIMATED WAIT
      // =====================================

      const estimatedWait =
        peopleAhead * 4;


      // =====================================
      // TOTAL PATIENTS AHEAD + YOU
      // =====================================

      const totalQueuePosition =
        queue.filter(
          (entry) =>
            (
              entry.status === "WAITING" ||
              entry.status === "SERVING"
            ) &&
            entry.tokenNumber <=
              myPatientQueue.tokenNumber
        ).length;


      // =====================================
      // QUEUE PROGRESS
      // =====================================

      const waitingPatients =
        queue.filter(
          (entry) =>
            entry.status === "WAITING"
        ).length;


      const completedPatients =
        queue.filter(
          (entry) =>
            entry.status === "COMPLETED"
        ).length;


      const totalActivePatients =
        waitingPatients +
        (currentServing ? 1 : 0);


      let progress = 0;


      if (
        myPatientQueue.status === "SERVING"
      ) {

        progress = 100;

      } else if (
        totalActivePatients > 0
      ) {

        progress =
          Math.round(
            (
              (
                totalActivePatients -
                peopleAhead
              ) /
              totalActivePatients
            ) * 100
          );

      }


      // Keep progress between 0 and 100

      progress =
        Math.max(
          0,
          Math.min(
            100,
            progress
          )
        );


      // =====================================
      // SAVE QUEUE INFORMATION
      // =====================================

      setQueueInfo({

        id:
          myPatientQueue.id,

        tokenNumber:
          myPatientQueue.tokenNumber,

        status:
          myPatientQueue.status,

        currentToken:
          currentServing
            ? currentServing.tokenNumber
            : null,

        peopleAhead:
          peopleAhead,

        estimatedWait:
          estimatedWait,

        queuePosition:
          totalQueuePosition,

        progress:
          progress,

        completedPatients:
          completedPatients,

        totalActivePatients:
          totalActivePatients,

        hospitalId:
          myPatientQueue.hospitalId,

        departmentId:
          myPatientQueue.departmentId,

        doctorId:
          myPatientQueue.doctorId,

        patientName:
          myPatientQueue.patientName,

        patientPhone:
          myPatientQueue.patientPhone

      });


    } catch (error) {

      console.error(
        "Error loading queue:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  // =========================================
  // INITIAL LOAD + AUTO REFRESH
  // =========================================

  useEffect(() => {

    loadDetails();

    loadQueue();


    // Refresh every 3 seconds

    const interval =
      setInterval(
        loadQueue,
        3000
      );


    return () =>
      clearInterval(interval);

  }, []);


  // =========================================
  // CANCEL QUEUE
  // =========================================

  async function cancelQueue() {

    if (!queueInfo) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to cancel your queue?"
      );


    if (!confirmed) {
      return;
    }


    setCancelling(true);


    try {

      const response =
        await axios.put(
          `${API_URL}/queues/${queueInfo.id}/cancel`
        );


      console.log(
        "Queue cancelled:",
        response.data
      );


      localStorage.removeItem(
        "myQueue"
      );


      setQueueInfo(null);


      alert(
        `A-${response.data.tokenNumber} has been cancelled.`
      );


    } catch (error) {

      console.error(
        "Error cancelling queue:",
        error
      );


      alert(
        "Unable to cancel your queue."
      );


    } finally {

      setCancelling(false);

    }

  }


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="dashboard">

        <div className="queue-loading">

          <div className="queue-loading-icon">
            🎫
          </div>

          <h1>
            Loading Your Queue
          </h1>

          <p>
            Please wait while we get your
            latest queue information.
          </p>

        </div>

      </div>

    );

  }


  // =========================================
  // NO ACTIVE QUEUE
  // =========================================

  if (!queueInfo) {

    return (

      <div className="dashboard">

        <div className="queue-page-header">

          <div>

            <span className="queue-page-label">
              QUEUELESS
            </span>

            <h1>
              My Queue 🎫
            </h1>

            <p>
              Track your position in real time.
            </p>

          </div>

        </div>


        <div className="login-card queue-empty-state">

          <div className="queue-empty-icon">
            🎫
          </div>

          <h2>
            No Active Queue
          </h2>

          <p>
            You are not currently waiting
            in a queue.
          </p>

        </div>

      </div>

    );

  }


  // =========================================
  // STATUS
  // =========================================

  const isServing =
    queueInfo.status === "SERVING";

  const isHold =
    queueInfo.status === "HOLD";

  const isWaiting =
    queueInfo.status === "WAITING";


  let statusMessage =
    "WAITING";


  if (isServing) {

    statusMessage =
      "YOUR TURN";

  }


  if (isHold) {

    statusMessage =
      "ON HOLD";

  }


  // =========================================
  // STATUS DESCRIPTION
  // =========================================

  let statusDescription =
    "Please wait. Your turn is approaching.";


  if (isServing) {

    statusDescription =
      "Please proceed to the consultation area.";

  }


  if (isHold) {

    statusDescription =
      "Your queue entry is currently on hold.";

  }


  return (

    <div className="dashboard queue-page">


      {/* ===================================== */}
      {/* PAGE HEADER */}
      {/* ===================================== */}

      <div className="queue-page-header">

        <div>

          <span className="queue-page-label">
            LIVE QUEUE
          </span>

          <h1>
            My Queue 🎫
          </h1>

          <p>
            Track your position in real time.
          </p>

        </div>


        <div className="queue-live-indicator">

          <span>
            ●
          </span>

          LIVE

        </div>

      </div>


      {/* ===================================== */}
      {/* YOUR TURN ALERT */}
      {/* ===================================== */}

      {isServing && (

        <div className="queue-turn-alert">

          <div className="queue-turn-icon">
            🔔
          </div>


          <div>

            <strong>
              It's your turn!
            </strong>

            <p>
              Token A-{queueInfo.tokenNumber}
              {" "}is now being served.
              Please proceed to the consultation area.
            </p>

          </div>

        </div>

      )}


      {/* ===================================== */}
      {/* PATIENT INFORMATION */}
      {/* ===================================== */}

      <div className="login-card queue-patient-card">

        <div>

          <span className="queue-section-label">
            PATIENT
          </span>

          <h2>
            {queueInfo.patientName ||
              patient?.name ||
              "Patient"}
          </h2>

          <p>
            📞{" "}
            {queueInfo.patientPhone ||
              patient?.phone ||
              "Phone unavailable"}
          </p>

        </div>


        <div className="queue-patient-status">

          <span>
            STATUS
          </span>

          <strong className={
            isServing
              ? "queue-status-serving"
              : isHold
                ? "queue-status-hold"
                : "queue-status-waiting"
          }>

            {isServing && "🟢 "}
            {isHold && "🟡 "}
            {isWaiting && "🟠 "}

            {statusMessage}

          </strong>

        </div>

      </div>


      {/* ===================================== */}
      {/* HOSPITAL INFORMATION */}
      {/* ===================================== */}

      <div className="login-card queue-location-card">

        <div className="queue-location-item">

          <span className="queue-location-icon">
            🏥
          </span>

          <div>

            <span>
              HOSPITAL
            </span>

            <strong>
              {hospital
                ? hospital.name
                : "Loading hospital..."}
            </strong>

            {hospital?.location && (
              <p>
                {hospital.location}
              </p>
            )}

          </div>

        </div>


        <div className="queue-location-item">

          <span className="queue-location-icon">
            🩺
          </span>

          <div>

            <span>
              DEPARTMENT
            </span>

            <strong>
              {department
                ? department.name
                : "Loading department..."}
            </strong>

          </div>

        </div>


        <div className="queue-location-item">

          <span className="queue-location-icon">
            👨‍⚕️
          </span>

          <div>

            <span>
              DOCTOR
            </span>

            <strong>
              {doctor
                ? doctor.name
                : "Loading doctor..."}
            </strong>

            {doctor?.specialization && (
              <p>
                {doctor.specialization}
              </p>
            )}

          </div>

        </div>

      </div>


      {/* ===================================== */}
      {/* MAIN QUEUE TOKEN */}
      {/* ===================================== */}

      <div className="queue-main-card">

        <div className="queue-main-label">
          YOUR TOKEN
        </div>


        <div className="queue-main-token">
          A-{queueInfo.tokenNumber}
        </div>


        <div className={
          isServing
            ? "queue-main-status serving"
            : isHold
              ? "queue-main-status hold"
              : "queue-main-status waiting"
        }>

          {isServing && "🟢 "}
          {isHold && "🟡 "}
          {isWaiting && "🟠 "}

          {statusMessage}

        </div>


        <p className="queue-status-description">
          {statusDescription}
        </p>


        {!isServing && (

          <div className="queue-progress-section">

            <div className="queue-progress-header">

              <span>
                Queue Progress
              </span>

              <strong>
                {queueInfo.progress}%
              </strong>

            </div>


            <div className="queue-progress-bar">

              <div
                className="queue-progress-fill"
                style={{
                  width:
                    `${queueInfo.progress}%`
                }}
              />

            </div>

          </div>

        )}

      </div>


      {/* ===================================== */}
      {/* QUEUE STATISTICS */}
      {/* ===================================== */}

      <div className="queue-stats-grid">


        {/* CURRENT TOKEN */}

        <div className="queue-stat-card">

          <div className="queue-stat-icon">
            📢
          </div>

          <span>
            NOW SERVING
          </span>

          <strong>

            {queueInfo.currentToken
              ? `A-${queueInfo.currentToken}`
              : "NONE"}

          </strong>

          <p>
            Current patient
          </p>

        </div>


        {/* PEOPLE AHEAD */}

        <div className="queue-stat-card">

          <div className="queue-stat-icon">
            👥
          </div>

          <span>
            PEOPLE AHEAD
          </span>

          <strong>
            {queueInfo.peopleAhead}
          </strong>

          <p>
            patients before you
          </p>

        </div>


        {/* QUEUE POSITION */}

        <div className="queue-stat-card">

          <div className="queue-stat-icon">
            #️⃣
          </div>

          <span>
            YOUR POSITION
          </span>

          <strong>
            {queueInfo.queuePosition}
          </strong>

          <p>
            in the active queue
          </p>

        </div>


        {/* WAIT TIME */}

        <div className="queue-stat-card">

          <div className="queue-stat-icon">
            ⏱️
          </div>

          <span>
            ESTIMATED WAIT
          </span>

          <strong>
            {queueInfo.estimatedWait}
            {" "}min
          </strong>

          <p>
            approximate waiting time
          </p>

        </div>

      </div>


      {/* ===================================== */}
      {/* LIVE INFORMATION */}
      {/* ===================================== */}

      <div className="login-card queue-live-card">

        <div className="queue-live-header">

          <div>

            <span className="queue-section-label">
              LIVE INFORMATION
            </span>

            <h2>
              Queue Updates
            </h2>

          </div>

          <div className="queue-live-dot">
            ● LIVE
          </div>

        </div>


        <div className="queue-info-grid">

          <div>

            <span>
              YOUR TOKEN
            </span>

            <strong>
              A-{queueInfo.tokenNumber}
            </strong>

          </div>


          <div>

            <span>
              CURRENT TOKEN
            </span>

            <strong>

              {queueInfo.currentToken
                ? `A-${queueInfo.currentToken}`
                : "None"}

            </strong>

          </div>


          <div>

            <span>
              PEOPLE AHEAD
            </span>

            <strong>
              {queueInfo.peopleAhead}
            </strong>

          </div>


          <div>

            <span>
              LAST UPDATED
            </span>

            <strong>

              {lastUpdated.toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                }
              )}

            </strong>

          </div>

        </div>

      </div>


      {/* ===================================== */}
      {/* CANCEL QUEUE */}
      {/* ===================================== */}

      {isWaiting && (

        <div className="login-card queue-cancel-card">

          <div>

            <span className="queue-section-label">
              QUEUE ACTION
            </span>

            <h3>
              Want to leave the queue?
            </h3>

            <p>
              Cancelling your queue will remove
              you from today's waiting list.
            </p>

          </div>


          <button
            className="queue-cancel-button"
            onClick={cancelQueue}
            disabled={cancelling}
          >

            {cancelling
              ? "Cancelling..."
              : "Cancel Queue"}

          </button>

        </div>

      )}

    </div>

  );

}

export default MyQueue;