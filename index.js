
/**
 *
 */
const sg                      = require('sg-argv');
const _                       = sg._;

const app                     = require('express')();
const server                  = require('http').createServer(app);
const io                      = require('socket.io')(server);

const ARGV                    = sg.ARGV();
const port                    = ARGV.port     | 3000;

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

io.on('connection', (socket) => {
  console.log(`a user connected`);

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit(`chat message`, msg);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server listening on ${port}`);
});


