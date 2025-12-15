import React, { useState, useEffect ,useCallback } from 'react';
import axios from 'axios';
import TimetableSlotForm from './TimetableSlotForm';
import{backendUrl}from '../../service/url';

const TimetableView = () => {
    const [timetableData, setTimetableData] = useState([]);
    const [filters, setFilters] = useState({
        branch: '',
        section: '',
        teacher: '',
        room: ''
    });
    const [availableFilters, setAvailableFilters] = useState({
        branches: [],
        sections: [],
        teachers: [],
        rooms: []
    });
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Time slots configuration
    const timeSlots = [
        { start: '08:00', end: '09:00' },
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:00', end: '12:00' },
        { start: '12:00', end: '13:00', isLunch: true },
        { start: '13:00', end: '14:00' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' },
        { start: '17:00', end: '18:00' }
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    useEffect(() => {
        fetchTimetableData();
    }, [filters]);

    const fetchTimetableData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${backendUrl}/get-timetable`, {
                params: filters
            });
            setTimetableData(response.data.data);
            setAvailableFilters(response.data.filters);
            setLoading(false);
            console.log(availableFilters.teachers);
        } catch (error) {
            console.error('Error fetching timetable:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSlotClick = (day, timeSlot) => {
        if (!editMode) return;
        
        const slot = timetableData.find(item => 
            item.schedule.days.includes(day) &&
            item.schedule.startTime <= timeSlot.start &&
            item.schedule.endTime >= timeSlot.end
        );

        if (slot) {
            setSelectedSlot(slot);
            setShowModal(true);
        } else {
            setSelectedSlot({
                context: {
                    branch: filters.branch || '',
                    semester: '',
                    section: filters.section || ''
                },
                schedule: {
                    days: [day], 
                    startTime: timeSlot.start,
                    endTime: timeSlot.end,
                    pattern: 'weekly'
                },
                subject: '',
                teacher: '',
                room: '',
                type: 'lecture',
                notes: ''
            });
            setShowModal(true);
        }
    };

    const handleUpdateSuccess = useCallback(() => {
        console.log("Check");
        setShowModal(false);
        fetchTimetableData();
      }, [fetchTimetableData]);

    const getSlotContent = (day, timeSlot) => {
        if (timeSlot.isLunch) return 'Lunch Break';
        console.log(timetableData);
        const slot = timetableData.find(item => 
            item.schedule.days.includes(day) &&
            item.schedule.startTime <= timeSlot.start &&
            item.schedule.endTime >= timeSlot.end
        );

        return (
            <div 
                className={`p-1 border rounded ${slot ? 'bg-blue-50' : 'bg-gray-50'} ${editMode ? 'cursor-pointer hover:bg-blue-100' : ''}`}
                onClick={() => handleSlotClick(day, timeSlot)}
            >
                {slot ? (
                    <>
                        <div className="font-semibold">{slot.subject}</div>
                        <div>{slot.teacher?.name || 'No teacher assigned'}</div>
                        <div>{typeof slot.room === 'object' ? slot.room?.name || slot.room?._id : slot.room || 'No room'}</div>
                    </>
                ) : editMode ? (
                    <div className="text-gray-400">Click to add</div>
                ) : null}
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Timetable View</h1>
                <button
                    onClick={() => setEditMode(!editMode)}
                    className={`px-4 py-2 rounded ${editMode ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
                >
                    {editMode ? 'Exit Edit Mode' : 'Edit Timetable'}
                </button>
            </div>
            
            {/* Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block mb-2 font-medium">Branch</label>
                        <select
                            name="branch"
                            value={filters.branch}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">All Branches</option>
                            {availableFilters.branches.map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Section</label>
                        <select
                            name="section"
                            value={filters.section}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">All Sections</option>
                            {availableFilters.sections.map(section => (
                                <option key={section} value={section}>{section}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Teacher</label>
                        <select
                            name="teacher"
                            value={filters.teacher}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">All Teachers</option>
                            {availableFilters.teachers.map(teacher => (
                                <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Room</label>
                        <select
                            name="room"
                            value={filters.room}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">All Rooms</option>
                            {availableFilters.rooms.map(room => {
                                const roomId = typeof room === 'object' ? room._id : room;
                                const roomName = typeof room === 'object' ? room.name : room;
                                return <option key={roomId} value={roomId}>{roomName}</option>;
                            })}
                        </select>
                    </div>
                </div>
            </div>

            {/* Timetable */}
            {loading ? (
                <div className="text-center py-8">Loading timetable...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border">Day/Time</th>
                                {timeSlots.map((timeSlot, index) => (
                                    <th key={index} className="py-2 px-4 border">
                                        {timeSlot.start} - {timeSlot.end}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {days.map(day => (
                                <tr key={day}>
                                    <td className="py-2 px-4 border font-semibold">{day}</td>
                                    {timeSlots.map((timeSlot, index) => (
                                        <td key={index} className="py-2 px-4 border min-w-[100px] h-24">
                                            {getSlotContent(day, timeSlot)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit/Add Slot Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {selectedSlot?._id ? 'Edit Timetable Slot' : 'Add New Slot'}
                            </h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <TimetableSlotForm 
                            slotData={selectedSlot}
                            onSuccess={handleUpdateSuccess}
                            onCancel={() => setShowModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimetableView;