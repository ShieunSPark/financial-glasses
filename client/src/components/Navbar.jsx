import { Fragment, useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { HiDotsVertical } from "react-icons/hi";

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

  // For dropdown menu
  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div>
      <nav className="flex justify-between items-center p-5 bg-emerald-100 dark:bg-emerald-900 ">
        <Link to={`/dashboard`}>
          <img className="w-16" src={logo} alt="Financial Glasses logo" />
        </Link>
        <div className="flex gap-x-10">
          <Link
            to={`/dashboard`}
            className="text-xl hover:text-blue-600 dark:hover:text-blue-300 duration-150"
          >
            Overview
          </Link>
          <Link
            to={`/transactions`}
            className="text-xl hover:text-blue-600 dark:hover:text-blue-300 duration-150"
          >
            Transactions
          </Link>
          <Link
            to={`/budgets`}
            className="text-xl hover:text-blue-600 dark:hover:text-blue-300 duration-150"
          >
            Budgets
          </Link>
        </div>
        <div className="flex w-[64px]">
          <Menu
            as="div"
            className="relative justify-end inline-block text-left ml-auto"
          >
            <div>
              <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-200">
                <HiDotsVertical
                  className="-mr-1 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-100"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => navigate("/profile")}
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block w-full px-4 py-2 text-left text-sm"
                        )}
                      >
                        Profile
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => logout()}
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block w-full px-4 py-2 text-left text-sm"
                        )}
                      >
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
