import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiXCircle } from "react-icons/hi";

import { UserContext } from "../App";

export default function Confirm({ onClose }) {
  const { user, setUser } = useContext(UserContext);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const deleteAccount = () => {
    fetch(`${API_URL}/account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => {
      navigate("/");
    });
  };

  return (
    <div className="before:absolute before:bg-gray-400  before:opacity-70 before:top-0 before:w-full before:h-full fixed inset-0 overflow-auto flex ">
      <div className="relative p-8 bg-gray-50 dark:bg-gray-800 w-full max-w-md m-auto flex justify-center rounded-lg z-10">
        <div className="w-full mx-0">
          Are you sure you want to delete this account?
        </div>
        <button className="bg-gray-400 rounded-md p-2">Cancel</button>
        <button className="bg-red-400 rounded-md p-2">Delete</button>
        <div className="absolute top-0 right-0 p-2">
          <button onClick={onClose}>
            <HiXCircle className="w-6 h-6 hover:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
