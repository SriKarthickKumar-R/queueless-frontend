import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {

  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();


  async function handleLogin(event) {

    event.preventDefault();

    try {

      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: email,
          password: password
        }
      );

      console.log("Login response:", response.data);


      if (response.data) {

        // Save logged-in user
        localStorage.setItem(
          "patient",
          JSON.stringify(response.data)
        );

        // Save role separately
        localStorage.setItem(
          "userRole",
          response.data.role || "PATIENT"
        );

        alert("Login successful!");


        // Receptionist
        if (response.data.role === "RECEPTIONIST") {

          navigate("/receptionist");

        } else {

          // Normal patient
          navigate("/dashboard");

        }

      } else {

        alert("Invalid email or password");

      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      alert(
        "Login failed. Please try again."
      );
    }
  }


  return (

    <div className="login-page">

      <div className="login-card">

        <h1>
          Welcome to QueueLess
        </h1>

        <p>
          Login to manage your queue
        </p>


        <form onSubmit={handleLogin}>

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />


          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />


          <button type="submit">
            Login
          </button>

        </form>


        <p>
          Don't have an account?{" "}

          <Link to="/register">
            Create account
          </Link>

        </p>

      </div>

    </div>

  );
}

export default Login;