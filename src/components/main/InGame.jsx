import React, { useEffect, useRef, useState } from 'react';
import { GiSchoolBag, GiTreasureMap, GiTwoCoins } from 'react-icons/gi';
import { MdPeopleAlt } from 'react-icons/md';
import { FiMenu } from 'react-icons/fi';
import http from '../../api/http-common';
import Chat from './Chat';
import Inventar from '../gamElements/Inventar';
import Game from '../../Game';
import ArenaFight from './ArenaFight';
import PokeSocketClient from '../../socket/socket';
import Friends from '../gamElements/Friends';

const map = require('../../assets/unbenannt.png');

let client = null;

export default function MainMenu({ user, changeUser }) {
  const [inventaryVisible, setInventaryVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [friendsVisible, setFriendsVisible] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);
  const [inArenaFight, setInArenaFight] = useState(false);
  const [socketClient, setSocketClient] = useState(null);
  const [friendsList, setFriendsList] = useState(null);

  function handleDelete() {}

  function handleChangeName() {}

  function handleLogout() {
    changeUser({ username: '', token: '', loggedIn: false });
  }

  function changeSetInArena() {
    setInArenaFight(!inArenaFight);
  }

  let game = useRef();

  useEffect(() => {
    //Initialize Game
    if (!game.current) {
      game.current = new Game(
        () => {},
        () => {}
      );
    }

    const server = process.env.REACT_APP_SOCKET_SERVER;

    if (!client) {
      client = new PokeSocketClient(server, user);
    }

    if (client) {
      client.socket.connect();
      client.addListener('game', 'connect', () => {
        console.log('client connected', client.socket.id, socketClient);
        setSocketClient(client);
        // getFriendsList();
      });

      const socketEventsFriends = [
        'connect-received',
        'disconnect-received',
        'friend-request-received',
        'friend-accept-received',
        'friend-reject-received',
      ];

      socketEventsFriends.forEach((event) => {
        client.addListener('game', event, (userId, socketList) => {
          console.log(event, userId, socketList, socketClient);
          client.socketList = socketList;
          setSocketClient(client);
          getFriendsList(socketList);
        });
      });

      // client.addListener('game', 'connect-received', (userId, socketList) => {
      //   console.log('connect-received', userId, socketList, socketClient);
      //   client.socketList = socketList;
      //   setSocketClient(client);
      //   getFriendsList(socketList);
      // });

      // client.addListener(
      //   'game',
      //   'disconnect-received',
      //   (userId, socketList) => {
      //     console.log('disconnect-received', userId, socketList, socketClient);
      //     client.socketList = socketList;
      //     setSocketClient(client);
      //     getFriendsList(socketList);
      //   }
      // );
    }

    return () => {
      console.log('unmount', 'game', client, socketClient);
      if (client) {
        client.removeListeners('game');
        client.socket.disconnect();
        client = null;
      }
    };
  }, []);

  useEffect(() => {
    if (friendsVisible) {
      getFriendsList(socketClient.socketList);
    }

    return () => {};
  }, [friendsVisible]);

  async function getFriendsList(socketList) {
    try {
      const resp = await http.get(`/user/${user.userID}/friends`);

      console.log('resp.status', resp.status);

      if (resp.status === 200) {
        console.log('socketList', socketList);

        const sortFriends = (friends) => {
          let friendsList = friends
            .map((friend) => {
              friend.online = socketList.find((s) => s.userId === friend.id)
                ? true
                : false;
              return friend;
            })
            .sort((a, b) => {
              if (a.online && !b.online) {
                return -1;
              } else if (!a.online && b.online) {
                return 1;
              } else {
                return 0;
              }
            });
          console.log('sortFriends', friendsList);
          return friendsList;
        };

        setFriendsList(sortFriends(resp.data));
        setFriendsCount(
          resp.data.filter((f) =>
            socketList
              ? socketList?.filter(
                  (s) =>
                    s.userId.toString() === f.id.toString() &&
                    f.status === 'accepted'
                ).length > 0
              : false
          ).length
        );
        return;
      }

      throw new Error('Error', resp.status);
    } catch (error) {
      console.log('error', error);
    }
  }

  return (
    <div>
      <div className="main-game-div">
        {friendsVisible ? (
          <Friends user={user} client={socketClient} friends={friendsList} />
        ) : null}
        <div className="game-div">
          {/* HERE GAME COMPONENT */}
          <div className="game-overlay">
            <GiSchoolBag
              className="inv-btn"
              onClick={() => {
                setInventaryVisible(!inventaryVisible);
                setMapVisible(false);
                setMenuVisible(false);
              }}
            />

            <div className="menu-div">
              <div className="username">{user.username}</div>
              <div className="friends-div">
                <MdPeopleAlt
                  className="money-symbole"
                  onClick={() => setFriendsVisible(!friendsVisible)}
                />
                <p className="level">
                  Friends{' '}
                  <span className="friends-count">({friendsCount})</span>{' '}
                </p>
              </div>
              <div className="information-div">
                <FiMenu
                  className="menu-btn"
                  onClick={() => setMenuVisible(!menuVisible)}
                />
                <p className="level">Level 99</p>
                <p className="money">
                  <GiTwoCoins className="money-symbole" /> 999
                </p>
              </div>
            </div>

            <GiTreasureMap
              className="map-btn"
              onClick={() => {
                setMapVisible(!mapVisible);
                setInventaryVisible(false);
                setMenuVisible(false);
              }}
            />
            {socketClient && (
              <Chat
                user={user}
                client={socketClient}
                setFriendsVisible={setFriendsVisible}
              />
            )}

            {/* Conditional Rendering: */}

            {mapVisible ? (
              <div className="game-map-div">
                <img src={map} className="game-map" />
              </div>
            ) : null}

            {inventaryVisible ? <Inventar user={user} /> : null}

            {menuVisible ? (
              <div
                className="game-menu-div"
                onClick={(e) =>
                  e.target.className === 'game-menu-div'
                    ? setMenuVisible(false)
                    : null
                }
              >
                <div className="game-menu-content">
                  <h1>Menu</h1>
                  <h2>Hey {user.username}!</h2>
                  <button onClick={() => handleLogout()}>Log Out</button>
                  <button onClick={() => handleDelete()}>Delete Account</button>
                  <button onClick={() => handleChangeName()}>
                    Change Username
                  </button>
                </div>
              </div>
            ) : null}

            {inArenaFight && (
              <ArenaFight changeSetInArena={changeSetInArena} user={user} />
            )}
          </div>
        </div>
      </div>
      <div>Socket: {client?.socket.id}</div>
    </div>
  );
}
