import { useEffect, useState } from "react";
import axios from "axios";

function MyAppointments() {

  // =========================================
  // APPOINTMENT STATE
  // =========================================

  const [appointments, setAppointments] = useState([]);

  const [loadingAppointments, setLoadingAppointments] =
    useState(true);


  // =========================================
  // QUEUE HISTORY STATE
  // =========================================

  const [queueHistory, setQueueHistory] = useState([]);

  const [loadingHistory, setLoadingHistory] =
    useState(true);


  // =========================================
  // MASTER DATA
  // =========================================

  const [hospitals, setHospitals] = useState([]);

  const [departments, setDepartments] =
    useState([]);

  const [doctors, setDoctors] =
    useState([]);


  // =========================================
  // LOAD DATA WHEN PAGE OPENS
  // =========================================

  useEffect(() => {

    loadAppointments();

    loadQueueHistory();

  }, []);


  // =========================================
  // LOAD APPOINTMENTS FROM BACKEND
  // =========================================

  async function loadAppointments() {

    const patient =
      JSON.parse(
        localStorage.getItem("patient")
      );


    // Patient must be logged in

    if (!patient) {

      setLoadingAppointments(false);

      return;

    }


    try {

      const response =
        await axios.get(
          `http://localhost:8080/appointments/patient/${patient.id}`
        );


      setAppointments(
        response.data
      );


    } catch (error) {

      console.error(
        "Error loading appointments:",
        error
      );

    } finally {

      setLoadingAppointments(false);

    }

  }


  // =========================================
  // LOAD QUEUE HISTORY
  // =========================================

  async function loadQueueHistory() {

    const patient =
      JSON.parse(
        localStorage.getItem("patient")
      );


    // Patient must be logged in

    if (!patient) {

      setLoadingHistory(false);

      return;

    }


    try {

      /*
       * Load all required data together.
       *
       * 1. Queue history
       * 2. Hospitals
       * 3. Departments
       * 4. Doctors
       */

      const [
        historyResponse,
        hospitalsResponse,
        departmentsResponse,
        doctorsResponse
      ] = await Promise.all([

        axios.get(
          `http://localhost:8080/queues/patient/${patient.id}/history`
        ),

        axios.get(
          "http://localhost:8080/hospitals"
        ),

        axios.get(
          "http://localhost:8080/departments"
        ),

        axios.get(
          "http://localhost:8080/doctors"
        )

      ]);


      // Save queue history

      setQueueHistory(
        historyResponse.data
      );


      // Save hospitals

      setHospitals(
        hospitalsResponse.data
      );


      // Save departments

      setDepartments(
        departmentsResponse.data
      );


      // Save doctors

      setDoctors(
        doctorsResponse.data
      );


    } catch (error) {

      console.error(
        "Error loading queue history:",
        error
      );

    } finally {

      setLoadingHistory(false);

    }

  }


  // =========================================
  // FIND HOSPITAL NAME
  // =========================================

  function getHospitalName(
    hospitalId
  ) {

    const hospital =
      hospitals.find(
        (item) =>
          item.id === hospitalId
      );


    if (hospital) {

      return hospital.name;

    }


    return "Unknown Hospital";

  }


  // =========================================
  // FIND DEPARTMENT NAME
  // =========================================

  function getDepartmentName(
    departmentId
  ) {

    const department =
      departments.find(
        (item) =>
          item.id === departmentId
      );


    if (department) {

      return department.name;

    }


    return "Unknown Department";

  }


  // =========================================
  // FIND DOCTOR NAME
  // =========================================

  function getDoctorName(
    doctorId
  ) {

    const doctor =
      doctors.find(
        (item) =>
          item.id === doctorId
      );


    if (doctor) {

      return doctor.name;

    }


    return "Unknown Doctor";

  }


  // =========================================
  // CANCEL APPOINTMENT
  // =========================================

  async function cancelAppointment(id) {

    const confirmCancel =
      window.confirm(
        "Are you sure you want to cancel this appointment?"
      );


    if (!confirmCancel) {

      return;

    }


    try {

      const response =
        await axios.put(
          `http://localhost:8080/appointments/${id}/cancel`
        );


      /*
       * Update the appointment on the screen
       * using the response from the backend.
       */

      setAppointments(
        (previousAppointments) =>
          previousAppointments.map(
            (appointment) =>
              appointment.id === id
                ? response.data
                : appointment
          )
      );


    } catch (error) {

      console.error(
        "Error cancelling appointment:",
        error
      );

      alert(
        "Unable to cancel the appointment."
      );

    }

  }


  // =========================================
  // APPOINTMENT FILTERS
  // =========================================

  const confirmedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "CONFIRMED"
    );


  const cancelledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "CANCELLED"
    );


  // =========================================
  // FORMAT APPOINTMENT DATE
  // =========================================

  function formatDate(
    date
  ) {

    if (!date) {

      return "N/A";

    }


    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      [],
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  }


  // =========================================
  // FORMAT APPOINTMENT TIME
  // =========================================

  function formatAppointmentTime(
    time
  ) {

    if (!time) {

      return "N/A";

    }


    const [hours, minutes] =
      time.split(":");


    const date =
      new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );


    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  }


  // =========================================
  // QUEUE STATUS CLASS
  // =========================================

  function getQueueStatusClass(
    status
  ) {

    if (status === "COMPLETED") {

      return "status-confirmed";

    }


    if (status === "CANCELLED") {

      return "status-cancelled";

    }


    return "";

  }


  // =========================================
  // QUEUE STATUS TEXT
  // =========================================

  function getQueueStatusText(
    status
  ) {

    if (status === "COMPLETED") {

      return "● COMPLETED";

    }


    if (status === "CANCELLED") {

      return "● CANCELLED";

    }


    if (status === "SERVING") {

      return "● SERVING";

    }


    if (status === "WAITING") {

      return "● WAITING";

    }


    if (status === "HOLD") {

      return "● ON HOLD";

    }


    return `● ${status}`;

  }


  // =========================================
  // FORMAT QUEUE JOIN TIME
  // =========================================

  function formatTime(
    joinedAt
  ) {

    if (!joinedAt) {

      return "N/A";

    }


    return new Date(
      joinedAt
    ).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  }


  // =========================================
  // PAGE
  // =========================================

  return (

    <div className="appointments-page">


      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="appointments-header">

        <div>

          <h1>
            My Appointments 📅
          </h1>

          <p>
            View and manage your appointments
            and queue history.
          </p>

        </div>


        <div className="appointment-summary">

          <div>

            <strong>
              {confirmedAppointments.length}
            </strong>

            <span>
              Upcoming
            </span>

          </div>


          <div>

            <strong>
              {cancelledAppointments.length}
            </strong>

            <span>
              Cancelled
            </span>

          </div>

        </div>

      </div>


      {/* ===================================== */}
      {/* UPCOMING APPOINTMENTS */}
      {/* ===================================== */}

      <div className="appointment-section">

        <div className="appointment-section-header">

          <h2>
            Upcoming Appointments
          </h2>

          <span>

            {confirmedAppointments.length} appointment
            {confirmedAppointments.length !== 1
              ? "s"
              : ""}

          </span>

        </div>


        {/* LOADING */}

        {loadingAppointments ? (

          <div className="empty-appointment">

            <div className="empty-icon">
              ⏳
            </div>

            <h3>
              Loading appointments...
            </h3>

            <p>
              Please wait while we load
              your appointments.
            </p>

          </div>

        ) : confirmedAppointments.length === 0 ? (

          /* NO APPOINTMENTS */

          <div className="empty-appointment">

            <div className="empty-icon">
              📅
            </div>

            <h3>
              No upcoming appointments
            </h3>

            <p>
              You don't have any confirmed
              appointments.
            </p>

          </div>

        ) : (

          /* APPOINTMENT LIST */

          <div className="appointment-list">

            {confirmedAppointments.map(
              (appointment) => (

                <div
                  className="appointment-card"
                  key={appointment.id}
                >


                  {/* DOCTOR */}

                  <div className="appointment-doctor">

                    <div className="doctor-avatar">
                      👨‍⚕️
                    </div>

                    <div>

                      <h3>
                        {getDoctorName(
                          appointment.doctorId
                        )}
                      </h3>

                      <p>
                        {getDepartmentName(
                          appointment.departmentId
                        )}
                      </p>

                    </div>

                  </div>


                  {/* DETAILS */}

                  <div className="appointment-details">

                    <div>

                      <span>
                        Hospital
                      </span>

                      <strong>
                        🏥{" "}
                        {getHospitalName(
                          appointment.hospitalId
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Date
                      </span>

                      <strong>
                        📅{" "}
                        {formatDate(
                          appointment.appointmentDate
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Time
                      </span>

                      <strong>
                        🕐{" "}
                        {formatAppointmentTime(
                          appointment.appointmentTime
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div className="appointment-actions">

                    <span className="status-confirmed">

                      ● CONFIRMED

                    </span>


                    <button
                      className="cancel-button"
                      onClick={() =>
                        cancelAppointment(
                          appointment.id
                        )
                      }
                    >

                      Cancel Appointment

                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* ===================================== */}
      {/* CANCELLED APPOINTMENTS */}
      {/* ===================================== */}

      {cancelledAppointments.length > 0 && (

        <div className="appointment-section cancelled-section">

          <div className="appointment-section-header">

            <h2>
              Cancelled Appointments
            </h2>

            <span>
              {cancelledAppointments.length}
            </span>

          </div>


          <div className="appointment-list">

            {cancelledAppointments.map(
              (appointment) => (

                <div
                  className="appointment-card cancelled-card"
                  key={appointment.id}
                >


                  {/* DOCTOR */}

                  <div className="appointment-doctor">

                    <div className="doctor-avatar cancelled-avatar">
                      👨‍⚕️
                    </div>

                    <div>

                      <h3>
                        {getDoctorName(
                          appointment.doctorId
                        )}
                      </h3>

                      <p>
                        {getDepartmentName(
                          appointment.departmentId
                        )}
                      </p>

                    </div>

                  </div>


                  {/* DETAILS */}

                  <div className="appointment-details">

                    <div>

                      <span>
                        Hospital
                      </span>

                      <strong>
                        🏥{" "}
                        {getHospitalName(
                          appointment.hospitalId
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Date
                      </span>

                      <strong>
                        📅{" "}
                        {formatDate(
                          appointment.appointmentDate
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Time
                      </span>

                      <strong>
                        🕐{" "}
                        {formatAppointmentTime(
                          appointment.appointmentTime
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* STATUS */}

                  <div className="appointment-actions">

                    <span className="status-cancelled">

                      ● CANCELLED

                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      )}


      {/* ===================================== */}
      {/* QUEUE HISTORY */}
      {/* ===================================== */}

      <div className="appointment-section">

        <div className="appointment-section-header">

          <h2>
            Queue History 🎫
          </h2>

          <span>

            {queueHistory.length} visit
            {queueHistory.length !== 1
              ? "s"
              : ""}

          </span>

        </div>


        {/* LOADING */}

        {loadingHistory ? (

          <div className="empty-appointment">

            <div className="empty-icon">
              ⏳
            </div>

            <h3>
              Loading queue history...
            </h3>

            <p>
              Please wait while we load
              your previous visits.
            </p>

          </div>

        ) : queueHistory.length === 0 ? (

          /* NO HISTORY */

          <div className="empty-appointment">

            <div className="empty-icon">
              🎫
            </div>

            <h3>
              No queue history
            </h3>

            <p>
              Your completed and cancelled
              queue visits will appear here.
            </p>

          </div>

        ) : (

          /* HISTORY LIST */

          <div className="appointment-list">

            {queueHistory.map(
              (queue) => (

                <div
                  className="appointment-card"
                  key={queue.id}
                >


                  {/* DOCTOR INFORMATION */}

                  <div className="appointment-doctor">

                    <div className="doctor-avatar">
                      👨‍⚕️
                    </div>

                    <div>

                      <h3>
                        {getDoctorName(
                          queue.doctorId
                        )}
                      </h3>

                      <p>
                        {getDepartmentName(
                          queue.departmentId
                        )}
                      </p>

                    </div>

                  </div>


                  {/* QUEUE DETAILS */}

                  <div className="appointment-details">

                    <div>

                      <span>
                        Hospital
                      </span>

                      <strong>
                        🏥{" "}
                        {getHospitalName(
                          queue.hospitalId
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Token
                      </span>

                      <strong>
                        🎫 A-{queue.tokenNumber}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Date
                      </span>

                      <strong>
                        📅 {queue.queueDate}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Joined
                      </span>

                      <strong>
                        🕐{" "}
                        {formatTime(
                          queue.joinedAt
                        )}
                      </strong>

                    </div>

                  </div>


                  {/* QUEUE STATUS */}

                  <div className="appointment-actions">

                    <span
                      className={
                        getQueueStatusClass(
                          queue.status
                        )
                      }
                    >

                      {getQueueStatusText(
                        queue.status
                      )}

                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}

export default MyAppointments;