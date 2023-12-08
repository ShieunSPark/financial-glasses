import { Link, useLoaderData } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;
import logo from "../assets/fgLogo.svg";
import { useEffect } from "react";

export default function Home() {
  // const getHome = useLoaderData();

  useEffect(() => {
    const res = fetch(`${API_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      return response.json();
    });
    console.log(res);
  }, []);

  return (
    <div className="flex flex-col h-screen justify-center items-center p-5">
      <img src={logo} className="w-48" alt="Financial Glasses logo" />
      <h1 className="animate-pulse text-5xl p-2">Financial Glasses</h1>
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

// export const homeLoader = async () => {
//   const res = await fetch(`${API_URL}/`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   });
//   console.log(res);
//   return res.json();
// };
