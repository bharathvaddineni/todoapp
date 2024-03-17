import React from "react";
import { AppBar, Toolbar, Typography, IconButton,Tooltip } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/auth";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import DeckIcon from '@mui/icons-material/Deck';
import { CalendarIcon } from "@mui/x-date-pickers";
import { Link } from "react-router-dom";

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const capitalize = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <div>
      <AppBar position="static" style={{ background: "#008080" }}>
        <Toolbar sx={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
        <Typography variant="h6" style={{ flexGrow: 1, color: "#FFD700" }}>
            {capitalize(user?.fname)} {capitalize(user?.lname)}
          </Typography>
          <Tooltip title="Home">
            <IconButton color="inherit">
            <Link to={'/'}> <DeckIcon style={{ color: "#FFD700" }} /> </Link>
            </IconButton>
          </Tooltip>
          <Tooltip title="Calendar">
            <IconButton color="inherit">
            <Link to={'/calendar'}> <CalendarIcon style={{ color: "#FFD700" }} /> </Link>
            </IconButton>
          </Tooltip>
          <Tooltip title="View Profile">
            <IconButton color="inherit" >
              <Link to={'/profile'}> <PersonIcon style={{ color: "#FFD700" }} /> </Link>
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon style={{ color: "#FFD700" }} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Navbar;
