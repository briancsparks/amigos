
/**
 *  Listens for requests. Those requests want data that is streaming into
 *  Amigos. Other modules send data, which gets streamed to the clients.
 *
 */
const sg                      = require('sgsg');
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

    return sg.getBody(req, function() {

      // Figure out what the requetor wants
      const url         = urlLib.parse(req.url, true);
      const query       = url.query || {};
      const streamName  = url.pathname;

      // Get the object stored for that queue
      const pipeState   = data[streamName] = data[streamName] || [];

      // What we do now depends on what was stored
      if (_.isArray(pipeState) && pipeState.length > 0) {

        // Data is waiting for us -- just send it back to the request

        // console.log(`Request data from queue: ${streamName}. ${pipeState.length} data items are waiting.`);

        // We have data to respond with... use it
        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.write(JSON.stringify(pipeState));
        res.end();

        // Put an empty array as the now-current data
        data[streamName] = [];

      } else if (pipeState.res) {

        // This one is kind-of weird. We are handling a request for streamName, but
        // there is already a request for it.  We return an empty list to them, and
        // put ourselves as the listener for the queue.
        // console.log(`Replacing someone as the queuedatahandler for ${streamName}`);

        console.warn(`Requesting data from ${streamName}, but there is already a hander.`);

        // Someone is already listening... kick them off
        pipeState.res.writeHead(200, { 'Content-Type': 'application/json'});
        pipeState.res.write(JSON.stringify([]));
        pipeState.res.end();

        // Put ourselves as the listener

        data[streamName] = {req, res};

      } else {

        // console.log(`No handler or data; setting myself up as the queuedatahandler for ${streamName}`);

        // Just set ourselves as the current listener
        data[streamName] = {req, res};
      }

    });
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
exports.streamJson = function(argv, context, callback) {

  // Gets imports
  const streamName  = argv.streamName;
  const items       = argv.data || [];
  const pipeState   = data[streamName] = data[streamName] || [];

  if (_.isArray(pipeState)) {

    // console.log(`Adding data to queue ${streamName}`);

    data[streamName] = [...(data[streamName] || []), ...(items || [])];

  } else if (pipeState.res) {

    // console.log(`sending data to an alredy-waiting request${streamName}`);

    // We have data to respond with, and a waiting request... use it
    const countSent = items.length;

    pipeState.res.writeHead(200, { 'Content-Type': 'application/json'});
    pipeState.res.write(JSON.stringify(items));
    pipeState.res.end();

    // Put an empty arr as the now-current data
    data[streamName] = [];

    return callback(null, {done:true, countSent});

  } else {
    // console.error(`Error: Want to streamJson outbound, but cant tell`);
  }

};


