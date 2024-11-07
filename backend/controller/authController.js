import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/user.js";
import { generateToken, verifyToken, generateTempToken } from "../config/secret.js";

export const login = async (req, res) => {
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
            const authToken = generateToken(check.id);
            res.json({success:true,message:"Login successful!!",token:authToken});
            console.log("Login successful");
        }else{
            res.json({success:false,message:"wrong password!!"});
            console.log("wrong password");
        }
    }catch(error){
        console.log(error);
        res.json({success:false,message:"wrong details"});
    }
};

export const signup = async (req, res) => {
    const data = {
        name:req.body.name,
        email:req.body.email,
        phone:req.body.tel,
        password:req.body.password,
        confirm_password:req.body.confirm_password,
        regno:req.body.regno,
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
            const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
            console.log(userdata);
            res.json({success:true,message:"Singup successful!!",token:token});
        }
    }catch(e){
        console.log(e);
        res.json({success:false,message:"Something went wrong!!"});
    }
    };