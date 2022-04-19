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
    this.socketList = [];

    this.socketEvents = [
      'connect',
      'connect-received',
      'disconnect-received',
      'msg-received',
      'battle-request-received',
      'battle-accept-received',
      'battle-reject-received',
      'friend-request-received',
      'friend-accept-received',
      'friend-reject-received',
<<<<<<< HEAD
      'action-gamestate-received',
=======
      'connect-received',
      'action-gamestate-received'
>>>>>>> origin/devMerge
    ];

    this.socketEvents.forEach((event) => {
      this.socket.on(event, (...messageObjects) => {
        this.callListeners(event, ...messageObjects);
      });
    });
  }

  callListeners(event, ...messages) {
    this.listener.forEach((l) => {
      if (l.event === event) {
        l.callback(...messages);
      }
    });
  }

  addListener(type, event, callback) {
    if (!this.listener.find((l) => l.type === type && l.event === event)) {
      // console.log('addListener', type, event);
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
