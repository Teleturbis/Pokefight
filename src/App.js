import { useEffect, useState } from "react";

import "./assets/styles/styles.css";

import Login from "./components/userhandling/Login";
import MainMenu from "./components/main/MainMenu";

function App() {
  const [user, setUser] = useState({
    username: "",
    userID: "",
    loggedIn: false,
    token: "",
  });

  function changeUser(value) {
    setUser({
      username: value.username,
      userID: value.userid,
      loggedIn: value.loggedIn,
      token: value.token,
    });

    localStorage.setItem("userName", value.username);
    localStorage.setItem("userID", value.userid);
    localStorage.setItem("loggedIn", value.loggedIn);
    localStorage.setItem("token", value.token);
  }

  console.log(user);

  useEffect(() => {
    if (localStorage.getItem("userName")) {
      setUser({
        username: localStorage.userName,
        userID: localStorage.userID,
        loggedIn: localStorage.loggedIn,
        token: localStorage.token,
      });
    }
  }, []);

  return (
    <div>
      {user.loggedIn ? (
        <MainMenu user={user} changeUser={changeUser} />
      ) : (
        <Login changeUser={changeUser} />
      )}
    </div>
  );
}

export default App;
