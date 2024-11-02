import React, { useState } from 'react';

// Initial sample data for demonstration purposes
const initialLeaderboardData = [
  { id: 1, name: "Alice Johnson", course: "Mathematics", auraPoints: 1200, achievements: ["Top Scorer", "Perfect Attendance"] },
  { id: 2, name: "Bob Smith", course: "Physics", auraPoints: 1100, achievements: ["Top Scorer"] },
  { id: 3, name: "Cathy Williams", course: "Computer Science", auraPoints: 1050, achievements: ["Perfect Attendance", "Consistent Performer"] },
  // Add more students if needed
];

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState(initialLeaderboardData);
  const [newStudent, setNewStudent] = useState({
    name: "",
    course: "",
    auraPoints: "",
    achievements: "",
  });

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent({ ...newStudent, [name]: value });
  };

  // Handle adding a new student to the leaderboard
  const handleAddStudent = () => {
    if (newStudent.name && newStudent.course && newStudent.auraPoints) {
      const updatedData = [
        ...leaderboardData,
        {
          id: leaderboardData.length + 1,
          name: newStudent.name,
          course: newStudent.course,
          auraPoints: parseInt(newStudent.auraPoints, 10), // Convert to integer
          achievements: newStudent.achievements.split(",").map(ach => ach.trim()), // Split by commas for achievements
        },
      ];
      setLeaderboardData(updatedData);
      setNewStudent({ name: "", course: "", auraPoints: "", achievements: "" });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Campus Leaderboard</h2>

      {/* Input form to add a new student */}
      <div className="mb-8 p-4 border border-gray-300 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Add New Student</h3>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            name="name"
            value={newStudent.name}
            onChange={handleInputChange}
            placeholder="Student Name"
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            name="course"
            value={newStudent.course}
            onChange={handleInputChange}
            placeholder="Course"
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="number"
            name="auraPoints"
            value={newStudent.auraPoints}
            onChange={handleInputChange}
            placeholder="Aura Points"
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="text"
            name="achievements"
            value={newStudent.achievements}
            onChange={handleInputChange}
            placeholder="Achievements (comma-separated)"
            className="px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleAddStudent}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Add Student
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="py-3 px-6 text-left text-sm font-semibold">Rank</th>
              <th className="py-3 px-6 text-left text-sm font-semibold">Student Name</th>
              <th className="py-3 px-6 text-left text-sm font-semibold">Course</th>
              <th className="py-3 px-6 text-left text-sm font-semibold">Aura Points</th>
              <th className="py-3 px-6 text-left text-sm font-semibold">Achievements</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData
              .sort((a, b) => b.auraPoints - a.auraPoints) // Sort by Aura Points in descending order
              .map((student, index) => (
                <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-6 text-sm font-medium text-gray-700">{index + 1}</td>
                  <td className="py-3 px-6 text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{student.course}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{student.auraPoints}</td>
                  <td className="py-3 px-6 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {student.achievements.map((achievement, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full"
                        >
                          {achievement}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
