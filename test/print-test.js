/* eslint-env mocha */
/* eslint prefer-arrow-callback: 'off' */
/* eslint max-len: 'off' */

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

const blocks = [
  {
    'hash': '000000000000000000042638b6267f965d31c63b56d1a954f28a0e23312c2ea2',
    'confirmations': 3,
    'height': 797951,
    'version': 536944640,
    'versionHex': '20012000',
    'merkleroot': '0806e42a8ef748f75efe3cd2e0f637defdbe40897f950dd24d9eef36d759b0cf',
    'time': 1688907558,
    'mediantime': 1688904904,
    'nonce': 3092138258,
    'bits': '17058ebe',
    'difficulty': 50646206431058.09,
    'chainwork': '00000000000000000000000000000000000000004e445b0b47da67692ab518a0',
    'nTx': 3582,
    'previousblockhash': '00000000000000000000cdddec74a7077d473481ac76b5be753d07cc0fe43965',
    'nextblockhash': '000000000000000000049ee84c821f42fc70f1ad24d1b87e2998e3dcc4d945f7',
    'strippedsize': 772170,
    'size': 1676459,
    'weight': 3992969,
    'tx': []
  }, {
    'hash': '000000000000000000100653ee0b3d2abda85f871e0fcddb647d5fa24fabbc62',
    'confirmations': 168044,
    'height': 629920,
    'version': 541065216,
    'versionHex': '20400000',
    'merkleroot': '69da72249d1fabea4c628c6926be367abcb89af6b45b88cbc0d58d517f32da5f',
    'time': 1589180865,
    'mediantime': 1589179115,
    'nonce': 2159486513,
    'bits': '17117a39',
    'difficulty': 16104807485529.38,
    'chainwork': '00000000000000000000000000000000000000000f5d6f8443cad6c5f807c66e',
    'nTx': 759,
    'previousblockhash': '0000000000000000000a9cdfb32ac51fe8a1dcea8d171efabd77d5fc875939e9',
    'nextblockhash': '00000000000000000000311d7438c13aa7cfe0b24b07b64331971c3eefc552b9',
    'strippedsize': 306744,
    'size': 508478,
    'weight': 1428710,
    'tx': []
  }, {
    'hash': '000000000000000082ccf8f1557c5d40b21edabb18d2d691cfbf87118bac7254',
    'confirmations': 497961,
    'height': 300000,
    'version': 2,
    'versionHex': '00000002',
    'merkleroot': '915c887a2d9ec3f566a648bedcf4ed30d0988e22268cfe43ab5b0cf8638999d3',
    'time': 1399703554,
    'mediantime': 1399701278,
    'nonce': 222771801,
    'bits': '1900896c',
    'difficulty': 8000872135.968163,
    'chainwork': '000000000000000000000000000000000000000000005a7b3c42ea8b844374e9',
    'nTx': 237,
    'previousblockhash': '000000000000000067ecc744b5ae34eebbde14d21ca4db51652e4d67e155f07e',
    'nextblockhash': '000000000000000049a0914d83df36982c77ac1f65ade6a52bdced2ce312aba9',
    'strippedsize': 128810,
    'size': 128810,
    'weight': 515240,
    'tx': []
  }, {
    'hash': '000000002c05cc2e78923c34df87fd108b22221ac6076c18f3ade378a4d915e9',
    'confirmations': 797953,
    'height': 10,
    'version': 1,
    'versionHex': '00000001',
    'merkleroot': 'd3ad39fa52a89997ac7381c95eeffeaf40b66af7a57e9eba144be0a175a12b11',
    'time': 1231473952,
    'mediantime': 1231471428,
    'nonce': 1709518110,
    'bits': '1d00ffff',
    'difficulty': 1,
    'chainwork': '0000000000000000000000000000000000000000000000000000000b000b000b',
    'nTx': 1,
    'previousblockhash': '000000008d9dc510f23c2657fc4f67bea30078cc05a90eb89e84cc475c080805',
    'nextblockhash': '0000000097be56d606cdd9c54b04d4747e957d3608abe69198c661f2add73073',
    'strippedsize': 215,
    'size': 215,
    'weight': 860,
    'tx': []
}
];

describe('Print Test', function() {
  for (const block of blocks) {
    it(`should print BTC block ${block.height}`, async () => {
      const art = new Art(block);
      art.draw();
      await art.print();

      exec(`${cmd()} -new-tab file://${art.filename()}`);
    });
  }
});
