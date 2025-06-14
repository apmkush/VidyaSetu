
import  verifyLocation  from '../middlewares/geoLocation.js';
import ClassModel from "../models/Class.js";
import Room from '../models/Rooms.js';
import { UserModel } from "../models/user.js";
import AttendanceModel from "../models/Rooms.js";

export const Mark_attendence = async (req, res) => {
  try {
    const { classId, studentLocation } = req.body;
    const studentId = req.user._id;

    // 1. Find the class
    const Class = await ClassModel.findById(classId);
    if (!Class) return res.status(404).send('Class not found');

    // 2. Verify student is in range
    const isInClass = verifyLocation(Class.location, studentLocation, Class.radius || 50);
    if (!isInClass) {
      return res.status(403).send('You must be in the classroom to mark attendance');
    }

    // 3. Prepare today's date (ignore time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 4. Find or create today's attendance record
    let todayRecord = Class.attendanceRecords.find(record =>
      new Date(record.date).getTime() === today.getTime()
    );

    if (!todayRecord) {
      // Create new entry for today
      todayRecord = {
        date: today,
        records: []
      };
      Class.attendanceRecords.push(todayRecord);
    }

    // 5. Check if this student is already marked
    const studentRecordIndex = todayRecord.records.findIndex(r =>
      r.studentId.toString() === studentId.toString()
    );

    if (studentRecordIndex === -1) {
      // Student not marked yet — add them
      todayRecord.records.push({
        studentId,
        status: 'present'
      });
    } else {
      // Student already marked — update status
      todayRecord.records[studentRecordIndex].status = 'present';
    }

    await Class.save();

    return res.status(200).send({ message: 'Attendance marked successfully' });

  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error');
  }
};



// Common validation function
const validateClassSchedule = (context, schedule, subject, facultyId, room) => {
    if (!context || !schedule || !subject || !facultyId || !room) {
        return { isValid: false, message: "Missing required fields (context, schedule, subject, facultyId, room)" };
    }

    if (!context.branch || !context.semester || !context.section) {
        return { isValid: false, message: "Missing context fields (branch, semester, section)" };
    }

    if (!schedule.day || schedule.day.length === 0 || !schedule.startTime || !schedule.endTime) {
        return { isValid: false, message: "Missing schedule fields (days[], startTime, endTime)" };
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(schedule.startTime) || !timeRegex.test(schedule.endTime)) {
        return { isValid: false, message: "Invalid time format (use HH:MM)" };
    }

    if (schedule.startTime >= schedule.endTime) {
        return { isValid: false, message: "End time must be after start time" };
    }

    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const newStart = timeToMinutes(schedule.startTime);
    const newEnd = timeToMinutes(schedule.endTime);

    if (newEnd - newStart < 30) {
        return { isValid: false, message: "Class duration must be at least 30 minutes" };
    }

    return { isValid: true, newStart, newEnd };
};

