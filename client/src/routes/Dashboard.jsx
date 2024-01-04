import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { usePlaidLink } from "react-plaid-link";
import { HiX } from "react-icons/hi";

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
  const [isLoading, setIsLoading] = useState(true);
  const [linkToken, setLinkToken] = useState(null);
  const [numOfItems, setNumOfItems] = useState(0);
  const [itemsAndAccounts, setItemsAndAccounts] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");

  const navigate = useNavigate();

  // Verify user is logged in
  useEffect(() => {
    const verifyLoggedIn = async () => {
      dashboardRequest().then((data) => {
        if (data.error) {
          navigate("/");
          // Perhaps display a message saying the user is not logged in
        } else {
          setUser(data.user);
          setNumOfItems(data.numOfItems);
          // setIsLoading(false);

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

  useEffect(() => {
    const getAccounts = async () => {
      const response = await accountsRequest();
      setItemsAndAccounts(response.itemsAndAccounts);
    };

    getAccounts();
  }, []);

  useEffect(() => {
    const syncTransactions = async () => {
      transactionsSyncRequest().then(() => {
        setIsLoading(false);
      });
    };

    syncTransactions();
  }, []);

  if (isLoading) {
    // Show spinner
    return <LoadingSpinner />;
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
          {numOfItems === 0 ? (
            <button
              className=" p-2 transition ease-in-out delay-50 bg-blue-500 text-white rounded-md hover:bg-indigo-500"
              type="submit"
              onClick={() => open()}
            >
              Connect a Bank
            </button>
          ) : (
            <button
              className=" p-2 transition ease-in-out delay-50 bg-blue-500 text-white rounded-md hover:bg-indigo-500"
              type="submit"
              onClick={() => open()}
            >
              Connect Another Bank
            </button>
          )}
        </div>

        <div className="flex-col">
          {itemsAndAccounts
            ? itemsAndAccounts.map((entry) => (
                <>
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
                          <HiX className="w-6 h-6 text-red-400 hover:text-red-600" />
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
                </>
              ))
            : null}
        </div>
      </div>
    );
  }
}
