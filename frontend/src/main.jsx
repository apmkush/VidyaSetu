import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './components/Home/Home.jsx'
import Leaderboard from './components/Leaderboard/Leaderboard.jsx'
import Login from './components/Login/login.jsx'
import Signup from './components/Signup/Signup.jsx'


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
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
