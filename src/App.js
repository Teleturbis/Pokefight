import { useEffect, useState } from "react";

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

  return <div></div>;
}

export default App;
