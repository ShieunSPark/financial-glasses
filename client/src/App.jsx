import { createContext, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Error from "./routes/Error";
import Home from "./routes/Home";
import Login from "./routes/Login";
import SignUp from "./routes/SignUp";
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
      path: "/login",
      element: <Login />,
      errorElement: <Error />,
    },
    {
      path: "/signup",
      element: <SignUp />,
      errorElement: <Error />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
      errorElement: <Error />,
    },
  ]);

  return (
    <TokenContext.Provider value={{ JWTtoken, setJWTtoken }}>
      <UserContext.Provider value={{ user, setUser }}>
        <RouterProvider router={router} />
      </UserContext.Provider>
    </TokenContext.Provider>
  );
}

export default App;
