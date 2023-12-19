import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaidLink } from "react-plaid-link";

import plaidCreateLinkTokenRequest from "../api/plaidCreateLinkTokenRequest";
import plaidSetAccessToken from "../api/plaidSetAccessToken";

import { TokenContext, UserContext } from "../App";
import dashboardRequest from "../api/dashboardRequest";

export default function Dashboard() {
  // const { JWTtoken, setJWTtoken } = useContext(TokenContext);
  const { user, setUser } = useContext(UserContext);
  const [linkToken, setLinkToken] = useState(null);

  const navigate = useNavigate();

  // Verify user is logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      dashboardRequest().then((data) => {
        if (data === "Unauthorized") {
          navigate("/");
          // Perhaps display a message saying the user is not logged in
        }
      });
    };
    checkLoggedIn();
  }, []);

  // Plaid logistics
  useEffect(() => {
    const createLinkToken = async () => {
      const response = await plaidCreateLinkTokenRequest(user);
      const { link_token } = await response;
      setLinkToken(link_token);
    };
    createLinkToken();
  }, []);

  const { open, ready } = usePlaidLink(
    {
      token: linkToken,
      onSuccess: (public_token, metadata) => {
        const setAccessToken = async () => {
          const response = await plaidSetAccessToken(public_token, user);
          const { access_token } = await response;
          console.log(access_token);
        };
        setAccessToken();
      },
    },
    []
  );

  return (
    <div>
      {user ? (
        <div className="text-center p-4">Hello, {user.firstName}</div>
      ) : null}
      <div className="flex justify-center items-center m-2 p-2">
        <button
          className=" p-2 transition ease-in-out delay-50 bg-blue-500 text-white rounded-md hover:bg-indigo-500"
          type="submit"
          onClick={() => open()}
        >
          Connect a Bank
        </button>
      </div>
    </div>
  );
}
