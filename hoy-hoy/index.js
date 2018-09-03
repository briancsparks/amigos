
/**
 *  I 'answer the phone' for the system.
 *
 */
const sg                      = require('sgsg');
const _                       = sg._;
const runner                  = require('../lib/runner').main;
const http                    = require('http');
const urlLib                  = require('url');
const jsonQueue               = require('./json-stream-http-queue');
const {
  sendJson }                  = jsonQueue;

const ARGV                    = sg.ARGV();
const argvGet                 = sg.argvGet;
const argvExtract             = sg.argvExtract;
const setOnn                  = sg.setOnn;
const deref                   = sg.deref;

var lib = {};

const streamJson = function(streamName, json, callback) {

  return sendJson({queueName: streamName, json}, {}, function(err, receipt) {
    return callback(err, receipt);
  });
};


const main = exports.Hello = function(amigos, playground) {

  amigos.amigo.streamJson = streamJson;

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

      // The caller must format the input correctly:
      //
      //  all = {
      //    command: 'string',
      //    args:    ['the', 'args', 'to', 'pass']
      //  }
      //

      const all   = _.extend({}, bodyJson || {}, query);
      const argv  = {all, body: bodyJson, query, pathname: url.pathname};

      // Hey, Mr. Data, I just got a big ol chunk of JSON... I knew you would be interested!
      amigos.mrdata.ingest(argv, respond);

      // You, too Mr. Amigo -- go tell your friends Mr Data has new data
      amigos.amigo.inform(argv);


      // The responding fn
      function respond(err, data) {
        console.log(`hoyhoy respond`, {err, data});

        // res.setHeader('Content-Type', 'application/json');

        // if (err) {
        //   res.statusCode = 400;
        //   return res.end('{}');
        // }

        // res.statusCode = data.exitCode === 0 ? 200 : 400;
        // res.end(JSON.stringify(data));



        res.writeHead(200, { 'Content-Type': 'application/json'});
        res.write(JSON.stringify(data));
        res.end();
      };

    });
  });

  server.listen(jsonPort, () => {
    console.log(`Server listening for JSON at ${jsonPort}`);
  });


  jsonQueue.startJsonStreamServer({port: 7799}, {}, function(err, startConf) {
    console.log(`Started json stgream ${startConf.port}`);
  });


};



