import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function ReceptionistDashboard() {

  // =========================================
  // SELECTED FILTERS
  // =========================================

  const [selectedHospitalId, setSelectedHospitalId] = useState(1);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);


  // =========================================
  // DATA
  // =========================================

  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [queue, setQueue] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);


  // =========================================
  // LOAD SYSTEM DATA
  // =========================================

  async function loadSystemData() {

    try {

      const [
        hospitalsResponse,
        departmentsResponse,
        doctorsResponse
      ] = await Promise.all([

        axios.get(
          `${API_URL}/hospitals`
        ),

        axios.get(
          `${API_URL}/departments`
        ),

        axios.get(
          `${API_URL}/doctors`
        )

      ]);

      setHospitals(
        hospitalsResponse.data
      );

      setDepartments(
        departmentsResponse.data
      );

      setDoctors(
        doctorsResponse.data
      );

    } catch (error) {

      console.error(
        "Error loading system data:",
        error
      );

    }

  }


  // =========================================
  // LOAD TODAY'S QUEUE
  // =========================================

  async function loadQueue() {

    try {

      const response = await axios.get(
        `${API_URL}/queues/doctor/${selectedDoctorId}/today`
      );

      const queueData = response.data;

      setQueue(queueData);


      const servingPatient =
        queueData.find(
          (patient) =>
            patient.status === "SERVING"
        );

      setCurrentPatient(
        servingPatient || null
      );

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
  // INITIAL LOAD
  // =========================================

  useEffect(() => {

    loadSystemData();

  }, []);


  // =========================================
  // LIVE QUEUE REFRESH
  // =========================================

  useEffect(() => {

    loadQueue();

    const interval = setInterval(
      loadQueue,
      3000
    );

    return () => {

      clearInterval(interval);

    };

  }, [selectedDoctorId]);


  // =========================================
  // RESET DEPARTMENT
  // WHEN HOSPITAL CHANGES
  // =========================================

  useEffect(() => {

    const hospitalDepartments =
      departments.filter(
        (department) =>
          department.hospitalId ===
          selectedHospitalId
      );


    if (hospitalDepartments.length > 0) {

      const departmentStillValid =
        hospitalDepartments.some(
          (department) =>
            department.id ===
            selectedDepartmentId
        );


      if (!departmentStillValid) {

        setSelectedDepartmentId(
          hospitalDepartments[0].id
        );

      }

    }

  }, [
    selectedHospitalId,
    departments,
    selectedDepartmentId
  ]);


  // =========================================
  // RESET DOCTOR
  // WHEN DEPARTMENT CHANGES
  // =========================================

  useEffect(() => {

    const departmentDoctors =
      doctors.filter(
        (doctor) =>
          doctor.hospitalId ===
            selectedHospitalId &&
          doctor.departmentId ===
            selectedDepartmentId
      );


    if (departmentDoctors.length > 0) {

      const doctorStillValid =
        departmentDoctors.some(
          (doctor) =>
            doctor.id ===
            selectedDoctorId
        );


      if (!doctorStillValid) {

        setSelectedDoctorId(
          departmentDoctors[0].id
        );

      }

    }

  }, [
    selectedHospitalId,
    selectedDepartmentId,
    doctors,
    selectedDoctorId
  ]);


  // =========================================
  // CALL NEXT PATIENT
  // =========================================

  async function callNextPatient() {

    if (currentPatient) {

      alert(
        "Please complete or hold the current patient first."
      );

      return;

    }


    setActionLoading(true);


    try {

      const response = await axios.put(
        `${API_URL}/queues/doctor/${selectedDoctorId}/call-next`
      );


      if (!response.data) {

        alert(
          "No patients are waiting."
        );

        return;

      }


      await loadQueue();


    } catch (error) {

      console.error(
        "Error calling next patient:",
        error
      );

      alert(
        "Unable to call the next patient."
      );

    } finally {

      setActionLoading(false);

    }

  }


  // =========================================
  // COMPLETE CURRENT PATIENT
  // =========================================

  async function completeCurrentPatient() {

    if (!currentPatient) {

      alert(
        "No patient is currently being served."
      );

      return;

    }


    setActionLoading(true);


    try {

      await axios.put(
        `${API_URL}/queues/${currentPatient.id}/complete`
      );


      await loadQueue();


    } catch (error) {

      console.error(
        "Error completing patient:",
        error
      );

      alert(
        "Unable to complete the patient."
      );

    } finally {

      setActionLoading(false);

    }

  }


  // =========================================
  // HOLD CURRENT PATIENT
  // =========================================

  async function holdCurrentPatient() {

    if (!currentPatient) {

      alert(
        "No patient is currently being served."
      );

      return;

    }


    setActionLoading(true);


    try {

      await axios.put(
        `${API_URL}/queues/${currentPatient.id}/hold`
      );


      await loadQueue();


    } catch (error) {

      console.error(
        "Error holding patient:",
        error
      );

      alert(
        "Unable to hold the patient."
      );

    } finally {

      setActionLoading(false);

    }

  }


  // =========================================
  // RECALL PATIENT
  // =========================================

  async function recallPatient(queueId) {

    setActionLoading(true);


    try {

      await axios.put(
        `${API_URL}/queues/${queueId}/recall`
      );


      await loadQueue();


    } catch (error) {

      console.error(
        "Error recalling patient:",
        error
      );

      alert(
        "Unable to recall the patient."
      );

    } finally {

      setActionLoading(false);

    }

  }


  // =========================================
  // FILTER QUEUE
  // =========================================

  const waitingPatients =
    queue.filter(
      (patient) =>
        patient.status === "WAITING"
    );


  const servingPatients =
    queue.filter(
      (patient) =>
        patient.status === "SERVING"
    );


  const heldPatients =
    queue.filter(
      (patient) =>
        patient.status === "HOLD"
    );


  const completedPatients =
    queue.filter(
      (patient) =>
        patient.status === "COMPLETED"
    );


  const cancelledPatients =
    queue.filter(
      (patient) =>
        patient.status?.toUpperCase() ===
        "CANCELLED"
    );


  // =========================================
  // SELECTED INFORMATION
  // =========================================

  const selectedHospital =
    hospitals.find(
      (hospital) =>
        hospital.id === selectedHospitalId
    );


  const selectedDepartment =
    departments.find(
      (department) =>
        department.id === selectedDepartmentId
    );


  const selectedDoctor =
    doctors.find(
      (doctor) =>
        doctor.id === selectedDoctorId
    );


  // =========================================
  // LOADING SCREEN
  // =========================================

  if (loading) {

    return (

      <div className="dashboard">

        <h1>
          Reception Dashboard 🧑‍💼
        </h1>

        <p>
          Loading today's queue...
        </p>

      </div>

    );

  }


  // =========================================
  // DASHBOARD
  // =========================================

  return (

    <div className="dashboard">


      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="reception-header">

        <div>

          <span className="admin-badge">
            RECEPTION DESK
          </span>

          <h1>
            Reception Dashboard 🧑‍💼
          </h1>

          <p>
            Manage today's patient queue and
            consultation flow.
          </p>

        </div>


        <div className="admin-live">

          <span>
            ●
          </span>

          LIVE

        </div>

      </div>


      {/* ===================================== */}
      {/* QUEUE SELECTION */}
      {/* ===================================== */}

      <div className="login-card reception-selection">

        <div>

          <h2>
            Queue Selection
          </h2>

          <p>
            Select the hospital, department and
            doctor you want to manage.
          </p>

        </div>


        <div className="reception-filters">


          {/* HOSPITAL */}

          <div>

            <label>
              Hospital
            </label>

            <select
              value={selectedHospitalId}
              onChange={(event) =>
                setSelectedHospitalId(
                  Number(event.target.value)
                )
              }
            >

              {hospitals.map(
                (hospital) => (

                  <option
                    key={hospital.id}
                    value={hospital.id}
                  >

                    {hospital.name}

                  </option>

                )
              )}

            </select>

          </div>


          {/* DEPARTMENT */}

          <div>

            <label>
              Department
            </label>

            <select
              value={selectedDepartmentId}
              onChange={(event) =>
                setSelectedDepartmentId(
                  Number(event.target.value)
                )
              }
            >

              {departments
                .filter(
                  (department) =>
                    department.hospitalId ===
                    selectedHospitalId
                )
                .map(
                  (department) => (

                    <option
                      key={department.id}
                      value={department.id}
                    >

                      {department.name}

                    </option>

                  )
                )}

            </select>

          </div>


          {/* DOCTOR */}

          <div>

            <label>
              Doctor
            </label>

            <select
              value={selectedDoctorId}
              onChange={(event) =>
                setSelectedDoctorId(
                  Number(event.target.value)
                )
              }
            >

              {doctors
                .filter(
                  (doctor) =>
                    doctor.hospitalId ===
                      selectedHospitalId &&
                    doctor.departmentId ===
                      selectedDepartmentId
                )
                .map(
                  (doctor) => (

                    <option
                      key={doctor.id}
                      value={doctor.id}
                    >

                      {doctor.name}

                    </option>

                  )
                )}

            </select>

          </div>


        </div>


        {/* CURRENT SELECTION */}

        <div className="reception-selected-info">

          <span>
            🏥 {selectedHospital?.name || "Hospital"}
          </span>

          <span>
            🩺 {selectedDepartment?.name || "Department"}
          </span>

          <span>
            👨‍⚕️ {selectedDoctor?.name || "Doctor"}
          </span>

        </div>

      </div>


      {/* ===================================== */}
      {/* STATISTICS */}
      {/* ===================================== */}

      <div className="admin-stats">


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            👥
          </div>

          <div>

            <span>
              Total
            </span>

            <strong>
              {queue.length}
            </strong>

            <small>
              Today's queue
            </small>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ⏳
          </div>

          <div>

            <span>
              Waiting
            </span>

            <strong>
              {waitingPatients.length}
            </strong>

            <small>
              Patients waiting
            </small>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🩺
          </div>

          <div>

            <span>
              Serving
            </span>

            <strong>
              {servingPatients.length}
            </strong>

            <small>
              In consultation
            </small>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ✅
          </div>

          <div>

            <span>
              Completed
            </span>

            <strong>
              {completedPatients.length}
            </strong>

            <small>
              Consultations
            </small>

          </div>

        </div>


      </div>


      {/* ===================================== */}
      {/* MAIN RECEPTION LAYOUT */}
      {/* ===================================== */}

      <div className="reception-layout">


        {/* ================================= */}
        {/* CURRENT PATIENT */}
        {/* ================================= */}

        <div className="login-card reception-current-card">

          <div className="reception-card-header">

            <div>

              <span className="reception-label">
                NOW SERVING
              </span>

              <h2>
                Current Patient
              </h2>

            </div>

            <span className="admin-status-live">
              ● LIVE
            </span>

          </div>


          {currentPatient ? (

            <div className="reception-current-content">


              <div className="reception-token">

                A-{currentPatient.tokenNumber}

              </div>


              <h1>

                {currentPatient.patientName ||
                  "Patient"}

              </h1>


              <p>

                📞{" "}
                {currentPatient.patientPhone ||
                  "Phone unavailable"}

              </p>


              <p>

                🩺{" "}
                {selectedDepartment?.name ||
                  "Department"}

              </p>


              <p>

                👨‍⚕️{" "}
                {selectedDoctor?.name ||
                  "Doctor"}

              </p>


              <div className="reception-serving-status">

                CURRENTLY IN CONSULTATION

              </div>


              {/* ACTION BUTTONS */}

              <div className="reception-actions">


                <button
                  className="reception-hold-button"
                  onClick={holdCurrentPatient}
                  disabled={actionLoading}
                >

                  {actionLoading
                    ? "Processing..."
                    : "Hold Patient"}

                </button>


                <button
                  className="reception-complete-button"
                  onClick={completeCurrentPatient}
                  disabled={actionLoading}
                >

                  {actionLoading
                    ? "Processing..."
                    : "Complete Consultation"}

                </button>


              </div>


            </div>

          ) : (

            <div className="reception-empty">

              <div className="reception-empty-icon">
                🎫
              </div>

              <h3>
                No Patient Being Served
              </h3>

              <p>
                Call the next patient from the
                waiting queue.
              </p>


              <button
                className="reception-call-button"
                onClick={callNextPatient}
                disabled={
                  actionLoading ||
                  waitingPatients.length === 0
                }
              >

                {actionLoading
                  ? "Calling..."
                  : waitingPatients.length === 0
                    ? "No Patients Waiting"
                    : "📢 Call Next Patient"}

              </button>

            </div>

          )}

        </div>


        {/* ================================= */}
        {/* WAITING QUEUE */}
        {/* ================================= */}

        <div className="login-card">

          <div className="reception-card-header">

            <div>

              <span className="reception-label">
                QUEUE
              </span>

              <h2>
                Waiting Patients
              </h2>

            </div>

            <span className="admin-count">
              {waitingPatients.length}
            </span>

          </div>


          {waitingPatients.length === 0 ? (

            <div className="reception-empty-small">

              <div>
                💤
              </div>

              <p>
                No patients are currently waiting.
              </p>

            </div>

          ) : (

            <div className="waiting-list">

              {waitingPatients.map(
                (patient, index) => (

                  <div
                    className="waiting-patient"
                    key={patient.id}
                  >


                    <div className="reception-position">

                      {index + 1}

                    </div>


                    <div className="reception-patient-token">

                      A-{patient.tokenNumber}

                    </div>


                    <div className="reception-patient-info">

                      <strong>
                        {patient.patientName ||
                          "Patient"}
                      </strong>

                      <p>
                        📞{" "}
                        {patient.patientPhone ||
                          "Phone unavailable"}
                      </p>

                    </div>


                    <span className="admin-waiting-status">

                      WAITING

                    </span>


                  </div>

                )
              )}

            </div>

          )}

        </div>


      </div>


      {/* ===================================== */}
      {/* HELD PATIENTS */}
      {/* ===================================== */}

      <div className="login-card">

        <div className="reception-card-header">

          <div>

            <span className="reception-label">
              HOLD
            </span>

            <h2>
              Held Patients
            </h2>

          </div>

          <span className="admin-count">
            {heldPatients.length}
          </span>

        </div>


        {heldPatients.length === 0 ? (

          <div className="reception-empty-small">

            <div>
              ⏸️
            </div>

            <p>
              No patients are currently on hold.
            </p>

          </div>

        ) : (

          <div className="waiting-list">

            {heldPatients.map(
              (patient) => (

                <div
                  className="waiting-patient"
                  key={patient.id}
                >

                  <div className="reception-patient-token">

                    A-{patient.tokenNumber}

                  </div>


                  <div className="reception-patient-info">

                    <strong>
                      {patient.patientName ||
                        "Patient"}
                    </strong>

                    <p>
                      📞{" "}
                      {patient.patientPhone ||
                        "Phone unavailable"}
                    </p>

                  </div>


                  <span className="admin-hold-status">

                    HOLD

                  </span>


                  <button
                    onClick={() =>
                      recallPatient(patient.id)
                    }
                    disabled={actionLoading}
                    className="reception-recall-button"
                  >

                    Recall

                  </button>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* ===================================== */}
      {/* COMPLETED PATIENTS */}
      {/* ===================================== */}

      <div className="login-card">

        <div className="reception-card-header">

          <div>

            <span className="reception-label">
              HISTORY
            </span>

            <h2>
              Completed Today
            </h2>

          </div>

          <span className="admin-count">
            {completedPatients.length}
          </span>

        </div>


        {completedPatients.length === 0 ? (

          <div className="reception-empty-small">

            <div>
              📋
            </div>

            <p>
              No completed consultations yet.
            </p>

          </div>

        ) : (

          <div className="waiting-list">

            {completedPatients
              .slice()
              .reverse()
              .map(
                (patient) => (

                  <div
                    className="waiting-patient"
                    key={patient.id}
                  >

                    <div className="reception-patient-token">

                      A-{patient.tokenNumber}

                    </div>


                    <div className="reception-patient-info">

                      <strong>
                        {patient.patientName ||
                          "Patient"}
                      </strong>

                      <p>
                        📞{" "}
                        {patient.patientPhone ||
                          "Phone unavailable"}
                      </p>

                    </div>


                    <span className="admin-completed-status">

                      ✓ COMPLETED

                    </span>

                  </div>

                )
              )}

          </div>

        )}

      </div>


      {/* ===================================== */}
      {/* CANCELLED PATIENTS */}
      {/* ===================================== */}

      <div className="login-card">

        <div className="reception-card-header">

          <div>

            <span className="reception-label">
              CANCELLED
            </span>

            <h2>
              Cancelled Today
            </h2>

          </div>

          <span className="admin-count">
            {cancelledPatients.length}
          </span>

        </div>


        {cancelledPatients.length === 0 ? (

          <div className="reception-empty-small">

            <div>
              👍
            </div>

            <p>
              No cancelled queue entries today.
            </p>

          </div>

        ) : (

          <div className="waiting-list">

            {cancelledPatients.map(
              (patient) => (

                <div
                  className="waiting-patient"
                  key={patient.id}
                >

                  <div className="reception-patient-token">

                    A-{patient.tokenNumber}

                  </div>


                  <div className="reception-patient-info">

                    <strong>
                      {patient.patientName ||
                        "Patient"}
                    </strong>

                    <p>
                      📞{" "}
                      {patient.patientPhone ||
                        "Phone unavailable"}
                    </p>

                  </div>


                  <span className="admin-hold-status">

                    CANCELLED

                  </span>

                </div>

              )
            )}

          </div>

        )}

      </div>


    </div>

  );

}

export default ReceptionistDashboard;