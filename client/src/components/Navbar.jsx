import { Link, Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";

import { TokenContext, UserContext } from "../App";
import logo from "../assets/fgLogo.svg";

export default function Navbar() {
  // const { JWTtoken, setJWTtoken } = useContext(TokenContext);
  const { user, setUser } = useContext(UserContext);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const logout = () => {
    fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => {
      navigate("/");
    });
  };

  return (
    <div>
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
          {/* <Link className="text-xl hover:text-blue-300">Profile</Link>
          <Link
            onClick={() => logout()}
            className="text-xl hover:text-blue-300"
          >
            Logout
          </Link> */}
          <button
            id="dropdownMenuIconButton"
            data-dropdown-toggle="dropdownDots"
            className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            type="button"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 4 15"
            >
              <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
          </button>
          <div
            id="dropdownDots"
            className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
          >
            <ul
              className="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownMenuIconButton"
            >
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Settings
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  Earnings
                </a>
              </li>
            </ul>
            <div className="py-2">
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
              >
                Separated link
              </a>
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
