import {PointsHistory} from "../models/pointsHistory.js";

export const getPointHistory = async (req, res) => {
    try {
      const { userId } = req.params;
  
      const auraPointsRecord = await PointsHistory.findOne({ userId }).select('auraPointsHistory');
      console.log(auraPointsRecord.auraPointsHistory);
  
      return res.json(auraPointsRecord);
    } catch (error) {
      console.log(error);
      return res.json({});
    }
  };