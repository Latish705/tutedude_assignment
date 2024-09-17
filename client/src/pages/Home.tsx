import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { backendUrl } from "../App";
import UserCard from "../components/card/UserCard";
import Dialog from "@mui/material/Dialog";
import { useDialog } from "../contexts/DialogContext";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material"; // Import CircularProgress for loading spinner

const Home = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [mutalFriends, setMutalFriends] = useState<any[]>([]);
  const [mutalHobbiesFriends, setMutalHobbiesFriends] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true); // State for loading

  const { open, setOpen } = useDialog();
  const [isFriend, setIsFriend] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true when fetching starts
      try {
        const [usersRes, friendsRes, mutualFriendsRes, mutualHobbiesRes] =
          await Promise.all([
            axios.get(`${backendUrl}/api/user/getall`, {
              headers: {
                Authorization: `Bearer ${Cookies.get("refreshToken")}`,
              },
            }),
            axios.get(`${backendUrl}/api/user/friends`, {
              headers: {
                Authorization: `Bearer ${Cookies.get("refreshToken")}`,
              },
            }),
            axios.get(
              `${backendUrl}/api/user/friend/recommendations/mutual-friends`,
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("refreshToken")}`,
                },
              }
            ),
            axios.get(
              `${backendUrl}/api/user/friend/recommendations/mutual-hobbies`,
              {
                headers: {
                  Authorization: `Bearer ${Cookies.get("refreshToken")}`,
                },
              }
            ),
          ]);

        if (usersRes.data.success) {
          if (usersRes.data.users) {
            setUsers(usersRes.data.users);
          }
        }
        if (friendsRes.data.success) {
          if (friendsRes.data.friendships) {
            setFriends(friendsRes.data.friendships.map((f: any) => f.friend));
          }
        }
        if (mutualFriendsRes.data.success) {
          if (mutualFriendsRes.data.recommendedFriends) {
            setMutalFriends(
              mutualFriendsRes.data.recommendedFriends.map((f: any) => f.friend)
            );
          }
        }
        if (mutualHobbiesRes.data.success) {
          if (mutualHobbiesRes.data.recommendedFriends) {
            setMutalHobbiesFriends(mutualHobbiesRes.data.recommendedFriends);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    try {
      const res = await axios.get(
        `${backendUrl}/api/user/search/${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("refreshToken")}`,
          },
        }
      );
      if (res.data.success) {
        setSelectedUser(res.data.user);
        // Check if the user is already a friend
        setIsFriend(res.data.friend);
        setOpen(true); // Show the dialog
      } else {
        toast.error("User not found");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Error searching users");
    }
  };

  const handleAddFriend = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/friend/add`,
        { friendId: selectedUser._id },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("refreshToken")}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("Friend added successfully");
        setIsFriend(true); // Update friendship status
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Error adding friend");
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/friend/remove/${selectedUser._id}`,
        { friendId: selectedUser._id },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("refreshToken")}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("Friend removed successfully");
        setIsFriend(false); // Update friendship status
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Error removing friend");
    }
  };

  const handleDialogClose = () => {
    setOpen(false); // Close the dialog using context
  };

  return (
    <div
      className={`container mx-auto p-4 overflow-scroll ${
        open ? "dark-overlay" : ""
      }`}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Overview</h1>

      {/* Search Input */}
      <div className="mb-6 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search for users..."
          className="w-full p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress />
        </div>
      ) : (
        <>
          {/* Users Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">All Users</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.length > 0 ? (
                users.map((u) => (
                  <div key={u._id}>
                    <UserCard
                      key={u._id}
                      id={u._id}
                      username={u.username}
                      hobbies={u.hobbies}
                      added={false}
                    />
                  </div>
                ))
              ) : (
                <p>No users found</p>
              )}
            </div>
          </section>

          {/* Recommended Friends with Mutual Friends */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              Recommended Friends (Mutual Friends)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mutalFriends.length > 0 ? (
                mutalFriends.map((u) => (
                  <div key={u._id}>
                    <UserCard
                      key={u._id}
                      id={u._id}
                      username={u.username}
                      hobbies={u.hobbies}
                      added={true}
                    />
                  </div>
                ))
              ) : (
                <p>No friends found</p>
              )}
            </div>
          </section>

          {/* Recommended Friends with Mutual Hobbies */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              Recommended Friends (Mutual Hobbies)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mutalHobbiesFriends.length > 0 ? (
                mutalHobbiesFriends.map((u) => (
                  <div key={u._id}>
                    <UserCard
                      key={u._id}
                      id={u._id}
                      username={u.username}
                      hobbies={u.hobbies}
                      added={true}
                    />
                  </div>
                ))
              ) : (
                <p>No friends found</p>
              )}
            </div>
          </section>

          {/* Friends Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Friend Users</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.length > 0 ? (
                friends.map((u) => (
                  <div key={u._id}>
                    <UserCard
                      key={u._id}
                      id={u._id}
                      username={u.username}
                      hobbies={u.hobbies}
                      added={true}
                    />
                  </div>
                ))
              ) : (
                <p>No friends found</p>
              )}
            </div>
          </section>

          {/* Dialog Box */}
          <Dialog open={open} onClose={handleDialogClose}>
            <div className="p-4">
              {selectedUser ? (
                <>
                  <h2>{selectedUser.username}</h2>
                  <p>Hobbies: {selectedUser.hobbies.join(", ")}</p>
                  <button
                    onClick={isFriend ? handleRemoveFriend : handleAddFriend}
                    className={`p-2 rounded ${
                      isFriend ? "bg-red-500" : "bg-green-500"
                    } text-white`}
                  >
                    {isFriend ? "Remove Friend" : "Add Friend"}
                  </button>
                </>
              ) : (
                <p>User not found</p>
              )}
              <button
                onClick={handleDialogClose}
                className="bg-gray-500 text-white p-2 rounded mt-4"
              >
                Close
              </button>
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Home;
