import React, { useEffect, useRef, useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import {
  GiPerson,
  GiSchoolBag,
  GiTreasureMap,
  GiTwoCoins
} from 'react-icons/gi';
import Game from '../../Game';
import PokeSocketClient from '../../socket/socket';
import Inventar from '../gamElements/Inventar';
import ArenaFight from './ArenaFight';
import Chat from './Chat';

const map = require('../../assets/unbenannt.png');

export default function MainMenu({ user, changeUser }) {
  const [inventaryVisible, setInventaryVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [inArenaFight, setInArenaFight] = useState(false);
  const [socketClient, setSocketClient] = useState(null);
  const [info, setInfo] = useState('');

  function handleDelete() {}

  function handleChangeName() {}

  function handleLogout() {
    changeUser({ username: '', token: '', loggedIn: false });
    if (client) {
      client.removeListener('game');
      client.socket.disconnect();
      client = null;
    }
  }

  function changeSetInArena() {
    setInArenaFight(!inArenaFight);
  }

  let game = useRef();
  let client = useRef();

  useEffect(() => {
    //Initialize Game
    if (!game.current && !client.current) {
      const server = process.env.REACT_APP_SOCKET_SERVER;
      client = new PokeSocketClient(server, user);
      client.socket.on('connect', () => {
        console.log('client connected', client.socket.id);
        setSocketClient(client);
      });

      client.addListener('game', 'connect-received', (userId, socketList) => {
        console.log('connect-received', userId, socketList);
      });
      setSocketClient(client);

      game.current = new Game(client, user, setInfo);
    }

    return () => {
      socketClient?.socket?.disconnect();
    };
  }, []);

  return (
    <div className="main-game-div">
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
            <div>{user.username}</div>
            <div className="friends-div">
              <FiMenu
                className="menu-btn"
                onClick={() => setMenuVisible(!menuVisible)}
              />
              <p className="level">Friends</p>
              <GiPerson className="money-symbole" />
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
          {socketClient && <Chat user={user} client={socketClient} />}

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
