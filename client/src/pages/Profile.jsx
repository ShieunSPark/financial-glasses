import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Transition } from "@headlessui/react";

import { UserContext } from "../App";
import profileRequest from "../api/profileRequest";

import LoadingSpinner from "../components/LoadingSpinner";

export default function Profile() {
  const { user, setUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Verify user is logged in
  useEffect(() => {
    const verifyLoggedIn = async () => {
      profileRequest().then((data) => {
        if (data.error) {
          navigate("/");
          // Perhaps display a message saying the user is not logged in
        } else {
          setUser(data.user);
          setIsLoading(false);
        }
      });
    };
    verifyLoggedIn();
  }, []);

  if (isLoading) {
    // Show spinner
    return (
      <Transition
        appear={true}
        show={true}
        enter="transition duration-100 ease-in-out delay-100"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-100 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <LoadingSpinner />
      </Transition>
    );
  } else {
    return (
      <div>
        <div className="text-center pt-4">First Name: {user.firstName}</div>
        <div className="text-center pt-4">Last Name: {user.lastName}</div>
        <div className="text-center pt-4">Status: {user.status}</div>
      </div>
    );
  }
}
