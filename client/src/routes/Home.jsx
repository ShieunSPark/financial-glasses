import { Link } from "react-router-dom";

import logo from "../assets/fgLogo.svg";

export default function Home() {
  return (
    <div className="flex flex-col h-screen justify-center items-center p-5">
      <img src={logo} className="w-48" alt="Financial Glasses logo" />
      <h1 className="animate-pulse text-5xl p-2">Financial Glasses</h1>
      <h3 className="p-2">The budgeting app that Mint no longer is</h3>
      <div>
        <button className="transition ease-in-out delay-50 hover:scale-110 hover:bg-indigo-500 duration-100 rounded-md bg-blue-500 text-white p-2 m-2">
          <Link to={`signup`}>Sign Up</Link>
        </button>
        <button className="transition ease-in-out delay-50 hover:scale-110 hover:bg-indigo-500 duration-100 rounded-md bg-blue-500 text-white p-2 m-2">
          <Link to={`login`}>Log In</Link>
        </button>
      </div>
    </div>
  );
}
