import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function HospitalSelection() {

  const [search, setSearch] = useState("");

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/hospitals")
      .then((response) => {
        setHospitals(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading hospitals:", error);
        setError("Unable to load hospitals.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="hospitals-page">
        <h2>Loading hospitals...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hospitals-page">
        <h2>{error}</h2>
      </div>
    );
  }

  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      hospital.location
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="hospitals-page">

      {/* HEADER */}

      <div className="hospitals-header">

        <div>
          <h1>
            Find a Hospital 🏥
          </h1>

          <p>
            Choose a hospital and join a digital queue
            without waiting in line.
          </p>
        </div>

      </div>


      {/* SEARCH */}

      <div className="hospital-search">

        <span>
          🔎
        </span>

        <input
          type="text"
          placeholder="Search hospital or location..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

      </div>


      {/* RESULTS */}

      <div className="hospital-results-header">

        <h2>
          Available Hospitals
        </h2>

        <span>
          {filteredHospitals.length} hospitals
        </span>

      </div>


      {/* HOSPITAL CARDS */}

      {filteredHospitals.length === 0 ? (

        <div className="hospital-empty">

          <div>
            🔍
          </div>

          <h3>
            No hospitals found
          </h3>

          <p>
            Try searching for a different hospital
            or location.
          </p>

        </div>

      ) : (

        <div className="hospital-grid">

          {filteredHospitals.map((hospital) => (

            <div
              className="hospital-card"
              key={hospital.id}
            >

              {/* HOSPITAL HEADER */}

              <div className="hospital-card-header">

                <div className="hospital-icon">
                  🏥
                </div>

                <span className="hospital-open">
                  ● OPEN
                </span>

              </div>


              {/* NAME */}

              <h3>
                {hospital.name}
              </h3>

              <p className="hospital-location">
                📍 {hospital.location}
              </p>


              {/* QUEUE INFO */}

              <div className="hospital-stats">

                <div>

                  <span>
                    Waiting
                  </span>

                  <strong>
                    0
                  </strong>

                  <small>
                    people
                  </small>

                </div>


                <div>

                  <span>
                    Est. Wait
                  </span>

                  <strong>
                    0
                  </strong>

                  <small>
                    minutes
                  </small>

                </div>


                <div>

                  <span>
                    Departments
                  </span>

                  <strong>
                    0
                  </strong>

                  <small>
                    available
                  </small>

                </div>

              </div>


              {/* ACTION */}

              <Link
                to={`/hospital/${hospital.id}`}
              >

                <button className="hospital-button">
                  View Departments →
                </button>

              </Link>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default HospitalSelection;