// Common conflict checking function
const checkConflicts = async (context, schedule, facultyId, room, excludeId = null) => {
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const newStart = timeToMinutes(schedule.startTime);
    const newEnd = timeToMinutes(schedule.endTime);

    // Check room conflicts
    const roomQuery = { room };
    if (excludeId) roomQuery._id = { $ne: excludeId };
    const roomConflicts = await ClassModel.find(roomQuery);
    
    const hasRoomConflict = roomConflicts.some(classItem => 
        classItem.schedule.days.some(day => 
            schedule.days.includes(day) &&
            timeToMinutes(classItem.schedule.startTime) < newEnd &&
            timeToMinutes(classItem.schedule.endTime) > newStart
        )
    );

    if (hasRoomConflict) {
        const conflictingClass = roomConflicts.find(classItem => 
            classItem.schedule.days.some(day => 
                schedule.days.includes(day) &&
                timeToMinutes(classItem.schedule.startTime) < newEnd &&
                timeToMinutes(classItem.schedule.endTime) > newStart
            )
        );
        return {
            hasConflict: true,
            conflict: {
                type: 'room',
                message: `Room ${room} is already booked on ${conflictingClass.schedule.days.find(d => schedule.days.includes(d))} from ${conflictingClass.schedule.startTime} to ${conflictingClass.schedule.endTime} for ${conflictingClass.subject}`,
                existingSlot: {
                    subject: conflictingClass.subject,
                    facultyId: conflictingClass.facultyId,
                    day: conflictingClass.schedule.days,
                    time: `${conflictingClass.schedule.startTime}-${conflictingClass.schedule.endTime}`
                }
            }
        };
    }

    // Check faculty conflicts
    const facultyQuery = { facultyId };
    if (excludeId) facultyQuery._id = { $ne: excludeId };
    const facultyConflicts = await ClassModel.find(facultyQuery);
    
    const hasFacultyConflict = facultyConflicts.some(classItem => 
        classItem.schedule.days.some(day => 
            schedule.days.includes(day) &&
            timeToMinutes(classItem.schedule.startTime) < newEnd &&
            timeToMinutes(classItem.schedule.endTime) > newStart
        )
    );

    if (hasFacultyConflict) {
        const conflictingClass = facultyConflicts.find(classItem => 
            classItem.schedule.days.some(day => 
                schedule.days.includes(day) &&
                timeToMinutes(classItem.schedule.startTime) < newEnd &&
                timeToMinutes(classItem.schedule.endTime) > newStart
            )
        );
        return {
            hasConflict: true,
            conflict: {
                type: 'faculty',
                message: `Faculty ${facultyId} is already teaching ${conflictingClass.subject} in ${conflictingClass.room} on ${conflictingClass.schedule.days.find(d => schedule.days.includes(d))} from ${conflictingClass.schedule.startTime} to ${conflictingClass.schedule.endTime}`,
                existingSlot: {
                    subject: conflictingClass.subject,
                    room: conflictingClass.room,
                    day: conflictingClass.schedule.days,
                    time: `${conflictingClass.schedule.startTime}-${conflictingClass.schedule.endTime}`
                }
            }
        };
    }

    // Check section conflicts
    const sectionQuery = {
        'context.branch': context.branch,
        'context.semester': context.semester,
        'context.section': context.section
    };
    if (excludeId) sectionQuery._id = { $ne: excludeId };
    const sectionConflicts = await ClassModel.find(sectionQuery);
    
    const hasSectionConflict = sectionConflicts.some(classItem => 
        classItem.schedule.days.some(day => 
            schedule.days.includes(day) &&
            timeToMinutes(classItem.schedule.startTime) < newEnd &&
            timeToMinutes(classItem.schedule.endTime) > newStart
        )
    );

    if (hasSectionConflict) {
        const conflictingClass = sectionConflicts.find(classItem => 
            classItem.schedule.days.some(day => 
                schedule.days.includes(day) &&
                timeToMinutes(classItem.schedule.startTime) < newEnd &&
                timeToMinutes(classItem.schedule.endTime) > newStart
            )
        );
        return {
            hasConflict: true,
            conflict: {
                type: 'section',
                message: `${context.section} already has ${conflictingClass.subject} with faculty ${conflictingClass.facultyId} on ${conflictingClass.schedule.days.find(d => schedule.days.includes(d))} from ${conflictingClass.schedule.startTime} to ${conflictingClass.schedule.endTime}`,
                existingSlot: {
                    subject: conflictingClass.subject,
                    facultyId: conflictingClass.facultyId,
                    day: conflictingClass.schedule.days,
                    time: `${conflictingClass.schedule.startTime}-${conflictingClass.schedule.endTime}`
                }
            }
        };
    }

    return { hasConflict: false };
};


