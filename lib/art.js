'use strict';

const fs = require('fs');
const path = require('path');
const PImage = require('pureimage');

const width = 800;
const height = width;
const d = width / 2 / 16;
const r = d / 2;

class Art {
  constructor(hash) {
    this.hash = hash;

    this.dir = path.join(__dirname, '..', 'html');
    fs.mkdirSync(this.dir);

    this.img = PImage.make(width, height);
    this.ctx = this.img.getContext('2d');
  }

  draw() {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, width, height);
      this.drawBlock(width / 4, height / 4);
  }

  drawBlock(offX, offY) {
    const color1 = '#' + this.hash.slice(-6);
    const color0 = '#' + this.hash.slice(-12, -6);

    for (let y = 0; y < 16 ; y++) {
      const row = this.hash.slice(y * 4, (y * 4) + 4);
      const bits = parseInt(row, 16).toString(2);
      const fill = '0000000000000000';
      const pattern = fill.slice(bits.length) + bits;

      for (let x = 0; x < 16; x++) {
        const bit = pattern[x];
        this.ctx.beginPath();
        this.ctx.fillStyle = parseInt(bit) ? color1 : color0;
        this.ctx.arc(
          (x + 1) * d - r + offX,
          (y + 1) * d - r + offY,
          r,
          0,
          2 * Math.PI
        );
        this.ctx.fill();
        this.ctx.stroke();
      }
    }
  }

  filename() {
    return path.join(this.dir, `${this.hash}.png`);
  }

  async print() {
    await PImage.encodePNGToStream(
      this.img,
      fs.createWriteStream(this.filename())
    );
  }
}

module.exports = Art;
