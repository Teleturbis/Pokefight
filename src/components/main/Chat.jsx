import React, { useEffect, useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState(false);

  useEffect(() => {
    setMessages(
      [
        {
          timestamp: "13:15",
          content: "Hey @All. How's it going?",
        },
        {
          timestamp: "13:17",
          content: "Good! And u?",
        },
        {
          timestamp: "13:22",
          content: "Some have a Pokeball for me?",
        },
        {
          timestamp: "13:23",
          content: "Yeah sure. Come over!",
        },
        {
          timestamp: "13:27",
          content:
            "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Id omnis repellendus tempora? Quis illo, qui eligendi soluta aut labore. Velit ratione provident cumque corporis suscipit ut id deleniti nesciunt neque!",
        },
      ].reverse()
    );
  }, []);

  return (
    <div className="chat-main-div">
      <div className="chat-messages-div">
        {messages &&
          messages.map((message, index) => (
            <div className="chat-message" key={index}>
              <p className="chat-message-timestamp">{message.timestamp}</p>
              <p className="chat-message-content">{message.content}</p>
            </div>
          ))}
      </div>
      <div className="chat-userinput">
        <input type="text" className="chat-userinput-input" />
        <button className="chat-userinput-button chat-userinput-input">
          Send
        </button>
      </div>
    </div>
  );
}
