import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import authReducer from './authSlice.jsx';

// Configure the Redux store
const store = configureStore({
    reducer: {
        auth: authReducer,
        // we will add more reducers here like: user: userReducer, etc.
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;