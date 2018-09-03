

exports.runReverseProxy = function(argv, context, callback_) {
  const port      = argv.port       || process.env.PORT || 7799;
  const route     = argv.route      || '/';
  const callback  = argv.callback   || function(){};

  var express   = require('express');
  var proxy     = require('http-proxy-middleware');

  // proxy middleware options
  var options = {
    //target: 'http://www.example.org', /* target host */

    target:         target,
    changeOrigin:   true,               // needed for virtual hosted sites
    ws:             true,                         // proxy websockets
  };

  // create the proxy (without context)
  var exampleProxy = proxy(options);

  // mount `exampleProxy` in web server
  var app = express();
      app.use(route, exampleProxy);
      app.listen(port, function(err, ...rest) {
        console.log(`hoy-hoy, listening on ${port}`);
        return callback(err, ...rest);
      });
}


