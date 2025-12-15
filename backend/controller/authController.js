
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import {UserModel} from "../models/user.js";
import { generateToken, verifyToken, generateTempToken } from "../config/secret.js";
import { OAuth2Client } from "google-auth-library";
import cloudinary from "../config/cloudinary.js";

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
            const { password, ...userWithoutPassword } = check.toObject();
            res.json({success:true,message:"Login successful!!",token:authToken,user:userWithoutPassword});
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

// export const signup = async (req, res) => {
//     const data = {
//         name:req.body.name,
//         email:req.body.email,
//         phone:req.body.tel,
//         password:req.body.password,
//         confirm_password:req.body.confirm_password,
//         regno:req.body.regno,
//         batchYear:req.body.batchYear,
//         branch:req.body.branch,
//         semester:req.body.semester,
//         section:req.body.section
//     };
//     console.log(data);
//     try{
//         const existingUser = await UserModel.findOne({email: data.email});
//         if(data.password!=data.confirm_password){
//             res.json({success:false,message:"Passwords does not match!!"});
//         }
//         else if(existingUser){
//             res.json({success:false,message:"User already exists.Please enter different email"});
//         }else{
//             const saltRounds = 10;
//             const hashedPassword = await bcrypt.hash(data.password,saltRounds);
//             data.password = hashedPassword;
//             const userdata = await UserModel.insertMany(data);
//             // const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
//             console.log(userdata);
//             const authToken = generateToken(userdata.id);
//             res.json({success:true,message:"Singup successful!!",token:authToken});
//         }
//     }catch(e){
//         console.log(e);
//         res.json({success:false,message:"Something went wrong!!"});
//     }
//     };

// new signup which also handles the user role 
export const signup = async (req, res) => {
    const data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.tel,
        password: req.body.password,
        confirm_password: req.body.confirm_password,
        regno: req.body.regno,
        batchYear: req.body.batchYear,
        branch: req.body.branch,
        semester: req.body.semester,
        section: req.body.section,
        userRole: req.body.userRole || 'student' // Add userRole with default
    };
    
    console.log("Signup data:", data);
    
    try {
        const existingUser = await UserModel.findOne({ email: data.email });
        
        if (data.password != data.confirm_password) {
            return res.json({ success: false, message: "Passwords do not match!!" });
        }
        else if (existingUser) {
            return res.json({ success: false, message: "User already exists. Please enter different email" });
        } else {
            // Validate required fields based on user role
            if (data.userRole === 'student') {
                if (!data.batchYear || !data.branch || !data.semester || !data.section) {
                    return res.json({ success: false, message: "All student fields are required" });
                }
            }
            
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);
            data.password = hashedPassword;
            
            // Remove confirm_password before saving to database
            delete data.confirm_password;
            
            const userdata = await UserModel.create(data);
            console.log("User created:", userdata);
            
            const authToken = generateToken(userdata._id);
            res.json({ success: true, message: "Signup successful!!", token: authToken });
        }
    } catch (e) {
        console.log("Signup error:", e);
        res.json({ success: false, message: "Something went wrong!!" });
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

export const updateMode = async (req, res) => {
  const {theme } = req.body;

  try {
    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { dark:theme },
      { new: true }
    );
    res.json({ message: 'Preferences updated successfully', user });
  } catch (error) {
    res.json({ message: 'Error updating preferences', error });
  }
};

export const getTheme = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await UserModel.findById(userId).select('dark'); // only fetch the 'theme' field

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ theme: user.dark });
  } catch (error) {
    console.error('Error fetching user theme:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const googleLogin = async (req, res) =>{
  
  try {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(400).json({ success: false, message: "Token missing" });
    }

    // Verify token using Google's API
    // const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    // const { email, name, picture, sub } = googleResponse.data; // Extract user info

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Must match the frontend client ID
    });

    const { email, name, picture, sub } = ticket.getPayload();
    // console.log(email);

    if (!email) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Check if user exists in the database
    let user = await UserModel.findOne({ email });


    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    user.password=undefined;
    const authToken = generateToken(user.id);
    // Generate a new session token (optional, if you want to maintain session-based auth)
    return res.json({ success: true, user:user,token:authToken });

  } catch (error) {
      console.error("Google Auth Error:", error);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

// Get user profile information
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
        profilePic: user.profilePic,
        profileImageURL: user.profileImageURL,
        userRole: user.userRole,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        section: user.section,
        batchYear: user.batchYear
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user profile information
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, dateOfBirth, contact, email, gender, course, branch, semester, section, batchYear, address, bio } = req.body;
    console.log("Update profile data:", req.body);
    console.log("File received:", req.file ? req.file.filename : "No file");
    // Find user and update
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields - use hasOwnProperty check to allow empty strings
    if (fullName !== undefined) user.name = fullName;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (contact !== undefined) user.phone = contact;
    if (email !== undefined) user.email = email;
    if (gender !== undefined) user.gender = gender;
    if (course !== undefined) user.course = course;
    if (branch !== undefined) user.branch = branch;
    if (semester !== undefined) user.semester = semester;
    if (section !== undefined) user.section = section;
    if (batchYear !== undefined) user.batchYear = batchYear;
    if (address !== undefined) {
      user.address = { ...user.address, street: address };
    }
    if (bio !== undefined) user.bio = bio;

    // Handle profile image upload to Cloudinary
    if (req.file) {
      try {
        // Store old profile pic URL BEFORE uploading new one
        const oldProfilePic = user.profilePic;
        
        const uploadOptions = {
          folder: 'user_profiles',
          use_filename: true,
          transformation: [
            { width: 300, height: 300, crop: 'fill' },
            { quality: 'auto' },
            { format: 'webp' }
          ]
        };

        const uploadResponse = await cloudinary.uploader.upload(
          req.file.path,
          uploadOptions
        );
        
        console.log("Cloudinary upload response:", uploadResponse);
        user.profilePic = uploadResponse.secure_url;

        // Delete old profile pic from Cloudinary if it exists and is from Cloudinary
        if (oldProfilePic && oldProfilePic.includes('cloudinary.com')) {
          try {
            // Extract public_id from the Cloudinary URL
            // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{public_id}
            const urlParts = oldProfilePic.split('/');
            const filename = urlParts[urlParts.length - 1].split('.')[0]; // Get filename without extension
            const publicId = `user_profiles/${filename}`;
            
            console.log("Deleting old image with public_id:", publicId);
            const deleteResponse = await cloudinary.uploader.destroy(publicId);
            console.log("Delete response:", deleteResponse);
          } catch (cloudinaryError) {
            console.error("Error deleting old profile picture:", cloudinaryError);
            // Continue even if deletion fails
          }
        }
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        return res.status(500).json({ success: false, message: "Failed to upload profile picture" });
      }
    }

    // Save user
    await user.save();
    console.log("User profile updated:", user);
    return res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        course: user.course,
        branch: user.branch,
        semester: user.semester,
        section: user.section,
        batchYear: user.batchYear,
        address: user.address,
        profilePic: user.profilePic,
        bio: user.bio,
        userRole: user.userRole
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
}
