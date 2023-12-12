import { createContext, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Error from "./routes/Error";
import Home from "./routes/Home";
import SignUp from "./routes/SignUp";
import Login from "./routes/Login";
import Dashboard from "./routes/Dashboard";

export const TokenContext = createContext(null);
export const UserContext = createContext(null);

function App() {
  const [JWTtoken, setJWTtoken] = useState(null);
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
      path: "/dashboard",
      element: <Dashboard />,
      errorElement: <Error />,
    },
  ]);

  return (
    /* Not fully understanding how useContext() works in React led to 2 weeks of
     * me trying to debug JWT stuff because I thought passport-jwt wasn't working...
     * I'm not mad, you're mad
     */
    <TokenContext.Provider value={{ JWTtoken, setJWTtoken }}>
      <UserContext.Provider value={{ user, setUser }}>
        <RouterProvider router={router} />
      </UserContext.Provider>
    </TokenContext.Provider>
  );
}

export default App;
