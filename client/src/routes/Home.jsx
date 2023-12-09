import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import homeRequest from "../api/homeRequest";
import logo from "../assets/fgLogo.svg";

export default function Home() {
  const [title, setTitle] = useState("");

  useEffect(() => {
    homeRequest().then((data) => {
      setTitle(data.message);
    });
  }, []);

  return (
    <div className="flex flex-col h-screen justify-center items-center p-5">
      <img src={logo} className="w-48" alt="Financial Glasses logo" />
      <h1 className="animate-pulse text-5xl p-2">{title}</h1>
      <h3 className="p-2">
        Continuing the budgeting app that Mint no longer is
      </h3>
      <div>
        <button className="transition ease-in-out delay-50 hover:scale-110 hover:bg-indigo-500 duration-100 rounded-md bg-blue-500 p-2 m-2">
          <Link to={`signup`}>Sign Up</Link>
        </button>
        <button className="transition ease-in-out delay-50 hover:scale-110 hover:bg-indigo-500 duration-100 rounded-md bg-blue-500 p-2 m-2">
          <Link to={`login`}>Log In</Link>
        </button>
      </div>
    </div>
  );
}

// export async function homeLoader() {
//   const res = await fetch(`${API_URL}/`, {
//     method: "GET",
//   });
//   const jsonRes = await res.json();
//   return jsonRes;
// }
