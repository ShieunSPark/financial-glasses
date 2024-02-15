import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";

import { HiXCircle } from "react-icons/hi";

export default function ConfirmDelete({
  show,
  setIsLoading,
  accountID,
  accountName,
  itemName,
  trackedCategory,
  onClose,
}) {
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
      // Show loading symbol
      setIsLoading(true);
      onClose();

      navigate(0);
    });
  };

  const deleteTrackedCategory = () => {
    fetch(`${API_URL}/budget/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        trackedCategory,
      }),
    }).then(() => {
      // Show loading symbol
      setIsLoading(true);
      onClose();
      // navigate(0);
    });
  };

  if (accountID) {
    return createPortal(
      <Transition
        appear={true}
        show={show}
        enter="transition duration-300 ease-in-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-300 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className={"modal"}
      >
        <div className="before:absolute before:bg-gray-400  before:opacity-80 before:top-0 before:w-full before:h-full fixed inset-0 overflow-auto flex ">
          <div className="flex-col justify-center relative bg-gray-50 dark:bg-gray-800 w-full max-w-md m-auto p-8 rounded-lg z-10">
            <div className="text-center p-2">
              Are you sure you want to delete {accountName} from {itemName}?
            </div>
            <div className="flex justify-center gap-4">
              <button className="bg-gray-400 rounded-md p-2" onClick={onClose}>
                Cancel
              </button>
              <button
                className="bg-red-400 rounded-md p-2"
                onClick={deleteAccount}
              >
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
      </Transition>,
      document.body
    );
  } else if (trackedCategory) {
    return createPortal(
      <Transition
        appear={true}
        show={show}
        enter="transition duration-300 ease-in-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-300 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="before:absolute before:bg-gray-400  before:opacity-80 before:top-0 before:w-full before:h-full fixed inset-0 overflow-auto flex ">
          <div className="flex flex-col justify-center relative bg-gray-50 dark:bg-gray-800 w-full max-w-md m-auto p-8 rounded-lg z-10">
            <div className="text-center p-2">
              Are you sure you want to delete {`"${trackedCategory}"`}?
            </div>
            <div className="flex justify-center gap-4">
              <button className="bg-gray-400 rounded-md p-2" onClick={onClose}>
                Cancel
              </button>
              <button
                className="bg-red-400 rounded-md p-2"
                onClick={deleteTrackedCategory}
              >
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
      </Transition>,
      document.body
    );
  }
}
