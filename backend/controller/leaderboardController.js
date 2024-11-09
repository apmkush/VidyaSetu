import {UserModel} from "../models/user.js";
import {PointsHistory} from "../models/pointsHistory.js";


export const addPoints =async (req,res)=>{
    const { regno, newPoints } = req.body;
    try{
        const userdata = await UserModel.findOneAndUpdate(
            { regno: regno},              
            { $inc: { auraPoints:newPoints } }, 
            { new: true }                   
          );
          const  userId  =userdata._id;
          let auraPointsRecord = await PointsHistory.findOne({ userId });

          if (!auraPointsRecord) {
            auraPointsRecord = new PointsHistory({
              userId,
              auraPointsHistory: [{ points: newPoints }],
            });
          } else {
            auraPointsRecord.auraPointsHistory.push({ points: newPoints });
          }
        await auraPointsRecord.save();
        console.log(auraPointsRecord);
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
