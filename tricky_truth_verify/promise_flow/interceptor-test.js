// import { cascaded, globalContext } from './interceptor';
const ah = require('async_hooks');
const fs = require('fs');
const util = require('util');
require('./test');
require('./test1');
function log(...args) {
  debug(...args, 'called');
}

async function ppp(num) {
  console.log('number', num);
  await new Promise((resolve) => {
    setTimeout(resolve, 50);
  });
  return;
}
let map = new Map();

function hook(eid) {
  console.log('the async id triggered me', eid);
}
function debug(...args) {
  fs.writeFileSync(1, `${util.format(...args)}\n`, { flag: 'a' });
}
const requestContextMap = new Map();
let set = new Set();
function promiseThings() {
  ah.createHook({
    init(asyncId, type, triggerAsyncId) {
      debug('init', type, asyncId, 'trigger by', triggerAsyncId);
    },
    before(asyncId) {
      log('before', asyncId);
    },
    after(asyncId) {
      log('after', asyncId);
    },
    destroy(asyncId) {
      // if (set.has(asyncId)) log('destroy', asyncId);
      log('destroy', asyncId);
    },
  }).enable();

  // Promise.resolve(1).then(() => {
  //   console.log('little baby');
  // });

  let c = {};
  c.run = (cb) => {
    Promise.resolve(1).then(() => {
      cb();
    });
  };
  c.run(() => console.log('little baby'));
}

promiseThings();
