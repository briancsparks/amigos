
/**
 *  I am Mr. Amigo -- I walk around an try to get everyone involved.
 *
 */
const sg                      = require('sgsg');
const jetpack                 = require('fs-jetpack');
const home                    = jetpack.cwd(__dirname);
const Amigo                   = require('./lib/amigo').Amigo;

const mainish = exports.main = function(argv = {}) {
  const main = async function() {
    return new Promise(async function(resolve, reject) {
      // I aint never gonna resolve that Promise :)

      var playground  = {};
      var self        = new Amigo();

      // Go around and load all the package.json files
      var   neighborhood_ = await home.listAsync();

      self.hood = {};
      for (var i = 0; i < neighborhood_.length; ++i) {
        const item = neighborhood_[i];

        if (await jetpack.existsAsync(item) === 'dir') {

          const pkgJsonFilename = jetpack.path(item, 'package.json');
          if (await jetpack.existsAsync(pkgJsonFilename) === 'file') {

            const house         = require(jetpack.path(item));
            const neighbor      = new house.Hello(self, playground);
            const name          = neighbor.name;

            self.hood[name]     = neighbor;
          }
        }
      }

      return sg.until(function(again, last, count, elapsed) {
        //console.log({count, elapsed});

        if (count < 30) {
          return again(500);
        }
        return last();


      }, function done() {
        return resolve(42);
      });
    });
  };
  return main().then(function(result) {
    console.log('done, success');
  }).catch(function(err) {
    console.log({err});
  });
};

// Might as well get going
mainish();

