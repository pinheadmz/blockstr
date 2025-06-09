'use strict';

const fs = require('fs');
const path = require('path');
const PImage = require('pureimage');

const width = 1200;
const height = width;
const d = width / 3 / 16;
const r = d / 2;

function LOG(msg) {
  process.stdout.write(String(msg) + '\n');
}

class Art {
  constructor(block) {
    this.hash = block.hash;
    this.merkleroot = block.merkleroot;
    this.height = block.height;
    this.weight = block.weight;
    this.bits = block.bits;
    this.nonce = block.nonce.toString(16).padStart(8, '0');;
    this.tags = [];
    if (typeof block.tx[0] === 'object') {
      let string = '';
      const hex = block.tx[0].vin[0].coinbase;
      const buf = Buffer.from(hex, 'hex');
      for (let i = 0; i < buf.length; i++) {
        if (buf[i] < 32 || buf[i] > 126)
          continue;

        string += String.fromCharCode(buf[i]);

        if (string.length === 12) {
          this.tags.push(string);
          string = '';
        }
      }
      this.tags.push(string);
    }

    this.font = PImage.registerFont(
      path.join(__dirname, '..', 'fonts', 'mono.ttf'),
      'MyMono').loadSync();

    this.dir = path.join(__dirname, '..', 'html');
    if (!fs.existsSync(this.dir))
      fs.mkdirSync(this.dir);

    this.img = PImage.make(width, height);
    this.ctx = this.img.getContext('2d');
    this.grd = null;
  }

  async draw() {
      // Swallow pureimage errors
      console.log = () => {};

      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, width, height);

      this.drawHalvening(width - (width / 6), (height / 6));
      this.drawBlock((width / 3), (2 * height / 3));
      this.drawTree((width / 2), (2 * height / 3));
      this.drawTag((width / 8), height - (height / 5));
      await this.drawMessage();

      // Restore
      console.log = (msg) => {
        process.stdout.write(msg);
      };
  }

  async drawMessage() {
    const imgPath = path.join(__dirname, '..', 'html', 'static', 'message.jpg');
    const stream = fs.createReadStream(imgPath);

    const img = await PImage.decodeJPEGFromStream(stream);
    this.ctx.drawImage(img, 0, 0, 800, 188);
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
        this.ctx.strokeStyle = '#000';
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

    // Get fractal angle from merkle tree root
    const hashBytePos = (parseInt(len) % 4) * 2; // get hex position
    const hashByteHex = this.merkleroot.slice(hashBytePos, hashBytePos + 2);
    const tweak = parseInt(hashByteHex, 16) % 45;

    this.drawBranches(0, -len, len * 0.8, angle - tweak, branchWidth * 0.8);
    this.drawBranches(0, -len, len * 0.8, angle + tweak, branchWidth * 0.8);

    this.ctx.restore();
  }

  // Initiates recursive fractal branch-drawing
  drawTree(offX, offY) {
    // Compute percent of full block weight
    // for starting line length
    const len = (height * 0.11) * (this.weight / 4000000);

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

  drawHalvening(offX, offY) {
    const pct = (this.height % 210000) / 210000;
    let radius = width / 7;
    radius -= 30;
    const shadow = radius * 2 * pct;

    const color0 = '#' + this.bits.slice(0, 6);
    const color1 = '#' + this.bits.slice(2);

    this.ctx.lineWidth = 4;

    // moon circle
    this.ctx.beginPath();
    this.ctx.arc(offX, offY, radius, 0, Math.PI * 2);

    // moon circle fill
    const grd = this.ctx.createLinearGradient(
      offX - radius, offY,
      offX + radius, offY);
    grd.addColorStop(0, color0);
    grd.addColorStop(1, color1);
    this.ctx.fillStyle = grd;
    this.ctx.fill();

    // shadow circle
    this.ctx.beginPath();
    this.ctx.arc(offX - shadow, offY, radius, 0, Math.PI * 2);

    // shadow circle border
    this.ctx.strokeStyle = color0;
    this.ctx.stroke();

    // shadow circle fill
    this.ctx.beginPath();
    this.ctx.arc(offX - shadow, offY, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#000';
    this.ctx.fill();

    // draw inverse moon circle mask
    this.ctx.beginPath();
    this.ctx.arc(offX, offY, radius, 0, Math.PI * 2);
    this.ctx.rect(0, 0, width, height);
    this.ctx.fillStyle = '#000';
    this.ctx.fill();

    // moon circle border
    this.ctx.beginPath();
    this.ctx.arc(offX, offY, radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = color1;
    this.ctx.stroke();

    this.drawDiffAdj(offX, offY, radius);
  }

  drawDiffAdj(offX, offY, radius) {
    radius += 50;
    const pct = (this.height % 2016) / 2016;
    const angle = ((Math.PI * 2) * pct) - (Math.PI * 0.5);
    const markX = offX
                  + (radius * Math.cos(angle))
                  - (24 * Math.cos(angle))
                  - 12;
    const markY = offY
                  + (radius * Math.sin(angle))
                  - (24 * Math.sin(angle))
                  + 12;

    // satellite
    this.ctx.fillStyle = '#' + this.nonce.slice(0, 6);
    this.ctx.strokeStyle = '#' + this.nonce.slice(2);
    this.ctx.font = '48pt MyMono';
    this.ctx.fillText(
      '¤',
      markX,
      markY);
    this.ctx.strokeText(
      '¤',
      markX,
      markY);
    // this.ctx.beginPath();
    // this.ctx.arc(markX, markY, 10, 0, Math.PI * 2);
    // this.ctx.strokeStyle = '#f00';
    // this.ctx.stroke();
    // this.ctx.fillStyle = '#f00';
    // this.ctx.fill();
  }

  drawTag(offX, offY) {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16pt MyMono';
    for (const tag of this.tags) {
      this.ctx.fillText(
        tag,
        offX,
        offY
      );
      offY += 16;
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
