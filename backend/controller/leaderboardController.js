import {UserModel} from "../models/user.js";


export const addPoints =async (req,res)=>{
    const { regno, newPoints } = req.body;

    try{
        const userdata = await UserModel.findOneAndUpdate(
            { regno: regno},              
            { $inc: { auraPoints:newPoints } }, 
            { new: true }                   
          );
        console.log(userdata);
        res.json({success:true,message:"Points added successfully!!"});
    }catch(e){
        console.log(e);
        res.json({success:false,message:"Something went wrong!!"});
    }
}

export const getPoints=async (req,res)=>{
    try{
        const leaderboardData = await UserModel.find({}).select("name regno auraPoints achievements"); 
        console.log(leaderboardData); 
        return res.json(leaderboardData); //returning leaderboardData;
    }
    catch(error){
        console.log(error);
    }
}
