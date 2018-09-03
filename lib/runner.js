
/**
 *
 */
const sg                      = require('sgsg');
const _                       = sg._;
const { spawn }               = require('child_process');
const util                    = require('util');
const jetpack                 = require('fs-jetpack');

const ARGV                    = sg.ARGV();
const argvGet                 = sg.argvGet;
const argvExtract             = sg.argvExtract;
const setOnn                  = sg.setOnn;
const deref                   = sg.deref;

var lib = {};




const main = lib.main = function(argv, context, outerCallback) {

  return sg.iwrap('fn', outerCallback, abort, function(eabort) {

    const { command, args } = argv;
    var   options = argv.options || {
      env:    process.env,
      cwd:    jetpack.cwd()
    };



    const child   = spawn(command, args, options);

    options.env   = sg.numKeys(options.env);
    options.pid   = child.pid;
    var   record  = {command, args, options, stdout:[], stderr:[]};

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      record.stdout.push(chunk);
      console.log(`stdout: ${chunk}`);
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      record.stderr.push(chunk);
      console.error(`stderr: ${chunk}`);
    });

    child.on('close', (code) => {
      record.exitCode = code;

      // Fixup output
      if (record.stdout.length > 0) {
        record.stdout = record.stdout.join('').split('\n');
      }

      if (record.stderr.length > 0) {
        record.stderr = record.stderr.join('').split('\n');
      }

      return callback(null, record);
    });

    function callback(err, result) {
      return outerCallback(err, result);
    }
  });

  function abort(err, msg) {
    console.error(msg, err);
    return callback(err);
  }
};




_.each(lib, (value, key) => {
  exports[key] = value;
});


function inspect(x) {
  return util.inspect(x, {depth:null, colors:true});
}

