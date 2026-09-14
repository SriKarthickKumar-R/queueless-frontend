import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const patient = localStorage.getItem("patient");

  if (!patient) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;