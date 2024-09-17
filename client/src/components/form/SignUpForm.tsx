import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../App";
import { SignValidation } from "../../validations/SignValidations";
import { toast } from "react-toastify";

const hobbiesList = [
  "Reading",
  "Traveling",
  "Cooking",
  "Gaming",
  "Music",
  "Sports",
  "Coding",
  "Photography",
];

const SignUpForm = () => {
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]); // To store selected hobbies
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignValidation),
  });

  const handleHobbyChange = (hobby: string) => {
    setSelectedHobbies(
      (prev) =>
        prev.includes(hobby)
          ? prev.filter((h) => h !== hobby) // Remove hobby if unchecked
          : [...prev, hobby] // Add hobby if checked
    );
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = { ...data, hobbies: selectedHobbies };

      const res = await axios.post(`${backendUrl}/api/user/register`, formData);
      if (res.data.success) {
        toast.success("Signup Successfully");
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error: any) {
      toast.error("Sign Failed Try Again");
      console.error("Signup error:", error.message);
    }
  };

  const getErrorMessage = (error: any) => {
    if (error?.message) {
      return error.message;
    }
    return "Invalid value";
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-5 rounded-lg bg-transparent flex-col gap-4">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <input
            {...register("username")}
            placeholder="Username"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {getErrorMessage(errors.username)}
            </p>
          )}
        </div>

        <div className="mb-4">
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

        <div className="mb-4">
          <h4 className="font-bold mb-2">Select Hobbies</h4>
          {hobbiesList.map((hobby) => (
            <div key={hobby} className="mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value={hobby}
                  onChange={() => handleHobbyChange(hobby)} // Update state on change
                  className="mr-2"
                />
                {hobby}
              </label>
            </div>
          ))}
          {errors.hobbies && (
            <p className="text-red-500 text-sm mt-1">
              {getErrorMessage(errors.hobbies)}
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
        Already have an account?
        <Link className="text-primary px-2" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
};

export default SignUpForm;
