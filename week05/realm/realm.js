let globalProperties = [
  'eval',
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
  'Array',
  'Date',
  'RegExp',
  'Promise',
  'Proxy',
  'Map',
  'WeakMap',
  'Set',
  'WeakSet',
  'Function',
  'Boolean',
  'String',
  'Number',
  'Symbol',
  'Object',
  'Error',
  'EvalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError',
  'ArrayBuffer',
  'SharedArrayBuffer',
  'DataView',
  'Float32Array',
  'Float64Array',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Uint8Array',
  'Uint16Array',
  'Uint32Array',
  'Uint8ClampedArray',
  'Atomics',
  'JSON',
  'Math',
  'Reflect',
];
let relationShip = {};
function getIn(path, curr) {
  if (path.length === 0) return;
  let remains = path.slice(1);
  curr[path[0]] = curr[path[0]] || {};
  getIn(remains, curr[path[0]]);
}

let queue = [];
for (let p of globalProperties) {
  queue.push({
    path: [p],
    object: this[p],
  });
}
let set = new Set();
let current;
while (queue.length) {
  current = queue.shift();
  getIn(current.path, relationShip);
  console.log(current.path.join('.'));
  if (set.has(current.object) || !current.object) continue;
  set.add(current.object);
  for (let p of Object.getOwnPropertyNames(current.object)) {
    const property = Object.getOwnPropertyDescriptor(current.object, p);
    if (
      property.hasOwnProperty('value') &&
      property.value != null &&
      typeof property.value == 'object' &&
      property.value instanceof Object
    )
      queue.push({
        object: property.value,
        path: current.path.concat(p),
      });
    if (property.hasOwnProperty('get') && typeof property.get == 'function') {
      queue.push({
        object: property.get,
        path: current.path.concat(p),
      });
    }
    if (property.hasOwnProperty('set') && typeof property.set == 'function') {
      queue.push({
        object: property.set,
        path: current.path.concat(p),
        prev: p,
      });
    }
  }
}
ca;
console.log(relationShip);
