/* eslint-env mocha */
/* eslint prefer-arrow-callback: 'off' */
/* eslint max-len: 'off' */

'use strict';

const os = require('os');
const {exec} = require('child_process');
const Art = require('../lib/art');

const blocks = require('./blocks.json');

function cmd() {
  if (os.platform() === 'darwin')
    return '/Applications/Firefox.app/Contents/MacOS/firefox';
  else
    return 'firefox';
}

describe('Print Test', function() {
  for (const block of blocks) {
    it(`should print BTC block ${block.height}`, async () => {
      const art = new Art(block);
      await art.draw();
      await art.print();

      exec(`${cmd()} -new-tab file://${art.filename()}`);
    });
  }
});

describe.skip('Orbit Test', function() {
  this.timeout(0);
  const block = blocks[0];
  block.height = 0;
  const start = block.height;
  it('should print BTC blocks', async () => {
    while (block.height < start + 2020) {
      const art = new Art(block);
      art.draw();
      await art.print();

      exec(`${cmd()} -new-tab file://${art.filename()}`);
      block.height += 100;
    }
  });
});
