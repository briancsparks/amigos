
/**
 *
 */
const sg                      = require('sg-argv');
const _                       = sg._;

const app                     = require('express')();
const http                    = require('http');

const ARGV                    = sg.ARGV();
const port                    = ARGV.port     | 3000;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});


