import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Profile() {

  // =========================================
  // PATIENT STATE
  // =========================================

  const [patient, setPatient] = useState(null);

  // =========================================
  // FORM STATE
  // =========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // =========================================
  // UI STATE
  // =========================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // =========================================
  // LOAD PROFILE
  // =========================================

  useEffect(() => {
    loadProfile();
  }, []);


  // =========================================
  // GET PATIENT FROM BACKEND
  // =========================================

  async function loadProfile() {

    const savedPatient =
      JSON.parse(
        localStorage.getItem("patient")
      );

    if (!savedPatient) {

      setError(
        "Patient information not found."
      );

      setLoading(false);

      return;
    }


    try {

      const response =
        await axios.get(
          `${API_URL}/patients/${savedPatient.id}`
        );


      const patientData =
        response.data;


      setPatient(patientData);


      setName(
        patientData.name || ""
      );

      setEmail(
        patientData.email || ""
      );

      setPhone(
        patientData.phone || ""
      );


    } catch (err) {

      console.error(
        "Error loading profile:",
        err
      );

      setError(
        "Unable to load your profile."
      );

    } finally {

      setLoading(false);

    }

  }


  // =========================================
  // SAVE PROFILE
  // =========================================

  async function handleSave(event) {

    event.preventDefault();

    setMessage("");
    setError("");


    // NAME VALIDATION

    if (!name.trim()) {

      setError(
        "Please enter your name."
      );

      return;
    }


    // EMAIL VALIDATION

    if (!email.trim()) {

      setError(
        "Please enter your email."
      );

      return;
    }


    // PHONE VALIDATION

    if (!phone.trim()) {

      setError(
        "Please enter your phone number."
      );

      return;
    }


    setSaving(true);


    try {

      const response =
        await axios.put(
          `${API_URL}/patients/${patient.id}`,
          {
            name: name,
            email: email,
            phone: phone
          }
        );


      // Update React state

      setPatient(
        response.data
      );


      // Update localStorage

      localStorage.setItem(
        "patient",
        JSON.stringify(response.data)
      );


      setMessage(
        "Profile updated successfully!"
      );


    } catch (err) {

      console.error(
        "Error updating profile:",
        err
      );


      if (
        err.response &&
        err.response.data
      ) {

        setError(
          typeof err.response.data === "string"
            ? err.response.data
            : "Unable to update profile."
        );

      } else {

        setError(
          "Unable to update profile."
        );

      }

    } finally {

      setSaving(false);

    }

  }


  // =========================================
  // LOADING SCREEN
  // =========================================

  if (loading) {

    return (

      <div className="profile-page">

        <div className="profile-loading">

          <div className="profile-loading-icon">
            ⏳
          </div>

          <h2>
            Loading your profile...
          </h2>

          <p>
            Please wait.
          </p>

        </div>

      </div>

    );

  }


  // =========================================
  // PAGE
  // =========================================

  return (

    <div className="profile-page">


      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="profile-header">

        <div>

          <h1>
            My Profile 👤
          </h1>

          <p>
            Manage your personal information.
          </p>

        </div>

      </div>


      {/* ===================================== */}
      {/* PROFILE CARD */}
      {/* ===================================== */}

      <div className="profile-card">


        {/* PROFILE HEADER */}

        <div className="profile-card-header">

          <div className="large-profile-avatar">

            {name
              ? name.charAt(0).toUpperCase()
              : "P"}

          </div>


          <div>

            <h2>
              {name || "Patient"}
            </h2>

            <p>
              Patient Account
            </p>

          </div>

        </div>


        {/* SUCCESS MESSAGE */}

        {message && (

          <div className="profile-success">

            ✓ {message}

          </div>

        )}


        {/* ERROR MESSAGE */}

        {error && (

          <div className="profile-error">

            ⚠️ {error}

          </div>

        )}


        {/* FORM */}

        <form
          className="profile-form"
          onSubmit={handleSave}
        >


          {/* NAME */}

          <div className="profile-form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your full name"
            />

          </div>


          {/* EMAIL */}

          <div className="profile-form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
            />

          </div>


          {/* PHONE */}

          <div className="profile-form-group">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="Enter your phone number"
            />

          </div>


          {/* PASSWORD INFORMATION */}

          <div className="profile-info-box">

            <span>
              🔒
            </span>

            <div>

              <strong>
                Password
              </strong>

              <p>
                Your password is securely stored.
                Password management will be added
                separately.
              </p>

            </div>

          </div>


          {/* SAVE BUTTON */}

          <div className="profile-form-actions">

            <button
              type="submit"
              className="profile-save-button"
              disabled={saving}
            >

              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default Profile;