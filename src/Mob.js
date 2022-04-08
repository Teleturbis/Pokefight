import * as PIXI from 'pixi.js';
import { Sprite } from 'pixi.js';

export class Mob extends Sprite {
  sprite;

  constructor(app, id, x, y, skin) {
    super();

    // console.log(`Mob id:${id}, skin:${skin}, x:${x}, y:${y}`);

    this.app = app;
    this.id = id;

    this.moving = false;

    this.sheet = this.packSpriteSheet(
      new PIXI.BaseTexture.from(this.app.loader.resources[skin].url)
    );

    this.sprite = new PIXI.AnimatedSprite(this.sheet.stand);

    this.sprite.x = x;
    this.sprite.y = y;

    this.setSkin(skin);

    this.app.ticker.add(this.onFrame.bind(this));
  }

  get x() {
    return this.sprite.x;
  }

  set x(value) {
    this.sprite.x = value;
  }

  get y() {
    return this.sprite.y;
  }

  set y(value) {
    this.sprite.y = value;
  }

  face(value) {
    this.sprite.scale.x = value === 'right' ? 1 : -1;
  }

  setSkin(skin) {
    // console.log('setSkin', skin);
    this.sheet = this.packSpriteSheet(
      new PIXI.BaseTexture.from(this.app.loader.resources[skin].url)
    );

    const coords = { x: this.sprite.x, y: this.sprite.y };

    this.removeChild(this.sprite);
    this.sprite = new PIXI.AnimatedSprite(this.sheet.stand);
    this.addChild(this.sprite);

    this.sprite.x = coords.x;
    this.sprite.y = coords.y;
    this.sprite.anchor.x = 0.5;

    this.sprite.animationSpeed = 0.2;
    this.sprite.loop = true;
  }

  onFrame(delta) {
    if (!this.sprite) return;

    if (this.moving) {
      if (this.sprite.textures !== this.sheet.walk) {
        this.sprite.textures = this.sheet.walk;
        if (!this.sprite.playing) this.sprite.play();
      }
    } else {
      this.sprite.textures = this.sheet.stand;
    }
  }

  packSpriteSheet(texture) {
    const w = texture.width / 4;
    const h = texture.height;

    const sheet = {
      stand: [new PIXI.Texture(texture, new PIXI.Rectangle(1 * w, 0, w, h))],
      walk: [
        new PIXI.Texture(texture, new PIXI.Rectangle(0 * w, 0, w, h)),
        new PIXI.Texture(texture, new PIXI.Rectangle(1 * w, 0, w, h)),
        new PIXI.Texture(texture, new PIXI.Rectangle(2 * w, 0, w, h)),
        new PIXI.Texture(texture, new PIXI.Rectangle(3 * w, 0, w, h))
      ]
    };

    return sheet;
  }
}

export class Player extends Mob {}
