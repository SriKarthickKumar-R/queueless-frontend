import { useEffect, useState } from "react";
import axios from "axios";

function AppointmentBooking() {

  const API_URL = import.meta.env.VITE_API_URL;

  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Stores appointments already booked for selected doctor/date
  const [bookedAppointments, setBookedAppointments] = useState([]);

  // =========================================
  // AVAILABLE TIME SLOTS
  // =========================================

  const times = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00"
  ];

  // =========================================
  // GET LOGGED-IN PATIENT
  // =========================================

  const patient = JSON.parse(
    localStorage.getItem("patient")
  );

  // =========================================
  // LOAD HOSPITALS / DEPARTMENTS / DOCTORS
  // =========================================

  useEffect(() => {

    async function loadData() {

      try {

        const [
          hospitalsResponse,
          departmentsResponse,
          doctorsResponse
        ] = await Promise.all([

          axios.get(
            `${API_URL}/hospitals`
          ),

          axios.get(
            `${API_URL}/departments`
          ),

          axios.get(
            `${API_URL}/doctors`
          )

        ]);

        setHospitals(
          hospitalsResponse.data
        );

        setDepartments(
          departmentsResponse.data
        );

        setDoctors(
          doctorsResponse.data
        );

      } catch (error) {

        console.error(
          "Error loading appointment data:",
          error
        );

        alert(
          "Unable to load hospital information."
        );

      } finally {

        setLoading(false);

      }
    }

    loadData();

  }, []);

  // =========================================
  // LOAD BOOKED APPOINTMENTS
  // =========================================

  useEffect(() => {

    async function loadBookedAppointments() {

      // No doctor or date selected
      if (!selectedDoctorId || !date) {

        setBookedAppointments([]);

        return;
      }

      try {

        const response = await axios.get(
          `${API_URL}/appointments/doctor/${selectedDoctorId}/date/${date}`
        );

        console.log(
          "Appointments for selected date:",
          response.data
        );

        setBookedAppointments(
          response.data
        );

      } catch (error) {

        console.error(
          "Error loading appointment availability:",
          error
        );

        setBookedAppointments([]);

      }
    }

    loadBookedAppointments();

  }, [selectedDoctorId, date]);

  // =========================================
  // GET TODAY'S DATE
  // =========================================

  function getTodayDate() {

    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // =========================================
  // FILTER DEPARTMENTS
  // =========================================

  const filteredDepartments =
    departments.filter(
      (department) =>
        department.hospitalId ===
        Number(selectedHospitalId)
    );

  // =========================================
  // FILTER DOCTORS
  // =========================================

  const filteredDoctors =
    doctors.filter(
      (doctor) =>
        doctor.hospitalId ===
          Number(selectedHospitalId) &&
        doctor.departmentId ===
          Number(selectedDepartmentId)
    );

  // =========================================
  // WHEN HOSPITAL CHANGES
  // =========================================

  function handleHospitalChange(event) {

    const hospitalId =
      event.target.value;

    setSelectedHospitalId(
      hospitalId
    );

    setSelectedDepartmentId("");
    setSelectedDoctorId("");
    setDate("");
    setTime("");

    setBookedAppointments([]);
  }

  // =========================================
  // WHEN DEPARTMENT CHANGES
  // =========================================

  function handleDepartmentChange(event) {

    const departmentId =
      event.target.value;

    setSelectedDepartmentId(
      departmentId
    );

    setSelectedDoctorId("");
    setTime("");

    setBookedAppointments([]);
  }

  // =========================================
  // WHEN DOCTOR CHANGES
  // =========================================

  function handleDoctorChange(event) {

    const doctorId =
      event.target.value;

    setSelectedDoctorId(
      doctorId
    );

    setTime("");

    setBookedAppointments([]);
  }

  // =========================================
  // CHECK IF SLOT IS BOOKED
  // =========================================

  function isTimeBooked(timeSlot) {

    return bookedAppointments.some(
      (appointment) => {

        return (
          appointment.status === "CONFIRMED" &&
          appointment.appointmentTime &&
          appointment.appointmentTime.startsWith(
            timeSlot
          )
        );

      }
    );
  }

  // =========================================
  // BOOK APPOINTMENT
  // =========================================

  async function handleBooking(event) {

    event.preventDefault();

    if (!patient) {

      alert(
        "Please login before booking an appointment."
      );

      return;
    }

    if (
      !selectedHospitalId ||
      !selectedDepartmentId ||
      !selectedDoctorId ||
      !date ||
      !time
    ) {

      alert(
        "Please select hospital, department, doctor, date and time."
      );

      return;
    }

    // Extra frontend protection
    if (isTimeBooked(time)) {

      alert(
        "This time slot is already booked."
      );

      return;
    }

    setBooking(true);

    try {

      const appointmentData = {

        patientId:
          patient.id,

        hospitalId:
          Number(selectedHospitalId),

        departmentId:
          Number(selectedDepartmentId),

        doctorId:
          Number(selectedDoctorId),

        appointmentDate:
          date,

        appointmentTime:
          `${time}:00`

      };

      const response =
        await axios.post(
          `${API_URL}/appointments`,
          appointmentData
        );

      console.log(
        "Appointment created:",
        response.data
      );

      alert(
        "Appointment booked successfully!"
      );

      // Add newly booked appointment
      // to the current availability list
      setBookedAppointments(
        (previousAppointments) => [
          ...previousAppointments,
          response.data
        ]
      );

      setTime("");

    } catch (error) {

      console.error(
        "Error booking appointment:",
        error
      );

      if (
        error.response &&
        error.response.data
      ) {

        alert(
          error.response.data
        );

      } else {

        alert(
          "Unable to book appointment."
        );

      }

    } finally {

      setBooking(false);

    }
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="dashboard">

        <div className="login-card">

          <h2>
            Loading...
          </h2>

          <p>
            Loading hospitals, departments
            and doctors.
          </p>

        </div>

      </div>

    );
  }

  // =========================================
  // UI
  // =========================================

  return (

    <div className="dashboard">

      <h1>
        Book an Appointment 📅
      </h1>

      <p>
        Choose your hospital, department,
        doctor and preferred time.
      </p>

      <div className="login-card">

        <form
          onSubmit={handleBooking}
        >

          {/* HOSPITAL */}

          <label>
            Hospital
          </label>

          <select
            value={selectedHospitalId}
            onChange={handleHospitalChange}
          >

            <option value="">
              Select a hospital
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

          {/* DEPARTMENT */}

          <label>
            Department
          </label>

          <select
            value={selectedDepartmentId}
            onChange={handleDepartmentChange}
            disabled={!selectedHospitalId}
          >

            <option value="">

              {!selectedHospitalId
                ? "Select hospital first"
                : "Select a department"}

            </option>

            {filteredDepartments.map(
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

          {/* DOCTOR */}

          <label>
            Doctor
          </label>

          <select
            value={selectedDoctorId}
            onChange={handleDoctorChange}
            disabled={!selectedDepartmentId}
          >

            <option value="">

              {!selectedDepartmentId
                ? "Select department first"
                : "Select a doctor"}

            </option>

            {filteredDoctors.map(
              (doctor) => (

                <option
                  key={doctor.id}
                  value={doctor.id}
                >
                  {doctor.name}
                  {" - "}
                  {doctor.specialization}
                </option>

              )
            )}

          </select>

          {/* DATE */}

          <label>
            Date
          </label>

          <input
            type="date"
            min={getTodayDate()}
            value={date}
            onChange={(event) => {

              setDate(
                event.target.value
              );

              setTime("");

            }}
            disabled={!selectedDoctorId}
          />

          {/* TIME */}

          <label>
            Available Time
          </label>

          <select
            value={time}
            onChange={(event) =>
              setTime(
                event.target.value
              )
            }
            disabled={
              !selectedDoctorId ||
              !date
            }
          >

            <option value="">

              {!selectedDoctorId ||
              !date
                ? "Select doctor and date first"
                : "Select a time"}

            </option>

            {times.map(
              (timeSlot) => {

                const booked =
                  isTimeBooked(
                    timeSlot
                  );

                return (

                  <option
                    key={timeSlot}
                    value={timeSlot}
                    disabled={booked}
                  >

                    {timeSlot}

                    {booked
                      ? " - Booked 🔒"
                      : " - Available"}

                  </option>

                );

              }
            )}

          </select>

          {/* BOOK BUTTON */}

          <button
            type="submit"
            disabled={booking}
          >

            {booking
              ? "Booking..."
              : "Book Appointment"}

          </button>

        </form>

      </div>

    </div>

  );
}

export default AppointmentBooking;