import Assignment from '../models/Assignment.js';

// Get all assignments for a user within a date range
export const getAssignments = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    const assignments = await Assignment.find({
      userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1 });

    // Format assignments by date for the frontend
    const assignmentsByDate = {};
    assignments.forEach(assignment => {
      const dateStr = assignment.date.toISOString().split('T')[0];
      if (!assignmentsByDate[dateStr]) {
        assignmentsByDate[dateStr] = [];
      }
      assignmentsByDate[dateStr].push({
        id: assignment._id,
        text: assignment.text,
        completed: assignment.completed
      });
    });
    console.log(assignments);
    res.status(200).json(assignmentsByDate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new assignment
export const createAssignment = async (req, res) => {
  try {
    const { date, text } = req.body;
    const userId = req.user.id;

    const newAssignment = new Assignment({
      userId,
      date: new Date(date),
      text,
      completed: false
    });

    const savedAssignment = await newAssignment.save();
    res.status(201).json({
      id: savedAssignment._id,
      date: savedAssignment.date.toISOString().split('T')[0],
      text: savedAssignment.text,
      completed: savedAssignment.completed
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an assignment (toggle completion status)
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const assignment = await Assignment.findOne({ _id: id, userId });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.completed = !assignment.completed;
    const updatedAssignment = await assignment.save();

    res.status(200).json({
      id: updatedAssignment._id,
      completed: updatedAssignment.completed
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const assignment = await Assignment.findOneAndDelete({ _id: id, userId });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json({ id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};