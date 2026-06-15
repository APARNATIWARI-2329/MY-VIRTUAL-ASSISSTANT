import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { userDataContext } from "./context/userDataContext";

import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Customize from "./pages/Customize";
import Customize2 from "./pages/Customize2";

function App() {
  const { userData, loading } = useContext(userDataContext);

  if (loading) return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      <p className="text-white text-lg font-semibold tracking-wide animate-pulse">Loading...</p>
    </div>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          !userData ? (
            <Navigate to="/signin" />
          ) : userData?.assistantImage && userData?.assistantName ? (
            <Home />
          ) : (
            <Navigate to="/customize" />
          )
        }
      />

      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/" />}
      />

      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/" />}
      />

      <Route
        path="/customize"
        element={userData ? <Customize /> : <Navigate to="/signup" />}
      />

      <Route
        path="/customize2"
        element={userData ? <Customize2 /> : <Navigate to="/signup" />}
      />
    </Routes>
  );
}

export default App;
