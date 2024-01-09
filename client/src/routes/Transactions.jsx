import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Disclosure, Transition } from "@headlessui/react";

import { UserContext } from "../App";
import dashboardRequest from "../api/dashboardRequest";
import accountsRequest from "../api/accountsRequest";
import transactionsRequest from "../api/transactionsRequest";

import LoadingSpinner from "../components/LoadingSpinner";

export default function Transactions() {
  const { user, setUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsAndAccounts, setItemsAndAccounts] = useState([]);
  const [accounts, setAccounts] = useState(["all"]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState("all");

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

  // Fetch all items and accounts for the user
  useEffect(() => {
    const getAccounts = async () => {
      const response = await accountsRequest();
      setItemsAndAccounts(response.itemsAndAccounts);
    };

    const getTransactions = async () => {
      const response = await transactionsRequest();
      setTransactions(response.transactions);
      setIsLoading(false);
    };

    getAccounts();
    getTransactions();
  }, []);

  // Initialize array of accounts
  useEffect(() => {
    if (itemsAndAccounts)
      itemsAndAccounts.forEach((item) => {
        item.accounts.forEach((account) => {
          if (!accounts.includes(account.account_id))
            setAccounts((prevAccounts) => [
              ...prevAccounts,
              account.account_id,
            ]);
        });
      });
  }, [itemsAndAccounts, accounts]);

  // Keep track of which account has been selected to view
  const selectAccount = (accountID) => {
    if (accountID === "all") {
      setSelectedAccountID("all");
    } else {
      setSelectedAccountID(accountID);
    }
  };

  if (isLoading) {
    // Show spinner
    return (
      <Transition
        appear={true}
        show={true}
        enter="transition duration-100 ease-in-out delay-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-100 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <LoadingSpinner />
      </Transition>
    );
  } else {
    return (
      <Transition appear={true} show={true}>
        <div className="grid grid-cols-5 grid-rows-1 border-2 border-green-500 h-majority m-4">
          {/* Tab for all accounts */}
          <div className="col-span-1 flex flex-col space-y-1">
            <Transition.Child
              enter="transition duration-200 ease-in-out delay-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
            >
              <div
                className={`flex justify-center items-center h-12 ${
                  selectedAccountID === "all"
                    ? "bg-yellow-600 dark:bg-yellow-900"
                    : "bg-yellow-400 dark:bg-yellow-700 hover:bg-yellow-600  dark:hover:bg-yellow-900"
                } text-center cursor-pointer`}
                onClick={() => selectAccount("all")}
              >
                All Accounts
              </div>
            </Transition.Child>
            {/* Logic for tabs of individual accounts */}
            {itemsAndAccounts
              ? itemsAndAccounts.map((entry) =>
                  entry.accounts.map((account) => (
                    <Transition.Child
                      key={account.account_id}
                      enter="transition duration-200 ease-in-out delay-200"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                    >
                      <div
                        className={`flex flex-col justify-center items-center h-12 ${
                          selectedAccountID === account.account_id
                            ? "bg-yellow-600 dark:bg-yellow-900"
                            : "bg-yellow-400 dark:bg-yellow-700 hover:bg-yellow-600 dark:hover:bg-yellow-900"
                        } text-center cursor-pointer`}
                        onClick={() => selectAccount(account.account_id)}
                      >
                        <div>{account.name}</div>
                        <div className="text-xs">{entry.item.name}</div>
                      </div>
                    </Transition.Child>
                  ))
                )
              : null}
          </div>
          {/* For each account, create a Transition as well as a table */}
          <div className="col-span-4 text-center h-full overflow-y-auto">
            {accounts.map((accountID) => (
              <Transition
                key={accountID}
                appear={true}
                show={accountID === selectedAccountID}
                enter="transition duration-200 ease-in-out delay-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition duration-200 ease-in-out"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <table className="table-auto w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 ">
                  <thead className="h-12 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      ? transactions
                          .filter((transaction) =>
                            accountID !== "all"
                              ? transaction.account.account_id === accountID
                              : true
                          )
                          .map((transaction) => (
                            <tr
                              key={transaction.transaction_id}
                              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                            >
                              <th
                                scope="row"
                                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                              >
                                {transaction.name}
                              </th>
                              <td className="text-center px-6 py-4 w-4">
                                <div className="text-right">
                                  {transaction.amount > 0
                                    ? `$${transaction.amount.toFixed(2)}`
                                    : `-$${transaction.amount.toFixed(2) * -1}`}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {transaction.category.primary}
                              </td>
                              <td className="px-6 py-4">
                                {transaction.date.substring(0, 10)}
                              </td>
                            </tr>
                          ))
                      : null}
                  </tbody>
                </table>
              </Transition>
            ))}
          </div>
        </div>
        {/*
        <>
          {itemsAndAccounts
            ? itemsAndAccounts.map((entry) => (
                <div key={entry.item.item_id} className="text-center pt-4 mx-6">
                  {entry.accounts.map((account) => (
                    <div key={account.account_id} className="py-2">
                      <Disclosure>
                        <Disclosure.Button className="w-full bg-green-100 dark:bg-green-800">
                          {account.name}
                        </Disclosure.Button>

                        <Transition
                          className="origin-top"
                          enter="transition duration-150 ease-in"
                          enterFrom="transform scale-y-50 opacity-0"
                          enterTo="transform scale-y-100 opacity-100"
                          leave="transition duration-150 ease-in"
                          leaveFrom="transform scale-y-100 opacity-100"
                          leaveTo="transform scale-y-50 opacity-0"
                        >
                          <Disclosure.Panel className="h-96 overflow-y-scroll">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                  <th scope="col" className="px-6 py-3">
                                    Name
                                  </th>
                                  <th scope="col" className="px-6 py-3">
                                    Amount
                                  </th>
                                  <th scope="col" className="px-6 py-3">
                                    Category
                                  </th>
                                  <th scope="col" className="px-6 py-3">
                                    Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {transactions
                                  ? transactions.map((transaction) => (
                                      <>
                                        <tr
                                          key={transaction.transaction_id}
                                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                        >
                                          <th
                                            scope="row"
                                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                                          >
                                            {transaction.name}
                                          </th>
                                          {transaction.amount > 0 ? (
                                            <td className="px-6 py-4">
                                              ${transaction.amount.toFixed(2)}
                                            </td>
                                          ) : (
                                            <td className="px-6 py-4">
                                              -$
                                              {transaction.amount.toFixed(2) *
                                                -1}
                                            </td>
                                          )}
                                          <td className="px-6 py-4">
                                            {transaction.category.primary}
                                          </td>
                                          <td className="px-6 py-4">
                                            {transaction.date.substring(0, 10)}
                                          </td>
                                        </tr>
                                      </>
                                    ))
                                  : null}
                              </tbody>
                            </table>
                          </Disclosure.Panel>
                        </Transition>
                      </Disclosure>
                    </div>
                  ))}
                </div>
              ))
            : null}
        </>
        */}
      </Transition>
    );
  }
}
