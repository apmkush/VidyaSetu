import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TimetableSlotForm = ({ slotData, onSuccess, onCancel }) => {
  const branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const sections = ['A', 'B', 'C', 'D'];
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [slot, setSlot] = useState({
    context: {
      branch: '',
      semester: '',
      section: ''
    },
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      pattern: 'weekly'
    },
    subject: '',
    facultyId: '',
    room: '',
    type: 'lecture',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Fetch teachers and rooms from backend
    const fetchData = async () => {
      try {
        const [teachersRes, roomsRes] = await Promise.all([
          axios.get('http://localhost:5000/get-teachers'),
          axios.get('http://localhost:5000/get-rooms')
        ]);
        setTeachers(teachersRes.data.data);
        setRooms(roomsRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    if (slotData) {
      const updatedSlot = {
        ...slotData,
        facultyId: slotData.teacher?._id || slotData.teacher || slotData.facultyId || '',
        room: slotData.room?._id || slotData.room || ''
      };
      setSlot(updatedSlot);
    }
  }, [slotData]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSlot(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (field === 'days') {
      setSlot(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          days: prev.schedule.days.includes(value)
            ? prev.schedule.days.filter(d => d !== value)
            : [...prev.schedule.days, value]
        }
      }));
    } else {
      setSlot(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const url = slot._id 
        ? `http://localhost:5000/update-timetable/${slot._id}`
        : 'http://localhost:5000/create-timetable';
      
      const method = slot._id ? 'put' : 'post';
      
      await axios[method](url, slot);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      if (error.response?.data?.conflict) {
        const { type, existingSlot } = error.response.data.conflict;
        let conflictMessage = error.response.data.message;
        
        if (type === 'room') {
          conflictMessage += ` (${existingSlot.subject} by ${existingSlot.teacher})`;
        } else if (type === 'teacher') {
          conflictMessage += ` (${existingSlot.subject} in ${existingSlot.room})`;
        } else if (type === 'section') {
          conflictMessage += ` (${existingSlot.subject} with ${existingSlot.teacher})`;
        }
        
        alert(conflictMessage);
      } else {
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!slot._id) return;
    
    try {
      setSubmitting(true);
      await axios.delete(`http://localhost:5000/delete-timetable/${slot._id}`);
      onSuccess?.();
    } catch (error) {
      alert(`Error deleting slot: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">
        {slot._id ? 'Edit Timetable Slot' : 'Create Timetable Slot'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {/* Context Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-medium">Branch</label>
              <select
                value={slot.context.branch}
                onChange={(e) => handleChange('context.branch', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-medium">Semester</label>
              <select
                value={slot.context.semester}
                onChange={(e) => handleChange('context.semester', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Semester</option>
                {semesters.map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-medium">Section</label>
              <select
                value={slot.context.section}
                onChange={(e) => handleChange('context.section', e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Section</option>
                {sections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
          </div>
  
          {/* Schedule Fields */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Start Time</label>
                <input
                  type="time"
                  value={slot.schedule.startTime}
                  onChange={(e) => handleChange('schedule.startTime', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">End Time</label>
                <input
                  type="time"
                  value={slot.schedule.endTime}
                  onChange={(e) => handleChange('schedule.endTime', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Pattern</label>
                <select
                  value={slot.schedule.pattern}
                  onChange={(e) => handleChange('schedule.pattern', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={slot.schedule.days.includes(day)}
                        onChange={() => handleChange('days', day)}
                        className="mr-2"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
  
          {/* Subject Details */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Subject Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Subject</label>
                <input
                  type="text"
                  value={slot.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-2">Teacher</label>
                <select
                  value={slot.facultyId}
                  onChange={(e) => handleChange('facultyId', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">Room</label>
                <select
                  value={slot.room}
                  onChange={(e) => handleChange('room', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>
                      {room.name} ({room.building})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2">Type</label>
                <select
                  value={slot.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
            </div>
          </div>
  
          {/* Notes Field */}
          <div className="mb-4">
            <label className="block mb-2">Notes</label>
            <textarea
              value={slot.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full p-2 border rounded"
              rows="2"
            />
          </div>
        </div>
  
        <div className="flex justify-end space-x-4">
          {slot._id && (
            <>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={submitting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                Delete Slot
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Slot'}
          </button>
        </div>
  
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
              <p className="mb-6">Are you sure you want to delete this timetable slot?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
  
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Timetable slot {slot._id ? 'updated' : 'created'} successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export default TimetableSlotForm;