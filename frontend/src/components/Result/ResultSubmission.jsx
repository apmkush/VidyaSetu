import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ProfessorResultSubmission = ({ professorId }) => {
  const [semester, setSemester] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [batch, setBatch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const storedToken = useSelector(state => state.auth.token);

  // Fetch students when semester and subject are selected
  useEffect(() => {
    if (semester && subjectName) {
      const fetchStudents = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:5000/subjects/students`,
            { 
              params: { semester, subjectName },
              headers: { Authorization: `Bearer ${storedToken}` }
            }
          );
          setStudents(response.data.data.map(student => ({
            ...student,
            grade: ''
          })));
        } catch (error) {
          console.error('Error fetching students:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    }
  }, [semester, subjectName, storedToken]);

  const handleGradeChange = (index, value) => {
    const newStudents = [...students];
    newStudents[index].grade = value;
    setStudents(newStudents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/submit-results', {
        semester,
        subjectName,
        batch, // Added batch to submission
        professorId,
        students: students.map(s => ({
          regno: s.regno,
          grade: s.grade
        })),
        createdBy: professorId
      }, {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Submit Student Results</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"> {/* Changed to 3 columns */}
            <div>
              <label className="block mb-2 font-medium">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Subject Name</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter Subject Name"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Batch Year</label>
              <input
                type="number"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., 2023"
                min="2000"
                max={new Date().getFullYear()}
                required
              />
            </div>
          </div>

          {loading && !students.length ? (
            <div className="text-center py-8">Loading students...</div>
          ) : students.length > 0 ? (
            <>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 border bg-gray-100">Registration No</th>
                      <th className="py-3 px-4 border bg-gray-100">Name</th>
                      <th className="py-3 px-4 border bg-gray-100">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student._id}>
                        <td className="py-3 px-4 border">{student.regno}</td>
                        <td className="py-3 px-4 border">{student.name}</td>
                        <td className="py-3 px-4 border">
                          <select
                            value={student.grade}
                            onChange={(e) => handleGradeChange(index, e.target.value)}
                            className="w-full p-1 border rounded"
                            required
                          >
                            <option value="">Select Grade</option>
                            <option value="A+">A+</option>
                            <option value="A">A</option>
                            <option value="B+">B+</option>
                            <option value="B">B</option>
                            <option value="C+">C+</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="F">F</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Submitting...' : 'Submit Results'}
              </button>

              {success && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
                  Results submitted successfully!
                </div>
              )}
            </>
          ) : semester && subjectName ? (
            <div className="text-center py-8">
              No students found for {subjectName} in semester {semester}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
};

export default ProfessorResultSubmission;