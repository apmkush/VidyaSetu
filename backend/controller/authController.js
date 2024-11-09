
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import {UserModel} from "../models/user.js";
import { generateToken, verifyToken, generateTempToken } from "../config/secret.js";

export const login = async (req, res) => {
    const data={
        email:req.body.email,
        password:req.body.password,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
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
            // const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
            console.log(userdata);
            const authToken = generateToken(userdata.id);
            res.json({success:true,message:"Singup successful!!",token:authToken});
        }
    }catch(e){
        console.log(e);
        res.json({success:false,message:"Something went wrong!!"});
    }
    };


//Authenticate the email id and password from which mail will be sent
var transporter = nodemailer.createTransport({
    //service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });
  
  const otpStore = new Map();

  const generateOTP = (email) => {
    const OTP = Math.floor(100000 + Math.random() * 900000);
    // Set expiration time for OTP (e.g., 5 minutes)
    const expirationTime = Date.now() + 5 * 60 * 1000;

    // Store OTP with email as key and an object for OTP and expiration
    otpStore.set(email, { OTP, expirationTime });

    console.log(`Generated OTP for ${email}: ${OTP} (Expires at: ${new Date(expirationTime).toLocaleString()})`);
    return OTP;
  };

  export const sendotp = async (req, res) => {
    const email = req.body.email;

    console.log(email);
    try {
      //check if an account is accossiated with entered email id
      const oldUser = await UserModel.findOne({email});
      if (!oldUser) {
        return res.send({
          message: "Invaild email id",
          success: false,
        });
      }else{
        console.log(oldUser.name);
      }
  
      //generate otp
      const generatedOtp = generateOTP(email);
  
      //save otp
  
      //The mail content to be sent to user
      var mailOptions = {
        from: `VidyaSetu <${process.env.email}>`,
        to: `${email}`,
        subject: "Password Reset",
        text: `Dear User,
  
        You have requested to reset your password. Otp for password reset is below:
        
        ${generatedOtp}
        
        Do not share otp with anyone.
        
        Regards,
        Web Team,
        VidyaSetu`,
      };
  
      //Function to send mail   
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
          return res.send({
            message: "Something went wrong",
            success: false,
          });
        } else {
          //console.log(link);
          return res.send({
            message: "OTP sent to your email",
            success: true,
          });
        }
      });
    } catch (error) {
        console.log(error);
        return res.send({
          message: "Something went wrong",
          success: false,
        });
    }
  };

export const verifyotp=async (req, res) => {
    try{
      const { email, otp } = req.body;
      const otpData = otpStore.get(email);

      if (!otpData) {
          return res.json({ success: false, message: "OTP not found or expired" });
      }
      const { OTP, expirationTime } = otpData;

      // Check if the OTP has expired
      if (!expirationTime || Date.now() > new Date(expirationTime)) {
          otpStore.delete(email);  // Remove expired OTP
          console.log("OTP has expired");
          return res.json({ success: false, message: "OTP has expired" });
      }
      
      if (otp == OTP.toString()) {
          otpStore.delete(email);  // Remove OTP after successful verification
          console.log("OTP verified successfully");
          return res.json({ success: true, message: "OTP verified successfully" });
      }
    }catch(e){
      console.log(e);
      return res.json({ success: false, message: "Invalid OTP" });
    }
}

export const resetPassword = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await UserModel.findOne({ email });

      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
  
      return res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.log(error);
      return res.json({ message: "Internal server error" });
    }
  };
