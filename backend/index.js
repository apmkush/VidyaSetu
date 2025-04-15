import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT||5000;
import mongoDB from "./config/db.js";
import router from "./Routers/index.js";
<<<<<<< HEAD
import path from "path";





=======
>>>>>>> 086db05e87d1b192b3b4ba5c6e8e6a9cc2390b5d
import { app, server } from "./config/socket.js"
import cloudinary from "./config/cloudinary.js";


cloudinary() ; 
// const app=express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
app.use(express.json({ limit: '50mb' }));

// app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.resolve('./public')));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use("/", router);

server.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
    mongoDB();
})
