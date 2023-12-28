import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiXCircle } from "react-icons/hi";

import { UserContext } from "../App";

export default function Confirm({ accountID, onClose }) {
  const { user, setUser } = useContext(UserContext);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const deleteAccount = () => {
    fetch(`${API_URL}/dashboard/account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        accountID,
      }),
    }).then(() => {
      onClose();
      navigate(0);
    });
  };

  return (
    <div className="before:absolute before:bg-gray-400  before:opacity-70 before:top-0 before:w-full before:h-full fixed inset-0 overflow-auto flex ">
      <div className="flex-col justify-center relative bg-gray-50 dark:bg-gray-800 w-full max-w-md m-auto p-8 rounded-lg z-10">
        <div className="text-center">
          Are you sure you want to delete this account?
        </div>
        <div className="flex justify-center">
          <button className="bg-gray-400 rounded-md p-2 mx-6" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-red-400 rounded-md p-2" onClick={deleteAccount}>
            Delete
          </button>
        </div>
        <div className="absolute top-0 right-0 p-2">
          <button onClick={onClose}>
            <HiXCircle className="w-6 h-6 hover:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
