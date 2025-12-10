const net = require('net');
const origConnect = net.connect;

console.log('execArgv', process.execArgv);
console.log('NODE_OPTIONS', process.env.NODE_OPTIONS);

net.connect = (...args) => {
  console.trace('net.connect invoked', args);
  return origConnect.call(net, ...args);
};
