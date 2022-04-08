import axios from "axios";
import React, { useEffect, useState } from "react";
import ChoosePokemon from "./ChoosePokemon";
import ArenaInFight from "./ArenaInFight";

export default function ArenaFight({ user, changeSetInArena }) {
  const [userPokemon, setUserPokemon] = useState(false);
  const [enemyPokemon, setEnemyPokemon] = useState(false);
  const [choosePokemon, setChoosePokemon] = useState(true);

  const [devPokemons, setDevPokemons] = useState({ ...user, pokemons: [] });

  function changeUserPokemon(value) {
    setUserPokemon(value);
    setChoosePokemon(false);
  }

  useEffect(() => {
    getPokemons();
    async function getPokemons() {
      const fetchEnemy = await axios
        .get("https://express-db-pokefight.herokuapp.com/pokemon")
        .catch((err) => console.error("ERROR AT DEV", err));
      setDevPokemons({ ...devPokemons, pokemons: fetchEnemy.data });
    }
  }, []);

  useEffect(() => {
    getPokemons();
    async function getPokemons() {
      const fetchEnemy = await axios.get(
        "https://express-db-pokefight.herokuapp.com/pokemon"
      );
      setEnemyPokemon(
        await fetchEnemy.data[
          Math.floor(Math.random() * fetchEnemy.data.length)
        ]
      );
    }
  }, [userPokemon]);

  console.log("user:", userPokemon, "enemy:", enemyPokemon);

  return (
    <div className="arena-figth-div">
      {choosePokemon ? (
        <div className="choosePokemon">
          {devPokemons.pokemons.map((el, index) => (
            <ChoosePokemon
              key={index}
              pokemon={el}
              changeUserPokemon={changeUserPokemon}
            />
          ))}
        </div>
      ) : (
        <ArenaInFight changeSetInArena={changeSetInArena} enemyPokemon={enemyPokemon} userPokemon={userPokemon} />
      )}
    </div>
  );
}
