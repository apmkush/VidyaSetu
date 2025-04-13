import { TimetableSlot } from "../models/TimeTableSlot.js";

// Common validation function
const validateTimetableSlot = (context, schedule, subject, teacher, room) => {
    if (!context || !schedule || !subject || !teacher || !room) {
        return { isValid: false, message: "Missing required fields (context, schedule, subject, teacher, room)" };
    }

    if (!context.branch || !context.semester || !context.section) {
        return { isValid: false, message: "Missing context fields (branch, semester, section)" };
    }

    if (!schedule.day || schedule.day.length === 0 || !schedule.startTime || !schedule.endTime) {
        return { isValid: false, message: "Missing schedule fields (day[], startTime, endTime)" };
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
const checkConflicts = async (context, schedule, teacher, room, excludeId = null) => {
    const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const newStart = timeToMinutes(schedule.startTime);
    const newEnd = timeToMinutes(schedule.endTime);

    // Check room conflicts
    const roomQuery = { room };
    if (excludeId) roomQuery._id = { $ne: excludeId };
    const roomConflicts = await TimetableSlot.find(roomQuery);
    
    const hasRoomConflict = roomConflicts.some(slot => 
        slot.schedule.day.some(day => 
            schedule.day.includes(day) &&
            timeToMinutes(slot.schedule.startTime) < newEnd &&
            timeToMinutes(slot.schedule.endTime) > newStart
        )
    );

    if (hasRoomConflict) {
        const conflictingSlot = roomConflicts.find(slot => 
            slot.schedule.day.some(day => 
                schedule.day.includes(day) &&
                timeToMinutes(slot.schedule.startTime) < newEnd &&
                timeToMinutes(slot.schedule.endTime) > newStart
            )
        );
        return {
            hasConflict: true,
            conflict: {
                type: 'room',
                message: `Room ${room} is already booked on ${conflictingSlot.schedule.day.find(d => schedule.day.includes(d))} from ${conflictingSlot.schedule.startTime} to ${conflictingSlot.schedule.endTime} for ${conflictingSlot.subject}`,
                existingSlot: {
                    subject: conflictingSlot.subject,
                    teacher: conflictingSlot.teacher,
                    day: conflictingSlot.schedule.day,
                    time: `${conflictingSlot.schedule.startTime}-${conflictingSlot.schedule.endTime}`
                }
            }
        };
    }

    // Check teacher conflicts
    const teacherQuery = { teacher };
    if (excludeId) teacherQuery._id = { $ne: excludeId };
    const teacherConflicts = await TimetableSlot.find(teacherQuery);
    
    const hasTeacherConflict = teacherConflicts.some(slot => 
        slot.schedule.day.some(day => 
            schedule.day.includes(day) &&
            timeToMinutes(slot.schedule.startTime) < newEnd &&
            timeToMinutes(slot.schedule.endTime) > newStart
        )
    );

    if (hasTeacherConflict) {
        const conflictingSlot = teacherConflicts.find(slot => 
            slot.schedule.day.some(day => 
                schedule.day.includes(day) &&
                timeToMinutes(slot.schedule.startTime) < newEnd &&
                timeToMinutes(slot.schedule.endTime) > newStart
            )
        );
        return {
            hasConflict: true,
            conflict: {
                type: 'teacher',
                message: `Teacher ${teacher} is already teaching ${conflictingSlot.subject} in ${conflictingSlot.room} on ${conflictingSlot.schedule.day.find(d => schedule.day.includes(d))} from ${conflictingSlot.schedule.startTime} to ${conflictingSlot.schedule.endTime}`,
                existingSlot: {
                    subject: conflictingSlot.subject,
                    room: conflictingSlot.room,
                    day: conflictingSlot.schedule.day,
                    time: `${conflictingSlot.schedule.startTime}-${conflictingSlot.schedule.endTime}`
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
    const sectionConflicts = await TimetableSlot.find(sectionQuery);
    
    const hasSectionConflict = sectionConflicts.some(slot => 
        slot.schedule.day.some(day => 
            schedule.day.includes(day) &&
            timeToMinutes(slot.schedule.startTime) < newEnd &&
            timeToMinutes(slot.schedule.endTime) > newStart
        )
    );

    if (hasSectionConflict) {
        const conflictingSlot = sectionConflicts.find(slot => 
            slot.schedule.day.some(day => 
                schedule.day.includes(day) &&
                timeToMinutes(slot.schedule.startTime) < newEnd &&
                timeToMinutes(slot.schedule.endTime) > newStart
            )
        );
        return {
            hasConflict: true,
            conflict: {
                type: 'section',
                message: `${context.section} already has ${conflictingSlot.subject} with ${conflictingSlot.teacher} on ${conflictingSlot.schedule.day.find(d => schedule.day.includes(d))} from ${conflictingSlot.schedule.startTime} to ${conflictingSlot.schedule.endTime}`,
                existingSlot: {
                    subject: conflictingSlot.subject,
                    teacher: conflictingSlot.teacher,
                    day: conflictingSlot.schedule.day,
                    time: `${conflictingSlot.schedule.startTime}-${conflictingSlot.schedule.endTime}`
                }
            }
        };
    }

    return { hasConflict: false };
};

export const createTimeTable = async (req, res) => {
    try {
        const { context, schedule, subject, teacher, room, type = 'lecture', notes = '', createdBy } = req.body;

        // Validate input
        const validation = validateTimetableSlot(context, schedule, subject, teacher, room);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        // Check for conflicts
        const conflictCheck = await checkConflicts(context, schedule, teacher, room);
        if (conflictCheck.hasConflict) {
            return res.status(400).json({
                success: false,
                message: conflictCheck.conflict.message,
                conflict: conflictCheck.conflict
            });
        }

        // Create new timetable slot
        const timetable = new TimetableSlot({
            context: {
                branch: context.branch,
                semester: context.semester,
                section: context.section
            },
            schedule: {
                day: schedule.day,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                pattern: schedule.pattern || 'weekly'
            },
            subject,
            teacher,
            room,
            type,
            status: 'active',
            notes,
            createdBy: createdBy || null
        });

        await timetable.save();

        return res.status(201).json({
            success: true,
            message: "Timetable slot created successfully!",
            data: timetable
        });

    } catch (error) {
        console.error("Error creating timetable slot:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const updateTimetableSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { context, schedule, subject, teacher, room, type, notes } = req.body;

        // Validate input
        const validation = validateTimetableSlot(context, schedule, subject, teacher, room);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        // Check for conflicts (excluding current slot)
        const conflictCheck = await checkConflicts(context, schedule, teacher, room, id);
        if (conflictCheck.hasConflict) {
            return res.status(400).json({
                success: false,
                message: conflictCheck.conflict.message,
                conflict: conflictCheck.conflict
            });
        }

        // Update timetable slot
        const updatedSlot = await TimetableSlot.findByIdAndUpdate(
            id,
            {
                context,
                schedule: {
                    day: schedule.day,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    pattern: schedule.pattern || 'weekly'
                },
                subject,
                teacher,
                room,
                type,
                notes
            },
            { new: true }
        );

        if (!updatedSlot) {
            return res.status(404).json({
                success: false,
                message: "Timetable slot not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Timetable slot updated successfully!",
            data: updatedSlot
        });

    } catch (error) {
        console.error("Error updating timetable slot:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getTimetableData = async (req, res) => {
    try {
        const { branch, section, teacher, room } = req.query;
        
        let query = {};
        if (branch) query['context.branch'] = branch;
        if (section) query['context.section'] = section;
        if (teacher) query['teacher'] = teacher;
        if (room) query['room'] = room;

        const timetableData = await TimetableSlot.find(query);
        
        // Get unique values for filters
        const branches = await TimetableSlot.distinct('context.branch');
        const sections = await TimetableSlot.distinct('context.section');
        const teachers = await TimetableSlot.distinct('teacher');
        const rooms = await TimetableSlot.distinct('room');

        res.status(200).json({
            success: true,
            data: timetableData,
            filters: { 
                branches, 
                sections,
                teachers, 
                rooms 
            }
        });

    } catch (error) {
        console.error("Error fetching timetable:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const deleteTimetableSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSlot = await TimetableSlot.findByIdAndDelete(id);
        
        if (!deletedSlot) {
            return res.status(404).json({
                success: false,
                message: "Timetable slot not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Timetable slot deleted successfully",
            data: deletedSlot
        });
    } catch (error) {
        console.error("Error deleting timetable slot:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};