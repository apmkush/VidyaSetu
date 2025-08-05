import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import {  loginStart,  loginSuccess,  loginFailure,} from "../../store/authSlice";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const DisplayMessage = (text) => {
    toast.success(text, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { marginTop: "10px" },
    });
};

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(loginStart());
    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        formData
      );

      if (response.data.success) {
        DisplayMessage(response.data.message);
        dispatch(
          loginSuccess({
            user: response.data.user,
            token: response.data.token,
          })
        );
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong";
        console.log(error);
      DisplayMessage(message, "error");
      dispatch(loginFailure(message));
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await axios.post("http://localhost:8000/api/user/googlelogin", {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        DisplayMessage("Login successful via Google");
        dispatch(
          loginSuccess({
            user: res.data.user,
            token: res.data.token,
          })
        );
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        DisplayMessage(res.data.message, "error");
        dispatch(loginFailure(res.data.message));
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Google login failed";
      DisplayMessage(message, "error");
      dispatch(loginFailure(message));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ToastContainer />
      <form
        className="w-full max-w-sm bg-white p-8 rounded shadow-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <div className="mb-4">
          <label htmlFor="email" className="block font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-3 py-2 border rounded"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full px-3 py-2 border rounded"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-center text-sm">
          <span>or login with</span>
        </div>

        <div className="flex justify-center mt-2">
          <GoogleLogin onSuccess={handleGoogleLogin} onError={() => DisplayMessage("Google login failed", "error")} />
        </div>
      </form>
    </div>
  );
}

export default Login;
