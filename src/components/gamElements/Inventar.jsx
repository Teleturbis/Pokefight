import axios from "axios";
import React, { useState, useEffect } from "react";

export default function Inventar({ user }) {
  const [userInv, setUserInv] = useState();

  //Get Characterinventary
  useEffect(() => {
    axios
      .get(
        `https://express-db-pokefight.herokuapp.com/character/${user.userID}`
      )
      .then((res) => setUserInv(res.data));
  }, []);

  console.log(userInv);
  console.log("user", user);

  return (
    <div className="inventar-div">
      <div className="inv-content-div">Das ist das Inventar</div>
    </div>
  );
}
//624bdc13d64105dd9a2975b4
