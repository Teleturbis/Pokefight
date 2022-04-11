import React, { useEffect, useState, useRef } from "react";
import audio from "../../assets/sounds/hits/hit32.mp3";

import beep from "../../assets/sounds/count/count.mp3";

export default function ArenaInFight({
  userPokemon,
  enemyPokemon,
  changeSetInArena,
}) {
  const [userHP, setUserHP] = useState(userPokemon.stats.hp);
  const [enemyHP, setEnemyHP] = useState(enemyPokemon.stats.hp);
  const [turn, setTurn] = useState(0);
  const [count, setCount] = useState(3);
  const [countOverlay, setCountOverlay] = useState(true);

  const countBeep = new Audio(beep);

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

  useInterval(() => {
    setCount(count - 1);
  }, 1000);

  function useInterval(callback, delay) {
    const savedCallback = useRef();

    useEffect(() => {
      if (count < 0) {
        setCountOverlay(false);
        return;
      }

      countBeep.volume = 0.2;
      countBeep.play();
      savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
      if (count < 0) return;
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  useEffect(() => {
    if (turn === "enemy" && enemyHP > 0) {
      const attack =
        enemyPokemon.moves[
          Math.floor(Math.random() * enemyPokemon.moves.length)
        ];

      const attackValue =
        (attack.value / 2) * (1 + enemyPokemon.stats.attack / 100);

      setTimeout(() => {
        if (attack.effectsOwner) {
          setEnemyHP(enemyHP + (attackValue + 5));
        } else {
          setUserHP(
            Math.round(
              userHP -
                (attackValue - attackValue * (userPokemon.stats.defense / 200))
            )
          );
          soundEffect();
          console.log(attackValue);
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
      const attackValue =
        (attack.value / 2) * (1 + enemyPokemon.stats.attack / 100);

      console.log(attackValue);

      if (attack.effectsOwner) {
        setUserHP(userHP + (attackValue + 5));
      } else {
        setEnemyHP(
          Math.round(
            enemyHP -
              (attackValue - attackValue * (enemyPokemon.stats.defense / 200))
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
    new Audio(audio).play();
  }

  return (
    <div className="arenainFight-main">
      {countOverlay && (
        <div className="countOverlay">
          <h1>{count === 0 ? "FIGHT!" : count}</h1>
        </div>
      )}
      {count < 0 && (
        <div className="fight-div">
          <div className="enemy-div" style={{ display: "flex" }}>
            <div>
              <p>A wild {enemyPokemon.name} appered</p>
              <p>HP: {enemyHP}</p>
              <p>FP: {enemyPokemon.stats.attack}</p>
              <p>DP: {enemyPokemon.stats.defense}</p>
            </div>
            <img src={enemyPokemon.gif.front} />
          </div>
          <div className="user-div" style={{ display: "flex" }}>
            <img src={userPokemon.gif.back} />
            <div>
              <div>
                <p>HP: {userHP}</p>
                <p>FP: {userPokemon.stats.attack}</p>
                <p>DP: {userPokemon.stats.defense}</p>
              </div>
              <div className="actions-div">
                {userPokemon.moves.map((el, index) => (
                  <button key={index} onClick={() => userAttack(el)}>
                    {el.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
