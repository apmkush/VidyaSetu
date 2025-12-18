import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT||5000;
import mongoDB from "./config/db.js";
import router from "./Routers/index.js";
import path from "path";


import { app, server } from "./config/socket.js"


// cloudinary() ; 
// const app=express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://vidya-setu-one.vercel.app",
    "https://vidyasetu-dx4y.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

// app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.resolve('./public')));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
});

app.use("/", router);

server.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
    mongoDB();
})
