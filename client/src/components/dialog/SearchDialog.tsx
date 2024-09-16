import { CgProfile } from "react-icons/cg";
import { FaPlus, FaMinus } from "react-icons/fa";

interface SearchDialogProps {
  user: any;
  added: boolean;
  onAddRemove: (userId: string, action: "add" | "remove") => void;
  onClose: () => void;
}

const SearchDialog = ({
  user,
  added,
  onAddRemove,
  onClose,
}: SearchDialogProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <CgProfile size={50} />
          <button onClick={onClose} className="text-red-500 text-xl">
            &times;
          </button>
        </div>
        <h1 className="font-bold text-lg">{user.username}</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          {user.hobbies.map((hobby: string) => (
            <span key={hobby} className="bg-gray-300 p-1 rounded">
              {hobby}
            </span>
          ))}
        </div>
        <div className="mt-4">
          {!added ? (
            <button
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
              onClick={() => onAddRemove(user._id, "add")}
            >
              <FaPlus /> Add Friend
            </button>
          ) : (
            <button
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              onClick={() => onAddRemove(user._id, "remove")}
            >
              <FaMinus /> Remove Friend
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
