import {
  generateJoinAction,
  generateMoveAction,
  pickRandomMob,
  weightedPick
} from './Util';

const behavior = {
  ticRate: 0.1,
  maxActionsPerTic: 3,
  maxMobs: 50,
  actionsWeight: [
    { value: 'join', weight: 2 },
    { value: 'leave', weight: 2 },
    { value: 'move', weight: 2 },
    { value: 'skin', weight: 1 },
    { value: 'name', weight: 1 }
  ]
};

export default class Client {
  isConnected = false;
  interval;

  constructor(
    setIsConnected = null,
    setElapsedTics = null,
    game = null,
    logAction = null
  ) {
    this.setIsConnected = setIsConnected;
    this.setElapsedTics = setElapsedTics;
    this.game = game;
    this.logAction = logAction;

    // Automatically connect
    // this.connect();
  }

  connect() {
    this.isConnected = true;
    this.setIsConnected(this.isConnected);
    clearInterval(this.interval);
    this.interval = setInterval(
      this.onInterval.bind(this),
      behavior.ticRate * 1000
    );

    this.setElapsedTics(0);
  }

  generateTicObject() {
    let t = { actions: [] };

    const mob = pickRandomMob(this.game.mobs.filter((m) => m.id !== -1));
    for (let i = 0; i < behavior.maxActionsPerTic; i++) {
      switch (weightedPick(behavior.actionsWeight).value) {
        case 'join':
          if (this.game.mobs.length < behavior.maxMobs)
            t.actions.push(generateJoinAction());
          break;
        case 'leave':
          if (mob) {
            t.actions.push({
              id: mob.id,
              action: 'leave'
            });
          }
          break;
        case 'move':
          if (mob) t.actions.push(generateMoveAction(mob));
          break;
        default:
          break;
      }
    }

    return t;
  }

  onInterval() {
    this.applyTicObject(this.generateTicObject());
  }

  applyTicObject(u) {
    this.applyActions(u.actions);
    this.setElapsedTics((prev) => prev + 1);
  }

  applyActions(actions) {
    actions.forEach((action) => {
      this.logAction(action);
      switch (action.action) {
        case 'join':
          this.game.addMob(
            action.id,
            action.value.skin,
            action.value.name,
            action.value.x,
            action.value.y
          );
          break;
        case 'leave':
          this.game.removeMob(action.id);
          break;
        case 'move':
          this.game.moveMob(action.id, action.value.x, action.value.y);
          break;
        case 'skin':
          // todo
          break;
        case 'name':
          // todo
          break;
        default:
          console.error('Unknown action:', action);
      }
    });
  }

  disconnect() {
    this.isConnected = false;
    this.setIsConnected(this.isConnected);
    clearInterval(this.interval);

    this.setElapsedTics(0);
  }
}
