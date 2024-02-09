import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiXCircle } from "react-icons/hi";

import { UserContext } from "../App";
import LoadingSpinner from "./LoadingSpinner";
import CategoryDropdown from "./CategoryDropdown";

export default function TrackedCategory({
  option,
  prevTrackedCategory,
  setPrevTrackedCategory,
  prevBudgetAmount,
  setPrevBudgetAmount,
  onClose,
}) {
  const { user, setUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [trackedCategory, setTrackedCategory] = useState(
    prevTrackedCategory === null ? "" : prevTrackedCategory
  );
  const [budgetAmount, setBudgetAmount] = useState(prevBudgetAmount);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const updateTrackedCategory = () => {
    fetch(`${API_URL}/budget/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        trackedCategory,
        budgetAmount,
      }),
    }).then(() => {
      onClose();
      // Show loading symbol
      setIsLoading(true);
      setPrevTrackedCategory(trackedCategory);
      setPrevBudgetAmount(budgetAmount);
    });
  };

  if (isLoading) {
    // Show spinner
    return <LoadingSpinner />;
  } else if (option === "add") {
    return (
      <div className="before:absolute before:bg-gray-400  before:opacity-70 before:top-0 before:w-full before:h-full fixed inset-0 overflow-auto flex ">
        <div className="flex flex-col justify-center items-center relative bg-gray-50 dark:bg-gray-800 w-full max-w-lg m-auto p-8 rounded-lg z-10">
          <div className="text-center m-3">Select a category to track:</div>
          <CategoryDropdown transaction={{}} setModified={setTrackedCategory} />
          <div className="text-center m-3">
            How much money do you want to set for this category?
          </div>
          <input
            className="px-3 py-2 bg-green-50 dark:bg-green-900 whitespace-nowrap border rounded focus:outline-none focus:ring focus:border-blue-300"
            type="number"
            min={0}
            onChange={(e) => setBudgetAmount(e.target.value)}
          />
          <div className="flex justify-center gap-4 m-4">
            <button className="bg-gray-400 rounded-md p-2" onClick={onClose}>
              Cancel
            </button>
            <button
              className="bg-red-400 rounded-md p-2"
              onClick={updateTrackedCategory}
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
  } else if (option === "edit") {
    return (
      <div className="before:absolute before:bg-gray-400  before:opacity-70 before:top-0 before:w-full before:h-full fixed inset-0 overflow-auto flex ">
        <div className="flex flex-col justify-center items-center relative bg-gray-50 dark:bg-gray-800 w-full max-w-lg m-auto p-8 rounded-lg z-10">
          <div className="text-center m-3">
            Tracked Category: {prevTrackedCategory}
          </div>
          <div className="text-center m-3">
            How much money do you want to set for this category?
          </div>
          <input
            className="px-3 py-2 bg-green-50 dark:bg-green-900 whitespace-nowrap border rounded focus:outline-none focus:ring focus:border-blue-300"
            type="number"
            min={0}
            defaultValue={prevBudgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
          />
          <div className="flex justify-center gap-4 m-4">
            <button className="bg-gray-400 rounded-md p-2" onClick={onClose}>
              Cancel
            </button>
            <button
              className="bg-red-400 rounded-md p-2"
              onClick={updateTrackedCategory}
            >
              Save
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
