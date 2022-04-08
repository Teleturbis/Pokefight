import { useEffect, useState } from 'react';

import './assets/styles/styles.css';

import Login from './components/userhandling/Login';
import InGame from './components/main/InGame';

import mainTheme from "./assets/sounds/background/theme/theme.mp3";

function App() {
  const audio = new Audio(mainTheme);

  const [user, setUser] = useState({
    username: '',
    userID: '',
    loggedIn: false,
    token: "",
    socketID: "",
  });

  const [musicPlaying, setMusicPlaying] = useState(false);

  function changeUser(value) {
    setUser({
      username: value.username,
      userID: value.userID,
      loggedIn: value.loggedIn,
      token: value.token
    });

    localStorage.setItem("userName", value.username);
    localStorage.setItem("userID", value.userID);
    localStorage.setItem("loggedIn", value.loggedIn);
    localStorage.setItem("token", value.token);
  }

  console.log(user);

  function playTheme() {
    if (!musicPlaying) {
      audio.volume = 0.25;
      audio.play();
    }
    setMusicPlaying(true);
  }

  function audioMainTheme() {
    audio.pause();
  }

  useEffect(() => {
    if (localStorage.getItem('userName')) {
      setUser({
        username: localStorage.getItem("userName"),
        userID: localStorage.getItem("userID"),
        loggedIn: localStorage.getItem("loggedIn"),
        token: localStorage.getItem("token"),
      });

      console.log("HERE");
    }
  }, []);

  return (
    <div
      onKeyDown={() => {
        playTheme();
        console.log(23);
      }}
    >
      {user.loggedIn ? (
        <InGame
          audioMainTheme={audioMainTheme}
          user={user}
          changeUser={changeUser}
        />
      ) : (
        <Login changeUser={changeUser} />
      )}
    </div>
  );
}

export default App;
