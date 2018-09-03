
/**
 *  Listens for requests. Those requests want data that is streaming into
 *  Amigos. Other modules send data, which gets streamed to the clients.
 *
 */

const _                       = require('underscore');
const http                    = require('http');
const urlLib                  = require('url');

var   data = {};

/**
 *  The HTTP listener. Clients of this endpoint are the recipients of
 *  the JSON data stream.
 *
 */
exports.startJsonStreamServer = function(argv, context, callback) {

  const port      = argv.port || process.env.PORT || 7798;

  // The main Node.js HTTP server
  const server = http.createServer((req, res) => {

    // We hold the connections for a very long time, if allowd to
    req.setTimeout(0);
    res.setTimeout(0);

    // Figure out what the requetor wants
    const url         = urlLib.parse(req.url, true);
    const query       = url.query || {};
    const queueName   = url.pathname;

    // Get the object stored for that queue
    const pipeState   = data[queueName] = data[queueName] || [];

    // What we do now depends on what was stored
    if (_.isArray(pipeState) && pipeState.length > 0) {

      // Data is waiting for us -- just send it back to the request

      console.log(`Request data from queue: ${queueName}. ${pipeState.length} data items are waiting.`);

      // We have data to respond with... use it
      res.writeHead(200, { 'Content-Type': 'application/json'});
      res.write(JSON.stringify(pipeState));
      res.end();

      // Put an empty array as the now-current data
      data[queueName] = [];

    } else if (pipeState.res) {

      // This one is kind-of weird. We are handling a request for queueName, but
      // there is already a request for it.  We return an empty list to them, and
      // put ourselves as the listener for the queue.
      // console.log(`Replacing someone as the queuedatahandler for ${queueName}`);

      console.warn(`Requesting data from ${queueName}, but there is already a hander.`);

      // Someone is already listening... kick them off
      pipeState.res.writeHead(200, { 'Content-Type': 'application/json'});
      pipeState.res.write(JSON.stringify(pipeState));
      pipeState.res.end();

      // Put ourselves as the listener

      data[queueName] = {req, res};

    } else {

      console.log(`No handler or data; setting myself up as the queuedatahandler for ${queueName}`);

      // Just set ourselves as the current listener
      data[queueName] = {req, res};
    }

  });

  // Listen on `port`
  server.listen(port, () => {
    console.log(`JSON stream server listening for JSON at ${port}`);
    return callback(null, {port});
  });
};

/**
 *  The function to call to send dato to JSON stream listeners.
 *
 */
exports.sendJson = function(argv, context, callback) {

  // Gets imports
  const queueName   = argv.queueName;
  const items       = argv.data || [];
  const pipeState   = data[queueName] = data[queueName] || [];

  if (_.isArray(pipeState)) {

    console.log(`Adding data to queue ${queueName}`);

    data[queueName] = [...(data[queueName] || []), ...(items || [])];

  } else if (pipeState.res) {

    console.log(`sending data to an alredy-waiting request${queueName}`);

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


