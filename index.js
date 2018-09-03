
/**
 *  I am Mr. Amigo -- I walk around an try to get everyone involved.
 *
 */
const sg                      = require('sgsg');
const Amigo                   = require('./lib/amigo').Amigo;
const jetpack                 = require('fs-jetpack');
const jetpackFileLib          = require('./lib/jetpack-file');
const home                    = jetpack.cwd(__dirname);
const {
  jetpackFile
}                             = jetpackFileLib;

const mrDataDir               = home.cwd('mr-data');
const hoyHoyDir               = home.cwd('hoy-hoy');
const mrDataPakkage           = jetpackFile(mrDataDir, 'package.json');
const hoyHoyPakkage           = jetpackFile(hoyHoyDir, 'package.json');

const mainish = exports.main = function(argv = {}) {
  var playground  = {};
  var self        = new Amigo();

  var amigos      = self.amigos     = {amigo: self};

  const main = async function() {
    return new Promise(async function(resolve, reject) {
      // I aint never gonna resolve that Promise :)

      // Go around and load all the package.json files
      const pkgs = await loadPakkages();

      async function loadPakkages() {

        await loadPakkage(mrDataPakkage);
        await loadPakkage(hoyHoyPakkage);

        async function loadPakkage(pakkageFile) {
          if (await pakkageFile.existsAsync() === 'file') {

            const dirpath     = pakkageFile.dirpath;
            // console.log(`mrData package: ${pakkageFile.fullpath}`, {dirpath});

            const house       = require(dirpath);
            const neighbor    = new house.Hello(amigos, playground);

            self.amigos[neighbor.name]  = neighbor;

            return neighbor;
          }
        }
      }


      return sg.until(function(again, last, count, elapsed) {
        //console.log({count, elapsed});

        // console.log({self});

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

