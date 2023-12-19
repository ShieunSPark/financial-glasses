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
          <Link className="text-xl hover:text-blue-300">Profile</Link>
          <Link
            onClick={() => logout()}
            className="text-xl hover:text-blue-300"
          >
            Logout
          </Link>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
