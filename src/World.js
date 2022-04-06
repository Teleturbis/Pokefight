import { Sprite } from 'pixi.js';

export default class World extends Sprite {
  app;
  sortedItems = [];
  tileReference;
  grid = [];

  constructor(app) {
    super();
    this.app = app;
  }

  loadMap(map, tileReference) {
    this.tileReference = tileReference;
    this.map = map;
    map.layers.forEach((layer) => this.addLayer(layer));
  }

  addLayer(layer) {
    console.log(`=== Adding Layer: ${layer.name} ===`);
    const scale = 0.2;
    const w = this.map.tilewidth * scale;
    const h = this.map.tileheight * scale;

    layer.data.forEach((id, index) => {
      id = Math.floor(id - 1);
      if (id < 0 || id >= this.tileReference.length) {
        return;
      }
      let tile = this.tileReference[id];
      let u = new Sprite(this.app.loader.resources[tile.src].texture);

      const col = index % this.map.width;
      const row = Math.floor(index / this.map.width);
      u.scale = { x: scale, y: scale };
      // Regular
      // u.x = col * w;
      // u.y = row * h;

      // Isometric
      u.x = (w * col) / 2 + (this.map.height * w) / 2 - (row * w) / 2;
      u.y =
        -1 *
        (((this.map.height - row - 1) * h) / 2 +
          (this.map.width * h) / 2 -
          (col * h) / 2);

      this.grid.push({ x: u.x, y: u.y });
      this.addSortedChild(u);
    });
  }

  addSortedChild(u) {
    this.sortedItems.push(u);
    this.addChild(u);
  }
}
