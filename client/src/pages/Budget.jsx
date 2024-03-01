import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { HiPencilAlt, HiTrash } from "react-icons/hi";

import dashboardRequest from "../api/dashboardRequest";
import dashboardChartRequest from "../api/dashboardChartRequest";
import categoriesRequest from "../api/categoriesRequest";

import TrackedCategory from "../components/TrackedCategory";
import ConfirmDelete from "../components/ConfirmDelete";

export default function Budget() {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [trackedCategories, setTrackedCategories] = useState([]);
  const [editClicked, setEditClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [currentTrackedCategory, setCurrentTrackedCategory] = useState("");
  const [currentBudgetAmount, setCurrentBudgetAmount] = useState(0);
  const [isUpdated, setIsUpdated] = useState(false);
  const [selectedMonthNum, setSelectedMonthNum] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
      setIsUpdated(false);
    };

    getChartData();
  }, [isUpdated]);

  // Get tracked categories
  useEffect(() => {
    const getTrackedCategories = async () => {
      const response = await categoriesRequest();
      setTrackedCategories(response.budget.trackedCategories);
    };

    getTrackedCategories();
  }, [isUpdated]);

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
    <div className="w-3/4 mx-auto">
      {/* Transition for adding a tracked category */}
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
          <TrackedCategory
            option="add"
            currentTrackedCategory={null}
            setCurrentTrackedCategory={null}
            currentBudgetAmount={null}
            setCurrentBudgetAmount={null}
            onClose={() => {
              setButtonClicked(false);
              setIsUpdated(true);
            }}
          />
        </Transition>,
        document.body
      )}
      {/* Transition for editing a tracked category */}
      {createPortal(
        <Transition
          appear={true}
          show={editClicked}
          enter="transition duration-300 ease-in-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition duration-300 ease-in-out"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <TrackedCategory
            option="edit"
            currentTrackedCategory={currentTrackedCategory}
            setCurrentTrackedCategory={setCurrentTrackedCategory}
            currentBudgetAmount={currentBudgetAmount}
            setCurrentBudgetAmount={setCurrentBudgetAmount}
            onClose={() => {
              setEditClicked(false);
              setIsUpdated(true);
            }}
          />
        </Transition>,
        document.body
      )}
      <div className="text-xl mx-auto pt-4">
        {`${Intl.DateTimeFormat("en", { month: "long" }).format(
          new Date(selectedMonthNum.toString())
        )} ${selectedYear}`}
      </div>
      <div className="grid grid-cols-12 h-12 pt-2">
        {[...Array(12)].map((value, monthNum) => (
          <div
            key={monthNum + 1}
            className={`flex justify-center items-center w-full border-2 ${
              selectedMonthNum === monthNum + 1
                ? "bg-slate-200 dark:bg-slate-600"
                : null
            } ${
              monthNum + 1 <= selectedMonthNum &&
              new Date().getFullYear() === selectedYear
                ? "cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600"
                : "opacity-50"
            }`}
            onClick={() => setSelectedMonthNum(monthNum + 1)}
          >
            <div>
              {Intl.DateTimeFormat("en", { month: "long" })
                .format(new Date((monthNum + 1).toString()))
                .substring(0, 3)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center m-2 pt-2">
        <button
          className=" p-2 transition ease-in-out delay-50 bg-blue-500 text-white rounded-md hover:bg-indigo-500"
          onClick={() => {
            setButtonClicked(true);
          }}
        >
          Add a Category to Track
        </button>
      </div>
      <Transition
        appear={true}
        show={true}
        enter="transition duration-700 ease-in-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-700 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        {trackedCategories.map((trackedCategory) => {
          const total = chartData.find(
            (category) => category.category === trackedCategory.trackedCategory
          );
          if (total) {
            const percentage =
              (total.total / trackedCategory.budgetAmount) * 100;

            return (
              <div
                key={trackedCategory.trackedCategory}
                className="flex flex-col items-center"
              >
                <div className="w-full relative">
                  <div className="flex justify-between items-end pt-2">
                    <div className="pb-1">
                      {trackedCategory.trackedCategory}
                    </div>
                    <div className="pb-1 text-sm">
                      ${total.total.toFixed()} of $
                      {trackedCategory.budgetAmount}
                    </div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded-full">
                    <div
                      style={{
                        width: `${
                          isLoading ? 0 : percentage > 100 ? 100 : percentage
                        }%`,
                      }}
                      className={`flex justify-end items-center h-full ${
                        percentage < 80
                          ? "bg-green-600"
                          : percentage < 100
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      } transition-all duration-1000 ease-out rounded-full`}
                    ></div>
                  </div>
                  <div className="absolute top-4 -right-12 flex flex-col">
                    <div className="text-xs italic text-left pb-1.5">
                      ({percentage.toFixed()}%)
                    </div>
                    <div className="flex">
                      <button
                        onClick={() => {
                          setEditClicked(true);
                          setCurrentTrackedCategory(
                            trackedCategory.trackedCategory
                          );
                          setCurrentBudgetAmount(trackedCategory.budgetAmount);
                        }}
                      >
                        <HiPencilAlt
                          className="text-gray-400 hover:text-gray-600"
                          size={"20"}
                        />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteClicked(true);
                          setCurrentTrackedCategory(
                            trackedCategory.trackedCategory
                          );
                        }}
                      >
                        <HiTrash
                          className="text-gray-400 hover:text-gray-600"
                          size={"20"}
                        />
                      </button>
                      {currentTrackedCategory ===
                        trackedCategory.trackedCategory && (
                        <ConfirmDelete
                          show={deleteClicked}
                          accountID={null}
                          trackedCategory={currentTrackedCategory}
                          onClose={() => {
                            setDeleteClicked(false);
                            setIsUpdated(true);
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </Transition>
    </div>
  );
}
