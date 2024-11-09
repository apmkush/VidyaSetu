import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './components/Home/Home.jsx'
import Leaderboard from './components/Leaderboard/Leaderboard.jsx'
import Login from './components/Login/login.jsx'
import Signup from './components/Signup/Signup.jsx'
import Achievement from './components/Achievement/Achievement.jsx'
import ActivityCalendar from './components/Planner/planner.jsx'

const userId = "672cf85cfa2cadcd25bee67d";

// create a router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "Leaderboard",
        element: <Leaderboard />
      },
      { 
        path: "Login",
        element: <Login />
      },
      {
        path: "Signup",
        element: <Signup />
      },
      {
        path: "achievements",
        element: <Achievement userId={userId} />
      },
      {
        path: "planner",
        element: <ActivityCalendar />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
