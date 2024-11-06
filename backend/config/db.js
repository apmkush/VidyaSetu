import mongoose from "mongoose";

const connectDB= async ()=>{
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log(`Mongodb connected ${mongoose.connection.host}`.bgGreen.white);
    }
    catch(error){
        console.log(`Mongodb Server Issue ${error}`.bgRed.white);
    }
}
module.exports=connectDB;