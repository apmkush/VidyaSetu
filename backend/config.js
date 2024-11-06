import { text } from "express";
import mongoose from "mongoose";
const connect=mongoose.connect("mongodb://localhost:27017/VidyaSetu");

connect.then(()=>{
    console.log("Database connected succcessfully");
})
.catch(()=>{
    console.log("Database not connected");
});

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
    regno:{
        type:Number,
        require:true,
        min:0
    },
    auraPoints:{
        type:Number,
        default:0,
    },
    achievements:{
        type: [String],
    },
    dark:{
        type:Boolean,
        default:false,
    },
});

// const pointsSchema=new mongoose.Schema({
//     name:{
//         type:String,
//         require:true
//     },
//     regno:{
//         type:Number,
//         require:true,
//         min:0
//     },
//     auraPoints:{
//         type:Number,
//         require:true,
//         min:0
//     },
//     achievements:{
//         type: [String],
//         require:true
//     },
// })

const UserModel=mongoose.model("User",userSchema);
// const PointModel=mongoose.model("Score",pointsSchema);

export{UserModel};