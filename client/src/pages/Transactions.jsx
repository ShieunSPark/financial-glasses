import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Disclosure, Transition } from "@headlessui/react";

import { UserContext } from "../App";
import dashboardRequest from "../api/dashboardRequest";
import accountsRequest from "../api/accountsRequest";
import transactionsRequest from "../api/transactionsRequest";
import categoriesRequest from "../api/categoriesRequest";
import transactionPutRequest from "../api/transactionPutRequest";

import LoadingSpinner from "../components/LoadingSpinner";
import CategoryDropdown from "../components/CategoryDropdown";

export default function Transactions() {
  const { user, setUser } = useContext(UserContext);
  // Context for table?
  const [isLoading, setIsLoading] = useState(true);
  const [itemsAndAccounts, setItemsAndAccounts] = useState([]);
  const [accounts, setAccounts] = useState(["all"]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState("all");
  const [selectedTransactionID, setSelectedTransactionID] = useState("");
  const [selectedButton, setSelectedButton] = useState("");
  const [modifiedName, setModifiedName] = useState("");
  const [categories, setCategories] = useState([]);
  const [modifiedCategory, setModifiedCategory] = useState("");

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

  // Set up categories
  useEffect(() => {
    const getCategories = async () => {
      const response = await categoriesRequest();
      const fullList = [];
      response.budget.categories.map((category) => {
        fullList.push(category.primary.toUpperCase());
        category.detailed.map((detailed) => {
          fullList.push(detailed);
        });
      });
      setCategories(fullList);
    };

    getCategories();
  }, []);

  // Keep track of which account has been selected to view
  const selectAccount = (accountID) => {
    if (accountID === "all") {
      setSelectedAccountID("all");
    } else {
      setSelectedAccountID(accountID);
    }
  };

  const handleClickOutside = () => {
    setSelectedButton("");
  };

  // Shout out to Robin Wieruch for this resource
  // (https://www.robinwieruch.de/react-hook-detect-click-outside-component/)
  const useOutsideClick = (callback) => {
    const ref = useRef();

    useEffect(() => {
      const handleClick = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          callback();
        }
      };

      document.addEventListener("click", handleClick);

      return () => {
        document.removeEventListener("click", handleClick);
      };
    }, [ref]);

    return ref;
  };

  const selectedRef = useOutsideClick(handleClickOutside);

  const updateModifiedName = (e) => {
    setModifiedName(e.target.value);
  };

  // Update modifiedName and modifiedCategory for the transaction
  const save = (transactionID) => {
    transactionPutRequest(modifiedName, transactionID).then(async () => {
      setModifiedName("");
      const getTransactions = async () => {
        const response = await transactionsRequest();
        setTransactions(response.transactions);
        setIsLoading(false);
      };

      getTransactions();
    });
    setSelectedButton("");
  };

  // console.log(modifiedCategory);

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
        <div className="grid grid-cols-5 grid-rows-1 border-2 border-green-800 dark:border-green-600 h-majority m-4">
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
                    ? "bg-yellow-500 dark:bg-yellow-900"
                    : "bg-yellow-300 dark:bg-yellow-700 hover:bg-yellow-500  dark:hover:bg-yellow-900"
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
                      key={account.account_id + "/tab"}
                      enter="transition duration-200 ease-in-out delay-200"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                    >
                      <div
                        className={`flex flex-col justify-center items-center h-12 ${
                          selectedAccountID === account.account_id
                            ? "bg-yellow-500 dark:bg-yellow-900"
                            : "bg-yellow-300 dark:bg-yellow-700 hover:bg-yellow-500 dark:hover:bg-yellow-900"
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
                <table className="table-fixed w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400 ">
                  <thead className="h-12 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 uppercase sticky top-0">
                    <tr>
                      <th scope="col" className="w-2/12 px-6 py-3">
                        Date
                      </th>
                      <th scope="col" className="w-4/12 px-6 py-3">
                        Name
                      </th>
                      <th scope="col" className="w-3/12 px-6 py-3">
                        Category
                      </th>
                      <th scope="col" className="w-2/12 text-right px-6 py-3">
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="w-1/12 text-right px-6 py-3"
                      ></th>
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
                          .map((transaction) => {
                            // Attach ref to the row I CLICKED on, not the row I'm HOVERING over
                            const refProp =
                              selectedButton === transaction.transaction_id
                                ? { ref: selectedRef }
                                : {};
                            return (
                              <tr
                                key={transaction.transaction_id}
                                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 hover:dark:bg-gray-600"
                                onClick={
                                  selectedButton === transaction.transaction_id
                                    ? (e) => e.stopPropagation()
                                    : undefined
                                }
                                onMouseEnter={() =>
                                  setSelectedTransactionID(
                                    transaction.transaction_id
                                  )
                                }
                                onMouseLeave={() =>
                                  setSelectedTransactionID("")
                                }
                                {...refProp}
                              >
                                <td className="px-6 py-4 truncate">
                                  {`${
                                    new Date(transaction.date).getMonth() + 1
                                  }/${new Date(
                                    transaction.date
                                  ).getDate()}/${new Date(
                                    transaction.date
                                  ).getFullYear()}`}
                                </td>
                                {selectedButton ===
                                transaction.transaction_id ? (
                                  <td className="px-3 py-2">
                                    <input
                                      className="w-full px-3 py-2 bg-green-50 dark:bg-green-900 font-medium text-gray-900 dark:text-white whitespace-nowrap border rounded focus:outline-none focus:ring focus:border-blue-300"
                                      type="text"
                                      defaultValue={
                                        transaction.modifiedName
                                          ? transaction.modifiedName
                                          : transaction.name
                                      }
                                      onChange={updateModifiedName}
                                    />
                                  </td>
                                ) : (
                                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white truncate">
                                    {transaction.modifiedName
                                      ? transaction.modifiedName
                                      : transaction.name}
                                  </td>
                                )}
                                {selectedButton ===
                                transaction.transaction_id ? (
                                  <td className="px-3 py-2">
                                    <CategoryDropdown
                                      categories={categories}
                                      // setCategories={setCategories}
                                      transaction={transaction}
                                      setModifiedCategory={setModifiedCategory}
                                    />
                                  </td>
                                ) : (
                                  <td className="px-6 py-4 truncate">
                                    {!transaction.modifiedCategory
                                      ? transaction.plaidCategory.detailed
                                      : transaction.modifiedCategory.detailed}
                                  </td>
                                )}
                                {transaction.amount > 0 ? (
                                  <td className="text-right px-6 py-4">
                                    ${transaction.amount.toFixed(2)}
                                  </td>
                                ) : (
                                  <td className="text-green-500 dark:text-green-200 text-right px-6 py-4">
                                    -${transaction.amount.toFixed(2) * -1}
                                  </td>
                                )}
                                <td className="px-6 py-4">
                                  {selectedButton ===
                                  transaction.transaction_id ? (
                                    <button
                                      className="text-green-700 dark:text-green-400"
                                      onClick={() =>
                                        save(transaction.transaction_id)
                                      }
                                    >
                                      Save
                                    </button>
                                  ) : (
                                    <button
                                      className={`${
                                        selectedTransactionID ===
                                        transaction.transaction_id
                                          ? " "
                                          : "hidden "
                                      } text-blue-700 dark:text-blue-400`}
                                      onClick={() =>
                                        setSelectedButton(
                                          transaction.transaction_id
                                        )
                                      }
                                    >
                                      Edit
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                      : null}
                  </tbody>
                </table>
              </Transition>
            ))}
          </div>
        </div>
      </Transition>
    );
  }
}
