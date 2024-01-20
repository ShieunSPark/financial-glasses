import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { usePlaidLink } from "react-plaid-link";
import { HiTrash } from "react-icons/hi";
import { Transition } from "@headlessui/react";

import { TokenContext, UserContext } from "../App";
import plaidCreateLinkTokenRequest from "../api/plaidCreateLinkTokenRequest";
import plaidSetAccessToken from "../api/plaidSetAccessToken";
import dashboardRequest from "../api/dashboardRequest";
import accountsRequest from "../api/accountsRequest";
import transactionsSyncRequest from "../api/transactionsSyncRequest";

import Confirm from "../components/Confirm";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  // const { JWTtoken, setJWTtoken } = useContext(TokenContext);
  const { user, setUser } = useContext(UserContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [linkToken, setLinkToken] = useState(null);
  const [numOfItems, setNumOfItems] = useState(0);
  const [itemsAndAccounts, setItemsAndAccounts] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");

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
        setAccessToken();
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

  useEffect(() => {
    const syncTransactions = async () => {
      transactionsSyncRequest().then(() => {
        setIsLoading(false);
      });
    };

    if (isLoggedIn) syncTransactions();
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
    return (
      <div>
        {/* {user ? (
        <div className="text-center pt-4">Hello, {user.firstName}</div>
      ) : null} */}
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
            className=" p-2 transition ease-in-out delay-50 bg-blue-500 text-white rounded-md hover:bg-indigo-500"
            type="submit"
            onClick={() => open()}
          >
            {numOfItems === 0 ? "Connect a Bank" : "Connect Another Bank"}
          </button>
        </div>

        <div className="flex-col">
          {itemsAndAccounts
            ? itemsAndAccounts.map((entry) => (
                <div key={entry.item.item_id}>
                  {entry.accounts.map((account) => (
                    <div
                      key={account.account_id}
                      className="relative w-1/2 p-2 mx-auto my-2 border-green-800 border-2"
                    >
                      <div className="flex justify-between">
                        <div>{account.name}</div>
                        <div>${account.balance}</div>
                      </div>
                      <div className="text-xs italic">{entry.item.name}</div>
                      <div className="absolute inset-y-4 -right-8">
                        <button
                          id={account.account_id}
                          onClick={() => {
                            setShowConfirm(true);
                            setSelectedAccount(account.account_id);
                          }}
                        >
                          <HiTrash className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                        </button>

                        {showConfirm &&
                          selectedAccount === account.account_id &&
                          createPortal(
                            <Confirm
                              accountID={account.account_id}
                              onClose={() => setShowConfirm(false)}
                            />,
                            document.body
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            : null}
        </div>
      </div>
    );
  }
}
