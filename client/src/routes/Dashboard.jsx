import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

import { TokenContext } from "../App";
import plaidCreateLinkTokenRequest from "../api/plaidCreateLinkTokenRequest";
import dashboardRequest from "../api/dashboardRequest";
import logo from "../assets/fgLogo.svg";

export default function Dashboard() {
  const [JWTtoken, setJWTtoken] = useContext(TokenContext);
  const [user, setUser] = useContext(TokenContext);
  const [linkToken, setLinkToken] = useState(null);

  useEffect(() => {
    const createLinkToken = async () => {
      const response = await plaidCreateLinkTokenRequest();
      const { link_token } = await response;
      setLinkToken(link_token);
    };
    createLinkToken();
  }, []);

  // useEffect(() => {
  //   const getDashboard = async () => {
  //     const response = await dashboardRequest();
  //     console.log(`api GET dashboard: ${response}`);
  //   };
  //   getDashboard();
  // }, [JWTtoken]);

  const { open, ready } = usePlaidLink(
    {
      token: linkToken,
      onSuccess: (public_token, metadata) => {
        console.log(public_token, metadata);
      },
    },
    []
  );

  return (
    <div>
      <nav className="flex justify-between items-center p-5 bg-slate-600">
        <Link to={`/dashboard`}>
          <img className="w-16" src={logo} alt="Financial Glasses logo" />
        </Link>
        <div className="flex gap-x-10">
          <Link to={`/dashboard`} className="text-2xl hover:text-blue-300">
            Overview
          </Link>
          <Link className="text-2xl hover:text-blue-300">Transactions</Link>
          <Link className="text-2xl hover:text-blue-300">Budgets</Link>
        </div>
        <Link className="text-2xl hover:text-blue-300">Profile</Link>
      </nav>
      {user ? (
        <div className="text-center p-4">Hello, {user.firstName}</div>
      ) : null}
      <div className="flex justify-center items-center m-2 p-2">
        <button
          className=" p-2 transition ease-in-out delay-50 bg-blue-500 rounded-md hover:bg-indigo-500"
          type="submit"
          onClick={() => open()}
        >
          Connect a Bank
        </button>
      </div>
    </div>
  );
}
