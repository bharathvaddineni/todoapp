/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Container } from "@mui/material";
import GoogleButton from "react-google-button";
import { Link } from "react-router-dom";
import auth from "../redux/auth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import FilledInput from "@mui/material/FilledInput";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { updateRegisterInfo, registerUser } from "../redux/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { googleLogin } from "../redux/auth";

function SignUpForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const registerInfo = useSelector((state) => state.auth.registerInfo);
  const registerLoading = useSelector((state) => state.auth.registerLoading);
  const registerError = useSelector((state) => state.auth.registerError);
  const user = useSelector((state) => state.auth.user);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordMatch, setPasswordMatch] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(registerInfo.password === e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(registerInfo));
  };

  const handleGoogleSubmit = (e) => {
    e.preventDefault();
    dispatch(googleLogin());
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (registerError) {
      toast(registerError);
    }
  }, [registerError]);

  const allFieldsValid = () => {
    return (
      registerInfo.fname &&
      registerInfo.lname &&
      registerInfo.email &&
      passwordMatch
    );
  };
  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid
        item
        xs={12}
        md={8}
        sx={{ display: { xs: "none", md: "block" }, overflow: "hidden" }}
      >
        <Box
          component="img"
          sx={{
            width: "100%",
            objectFit: "cover",
            height: "100%",
            maxHeight: "100%",
          }}
          alt="Background"
          src="https://images.unsplash.com/photo-1598134493202-9a02529d86bb?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        />
      </Grid>
      <Grid item xs={12} md={4} sx={{ bgcolor: "white", px: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Sign Up
          </Typography>
          <TextField
            label="First Name"
            variant="outlined"
            fullWidth
            sx={{ my: 1 }}
            onChange={(e) =>
              dispatch(
                updateRegisterInfo({ ...registerInfo, fname: e.target.value })
              )
            }
          />
          <TextField
            label="Last Name"
            variant="outlined"
            fullWidth
            sx={{ my: 1 }}
            onChange={(e) =>
              dispatch(
                updateRegisterInfo({ ...registerInfo, lname: e.target.value })
              )
            }
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            sx={{ my: 1 }}
            onChange={(e) =>
              dispatch(
                updateRegisterInfo({ ...registerInfo, email: e.target.value })
              )
            }
          />
          <FormControl sx={{ m: 1, width: "100%" }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              Password
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? "text" : "password"}
              onChange={(e) =>
                dispatch(
                  updateRegisterInfo({
                    ...registerInfo,
                    password: e.target.value,
                  })
                )
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
          <FormControl sx={{ m: 1, width: "100%" }} variant="outlined">
            <InputLabel
              htmlFor="outlined-adornment-confirm-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            >
              Confirm Password
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              onChange={handleConfirmPasswordChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowConfirmPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirm Password"
            />
            {confirmPassword && !passwordMatch && (
              <FormHelperText error>Passwords do not match</FormHelperText>
            )}
          </FormControl>
          <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              disabled={!allFieldsValid()}
              onClick={(e) => handleSubmit(e)}
            >
              Sign Up
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Already have an account? <Link to={"/signin"}>Sign In</Link>
            </Typography>
          </Container>
          <Container
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "25px",
              justifyContent: "center",
              alignItems: "center",
              mt: "35px",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "red",
              }}
            >
              Or continue with Google
            </Typography>
            <GoogleButton onClick={(e) => handleGoogleSubmit(e)}/>
          </Container>
        </Box>
      </Grid>
      <ToastContainer />
    </Grid>
  );
}

export default SignUpForm;
