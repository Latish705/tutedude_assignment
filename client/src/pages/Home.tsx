import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { backendUrl } from "../App";
import UserCard from "../components/card/UserCard";
import Dialog from "@mui/material/Dialog";
import { useDialog } from "../contexts/DialogContext";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";

const Home = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [mutalFriends, setMutalFriends] = useState<any[]>([]);
  const [mutalHobbiesFriends, setMutalHobbiesFriends] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { open, setOpen } = useDialog();
  const [isFriend, setIsFriend] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
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
        if (friendsRes.data.friends) {
          setFriends(friendsRes.data.friends);
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

  useEffect(() => {
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
        setIsFriend(res.data.friend);
        setOpen(true);
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
        setIsFriend(true);
        fetchData();
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
        setIsFriend(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Error removing friend");
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full ">
              {users.length > 0 ? (
                users.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between w-full max-w-80"
                  >
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
                      added={false}
                    />
                  </div>
                ))
              ) : (
                <p>No friends found</p>
              )}
            </div>
          </section>

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
                      added={false}
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
              {selectedUser && (
                <>
                  <h2 className="text-xl font-semibold mb-2">
                    {selectedUser.username}
                  </h2>
                  <p className="mb-4">
                    Hobbies: {selectedUser.hobbies.join(", ")}
                  </p>
                  {isFriend ? (
                    <button
                      onClick={handleRemoveFriend}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Remove Friend
                    </button>
                  ) : (
                    <button
                      onClick={handleAddFriend}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Add Friend
                    </button>
                  )}
                </>
              )}
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default Home;
