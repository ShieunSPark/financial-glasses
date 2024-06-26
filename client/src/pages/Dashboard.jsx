import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaidLink } from "react-plaid-link";
import { HiTrash } from "react-icons/hi";
import { Transition } from "@headlessui/react";

import { TokenContext, UserContext } from "../App";
import plaidCreateLinkTokenRequest from "../api/plaidCreateLinkTokenRequest";
import plaidSetAccessToken from "../api/plaidSetAccessToken";
import dashboardRequest from "../api/dashboardRequest";
import monthlySpendingRequest from "../api/monthlySpendingRequest";
import accountsRequest from "../api/accountsRequest";
import transactionsSyncRequest from "../api/transactionsSyncRequest";
import transactionsRequest from "../api/transactionsRequest";

import ConfirmDelete from "../components/Modal/ConfirmDelete";
// import DialogDelete from "../components/DialogDelete";
import LoadingSpinner from "../components/Spinner/LoadingSpinner";
import DashboardChart from "../components/Chart/DashboardChart";
import DashboardTable from "../components/Table/DashboardTable";

export default function Dashboard() {
  // const { JWTtoken, setJWTtoken } = useContext(TokenContext);
  const { user, setUser } = useContext(UserContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [linkToken, setLinkToken] = useState(null);
  const [numOfItems, setNumOfItems] = useState(0);
  const [itemsAndAccounts, setItemsAndAccounts] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAccountID, setSelectedAccountID] = useState("");
  const [selectedAccountName, setSelectedAccountName] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const navigate = useNavigate();

  // Convert Plaid link token -> public token -> access token
  const { open, ready } = usePlaidLink(
    {
      token: linkToken,
      onSuccess: (public_token, metadata) => {
        const setAccessToken = async () => {
          // Show loading symbol
          setIsLoading(true);
          await plaidSetAccessToken(public_token, user);
          navigate(0);
        };
        if (!isUpdateMode) {
          setAccessToken();
        }
      },
      onExit: (error, metadata) => {
        console.log(error, metadata);
      },
    },
    []
  );

  // Verify user is logged in
  useEffect(() => {
    const verifyLoggedIn = async () => {
      dashboardRequest().then((data) => {
        if (data.error) {
          navigate("/");
          // Perhaps display a message saying the user is not logged in
        } else {
          setIsLoggedIn(true);
          setUser(data.user);
          setNumOfItems(data.numOfItems);

          // Generate Plaid link token
          const generateLinkToken = async () => {
            const response = await plaidCreateLinkTokenRequest(data.user);
            const { link_token } = await response;
            setLinkToken(link_token);
          };
          generateLinkToken();
        }
      });
    };
    verifyLoggedIn();
  }, []);

  useEffect(() => {
    const getAccounts = async () => {
      const response = await accountsRequest();
      setItemsAndAccounts(response.itemsAndAccounts);
    };

    if (isLoggedIn) getAccounts();
  }, [isLoggedIn]);

  // Sync transactions, then update chart data
  useEffect(() => {
    const getChartData = async () => {
      const response = await monthlySpendingRequest();
      const currentMonthNum = new Date().getMonth();
      const currentYear = Number(new Date().getFullYear());

      const currentMonthSpending = response.budget.monthlySpending.filter(
        (entry) => entry.month === currentMonthNum && entry.year === currentYear
      );

      setChartData(
        currentMonthSpending.length !== 0
          ? currentMonthSpending[0].categories
              .filter((category) => category.sum > 0)
              .map(({ name, sum, isTracked, budgetAmount }) => ({
                name: name,
                value: sum,
              }))
          : []
      );
    };

    const getRecentTransations = async () => {
      const response = await transactionsRequest();
      setRecentTransactions(response.transactions.slice(0, 20));
      setIsLoading(false);
    };

    const syncTransactions = async () => {
      transactionsSyncRequest().then((data) => {
        getChartData();
        // If a bank item needs to be updated, change the link token
        if (data.linkTokenData) {
          console.log(`need to update: ${data.linkTokenData.link_token}`);
          setLinkToken(data.linkTokenData.link_token);
          setIsUpdateMode(true);
        }
        setIsLoading(false);
      });
    };

    if (isLoggedIn) {
      syncTransactions();
      getRecentTransations();
    }
  }, [isLoggedIn]);

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
    // Setting height to 'h-full' caused animation issues when deleting an account..
    // I hate coding T____T
    return (
      <div>
        {/* <DialogDelete
          show={showConfirm}
          setIsLoading={setIsLoading}
          accountID={selectedAccountID}
          accountName={selectedAccountName}
          itemName={selectedItem}
          trackedCategory={null}
          onClose={() => setShowConfirm(false)}
        /> */}
        <div className="grid grid-cols-3 h-4/5">
          <div id="accounts col-span-1">
            {numOfItems !== 1 ? (
              <div className="text-center pt-4">
                You are connected to {numOfItems} banks
              </div>
            ) : (
              <div className="text-center pt-4">
                You are connected to {numOfItems} bank
              </div>
            )}
            <div className="flex justify-center items-center m-2 p-2">
              <button
                className={`p-2 transition ease-in-out delay-50 ${
                  isUpdateMode
                    ? "bg-red-500 hover:bg-red-700"
                    : "bg-blue-500 hover:bg-indigo-500"
                } text-white rounded-md `}
                type="submit"
                onClick={() => open()}
              >
                {isUpdateMode
                  ? "Need to Update"
                  : numOfItems === 0
                  ? "Connect a Bank"
                  : "Connect Another Bank"}
              </button>
            </div>

            <div className="flex-col">
              {itemsAndAccounts
                ? itemsAndAccounts.map((entry) => (
                    <div key={entry.item.item_id}>
                      {entry.accounts.map((account) => (
                        <div
                          key={account.account_id}
                          className="relative w-3/4 p-2 mx-auto my-2 border-green-800 border-2"
                        >
                          <div className="flex justify-between">
                            <div>{account.name}</div>
                            <div>${account.balance}</div>
                          </div>
                          <div className="text-xs italic">
                            {entry.item.name}
                          </div>
                          <div className="absolute inset-y-4 -right-6">
                            <button
                              id={account.account_id}
                              onClick={() => {
                                setShowConfirm(true);
                                setSelectedAccountID(account.account_id);
                                setSelectedAccountName(account.name);
                                setSelectedItem(entry.item.name);
                              }}
                            >
                              <HiTrash className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                            </button>
                            {selectedAccountID === account.account_id && (
                              <ConfirmDelete
                                show={showConfirm}
                                setIsLoading={setIsLoading}
                                accountID={selectedAccountID}
                                accountName={selectedAccountName}
                                itemName={selectedItem}
                                trackedCategory={null}
                                selectedMonthNum={null}
                                selectedYear={null}
                                onClose={() => setShowConfirm(false)}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                : null}
            </div>
          </div>
          <div className="col-span-2 flex flex-col items-center">
            <h2 className="pt-4">{`This Month's Spending`}</h2>
            <DashboardChart data={chartData} width={"90%"} height={400} />
            <h2 className="pt-4">Most Recent Transactions</h2>
            <DashboardTable transactions={recentTransactions} />
          </div>
        </div>
      </div>
    );
  }
}
