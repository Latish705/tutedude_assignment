import axios from "axios";
import { useEffect, useState } from "react";
import { backendUrl } from "../App";
import Cookies from "js-cookie";
import { CircularProgress } from "@mui/material"; // Import CircularProgress for loading spinner

interface UserData {
  username: string;
  hobbies: string[];
}

const Profile = () => {
  const [user, setUser] = useState<UserData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const refreshToken = Cookies.get("refreshToken");
        const userRes = await axios.get(`${backendUrl}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        setUser(userRes.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-80">
        <h1 className="text-2xl font-semibold text-gray-800">User Profile</h1>
        <h2 className="text-xl text-blue-600 mt-2">{user?.username}</h2>
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-700">Hobbies:</h3>
          <ul className="mt-2 space-y-2">
            {user?.hobbies?.map((hobby, index) => (
              <li key={index} className="bg-blue-100 p-2 rounded-md">
                {hobby}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile;
