import React, { useState, useEffect } from 'react';
import axios, { Axios } from 'axios';
import { Line } from 'react-chartjs-2';
import { ToastContainer, toast } from 'react-toastify';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const Achievement = ({ userId }) => {
  const [achievements, setAchievements] = useState([]);
  const [auraPointsHistory, setAuraPointsHistory] = useState([]);
  const [newAchievement, setNewAchievement] = useState({
    regno:'',
    auraPoints:'',
  });

  // useEffect(() => {
  //   fetchAchievements();
  // }, []);

  const  DisplayMessage=(text)=>{
    toast.success(text, {
        position: "top-center",
        autoClose: 3000, // Auto-close after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {marginTop: "10px" },
    });
};

  // const fetchAchievements = async () => {
  //   try {
  //     const response = await fetch(`/api/achievements/${userId}`);
  //     const data = await response.json();
  //     setAchievements(data.achievements);
  //     setAuraPointsHistory(data.auraPointsHistory);
  //   } catch (error) {
  //     console.error('Failed to fetch achievements:', error);
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAchievement({ ...newAchievement, [name]: value });
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    try{
      const response=await axios.put('http://localhost:5000/addPoints',{
          regno:parseInt(newAchievement.regno),
          newPoints:parseInt(newAchievement.auraPoints),
      },{
          headers:{
              'Content-Type':'application/json'
          }
      });
      if(response.data.success){
          DisplayMessage(response.data.message);
      }else{
          DisplayMessage(response.data.message);
      }
      console.log(response.data.message);
      // setMessage(response.data.message);
  }catch(e){
      console.log(e);
      DisplayMessage("An error has occured!!");
  }
  };

  // Graph Data for Aura Points History
  const chartData = {
    labels: Array.from({ length: auraPointsHistory.length }, (_, i) => `Achievement ${i + 1}`),
    datasets: [
      {
        label: 'Aura Points',
        data: auraPointsHistory,
        fill: false,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="container mx-auto p-8">
      <ToastContainer />
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Achievements</h2>

      {/* Form to Add New Achievement */}
      <form onSubmit={handleAddAchievement} className="mb-8 p-4 border border-gray-300 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Add New Achievement</h3>
        <div className="flex flex-col space-y-4">
          <input
            type="number"
            name="regno"
            value={newAchievement.regno}
            onChange={handleInputChange}
            placeholder="Roll no"
            className="px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="number"
            name="auraPoints"
            value={newAchievement.auraPoints}
            onChange={handleInputChange}
            placeholder="Aura Points for Achievement"
            className="px-4 py-2 border rounded-lg"
            required
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
            Add Achievement
          </button>
        </div>
      </form>

      {/* Performance Graph */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-center">Aura Points Over Time</h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* List of Achievements */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-6 text-left text-sm font-semibold">Achievement</th>
              <th className="py-3 px-6 text-left text-sm font-semibold">Aura Points</th>
            </tr>
          </thead>
          <tbody>
            {achievements.map((achievement) => (
              <tr key={achievement.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-sm font-medium text-gray-900">{achievement.description}</td>
                <td className="py-3 px-6 text-sm text-gray-700">{achievement.auraPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Achievement;
