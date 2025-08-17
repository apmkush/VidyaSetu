import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider,GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import {  loginStart,  loginSuccess,  loginFailure,} from "../../store/authSlice";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import{backendUrl}from '../../service/url';

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
        `${backendUrl}/login`,
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

  const handleLoginSuccess = async (credentialResponse) => {
        const token = credentialResponse.credential;
        // console.log(token);
        const userDetails = jwtDecode(token);
        // console.log(userDetails);
        // Further token handling can be added here if necessary
        const response = await axios.get(`${backendUrl}/google-login`,
            {
              headers: {
                  Authorization: `${token}`, // Send JWT token in headers
              },
          });
          if(response.data.success){
            console.log(response.data); 
            dispatch(loginSuccess({ user: response.data.user, token: response.data.token }));
            DisplayMessage("Login successfully!!");
            setTimeout(() => {
                navigate('/');
            }, 2000);
          }else{
            console.log(response.data.message);
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

        {/* <div className="flex justify-center mt-2">
          <GoogleLogin onSuccess={handleGoogleLogin} onError={() => DisplayMessage("Google login failed", "error")} />
        </div> */}
        <GoogleOAuthProvider clientId="35549278582-em44n646f5im5rhh4v8j9ksui6gpmsmn.apps.googleusercontent.com">
            <div className="App">
                <h2>Login with Google</h2>
                <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => DisplayMessage("Google login failed", "error")}
                    useOneTap
                />
                {/* <button onClick={() => googleLogout()}>Logout</button> */}
            </div>
        </GoogleOAuthProvider>
      </form>
    </div>
  );
}

export default Login;
