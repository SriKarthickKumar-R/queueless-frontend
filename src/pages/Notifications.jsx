import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const patient = JSON.parse(
    localStorage.getItem("patient")
  );


  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  const loadNotifications = async () => {

    if (!patient?.id) {

      setError(
        "Patient information not found."
      );

      setLoading(false);

      return;
    }


    try {

      const response =
        await axios.get(
          `${API_URL}/notifications/patient/${patient.id}`
        );

      setNotifications(response.data);

      setError("");

    } catch (error) {

      console.error(
        "Error loading notifications:",
        error
      );

      setError(
        "Unable to load notifications."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // LOAD ON PAGE OPEN
  // =========================================

  useEffect(() => {

    loadNotifications();

  }, []);


  // =========================================
  // MARK ONE AS READ
  // =========================================

  const markAsRead = async (
    notificationId
  ) => {

    try {

      await axios.put(
        `${API_URL}/notifications/${notificationId}/read`
      );


      setNotifications(
        (currentNotifications) =>

          currentNotifications.map(
            (notification) =>

              notification.id === notificationId

                ? {
                    ...notification,
                    readStatus: true,
                  }

                : notification
          )
      );

    } catch (error) {

      console.error(
        "Error marking notification as read:",
        error
      );

    }

  };


  // =========================================
  // MARK ALL AS READ
  // =========================================

  const markAllAsRead = async () => {

    if (!patient?.id) {

      return;

    }


    try {

      await axios.put(
        `${API_URL}/notifications/patient/${patient.id}/read-all`
      );


      setNotifications(
        (currentNotifications) =>

          currentNotifications.map(
            (notification) => ({

              ...notification,

              readStatus: true,

            })
          )
      );

    } catch (error) {

      console.error(
        "Error marking all notifications as read:",
        error
      );

    }

  };


  // =========================================
  // UNREAD COUNT
  // =========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.readStatus
    ).length;


  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (
    dateString
  ) => {

    if (!dateString) {

      return "";

    }


    return new Date(
      dateString
    ).toLocaleString();

  };


  return (

    <div className="notifications-page">


      {/* =====================================
          HEADER
      ====================================== */}

      <div className="notifications-header">

        <div>

          <p className="notifications-eyebrow">
            CENTER
          </p>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated with your appointments
            and queue status.
          </p>

        </div>


        {unreadCount > 0 && (

          <button
            className="notifications-mark-all"
            onClick={markAllAsRead}
          >

            Mark all as read

          </button>

        )}

      </div>


      {/* =====================================
          SUMMARY
      ====================================== */}

      <div className="notifications-summary">


        <div className="notification-summary-card">

          <span>
            Total Notifications
          </span>

          <strong>
            {notifications.length}
          </strong>

        </div>


        <div className="notification-summary-card">

          <span>
            Unread
          </span>

          <strong>
            {unreadCount}
          </strong>

        </div>


      </div>


      {/* =====================================
          LOADING
      ====================================== */}

      {loading && (

        <div className="notifications-state">

          <div className="notification-loader"></div>

          <p>
            Loading notifications...
          </p>

        </div>

      )}


      {/* =====================================
          ERROR
      ====================================== */}

      {!loading && error && (

        <div className="notifications-state notifications-error">

          <div className="notification-state-icon">
            ⚠️
          </div>

          <h3>
            Something went wrong
          </h3>

          <p>
            {error}
          </p>

          <button
            className="notification-retry-button"
            onClick={loadNotifications}
          >
            Try Again
          </button>

        </div>

      )}


      {/* =====================================
          EMPTY STATE
      ====================================== */}

      {!loading &&
        !error &&
        notifications.length === 0 && (

          <div className="notifications-state">

            <div className="notification-state-icon">
              🔔
            </div>

            <h3>
              No notifications yet
            </h3>

            <p>
              Important updates about your queue
              and appointments will appear here.
            </p>

          </div>

        )}


      {/* =====================================
          NOTIFICATION LIST
      ====================================== */}

      {!loading &&
        !error &&
        notifications.length > 0 && (

          <div className="notifications-list">


            {notifications.map(
              (notification) => (

                <div
                  key={notification.id}
                  className={`notification-card ${
                    !notification.readStatus
                      ? "notification-unread"
                      : ""
                  }`}
                >


                  {/* ICON */}

                  <div className="notification-icon">

                    {notification.type === "QUEUE"
                      ? "🎫"
                      : notification.type === "APPOINTMENT"
                      ? "📅"
                      : "🔔"}

                  </div>


                  {/* CONTENT */}

                  <div className="notification-content">


                    <div className="notification-title-row">

                      <h3>
                        {notification.title}
                      </h3>


                      {!notification.readStatus && (

                        <span className="notification-new">
                          NEW
                        </span>

                      )}

                    </div>


                    <p>
                      {notification.message}
                    </p>


                    <span className="notification-time">

                      {formatDate(
                        notification.createdAt
                      )}

                    </span>


                  </div>


                  {/* MARK AS READ */}

                  {!notification.readStatus && (

                    <button
                      className="notification-read-button"
                      onClick={() =>
                        markAsRead(
                          notification.id
                        )
                      }
                    >

                      Mark as read

                    </button>

                  )}


                </div>

              )
            )}

          </div>

        )}

    </div>

  );

}

export default Notifications;