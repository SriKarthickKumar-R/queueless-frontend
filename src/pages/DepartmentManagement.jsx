import { useEffect, useState } from "react";
import axios from "axios";

function DepartmentManagement() {

  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [selectedHospitalId, setSelectedHospitalId] = useState("");

  const [name, setName] = useState("");

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
          response.data[0].id
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


  // LOAD DEPARTMENTS

  async function loadDepartments() {

    try {

      const response =
        await axios.get(
          "http://localhost:8080/departments"
        );

      setDepartments(response.data);

    } catch (error) {

      console.error(
        "Error loading departments:",
        error
      );

      setError(
        "Unable to load departments."
      );

    } finally {

      setLoading(false);

    }

  }


  // LOAD DATA WHEN PAGE OPENS

  useEffect(() => {

    loadHospitals();
    loadDepartments();

  }, []);


  // ADD DEPARTMENT

  async function handleAddDepartment(event) {

    event.preventDefault();

    setMessage("");
    setError("");


    // VALIDATION

    if (!selectedHospitalId) {

      setError(
        "Please select a hospital."
      );

      return;

    }


    if (!name.trim()) {

      setError(
        "Please enter a department name."
      );

      return;

    }


    setAdding(true);


    try {

      const response =
        await axios.post(
          "http://localhost:8080/departments",
          {
            name: name.trim(),
            hospitalId: Number(
              selectedHospitalId
            )
          }
        );


      // ADD TO CURRENT LIST

      setDepartments(
        (previousDepartments) => [
          ...previousDepartments,
          response.data
        ]
      );


      // CLEAR FORM

      setName("");


      setMessage(
        "Department added successfully."
      );


    } catch (error) {

      console.error(
        "Error adding department:",
        error
      );

      setError(
        "Unable to add department."
      );

    } finally {

      setAdding(false);

    }

  }


  // GET HOSPITAL NAME

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


  return (

    <div className="department-management-page">


      {/* HEADER */}

      <div className="management-header">

        <div>

          <span className="admin-badge">
            ADMIN MANAGEMENT
          </span>

          <h1>
            Department Management 🩺
          </h1>

          <p>
            Add and manage departments inside
            your QueueLess hospitals.
          </p>

        </div>

      </div>


      {/* ADD DEPARTMENT */}

      <div className="management-card">

        <div className="management-card-header">

          <div>

            <h2>
              Add New Department
            </h2>

            <p>
              Select a hospital and create a
              department.
            </p>

          </div>

        </div>


        <form
          onSubmit={handleAddDepartment}
          className="department-form"
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


          {/* DEPARTMENT NAME */}

          <div className="form-group">

            <label>
              Department Name *
            </label>

            <input
              type="text"
              placeholder="Example: Cardiology"
              value={name}
              onChange={(event) =>
                setName(
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
            disabled={adding}
          >

            {adding
              ? "Adding Department..."
              : "+ Add Department"}

          </button>

        </form>

      </div>


      {/* DEPARTMENT LIST */}

      <div className="management-card">

        <div className="management-card-header">

          <div>

            <h2>
              Registered Departments
            </h2>

            <p>
              Departments currently available
              in QueueLess.
            </p>

          </div>

          <span className="management-count">

            {departments.length}

          </span>

        </div>


        {loading ? (

          <p>
            Loading departments...
          </p>

        ) : departments.length === 0 ? (

          <div className="empty-management">

            <div>
              🩺
            </div>

            <h3>
              No departments registered
            </h3>

            <p>
              Add your first department above.
            </p>

          </div>

        ) : (

          <div className="department-list">

            {departments.map(
              (department) => (

                <div
                  className="department-management-item"
                  key={department.id}
                >

                  <div className="department-management-icon">

                    🩺

                  </div>


                  <div className="department-management-info">

                    <h3>
                      {department.name}
                    </h3>

                    <p>

                      🏥{" "}
                      {getHospitalName(
                        department.hospitalId
                      )}

                    </p>

                    <span>

                      Department ID #
                      {department.id}

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

export default DepartmentManagement;