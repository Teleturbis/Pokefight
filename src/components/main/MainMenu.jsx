import React from "react";

export default function MainMenu({ user, changeUser }) {
  return (
    <div>
      <select>
        <option>Hey {user.username}</option>
        <option
          onClick={() =>
            changeUser({
              username: "",
              userID: "",
              loggedIn: false,
              token: "",
            })
          }
        >
          LogOut
        </option>
      </select>
    </div>
  );
}
