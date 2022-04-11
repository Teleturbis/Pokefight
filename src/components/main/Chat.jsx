import React, { useEffect, useState, useRef } from 'react';

let once = true;
const type = 'chat';

export default function Chat({ user, client }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  // const socket = useRef();

  useEffect(() => {
    console.log('useEffect Chat', client);

    // ! hupft zweimal rein, warum??
    if (client) {
      console.log('once Chat');
      once = false;

      client.addListener(type, 'msg-received', (message) => {
        message.type = 'msg';
        setMessages((prev) => {
          // messages limit to 100
          if (prev.length >= 100) prev.length = 99;
          return [message, ...prev];
        });
      });

      client.addListener(type, 'battle-request-received', (fromUser) => {
        console.log('battle-request-received', fromUser);

        // ! "messages" useState has no value, cause we are in the only once called useEffect
        // ! but weirdly "setMessages" with "prev" works!

        setMessages((prev) => {
          const frMsg = prev.find(
            (msg) =>
              msg.type === 'battle-request' && msg.fromUser.id === fromUser.id
          );

          if (!frMsg) {
            // messages limit to 100
            if (prev.length >= 100) prev.length = 99;
            return [
              {
                type: 'battle-request',
                fromUser: fromUser,
                msg: `Battle Request from ${fromUser.name}!`,
                user: fromUser,
              },
              ...prev,
            ];
          } else {
            return prev;
          }
        });
      });

      client.addListener(type, 'battle-accept-received', (fromUser) => {
        console.log('battle-accept-received', fromUser);
        setMessages((prev) => {
          return [{ msg: `"${fromUser.name}" accepted the battle!` }, ...prev];
        });
      });

      client.addListener(type, 'battle-reject-received', (fromUser) => {
        console.log('battle-reject-received', fromUser);
        setMessages((prev) => {
          return [{ msg: `"${fromUser.name}" rejected the battle!` }, ...prev];
        });
      });

      client.addListener(type, 'friend-request-received', (fromUser) => {
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

      client.addListener(type, 'friend-accept-received', (fromUser) => {
        console.log('friend-accept-received', fromUser);
        setMessages((prev) => {
          return [
            { msg: `"${fromUser.name}" accepted you as friend!` },
            ...prev,
          ];
        });
      });

      client.addListener(type, 'friend-reject-received', (fromUser) => {
        console.log('friend-reject-received', fromUser);
      });
    }

    return () => {
      console.log('unmount Chat');
      client.removeListeners(type);
    };
  }, []);

  function handleSendMsg(e) {
    e.preventDefault();
    if (userInput.trim().length > 0) {
      client.socket.emit('msg-event', userInput);
      setUserInput('');
    }
  }

  function handleSendBattleRequest(toUser) {
    console.log('send battle request', toUser);
    client.socket.emit(
      'battle-request-event',
      { name: user.username, id: user.userID },
      toUser
    );
  }

  function handleAcceptBattleRequest(requestUser) {
    acceptRejectBattleRequest(requestUser, true, 'battle-accept-event');
  }

  function handleRejectBattleRequest(requestUser) {
    acceptRejectBattleRequest(requestUser, false, 'battle-reject-event');
  }

  function acceptRejectBattleRequest(requestUser, accepted, socketEvent) {
    console.log(socketEvent, requestUser);
    client.socket.emit(
      socketEvent,
      { name: user.username, id: user.userID },
      requestUser
    );

    setMessages((prev) =>
      prev.filter(
        (msg) =>
          !(msg.type === 'battle-request' && msg.fromUser.id === requestUser.id)
      )
    );

    // setMessages((prev) =>
    //   prev.map((msg) => {
    //     if (
    //       msg.type === 'battle-request' &&
    //       msg.fromUser.id === requestUser.id
    //     ) {
    //       msg.type = 'battle-request-result';
    //       msg.msg = accepted
    //         ? `Battle vs. "${requestUser.name}" accepted!`
    //         : `Battle vs. "${requestUser.name}" rejected!`;
    //     }

    //     return msg;
    //   })
    // );
  }

  function handleSendFriendRequest(toUser) {
    console.log('send friend request', toUser);
    client.socket.emit(
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
    client.socket.emit(
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

  function getPrefixFriendRequest(message) {
    return (
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
    );
  }

  function getPrefixBattleRequest(message) {
    return (
      <>
        <button
          onClick={() => handleAcceptBattleRequest(message?.user)}
          title="Accept Battle Request"
        >
          ✅
        </button>
        <button
          onClick={() => handleRejectBattleRequest(message?.user)}
          title="Reject Battle Request"
        >
          ⛔️
        </button>
      </>
    );
  }

  function getPrefixMessage(message) {
    return (
      <>
        {message?.type === 'msg' && (
          <>
            {message?.user && message?.user?.id !== user.userID && (
              <>
                <button
                  onClick={() => handleSendFriendRequest(message?.user)}
                  title="Send Friend Request"
                >
                  ➕
                </button>
                <button
                  onClick={() => handleSendBattleRequest(message?.user)}
                  title="Send Battle Request"
                >
                  ⚔️
                </button>
              </>
            )}
            <p className="chat-message-user">[{message?.user?.name}]</p>
          </>
        )}
      </>
    );
  }

  return (
    <div className="chat-main-div">
      <div className="chat-messages-div">
        {messages.map((message, index) => (
          <div className="chat-message" key={index}>
            {message?.type === 'friend-request'
              ? getPrefixFriendRequest(message)
              : message?.type === 'battle-request'
              ? getPrefixBattleRequest(message)
              : getPrefixMessage(message)}

            {message?.msg && (
              <p className="chat-message-content">{message?.msg}</p>
            )}
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
