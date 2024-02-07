import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";

import dashboardRequest from "../api/dashboardRequest";
import dashboardChartRequest from "../api/dashboardChartRequest";
import categoriesRequest from "../api/categoriesRequest";

import AddTrackedCategory from "../components/AddTrackedCategory";

export default function Budget() {
  const [isLoading, setIsLoading] = useState(true);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [trackedCategories, setTrackedCategories] = useState([]);
  const [chartData, setChartData] = useState([]);

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
  }, []);

  // Get sums of each category from current month's transactions
  useEffect(() => {
    const getChartData = async () => {
      const response = await dashboardChartRequest();
      setChartData(response.categoriesSum);
    };

    getChartData();
  }, []);

  // Get tracked categories
  useEffect(() => {
    const getTrackedCategories = async () => {
      const response = await categoriesRequest();
      setTrackedCategories(response.budget.trackedCategories);
    };

    getTrackedCategories();
  }, []);

  useEffect(() => {
    const delay = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds));
    const delayBudgetBarAnimation = async () => {
      await delay(500);
      setIsLoading(false);
    };
    delayBudgetBarAnimation();
  }, [trackedCategories]);

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
      {trackedCategories.map((trackedCategory) => {
        console.log(trackedCategory);
        const percentage =
          (chartData.find(
            (category) => category.category === trackedCategory.trackedCategory
          ).total /
            trackedCategory.budgetAmount) *
          100;

        return (
          <div key={trackedCategory} className="flex flex-col items-center">
            <h5>{trackedCategory.trackedCategory}</h5>
            <div className="h-6 w-1/2 bg-gray-300 rounded-full">
              <div
                style={{
                  width: `${isLoading ? 0 : percentage}%`,
                }}
                className={`h-full ${
                  percentage < 90 ? "bg-green-600" : "bg-red-600"
                } transition-all duration-1000 ease-out rounded-full`}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
