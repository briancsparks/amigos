
/**
 *
 */
const sg                      = require('sgsg');
const _                       = sg._;
const runner                  = require('./lib/runner').main;
const http                    = require('http');
const urlLib                  = require('url');

const ARGV                    = sg.ARGV();
const argvGet                 = sg.argvGet;
const argvExtract             = sg.argvExtract;
const setOnn                  = sg.setOnn;
const deref                   = sg.deref;

var lib = {};

const main = function(callback) {


  const hostname = '127.0.0.1';
  const port = 6789;

  const server = http.createServer((req, res) => {
    // TODO: Maybe use getRawBody since we do not know it will be JSON
    return sg.getBody(req, function() {

      const url     = urlLib.parse(req.url, true);
      const query   = url.query;

      // The caller must format the input correctly:
      //
      //  all = {
      //    command: 'string',
      //    args:    ['the', 'args', 'to', 'pass']
      //  }
      //

      const all   = _.extend({}, req.bodyJson || {}, query);

      return runner(all, {}, function(err, data) {
        res.setHeader('Content-Type', 'application/json');

        if (err) {
          res.statusCode = 400;
          return res.end('{}');
        }

        res.statusCode = data.exitCode === 0 ? 200 : 400;
        res.end(JSON.stringify(data));
      });
    });
  });

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });


};


main();

