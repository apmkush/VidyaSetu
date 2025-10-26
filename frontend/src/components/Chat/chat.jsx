import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'react-router-dom';
import socket from "../../socket";
import axios from "axios";
import { useSelector } from 'react-redux';
import { FileIcon } from 'react-file-icon';
import { backendUrl } from '../../service/url';
import { toast } from 'react-toastify';

const ChatBox = () => {
  const { token, user } = useSelector(state => state.auth);
  const currentUserId = user?._id;
  const currentUserRole = user?.userRole;

  const [searchParams, setSearchParams] = useSearchParams();
  const initialReceiverId = searchParams.get('user');
  const initialGroupId = searchParams.get('group');

  const [usersWithUnread, setUsersWithUnread] = useState([]);
  const [groups, setGroups] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState(initialReceiverId || null);
  const [groupId, setGroupId] = useState(initialGroupId || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    memberIds: [],
    isClassGroup: false,
    classInfo: {
      branch: "",
      semester: "",
      section: "",
      batchYear: new Date().getFullYear()
    }
  });
  const [availableStudents, setAvailableStudents] = useState([]);
  const [chatType, setChatType] = useState('individual'); // 'individual' or 'group'

  const chatEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Early return should be after all hooks
  if (!token || !currentUserId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h3>
            <p className="text-gray-600">Please log in to access the chat</p>
          </div>
        </div>
      </div>
    );
  }

  const fetchUsersWithUnread = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/chat/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const usersData = res.data.users || res.data;
      const others = usersData.filter(user => user._id !== currentUserId);
      const groupsData = res.data.groups || [];

      const usersWithCounts = await Promise.all(
        others.map(async (user) => {
          try {
            const unreadRes = await axios.get(`${backendUrl}/chat/unread/${user._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return { ...user, unreadCount: unreadRes.data.unreadCount || 0, type: 'user' };
          } catch {
            return { ...user, unreadCount: 0, type: 'user' };
          }
        })
      );

      setUsersWithUnread(usersWithCounts);
      setGroups(groupsData.map(group => ({ ...group, type: 'group' })));
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load chat users");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async (filters = {}) => {
    try {
      console.log("Fetching students with filters:", filters);
      
      // First, get all students
      const allRes = await axios.get(`${backendUrl}/chat/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allUsers = allRes.data.users || allRes.data;
      let students = allUsers.filter(user => 
        user.userRole === 'student' && user._id !== currentUserId
      );

      // Apply filters flexibly - only filter by what's provided
      let appliedFilters = [];
      
      if (filters.branch) {
        students = students.filter(user => user.branch === filters.branch);
        appliedFilters.push(`Branch: ${filters.branch}`);
      }
      
      if (filters.semester) {
        students = students.filter(user => user.semester === parseInt(filters.semester));
        appliedFilters.push(`Semester: ${filters.semester}`);
      }
      
      if (filters.section) {
        students = students.filter(user => user.section === filters.section);
        appliedFilters.push(`Section: ${filters.section}`);
      }
      
      if (filters.batchYear) {
        students = students.filter(user => user.batchYear === parseInt(filters.batchYear));
        appliedFilters.push(`Batch: ${filters.batchYear}`);
      }

      console.log(`Found ${students.length} students after applying ${appliedFilters.length} filters`);
      
      // Show appropriate message
      if (appliedFilters.length === 0) {
        toast.info(`Showing all ${students.length} students`);
      } else {
        const filterText = appliedFilters.join(', ');
        if (students.length === 0) {
          toast.info(`No students found for: ${filterText}`);
        } else {
          toast.success(`Found ${students.length} students for: ${filterText}`);
        }
      }
      
      setAvailableStudents(students);
      
    } catch (err) {
      console.error("Failed to fetch students:", err);
      toast.error("Failed to load students");
      setAvailableStudents([]);
    }
  };

  const markAsRead = async (targetUserId) => {
    try {
      await axios.post(`${backendUrl}/chat/markRead/${targetUserId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsersWithUnread();
      
      setMessages(prev => prev.map(msg => 
        msg.senderId === targetUserId 
          ? { ...msg, status: 'read', readAt: new Date() }
          : msg
      ));
    } catch (err) {
      console.error("Mark as read failed:", err);
      toast.error("Failed to mark as read");
    }
  };

  const handleUserSelect = (user) => {
    setReceiverId(user._id);
    setGroupId(null);
    setSelectedUser(user);
    setSelectedGroup(null);
    setChatType('individual');
    if (user.unreadCount > 0) markAsRead(user._id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleGroupSelect = (group) => {
    setGroupId(group._id);
    setReceiverId(null);
    setSelectedGroup(group);
    setSelectedUser(null);
    setChatType('group');
    
    // Join socket room for this group
    socket.emit("joinGroup", group._id);
    
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const createGroup = async () => {
    try {
      if (!newGroup.name.trim()) {
        toast.error("Group name is required");
        return;
      }

      if (newGroup.memberIds.length === 0) {
        toast.error("Please select at least one member");
        return;
      }

      console.log(newGroup) ; 
      console.log(token) ; 

      const res = await axios.post(`${backendUrl}/groups`, newGroup, {
        headers: { Authorization: `Bearer ${token}` }
      });


      if (res.data.success) {
        toast.success("Group created successfully");
        setShowCreateGroupModal(false);
        setNewGroup({
          name: "",
          description: "",
          memberIds: [],
          isClassGroup: false,
          classInfo: { branch: "", semester: "", section: "", batchYear: new Date().getFullYear() }
        });
        fetchUsersWithUnread();
        
        // Notify members via socket
        socket.emit("groupCreated", res.data.group);
      }
    } catch (err) {
      console.error("Failed to create group:", err);
      toast.error("Failed to create group");
    }
  };

  const handleClassGroupChange = (e) => {
    const isClassGroup = e.target.checked;
    setNewGroup(prev => ({
      ...prev,
      isClassGroup,
      memberIds: [] // Clear selected members when switching type
    }));

    if (isClassGroup && currentUserRole === 'teacher') {
      // Pre-fill class info based on teacher's details
      setNewGroup(prev => ({
        ...prev,
        classInfo: {
          branch: user.branch || "",
          semester: "",
          section: "",
          batchYear: new Date().getFullYear()
        }
      }));
    }
  };

  const handleClassInfoChange = (field, value) => {
    setNewGroup(prev => ({
      ...prev,
      classInfo: {
        ...prev.classInfo,
        [field]: value
      }
    }));

    // Auto-fetch students whenever any class info changes
    if (field && value) {
      fetchAvailableStudents({
        branch: newGroup.classInfo.branch,
        semester: newGroup.classInfo.semester,
        section: newGroup.classInfo.section,
        batchYear: newGroup.classInfo.batchYear
      });
    }
  };

  const toggleMemberSelection = (memberId) => {
    setNewGroup(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter(id => id !== memberId)
        : [...prev.memberIds, memberId]
    }));
  };

  const selectAllStudents = () => {
    setNewGroup(prev => ({
      ...prev,
      memberIds: availableStudents.map(student => student._id)
    }));
  };

  // Filter users and groups based on search query
  const filteredContacts = [...usersWithUnread, ...groups].filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update URL when receiver/group changes
  useEffect(() => {
    if (receiverId) {
      setSearchParams({ user: receiverId });
    } else if (groupId) {
      setSearchParams({ group: groupId });
    } else {
      setSearchParams({});
    }
  }, [receiverId, groupId, setSearchParams]);

  // Fetch messages when receiver/group changes
  useEffect(() => {
    if (!receiverId && !groupId) {
      setMessages([]);
      setSelectedUser(null);
      setSelectedGroup(null);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setMessages([]);
      try {
        if (receiverId) {
          // Individual chat
          const { data } = await axios.get(
            `${backendUrl}/getMessages/${receiverId}`,
            {
              params: { currentUserId },
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setMessages(data || []);
          
          const user = usersWithUnread.find(u => u._id === receiverId);
          if (user) setSelectedUser(user);
        } else if (groupId) {
          // Group chat
          const { data } = await axios.get(
            `${backendUrl}/groups/${groupId}/messages`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setMessages(data.messages || []);
          
          const group = groups.find(g => g._id === groupId);
          if (group) setSelectedGroup(group);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [receiverId, groupId, currentUserId, token]);

  // Socket effects
  useEffect(() => {
    if (currentUserId) {
      fetchUsersWithUnread();
      socket.emit("join", currentUserId);

      socket.off("receiveMessage");
      socket.on("receiveMessage", (data) => {
        if (receiverId === data.senderId) {
          setMessages((prev) => [...prev, data]);
        }
        if (data.receiverId === currentUserId && data.senderId !== receiverId) {
          fetchUsersWithUnread();
        }
      });

      socket.off("receiveGroupMessage");
      socket.on("receiveGroupMessage", (data) => {
        if (groupId === data.groupId) {
          setMessages((prev) => [...prev, data]);
        }
        fetchUsersWithUnread();
      });

      socket.off("getOnlineUsers");
      socket.on("getOnlineUsers", (onlineUsersList) => {
        setOnlineUsers(onlineUsersList);
      });

      socket.off("messageDeleted");
      socket.on("messageDeleted", (messageId) => {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      });

      socket.off("groupMessageDeleted");
      socket.on("groupMessageDeleted", (messageId) => {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      });

      socket.off("messageStatusUpdate");
      socket.on("messageStatusUpdate", ({ messageId, status, deliveredAt, readAt }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, status, deliveredAt, readAt }
            : msg
        ));
      });

      socket.off("newGroup");
      socket.on("newGroup", (group) => {
        fetchUsersWithUnread();
        toast.success(`Added to group: ${group.name}`);
      });

      socket.off("addedToGroup");
      socket.on("addedToGroup", (groupId) => {
        fetchUsersWithUnread();
        toast.success("You've been added to a new group");
      });

      socket.off("removedFromGroup");
      socket.on("removedFromGroup", (groupId) => {
        fetchUsersWithUnread();
        if (groupId === groupId) {
          setGroupId(null);
          setSelectedGroup(null);
          setMessages([]);
        }
        toast.info("You've been removed from a group");
      });
    }

    return () => {
      socket.off("receiveMessage");
      socket.off("receiveGroupMessage");
      socket.off("getOnlineUsers");
      socket.off("messageDeleted");
      socket.off("groupMessageDeleted");
      socket.off("messageStatusUpdate");
      socket.off("newGroup");
      socket.off("addedToGroup");
      socket.off("removedFromGroup");
    };
  }, [currentUserId, receiverId, groupId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteMessage = async (messageId) => {
    try {
      if (chatType === 'individual') {
        await axios.delete(`${backendUrl}/DeleteMsg/${messageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        socket.emit("deleteMessage", { messageId, receiverId });
      } else {
        // For group messages, you might want to add a separate endpoint
        await axios.delete(`${backendUrl}/DeleteMsg/${messageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        socket.emit("deleteGroupMessage", { messageId, groupId });
      }
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleSend = async () => {
    if (isSending) return;
    
    try {
      if (!message.trim() && !selectedFile) return;
      
      if (chatType === 'individual' && !receiverId) {
        toast.error("Please select a user to chat with.");
        return;
      }
      
      if (chatType === 'group' && !groupId) {
        toast.error("Please select a group to chat in.");
        return;
      }

      setIsSending(true);
      let fileUrl = null;
      let fileType = null;

      if (selectedFile && selectedFile.size > 0) {
        if (!(selectedFile instanceof File || selectedFile instanceof Blob)) {
          throw new Error("Invalid file selected");
        }

        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        fileType = selectedFile.type;

        if (chatType === 'individual') {
          const res = await axios.post(
            `${backendUrl}/sendMessage/${receiverId}`,
            { 
              text: message,
              senderId: currentUserId,
              file: base64Data,
              fileType
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          const newMessage = {
            ...res.data,
            status: 'sent',
            createdAt: new Date()
          };

          socket.emit("sendMessage", newMessage);
          setMessages((prev) => [...prev, newMessage]);
        } else {
          const res = await axios.post(
            `${backendUrl}/groups/${groupId}/messages`,
            { 
              text: message,
              file: base64Data,
              fileType
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          const newMessage = {
            ...res.data.message,
            status: 'sent',
            createdAt: new Date()
          };

          socket.emit("sendGroupMessage", newMessage);
          setMessages((prev) => [...prev, newMessage]);
        }

        setMessage("");
        setSelectedFile(null);
      } else {
        if (chatType === 'individual') {
          const res = await axios.post(
            `${backendUrl}/sendMessage/${receiverId}`,
            { 
              text: message,
              senderId: currentUserId 
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const newMessage = {
            ...res.data,
            status: 'sent',
            createdAt: new Date()
          };

          socket.emit("sendMessage", newMessage);
          setMessages((prev) => [...prev, newMessage]);
        } else {
          const res = await axios.post(
            `${backendUrl}/groups/${groupId}/messages`,
            { 
              text: message
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const newMessage = {
            ...res.data.message,
            status: 'sent',
            createdAt: new Date()
          };

          socket.emit("sendGroupMessage", newMessage);
          setMessages((prev) => [...prev, newMessage]);
        }

        setMessage("");
      }
    } catch (error) {
      console.error("Message send error: ", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatTime(timestamp);
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return '';
    }
  };

  const renderMessageStatus = (message) => {
    if (chatType === 'group' || message.senderId !== currentUserId) return null;

    let statusIcon;
    let statusColor;

    switch (message.status) {
      case 'read':
        statusIcon = (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
          </svg>
        );
        statusColor = "text-blue-500";
        break;
      case 'delivered':
        statusIcon = (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
          </svg>
        );
        statusColor = "text-gray-500";
        break;
      default: // sent
        statusIcon = (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
          </svg>
        );
        statusColor = "text-gray-400";
        break;
    }

    return (
      <div className={`flex items-center ${statusColor} ml-1`}>
        {statusIcon}
      </div>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isUserAdmin = (group) => {
    return group.admins.some(admin => admin._id === currentUserId);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0 md:w-20'} bg-white shadow-xl transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-xs text-green-500">● Online</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarOpen ? (
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Search Bar */}
        {isSidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search contacts or groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}

        {/* Create Group Button (Teachers only) */}
        {isSidebarOpen && currentUserRole === 'teacher' && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-2 px-4 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Group</span>
            </button>
          </div>
        )}

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {isSidebarOpen && <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Chats</h3>}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map(contact => (
                  <div
                    key={contact._id}
                    onClick={() => contact.type === 'user' ? handleUserSelect(contact) : handleGroupSelect(contact)}
                    className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      (receiverId === contact._id || groupId === contact._id)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'hover:bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        (receiverId === contact._id || groupId === contact._id) 
                          ? 'bg-white/20' 
                          : contact.type === 'group' 
                            ? 'bg-gradient-to-r from-green-100 to-blue-100' 
                            : 'bg-gradient-to-r from-blue-100 to-purple-100'
                      }`}>
                        {contact.type === 'group' ? (
                          <svg className={`w-5 h-5 ${(receiverId === contact._id || groupId === contact._id) ? 'text-white' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        ) : (
                          <span className={`font-medium text-sm ${
                            (receiverId === contact._id || groupId === contact._id) ? 'text-white' : 'text-blue-600'
                          }`}>
                            {contact.name?.charAt(0)?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {contact.type === 'user' && onlineUsers.includes(contact._id) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                      )}
                      {contact.type === 'group' && isUserAdmin(contact) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 border-2 border-white rounded-full" title="Admin"></div>
                      )}
                    </div>
                    
                    {isSidebarOpen && (
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium truncate ${
                            (receiverId === contact._id || groupId === contact._id) ? 'text-white' : 'text-gray-800'
                          }`}>
                            {contact.name}
                            {contact.type === 'group' && (
                              <span className="text-xs ml-1 opacity-75">({contact.members?.length})</span>
                            )}
                          </p>
                          {contact.unreadCount > 0 && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (receiverId === contact._id || groupId === contact._id) 
                                ? 'bg-white text-blue-600' 
                                : 'bg-red-500 text-white'
                            }`}>
                              {contact.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${
                          (receiverId === contact._id || groupId === contact._id) ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {contact.type === 'user' 
                            ? (onlineUsers.includes(contact._id) ? 'Online' : 'Offline')
                            : 'Group'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {filteredContacts.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-gray-500">
                    No contacts or groups found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {receiverId || groupId ? (
          <>
            {/* Chat Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      chatType === 'group' 
                        ? 'bg-gradient-to-r from-green-400 to-blue-500' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}>
                      {chatType === 'group' ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {selectedUser?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-800">
                        {chatType === 'group' ? selectedGroup?.name : selectedUser?.name}
                        {chatType === 'group' && isUserAdmin(selectedGroup) && (
                          <span className="text-xs text-yellow-600 ml-2" title="You are admin">👑</span>
                        )}
                      </h2>
                      <p className="text-sm text-gray-500 flex items-center">
                        {chatType === 'group' ? (
                          <span>{selectedGroup?.members?.length} members</span>
                        ) : (
                          <>
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              onlineUsers.includes(receiverId) ? 'bg-green-400' : 'bg-gray-400'
                            }`}></span>
                            {onlineUsers.includes(receiverId) ? 'Online' : 'Offline'}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                {chatType === 'group' && (
                  <button
                    onClick={() => setShowGroupDetailsModal(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Group Info"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden bg-gradient-to-b from-white to-blue-50">
              <div className="h-full overflow-y-auto px-4 py-6">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center text-gray-500">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">No messages yet</p>
                      <p className="text-sm">Start a conversation by sending a message</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div key={msg._id || index} className={`flex ${
                        (chatType === 'individual' && msg.senderId === currentUserId) || 
                        (chatType === 'group' && msg.senderId._id === currentUserId) 
                          ? 'justify-end' 
                          : 'justify-start'
                      }`}>
                        <div className={`relative group max-w-xs lg:max-w-md ${
                          (chatType === 'individual' && msg.senderId === currentUserId) || 
                          (chatType === 'group' && msg.senderId._id === currentUserId) 
                            ? 'ml-12' 
                            : 'mr-12'
                        }`}>
                          {/* Group message sender name */}
                          {chatType === 'group' && msg.senderId._id !== currentUserId && (
                            <p className="text-xs text-gray-500 mb-1 font-medium">
                              {msg.senderId.name}
                            </p>
                          )}
                          
                          <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                            (chatType === 'individual' && msg.senderId === currentUserId) || 
                            (chatType === 'group' && msg.senderId._id === currentUserId)
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none' 
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                          }`}>
                            {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                            
                            {msg.file && (
                              <div className="mt-2">
                                {msg.fileType?.startsWith('image/') ? (
                                  <div className="relative rounded-lg overflow-hidden">
                                    <img 
                                      src={msg.file} 
                                      alt="Shared content" 
                                      className="max-w-full h-auto rounded-lg shadow-md"
                                    />
                                    <a 
                                      href={msg.file} 
                                      download
                                      className="absolute bottom-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </a>
                                  </div>
                                ) : msg.fileType?.startsWith('video/') ? (
                                  <div className="relative rounded-lg overflow-hidden">
                                    <video 
                                      controls 
                                      className="max-w-full h-auto rounded-lg shadow-md"
                                      playsInline
                                      preload="metadata"
                                    >
                                      <source src={msg.file} type={msg.fileType} />
                                    </video>
                                    <a
                                      href={msg.file}
                                      download
                                      className="absolute bottom-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </a>
                                  </div>
                                ) : (
                                  <a 
                                    href={msg.file} 
                                    download
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                  >
                                    <FileIcon extension={msg.fileType?.split('/')[1] || 'file'} />
                                    <span className="text-sm font-medium">Download File</span>
                                  </a>
                                )}
                              </div>
                            )}
                            
                            <div className={`flex items-center justify-end mt-2 space-x-2 ${
                              ((chatType === 'individual' && msg.senderId === currentUserId) || 
                              (chatType === 'group' && msg.senderId._id === currentUserId)) 
                                ? 'text-blue-100' 
                                : 'text-gray-500'
                            }`}>
                              <span className="text-xs">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {chatType === 'individual' && renderMessageStatus(msg)}
                            </div>
                          </div>
                          
                          {/* Delete button (only for user's messages) */}
                          {((chatType === 'individual' && msg.senderId === currentUserId) || 
                            (chatType === 'group' && msg.senderId._id === currentUserId)) && (
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:bg-red-600"
                              title="Delete message"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              {selectedFile && (
                <div className="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedFile(null)} 
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex items-end space-x-3">
                <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
                  <div className="px-4 py-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={chatType === 'group' ? "Message the group..." : "Type a message..."}
                      className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 resize-none"
                      onKeyPress={handleKeyPress}
                      disabled={isSending}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf,.docx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="fileUpload"
                    disabled={isSending}
                  />
                  <label 
                    htmlFor="fileUpload" 
                    className={`cursor-pointer p-3 rounded-2xl transition-colors duration-200 ${
                      isSending ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </label>
                  
                  <button
                    onClick={handleSend}
                    disabled={(!message.trim() && !selectedFile) || isSending}
                    className={`p-3 rounded-2xl transition-all duration-200 shadow-lg ${
                      isSending 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl'
                    } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-4">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chat</h3>
              <p className="text-gray-600 mb-6">Select a contact or group from the sidebar to start messaging</p>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Open Contacts
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Create New Group</h3>
                <button
                  onClick={() => setShowCreateGroupModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name *</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group description (optional)"
                  rows="3"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="classGroup"
                  checked={newGroup.isClassGroup}
                  onChange={handleClassGroupChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="classGroup" className="text-sm font-medium text-gray-700">
                  This is a class group
                </label>
              </div>

              {newGroup.isClassGroup && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                    <input
                      type="text"
                      value={newGroup.classInfo.branch}
                      onChange={(e) => handleClassInfoChange('branch', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., CSE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    <input
                      type="number"
                      value={newGroup.classInfo.semester}
                      onChange={(e) => handleClassInfoChange('semester', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                    <input
                      type="text"
                      value={newGroup.classInfo.section}
                      onChange={(e) => handleClassInfoChange('section', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch Year</label>
                    <input
                      type="number"
                      value={newGroup.classInfo.batchYear}
                      onChange={(e) => handleClassInfoChange('batchYear', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2024"
                    />
                  </div>

                  {/* UPDATED BUTTON */}
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Load with whatever filters are currently filled (can be partial)
                        fetchAvailableStudents({
                          branch: newGroup.classInfo.branch,
                          semester: newGroup.classInfo.semester,
                          section: newGroup.classInfo.section,
                          batchYear: newGroup.classInfo.batchYear
                        });
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Load Students
                    </button>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Select Members *</label>
                  {newGroup.isClassGroup && availableStudents.length > 0 && (
                    <button
                      onClick={selectAllStudents}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Select All
                    </button>
                  )}
                </div>
                
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                  {newGroup.isClassGroup && availableStudents.length > 0 ? (
                    availableStudents.map(student => (
                      <div key={student._id} className="flex items-center p-3 border-b border-gray-200 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={newGroup.memberIds.includes(student._id)}
                          onChange={() => toggleMemberSelection(student._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email} • {student.regno}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {newGroup.isClassGroup 
                        ? "Fill in class details to see students" 
                        : "Select members individually from your contacts"}
                    </div>
                  )}
                </div>
                
                {newGroup.memberIds.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {newGroup.memberIds.length} member(s) selected
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                disabled={!newGroup.name.trim() || newGroup.memberIds.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {showGroupDetailsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Group Info</h3>
                <button
                  onClick={() => setShowGroupDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-800">{selectedGroup.name}</h4>
                {selectedGroup.description && (
                  <p className="text-gray-600 mt-1">{selectedGroup.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Created by {selectedGroup.createdBy?.name}
                </p>
                {selectedGroup.isClassGroup && selectedGroup.classInfo && (
                  <p className="text-sm text-gray-500">
                    {selectedGroup.classInfo.branch} - Sem {selectedGroup.classInfo.semester} - Section {selectedGroup.classInfo.section}
                  </p>
                )}
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Members ({selectedGroup.members?.length})
                </h5>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedGroup.members?.map(member => (
                    <div key={member._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-medium">
                            {member.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {member.name}
                            {selectedGroup.admins.some(admin => admin._id === member._id) && (
                              <span className="text-xs text-yellow-600 ml-1" title="Admin">👑</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{member.userRole}</p>
                        </div>
                      </div>
                      {onlineUsers.includes(member._id) && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="Online"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowGroupDetailsModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;