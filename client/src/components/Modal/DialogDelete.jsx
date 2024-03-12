import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { HiXCircle } from "react-icons/hi";

import LoadingSpinner from "../Spinner/LoadingSpinner";

export default function DialogDelete({
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
      onClose();
      // Show loading symbol
      setIsLoading(true);
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
      onClose();
      // Show loading symbol
      setIsLoading(true);
      // navigate(0);
    });
  };

  if (accountID) {
    return (
      <Transition
        appear={true}
        show={show}
        enter="transition duration-300 ease-in-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-300 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        as={Fragment}
      >
        <Dialog onClose={onClose}>
          <div
            className="fixed inset-0 bg-gray-400 opacity-70"
            aria-hidden="true"
          />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <Dialog.Panel>
              <Dialog.Title>Delete account</Dialog.Title>
              <Dialog.Description className="text-center p-2">
                Are you sure you want to delete {accountName} from {itemName}?
              </Dialog.Description>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-gray-400 rounded-md p-2"
                  onClick={onClose}
                >
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
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    );
  } else if (trackedCategory) {
    return (
      <div className="before:absolute before:bg-gray-400  before:opacity-70 before:top-0 before:w-full before:h-full fixed inset-0 overflow-auto flex ">
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
    );
  }
}
