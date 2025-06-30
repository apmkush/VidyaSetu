import React, { useState, useEffect } from 'react';
import { FaTachometerAlt, FaCalendarAlt, FaChartLine, FaGift, FaUser , FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useDispatch,useSelector } from 'react-redux';
import {  logout} from "../../store/authSlice";
import DarkMode from './DarkMode';
import LogoImage from './logo.jpeg';

function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const dispatch=useDispatch();
  // console.log(isAuthenticated);

  // Handlers for dropdown visibility
  const handleMouseEnter = (section) => {
    setOpenDropdown(section);
  };

  const handleLogout=()=>{
    dispatch(logout());
  }

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  return (
    <header className="bg-gradient-to-r from-[#FFDCAB] to-[#AB6B2E]' dark:bg-gray-800 shadow-lg py-4">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between">
        
        {/* Brand Logo and Name */}
        <div className="flex items-center space-x-3">
          <img src={LogoImage} alt="VidyaSetu Logo" className="h-12 w-15" />
          <span className="text-3xl font-bold text-gray-800 dark:text-gray-200">VidyaSetu</span>
        </div>

        {/* Navigation Links */}
        <nav className={`flex-1 flex justify-center ${isAuthenticated  ? 'space-x-12' : 'space-x-10'} lg:space-x-16`}>
          
          {/* Dashboard Section */}
          <div 
            className="relative group"
            onMouseEnter={() => handleMouseEnter('dashboard')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center text-gray-600 dark:text-gray-300 font-semibold hover:cursor-pointer text-lg">
              <FaTachometerAlt className="mr-1" /> Dashboard
            </div>
            {openDropdown === 'dashboard' && (
              <div className="absolute transition-all duration-300 transform opacity-100 mt-0.2 w-48 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg rounded-lg py-2 z-10">
                <Link to="/dashboard/overview" className="block px-4 py-2 hover:bg-blue-200 dark:hover:bg-blue-600 rounded">Overview</Link>
                <Link to="/dashboard/activities" className="block px-4 py-2 hover:bg-blue-200 dark:hover:bg-blue-600 rounded">Recent Activities</Link>
                <Link to="/growth" className="block px-4 py-2 hover:bg-blue-200 dark:hover:bg-blue-600 rounded">Progress Tracking</Link>
                <Link to="/dashboard/tasks" className="block px-4 py-2 hover:bg-blue-200 dark:hover:bg-blue-600 rounded">Upcoming Tasks</Link>
              </div>
            )}
          </div>

          {/* Planner Section */}
          <div 
            className="relative group"
            onMouseEnter={() => handleMouseEnter('planner')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center text-gray-600 dark:text-gray-300 font-semibold hover:cursor-pointer text-lg">
              <FaCalendarAlt className="mr-1" /> Planner
            </div>
            {openDropdown === 'planner' && (
              <div className="absolute transition-all duration-300 transform opacity-100 mt-0.2 w-48 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg rounded-lg py-2 z-10">
                <Link to="/MarkAttendence" className="block px-4 py-2 hover:bg-green-200 dark:hover:bg-green-600 rounded">Mark Attendence</Link>
                <Link to="/Deadline" className="block px-4 py-2 hover:bg-green-200 dark:hover:bg-green-600 rounded">Assignment Deadlines</Link>
                <Link to="/planner/timetable" className="block px-4 py-2 hover:bg-green-200 dark:hover:bg-green-600 rounded">Timetable</Link>
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div 
            className="relative group"
            onMouseEnter={() => handleMouseEnter('progress')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center text-gray-600 dark:text-gray-300 font-semibold hover:cursor-pointer">
              <FaChartLine className="mr-1" /> Progress
            </div>
            {openDropdown === 'progress' && (
              <div className="absolute transition-all duration-300 transform opacity-100 mt-0.2 w-48 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg rounded-lg py-2 z-10">
                <Link to="/resultSubmission" className="block px-4 py-2 hover:bg-purple-200 dark:hover:bg-purple-600 rounded">Submit Result</Link>
                <Link to="/resultView" className="block px-4 py-2 hover:bg-purple-200 dark:hover:bg-purple-600 rounded">View Result</Link>
                <Link to="/progress/achievements" className="block px-4 py-2 hover:bg-purple-200 dark:hover:bg-purple-600 rounded">Achievements</Link>
              </div>
            )}
          </div>

          {/* Rewards Section */}
          <div 
            className="relative group"
            onMouseEnter={() => handleMouseEnter('rewards')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center text-gray-600 dark:text-gray-300 font-semibold hover:cursor-pointer text-lg">
              <FaGift className="mr-1" /> Rewards
            </div>
            {openDropdown === 'rewards' && (
              <div className="absolute transition-all duration-300 transform opacity-100 mt-0.2 w-48 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg rounded-lg py-2 z-10">
                <Link to="/achievements" className="block px-4 py-2 hover:bg-yellow-200 dark:hover:bg-yellow-600 rounded">Achievements</Link>
                <Link to="/rewards/badges" className="block px-4 py-2 hover:bg-yellow-200 dark:hover:bg-yellow-600 rounded">Badges</Link>
                <Link to="/leaderboard" className="block px-4 py-2 hover:bg-yellow-200 dark:hover:bg-yellow-600 rounded">Leaderboard</Link>
              </div>
            )}
          </div>

          {/* Simplified Timetable section without dropdown links */}
          <div className="flex items-center text-gray-600 dark:text-gray-300 font-semibold hover:cursor-pointer text-lg">
            <Link to="/TimeTable" className="flex items-center">
              <FaClock className="mr-1" /> Timetable
            </Link>
          </div>

          {/* Profile Section */}
          <div 
            className="relative group"
            onMouseEnter={() => handleMouseEnter('profile')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center text-gray-600 dark:text-gray-300 font-semibold hover:cursor-pointer text-lg">
              <FaUser className="mr-1" /> Profile
            </div>
            {openDropdown === 'profile' && (
              <div className="absolute transition-all duration-300 transform opacity-100 mt-0.2 w-48 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg rounded-lg py-2 z-10">
                <Link to="/Personalinfo" className="block px-4 py-2 hover:bg-pink-200 dark:hover:bg-pink-600 rounded">Personal Info</Link>
                <Link to="/Setting" className="block px-4 py-2 hover:bg-pink-200 dark:hover:bg-pink-600 rounded">Settings</Link>
                <Link to="/profile/goals" className="block px-4 py-2 hover:bg-pink-200 dark:hover:bg-pink-600 rounded">Academic Goals</Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right Side - Dark Mode Toggle & Auth Options */}
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <DarkMode />
          {/* Conditionally render Login and Signup based on isLoggedIn */}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors duration-200 shadow-md">
                Signup
              </Link>
            </>
          )}
          {isAuthenticated&&(
            <button type="submit" onClick={handleLogout} className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors duration-200 shadow-md">
              {"Logout"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
