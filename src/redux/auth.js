import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { auth, db } from "../firebase/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (registerInfo, { rejectWithValue }) => {
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        registerInfo.email,
        registerInfo.password
      );
      try {
        await addDoc(collection(db, "users"), {
          uid: res.user.uid,
          email: res.user.email,
          fname: registerInfo.fname,
          lname: registerInfo.lname,
          address: "",
          dateOfBirth: "",
          github: "",
          linkedin: "",
          language: "English",
          profilePic: "",
          mobileNumber: "",
          provider: "email",
        });
      } catch (e) {
        console.error("Error adding document: ", e);
      }
      return {
        uid: res.user.uid,
        email: res.user.email,
        fname: registerInfo.fname,
        lname: registerInfo.lname,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (_, { rejectWithValue }) => {
    try {
      const googleProvider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, googleProvider);
      const lastSpaceIndex = res.user.displayName.lastIndexOf(" ");
      try {
        const userRef = collection(db, "users");
        const querySnapshot = await getDocs(
          query(userRef, where("email", "==", res.user.email))
        );
        if (querySnapshot.size === 0) {
          await addDoc(collection(db, "users"), {
            uid: res.user.uid,
            email: res.user.email,
            fname: res.user.displayName.substring(0, lastSpaceIndex),
            lname: res.user.displayName.substring(lastSpaceIndex + 1),
            address: "",
            dateOfBirth: "",
            github: "",
            linkedin: "",
            language: "English",
            profilePic: "",
            mobileNumber: "",
            provider: "google.com",
          });
        }
      } catch (e) {
        console.error("Error adding document: ", e);
      }
      return {
        uid: res.user.uid,
        email: res.user.email,
        fname: res.user.displayName.substring(0, lastSpaceIndex),
        lname: res.user.displayName.substring(lastSpaceIndex + 1),
      };
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        return rejectWithValue(
          "Please login with your Gmail account and password."
        );
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (loginInfo, { rejectWithValue }) => {
    try {
      let data;
      const res = await signInWithEmailAndPassword(
        auth,
        loginInfo.email,
        loginInfo.password
      );
      try {
        const userRef = collection(db, "users");
        const querySnapshot = await getDocs(
          query(userRef, where("email", "==", res.user.email))
        );
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            data = doc.data();
          });
        }
      } catch (e) {
        console.error("Error adding document: ", e);
      }
      return data;
    } catch (error) {
      console.log("error.messageL ", error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      localStorage.removeItem("User");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    registerError: null,
    registerLoading: false,
    registerInfo: {
      fname: "",
      lname: "",
      email: "",
      password: "",
    },
    loginError: null,
    loginLoading: false,
    loginInfo: {
      email: "",
      password: "",
    },
    logoutError: null,
  },
  reducers: {
    updateRegisterInfo: (state, action) => {
      state.registerInfo = action.payload;
    },
    updateLoginInfo: (state, action) => {
      state.loginInfo = action.payload;
    },
    updateRegisterError: (state) => {
      state.registerError = null;
    },
    updateLoginError: (state) => {
      state.loginError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.user = action.payload;
        localStorage.setItem("User", JSON.stringify(state.user));
        state.registerInfo = { fname: "", lname: "", email: "", password: "" };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload;
        console.log("error: ", state.registerError);
      })
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload;
        localStorage.setItem("User", JSON.stringify(state.user));
        state.loginInfo = { email: "", password: "" };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem("User", JSON.stringify(state.user));
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loginError = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutError = action.payload;
      });
  },
});

export const {
  updateRegisterInfo,
  updateLoginInfo,
  updateLoginError,
  updateRegisterError,
} = authSlice.actions;
export default authSlice.reducer;
