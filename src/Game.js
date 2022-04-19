import * as PIXI from 'pixi.js';
import { Mob, Player } from './Mob';
import { skins } from './Util';
import { gsap } from 'gsap';

export default class Game {
  mobs = [];
  player = null;

  constructor(client, user, setInfo) {
    this.client = client;
    this.user = user;
    this.setInfo = setInfo;

    this.app = new PIXI.Application({
      backgroundColor: 0x1099bb,
      antialias: true,
    });

    document.querySelector('.game-div').appendChild(this.app.view);

    const parent = this.app.view.parentNode;
    this.app.renderer.resize(1080, 1000);

    // Scale mode for all textures, will retain pixelation
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    // Add an empty container, world, to stage
    this.world = new PIXI.Container();
    this.app.stage.addChild(this.world);

    // Draw grid
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, 0xffffff, 0.5);
    const size = 32;
    const cols = 20;
    const rows = 10;
    for (let i = 0; i <= cols; i++) {
      grid.moveTo(i * size, 0);
      grid.lineTo(i * size, rows * size);
    }
    for (let i = 0; i <= rows; i++) {
      grid.moveTo(0, i * size);
      grid.lineTo(cols * size, i * size);
    }

    // this.world.addChild(grid);

    // Load Textures, then start the game
    skins.forEach((skin) => {
      this.app.loader.add(skin, `assets/skins/${skin}.png`);
    });

    this.app.loader.add('map', 'assets/map.png');

    this.app.loader.load(() => {
      this.start();
    });
  }

  start() {
    // Draw the map
    const map = new PIXI.Sprite(this.app.loader.resources.map.texture);
    this.world.addChild(map);

    // Create the player
    const availableSkins = ['blue', 'green', 'orange', 'purple', 'red'];
    this.player = new Player(
      this.app,
      this.world,
      -1,
      0,
      0,
      availableSkins[Math.floor(Math.random() * availableSkins.length)]
    );
    this.mobs.push(this.player);
    this.handlePlayerMovement(this.player);

    /**
     * MULTIPLAYER
     */

    // Listen to incoming actions
    this.client.addListener('game', 'action-received', (actions) => {
      console.log('actions-received', `(${actions.length})`, actions);
      actions.forEach((action) => {
        console.log(
          'action',
          `${action.action} ${action.id === this.user.userID ? '*' : ''}`
        );

        if (action.id !== this.user.userID) {
          console.log(action.id);
          switch (action.action) {
            case 'join':
              this.addMob(
                action.id,
                action.value.skin,
                action.value.name,
                action.value.x,
                action.value.y
              );
              break;
            case 'leave':
              this.removeMob(action.id);
              break;
            case 'move':
              this.moveMob(action.id, action.value.x, action.value.y);
              break;
            case 'verify':
              // After another player joins, send a verify action to confirm you're there
              // Same as join, just ignored by recipients if already verified
              const mob = this.mobs.find((mob) => mob.id === action.id);
              if (!mob) {
                this.addMob(
                  action.id,
                  action.value.skin,
                  action.value.name,
                  action.value.x,
                  action.value.y
                );
              }
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
        }
      });

      this.setInfo(
        'Players',
        this.mobs.map((mob) => mob.id)
      );
    });

    // Tell the server that the player has joined
    console.log('my user id', this.user.userID);
    const joinAction = {
      action: 'join',
      id: this.user.userID,
      value: {
        x: this.player.x,
        y: this.player.y,
        skin: this.skin,
      },
    };
    this.client.socket.emit('action-event', joinAction);
    this.client.socket.emit('msg-event', `${this.user.username} has joined`);
  }

  addMob(id, skin, name, x, y) {
    const mob = new Mob(this.app, this.world, id, 0, 0, skin, name);
    mob.x = x;
    mob.y = y;
    this.mobs.push(mob);
  }

  moveMob(id, x, y) {
    const mob = this.mobs.find((mob) => mob.id === id);
    if (!mob) {
      console.error(`Could not find mob with id: ${id}`);
      return;
    } else if (mob.id === this.user.userID) {
      // Ignore the player when moving a mob
      return;
    }

    gsap.killTweensOf(mob);
    mob.moving = true;
    mob.face(x > mob.x ? 'right' : 'left');
    gsap.to(mob, {
      x: x,
      y: y,
      duration: 1,
      onComplete: () => (mob.moving = false),
    });
  }

  removeMob(id) {
    const i = this.mobs.findIndex((mob) => mob.id === id);
    if (i !== this.user.userID) {
      this.mobs[i].destroy();
      this.mobs.splice(i, 1);
    } else {
      console.error('Could not find mob with id:', id);
    }
  }

  setSkin(id, skin) {
    const mob = this.mobs.find((m) => m.id === id);
    if (mob) mob.setSkin(skin);
    else {
      console.error('Could not find mob with id:', id);
    }
  }

  resetPlayerLocation() {
    console.log('resetPlayerLocation');
    this.player.x = this.app.screen.width / 2;
    this.player.y = this.app.screen.height / 2;
  }

  handlePlayerMovement(player) {
    // Set the initial position
    this.resetPlayerLocation();

    // Opt-in to interactivity
    player.interactive = true;

    // Movement
    let keys = {
      left: false,
      right: false,
      up: false,
      down: false,
    };

    let speed = 0;
    let angle = null;
    let face = 'right';

    setInterval(() => {
      if (
        this.lastCoord &&
        this.player.x === this.lastCoord.x &&
        this.player.y === this.lastCoord.y
      ) {
        return;
      }

      const moveAction = {
        action: 'move',
        id: this.user.userID,
        value: {
          x: this.player.x,
          y: this.player.y,
        },
      };

      this.client.socket.emit('action-event', moveAction);
      this.lastCoord = { x: this.player.x, y: this.player.y };
    }, 200);

    this.app.ticker.add((delta) => {
      speed = Object.values(keys).some((k) => k) ? 1 : 0;
      player.moving = speed > 0.1;

      const currentAngle = this.angleFromKeys(keys);
      if (currentAngle !== null) angle = currentAngle;

      player.x += Math.cos((angle * Math.PI) / 180) * speed;
      player.y += Math.sin((angle * Math.PI) / 180) * speed;

      if (angle !== 90 && angle !== 270)
        face = angle > 90 && angle < 270 ? 'left' : 'right';
      player.face(face);

      // Center world on player
      this.world.x = -player.x + this.app.screen.width / 2;
      this.world.y = -player.y + this.app.screen.height / 2;
    });

    // Movement listeners
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
          keys.up = true;
          break;
        case 'ArrowDown':
          keys.down = true;
          break;
        case 'ArrowLeft':
          keys.left = true;
          break;
        case 'ArrowRight':
          keys.right = true;
          break;
        default:
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowUp':
          keys.up = false;
          break;
        case 'ArrowDown':
          keys.down = false;
          break;
        case 'ArrowLeft':
          keys.left = false;
          break;
        case 'ArrowRight':
          keys.right = false;
          break;
        default:
          break;
      }
    });
  }

  angleFromKeys(keys) {
    let angle = null;

    if (keys.up && keys.left) {
      angle = 225;
    } else if (keys.up && keys.right) {
      angle = 315;
    } else if (keys.down && keys.left) {
      angle = 135;
    } else if (keys.down && keys.right) {
      angle = 45;
    } else if (keys.up) {
      angle = 270;
    } else if (keys.down) {
      angle = 90;
    } else if (keys.left) {
      angle = 180;
    } else if (keys.right) {
      angle = 0;
    }

    return angle;
  }
}
