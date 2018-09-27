
const sg                      = require('sgsg');
const AWS                     = require('aws-sdk');

var   cf;

exports.watchStackEvents = function(argv, context, callback) {

  const params = {
    StackName:      argv.stack_name
  };

  var   result = {};
  return sg.until(function(again, last, count, elapsed) {

    cf = cf || new AWS.CloudFormation({region: 'us-east-1'});
    return cf.describeStackEvents(params, function(err, data) {
      console.log({err, data});
      return last();
    });
  }, function done() {
    return callback(null, result);
  });
};

exports.watchStackEvents({stack_name:'ZebraDogServer'}, {}, function(err, result) {
  console.log({err, result});
});

