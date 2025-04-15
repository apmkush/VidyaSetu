// src/components/ChatBox.jsx
import React, { useState, useEffect, useRef } from "react";
import socket from "../../socket";
import axios from "axios";
import { useSelector } from 'react-redux';
import {FileIcon} from 'react-file-icon';

const ChatBox = () => {
  
  const User = useSelector(state => state.auth.user);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState(null);
  const [selectedFile,setSelectedFile]=useState([]);
  const chatEndRef = useRef(null);
  const currentUserId=User._id;
  // const receiverId="anjdf";


  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/chat/users",{currentUserId});
      // Exclude self from list
      const others = res.data.filter(user => user._id !== currentUserId);
      setUsers(others);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    // Only fetch messages if a receiver is selected and current user exists
    if (!receiverId || !currentUserId) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/getMessages/${receiverId}`,
          {
            params: { currentUserId },
            headers: {
              // Pass your token if necessary (e.g., JWT token authentication)
              // Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages.");
      } finally {
        // setLoading(false);
      }
    };

    fetchMessages();
  }, [receiverId, currentUserId]);

  useEffect(() => {
    socket.emit("join", currentUserId);

    socket.off("receiveMessage");

    socket.on("receiveMessage", (data) => {    
      setMessages((prev) => [...prev, data]);
      // console.log(data.text);
    });
    
    // Handle message deletion events
    socket.on("messageDeleted", (messageId) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    fetchUsers();

    return () => {
      socket.off("receiveMessage");
    };
    
  }, [currentUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDeleteMessage = async (messageId) => {
    try {
      // Call your API to delete the message
      await axios.delete(`http://localhost:5000/DeleteMsg/${messageId}`, {
        headers: {
          // Include auth token if needed
          // Authorization: `Bearer ${token}`,
        }
      });
  
      // Update local state
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      // Emit deletion via socket if needed
      socket.emit("deleteMessage", messageId);
      
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message");
    }
  };

  const handleSend = async () => {
    try {
      if (!message.trim() && !selectedFile) return;
      if (!receiverId) {
        alert("Please select a user to chat with.");
        return;
      }
  
      let fileUrl = null;
      let fileType = null;
  
      // Handle file upload
      if (selectedFile && selectedFile.size > 0) {
        console.log(selectedFile);
        if (!(selectedFile instanceof File || selectedFile instanceof Blob)) {
          throw new Error("Invalid file selected");
        }
  
        // Convert file to base64
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        fileType = selectedFile.type;
  
        // Send to backend
        const res = await axios.post(
          `http://localhost:5000/sendMessage/${receiverId}`,
          { 
            text: message,
            senderId: currentUserId,
            file: base64Data, // Sending as base64
            fileType
          },
          {
            // headers: {
            //   Authorization: `Bearer ${token}`,
            // },
          }
        );
  
        fileUrl = res.data.file; // Get URL from backend response
      } else {
        // Text-only message
        await axios.post(
          `http://localhost:5000/sendMessage/${receiverId}`,
          { 
            text: message,
            senderId: currentUserId 
          }
        );
      }
  
      const newMessage = {
        senderId: currentUserId,
        receiverId,
        text: message,
        file: fileUrl,
        fileType
      };
  
      socket.emit("sendMessage", newMessage);
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
      setSelectedFile(null);
  
    } catch (error) {
      console.error("Message send error: ", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border rounded-lg shadow">
      <div className="mb-4">
        <h3 className="font-semibold">Users</h3>
        <ul>
          {users.map(user => (
            <li
              key={user._id}
              onClick={() => setReceiverId(user._id)}
              className={`cursor-pointer p-2 rounded ${
                receiverId === user._id ? "bg-blue-200" : "hover:bg-gray-200"
              }`}
            >
              {user.name}
            </li>
          ))}
        </ul>
      </div>
  
      <div className="h-96 overflow-y-auto mb-2 bg-gray-100 p-2 rounded">
        {messages.map((msg, index) => (
          <div key={index} className={`message-container ${msg.senderId === currentUserId ? 'sent' : 'received'}`}>
            {/* Message content with delete option */}
            <div className="relative group">
              {msg.text && <p className="message-text">{msg.text}</p>}
              {msg.file && (
                <div className="file-container">
                  {msg.fileType?.startsWith('image/') ? (
                    <div className="relative">
                      <img src={msg.file} alt="Shared content" className="message-image" />
                      <a 
                        href={msg.file} 
                        download={`image-${msg._id}.${msg.fileType.split('/')[1]}`}
                        className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm"
                      >
                        Download
                      </a>
                    </div>
                  ) : msg.fileType?.startsWith('video/') ? (
                    <div className="relative">
                      <video 
                        controls 
                        className="message-video"
                        playsInline
                        preload="metadata"
                      >
                        <source 
                          src={msg.file} 
                          type={msg.fileType.includes('mp4') ? 'video/mp4' : 'video/webm'} 
                        />
                        Your browser does not support the video tag.
                      </video>
                      <a
                        href={msg.file}
                        download={`video-${msg._id}.${msg.fileType.split('/')[1] || 'mp4'}`}
                        className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm"
                      >
                        Download
                      </a>
                    </div>
                  ) : (
                    <a 
                      href={msg.file} 
                      download={`file-${msg._id}.${msg.fileType?.split('/')[1] || 'bin'}`}
                      className="file-download"
                    >
                      <FileIcon />
                      <span>Download File</span>
                    </a>
                  )}
                </div>
              )}
              
              {/* Delete button (only shown for current user's messages on hover) */}
              {msg.senderId === currentUserId && (
                <button
                  onClick={() => handleDeleteMessage(msg._id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
  
      {/* Rest of your code remains the same */}
      <div className="flex flex-col gap-2">
        {/* File preview and input section */}
        {/* ... (keep your existing file preview and input code) ... */}
      </div>
    </div>
  );
};

export default ChatBox;


