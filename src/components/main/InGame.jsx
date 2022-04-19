import React, { useEffect, useRef, useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import {
  GiPerson,
  GiSchoolBag,
  GiTreasureMap,
  GiTwoCoins,
} from 'react-icons/gi';
import { MdPeopleAlt } from 'react-icons/md';
import http from '../../api/http-common';
import Chat from './Chat';
import Inventar from '../gamElements/Inventar';
import Game from '../../Game';
import PokeSocketClient from '../../socket/socket';
import ArenaFight from './ArenaFight';

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
  const [info, setInfo] = useState('');
  const [friendsList, setFriendsList] = useState(null);

  function handleDelete() {}

  function handleChangeName() {}

  function handleLogout() {
    changeUser({ username: '', token: '', loggedIn: false });
  }

  useInterval(() => {
    if (!inArenaFight) {
      if (Math.floor(Math.random() * 1000) <= 1) {
        setInArenaFight(true);
      }
    }
  }, 250);

  function useInterval(callback, delay) {
    const savedCallback = useRef();

    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  function changeSetInArena() {
    setInArenaFight(!inArenaFight);
  }

  let game = useRef();
  // let client = useRef();

  useEffect(() => {
    //Initialize Game
    if (!client) {
      const server = process.env.REACT_APP_SOCKET_SERVER;
      client = new PokeSocketClient(server, user);
    }

    // console.log('client ', client);
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
          console.log('SOCKET', event, userId, socketList, socketClient);
          client.socketList = socketList;
          setSocketClient(client);
          getFriendsList(socketList);
        });
      });
      setSocketClient(client);

      game.current = new Game(client, user, setInfo);
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

  console.log('CLIENT', client);

  return (
    <div>
      <div className='main-game-div'>
        {friendsVisible ? (
          <Friends user={user} client={socketClient} friends={friendsList} />
        ) : null}
        <div className='game-div'>
          {/* HERE GAME COMPONENT */}
          <div className='game-overlay'>
            <GiSchoolBag
              className='inv-btn'
              onClick={() => {
                setInventaryVisible(!inventaryVisible);
                setMapVisible(false);
                setMenuVisible(false);
              }}
            />

            <div className='menu-div'>
              <div className='username'>{user.username}</div>
              <div className='friends-div'>
                <MdPeopleAlt
                  className='money-symbole'
                  onClick={() => setFriendsVisible(!friendsVisible)}
                />
                <p className='level'>
                  Friends{' '}
                  <span className='friends-count'>({friendsCount})</span>{' '}
                </p>
              </div>
              <div className='information-div'>
                <FiMenu
                  className='menu-btn'
                  onClick={() => setMenuVisible(!menuVisible)}
                />
                <p className='level'>Level 99</p>
                <p className='money'>
                  <GiTwoCoins className='money-symbole' /> 999
                </p>
              </div>
            </div>

            <GiTreasureMap
              className='map-btn'
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
              <div className='game-map-div'>
                <img src={map} className='game-map' />
              </div>
            ) : null}

            {inventaryVisible ? <Inventar user={user} /> : null}

            {menuVisible ? (
              <div
                className='game-menu-div'
                onClick={(e) =>
                  e.target.className === 'game-menu-div'
                    ? setMenuVisible(false)
                    : null
                }
              >
                <div className='game-menu-content'>
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
      {/* <div>Socket: {client?.socket.id}</div> */}
      <button onClick={() => setInArenaFight(!inArenaFight)}>
        Fight now!!
      </button>
      <div>Socket: {socketClient?.socket.id}</div>
      <div>
        <pre>{info}</pre>
      </div>
      <div>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}
