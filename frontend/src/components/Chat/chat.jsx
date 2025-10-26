// src/components/ChatBox.jsx
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

  const [searchParams, setSearchParams] = useSearchParams();
  const initialReceiverId = searchParams.get('user');

  const [usersWithUnread, setUsersWithUnread] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState(initialReceiverId || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
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
      const others = res.data.filter(user => user._id !== currentUserId);

      const usersWithCounts = await Promise.all(
        others.map(async (user) => {
          try {
            const unreadRes = await axios.get(`${backendUrl}/chat/unread/${user._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            return { ...user, unreadCount: unreadRes.data.unreadCount || 0 };
          } catch {
            return { ...user, unreadCount: 0 };
          }
        })
      );
      setUsersWithUnread(usersWithCounts);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load chat users");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (targetUserId) => {
    try {
      await axios.post(`${backendUrl}/chat/markRead/${targetUserId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsersWithUnread();
      
      // Update local messages status
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
    setSelectedUser(user);
    if (user.unreadCount > 0) markAsRead(user._id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = usersWithUnread.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Update URL when receiver changes
  useEffect(() => {
    if (receiverId) {
      setSearchParams({ user: receiverId });
    } else {
      setSearchParams({});
    }
  }, [receiverId, setSearchParams]);

  // Fetch messages when receiver changes
  useEffect(() => {
    if (!receiverId || !currentUserId) {
      setMessages([]);
      setSelectedUser(null);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setMessages([]);
      try {
        const { data } = await axios.get(
          `${backendUrl}/getMessages/${receiverId}`,
          {
            params: { currentUserId },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setMessages(data || []);
        
        // Set selected user info
        const user = usersWithUnread.find(u => u._id === receiverId);
        if (user) setSelectedUser(user);
      } catch (err) {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [receiverId, currentUserId, token]);

  // Socket effects
  useEffect(() => {
    if (currentUserId) {
      fetchUsersWithUnread();
      socket.emit("join", currentUserId);

      socket.off("receiveMessage");
      socket.on("receiveMessage", (data) => {
        setMessages((prev) => [...prev, data]);
        if (data.receiverId === currentUserId && data.senderId !== receiverId) {
          fetchUsersWithUnread();
        }
      });

      socket.off("getOnlineUsers");
      socket.on("getOnlineUsers", (onlineUsersList) => {
        setOnlineUsers(onlineUsersList);
      });

      socket.off("messageDeleted");
      socket.on("messageDeleted", (messageId) => {
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
    }

    return () => {
      socket.off("receiveMessage");
      socket.off("getOnlineUsers");
      socket.off("messageDeleted");
      socket.off("messageStatusUpdate");
    };
  }, [currentUserId, receiverId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${backendUrl}/DeleteMsg/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      socket.emit("deleteMessage", { messageId, receiverId });

      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleSend = async () => {
    if (isSending) return; // Prevent multiple sends
    
    try {
      if (!message.trim() && !selectedFile) return;
      if (!receiverId) {
        toast.error("Please select a user to chat with.");
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

        fileUrl = res.data.file;
        const newMessage = {
          ...res.data,
          status: 'sent',
          createdAt: new Date()
        };

        socket.emit("sendMessage", newMessage);
        setMessages((prev) => [...prev, newMessage]);
        setMessage("");
        setSelectedFile(null);
      } else {
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
    if (message.senderId !== currentUserId) return null;

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
                placeholder="Search contacts..."
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

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {isSidebarOpen && <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contacts</h3>}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      receiverId === user._id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                        : 'hover:bg-gray-50 border border-gray-100'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        receiverId === user._id ? 'bg-white/20' : 'bg-gradient-to-r from-blue-100 to-purple-100'
                      }`}>
                        <span className={`font-medium text-sm ${
                          receiverId === user._id ? 'text-white' : 'text-blue-600'
                        }`}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      {onlineUsers.includes(user._id) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    {isSidebarOpen && (
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium truncate ${
                            receiverId === user._id ? 'text-white' : 'text-gray-800'
                          }`}>
                            {user.name}
                          </p>
                          {user.unreadCount > 0 && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              receiverId === user._id 
                                ? 'bg-white text-blue-600' 
                                : 'bg-red-500 text-white'
                            }`}>
                              {user.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${
                          receiverId === user._id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                {filteredUsers.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-gray-500">
                    No contacts found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {receiverId ? (
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
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {selectedUser?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-800">{selectedUser?.name}</h2>
                      <p className="text-sm text-gray-500 flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          onlineUsers.includes(receiverId) ? 'bg-green-400' : 'bg-gray-400'
                        }`}></span>
                        {onlineUsers.includes(receiverId) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
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
                      <div key={msg._id || index} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative group max-w-xs lg:max-w-md ${msg.senderId === currentUserId ? 'ml-12' : 'mr-12'}`}>
                          <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                            msg.senderId === currentUserId 
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
                              msg.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">
                                {formatMessageTime(msg.createdAt)}
                              </span>
                              {renderMessageStatus(msg)}
                            </div>
                          </div>
                          
                          {/* Delete button */}
                          {msg.senderId === currentUserId && (
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
                      placeholder="Type a message..."
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
              <p className="text-gray-600 mb-6">Select a contact from the sidebar to start messaging</p>
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
    </div>
  );
};

export default ChatBox;