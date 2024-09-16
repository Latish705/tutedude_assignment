import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to={"/login"}></Navigate>;
};

export default ProtectRoute;
