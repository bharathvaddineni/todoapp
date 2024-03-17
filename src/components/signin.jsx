/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Container } from "@mui/material";
import GoogleButton from "react-google-button";
import { Link } from "react-router-dom";
import auth, { loginUser, updateLoginInfo } from "../redux/auth";
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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { googleLogin,updateLoginError } from "../redux/auth";

function SignInForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginInfo = useSelector((state) => state.auth.loginInfo);
  const loginLoading = useSelector((state) => state.auth.loginLoading);
  const loginError = useSelector((state) => state.auth.loginError);
  const user = useSelector((state) => state.auth.user);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(loginInfo));
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
    if (loginError) {
      toast(loginError);
      dispatch(updateLoginError())
    }
  }, [loginError,dispatch]);
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
            overflow: "hidden",
          }}
          alt="Background"
          src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
            Sign In
          </Typography>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            sx={{ my: 1 }}
            onChange={(e) =>
              dispatch(updateLoginInfo({ ...loginInfo, email: e.target.value }))
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
                  updateLoginInfo({ ...loginInfo, password: e.target.value })
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
              onClick={(e) => handleSubmit(e)}
            >
              Sign In
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Don't have an account? <Link to={"/signup"}>Register</Link>
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

export default SignInForm;
