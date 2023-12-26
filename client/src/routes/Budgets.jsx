import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import dashboardRequest from "../api/dashboardRequest";

export default function Budgets() {
  const navigate = useNavigate();

  // Verify user is logged in
  useEffect(() => {
    const verifyLoggedIn = async () => {
      dashboardRequest().then((data) => {
        if (data.error) {
          navigate("/");
          // Perhaps display a message saying the user is not logged in
        }
      });
    };
    verifyLoggedIn();
  }, []);

  return <div>Budgets</div>;
}
