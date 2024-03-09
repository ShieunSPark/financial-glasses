import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { HiPencilAlt, HiTrash } from "react-icons/hi";

import dashboardRequest from "../api/dashboardRequest";

import monthlySpendingRequest from "../api/monthlySpendingRequest";

import TrackedCategory from "../components/TrackedCategory";
import ConfirmDelete from "../components/ConfirmDelete";
import DashboardChart from "../components/DashboardChart";
import YearDropdown from "../components/YearDropdown";

export default function Budget() {
  const [isLoading, setIsLoading] = useState(true);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [trackedCategories, setTrackedCategories] = useState([]);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [editClicked, setEditClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [currentTrackedCategory, setCurrentTrackedCategory] = useState("");
  const [currentBudgetAmount, setCurrentBudgetAmount] = useState(0);
  const [isUpdated, setIsUpdated] = useState(true);
  // '0' = Jan, '1' = Feb, etc. Add 1 to it when displaying info to the user
  const [selectedMonthNum, setSelectedMonthNum] = useState(
    window.localStorage.getItem("monthNum")
      ? Number(window.localStorage.getItem("monthNum"))
      : new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState(
    window.localStorage.getItem("year")
      ? Number(window.localStorage.getItem("year"))
      : Number(new Date().getFullYear())
  );
  const [earliestMonthNum, setEarliestMonthNum] = useState(0);
  const [earliestYear, setEarliestYear] = useState(0);
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

  // // Get sums of each category from current month's transactions
  // useEffect(() => {
  //   const getChartData = async () => {
  //     const response = await dashboardChartRequest();
  //     setChartData(response.categoriesSum);
  //     setIsUpdated(false);
  //   };

  //   getChartData();
  // }, [isUpdated]);

  // Get all monthly spending
  useEffect(() => {
    const getMonthlySpending = async () => {
      const response = await monthlySpendingRequest();
      setMonthlySpending(response.budget.monthlySpending);
      setEarliestMonthNum(response.budget.monthlySpending[0].month);
      setEarliestYear(response.budget.monthlySpending[0].year);
      setIsUpdated(false);
    };

    if (isUpdated) getMonthlySpending();
  }, [isUpdated]);

  // Get currently tracked month's spending
  useEffect(() => {
    const getSelectedMonthSpending = async () => {
      const selected = monthlySpending.filter(
        (entry) =>
          entry.month === selectedMonthNum && entry.year === selectedYear
      );
      if (selected.length === 1) {
        setTrackedCategories(
          selected[0].categories.filter(
            (category) => category.isTracked === true
          )
        );
        setChartData(
          selected.length !== 0
            ? selected[0].categories
                .filter((category) => category.sum > 0)
                .map(({ name, sum, isTracked, budgetAmount }) => ({
                  name: name,
                  value: sum,
                }))
            : []
        );
      } else {
        setTrackedCategories([]);
        setChartData([]);
      }

      setIsLoading(true);
    };

    getSelectedMonthSpending();
  }, [isUpdated, monthlySpending, selectedMonthNum, selectedYear]);

  // Find earliest month and year within transactions

  // Delay to see bars fill up
  useEffect(() => {
    const delay = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds));
    const delayBudgetBarAnimation = async () => {
      await delay(250);
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
            setCurrentTrackedCategory={setCurrentTrackedCategory}
            currentBudgetAmount={null}
            setCurrentBudgetAmount={setCurrentBudgetAmount}
            selectedMonthNum={selectedMonthNum}
            selectedYear={selectedYear}
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
            selectedMonthNum={selectedMonthNum}
            selectedYear={selectedYear}
            onClose={() => {
              setEditClicked(false);
              setIsUpdated(true);
            }}
          />
        </Transition>,
        document.body
      )}
      <div className="flex justify-between items-center pt-4 h-16">
        <div className="text-xl">
          {`${Intl.DateTimeFormat("en", { month: "long" }).format(
            new Date((selectedMonthNum + 1).toString())
          )} ${selectedYear}`}
        </div>
        <YearDropdown
          earliestYear={earliestYear}
          selectedYear={Number(selectedYear)}
          setSelectedYear={setSelectedYear}
          earliestMonthNum={earliestMonthNum}
          selectedMonthNum={selectedMonthNum}
          setSelectedMonthNum={setSelectedMonthNum}
        />
      </div>
      <div className="grid grid-cols-12 h-12 pt-2">
        {[...Array(12)].map((value, monthNum) => (
          <div
            key={monthNum + 1}
            className={`flex justify-center items-center w-full border-2 ${
              selectedMonthNum === monthNum
                ? "bg-slate-200 dark:bg-slate-600"
                : null
            } ${
              (selectedYear < new Date().getFullYear() &&
                selectedYear > earliestYear) ||
              (selectedYear === new Date().getFullYear() &&
                monthNum <= new Date().getMonth()) ||
              (selectedYear === earliestYear && monthNum >= earliestMonthNum)
                ? "cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600"
                : "opacity-50"
            }`}
            onClick={
              (selectedYear < new Date().getFullYear() &&
                selectedYear > earliestYear) ||
              (selectedYear === new Date().getFullYear() &&
                monthNum <= new Date().getMonth()) ||
              (selectedYear === earliestYear && monthNum >= earliestMonthNum)
                ? () => {
                    setSelectedMonthNum(monthNum);
                    window.localStorage.setItem("monthNum", monthNum);
                  }
                : null
            }
          >
            <div>
              {Intl.DateTimeFormat("en", { month: "long" })
                .format(new Date((monthNum + 1).toString()))
                .substring(0, 3)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center pt-3">
        <DashboardChart data={chartData} />
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

      {trackedCategories.length === 0 ? (
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
          <div className="flex justify-center">
            No tracked categories for this month. Add a category via the button
            above!
          </div>
        </Transition>
      ) : (
        trackedCategories.map((trackedCategory) => {
          const total = trackedCategory.sum;

          const percentage = (total / trackedCategory.budgetAmount) * 100;

          return (
            <Transition
              key={trackedCategory.name}
              appear={true}
              show={true}
              enter="transition duration-700 ease-in-out"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition duration-700 ease-in-out"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="flex flex-col items-center">
                <div className="w-full relative">
                  <div className="flex justify-between items-end pt-2">
                    <div className="pb-1">{trackedCategory.name}</div>
                    <div className="pb-1 text-sm">
                      ${total.toFixed()} of ${trackedCategory.budgetAmount}
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
                          setCurrentTrackedCategory(trackedCategory.name);
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
                          setCurrentTrackedCategory(trackedCategory.name);
                        }}
                      >
                        <HiTrash
                          className="text-gray-400 hover:text-gray-600"
                          size={"20"}
                        />
                      </button>
                      {currentTrackedCategory === trackedCategory.name && (
                        <ConfirmDelete
                          show={deleteClicked}
                          setIsLoading={setIsLoading}
                          accountID={null}
                          accountName={null}
                          itemName={null}
                          trackedCategory={currentTrackedCategory}
                          selectedMonthNum={selectedMonthNum}
                          selectedYear={selectedYear}
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
            </Transition>
          );
        })
      )}
    </div>
  );
}
