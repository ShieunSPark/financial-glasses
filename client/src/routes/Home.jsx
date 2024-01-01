import { Link } from "react-router-dom";

import logo from "../assets/fgLogo.svg";

export default function Home() {
  return (
    <div className="flex flex-col h-screen justify-center items-center p-5">
      <img src={logo} className="w-64" alt="Financial Glasses logo" />
      <h1 className="animate-pulse text-5xl p-2">Financial Glasses</h1>
      <h3 className="p-2">The budgeting app that Mint no longer is</h3>
      <div>
        <Link to={`signup`}>
          <button className="transition duration-200 ease-in-out delay-50  hover:bg-indigo-500 rounded-md bg-blue-500 text-white p-2 m-2">
            Sign Up
          </button>
        </Link>
        <Link to={`login`}>
          <button className="transition duration-200 ease-in-out delay-50  hover:bg-indigo-500  rounded-md bg-blue-500 text-white p-2 m-2">
            Log In
          </button>
        </Link>
      </div>
    </div>
  );
}
