import React, { useEffect, useState, useRef } from 'react';

import { io } from 'socket.io-client';

export default function Chat({ user, changeSocketID }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const socket = useRef();

  useEffect(() => {
    socket.current = io('https://express-db-pokefight.herokuapp.com', {
      // socket.current = io('http://localhost:3003', {
      // socket.current = io('http://tom-ryzen5:3003', {
      // auth: { userId: '624b76d47607ffd9e180f7e0' },
      auth: { userId: user.userID, username: user.username },
    });

    socket.current.on('connect', () => {
      changeSocketID(socket.current.id);
      console.log('client connected', socket.current.id);
    });

    socket.current.on('msg-received', (message) => {
      setMessages((prev) => {
        // messages limit to 100
        if (prev.length >= 100) prev.length = 99;
        return [message, ...prev];
      });
    });

    socket.current.on('friend-request-received', (fromUser) => {
      console.log('friend-request-received', fromUser);

      // ! "messages" useState has no value, cause we are in the only once called useEffect
      // ! but weirdly "setMessages" with "prev" works!

      setMessages((prev) => {
        // todo dirty solution to avoid duplicate messages
        const frMsg = prev.find(
          (msg) => msg.msg === `Friend Request from ${fromUser.name}!`
        );

        if (!frMsg) {
          // messages limit to 100
          if (prev.length >= 100) prev.length = 99;
          return [{ msg: `Friend Request from ${fromUser.name}!` }, ...prev];
        } else {
          return prev;
        }
      });
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  function handleSendMsg(e) {
    e.preventDefault();
    socket.current.emit('msg-event', userInput);
    setUserInput('');
  }

  function handleFriendRequest(toUser) {
    console.log('friend request', toUser);
    socket.current.emit(
      'friend-request-event',
      { name: user.username, id: user.userID },
      toUser
    );
  }

  return (
    <div className="chat-main-div">
      <div className="chat-messages-div">
        {messages.map((message, index) => (
          <div className="chat-message" key={index}>
            {message?.user && message?.user?.id !== user.userID && (
              <button
                onClick={() => handleFriendRequest(message?.user)}
                title="Send Friend Request"
              >
                +
              </button>
            )}
            {message?.user && (
              <p className="chat-message-user">[{message?.user?.name}]</p>
            )}
            <p className="chat-message-content">{message?.msg}</p>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => handleSendMsg(e)} className="chat-userinput">
        <input
          type="text"
          className="chat-userinput-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button
          className="chat-userinput-button chat-userinput-input"
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
}
