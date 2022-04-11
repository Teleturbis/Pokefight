import React, { useEffect, useRef, useState } from 'react';
import {
  GiSchoolBag,
  GiTreasureMap,
  GiTwoCoins,
  GiPerson,
} from 'react-icons/gi';
import { FiMenu } from 'react-icons/fi';

import Chat from './Chat';
import Inventar from '../gamElements/Inventar';
import Game from '../../Game';
import ArenaFight from './ArenaFight';
import PokeSocketClient from '../../socket/socket';

const map = require('../../assets/unbenannt.png');

let client = null;

export default function MainMenu({ user, changeUser, audioMainTheme }) {
  const [inventaryVisible, setInventaryVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [inArenaFight, setInArenaFight] = useState(false);
  const [socketClient, setSocketClient] = useState(null);

  function handleDelete() {}

  function handleChangeName() {}

  function handleLogout() {
    audioMainTheme();
    changeUser({ username: '', token: '', loggedIn: false });
  }

  function changeSetInArena() {
    setInArenaFight(!inArenaFight);
  }

  let game = useRef();
  // let client = useRef();

  useEffect(() => {
    if (!game.current) {
      game.current = new Game(
        () => {},
        () => {}
      );
    }

    const server = 'https://express-db-pokefight.herokuapp.com';
    // const server = 'http://localhost:3003';
    // const server = 'http://tom-ryzen5:3003';

    if (!client) {
      client = new PokeSocketClient(server, user);
      client.socket.on('connect', () => {
        console.log('client connected', client.socket.id);
      });
      setSocketClient(client);
    }

    return () => {
      socketClient?.socket?.disconnect();
    };
  }, []);

  return (
    <div className="main-game-div">
      <div className="game-div">
        {/* HERE GAMECOMPONENT */}
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
            <div className="information-div">
              <FiMenu
                className="menu-btn"
                onClick={() => setMenuVisible(!menuVisible)}
              />
              <p className="level">Friends</p>
              <GiPerson className="money-symbole" />
            </div>
            <div className="friends-div">
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

          {mapVisible ? (
            <div className="game-map-div">
              <img src={map} className="game-map" />
            </div>
          ) : null}

          {inventaryVisible ? <Inventar /> : null}

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
  );
}
