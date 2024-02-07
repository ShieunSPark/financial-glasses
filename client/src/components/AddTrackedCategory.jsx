import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiXCircle } from "react-icons/hi";

import { UserContext } from "../App";
import LoadingSpinner from "../components/LoadingSpinner";
import CategoryDropdown from "./CategoryDropdown";

export default function AddTrackedCategory({ onClose }) {
  const { user, setUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [trackedCategory, setTrackedCategory] = useState("");

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const addTrackedCategory = () => {
    fetch(`${API_URL}/budget/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        trackedCategory,
      }),
    }).then(() => {
      onClose();
      // Show loading symbol
      // setIsLoading(true);
      // navigate(0);
    });
  };

  if (isLoading) {
    // Show spinner
    return <LoadingSpinner />;
  } else {
    return (
      <div className="before:absolute before:bg-gray-400  before:opacity-70 before:top-0 before:w-full before:h-full fixed inset-0 overflow-auto flex ">
        <div className="flex-col justify-center relative bg-gray-50 dark:bg-gray-800 w-full max-w-md m-auto p-8 rounded-lg z-10">
          <div className="text-center m-4">Select a category to track:</div>
          <CategoryDropdown transaction={{}} setModified={setTrackedCategory} />
          <div className="flex justify-center gap-4 m-4">
            <button className="bg-gray-400 rounded-md p-2" onClick={onClose}>
              Cancel
            </button>
            <button
              className="bg-red-400 rounded-md p-2"
              onClick={addTrackedCategory}
            >
              Add
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
}
