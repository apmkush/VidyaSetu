import React, { useRef, useState, useEffect } from "react";
import axios, { Axios } from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import './../../index.css'; 

const login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordPage, setIsPasswordPage] = useState(false);

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const loginTitleRef = useRef(null);
    const userEmailRef = useRef(null);
    
    const navigate = useNavigate();
    const [formInput,setFormInput]=useState({
        email:"",
        password:"",
    });
    const  DisplayMessage=(text)=>{
        toast.success(text, {
            position: "top-center",
            autoClose: 3000, // Auto-close after 3 seconds
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: {marginTop: "10px" },
        });
    };
    const handleInput=(event)=>{
        const{name,value}=event.target;

        let obj={[name]:value};
        setFormInput((prev)=>({...prev,...obj}));
    };
    
    useEffect(() => {
        emailInputRef.current.focus();
    }, []);

    const handleSubmit=async(e)=>{
        e.preventDefault();
        try{
            const response=await axios.post('http://localhost:5000/sendLogin',formInput,{
                headers:{
                    'Content-Type':'application/json'
                }
            });
            if(response.data.success){
                DisplayMessage(response.data.message);
            }else{
                DisplayMessage(response.data.message);
            }
            console.log(response.data.message);
            // setMessage(response.data.message);
        }catch(e){
            console.log(e);
            DisplayMessage("An error has occured!!");
        }
        setTimeout(() => {
            navigate('/');
        }, 3000);
    };

    const handleNextClick = (e) => {
        e.preventDefault();
        setIsPasswordPage(true);
        setTimeout(() => passwordInputRef.current.focus(), 500);
        loginTitleRef.current.innerHTML = 'Welcome';
        userEmailRef.current.innerHTML = email;
    };

    const handleBackClick = (e) => {
        e.preventDefault();
        setIsPasswordPage(false);
        loginTitleRef.current.innerHTML = 'Login';
        userEmailRef.current.innerHTML = 'Please login to use the platform';
        emailInputRef.current.focus();
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
                <form>
                    <div className={`transition-all duration-500 ${isPasswordPage ? 'transform scale-105' : ''}`}>
                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-semibold text-gray-800" ref={loginTitleRef}>Login</h2>
                            <p className="text-gray-500" ref={userEmailRef}>Please login to use the platform</p>
                        </div>

                        {/* Email Page */}
                        {!isPasswordPage && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-2 text-gray-800 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        placeholder="Enter your email"
                                        name="email"
                                        onChange={handleInput} 
                                        ref={emailInputRef} 
                                        required 
                                    />
                                </div>
                                <div className="text-right">
                                    <a href="#" className="text-sm text-blue-500 hover:underline">Forgot email?</a>
                                </div>
                                <div className="text-gray-500 text-sm text-center">
                                    <p>Not your computer? Use guest mode to log in privately.</p>
                                    <a href="#" className="text-blue-500 hover:underline">Learn more</a>
                                </div>
                                <div className="flex items-center justify-between">
                                    <a href="#" className="text-sm text-blue-500 hover:underline">Create account</a>
                                    <button 
                                        className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
                                        onClick={handleNextClick}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Password Page */}
                        {isPasswordPage && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="w-full px-4 py-2 text-gray-800 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        placeholder="Enter your password"
                                        name="password"
                                        onChange={handleInput} 
                                        ref={passwordInputRef} 
                                        required 
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
                                    <label className="flex items-center text-sm">
                                        <input 
                                            type="checkbox" 
                                            className="mr-2" 
                                            checked={showPassword} 
                                            onChange={toggleShowPassword} 
                                        /> 
                                        Show password
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <button 
                                        className="px-4 py-2 font-semibold text-white bg-gray-400 rounded hover:bg-gray-500"
                                        onClick={handleBackClick}
                                    >
                                        Back
                                    </button>
                                    <ToastContainer />
                                    <button 
                                        type="submit" 
                                        onClick={handleSubmit}
                                        className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
                                    >
                                        Login
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default login;
