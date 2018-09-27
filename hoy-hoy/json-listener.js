
/**
 *  The main HTTP Listener
 *
 */
const sg                      = require('sgsg');
const _                       = sg._;
const http                    = require('http');
const urlLib                  = require('url');
const jsonQueue               = require('./json-stream-http-queue');


var lib = {};

/**
 *  Send JSON to the named stream
 *
 *
 */
const streamJson = function(streamName, data, callback) {

  // console.log(`Sending streamJson to the ${streamName} event queue`);
  return jsonQueue.streamJson({streamName, data}, {}, function(err, receipt) {
    // The json sender response

    return callback(err, receipt);
  });
};
exports.streamJson = streamJson;

/**
 *  Listen for the JSON requests
 *
 */
exports.listen = function(amigos, playground, callback) {

  const hostname  = '127.0.0.1';
  const jsonPort  = 5766;             /* if you dial JSON on the phone, it is 5766 */

  /**
   *  Listen for JSON data.
   */
  const server = http.createServer((req, res) => {
    // TODO: Maybe use getRawBody since we do not know it will be JSON
    return sg.getBody(req, function() {

      const url         = urlLib.parse(req.url, true);
      const query       = url.query;
      const bodyJson    = req.bodyJson || {};

      // console.log(`Main JSON listener:`, {query, bodyJson});

      // Build an object that has oll of the data
      const all   = _.extend({}, bodyJson || {}, query);
      const argv  = {all, body: bodyJson, query, pathname: url.pathname};

      // Hey, Mr. Data, I just got a big ol chunk of JSON... I knew you would be interested!
      amigos.mrdata.ingest(argv, respond);

      // You, too Mr. Amigo -- go tell your friends Mr Data has new data
      amigos.amigo.inform(argv);


      // The responding fn
      function respond(err, data) {
        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.write(JSON.stringify(data));
        res.end();
      };

    });
  });

  var result = {main:{}, stream:{}};

  server.listen(jsonPort, () => {
    console.log(`The main server is listening for JSON at ${jsonPort}`);
    result.main.port = jsonPort;
  });


  jsonQueue.startJsonStreamServer({port: 7799}, {}, function(err, startConf) {
    result.stream.port = startConf.port;
    console.log(`Started json stream ${startConf.port}`, {startConf});
  });

};



