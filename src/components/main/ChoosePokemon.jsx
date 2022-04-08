import React from "react";

export default function ChoosePokemon({ pokemon, changeUserPokemon }) {
  return (
    <div
      className="choosePokemon-card"
      onClick={() => changeUserPokemon(pokemon)}
    >
      <h1>{pokemon.name}</h1>
      <p>{pokemon.description}</p>
      <img src={`${pokemon.gif.front}`} alt="" />
      <ul>
        <li>HP: {pokemon.stats.hp}</li>
        <li>AP: {pokemon.stats.attack}</li>
        <li>DP: {pokemon.stats.defense}</li>
        <li>SPEED: {pokemon.stats.speed}</li>
      </ul>
    </div>
  );
}
