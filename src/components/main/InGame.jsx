import React, { useState } from "react";
import { GiSchoolBag, GiTreasureMap, GiTwoCoins } from "react-icons/gi";
import { FiMenu } from "react-icons/fi";

import Chat from "./Chat";
import Inventar from "../gamElements/Inventar";

export default function MainMenu({ user, changeUser }) {
  const [inventaryVisible, setInventaryVisible] = useState(false);

  return (
    <div className="main-game-div">
      <div className="game-div">{/* HERE GAMECOMPONENT */}</div>
      <div className="game-overlay">
        <GiSchoolBag
          className="inv-btn"
          onClick={() => setInventaryVisible(!inventaryVisible)}
        />
        <div className="information-div">
          <FiMenu className="menu-btn" />
          <p className="level">Level 99</p>
          <p className="money">
            <GiTwoCoins className="money-symbole" /> 999$
          </p>
        </div>
        <GiTreasureMap className="map-btn" />
        {inventaryVisible ? <Inventar /> : null}
        <Chat />
      </div>
    </div>
  );
}