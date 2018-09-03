
/**
 *  Hoy, hoy!
 *
 */
const jsonListener            = require('./json-listener');
const { streamJson }          = jsonListener;


var lib = {};

/**
 *  We are being bootstrapped into the system
 *
 */
const main = exports.Hello = function(amigos, playground) {

  amigos.amigo.streamJson = streamJson;

  jsonListener.listen(amigos, playground, function(err, result) {
  });
};



