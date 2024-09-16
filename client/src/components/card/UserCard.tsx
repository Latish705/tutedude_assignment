import { useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import { FaPlus, FaMinus } from "react-icons/fa";
import { backendUrl } from "../../App";
import Cookies from "js-cookie";
import axios from "axios";

interface UserCardProps {
  key: string;
  id: string;
  username: string;
  hobbies: string[];
  added: boolean;
}

const UserCard = ({ id, username, hobbies, added }: UserCardProps) => {
  const onAdd = async () => {
    console.log(id);
    const res = await axios.post(
      `${backendUrl}/api/user/friend/add`,
      { friendId: id },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("refreshToken")}`,
        },
      }
    );
    if (res.data.success) {
      console.log("Friend added successfully");
    }
  };

  const onRemove = async () => {
    const res = await axios.delete(
      `${backendUrl}/api/user/friend/remove/${id}`,
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("refreshToken")}`,
        },
      }
    );
    console.log(res);
  };

  return (
    <div className="flex flex-col max-w-80 border p-4 rounded shadow">
      <div className="flex justify-between items-center">
        <CgProfile size={50} />
        <div className="flex gap-2">
          {!added && (
            <button
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              onClick={onAdd}
            >
              <FaPlus />
            </button>
          )}
          {added && (
            <button
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              onClick={onRemove}
            >
              <FaMinus />
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col mt-2">
        <h1 className="font-bold text-lg">{username}</h1>
        <div className="flex flex-wrap gap-2 mt-1">
          {hobbies.map((hobby) => (
            <span key={hobby} className="bg-gray-300 p-1 rounded">
              {hobby}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
