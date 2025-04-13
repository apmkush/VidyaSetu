// main.jsx or index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/Store.jsx';

// Layout and Pages
import Layout from './Layout.jsx';
import Home from './components/Home/Home.jsx';
import Leaderboard from './components/Leaderboard/Leaderboard.jsx';
import Login from './components/Login/Login.jsx';
import Signup from './components/Signup/Signup.jsx';
import Achievement from './components/Achievement/Achievement.jsx';
import ChatBox from './components/Chat/chat.jsx'
import PersonalInfo from './components/personalinfo.jsx/Personalinfo.jsx';
import Setting from './components/Setting.jsx/Setting.jsx';
import Deadline from './components/Planner/Deadline.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Dummy userId for Achievement route
const userId = "672cf85cfa2cadcd25bee67d";

// App Routing Setup
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
        path: "Personalinfo",
        element: <PersonalInfo />
      },
      {
        path: "Setting",
        element: <Setting />
      },
      {
        path: "Deadline",
        element: <Deadline />
      },
      {
        path: "chat",
        element: <ChatBox />
      }

    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
    </GoogleOAuthProvider>
  </>
);
