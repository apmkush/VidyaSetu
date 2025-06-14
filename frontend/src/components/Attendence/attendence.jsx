import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from 'react-redux';

const StudentAttendanceMark=()=> {
  const [classId, setClassId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
//   const [classes, setClasses] = useState([]);
  const User = useSelector(state => state.auth.user);

  const classes = [
    {
      _id: "cl001",
      name: "Mathematics 101",
      subject: "Math",
      schedule: "Mon/Wed 9:00-10:30",
      room: "Building A, Room 203"
    },
    {
      _id: "cl002",
      name: "Computer Science Fundamentals",
      subject: "CS",
      schedule: "Tue/Thu 11:00-12:30",
      room: "Building B, Room 105"
    },
    {
      _id: "cl003",
      name: "Literature Survey",
      subject: "English",
      schedule: "Fri 13:00-15:00",
      room: "Building C, Room 312"
    }
  ];

//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const response = await axios.get('/get-classes');
//         console.log(response.data);
//         setClasses(response.data);
//       } catch (err) {
//         setError('Failed to load classes');
//         console.log(err);
//       }
//     };
    
//     fetchClasses();
//     }, []);

    // setClasses(exampleClasses);

  const getCurrentLocation =async () => {
     const res=await new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
    return res;
  };

  const markAttendance = async () => {
    setIsLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Get student's current location
      const location = await getCurrentLocation();
      
      // Verify location accuracy is sufficient (within 20 meters)
      if (location.accuracy > 20) {
        throw new Error('Your location accuracy is too low. Please enable high accuracy mode.');
      }
      
      // Send to backend
      const res=await axios.post('http://localhost:5000/Mark_attendance', {
        classId,
        studentLocation: {
          lat: location.lat,
          lng: location.lng
        }
      });
      setSuccess(true); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="attendance-container" style={{
      maxWidth: '500px',
      margin: '2rem auto',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: '1.5rem',
        fontSize: '1.8rem',
        fontWeight: '600'
      }}>
        Mark Your Attendance
      </h2>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="class-select" style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '500',
          color: '#34495e'
        }}>
          Select Class
        </label>
        <select
          id="class-select"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #dfe6e9',
            backgroundColor: isLoading ? '#f5f6fa' : '#fff',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <option value="">-- Select a Class --</option>
          {classes.map(c => (
            <option key={c._id} value={c._id} style={{ padding: '0.5rem' }}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      
      {error && (
        <div className="error-message" style={{
          padding: '0.75rem',
          margin: '1rem 0',
          backgroundColor: '#fff5f5',
          borderLeft: '4px solid #ff6b6b',
          color: '#ff6b6b',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message" style={{
          padding: '0.75rem',
          margin: '1rem 0',
          backgroundColor: '#f0fff4',
          borderLeft: '4px solid #48bb78',
          color: '#48bb78',
          borderRadius: '4px',
          fontSize: '0.9rem'
        }}>
          ✓ Attendance marked successfully!
        </div>
      )}
      
      <button
        onClick={markAttendance}
        disabled={!classId || isLoading}
        style={{
          width: '100%',
          padding: '0.875rem',
          backgroundColor: !classId || isLoading ? '#bdc3c7' : '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: !classId || isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          margin: '1rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {isLoading ? (
          <>
            <span style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            Verifying Location...
          </>
        ) : (
          'Mark Attendance'
        )}
      </button>
      
      <div className="location-info" style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dfe6e9',
        fontSize: '0.9rem',
        color: '#7f8c8d'
      }}>
        <p style={{ margin: '0.5rem 0' }}>
          <span style={{ fontWeight: '600', color: '#2c3e50' }}>Note:</span> You must be physically present in the classroom to mark attendance.
        </p>
        <p style={{ margin: '0.5rem 0' }}>
          We'll verify your location when you click the button.
        </p>
      </div>
  
      {/* Add this to your CSS for the loading spinner */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default StudentAttendanceMark;