import { createContext, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Error from "./routes/Error";
import Home from "./routes/Home";
import Login from "./routes/LogIn";
import SignUp from "./routes/SignUp";
import Dashboard from "./routes/Dashboard";

export const TokenContext = createContext(null);

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      errorElement: <Error />,
      children: [
        // {
        //   path: "about",
        //   element: <About />,
        // },
        // {
        //   path: "blog",
        //   element: <Blog data={data} />,
        // },
      ],
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
    <TokenContext.Provider value={([token, setToken], [user, setUser])}>
      <RouterProvider router={router} />
    </TokenContext.Provider>
  );
}

export default App;
