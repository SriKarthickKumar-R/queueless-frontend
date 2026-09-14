import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function DepartmentSelection() {

  // API base URL from Vite environment variable
  const API_URL = import.meta.env.VITE_API_URL;

  // Get hospital ID from the URL
  // Example: /hospital/1 → hospitalId = 1
  const { hospitalId } = useParams();

  // Search box value
  const [search, setSearch] = useState("");

  // Departments received from backend
  const [departments, setDepartments] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error message
  const [error, setError] = useState("");


  // Fetch departments when the page loads
  useEffect(() => {

    async function fetchDepartments() {

      try {

        const response = await axios.get(
          `${API_URL}/departments/hospital/${hospitalId}`
        );

        console.log("Departments:", response.data);

        setDepartments(response.data);

      } catch (error) {

        console.error("Error loading departments:", error);

        setError("Failed to load departments.");

      } finally {

        setLoading(false);

      }
    }

    fetchDepartments();

  }, [hospitalId]);


  // Filter departments based on search
  const filteredDepartments = departments.filter(
    (department) =>
      department.name
        .toLowerCase()
        .includes(search.toLowerCase())
  );


  // Show loading message
  if (loading) {
    return (
      <div className="departments-page">

        <div className="department-empty">

          <div>
            ⏳
          </div>

          <h3>
            Loading departments...
          </h3>

          <p>
            Please wait while we load the hospital departments.
          </p>

        </div>

      </div>
    );
  }


  // Show error message
  if (error) {
    return (
      <div className="departments-page">

        <div className="department-empty">

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
    <div className="departments-page">

      {/* HEADER */}

      <div className="departments-header">

        <div>

          <span className="page-breadcrumb">
            Hospital #{hospitalId}
          </span>

          <h1>
            Choose a Department 🩺
          </h1>

          <p>
            Select the department you want to visit.
            You can see the current queue before joining.
          </p>

        </div>

      </div>


      {/* SEARCH */}

      <div className="department-search">

        <span>
          🔎
        </span>

        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

      </div>


      {/* RESULTS HEADER */}

      <div className="department-results-header">

        <div>

          <h2>
            Hospital Departments
          </h2>

          <p>
            Choose a department based on your needs
            and current waiting time.
          </p>

        </div>

        <span>
          {filteredDepartments.length} departments
        </span>

      </div>


      {/* DEPARTMENT GRID */}

      {filteredDepartments.length === 0 ? (

        <div className="department-empty">

          <div>
            🔍
          </div>

          <h3>
            No department found
          </h3>

          <p>
            Try searching for another department.
          </p>

        </div>

      ) : (

        <div className="department-grid">

          {filteredDepartments.map(
            (department) => (

              <div
                className="department-card"
                key={department.id}
              >

                {/* CARD HEADER */}

                <div className="department-card-header">

                  <div className="department-icon">
                    🩺
                  </div>

                  <span className="department-available">
                    ● AVAILABLE
                  </span>

                </div>


                {/* NAME */}

                <h3>
                  {department.name}
                </h3>

                <p className="department-description">
                  Medical consultation and treatment.
                </p>


                {/* QUEUE INFORMATION */}

                <div className="department-stats">

                  <div>

                    <span>
                      Waiting
                    </span>

                    <strong>
                      —
                    </strong>

                    <small>
                      patients
                    </small>

                  </div>


                  <div>

                    <span>
                      Est. Wait
                    </span>

                    <strong>
                      —
                    </strong>

                    <small>
                      minutes
                    </small>

                  </div>

                </div>


                {/* ACTION */}

                <Link
                  to={`/hospital/${hospitalId}/department/${department.id}`}
                >

                  <button className="department-button">
                    View Doctors →
                  </button>

                </Link>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}

export default DepartmentSelection;
