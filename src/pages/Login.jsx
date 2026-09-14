import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {

  // Store the email entered by the user
  const [email, setEmail] = useState("");

  // Store the password entered by the user
  const [password, setPassword] = useState("");

  // Used to move the user to another page
  const navigate = useNavigate();


  async function handleLogin(event) {

    // Prevent the browser from refreshing the page
    event.preventDefault();

    try {

      // Send login information to Spring Boot
      const response = await axios.post(
        "http://localhost:8080/auth/login",
        {
          email: email,
          password: password
        }
      );

      console.log("Login response:", response.data);


      // If login was successful
      if (response.data) {

        // Save patient information in browser
        localStorage.setItem(
          "patient",
          JSON.stringify(response.data)
        );

        alert("Login successful!");

        // Go to dashboard
        navigate("/dashboard");

      } else {

        // Login failed
        alert("Invalid email or password");

      }

    } catch (error) {

      console.error("Login error:", error);

      alert("Login failed. Please try again.");

    }
  }


  return (

    <div className="login-page">

      <div className="login-card">

        <h1>Welcome to QueueLess</h1>

        <p>Login to manage your queue</p>


        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />


          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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