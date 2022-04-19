import React, { useEffect, useState } from 'react';
import http from '../../api/http-common';
import '../css/friends.css';

let once = true;
const type = 'friends';

export default function Friends({ user, client, friends }) {
  // const [client.socketList, setSocketList] = useState(client?.client.socketList);
  const [searchInput, setSearchInput] = useState('');
  const [listOnline, setListOnline] = useState([]);
  const [listOffline, setListOffline] = useState([]);
  const [listPending, setListPending] = useState([]);

  useEffect(() => {
    // if (client) {
    //   client.addListener(type, 'connect-received', (userId, client.socketList) => {
    //     console.log('>>> friends: connect-received', userId, client.socketList);
    //     setSocketList((prev) => client.socketList);
    //   });

    //   client.addListener(type, 'disconnect-received', (userId, client.socketList) => {
    //     console.log('>>> friends: disconnect-received', userId, client.socketList);
    //     setSocketList((prev) => client.socketList);
    //   });
    // }

    return () => {
      console.log('unmount', type);
      // client.removeListeners(type);
    };
  }, []);

  useEffect(() => {
    console.log('>>> friends: useEffect');

    setListOnline(
      friends.filter((friend) => friend.online && friend.status === 'accepted')
    );
    setListOffline(
      friends.filter((friend) => !friend.online && friend.status === 'accepted')
    );
    setListPending(friends.filter((friend) => friend.status === 'pending'));

    return () => {};
  }, [friends]);

  useEffect(() => {
    console.log('>>> client: useEffect');

    return () => {};
  }, [client]);
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
  }

  function getPrefixFriendRequest(user) {
    return (
      <>
        <button
          onClick={() => handleAcceptFriendRequest(user)}
          title="Accept Friend Request"
        >
          ✅
        </button>
        <button
          onClick={() => handleRejectFriendRequest(user)}
          title="Reject Friend Request"
        >
          ⛔️
        </button>
      </>
    );
  }

  return (
    <>
      {/* <div className="div-friends">{`user: ${user?.username} - client: ${client?.socket?.id}`}</div> */}

      {client.socketList && client.socketList.length > 0 ? (
        <div className="div-friends-and-players">
          <input
            className="login-element"
            type="text"
            placeholder="Search Players"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <div className="div-friends">
            <div className="div-friends-title">Friends</div>

            {/* online */}
            {listOnline.length > 0 ? (
              <>
                <div
                  style={{ paddingLeft: '1.5rem' }}
                  className="div-friends-title"
                >
                  online
                </div>
                <div className="div-friends-list">
                  {listOnline.map((friend) => (
                    <>
                      {friend.username !== user.username &&
                      friend.username
                        .toLowerCase()
                        .includes(searchInput.toLowerCase()) ? (
                        <div className="div-friends-item" key={friend.userId}>
                          {friend.username}{' '}
                          {/* ({friend.online ? 'online' : 'offline'}) */}
                        </div>
                      ) : null}
                    </>
                  ))}
                </div>
              </>
            ) : null}

            {/* pending */}

            {listPending.length > 0 ? (
              <>
                <div
                  style={{ paddingLeft: '1.5rem', paddingTop: '2.5rem' }}
                  className="div-friends-title"
                >
                  pending
                </div>
                <div className="div-friends-list">
                  {listPending.map((friend) => (
                    <>
                      {friend.username !== user.username &&
                      friend.username
                        .toLowerCase()
                        .includes(searchInput.toLowerCase()) ? (
                        <div className="div-friends-item" key={friend.id}>
                          {getPrefixFriendRequest(friend)}
                          {friend.username}{' '}
                          {/* ({friend.online ? 'online' : 'offline'}) */}
                        </div>
                      ) : null}
                    </>
                  ))}
                </div>
              </>
            ) : null}

            {/* offline */}
            {listOffline.length > 0 ? (
              <>
                <div
                  style={{ paddingLeft: '1.5rem', paddingTop: '2.5rem' }}
                  className="div-friends-offtitle"
                >
                  offline
                </div>
                <div className="div-friends-offlist">
                  {listOffline.map((friend) => (
                    <>
                      {friend.username !== user.username &&
                      friend.username
                        .toLowerCase()
                        .includes(searchInput.toLowerCase()) ? (
                        <div
                          className="div-friends-offitem"
                          key={friend.userId}
                        >
                          {friend.username}{' '}
                          {/* ({friend.online ? 'online' : 'offline'}) */}
                        </div>
                      ) : null}
                    </>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {client?.socketList && client?.socketList?.length > 0 ? (
            <div className="div-players">
              <div className="div-players-title">Players online</div>
              <div className="div-players-list">
                {client?.socketList?.map((socket) => (
                  <>
                    {socket.username !== user.username &&
                    !friends.find((f) => f.id === socket.userId) &&
                    socket.username
                      .toLowerCase()
                      .includes(searchInput.toLowerCase()) ? (
                      <div className="div-players-item" key={socket.userId}>
                        {socket.username}
                      </div>
                    ) : null}
                  </>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
