import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { saveAs } from 'file-saver';

const StudentTranscript = () => {
  const [transcriptData, setTranscriptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const storedToken = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);

  // Fetch transcript data
  useEffect(() => {
    if (!user || user.userRole !== 'student') return;

    const fetchTranscriptData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/get-result`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setTranscriptData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch transcript');
      } finally {
        setLoading(false);
      }
    };

    fetchTranscriptData();
  }, [storedToken, user]);

  // Calculate SPI for a semester
  const calculateSPI = useCallback((semesterResults) => {
    const gradePoints = {
      'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    semesterResults.forEach(subject => {
      const credits = subject.credits || 4;
      totalPoints += gradePoints[subject.grade] * credits;
      totalCredits += credits;
    });
    
    return (totalPoints / totalCredits).toFixed(2);
  }, []);

  // Calculate cumulative CPI
  const calculateCPI = useCallback((allResults) => {
    let cumulativePoints = 0;
    let cumulativeCredits = 0;
    const semesterCPIs = [];
    
    const sortedSemesters = Object.keys(allResults).sort((a, b) => a - b);
    
    sortedSemesters.forEach(semester => {
      const spi = parseFloat(calculateSPI(allResults[semester]));
      const credits = allResults[semester].reduce((sum, subject) => sum + (subject.credits || 4), 0);
      
      cumulativePoints += spi * credits;
      cumulativeCredits += credits;
      
      semesterCPIs.push((cumulativePoints / cumulativeCredits).toFixed(2));
    });
    
    return {
      overallCPI: semesterCPIs[semesterCPIs.length - 1] || '0.00',
      semesterCPIs
    };
  }, [calculateSPI]);

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/get-transcript/pdf`, 
        {
          responseType: 'blob',
          headers: { Authorization: `Bearer ${storedToken}` }
        }
      );
      saveAs(response.data, `Transcript_${user.regno}.pdf`);
    } catch (err) {
      setError('Failed to download transcript');
    }
  };

  if (loading) return <div className="text-center py-8">Loading transcript...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!transcriptData) return <div className="text-center py-8">No transcript data found</div>;

  const { overallCPI, semesterCPIs } = calculateCPI(transcriptData.results);
  const sortedSemesters = Object.keys(transcriptData.results).sort((a, b) => a - b);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Academic Transcript</h1>
        <button 
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={!transcriptData}
        >
          Download PDF
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">MINIT ALLAHABAD</h1>
          <h2 className="text-xl font-semibold">WEB GENERATED TRANSCRIPT</h2>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Name: {user.name}</p>
            <p className="font-semibold">Registration No: {user.regno}</p>
            <p className="font-semibold">Degree: Bachelor of Technology</p>
          </div>
          <div>
            <p className="font-semibold">Branch: {user.branch}</p>
            <p className="font-semibold">Batch: {transcriptData.batch}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedSemesters.map(semester => (
            <div key={semester} className="mb-8">
              <h3 className="text-lg font-bold mb-2">
                Semester {toRomanNumeral(semester)} ({getSemesterDates(semester, transcriptData.batch)})
              </h3>
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Subject Name</th>
                    <th className="border px-4 py-2 text-center">Credits</th>
                    <th className="border px-4 py-2 text-center">Grades</th>
                  </tr>
                </thead>
                <tbody>
                  {transcriptData.results[semester].map((subject, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{subject.subject}</td>
                      <td className="border px-4 py-2 text-center">{subject.credits || 4}</td>
                      <td className="border px-4 py-2 text-center">{subject.grade}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td colSpan="2" className="border px-4 py-2 text-right">SPI</td>
                    <td className="border px-4 py-2 text-center">
                      {calculateSPI(transcriptData.results[semester])}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2">Performance Summary</h3>
          <p className="mb-2">
            <span className="font-semibold">Semester:</span> {sortedSemesters.map(toRomanNumeral).join(' ')}
          </p>
          <p className="mb-2">
            <span className="font-semibold">CPI:</span> {semesterCPIs.join(' ')}
          </p>
          <p className="mb-2">
            <span className="font-semibold">CPI (From 1 to VI semester):</span> {overallCPI}
          </p>
          <p className="text-sm mb-2">
            Semester Performance Index (SPI) and Cumulative Performance Index (CPI) are marked on a 10 point scale.
          </p>
          <p className="font-semibold">Result: Passed till VI semester</p>
        </div>

        <div className="mt-8 text-sm">
          <p className="mb-2">
            <span className="font-semibold">Note:</span> The medium of instruction/communication in Institute is English.
          </p>
          <p className="font-semibold">
            Date of Generation: {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="mt-4 text-xs italic">
            Disclaimer: Every effort has been made to keep the data authentic and up to date. However, the Web Team is not responsible for any discrepancy.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function getSemesterDates(semester, batch) {
  const startYear = parseInt(batch);
  const semesters = {
    '1': `July ${startYear} - Dec ${startYear}`,
    '2': `Jan ${startYear + 1} - May ${startYear + 1}`,
    '3': `July ${startYear + 1} - Dec ${startYear + 1}`,
    '4': `Jan ${startYear + 2} - May ${startYear + 2}`,
    '5': `July ${startYear + 2} - Dec ${startYear + 2}`,
    '6': `Jan ${startYear + 3} - May ${startYear + 3}`,
    '7': `July ${startYear + 3} - Dec ${startYear + 3}`,
    '8': `Jan ${startYear + 4} - May ${startYear + 4}`
  };
  return semesters[semester] || '';
}

function toRomanNumeral(num) {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  return romanNumerals[parseInt(num) - 1] || num;
}

export default StudentTranscript;