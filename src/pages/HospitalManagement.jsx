import { useEffect, useState } from "react";
import axios from "axios";

function HospitalManagement() {

  const API_URL = import.meta.env.VITE_API_URL;

  const [hospitals, setHospitals] = useState([]);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // LOAD HOSPITALS

  async function loadHospitals() {

    try {

      const response =
        await axios.get(
          `${API_URL}/hospitals`
        );

      setHospitals(response.data);

    } catch (error) {

      console.error(
        "Error loading hospitals:",
        error
      );

      setError(
        "Unable to load hospitals."
      );

    } finally {

      setLoading(false);

    }

  }


  // LOAD WHEN PAGE OPENS

  useEffect(() => {

    loadHospitals();

  }, []);


  // ADD HOSPITAL

  async function handleAddHospital(event) {

    event.preventDefault();

    setMessage("");
    setError("");


    // BASIC VALIDATION

    if (
      !name.trim() ||
      !location.trim() ||
      !address.trim()
    ) {

      setError(
        "Please fill in all required fields."
      );

      return;
    }


    setAdding(true);


    try {

      const response =
        await axios.post(
          `${API_URL}/hospitals`,
          {
            name: name.trim(),
            location: location.trim(),
            address: address.trim(),
            description: description.trim()
          }
        );


      // ADD NEW HOSPITAL TO SCREEN

      setHospitals((previousHospitals) => [
        ...previousHospitals,
        response.data
      ]);


      // CLEAR FORM

      setName("");
      setLocation("");
      setAddress("");
      setDescription("");


      setMessage(
        "Hospital added successfully."
      );

    } catch (error) {

      console.error(
        "Error adding hospital:",
        error
      );

      setError(
        "Unable to add hospital."
      );

    } finally {

      setAdding(false);

    }

  }


  return (

    <div className="hospital-management-page">


      {/* HEADER */}

      <div className="management-header">

        <div>

          <span className="admin-badge">
            ADMIN MANAGEMENT
          </span>

          <h1>
            Hospital Management 🏥
          </h1>

          <p>
            Add and manage hospitals registered
            with QueueLess.
          </p>

        </div>

      </div>


      {/* ADD HOSPITAL */}

      <div className="management-card">

        <div className="management-card-header">

          <div>

            <h2>
              Add New Hospital
            </h2>

            <p>
              Register a hospital in QueueLess.
            </p>

          </div>

        </div>


        <form
          onSubmit={handleAddHospital}
          className="hospital-form"
        >


          {/* NAME */}

          <div className="form-group">

            <label>
              Hospital Name *
            </label>

            <input
              type="text"
              placeholder="Example: QueueLess General Hospital"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />

          </div>


          {/* LOCATION */}

          <div className="form-group">

            <label>
              Location *
            </label>

            <input
              type="text"
              placeholder="Example: Chennai"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
            />

          </div>


          {/* ADDRESS */}

          <div className="form-group">

            <label>
              Address *
            </label>

            <input
              type="text"
              placeholder="Example: Anna Nagar, Chennai"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
            />

          </div>


          {/* DESCRIPTION */}

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              placeholder="Brief description of the hospital"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows="4"
            />

          </div>


          {/* MESSAGE */}

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
              ? "Adding Hospital..."
              : "+ Add Hospital"}

          </button>


        </form>

      </div>


      {/* HOSPITAL LIST */}

      <div className="management-card">

        <div className="management-card-header">

          <div>

            <h2>
              Registered Hospitals
            </h2>

            <p>
              Hospitals currently available
              in QueueLess.
            </p>

          </div>

          <span className="management-count">

            {hospitals.length}

          </span>

        </div>


        {loading ? (

          <p>
            Loading hospitals...
          </p>

        ) : hospitals.length === 0 ? (

          <div className="empty-management">

            <div>
              🏥
            </div>

            <h3>
              No hospitals registered
            </h3>

            <p>
              Add your first hospital above.
            </p>

          </div>

        ) : (

          <div className="hospital-list">

            {hospitals.map((hospital) => (

              <div
                className="hospital-management-item"
                key={hospital.id}
              >

                <div className="hospital-management-icon">

                  🏥

                </div>


                <div className="hospital-management-info">

                  <h3>
                    {hospital.name}
                  </h3>

                  <p>
                    📍 {hospital.location}
                  </p>

                  <span>
                    {hospital.address}
                  </span>

                  {hospital.description && (

                    <small>
                      {hospital.description}
                    </small>

                  )}

                </div>


                <div className="hospital-id">

                  ID #{hospital.id}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>


    </div>

  );

}

export default HospitalManagement;