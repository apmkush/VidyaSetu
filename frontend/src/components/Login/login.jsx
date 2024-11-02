import React, { useRef, useState, useEffect } from "react";
import './../../index.css'; // Import Tailwind if not included globally in your project

const login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordPage, setIsPasswordPage] = useState(false);

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const loginTitleRef = useRef(null);
    const userEmailRef = useRef(null);
    
    useEffect(() => {
        emailInputRef.current.focus();
    }, []);

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
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
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
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
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
                                    <button 
                                        type="submit" 
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
