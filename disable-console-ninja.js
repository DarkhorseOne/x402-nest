// Blocks the Console Ninja build hook from loading (it attempts a localhost websocket connection).
// Disable Console Ninja hook that attempts localhost websocket connections.
console.log('console-ninja disable hook active');
const path = require('path');
const Module = require('module');
const originalLoad = Module._load;

const ninjaPath = path.join(
  process.env.HOME || '',
  '.cursor',
  'extensions',
  'wallabyjs.console-ninja-1.0.496-universal',
  'out',
  'buildHook',
  'index.js',
);

// Pre-seed require cache with an empty module to short-circuit loading.
if (!Module._cache[ninjaPath]) {
  Module._cache[ninjaPath] = {
    id: ninjaPath,
    filename: ninjaPath,
    loaded: true,
    exports: {},
  };
}

Module._load = function (request, parent, isMain) {
  if (typeof request === 'string' && request.includes('console-ninja')) {
    // Prevent the Console Ninja hook from loading (it attempts websocket connections).
    return {};
  }
  if (typeof request === 'string' && request.includes('wallabyjs')) {
    return {};
  }
  if (typeof request === 'string' && request.includes('buildHook')) {
    return {};
  }
  if (typeof request === 'string' && request.includes('console-ninja')) {
    return {};
  }
  return originalLoad.apply(this, arguments);
};

// Intercept JS loader to no-op when the console-ninja hook path is requested.
const originalJs = Module._extensions['.js'];
Module._extensions['.js'] = function (module, filename) {
  if (filename && filename.includes('console-ninja')) {
    module._compile('module.exports = {};', filename);
    return;
  }
  return originalJs(module, filename);
};

// As a last resort, neutralize outbound localhost websocket attempts that still slip through.
// Console Ninja dials a local port (often 53346); we return a harmless fake socket instead
// so the process does not crash on EPERM.
const net = require('net');
const { Duplex } = require('stream');
const originalConnect = net.connect;
net.connect = function patchedConnect(...args) {
  const options = typeof args[0] === 'object' ? args[0] : {};
  const port = options.port || args[0];
  const host = options.host || args[1];
  if (host === '127.0.0.1' && String(port) === '53346') {
    const socket = new Duplex({
      read() {},
      write(_chunk, _enc, cb) {
        if (cb) cb();
      },
    });
    socket.destroy = () => {};
    process.nextTick(() => socket.emit('connect'));
    return socket;
  }
  return originalConnect.apply(net, args);
};
