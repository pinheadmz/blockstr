'use strict';

const fs = require('fs');
const path = require('path');
const PImage = require('pureimage');

const width = 800;
const height = width;
const d = width / 2 / 16;
const r = d / 2;

// Swallow stupid pureimage messages
console.log = () => {};
function LOG(msg) {
  process.stdout.write(Buffer.from(String(msg), 'ascii'));
  process.stdout.write(Buffer.from('\n', 'ascii'));
}

class Art {
  constructor(block) {
    this.hash = block.hash;
    this.merkleroot = block.merkleroot;
    this.height = block.height;
    this.weight = block.weight;

    this.dir = path.join(__dirname, '..', 'html');
    if (!fs.existsSync(this.dir))
      fs.mkdirSync(this.dir);

    this.img = PImage.make(width, height);
    this.ctx = this.img.getContext('2d');
    this.grd = null;
  }

  draw() {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, width, height);
      this.drawBlock((width / 4), (height / 2));
      this.drawTree((width / 2), (height / 2));
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

  // Draws tree branches recursively
  // https://dev.to/lautarolobo/
  // use-javascript-and-html5-to-code-a-fractal-tree-2n69
  drawBranches(startX, startY, len, angle, branchWidth) {
    this.ctx.lineWidth = branchWidth;

    this.ctx.beginPath();
    this.ctx.save();

    // Draw one branch
    this.ctx.translate(startX, startY);
    this.ctx.rotate(angle * Math.PI/180);
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, -len);
    this.ctx.stroke();

    // End recursion once lines get too short
    if (len < 5) {
      this.ctx.restore();
      return;
    }

    // Get fractal angle from first byte of current block's tree root
    const tweak = (parseInt(this.merkleroot.slice(0, 2), 16) % 40) + 5;
    this.drawBranches(0, -len, len * 0.8, angle - tweak, branchWidth * 0.8);
    this.drawBranches(0, -len, len * 0.8, angle + tweak, branchWidth * 0.8);

    this.ctx.restore();
  }

  // Initiates recursive fractal branch-drawing
  drawTree(offX, offY) {
    // Compute percent of full block weight
    // for starting line length
    const len = (height * 0.1) * (this.weight / 4000000);

    // Estimate tree height
    const treeHeight = len * 3;

    // Create color gradient for "background" of tree from merkleroot hash
    this.grd = this.ctx.createLinearGradient(offX, offY,
                                             offX, offY - treeHeight);
    const color1 = '#' + this.merkleroot.slice(-6);
    const color0 = '#' + this.merkleroot.slice(-12, -6);
    this.grd.addColorStop(0, color0);
    this.grd.addColorStop(1, color1);
    this.ctx.strokeStyle = this.grd;

    this.drawBranches(offX, offY, len, 0, 10);
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
