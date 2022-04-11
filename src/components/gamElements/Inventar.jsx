import axios from "axios";
import React, { useState, useEffect } from "react";

export default function Inventar({ user }) {
  const [userInv, setUserInv] = useState(false);
  const [items, setItems] = useState(false);
  const [userPokemon, setUserPokemon] = useState([]);

  let temp = [];

  useEffect(() => {
    //Get Characterinventary
    axios
      .get(
        `https://express-db-pokefight.herokuapp.com/character/?userid=${user.userID}`
        // `https://express-db-pokefight.herokuapp.com/character/624f423e28a61a1a37af9928`
      )
      .then((res) => setUserInv(res.data[0]));

    //Get all Items
    axios
      .get(`https://express-db-pokefight.herokuapp.com/item/`)
      .then((res) => setItems(res.data));
  }, []);

  useEffect(() => {
    if (userInv) {
      const fetch = async () => {
        await userInv.pokemons.map(async (pokemon) => {
          let fetching = axios.get(
            `https://express-db-pokefight.herokuapp.com/pokemon/${pokemon.pokemonid}`
          );
          temp.push(await fetching);
          setUserPokemon(temp);
        });
      };
      fetch();
    }
  }, [userInv]);

  function healPokemon(pokemon) {
    userInv.pokemons.find(
      (el) => el.pokemonid === pokemon.data._id
    ).stats.hp = 5;

    console.log(userInv);

    // axios.put(
    //   `https://express-db-pokefight.herokuapp.com/character/?userid=${user.userID}`,
    //   {}
    // );
  }

  return (
    <>
      {userPokemon.length > 0 && items && userInv && (
        <div className="inventar-div">
          <div className="inv-content-div">
            <div className="inv-items">
              {userInv.items.map((item, index) => (
                <div key={index}>
                  <img src={items.find((el) => el._id === item.itemid).icon} />
                  <p>{item.count}</p>
                </div>
              ))}
            </div>
            <div className="inv-pokemon">
              {userPokemon.map((pokemon, index) => (
                <div key={index}>
                  <p>{pokemon.data.name}</p>
                  <img src={pokemon.data.gif.front} />
                  <p>HP: {pokemon.data.stats.hp}</p>
                  <p>AP: {pokemon.data.stats.attack}</p>
                  <p>DP: {pokemon.data.stats.defense}</p>
                  <p>Speed: {pokemon.data.stats.speed}</p>
                  <button onClick={() => healPokemon(pokemon)}>
                    Heal Pokémon
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
//624bdc13d64105dd9a2975b4
