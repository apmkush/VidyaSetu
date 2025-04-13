// src/components/ChatBox.jsx
import React, { useState, useEffect, useRef } from "react";
import socket from "../../socket";
import axios from "axios";
import { useSelector } from 'react-redux';

const ChatBox = () => {
  
  const User = useSelector(state => state.auth.user);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState(null);
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

    fetchUsers();

    return () => {
      socket.off("receiveMessage");
    };
    
  }, [currentUserId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    try{
        if (!message.trim()) return;
        if (!receiverId) {
          alert("Please select a user to chat with.");
          return;
        }
        const res = await axios.post(
            `http://localhost:5000/sendMessage/${receiverId}`,
            { text:message,senderId:currentUserId },
            {
            //   headers: {
            //     Authorization: `Bearer ${token}`,
            //   },
            }
          );

        const newMessage = {
        senderId: currentUserId,
        receiverId,
        text: message,
        };

        socket.emit("sendMessage", newMessage);
        setMessages((prev) => [...prev, newMessage]);
        setMessage("");
        // console.log("Message sent!!");
    }catch (error) {
        console.error("Message send error: ", error);
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
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg max-w-[75%] ${
              msg.senderId === currentUserId
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-white text-black"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
