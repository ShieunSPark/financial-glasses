import { Link } from "react-router-dom";
import { useContext, useState } from "react";

import { TokenContext } from "../App";
import logo from "../assets/fgLogo.svg";

export default function Dashboard() {
  const [user, setUser] = useContext(TokenContext);

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
      {user ? <div>Hello, {user.firstName}</div> : null}
    </div>
  );
}
