import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TimetableSlotForm = ({ slotData, onSuccess, onCancel }) => {
  const [slot, setSlot] = useState({
    context: {
      branch: '',
      semester: '',
      section: ''
    },
    schedule: {
      day: [],
      startTime: '',
      endTime: '',
      pattern: 'weekly'
    },
    subject: '',
    teacher: '',
    room: '',
    type: 'lecture',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (slotData) {
      setSlot(slotData);
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
    } else if (field === 'day') {
      setSlot(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          day: prev.schedule.day.includes(value)
            ? prev.schedule.day.filter(d => d !== value)
            : [...prev.schedule.day, value]
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
      onSuccess();
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
        {/* Existing form fields remain exactly the same */}
        {/* ... */}

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