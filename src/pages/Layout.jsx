import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Layout({ children }) {

  const navigate = useNavigate();


  // =========================================
  // PATIENT
  // =========================================

  const [patient] = useState(() => {

    const savedPatient =
      localStorage.getItem("patient");

    return savedPatient
      ? JSON.parse(savedPatient)
      : null;

  });


  // =========================================
  // UNREAD NOTIFICATION COUNT
  // =========================================

  const [unreadCount, setUnreadCount] = useState(0);


  // =========================================
  // LOAD UNREAD COUNT
  // =========================================

  const loadUnreadCount = async () => {

    if (!patient?.id) {
      return;
    }

    try {

      const response =
        await axios.get(
          `http://localhost:8080/notifications/patient/${patient.id}/unread/count`
        );

      setUnreadCount(response.data);

    } catch (error) {

      console.error(
        "Error loading notification count:",
        error
      );

    }

  };


  // =========================================
  // NOTIFICATION POLLING
  // =========================================

  useEffect(() => {

    loadUnreadCount();


    const interval = setInterval(() => {

      loadUnreadCount();

    }, 3000);


    return () => {

      clearInterval(interval);

    };

  }, [patient?.id]);


  // =========================================
  // LOGOUT
  // =========================================

  function handleLogout() {

    localStorage.removeItem("patient");

    navigate("/login");

  }


  // =========================================
  // OPEN NOTIFICATIONS
  // =========================================

  function handleNotifications() {

    navigate("/notifications");

  }


  return (

    <div className="app-layout">


      {/* ===================================== */}
      {/* SIDEBAR */}
      {/* ===================================== */}

      <aside className="sidebar">


        {/* LOGO */}

        <div className="sidebar-logo">

          <div className="logo-icon">
            Q
          </div>

          <div>

            <h2>
              QueueLess
            </h2>

            <span>
              Smart Healthcare
            </span>

          </div>

        </div>


        {/* =================================== */}
        {/* MAIN NAVIGATION */}
        {/* =================================== */}

        <nav className="sidebar-nav">


          {/* DASHBOARD */}

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >

            <span>
              🏠
            </span>

            Dashboard

          </NavLink>


          {/* HOSPITALS */}

          <NavLink
            to="/hospitals"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >

            <span>
              🏥
            </span>

            Hospitals

          </NavLink>


          {/* MY QUEUE */}

          <NavLink
            to="/my-queue"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >

            <span>
              🎫
            </span>

            My Queue

          </NavLink>


          {/* APPOINTMENTS */}

          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >

            <span>
              📅
            </span>

            Appointments

          </NavLink>


        </nav>


        {/* =================================== */}
        {/* BOTTOM NAVIGATION */}
        {/* =================================== */}

        <div className="sidebar-bottom">


          {/* PROFILE */}

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >

            <span>
              👤
            </span>

            Profile

          </NavLink>


          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            className="logout-button"
          >

            <span>
              🚪
            </span>

            Logout

          </button>


        </div>


      </aside>


      {/* ===================================== */}
      {/* MAIN AREA */}
      {/* ===================================== */}

      <div className="main-area">


        {/* =================================== */}
        {/* TOPBAR */}
        {/* =================================== */}

        <header className="topbar">


          <div>

            <h3>
              Patient Portal
            </h3>

            <span>
              Manage your healthcare journey
            </span>

          </div>


          <div className="topbar-right">


            {/* ================================= */}
            {/* NOTIFICATIONS */}
            {/* ================================= */}

            <button
              className="notification-button"
              onClick={handleNotifications}
              title="Notifications"
            >

              🔔


              {/* UNREAD BADGE */}

              {unreadCount > 0 && (

                <span className="notification-badge">

                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}

                </span>

              )}

            </button>


            {/* ================================= */}
            {/* PROFILE */}
            {/* ================================= */}

            <div className="profile">


              <div className="profile-avatar">

                {patient
                  ? patient.name
                    .charAt(0)
                    .toUpperCase()
                  : "P"}

              </div>


              <div>

                <strong>

                  {patient
                    ? patient.name
                    : "Patient"}

                </strong>

                <span>
                  Patient
                </span>

              </div>


            </div>


          </div>


        </header>


        {/* =================================== */}
        {/* PAGE CONTENT */}
        {/* =================================== */}

        <main className="page-content">

          {children}

        </main>


      </div>

    </div>

  );

}

export default Layout;