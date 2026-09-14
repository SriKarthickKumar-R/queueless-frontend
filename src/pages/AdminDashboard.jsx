import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {

  const navigate = useNavigate();

  // SELECTED FILTERS
  const [selectedHospitalId, setSelectedHospitalId] = useState(1);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);

  // DATA
  const [queue, setQueue] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);


  // LOAD ALL ADMIN DATA

  async function loadDashboardData() {

    try {

      const [
        queueResponse,
        hospitalsResponse,
        departmentsResponse,
        doctorsResponse,
        patientsResponse
      ] = await Promise.all([

        axios.get(
          `http://localhost:8080/queues/doctor/${selectedDoctorId}/today`
        ),

        axios.get(
          "http://localhost:8080/hospitals"
        ),

        axios.get(
          "http://localhost:8080/departments"
        ),

        axios.get(
          "http://localhost:8080/doctors"
        ),

        axios.get(
          "http://localhost:8080/patients"
        )

      ]);

      setQueue(queueResponse.data);
      setHospitals(hospitalsResponse.data);
      setDepartments(departmentsResponse.data);
      setDoctors(doctorsResponse.data);
      setPatients(patientsResponse.data);

    } catch (error) {

      console.error(
        "Error loading admin dashboard:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  // LOAD WHEN PAGE OPENS
  // REFRESH EVERY 3 SECONDS

  useEffect(() => {

    loadDashboardData();

    const interval = setInterval(
      loadDashboardData,
      3000
    );

    return () => {
      clearInterval(interval);
    };

  }, [selectedDoctorId]);


  // RESET DEPARTMENT WHEN HOSPITAL CHANGES

  useEffect(() => {

    const hospitalDepartments =
      departments.filter(
        (department) =>
          department.hospitalId === selectedHospitalId
      );

    if (hospitalDepartments.length > 0) {

      const departmentStillValid =
        hospitalDepartments.some(
          (department) =>
            department.id === selectedDepartmentId
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


  // RESET DOCTOR WHEN DEPARTMENT CHANGES

  useEffect(() => {

    const departmentDoctors =
      doctors.filter(
        (doctor) =>
          doctor.hospitalId === selectedHospitalId &&
          doctor.departmentId === selectedDepartmentId
      );

    if (departmentDoctors.length > 0) {

      const doctorStillValid =
        departmentDoctors.some(
          (doctor) =>
            doctor.id === selectedDoctorId
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


  // FILTER QUEUE BY STATUS

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


  const completedPatients =
    queue.filter(
      (patient) =>
        patient.status === "COMPLETED"
    );


  const cancelledPatients =
    queue.filter(
      (patient) =>
        patient.status === "CANCELLED"
    );


  const heldPatients =
    queue.filter(
      (patient) =>
        patient.status === "HOLD"
    );


  // CURRENTLY SERVING

  const currentPatient =
    servingPatients.length > 0
      ? servingPatients[0]
      : null;


  // FIND CURRENT DEPARTMENT

  const currentDepartment =
    currentPatient
      ? departments.find(
          (department) =>
            department.id ===
            currentPatient.departmentId
        )
      : null;


  // FIND CURRENT DOCTOR

  const currentDoctor =
    currentPatient
      ? doctors.find(
          (doctor) =>
            doctor.id ===
            currentPatient.doctorId
        )
      : null;


  // STATISTICS

  const totalWaiting =
    waitingPatients.length;


  const currentlyServing =
    servingPatients.length;


  const totalCompleted =
    completedPatients.length;


  const totalCancelled =
    cancelledPatients.length;


  const totalPatients =
    queue.length;


  // LOADING

  if (loading) {

    return (

      <div className="admin-page">

        <div className="admin-header">

          <div>

            <span className="admin-badge">
              ADMIN PANEL
            </span>

            <h1>
              QueueLess Admin Dashboard 📊
            </h1>

            <p>
              Loading today's dashboard...
            </p>

          </div>

        </div>

      </div>

    );

  }


  return (

    <div className="admin-page">


      {/* HEADER */}

      <div className="admin-header">

        <div>

          <span className="admin-badge">
            ADMIN PANEL
          </span>

          <h1>
            QueueLess Admin Dashboard 📊
          </h1>

          <p>
            Monitor today's queue activity and
            patient flow.
          </p>

        </div>


        {/* FILTERS */}

        <div className="admin-filters">


          {/* HOSPITAL */}

          <div>

            <label>
              Select Hospital
            </label>

            <select
              value={selectedHospitalId}
              onChange={(event) =>
                setSelectedHospitalId(
                  Number(event.target.value)
                )
              }
            >

              {hospitals.map((hospital) => (

                <option
                  key={hospital.id}
                  value={hospital.id}
                >

                  {hospital.name}

                </option>

              ))}

            </select>

          </div>


          {/* DEPARTMENT */}

          <div>

            <label>
              Select Department
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
                .map((department) => (

                  <option
                    key={department.id}
                    value={department.id}
                  >

                    {department.name}

                  </option>

                ))}

            </select>

          </div>


          {/* DOCTOR */}

          <div>

            <label>
              Select Doctor
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
                .map((doctor) => (

                  <option
                    key={doctor.id}
                    value={doctor.id}
                  >

                    {doctor.name}

                  </option>

                ))}

            </select>

          </div>

        </div>


        {/* LIVE INDICATOR */}

        <div className="admin-live">

          <span>
            ●
          </span>

          LIVE

        </div>

      </div>


      {/* STATISTICS */}

      <div className="admin-stats">


        {/* TOTAL PATIENTS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            👥
          </div>

          <div>

            <span>
              Total Patients
            </span>

            <strong>
              {totalPatients}
            </strong>

            <small>
              Today's queue
            </small>

          </div>

        </div>


        {/* WAITING */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ⏳
          </div>

          <div>

            <span>
              Waiting
            </span>

            <strong>
              {totalWaiting}
            </strong>

            <small>
              In queue
            </small>

          </div>

        </div>


        {/* CONSULTATION */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🩺
          </div>

          <div>

            <span>
              In Consultation
            </span>

            <strong>
              {currentlyServing}
            </strong>

            <small>
              Currently serving
            </small>

          </div>

        </div>


        {/* COMPLETED */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ✅
          </div>

          <div>

            <span>
              Completed
            </span>

            <strong>
              {totalCompleted}
            </strong>

            <small>
              Consultations
            </small>

          </div>

        </div>


      </div>


      {/* MAIN CONTENT */}

      <div className="admin-content-grid">


        {/* CURRENT CONSULTATION */}

        <div className="admin-card">

          <div className="admin-card-header">

            <div>

              <h2>
                Current Consultation
              </h2>

              <p>
                Patient currently being served
              </p>

            </div>

            <span className="admin-status-live">
              ● LIVE
            </span>

          </div>


          {currentPatient ? (

            <div className="admin-current-patient">

              <div className="admin-token">

                A-{currentPatient.tokenNumber}

              </div>


              <div>

                <h3>
                  {currentPatient.patientName ||
                    "Patient Consultation"}
                </h3>


                <p>

                  {currentDepartment
                    ? currentDepartment.name
                    : "Department"}

                </p>


                <span>

                  {currentDoctor
                    ? currentDoctor.name
                    : "Doctor"}

                </span>

              </div>

            </div>

          ) : (

            <div className="admin-no-patient">

              <div>
                💤
              </div>

              <h3>
                No active consultation
              </h3>

              <p>
                There is currently no patient
                being served.
              </p>

            </div>

          )}

        </div>


        {/* WAITING QUEUE */}

        <div className="admin-card">

          <div className="admin-card-header">

            <div>

              <h2>
                Waiting Queue
              </h2>

              <p>
                Patients waiting for consultation
              </p>

            </div>

            <span className="admin-count">
              {totalWaiting}
            </span>

          </div>


          {waitingPatients.length === 0 ? (

            <div className="admin-no-patient">

              <div>
                🎫
              </div>

              <h3>
                Queue is empty
              </h3>

              <p>
                No patients are currently waiting.
              </p>

            </div>

          ) : (

            <div className="admin-queue-list">

              {waitingPatients.map(
                (patient, index) => {

                  const department =
                    departments.find(
                      (item) =>
                        item.id ===
                        patient.departmentId
                    );


                  return (

                    <div
                      className="admin-queue-item"
                      key={patient.id}
                    >

                      <div className="admin-queue-position">

                        {index + 1}

                      </div>


                      <div>

                        <strong>

                          A-{patient.tokenNumber}

                        </strong>


                        <span>

                          {patient.patientName ||
                            "Patient"}

                        </span>


                        <span>

                          {department
                            ? department.name
                            : "Department"}

                        </span>

                      </div>


                      <span className="admin-waiting-status">

                        WAITING

                      </span>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </div>


      </div>


      {/* MANAGEMENT CENTER */}

      <div className="admin-card admin-management-center">

        <div className="admin-card-header">

          <div>

            <h2>
              Management Center
            </h2>

            <p>
              Manage the hospitals, departments,
              and doctors connected to QueueLess.
            </p>

          </div>

        </div>


        <div className="admin-management-grid">


          {/* HOSPITAL MANAGEMENT */}

          <div className="admin-management-card">

            <div className="admin-management-icon">
              🏥
            </div>

            <div className="admin-management-info">

              <h3>
                Hospital Management
              </h3>

              <p>
                Add and manage hospitals registered
                with QueueLess.
              </p>

              <span>
                {hospitals.length} registered
              </span>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/hospitals")
              }
              className="admin-management-button"
            >
              Manage Hospitals →
            </button>

          </div>


          {/* DEPARTMENT MANAGEMENT */}

          <div className="admin-management-card">

            <div className="admin-management-icon">
              🩺
            </div>

            <div className="admin-management-info">

              <h3>
                Department Management
              </h3>

              <p>
                Create and manage departments
                within hospitals.
              </p>

              <span>
                {departments.length} registered
              </span>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/departments")
              }
              className="admin-management-button"
            >
              Manage Departments →
            </button>

          </div>


          {/* DOCTOR MANAGEMENT */}

          <div className="admin-management-card">

            <div className="admin-management-icon">
              👨‍⚕️
            </div>

            <div className="admin-management-info">

              <h3>
                Doctor Management
              </h3>

              <p>
                Add doctors and assign them to
                departments.
              </p>

              <span>
                {doctors.length} registered
              </span>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/doctors")
              }
              className="admin-management-button"
            >
              Manage Doctors →
            </button>

          </div>


        </div>

      </div>


      {/* SYSTEM OVERVIEW */}

      <div className="admin-card admin-departments">

        <div className="admin-card-header">

          <div>

            <h2>
              System Overview
            </h2>

            <p>
              QueueLess system information
            </p>

          </div>

        </div>


        <div className="admin-department-grid">


          {/* HOSPITALS */}

          <div>

            <span>
              🏥
            </span>

            <div>

              <strong>
                Hospitals
              </strong>

              <small>
                {hospitals.length} registered
              </small>

            </div>

          </div>


          {/* DEPARTMENTS */}

          <div>

            <span>
              🩺
            </span>

            <div>

              <strong>
                Departments
              </strong>

              <small>
                {departments.length} registered
              </small>

            </div>

          </div>


          {/* DOCTORS */}

          <div>

            <span>
              👨‍⚕️
            </span>

            <div>

              <strong>
                Doctors
              </strong>

              <small>
                {doctors.length} registered
              </small>

            </div>

          </div>


          {/* PATIENTS */}

          <div>

            <span>
              👥
            </span>

            <div>

              <strong>
                Registered Patients
              </strong>

              <small>
                {patients.length} registered
              </small>

            </div>

          </div>


        </div>

      </div>


      {/* QUEUE STATUS */}

      <div className="admin-card">

        <div className="admin-card-header">

          <div>

            <h2>
              Queue Status
            </h2>

            <p>
              Today's queue breakdown
            </p>

          </div>

        </div>


        <div className="admin-completed-list">


          {/* WAITING */}

          <div className="admin-completed-item">

            <strong>
              {totalWaiting}
            </strong>

            <span>
              Waiting
            </span>

            <span className="admin-waiting-status">
              WAITING
            </span>

          </div>


          {/* SERVING */}

          <div className="admin-completed-item">

            <strong>
              {currentlyServing}
            </strong>

            <span>
              In Consultation
            </span>

            <span className="admin-status-live">
              SERVING
            </span>

          </div>


          {/* HOLD */}

          <div className="admin-completed-item">

            <strong>
              {heldPatients.length}
            </strong>

            <span>
              On Hold
            </span>

            <span className="admin-hold-status">
              HOLD
            </span>

          </div>


          {/* COMPLETED */}

          <div className="admin-completed-item">

            <strong>
              {totalCompleted}
            </strong>

            <span>
              Completed
            </span>

            <span className="admin-completed-status">
              ✓ COMPLETED
            </span>

          </div>


          {/* CANCELLED */}

          <div className="admin-completed-item">

            <strong>
              {totalCancelled}
            </strong>

            <span>
              Cancelled
            </span>

            <span className="admin-hold-status">
              CANCELLED
            </span>

          </div>


        </div>

      </div>


      {/* RECENTLY COMPLETED */}

      <div className="admin-card">

        <div className="admin-card-header">

          <div>

            <h2>
              Recently Completed
            </h2>

            <p>
              Latest completed consultations
            </p>

          </div>

        </div>


        {completedPatients.length === 0 ? (

          <div className="admin-no-completed">

            No completed consultations yet.

          </div>

        ) : (

          <div className="admin-completed-list">

            {completedPatients
              .slice()
              .reverse()
              .slice(0, 5)
              .map((patient) => {

                const department =
                  departments.find(
                    (item) =>
                      item.id ===
                      patient.departmentId
                  );


                return (

                  <div
                    className="admin-completed-item"
                    key={patient.id}
                  >

                    <strong>
                      A-{patient.tokenNumber}
                    </strong>


                    <span>

                      {patient.patientName ||
                        "Patient"}

                    </span>


                    <span>

                      {department
                        ? department.name
                        : "Department"}

                    </span>


                    <span className="admin-completed-status">

                      ✓ COMPLETED

                    </span>

                  </div>

                );

              })}

          </div>

        )}

      </div>


    </div>

  );

}

export default AdminDashboard;