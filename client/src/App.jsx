import { createContext, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Error from "./components/Error";

import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Profile from "./pages/Profile";

export const TokenContext = createContext(null);
export const UserContext = createContext(null);

function App() {
  // const [JWTtoken, setJWTtoken] = useState(null);
  const [user, setUser] = useState(null);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      errorElement: <Error />,
    },
    {
      path: "/signup",
      element: <SignUp />,
      errorElement: <Error />,
    },
    {
      path: "/login",
      element: <Login />,
      errorElement: <Error />,
    },
    {
      element: <Navbar />,
      errorElement: <Error />,
      children: [
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/transactions",
          element: <Transactions />,
        },
        {
          path: "/budgets",
          element: <Budgets />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
      ],
    },
  ]);

  return (
    /* Not fully understanding how useContext() works in React led to 2 weeks of
     * me trying to debug JWT stuff because I thought passport-jwt wasn't working...
     * I'm not mad, you're mad
     */
    // <TokenContext.Provider value={{ JWTtoken, setJWTtoken }}>
    <UserContext.Provider value={{ user, setUser }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
    // </TokenContext.Provider>
  );
}

export default App;
