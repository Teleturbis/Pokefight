import axios from 'axios';
import React, { useState } from 'react';

export default function Login({ changeUser }) {
  const [usernameInput, setusernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loginMode, setloginMode] = useState(true);

  function handleLogin(e) {
    e.preventDefault();
    const type = usernameInput.includes('@') ? 'email' : 'username';

    console.log('Logindata', {
      user: usernameInput,
      type: type,
      password: passwordInput,
    });

    axios
      .post('http://express-db-pokefight.herokuapp.com/user/login', {
        user: usernameInput,
        type: type,
        password: passwordInput,
      })
      .then((res) => {
        if (res.data.username) {
          console.log('789', res.data._id);
          changeUser({
            username: res.data.username,
            userID: res.data._id,
            loggedIn: true,
            token: res.data.token,
          });
        }
      })
      .catch((err) => {
        if (err) {
          window.alert('Falsches Passwort oder Benutzername');
        }
      });

    setusernameInput('');
    setPasswordInput('');
  }

  function handleRegistration() {
    axios
      .post('https://express-db-pokefight.herokuapp.com/user', {
        username: usernameInput,
        email: emailInput,
        password: passwordInput,
        validated: true,
      })
      .then((res) => console.log('Registration', res))
      .catch((err) => console.error(err));
  }

  return (
    <div className="login-div">
      <div className="login-overlay">
        <h1>PokeFight</h1>
        <div className="login-contentdiv">
          <div className="login-togglediv">
            <button
              onClick={() => setloginMode(true)}
              className={`login-mode-button ${loginMode ? 'loginmode' : ''}`}
            >
              Login
            </button>
            <button
              className={`login-mode-button ${loginMode ? '' : 'loginmode'}`}
              onClick={() => setloginMode(false)}
            >
              Sign Up
            </button>
          </div>
          {loginMode ? (
            <form onSubmit={(e) => handleLogin(e)} className="login-input">
              <input
                className="login-element"
                type="text"
                placeholder="Username"
                value={usernameInput}
                onChange={(e) => setusernameInput(e.target.value)}
              />
              <input
                className="login-element"
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <button type="submit" className="login-element login-button">
                Login
              </button>
            </form>
          ) : (
            <div className="login-input">
              <input
                className="login-element"
                type="text"
                placeholder="Username"
                value={usernameInput}
                onChange={(e) => setusernameInput(e.target.value)}
              />
              <input
                className="login-element"
                type="email"
                placeholder="Email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <input
                className="login-element"
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              <button
                className="login-element login-button"
                onClick={() => handleRegistration()}
              >
                Sign Up now!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
