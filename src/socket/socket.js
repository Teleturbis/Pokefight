import { io } from 'socket.io-client';

export default class PokeSocketClient {
  constructor(server, user) {
    console.log('constructor PokeSocketClient');
    // this.socket = io('https://express-db-pokefight.herokuapp.com', {
    // this.socket = io('http://localhost:3003', {
    this.socket = io(server, {
      // auth: { userId: '624b76d47607ffd9e180f7e0' },
      auth: { userId: user.userID, username: user.username }
    });

    this.listener = [];

    this.socketEvents = [
      'msg-received',
      'battle-request-received',
      'battle-accept-received',
      'battle-reject-received',
      'friend-request-received',
      'friend-accept-received',
      'friend-reject-received',
      'action-received'
    ];

    this.socketEvents.forEach((event) => {
      this.socket.on(event, (messageObj) => {
        this.callListeners(event, messageObj);
      });
    });
  }

  callListeners(event, message) {
    this.listener.forEach((l) => {
      if (l.event === event) {
        l.callback(message);
      }
    });
  }

  addListener(type, event, callback) {
    if (!this.listener.find((l) => l.type === type && l.event === event)) {
      this.listener.push({ type: type, event: event, callback: callback });
    }
  }

  removeListener(type, event) {
    this.listener = this.listener.filter(
      (l) => !(l.type === type && l.event === event)
    );
  }

  removeListeners(type) {
    this.listener = this.listener.filter((l) => !(l.type === type));
  }
}
