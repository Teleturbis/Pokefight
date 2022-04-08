import React, { useEffect, useState, useRef } from "react";

import { io } from "socket.io-client";

export default function Chat({ changeSocketID }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const socket = useRef();

  useEffect(() => {
    socket.current = io("https://express-db-pokefight.herokuapp.com");

    socket.current.on("connect", () => {
      changeSocketID(socket.current.id);
      console.log("client connected", socket.current.id);
    });

    socket.current.on("msg-received", (message) => {
      setMessages((prev) => [message, ...prev]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  function handleSendMsg() {
    socket.current.emit("msg-event", userInput);
    setUserInput("");
  }

  return (
    <div className="chat-main-div">
      <div className="chat-messages-div">
        {messages.map((message, index) => (
          <div className="chat-message" key={index}>
            <p className="chat-message-content">{message}</p>
          </div>
        ))}
      </div>
      <div className="chat-userinput">
        <input
          type="text"
          className="chat-userinput-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button
          className="chat-userinput-button chat-userinput-input"
          onClick={() => handleSendMsg()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
