import mongoose from "mongoose";
import colors from "colors";

const connectDB= async ()=>{
    try {
        const con = await mongoose.connect(process.env.DB_URL);
        console.log("MongoDB connected successfully.".bgGreen.white);
    }
    catch(error){
        console.log(`Mongodb Server Issue ${error}`.bgRed.white);
    }
}
export default connectDB;