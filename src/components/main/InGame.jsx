import React, { useEffect, useState } from "react";
import { GiSchoolBag, GiTreasureMap, GiTwoCoins } from "react-icons/gi";
import { FiMenu } from "react-icons/fi";

import Chat from "./Chat";
import Inventar from "../gamElements/Inventar";
import ArenaFight from "./ArenaFight";

const map = require("../../assets/unbenannt.png");

export default function MainMenu({ user, changeUser, audioMainTheme }) {
  const [inventaryVisible, setInventaryVisible] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [inArenaFight, setInArenaFight] = useState(false);

  function handleDelete() {}

  function handleChangeName() {}

  function handleLogout() {
    audioMainTheme();
    changeUser({ username: "", token: "", loggedIn: false });
  }

  function changeSetInArena() {
    setInArenaFight(!inArenaFight);
  }

  return (
    <div className="main-game-div">
      <div className="game-div">{/* HERE GAMECOMPONENT */}</div>
      <div className="game-overlay">
        <GiSchoolBag
          className="inv-btn"
          onClick={() => {
            setInventaryVisible(!inventaryVisible);
            setMapVisible(false);
            setMenuVisible(false);
          }}
        />
        <div className="information-div">
          <FiMenu
            className="menu-btn"
            onClick={() => setMenuVisible(!menuVisible)}
          />
          <p className="level">Level 99</p>
          <p className="money">
            <GiTwoCoins className="money-symbole" /> 999$
          </p>
        </div>
        <GiTreasureMap
          className="map-btn"
          onClick={() => {
            setMapVisible(!mapVisible);
            setInventaryVisible(false);
            setMenuVisible(false);
          }}
        />
        <Chat />

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
              e.target.className === "game-menu-div"
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
  );
}
