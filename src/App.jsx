/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import SignUpPage from "./components/signup";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "./redux/auth";
import { Button } from "@mui/material";
import Navbar from "./components/navbar";

function App() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, [user, navigate]);
  return (
    <div>
      {user && (
        <div>
           <Navbar />
        </div>
      )}

      <Outlet />
    </div>
  );
}

export default App;
