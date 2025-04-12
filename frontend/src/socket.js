// src/socket.js
import { io } from "socket.io-client";

// console.log("jnadf");
const socket = io("http://localhost:5000"); // your backend URL

export default socket;
