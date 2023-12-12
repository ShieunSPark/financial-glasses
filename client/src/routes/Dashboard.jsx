import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

import { TokenContext, UserContext } from "../App";
import plaidCreateLinkTokenRequest from "../api/plaidCreateLinkTokenRequest";
import dashboardRequest from "../api/dashboardRequest";
import logo from "../assets/fgLogo.svg";

export default function Dashboard() {
  const { JWTtoken, setJWTtoken } = useContext(TokenContext);
  const { user, setUser } = useContext(UserContext);
  const [linkToken, setLinkToken] = useState(null);
  const [title, setTitle] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    dashboardRequest(JWTtoken).then((data) => {
      setTitle(data.title);
    });
  }, []);

  useEffect(() => {
    const createLinkToken = async () => {
      const response = await plaidCreateLinkTokenRequest();
      const { link_token } = await response;
      setLinkToken(link_token);
    };
    createLinkToken();
  }, []);

  const logout = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/logout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      const res = response.json();
      console.log(res);
      navigate("/");
    });
  };

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
      <div>{title}</div>
      <nav className="flex justify-between items-center p-5 bg-slate-100 dark:bg-slate-600 ">
        <Link to={`/dashboard`}>
          <img className="w-16" src={logo} alt="Financial Glasses logo" />
        </Link>
        <div className="flex gap-x-10">
          <Link to={`/dashboard`} className="text-xl hover:text-blue-300">
            Overview
          </Link>
          <Link className="text-xl hover:text-blue-300">Transactions</Link>
          <Link className="text-xl hover:text-blue-300">Budgets</Link>
        </div>
        <div className="flex gap-x-5">
          <Link className="text-xl hover:text-blue-300">Profile</Link>
          <Link
            onClick={() => logout()}
            className="text-xl hover:text-blue-300"
          >
            Logout
          </Link>
        </div>
      </nav>
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
