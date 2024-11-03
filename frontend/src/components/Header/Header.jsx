import React from 'react';
import { FaTrophy, FaChartLine, FaTasks, FaMedal, FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import DarkMode from './DarkMode';
import LogoImage from './logo.png';

function Navbar() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Brand Logo and Name */}
        <div className="flex items-center space-x-3">
          <img src={LogoImage} alt="VidyaSetu Logo" className="h-11 w-13" />
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">VidyaSetu</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex justify-center space-x-10">
          <Link to="/leaderboard" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaTrophy className="mr-1" /> Leaderboard
          </Link>
          <Link to="/growth" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaChartLine className="mr-1" /> Your Growth
          </Link>
          <Link to="/assignments" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaTasks className="mr-1" /> Assignments
          </Link>
          <Link to="/achievements" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaMedal className="mr-1" /> Achievements
          </Link>
          <Link to="/community" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaUsers className="mr-1" /> Community  
          </Link>
        </nav>

        {/* Right Side - Dark Mode Toggle & Auth Options are included */}
        <div className="flex items-center space-x-4">
          <DarkMode />
          <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md">
            Login
          </Link>
          <Link to="/signup" className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors duration-200 shadow-md">
            Signup
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;