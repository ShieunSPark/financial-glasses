import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaidLink } from "react-plaid-link";

import plaidCreateLinkTokenRequest from "../api/plaidCreateLinkTokenRequest";
import plaidSetAccessToken from "../api/plaidSetAccessToken";

import { TokenContext, UserContext } from "../App";
import dashboardRequest from "../api/dashboardRequest";
import accountsRequest from "../api/accountsRequest";

export default function Dashboard() {
  // const { JWTtoken, setJWTtoken } = useContext(TokenContext);
  const { user, setUser } = useContext(UserContext);
  const [linkToken, setLinkToken] = useState(null);
  const [itemName, setItemName] = useState("");
  const [accounts, setAccounts] = useState([]);

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
          setItemName(data.itemName);
        }
      });
    };
    verifyLoggedIn();
  }, []);

  // Generate Plaid link token
  useEffect(() => {
    const generateLinkToken = async () => {
      const response = await plaidCreateLinkTokenRequest(user);
      const { link_token } = await response;
      setLinkToken(link_token);
    };
    generateLinkToken();
  }, [user]);

  // Convert Plaid link token -> public token -> access token
  const { open, ready } = usePlaidLink(
    {
      token: linkToken,
      onSuccess: (public_token, metadata) => {
        const setAccessToken = async () => {
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
      setAccounts(response.accounts);
    };
    getAccounts();
  }, []);

  return (
    <div>
      {user ? (
        <div className="text-center pt-4">Hello, {user.firstName}</div>
      ) : null}
      {itemName ? (
        <div className="text-center pt-4">You are connected to {itemName}</div>
      ) : (
        <div className="text-center pt-4">
          You are not connected to any financial institution
        </div>
      )}
      <div className="flex justify-center items-center m-2 p-2">
        <button
          className=" p-2 transition ease-in-out delay-50 bg-blue-500 text-white rounded-md hover:bg-indigo-500"
          type="submit"
          onClick={() => open()}
        >
          Connect a Bank
        </button>
      </div>
      <div className="text-center pt-4">
        {accounts.map((account) => (
          <div key={account.account_id}>{account.name}</div>
        ))}
      </div>
    </div>
  );
}
