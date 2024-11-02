import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
// import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import {UserModel} from "./config.js";

const app=express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.post("/sendSingup",async(req,res)=>{
    const data = {
        name:req.body.name,
        email:req.body.email,
        phone:req.body.tel,
        password:req.body.password,
        confirm_password:req.body.confirm_password,
    };
    try{
        const existingUser = await UserModel.findOne({email: data.email});
        if(data.password!=data.confirm_password){
            res.json({success:false,message:"Passwords does not match!!"});
        }
        else if(existingUser){
            res.json({success:false,message:"User already exists.Please enter different email"});
        }else{
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password,saltRounds);
            data.password = hashedPassword;
            const userdata = await UserModel.insertMany(data);
            console.log(userdata);
            res.json({success:true,message:"Singup successful!!"});
        }
    }catch(e){
        console.log(e);
        res.json({success:false,message:"Something went wrong!!"});
    }
})

app.post("/sendLogin",async(req,res)=>{

    const data={
        email:req.body.email,
        password:req.body.password,
    };
    console.log(data);
    try{
        const check = await UserModel.findOne({email:req.body.email});
        
        if(!check){
            return res.json({success:false,message:"user cannot be found"});
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password,check.password);
        if(isPasswordMatch){
            res.json({success:true,message:"Login successful!!"});
            console.log("Login successful");
        }else{
            res.json({success:false,message:"wrong password!!"});
            console.log("wrong password");
        }
    }catch(error){
        console.log(error);
        res.json({success:false,message:"wrong details"});
    }
    // console.log(data);
})

app.listen(5000,()=>{
    console.log("app is running");
})
