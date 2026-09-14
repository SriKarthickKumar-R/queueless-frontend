import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function JoinQueue() {

  const API_URL = import.meta.env.VITE_API_URL;

  const { hospitalId, departmentId, doctorId } = useParams();

  const [token, setToken] = useState(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const [queueInfo, setQueueInfo] = useState({
    nowServing: "—",
    peopleAhead: "—",
    estimatedWait: "—"
  });


  // ==========================================
  // GET TODAY'S QUEUE
  // ==========================================

  async function loadQueue() {

    try {

      const response = await axios.get(
        `${API_URL}/queues/doctor/${doctorId}/today`
      );

      const queue = response.data;

      console.log("Today's queue:", queue);


      // ----------------------------------------
      // CURRENTLY SERVING
      // ----------------------------------------

      const servingPatient = queue.find(
        (entry) => entry.status === "SERVING"
      );


      let nowServing = "—";


      if (servingPatient) {

        nowServing =
          `A-${servingPatient.tokenNumber}`;

      }


      // ----------------------------------------
      // WAITING PATIENTS
      // ----------------------------------------

      const waitingPatients = queue.filter(
        (entry) => entry.status === "WAITING"
      );


      // ----------------------------------------
      // LOGGED-IN PATIENT
      // ----------------------------------------

      const savedPatient =
        localStorage.getItem("patient");


      if (savedPatient) {

        const patient =
          JSON.parse(savedPatient);


        /*
          Check whether this patient already
          has an active queue for this doctor.
        */

        const myActiveQueue =
          waitingPatients.find(
            (entry) =>
              entry.patientId === patient.id
          );


        if (myActiveQueue) {

          const myToken =
            `A-${myActiveQueue.tokenNumber}`;


          setToken(myToken);


          /*
            Save the real queue entry.
          */

          const myQueue = {

            id: myActiveQueue.id,

            token: myToken,

            tokenNumber:
              myActiveQueue.tokenNumber,

            patientId:
              myActiveQueue.patientId,

            hospitalId:
              myActiveQueue.hospitalId,

            departmentId:
              myActiveQueue.departmentId,

            doctorId:
              myActiveQueue.doctorId,

            status:
              myActiveQueue.status,

            queueDate:
              myActiveQueue.queueDate,

            joinedAt:
              myActiveQueue.joinedAt

          };


          localStorage.setItem(
            "myQueue",
            JSON.stringify(myQueue)
          );


          // --------------------------------------
          // PEOPLE AHEAD
          // --------------------------------------

          const peopleAhead =
            waitingPatients.filter(
              (entry) =>
                entry.tokenNumber <
                myActiveQueue.tokenNumber
            ).length;


          setQueueInfo({

            nowServing:
              nowServing,

            peopleAhead:
              peopleAhead,

            estimatedWait:
              `${peopleAhead * 4} min`

          });


        } else {

          /*
            No active queue for this patient.
          */

          setToken(null);

          setQueueInfo({

            nowServing:
              nowServing,

            peopleAhead:
              waitingPatients.length,

            estimatedWait:
              `${waitingPatients.length * 4} min`

          });

        }

      } else {

        /*
          No logged-in patient.
        */

        setQueueInfo({

          nowServing:
            nowServing,

          peopleAhead:
            waitingPatients.length,

          estimatedWait:
            `${waitingPatients.length * 4} min`

        });

      }


    } catch (error) {

      console.error(
        "Unable to load queue:",
        error
      );

    }

  }


  // ==========================================
  // LOAD QUEUE WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {

    loadQueue();

  }, [doctorId]);


  // ==========================================
  // JOIN QUEUE
  // ==========================================

  async function handleJoinQueue() {

    // Prevent double-click
    if (joining) {
      return;
    }


    setJoining(true);
    setError("");


    // ----------------------------------------
    // GET LOGGED-IN PATIENT
    // ----------------------------------------

    const savedPatient =
      localStorage.getItem("patient");


    if (!savedPatient) {

      setError(
        "Please login before joining the queue."
      );

      setJoining(false);

      return;
    }


    const patient =
      JSON.parse(savedPatient);


    // ----------------------------------------
    // DATA SENT TO SPRING BOOT
    // ----------------------------------------

    const queueData = {

      patientId:
        patient.id,

      hospitalId:
        Number(hospitalId),

      departmentId:
        Number(departmentId),

      doctorId:
        Number(doctorId)

    };


    try {

      // --------------------------------------
      // JOIN QUEUE
      // --------------------------------------

      const response =
        await axios.post(
          `${API_URL}/queues/join`,
          queueData
        );


      console.log(
        "Queue join response:",
        response.data
      );


      // --------------------------------------
      // GET TOKEN
      // --------------------------------------

      const tokenNumber =
        response.data.tokenNumber;


      const newToken =
        `A-${tokenNumber}`;


      // --------------------------------------
      // DISPLAY TOKEN
      // --------------------------------------

      setToken(newToken);


      // --------------------------------------
      // SAVE QUEUE
      // --------------------------------------

      const myQueue = {

        id:
          response.data.id,

        token:
          newToken,

        tokenNumber:
          tokenNumber,

        patientId:
          response.data.patientId,

        hospitalId:
          response.data.hospitalId,

        departmentId:
          response.data.departmentId,

        doctorId:
          response.data.doctorId,

        status:
          response.data.status,

        queueDate:
          response.data.queueDate,

        joinedAt:
          response.data.joinedAt

      };


      localStorage.setItem(
        "myQueue",
        JSON.stringify(myQueue)
      );


      // --------------------------------------
      // REFRESH QUEUE INFORMATION
      // --------------------------------------

      await loadQueue();


    } catch (error) {

      console.error(
        "Queue join error:",
        error
      );


      setError(
        "Unable to join the queue. Please try again."
      );

    } finally {

      setJoining(false);

    }

  }


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="join-queue-page">


      {/* ======================================
          HEADER
      ======================================= */}

      <div className="join-header">

        <span className="page-breadcrumb">

          Hospital #{hospitalId} ·
          Department #{departmentId} ·
          Doctor #{doctorId}

        </span>


        <h1>
          Join Digital Queue 🎫
        </h1>


        <p>
          Get your digital token and track your
          position without waiting in the hospital.
        </p>

      </div>


      {!token ? (

        /* ====================================
           BEFORE JOINING
        ===================================== */

        <div className="queue-confirmation">


          {/* DOCTOR */}

          <div className="queue-doctor-card">

            <div className="queue-doctor-avatar">
              👨‍⚕️
            </div>


            <div>

              <span>
                Cardiology
              </span>

              <h2>
                Dr. Kumar
              </h2>

              <p>
                QueueLess General Hospital
              </p>

            </div>

          </div>


          {/* CURRENT QUEUE */}

          <div className="current-queue-card">

            <div className="queue-card-title">

              <div>

                <h3>
                  Current Queue
                </h3>

                <p>
                  Live queue information
                </p>

              </div>


              <span className="live-indicator">
                ● LIVE
              </span>

            </div>


            <div className="queue-overview">


              {/* NOW SERVING */}

              <div>

                <span>
                  Now Serving
                </span>

                <strong>
                  {queueInfo.nowServing}
                </strong>

              </div>


              {/* PEOPLE WAITING */}

              <div>

                <span>
                  People Waiting
                </span>

                <strong>
                  {queueInfo.peopleAhead}
                </strong>

              </div>


              {/* ESTIMATED WAIT */}

              <div>

                <span>
                  Estimated Wait
                </span>

                <strong>
                  {queueInfo.estimatedWait}
                </strong>

              </div>


            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div className="queue-error">

              {error}

            </div>

          )}


          {/* JOIN ACTION */}

          <div className="join-action-card">

            <div className="ticket-icon">
              🎫
            </div>


            <h2>
              Ready to join the queue?
            </h2>


            <p>
              You will receive a digital token
              number after joining.
            </p>


            <button
              className="join-queue-button"
              onClick={handleJoinQueue}
              disabled={joining}
            >

              {joining
                ? "Getting Your Token..."
                : "Get Digital Token →"}

            </button>


            <small>
              You can track your position after joining.
            </small>

          </div>


        </div>

      ) : (

        /* ====================================
           AFTER JOINING
        ===================================== */

        <div className="token-result">


          {/* SUCCESS */}

          <div className="success-message">

            <div className="success-icon">
              ✓
            </div>


            <h2>
              You're in the queue!
            </h2>


            <p>
              Your digital token has been successfully
              generated.
            </p>

          </div>


          {/* TOKEN */}

          <div className="token-card">

            <span className="token-label">
              YOUR TOKEN
            </span>


            <h1>
              {token}
            </h1>


            <span className="token-status">

              ● WAITING

            </span>

          </div>


          {/* QUEUE INFORMATION */}

          <div className="token-info-grid">


            {/* NOW SERVING */}

            <div>

              <span>
                Now Serving
              </span>


              <strong>
                {queueInfo.nowServing}
              </strong>

            </div>


            {/* PEOPLE AHEAD */}

            <div>

              <span>
                People Ahead
              </span>


              <strong>
                {queueInfo.peopleAhead}
              </strong>

            </div>


            {/* ESTIMATED WAIT */}

            <div>

              <span>
                Estimated Wait
              </span>


              <strong>
                {queueInfo.estimatedWait}
              </strong>

            </div>


          </div>


          {/* LOCATION */}

          <div className="token-location">

            <span>
              📍
            </span>


            <div>

              <strong>
                QueueLess General Hospital
              </strong>


              <p>
                Cardiology · Dr. Kumar
              </p>

            </div>

          </div>


          {/* NOTE */}

          <p className="token-note">

            Please arrive at the hospital when your
            turn is approaching.

          </p>


        </div>

      )}

    </div>

  );

}

export default JoinQueue;