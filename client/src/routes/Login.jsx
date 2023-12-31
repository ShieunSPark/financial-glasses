import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { UserContext } from "../App";
import loginRequest from "../api/loginRequest";
import logo from "../assets/fgLogo.svg";
const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  // const { JWTtoken, setJWTtoken } = useContext(TokenContext);
  const { setUser } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const loginSubmit = (e) => {
    e.preventDefault();
    loginRequest(email, password)
      .then((data) => {
        if (data) {
          // setJWTtoken(data.token);
          setUser(data.user);
          navigate("/dashboard");
        }
      })
      .catch((err) => {
        // Handle the response from the server
        if (!err.error) {
          console.error(`HTTP error! Status: ${err.status}`);
          setError(err.errors);
        } else {
          // Handle other errors
          console.error("Authentication error:", err.message);

          // Access the error message from the JSON response
          setError(err.message || "Unknown authentication error");
        }
      });
  };

  const googleLogin = (e) => {
    e.preventDefault();
    window.open(API_URL + "/auth/google", "_self");
  };

  return (
    <section>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto">
        <Link to={`/`}>
          <img className="w-48 my-4" src={logo} alt="logo" />
        </Link>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 sm:p-8 space-y-4">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>
            <button
              className="flex w-full justify-center items-center gap-4 bg-slate-200 dark:bg-slate-600 hover:ring-2 hover:ring-blue-500 font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={googleLogin}
            >
              <img
                className="w-6 h-6"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                loading="lazy"
                alt="google logo"
              />
              <div>Continue with Google</div>
            </button>
            <div className="flex items-center gap-2">
              <hr className="h-0.5 w-1/2 my-2 bg-gray-100 border-0" />
              <div>OR</div>
              <hr className="h-0.5 w-1/2 my-2 bg-gray-100 border-0" />
            </div>
            {error ? <div className="text-red-400 m-0">{error}</div> : null}
            <form className="space-y-4" onSubmit={loginSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required=""
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required=""
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                      required=""
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="remember"
                      className="text-gray-500 dark:text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Forgot password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Sign in
              </button>
              <p className="text-sm text-center font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <Link
                  to={`/signup`}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
