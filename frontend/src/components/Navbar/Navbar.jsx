import React from 'react';
import { FaTrophy, FaChartLine, FaTasks, FaMedal, FaUsers } from 'react-icons/fa';
import { BsCalendarEvent } from 'react-icons/bs';
import Darkmode from './Darkmode';

function Navbar() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Brand Logo and Name */}
        <div className="flex items-center space-x-3">
          <img src="StudyPal/src/components/Navbar/logo.png" alt="StudyPal Logo" className="h-10 w-10" /> {/* Update logo path */}
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">StudyPal</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex justify-center space-x-10">
          <a href="#leaderboard" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaTrophy className="mr-1" /> Leaderboard
          </a>
          <a href="#growth" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaChartLine className="mr-1" /> Your Growth
          </a>
          <a href="#assignments" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaTasks className="mr-1" /> Assignments
          </a>
          <a href="#achievements" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaMedal className="mr-1" /> Achievements
          </a>
          <a href="#community" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaUsers className="mr-1" /> Community
          </a>
        </nav>

        {/* Right Side - Dark Mode Toggle & Auth Options */}
        <div className="flex items-center space-x-4">
          <Darkmode />
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md" to = ''>Login</button>
          <button className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors duration-200 shadow-md">Signup</button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
