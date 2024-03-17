/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/navbar";
import SignInForm from "./components/signin";
import SignUpPage from "./components/signup";

function App() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user ) {
      navigate("/signin");
    }
  }, [user, navigate]);

  return (
    <div>
      {user && <Navbar />}
      
      {user ? <Outlet /> : (
        <>
          {location.pathname === "/signin" && <SignInForm />}
          {location.pathname === "/signup" && <SignUpPage />}
        </>
      )}
    </div>
  );
}

export default App;
