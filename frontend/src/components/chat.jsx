// src/components/ChatBox.jsx
import React, { useState, useEffect, useRef } from "react";
import socket from "../socket";
import axios from "axios";

const ChatBox = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);
  const currentUserId="kjad";
  const receiverId="anjdf";

  useEffect(() => {
    socket.emit("join", currentUserId);

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

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
        const res = await axios.post(
            `http://localhost:5000/sendMessage/${receiverId}`,
            { text:message },
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
