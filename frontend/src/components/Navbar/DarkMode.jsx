import React, { useEffect, useState } from 'react';

function Darkmode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for system preference and previously saved theme
  useEffect(() => {
    const darkModePreference =  
      localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(darkModePreference);
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-2 rounded focus:outline-none "
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
