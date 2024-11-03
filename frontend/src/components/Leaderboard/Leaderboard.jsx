import React from 'react';

const Leaderboard = ({ leaderboardData = [] }) => {
  const isEmpty = leaderboardData.length === 0;

  return (
    <div className={`container mx-auto p-8 h-screen ${isEmpty ? 'flex flex-col justify-center' : ''}`}>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Campus Leaderboard</h2>

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
            {isEmpty ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 text-lg">
                  No data available. The leaderboard is currently empty.
                </td>
              </tr>
            ) : (
              leaderboardData
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
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
