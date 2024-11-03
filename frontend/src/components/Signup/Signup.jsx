import React, { useState } from 'react';
import axios, { Axios } from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [formInput,setFormInput]=useState({
      name:"",
      email:"",
      tel:"",
      password:"",
      confirm_password:"",
  });

  
  const handleInput=(event)=>{
    const{name,value}=event.target;

    let obj={[name]:value};

    setFormInput((prev)=>({...prev,...obj}));
};

  const handleSubmit=async(e)=>{
    e.preventDefault();
    if(formInput.name==""||formInput.email==""||formInput.password==""||formInput.tel==""||formInput.confirm_password==""){
        toast.error("Please fill all credentials");
    }
    else try{
        const response=await axios.post('http://localhost:5000/sendSingup',formInput,{
            headers:{
                'Content-Type':'application/json'
            }
        });
        if(response.data.success){
            toast.success('SingUp successful!!', {
                position: "top-center",
                autoClose: 3000, // Auto-close after 3 seconds
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            
        }else{
            toast.error(response.data.message);
        }
        setMessage(response.data.message);
    }
    catch(error){
        setMessage("An error has occured!!");
        console.log(error);
    }
    setTimeout(() => {
        navigate('/');
    }, 3000);
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center text-blue-600">Sign Up for VidyaSetu</h2>
        {message && <p className="text-red-500 text-sm text-center">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              onChange={handleInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tel</label>
            <input
              type="text"
              name="tel"
              onChange={handleInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your mobile number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="text"
              name="password"
              onChange={handleInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create a password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              onChange={handleInput}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign Up
          </button>
        <ToastContainer />
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
