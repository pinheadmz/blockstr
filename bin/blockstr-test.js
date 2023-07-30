#!/usr/bin/env node
'use strict';

const {NodeClient} = require('bclient');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {Keys, Event} = require('boogers');
const {exec} = require('child_process');

const Art = require('../lib/art');

const file = path.join(os.homedir(), '.bitcoin', '.cookie');
const cookie = fs.readFileSync(file, 'ascii');
const [username, password] = cookie.split(':');

const hash = process.argv[2];

function cmd() {
  if (os.platform() === 'darwin')
    return '/Applications/Firefox.app/Contents/MacOS/firefox';
  else
    return 'firefox';
}

const clientOptions = {
  port: 8332,
  username,
  password
};

const client = new NodeClient(clientOptions);

const nsec = fs.readFileSync(
  path.join(__dirname, '..', 'conf', 'nsec.txt'),
  'ascii');
const keys = Keys.importNsec(nsec);

(async () => {
  const block = await client.execute('getblock', [hash, 2]);
  const art = new Art(block);
  art.draw();
  await art.print();
  console.log(`\nArt printed: ${art.filename()}\n`);

  const event = new Event();
  event.content =
    '#Bitcoin Block Art by Blockstr!\n' +
    `Height: ${block.height}\n` +
    `Weight: ${block.weight}\n` +
    `https://thebitcoinblockclock.com/blockstr/${block.hash}.png`;
  event.sign(keys);

  console.log(`Event serialized: ${event.serialize()}\n`);
  exec(`${cmd()} -new-tab file://${art.filename()}`);
})().catch((err) => {
  console.error(err.stack);
  process.exit(1);
});
