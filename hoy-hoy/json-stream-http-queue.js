

const _                       = require('underscore');
const http                    = require('http');
const urlLib                  = require('url');

var   data = {};

exports.sendJson = function(argv, context, callback) {

  const queueName   = argv.queueName;
  const items       = argv.data || [];
  const pipeState   = data[queueName] = data[queueName] || [];

  if (_.isArray(pipeState)) {

    console.log(`Adding our data to queue ${queueName}`);

    data[queueName] = [...(data[queueName] || []), ...(items || [])];

  } else if (pipeState.res) {

    console.log(`sending json, and is a connection waiting ${queueName}`);

    // We have data to respond with, and a waiting request... use it
    const countSent = items.length;

    pipeState.res.writeHead(200, { 'Content-Type': 'application/json'});
    pipeState.res.write(JSON.stringify(items));
    pipeState.res.end();

    // Put an empty arr as the now-current data
    data[queueName] = [];

    return callback(null, {done:true, countSent});

  } else {
    console.error(`Error: Want to sendJson outbound, but cant tell`);
  }

};

exports.startJsonStreamServer = function(argv, context, callback) {

  const port      = argv.port || process.env.PORT || 7798;

  const server = http.createServer((req, res) => {

    req.setTimeout(0);
    res.setTimeout(0);

    const url         = urlLib.parse(req.url, true);
    const query       = url.query || {};

    const queueName   = url.pathname;
    const pipeState   = data[queueName] = data[queueName] || [];

    if (_.isArray(pipeState) && pipeState.length > 0) {

      console.log(`There was already data in the queue ${queueName}`);

      // We have data to respond with... use it
      res.writeHead(200, { 'Content-Type': 'application/json'});
      res.write(JSON.stringify(pipeState));
      res.end();

      // Put an empty arr as the now-current data
      data[queueName] = [];

    } else if (pipeState.res) {

      // Someone is already listening... kick them off
      pipeState.res.writeHead(200, { 'Content-Type': 'application/json'});
      pipeState.res.write(JSON.stringify(pipeState));
      pipeState.res.end();

      // Put ourselves as the listener
      console.log(`Replacing someone as the queuedatahandler for ${queueName}`);

      data[queueName] = {req, res};

    } else {

      console.log(`Setting myself up as the queuedatahandler for ${queueName}`);

      // Just set ourselves as the current listener
      data[queueName] = {req, res};
    }

  });

  server.listen(port, () => {
    console.log(`JSON stream server listening for JSON at ${port}`);
    return callback(null, {port});
  });
};


