import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const FriendFeature = () => {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/friend/requests`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("refreshToken")}`,
          },
        });
        console.log(res.data);
        if (res.data.success) {
          setPendingRequests(res.data.requests.map((u: any) => u.friend));
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        toast.error("Error fetching pending requests");
      }
    };

    fetchPendingRequests();
  }, []);

  const handleAcceptRequest = async (userId: string) => {
    try {
      console.log(userId);
      const res = await axios.post(
        `${backendUrl}/api/user/friend/requests/accept`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("refreshToken")}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("Friend request accepted");
        setPendingRequests(pendingRequests.filter((req) => req._id !== userId));
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Error accepting friend request");
    }
  };

  const handleRejectRequest = async (userId: string) => {
    try {
      console.log(userId);
      const res = await axios.post(
        `${backendUrl}/api/user/friend/requests/reject`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("refreshToken")}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("Friend request rejected");
        setPendingRequests(pendingRequests.filter((req) => req._id !== userId));
      }
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Error rejecting friend request");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Pending Friend Requests
      </h1>

      {pendingRequests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRequests.map((req) => (
            <div key={req._id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{req.username}</h2>
              <p>Hobbies: {req.hobbies.join(", ")}</p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleAcceptRequest(req._id)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectRequest(req._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">No pending friend requests</p>
      )}
    </div>
  );
};

export default FriendFeature;
