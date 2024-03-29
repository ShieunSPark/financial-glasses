import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Transition } from "@headlessui/react";

import { UserContext } from "../App";
import dashboardRequest from "../api/dashboardRequest";
import accountsRequest from "../api/accountsRequest";
import transactionsRequest from "../api/transactionsRequest";
import transactionPutRequest from "../api/transactionPutRequest";

import LoadingSpinner from "../components/Spinner/LoadingSpinner";
import TransactionTable from "../components/Table/TransactionTable";

export default function Transactions() {
  const { user, setUser } = useContext(UserContext);
  // Context for table?
  const [isLoading, setIsLoading] = useState(true);
  const [itemsAndAccounts, setItemsAndAccounts] = useState([]);
  const [accounts, setAccounts] = useState(["all"]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccountID, setSelectedAccountID] = useState("all");
  const [highlightedTransaction, setHighlightedTransaction] = useState("");
  const [selectedButton, setSelectedButton] = useState("");
  const [modifiedName, setModifiedName] = useState("");
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

  // Update modifiedName and modifiedCategory for the transaction
  const save = (transactionID) => {
    transactionPutRequest(modifiedName, modifiedCategory, transactionID).then(
      async () => {
        setModifiedName("");
        setModifiedCategory("");
        const getTransactions = async () => {
          const response = await transactionsRequest();
          setTransactions(response.transactions);
          setIsLoading(false);
        };

        getTransactions();
      }
    );
    setSelectedButton("");
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
      <Transition appear={true} show={true} className={""}>
        <div className="grid grid-cols-5 border-2 border-green-800 dark:border-green-600 m-4">
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
          {/* For each account, create a table */}
          <div className="col-span-4 text-center">
            {accounts.map((account) => (
              <TransactionTable
                key={account}
                show={selectedAccountID === account}
                transactions={transactions.filter((transaction) =>
                  selectedAccountID !== "all"
                    ? transaction.account.account_id === account
                    : true
                )}
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
                selectedRef={selectedRef}
                highlightedTransaction={highlightedTransaction}
                setHighlightedTransaction={setHighlightedTransaction}
                setModifiedName={setModifiedName}
                setModifiedCategory={setModifiedCategory}
                save={save}
              />
            ))}
          </div>
        </div>
      </Transition>
    );
  }
}
