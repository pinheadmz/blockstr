/* eslint-env mocha */
/* eslint prefer-arrow-callback: "off" */

'use strict';

const os = require('os');
const {exec} = require('child_process');
const Art = require('../lib/art');

function cmd() {
  if (os.platform() === 'darwin')
    return '/Applications/Firefox.app/Contents/MacOS/firefox';
  else
    return 'firefox';
}

describe('Print Test', function() {
  it('should print BTC genesis', async () => {
    const hash = '000000000019d6689c085ae165831e93' +
                 '4ff763ae46a2a6c172b3f1b60a8ce26f';
    const art = new Art(hash);
    art.draw();
    art.print();

    exec(`${cmd()} -new-tab file://${art.filename()}`);
  });
});
