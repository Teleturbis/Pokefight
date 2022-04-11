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
      message.type = 'msg';
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
        const frMsg = prev.find(
          (msg) =>
            msg.type === 'friend-request' && msg.fromUser.id === fromUser.id
        );

        if (!frMsg) {
          // messages limit to 100
          if (prev.length >= 100) prev.length = 99;
          return [
            {
              type: 'friend-request',
              fromUser: fromUser,
              msg: `Friend Request from ${fromUser.name}!`,
              user: fromUser,
            },
            ...prev,
          ];
        } else {
          return prev;
        }
      });
    });

    socket.current.on('friend-accept-received', (fromUser) => {
      console.log('friend-accept-received', fromUser);
      setMessages((prev) => {
        return [
          { msg: `Friend request from "${fromUser.name}" accepted!` },
          ...prev,
        ];
      });
    });

    socket.current.on('friend-reject-received', (fromUser) => {
      console.log('friend-accept-received', fromUser);
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

  function handleSendFriendRequest(toUser) {
    console.log('send friend request', toUser);
    socket.current.emit(
      'friend-request-event',
      { name: user.username, id: user.userID },
      toUser
    );
  }

  function handleAcceptFriendRequest(requestUser) {
    acceptRejectFriendRequest(requestUser, true, 'friend-accept-event');
  }

  function handleRejectFriendRequest(requestUser) {
    acceptRejectFriendRequest(requestUser, false, 'friend-reject-event');
  }

  function acceptRejectFriendRequest(requestUser, accepted, socketEvent) {
    console.log(socketEvent, requestUser);
    socket.current.emit(
      socketEvent,
      { name: user.username, id: user.userID },
      requestUser
    );

    setMessages((prev) =>
      prev.map((msg) => {
        if (
          msg.type === 'friend-request' &&
          msg.fromUser.id === requestUser.id
        ) {
          msg.type = 'friend-request-result';
          msg.msg = accepted
            ? `Friend "${requestUser.name}" accepted!`
            : `Friend "${requestUser.name}" rejected!`;
        }

        return msg;
      })
    );
  }

  return (
    <div className="chat-main-div">
      <div className="chat-messages-div">
        {messages.map((message, index) => (
          <div className="chat-message" key={index}>
            {message?.type === 'friend-request' ? (
              <>
                <button
                  onClick={() => handleAcceptFriendRequest(message?.user)}
                  title="Accept Friend Request"
                >
                  ✅
                </button>
                <button
                  onClick={() => handleRejectFriendRequest(message?.user)}
                  title="Reject Friend Request"
                >
                  ⛔️
                </button>
              </>
            ) : (
              <>
                {message?.type === 'msg' && (
                  <>
                    {message?.user && message?.user?.id !== user.userID && (
                      <button
                        onClick={() => handleSendFriendRequest(message?.user)}
                        title="Send Friend Request"
                      >
                        ➕
                      </button>
                    )}
                    <p className="chat-message-user">[{message?.user?.name}]</p>
                  </>
                )}
              </>
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