export const createClassSchedule = async (req, res) => {
  try {
    const {
      context,
      schedule,
      subject,
      facultyId,
      room,
      classType = 'lecture',
      notes = '',
      createdBy
    } = req.body;
    // console.log(req.body);
    // Validate input
    const validation = validateClassSchedule(context, schedule, subject, facultyId, room);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Check for schedule/faculty/room conflicts
    const conflictCheck = await checkConflicts(context, schedule, facultyId, room);
    if (conflictCheck.hasConflict) {
      return res.status(400).json({
        success: false,
        message: conflictCheck.conflict.message,
        conflict: conflictCheck.conflict
      });
    }

    // ✅ Updated student query based on new schema (no nested studentDetails)
    const students = await UserModel.find({
      userRole: 'student',
      branch: context.branch,
      semester: context.semester
    }).select('_id');

    const studentIds = students.map(student => student._id);

    // Initialize attendance records with all students as absent
    const initialAttendanceRecords = studentIds.map(studentId => ({
      studentId,
      status: "absent"
    }));

    // Create and save new class
    const newClass = new ClassModel({
      name: `${subject} - ${context.section}`,
      subject,
      facultyId,
      context: {
        branch: context.branch,
        semester: context.semester,
        section: context.section
      },
      schedule: {
        days: schedule.days,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        pattern: schedule.pattern || 'weekly'
      },
      room,
      classType,
      status: 'active',
      attendanceRecords: [{
        date: new Date(),
        records: initialAttendanceRecords
      }],
      notes,
      createdBy: createdBy || null
    });

    await newClass.save();

    return res.status(201).json({
      success: true,
      message: "Class schedule created successfully with student enrollment!",
      data: newClass
    });

  } catch (error) {
    console.error("Error creating class schedule:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


export const updateClassSchedule = async (req, res) => {
  try {
      const { id } = req.params;
      const { context, schedule, subject, facultyId, room, classType, notes } = req.body;

      // Validate input
      const validation = validateClassSchedule(context, schedule, subject, facultyId, room);
      if (!validation.isValid) {
          return res.status(400).json({
              success: false,
              message: validation.message
          });
      }

      // Check for conflicts (excluding current class)
      const conflictCheck = await checkConflicts(context, schedule, facultyId, room, id);
      if (conflictCheck.hasConflict) {
          return res.status(400).json({
              success: false,
              message: conflictCheck.conflict.message,
              conflict: conflictCheck.conflict
          });
      }

      // Get existing class to preserve attendance records
      const existingClass = await ClassModel.findById(id);
      if (!existingClass) {
          return res.status(404).json({
              success: false,
              message: "Class schedule not found"
          });
      }

      // Update class schedule while preserving existing attendance records
      const updatedClass = await ClassModel.findByIdAndUpdate(
          id,
          {
              name: `${subject} - ${context.section}`,
              subject,
              facultyId,
              context: {
                  branch: context.branch,
                  semester: context.semester,
                  section: context.section
              },
              schedule: {
                  days: schedule.days,
                  startTime: schedule.startTime,
                  endTime: schedule.endTime,
                  pattern: schedule.pattern || 'weekly'
              },
              room,
              classType,
              attendanceRecords: existingClass.attendanceRecords, // Preserve existing records
              notes
          },
          { new: true }
      ).populate('facultyId', 'name email')
       .populate('attendanceRecords.records.studentId', 'name regno');

      return res.status(200).json({
          success: true,
          message: "Class schedule updated successfully!",
          data: updatedClass
      });

  } catch (error) {
      console.error("Error updating class schedule:", error);
      return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
      });
  }
};

export const getClassSchedules = async (req, res) => {
  try {
      const { branch, section, facultyId, room, status } = req.query;
      
      let query = {};
      if (branch) query['context.branch'] = branch;
      if (section) query['context.section'] = section;
      if (facultyId) query['facultyId'] = facultyId;
      if (room) query['room'] = room;
      if (status) query['status'] = status;

      const classSchedules = await ClassModel.find(query)
          .populate('facultyId', 'name email')
          .populate('attendanceRecords.records.studentId', 'name regno')
          .populate('createdBy', 'name');
      
      // Get unique values for filters
      const branches = await ClassModel.distinct('context.branch');
      const sections = await ClassModel.distinct('context.section');
      const teachers = await ClassModel.distinct('facultyId');
      const rooms = await ClassModel.distinct('room');
      const statuses = await ClassModel.distinct('status');

      res.status(200).json({
          success: true,
          data: classSchedules,
          filters: { 
              branches, 
              sections,
              teachers, 
              rooms,
              statuses
          }
      });

  } catch (error) {
      console.error("Error fetching class schedules:", error);
      res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
      });
  }
};

export const deleteClassSchedule = async (req, res) => {
  try {
      const { id } = req.params;
      const deletedClass = await ClassModel.findByIdAndDelete(id)
          .populate('facultyId', 'name email')
          .populate('createdBy', 'name');
      
      if (!deletedClass) {
          return res.status(404).json({
              success: false,
              message: "Class schedule not found"
          });
      }

      res.status(200).json({
          success: true,
          message: "Class schedule deleted successfully",
          data: deletedClass
      });
  } catch (error) {
      console.error("Error deleting class schedule:", error);
      res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message
      });
  }
};

export const getRooms=async (req,res)=>{
  try {
    const rooms = await Room.find({})
      .select('_id room location')
      .lean(); // Convert to plain JavaScript objects

    // Format the response with room details
    const formattedRooms = rooms.map(room => ({
      _id: room._id,
      name: room.room,
      building: room.location ? 'Building ' + room.location.coordinates.join(', ') : 'Unknown'
    }));

    res.status(200).json({
      success: true,
      data: formattedRooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message
    });
  }
};

export const getTeachers=async (req,res)=>{
  try {
    const teachers = await UserModel.find({ userRole: 'teacher' })
      .select('_id name email branch')
      .lean();

    // Format the response with teacher details
    const formattedTeachers = teachers.map(teacher => ({
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      branch: teacher.branch || 'Not specified'
    }));
    console.log(teachers);

    res.status(200).json({
      success: true,
      data: formattedTeachers || []
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teachers',
      error: error.message
    });
  }
};