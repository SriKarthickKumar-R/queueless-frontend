import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./pages/ProtectedRoute";

import DoctorManagement from "./pages/DoctorManagement";
import Layout from "./pages/Layout";
import HospitalManagement from "./pages/HospitalManagement";
import PatientDashboard from "./pages/PatientDashboard";
import HospitalSelection from "./pages/HospitalSelection";
import DepartmentSelection from "./pages/DepartmentSelection";
import DoctorSelection from "./pages/DoctorSelection";
import JoinQueue from "./pages/JoinQueue";
import MyQueue from "./pages/MyQueue";
import DepartmentManagement from "./pages/DepartmentManagement";

import AppointmentBooking from "./pages/AppointmentBooking";
import MyAppointments from "./pages/MyAppointments";

import ReceptionistDashboard from "./pages/ReceptionistDashboard";

import AdminDashboard from "./pages/AdminDashboard";

import Profile from "./pages/Profile";

import Notifications from "./pages/Notifications";


function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* =========================
            PUBLIC LANDING PAGE
        ========================== */}

        <Route
          path="/"
          element={

            <>

              <nav>

                <h2>
                  QueueLess
                </h2>

                <div>

                  <Link to="/login">

                    <button>
                      Login
                    </button>

                  </Link>


                  <Link to="/register">

                    <button>
                      Get Started
                    </button>

                  </Link>

                </div>

              </nav>


              <main>

                <section>

                  <h1>
                    Skip the queue.
                    <br />
                    Save your time.
                  </h1>


                  <p>
                    QueueLess helps patients join
                    hospital queues digitally, track
                    their position and book appointments
                    without waiting unnecessarily.
                  </p>


                  <Link to="/register">

                    <button>
                      Get Started
                    </button>

                  </Link>

                </section>


                <section>

                  <div>

                    <h3>
                      Current Queue
                    </h3>

                    <h1>
                      A-121
                    </h1>

                    <p>
                      Now serving
                    </p>

                    <p>
                      6 people waiting
                    </p>

                  </div>

                </section>

              </main>

            </>

          }
        />


        {/* =========================
            AUTHENTICATION
        ========================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            PATIENT DASHBOARD
        ========================== */}

        <Route
          path="/dashboard"
          element={

            <ProtectedRoute>

              <Layout>

                <PatientDashboard />

              </Layout>

            </ProtectedRoute>

          }
        />


        {/* =========================
            HOSPITAL SELECTION
        ========================== */}

        <Route
          path="/hospitals"
          element={

            <ProtectedRoute>

              <Layout>

                <HospitalSelection />

              </Layout>

            </ProtectedRoute>

          }
        />


        {/* =========================
            DEPARTMENT SELECTION
        ========================== */}

        <Route
          path="/hospital/:hospitalId"
          element={

            <ProtectedRoute>

              <Layout>

                <DepartmentSelection />

              </Layout>

            </ProtectedRoute>

          }
        />


        {/* =========================
            DOCTOR SELECTION
        ========================== */}

        <Route
          path="/hospital/:hospitalId/department/:departmentId"
          element={

            <ProtectedRoute>

              <Layout>

                <DoctorSelection />

              </Layout>

            </ProtectedRoute>

          }
        />


        {/* =========================
            JOIN QUEUE
        ========================== */}

        <Route
          path="/hospital/:hospitalId/department/:departmentId/doctor/:doctorId/queue"
          element={

            <ProtectedRoute>

              <Layout>

                <JoinQueue />

              </Layout>

            </ProtectedRoute>

          }
        />


        {/* =========================
            MY QUEUE
        ========================== */}

        <Route
          path="/my-queue"
          element={

            <ProtectedRoute>

              <Layout>

                <MyQueue />

              </Layout>

            </ProtectedRoute>

          }
        />


        {/* =========================
            APPOINTMENTS
        ========================== */}

        <Route
          path="/appointments/book"
          element={

            <ProtectedRoute>

              <Layout>

                <AppointmentBooking />

              </Layout>

            </ProtectedRoute>

          }
        />


        <Route
          path="/appointments"
          element={

            <ProtectedRoute>

              <Layout>

                <MyAppointments />

              </Layout>

            </ProtectedRoute>

          }
        />


        {/* =========================
            PATIENT PROFILE
        ========================== */}

        <Route
          path="/profile"
          element={

            <ProtectedRoute>

              <Layout>

                <Profile />

              </Layout>

            </ProtectedRoute>

          }
        />


        {/* =========================
            NOTIFICATION CENTER
        ========================== */}

        <Route
          path="/notifications"
          element={

            <ProtectedRoute>

              <Layout>

                <Notifications />

              </Layout>

            </ProtectedRoute>

          }
        />


        {/* =========================
            RECEPTIONIST
        ========================== */}

        <Route
          path="/reception"
          element={
            <ReceptionistDashboard />
          }
        />


        {/* =========================
            ADMIN
        ========================== */}

        <Route
          path="/admin"
          element={
            <AdminDashboard />
          }
        />


        <Route
          path="/admin/hospitals"
          element={
            <HospitalManagement />
          }
        />


        <Route
          path="/admin/departments"
          element={
            <DepartmentManagement />
          }
        />


        <Route
          path="/admin/doctors"
          element={
            <DoctorManagement />
          }
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;