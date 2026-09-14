import { useEffect, useState } from "react";
import axios from "axios";

function DoctorManagement() {

  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // LOAD HOSPITALS

  async function loadHospitals() {

    try {

      const response =
        await axios.get(
          "http://localhost:8080/hospitals"
        );

      setHospitals(response.data);

      if (response.data.length > 0) {
        setSelectedHospitalId(
          response.data[0].id.toString()
        );
      }

    } catch (error) {

      console.error(
        "Error loading hospitals:",
        error
      );

      setError(
        "Unable to load hospitals."
      );

    }

  }


  // LOAD DEPARTMENTS FOR SELECTED HOSPITAL

  async function loadDepartments(hospitalId) {

    if (!hospitalId) {
      setDepartments([]);
      return;
    }

    try {

      const response =
        await axios.get(
          `http://localhost:8080/departments/hospital/${hospitalId}`
        );

      setDepartments(response.data);

      if (response.data.length > 0) {

        setSelectedDepartmentId(
          response.data[0].id.toString()
        );

      } else {

        setSelectedDepartmentId("");

      }

    } catch (error) {

      console.error(
        "Error loading departments:",
        error
      );

      setError(
        "Unable to load departments."
      );

    }

  }


  // LOAD DOCTORS

  async function loadDoctors() {

    try {

      const response =
        await axios.get(
          "http://localhost:8080/doctors"
        );

      setDoctors(response.data);

    } catch (error) {

      console.error(
        "Error loading doctors:",
        error
      );

      setError(
        "Unable to load doctors."
      );

    } finally {

      setLoading(false);

    }

  }


  // INITIAL LOAD

  useEffect(() => {

    loadHospitals();
    loadDoctors();

  }, []);


  // LOAD DEPARTMENTS WHEN HOSPITAL CHANGES

  useEffect(() => {

    loadDepartments(
      selectedHospitalId
    );

  }, [selectedHospitalId]);


  // ADD DOCTOR

  async function handleAddDoctor(event) {

    event.preventDefault();

    setMessage("");
    setError("");


    if (!selectedHospitalId) {

      setError(
        "Please select a hospital."
      );

      return;

    }


    if (!selectedDepartmentId) {

      setError(
        "Please select a department."
      );

      return;

    }


    if (!name.trim()) {

      setError(
        "Please enter the doctor's name."
      );

      return;

    }


    if (!specialization.trim()) {

      setError(
        "Please enter the specialization."
      );

      return;

    }


    setAdding(true);


    try {

      const response =
        await axios.post(
          "http://localhost:8080/doctors",
          {
            name: name.trim(),
            specialization:
              specialization.trim(),
            hospitalId:
              Number(selectedHospitalId),
            departmentId:
              Number(selectedDepartmentId)
          }
        );


      setDoctors(
        (previousDoctors) => [
          ...previousDoctors,
          response.data
        ]
      );


      setName("");
      setSpecialization("");


      setMessage(
        "Doctor added successfully."
      );


    } catch (error) {

      console.error(
        "Error adding doctor:",
        error
      );

      setError(
        "Unable to add doctor."
      );

    } finally {

      setAdding(false);

    }

  }


  // FIND HOSPITAL NAME

  function getHospitalName(hospitalId) {

    const hospital =
      hospitals.find(
        (item) =>
          item.id === hospitalId
      );

    return hospital
      ? hospital.name
      : "Unknown Hospital";

  }


  // FIND DEPARTMENT NAME

  function getDepartmentName(departmentId) {

    const department =
      departments.find(
        (item) =>
          item.id === departmentId
      );

    return department
      ? department.name
      : `Department #${departmentId}`;

  }


  return (

    <div className="doctor-management-page">


      {/* HEADER */}

      <div className="management-header">

        <div>

          <span className="admin-badge">
            ADMIN MANAGEMENT
          </span>

          <h1>
            Doctor Management 👨‍⚕️
          </h1>

          <p>
            Add and manage doctors inside
            your QueueLess hospitals.
          </p>

        </div>

      </div>


      {/* ADD DOCTOR */}

      <div className="management-card">

        <div className="management-card-header">

          <div>

            <h2>
              Add New Doctor
            </h2>

            <p>
              Assign a doctor to a hospital
              and department.
            </p>

          </div>

        </div>


        <form
          onSubmit={handleAddDoctor}
          className="doctor-form"
        >


          {/* HOSPITAL */}

          <div className="form-group">

            <label>
              Hospital *
            </label>

            <select
              value={selectedHospitalId}
              onChange={(event) =>
                setSelectedHospitalId(
                  event.target.value
                )
              }
            >

              <option value="">
                Select Hospital
              </option>

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

          <div className="form-group">

            <label>
              Department *
            </label>

            <select
              value={selectedDepartmentId}
              onChange={(event) =>
                setSelectedDepartmentId(
                  event.target.value
                )
              }
              disabled={
                departments.length === 0
              }
            >

              <option value="">
                {departments.length === 0
                  ? "No departments available"
                  : "Select Department"}
              </option>

              {departments.map(
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


          {/* DOCTOR NAME */}

          <div className="form-group">

            <label>
              Doctor Name *
            </label>

            <input
              type="text"
              placeholder="Example: Dr. Kumar"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
            />

          </div>


          {/* SPECIALIZATION */}

          <div className="form-group">

            <label>
              Specialization *
            </label>

            <input
              type="text"
              placeholder="Example: Cardiologist"
              value={specialization}
              onChange={(event) =>
                setSpecialization(
                  event.target.value
                )
              }
            />

          </div>


          {/* MESSAGES */}

          {message && (

            <div className="success-message">

              ✓ {message}

            </div>

          )}


          {error && (

            <div className="error-message">

              {error}

            </div>

          )}


          {/* BUTTON */}

          <button
            type="submit"
            className="management-button"
            disabled={
              adding ||
              departments.length === 0
            }
          >

            {adding
              ? "Adding Doctor..."
              : "+ Add Doctor"}

          </button>

        </form>

      </div>


      {/* DOCTOR LIST */}

      <div className="management-card">

        <div className="management-card-header">

          <div>

            <h2>
              Registered Doctors
            </h2>

            <p>
              Doctors currently available
              in QueueLess.
            </p>

          </div>

          <span className="management-count">

            {doctors.length}

          </span>

        </div>


        {loading ? (

          <p>
            Loading doctors...
          </p>

        ) : doctors.length === 0 ? (

          <div className="empty-management">

            <div>
              👨‍⚕️
            </div>

            <h3>
              No doctors registered
            </h3>

            <p>
              Add your first doctor above.
            </p>

          </div>

        ) : (

          <div className="doctor-list">

            {doctors.map(
              (doctor) => (

                <div
                  className="doctor-management-item"
                  key={doctor.id}
                >

                  <div className="doctor-management-icon">

                    👨‍⚕️

                  </div>


                  <div className="doctor-management-info">

                    <h3>
                      {doctor.name}
                    </h3>

                    <p>
                      {doctor.specialization}
                    </p>

                    <span>
                      🏥{" "}
                      {getHospitalName(
                        doctor.hospitalId
                      )}
                    </span>

                    <small>
                      🩺{" "}
                      {getDepartmentName(
                        doctor.departmentId
                      )}
                    </small>

                  </div>


                  <div className="doctor-id">

                    ID #{doctor.id}

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

export default DoctorManagement;