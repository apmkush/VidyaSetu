import { text } from "express";
import mongoose from "mongoose";
const connect=mongoose.connect("mongodb://localhost:27017/VidyaSetu");

connect.then(()=>{
    console.log("Database connected succcessfully");
})
.catch(()=>{
    console.log("Database not connected");
});

// const contactSchema=new mongoose.Schema({
//     name:{
//         type:String,
//         require:true
//     },
//     email:{
//         type:String,
//         require:true
//     },
//     phone:{
//         type:String,
//         require:true
//     }
// });

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    phone:{
        type:Number,
        require:true
    },
    password: {
        type: String,
        required: true
    },
});

const ContactModel=mongoose.model("Contact",contactSchema);
const UserModel=mongoose.model("User",userSchema);

export{ContactModel,UserModel};