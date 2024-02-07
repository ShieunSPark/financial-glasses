import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";

import dashboardRequest from "../api/dashboardRequest";
import AddTrackedCategory from "../components/AddTrackedCategory";

export default function Budget() {
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [buttonClicked, setButtonClicked] = useState(false);
  const navigate = useNavigate();

  // Verify user is logged in
  useEffect(() => {
    const verifyLoggedIn = async () => {
      dashboardRequest().then((data) => {
        if (data.error) {
          navigate("/");
          // Perhaps display a message saying the user is not logged in
        }
      });
    };
    verifyLoggedIn();
    setProgressPercentage(25);
  }, []);

  return (
    <div>
      {createPortal(
        <Transition
          appear={true}
          show={buttonClicked}
          enter="transition duration-300 ease-in-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition duration-300 ease-in-out"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <AddTrackedCategory onClose={() => setButtonClicked(false)} />
        </Transition>,
        document.body
      )}
      <div className="flex justify-center m-2">
        <button
          className=" p-2 transition ease-in-out delay-50 bg-blue-500 text-white rounded-md hover:bg-indigo-500"
          onClick={() => {
            setButtonClicked(true);
          }}
        >
          Add a Category to Track
        </button>
      </div>
      <div className="m-auto h-6 w-1/2 bg-gray-300 rounded-full">
        <div
          style={{ width: `${progressPercentage}%` }}
          className={`h-full ${
            progressPercentage < 70 ? "bg-green-600" : "bg-red-600"
          } transition-all duration-1000 ease-out rounded-full`}
        ></div>
      </div>
    </div>
  );
}
