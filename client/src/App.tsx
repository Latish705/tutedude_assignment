import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/Signup";
import HomeLayout from "./layouts/HomeLayout";
import Home from "./pages/Home";
import ProtectRoute from "./services/ProtectRoute";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./pages/Profile";
import { Bounce, ToastContainer } from "react-toastify";
import FriendFeature from "./pages/Friends";

export const backendUrl = import.meta.env.VITE_BACKEND_URL as string;

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<HomeLayout />}>
          <Route element={<ProtectRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/friends" element={<FriendFeature />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  );
}

export default App;
