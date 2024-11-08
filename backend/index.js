import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT||5000;
import mongoDB from "./config/db.js";
import router from "./Routers/index.js";
mongoDB();

const app=express();
app.use(cors());
app.use(express.json());

// app.use(bodyParser.urlencoded({ extended: true }));



app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use("/", router);

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
})
