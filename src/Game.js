import { gsap } from 'gsap';
import * as PIXI from 'pixi.js';
import { Mob, Player } from './Mob';
import { skins } from './Util';
import World from './World';

export default class Game {
  mobs = [];
  player = null;
  map = null;

  constructor(setMovement = null, setKeys = null) {
    this.setMovement = setMovement;
    this.setKeys = setKeys;

    console.log('== Setting up game ==');

    this.app = new PIXI.Application({ backgroundColor: 0x1099bb });
    document.querySelector('.game-div').appendChild(this.app.view);

    // Scale mode for all textures, will retain pixelation
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    // Add the world to the stage
    this.world = new World(this.app);
    this.app.stage.addChild(this.world);

    // Load tile reference
    let url = `${process.env.PUBLIC_URL}/assets/tile-reference.json`;
    fetch(url).then((response) => {
      response.json().then((json) => {
        this.tileReference = json;
        this.loadTextures();
      });
    });
  }

  loadTextures() {
    // Load Textures, then start the game
    skins.forEach((skin) => {
      this.app.loader.add(skin, `assets/skins/${skin}.png`);
    });

    this.tileReference.forEach((tileReference) => {
      this.app.loader.add(
        tileReference.src,
        `assets/tiles/${tileReference.src}`
      );
    });

    console.log('Loading textures...');
    this.app.loader.load(() => {
      console.log('Loading complete!');

      // Load the map, then start
      let url = `${process.env.PUBLIC_URL}/assets/maps/map-test.tmj`;
      fetch(url).then((response) => {
        response.json().then((json) => {
          this.map = json;
          this.world.loadMap(this.map, this.tileReference);

          this.start();
        });
      });
    });
  }

  start() {
    // Create the player
    this.player = new Player(this.app, -1, 0, 0, 'blue');
    this.world.addSortedChild(this.player);
    this.mobs.push(this.player);
    this.handlePlayerMovement(this.player);
    this.jumpToRandomTile();
  }

  jumpToRandomTile() {
    const g =
      this.world.grid[Math.floor(Math.random() * this.world.grid.length)];
    this.player.x = g.x;
    this.player.y = g.y;
  }

  addMob(id, skin, name, x, y) {
    const mob = new Mob(this.app, id, 0, 0, skin, name);
    this.world.addSortedChild(mob);
    mob.x = x;
    mob.y = y;
    this.mobs.push(mob);
  }

  moveMob(id, x, y) {
    const mob = this.mobs.find((mob) => mob.id === id);
    if (!mob) {
      console.error(`Could not find mob with id: ${id}`);
      return;
    }

    gsap.killTweensOf(mob);
    mob.moving = true;
    mob.face(x > mob.x ? 'right' : 'left');
    gsap.to(mob, {
      x: x,
      y: y,
      duration: 1,
      onComplete: () => (mob.moving = false)
    });
  }

  setSkin(id, skin) {
    const mob = this.mobs.find((m) => m.id === id);
    if (mob) mob.setSkin(skin);
    else {
      console.error('Could not find mob with id:', id, ' in ', this.mobs);
    }
  }

  resetPlayerLocation() {
    // this.player.x = this.app.screen.width / 2;
    // this.player.y = this.app.screen.height / 2;
    // Set player x and y to 0
    this.player.x = 0;
    this.player.y = 0;
  }

  removeMob(id) {
    this.mobs.forEach((mob, index) => {
      if (mob.id === id) this.mobs.splice(index, 1);
    });
  }

  handlePlayerMovement(player) {
    // Set the initial position
    this.resetPlayerLocation();

    // Opt-in to interactivity
    player.interactive = true;

    const MAX_SPEED = 2; // Maximum speed
    const MIN_SPEED = 0.1; // Minimum speed before stopping
    const MIN_WALK_SPEED = 0.3; // Minimum speed to play walk animation
    const FRICTION = 0.8; // Player slows down by this coefficient when not accelerating
    const ACCELERATION = 0.2; // Player accelerates by this coefficient when moving

    // Movement
    let keys = {
      left: false,
      right: false,
      up: false,
      down: false
    };

    this.setKeys({ ...keys });

    let speed = 0;
    let acceleration = 0;
    let angle = null;
    let face = 'right';

    this.app.ticker.add((delta) => {
      // todo change speed if angle is different
      const currentAngle = this.angleFromKeys(keys);
      if (currentAngle !== angle) speed /= 2;
      if (currentAngle !== null) angle = currentAngle;

      acceleration = Object.values(keys).some((key) => key) ? ACCELERATION : 0;

      speed += acceleration;
      speed = Math.min(speed, MAX_SPEED);

      player.x += Math.cos((angle * Math.PI) / 180) * speed;
      player.y += Math.sin((angle * Math.PI) / 180) * speed;

      if (!acceleration) speed *= FRICTION;
      if (speed < MIN_SPEED) speed = 0;

      player.moving = speed > MIN_WALK_SPEED;

      if (angle !== 90 && angle !== 270)
        face = angle > 90 && angle < 270 ? 'left' : 'right';
      player.face(face);

      // Center world on player
      this.world.x = -player.x + this.app.screen.width / 2;
      this.world.y = -player.y + this.app.screen.height / 2;

      this.setMovement({
        x: Math.floor(player.x),
        y: Math.floor(player.y),
        moving: player.moving,
        angle: angle,
        face: face
      });
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

      // console.log(`Keydown: ${e.key}`);
      this.setKeys({ ...keys });
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

      // console.log(`Key up: ${e.key}`);
      this.setKeys({ ...keys });
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
