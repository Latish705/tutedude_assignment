import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
// import { login } from "../../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../../App";
// import { useAuth } from "../../contexts/AuthContext";
import { LoginValidation } from "../../validations/LoginValidations";

const LoginForm = () => {
  // const { login } = useAuth();

  const navigator = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginValidation),
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await axios.post(`${backendUrl}/api/customers/login`, data);
      if (res.data.success) {
        // dispatch(login(res.data));
        // login(res.data.accessToken, res.data.refreshToken);

        localStorage.setItem("isAdmin", res.data.customer.isAdmin);
        if (res.data.customer.isAdmin) {
          navigator("/admin/overview");
        } else {
          navigator("/");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      // Handle axios request error (e.g., show error message)
    }
  };

  const getErrorMessage = (error: any) => {
    if (typeof error === "string") {
      return error;
    }
    if (error && error.message) {
      return error.message;
    }
    return "Invalid value";
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-2 rounded-lg bg-transparent md:p-5 flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4 min-w-40 md:min-w-60 lg:min-w-80">
          <input
            {...register("username")}
            placeholder="Username"
            type="text"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {getErrorMessage(errors.username)}
            </p>
          )}
        </div>
        <div className="mb-4 min-w-40 md:min-w-60 lg:min-w-80">
          <input
            type="password"
            {...register("password")}
            placeholder="Password"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {getErrorMessage(errors.password)}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white p-2 rounded hover:bg-secondary"
        >
          Submit
        </button>
      </form>
      <p>
        Don't have an Account?
        <Link className="text-primary px-2" to="/signup">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
