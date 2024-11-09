import React, { useState } from 'react';
import dayjs from 'dayjs';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Planner = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [assignments, setAssignments] = useState({});
  const [hoveredDate, setHoveredDate] = useState(null);
  const [clickedDate, setClickedDate] = useState(null);
  const [newAssignment, setNewAssignment] = useState('');

  const daysInMonth = currentMonth.daysInMonth();
  const startDayOfWeek = currentMonth.day();

  // Generates days for the calendar, including padding days for the start of the week
  const generateCalendarDays = () => {
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: null });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = currentMonth.date(i).format('YYYY-MM-DD');
      const dateAssignments = assignments[date] || [];
      const allCompleted = dateAssignments.length > 0 && dateAssignments.every(task => task.completed);
      days.push({
        day: i,
        date: date,
        assignments: dateAssignments,
        status: allCompleted ? 'completed' : dateAssignments.length ? 'pending' : 'no-assignments',
      });
    }
    return days;
  };

  // Changes the month
  const handleMonthChange = (direction) => {
    setCurrentMonth(currentMonth.add(direction, 'month'));
  };

  // Adds a new assignment to a specific date
  const addAssignment = () => {
    if (!newAssignment) return;
    const updatedAssignments = { ...assignments };
    if (!updatedAssignments[clickedDate]) {
      updatedAssignments[clickedDate] = [];
    }
    updatedAssignments[clickedDate].push({ id: Date.now(), text: newAssignment, completed: false });
    setAssignments(updatedAssignments);
    setNewAssignment('');
  };

  // Toggles the completion status of an assignment
  const toggleAssignment = (date, id) => {
    const updatedAssignments = { ...assignments };
    const assignment = updatedAssignments[date].find(task => task.id === id);
    if (assignment) {
      assignment.completed = !assignment.completed;
    }
    setAssignments(updatedAssignments);
  };

  // Deletes an assignment from a specific date
  const deleteAssignment = (date, id) => {
    const updatedAssignments = { ...assignments };
    updatedAssignments[date] = updatedAssignments[date].filter(task => task.id !== id);
    if (updatedAssignments[date].length === 0) delete updatedAssignments[date]; // Remove date if no tasks left
    setAssignments(updatedAssignments);
  };

  // Get background color based on status
  const getBoxColor = (status) => {
    if (status === 'completed') return 'bg-green-200';
    if (status === 'pending') return 'bg-red-200';
    return 'bg-gray-100';
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Monthly Deadlines</h1>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => handleMonthChange(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Previous
        </button>
        <h2 className="text-xl font-semibold">
          {currentMonth.format('MMMM YYYY')}
        </h2>
        <button
          onClick={() => handleMonthChange(1)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-700">
            {day}
          </div>
        ))}
        {generateCalendarDays().map((dayObj, index) => (
          <div
            key={index}
            className={`relative border rounded-lg p-2 cursor-pointer ${dayObj.day ? getBoxColor(dayObj.status) : ''}`}
            onMouseEnter={() => dayObj.day && setHoveredDate(dayObj.date)}
            onMouseLeave={() => setHoveredDate(null)}
            onClick={() => dayObj.day && setClickedDate(dayObj.date)}
          >
            {dayObj.day && (
              <>
                <div className="text-lg font-medium">{dayObj.day}</div>
                {dayObj.assignments.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white p-2 rounded shadow-lg z-10">
                    <h4 className="text-sm font-semibold mb-1">Assignments</h4>
                    <ul className="text-xs text-gray-700">
                      {dayObj.assignments.map(task => (
                        <li key={task.id} className={task.completed ? 'line-through' : ''}>
                          {task.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Modal for adding/editing assignments */}
      {clickedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Assignments for {dayjs(clickedDate).format('MMM D')}</h3>
            <ul className="mb-4 space-y-2">
              {(assignments[clickedDate] || []).map(task => (
                <li key={task.id} className="flex items-center justify-between">
                  <span
                    onClick={() => toggleAssignment(clickedDate, task.id)}
                    className={`cursor-pointer ${task.completed ? 'line-through text-gray-500' : ''}`}
                  >
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteAssignment(clickedDate, task.id)}
                    className="text-red-500 text-xs hover:underline ml-2"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center">
              <input
                type="text"
                value={newAssignment}
                onChange={(e) => setNewAssignment(e.target.value)}
                placeholder="Add new assignment"
                className="flex-1 p-2 border rounded mr-2"
              />
              <button
                onClick={addAssignment}
                className="px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <button
              onClick={() => setClickedDate(null)}
              className="mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
