
const sg                      = require('sg-argv');
const _                       = sg._;
const io                      = require('socket.io-client');
const ARGV                    = sg.ARGV();
const server                  = ARGV.server   || 'localhost';
const port                    = ARGV.port     || 3333;
const room                    = ARGV.room     || '';

const serverUrl = process.argv[2] || `http://${server}:${port}/${room}`;
console.log(serverUrl);

const socket = io(serverUrl);
socket.on('connect', function() {
  console.log(`connected`);
});

socket.on('data', function(meta, ...args) {
  console.log(meta, ...inspect(args));
});

socket.on('disconnect', function() {
  console.log(`disconnect`);
});

function inspect(...args) {
  return sg.reduce(args, [], (m, arg) => {
    return sg.ap(m, sg.inspect(args));
  });
}
