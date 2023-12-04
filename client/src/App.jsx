import logo from "./assets/fgLogo.svg";

function App() {
  return (
    <>
      <div>
        <img src={logo} className="logo" alt="Financial Glasses logo" />
      </div>
      <h1 className="text-2xl text-center underline text-blue-500">
        Financial Glasses
      </h1>
      <h3 className="">What Mint wished it could be</h3>
    </>
  );
}

export default App;
