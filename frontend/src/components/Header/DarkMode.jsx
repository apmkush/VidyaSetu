import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios'; 
import{backendUrl}from '../../service/url';

function Darkmode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { token } = useSelector((state) => state.auth);

  
  useEffect(() => {  // Fetch user's theme preference from the backend when the component mounts
    const fetchUserTheme = async () => {
      try {
        const response = await axios.get(`${backendUrl}/get-theme`, {
          headers: { Authorization: `Bearer ${token}` },
        }); // Replace it with your API endpoint
        // const userTheme = response.data.theme; // Assume the API returns { theme: 'dark' | 'light' }
        
        // Set the theme based on the backend response
        if (response.data.theme) {
          setIsDarkMode(true);
          document.documentElement.classList.add('dark');
        } else {
          setIsDarkMode(false);
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Error fetching user theme:', error);
      }
    };

    fetchUserTheme();
  }, []);

  const toggleDarkMode = async () => {
    const newTheme = !isDarkMode ? 'dark' : 'light'; // Toggle the theme

    // Update the theme in the document and in state
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);

    // Save the new theme to the backend
    try {
      const res=await axios.post(`${backendUrl}/update-theme`,
           { theme: isDarkMode },{
          headers: { Authorization: `Bearer ${token}` },
        }); // Replace with your API endpoint
      console.log(res.data);
    } catch (error) {
      console.error('Error saving user theme:', error);
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 rounded focus:outline-none"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? (
        // Sun Icon for Light Mode
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-yellow-500"
        >
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 1v2m0 18v2m9-11h2m-20 0h2m15.071-6.071l1.414 1.414m-17.485 0l1.414-1.414m15.071 15.071l1.414-1.414m-17.485 0l1.414 1.414"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ) : (
        // Moon Icon for Dark Mode
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-300"
        >
          <path
            d="M21 12.79A9 9 0 0 1 11.21 3 9 9 0 1 0 21 12.79z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}

export default Darkmode;
