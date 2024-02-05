import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import dashboardRequest from "../api/dashboardRequest";

export default function Budgets() {
  const [progressPercentage, setProgressPercentage] = useState(0);
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
      <div className="flex justify-center m-2">
        <button className=" p-2 transition ease-in-out delay-50 bg-blue-500 text-white rounded-md hover:bg-indigo-500">
          Track a New Category
        </button>
      </div>
      <div className="m-auto h-1 w-1/2 bg-gray-300 rounded-full">
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
