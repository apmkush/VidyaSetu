import mongoose from "mongoose";

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

const UserModel=mongoose.model("User",userSchema);
export{UserModel};