import React, { useEffect, useState } from "react";
import audio from "../../assets/sounds/hits/hit32.mp3";

export default function ArenaInFight({
  userPokemon,
  enemyPokemon,
  changeSetInArena,
}) {
  const [userHP, setUserHP] = useState(userPokemon.stats.hp);
  const [enemyHP, setEnemyHP] = useState(enemyPokemon.stats.hp);
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    if (userPokemon.stats.speed > enemyPokemon.stats.speed) {
      setTurn("user");
    } else if (userPokemon.stats.speed < enemyPokemon.stats.speed) {
      setTurn("enemy");
    } else {
      if (Math.floor(Math.random() * 10) > 5) {
        setTurn("user");
      } else {
        setTurn("enemy");
      }
    }
  }, []);

  useEffect(() => {
    if (turn === "enemy") {
      const attack =
        enemyPokemon.moves[
          Math.floor(Math.random() * enemyPokemon.moves.length)
        ];

      setTimeout(() => {
        if (attack.effectsOwner) {
          setEnemyHP(enemyHP + (attack.value + 5));
        } else {
          setUserHP(
            Math.round(
              userHP - attack.value * (1 - userPokemon.stats.defense / 2 / 100)
            )
          );
          soundEffect();
        }

        setTurn("user");
      }, 2000);
    }
  }, [turn]);

  useEffect(() => {
    if (enemyHP <= 0) {
      window.alert("You won the fight!!!");
      changeSetInArena();
    }
    if (userHP <= 0) {
      window.alert("You lost the Fight!!!");
      changeSetInArena();
    }
  }, [enemyHP, userHP]);

  function userAttack(attack) {
    if (turn === "user") {
      if (attack.effectsOwner) {
        setUserHP(userHP + (attack.value + 5));
      } else {
        setEnemyHP(
          Math.round(
            enemyHP - attack.value * (1 - enemyPokemon.stats.defense / 2 / 100)
          )
        );
        soundEffect();
      }
      setTurn("enemy");
    } else {
      window.alert("It's not your Turn!");
    }
  }

  function soundEffect() {
    const random = Math.floor(Math.random * 37);
    new Audio(audio).play();
  }

  return (
    <div className="arenainFight-main">
      <div className="fight-div">
        <div className="enemy-div" style={{ display: "flex" }}>
          <div>
            <p>HP: {enemyHP}</p>
            <p>FP: {enemyPokemon.stats.attack}</p>
            <p>DP: {enemyPokemon.stats.defense}</p>
          </div>
          <img src={enemyPokemon.gif.front} />
        </div>
        <div className="user-div" style={{ display: "flex" }}>
          <img src={userPokemon.gif.back} />
          <div>
            <p>HP: {userHP}</p>
            <p>FP: {userPokemon.stats.attack}</p>
            <p>DP: {userPokemon.stats.defense}</p>
          </div>
        </div>
      </div>
      <div className="actions-div">
        {userPokemon.moves.map((el, index) => (
          <button key={index} onClick={() => userAttack(el)}>
            {el.name}
          </button>
        ))}
      </div>
    </div>
  );
}
