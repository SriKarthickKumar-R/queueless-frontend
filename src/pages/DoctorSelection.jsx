import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function DoctorSelection() {

  // API base URL from Vite environment variable
  const API_URL = import.meta.env.VITE_API_URL;

  // Get hospital and department IDs from the URL
  const { hospitalId, departmentId } = useParams();

  // Search box
  const [search, setSearch] = useState("");

  // Doctors from backend
  const [doctors, setDoctors] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error state
  const [error, setError] = useState("");


  // Get doctors from Spring Boot
  useEffect(() => {

    async function fetchDoctors() {

      try {

        const response = await axios.get(
          `${API_URL}/doctors/hospital/${hospitalId}/department/${departmentId}`
        );

        console.log("Doctors:", response.data);

        setDoctors(response.data);

      } catch (error) {

        console.error("Error loading doctors:", error);

        setError("Failed to load doctors.");

      } finally {

        setLoading(false);

      }
    }

    fetchDoctors();

  }, [hospitalId, departmentId]);


  // Search doctors
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      doctor.specialization
        .toLowerCase()
        .includes(search.toLowerCase())
  );


  // Loading screen
  if (loading) {

    return (
      <div className="doctors-page">

        <div className="doctor-empty">

          <div>
            ⏳
          </div>

          <h3>
            Loading doctors...
          </h3>

          <p>
            Please wait while we load the available doctors.
          </p>

        </div>

      </div>
    );
  }


  // Error screen
  if (error) {

    return (
      <div className="doctors-page">

        <div className="doctor-empty">

          <div>
            ⚠️
          </div>

          <h3>
            Something went wrong
          </h3>

          <p>
            {error}
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="doctors-page">

      {/* HEADER */}

      <div className="doctors-header">

        <span className="page-breadcrumb">
          Hospital #{hospitalId} · Department #{departmentId}
        </span>

        <h1>
          Choose a Doctor 👨‍⚕️
        </h1>

        <p>
          Select a doctor and check their current queue
          before getting your digital token.
        </p>

      </div>


      {/* SEARCH */}

      <div className="doctor-search">

        <span>
          🔎
        </span>

        <input
          type="text"
          placeholder="Search doctor or specialization..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

      </div>


      {/* RESULTS HEADER */}

      <div className="doctor-results-header">

        <div>

          <h2>
            Available Doctors
          </h2>

          <p>
            Choose a doctor based on availability
            and current waiting time.
          </p>

        </div>

        <span>
          {filteredDoctors.length} doctors
        </span>

      </div>


      {/* DOCTORS */}

      {filteredDoctors.length === 0 ? (

        <div className="doctor-empty">

          <div>
            🔍
          </div>

          <h3>
            No doctors found
          </h3>

          <p>
            Try searching for another doctor
            or specialization.
          </p>

        </div>

      ) : (

        <div className="doctor-grid">

          {filteredDoctors.map((doctor) => (

            <div
              className="doctor-card"
              key={doctor.id}
            >

              {/* TOP */}

              <div className="doctor-card-top">

                <div className="doctor-large-avatar">
                  👨‍⚕️
                </div>

                <span className="doctor-available">
                  ● AVAILABLE
                </span>

              </div>


              {/* DOCTOR INFO */}

              <h3>
                {doctor.name}
              </h3>

              <p className="doctor-specialization">
                {doctor.specialization}
              </p>


              {/* EXPERIENCE / RATING */}

              <div className="doctor-meta">

                <span>
                  ⭐ 4.8
                </span>

                <span>
                  Experienced Doctor
                </span>

              </div>


              {/* QUEUE */}

              <div className="doctor-queue">

                <div>

                  <span>
                    Patients Waiting
                  </span>

                  <strong>
                    —
                  </strong>

                </div>

                <div>

                  <span>
                    Estimated Wait
                  </span>

                  <strong>
                    —
                  </strong>

                </div>

              </div>


              {/* BUTTON */}

              <Link
                to={`/hospital/${hospitalId}/department/${departmentId}/doctor/${doctor.id}/queue`}
              >

                <button className="doctor-button">
                  Join Queue →
                </button>

              </Link>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default DoctorSelection;