// src/socket.js
import { io } from "socket.io-client";
import{backendUrl}from '../src/service/url.js';

// console.log("jnadf");
const socket = io(`${backendUrl}`); // your backend URL

export default socket;
