
const sg                      = require('sgsg');
const _                       = sg._;
const {
  qm,
  resolve }                   = require('quick-merge');
const yaml                    = require('js-yaml');
const pathLib                 = require('path');
const jetpackA                = require('fs-jetpack');
const {
  toSnakeCase,
  toCamelCase,
  toCapitalCase,
  toDashCase }                = sg;


// const jetpackFileApis = 'append,createReadStream,createWriteStream,exists,file,inspect,read,write'.split(',');
const jetpackFileApis = 'append,createReadStream,createWriteStream,exists,file,read,write'.split(',');

/**
 *  Much like an fs-jetpack object holds a dir, this holds a file.
 */
var JetpackFile = function(jp, path_) {
  var   self = this;

  const pathParts   = splitPath(path_);
  const path        = pathLib.join(...pathParts);

  self.jetpack      = jp;
  self.path         = path;

  const fileParts   = _.last(pathParts).split('.');
  const [
    basename,
    ext,
    ...exts ]       = fileParts;
  const fullpath    = self.fullpath = self.jetpack.path(self.path);
  const dirpath     = self.dirpath  = pathLib.join(..._.initial(splitPath(fullpath)));

  var transforms    = {};

  /**
   *  Turns the file into a JS object
   */
  self.render = async function(argv = {}, config = {}) {
    const transform = transforms[_.last(exts) || 'none'] || transforms.none;
    const content   = await transform(fullpath, ext, argv, config);

    self.json = content || {};
    return self.json;
  };

  self.resolve = async function(name) {
    if (!self.json) { await self.render({}); }

    return await resolve(sg.deref(self.json, name));
  };

  self.update = async function(argv) {
    if (!self.json) { await self.render({}); }
    self.json = qm(self.json, argv);
    return self.json;
  };

  self.commit = async function(argv) {
    if (!self.json) {
      await self.render({});
    }

    if (self.json.just) {
      return await self.writeAsync(self.json.just);
    }

    if (argv) {
      await self.update(argv);
    }

    if (self.json.just) {
      return await self.writeAsync(self.json.just);
    }

    return await self.writeAsync(self.json);
  };

  self.dest = function(jp) {
    const [ name, ext ] = self.path.split('.');
    const destPath      = `${name}.${ext}`;

    return new JetpackFile(jp, destPath);
  };

  // Add all the jetpack APIs that take a filename
  _.each(jetpackFileApis, fname => {
    self[fname] = function(...args) {
      return self.jetpack[fname](self.path, ...args);
    };

    self[`${fname}Async`] = async function(...args) {
      return await self.jetpack[`${fname}Async`](self.path, ...args);
    };

  });

  const fooTransform = function(content, argv, config) {
    var result = content;

    _.each(argv, (value, key) => {
      result = result.replace(new RegExp(toSnakeCase(key), 'g'),    _.isString(value) ? toSnakeCase(value) : value);
      result = result.replace(new RegExp(toCamelCase(key), 'g'),    _.isString(value) ? toCamelCase(value) : value);
      result = result.replace(new RegExp(toDashCase(key), 'g'),     _.isString(value) ? toDashCase(value) : value);
      result = result.replace(new RegExp(toCapitalCase(key), 'g'),  _.isString(value) ? toCapitalCase(value) : value);
    });

    _.each(config.configuration, (value, key) => {
      result = result.replace(new RegExp(key, 'g'), value);
    });


    return result;
  };

  transforms.none = async function(file, ext, argv, config) {

    if (ext === 'json') {
      return await self.jetpack.readAsync(file, 'jsonWithDates');

    } else if (ext === 'yaml') {
      result = await self.jetpack.readAsync(file);
      if (result) {
        result = fooTransform(result, argv, config);
        result = yaml.load(result);
      }
      return result;
    }
    return {just: await self.jetpack.readAsync(file)};
  };

  transforms.js = async function(file, ext, argv, config) {
    const mod = require(file);
    const fn  = mod[ext] || function(){};
    return await fn(argv, config) || {};
  };

};

const jetpackFile = function(...args) {
  if (args.length === 1) {
    if (typeof args[0] === 'string')    { return jetpackFile(jetpackA, args[0]); }
    return /* undefined */;
  }
  if (args.length !== 2) {
    return /* undefined */;
  }

  const [ jp, path ] = args;
  return new JetpackFile(jp, path);
};

const find = async function(...args_) {
  var   args            = args_.slice();
  const searchOptions   = args.pop();
  const jp              = (typeof args[0] === 'string' ? jetpackA : args.shift());
  const path            = _.compact(args.shift());

  const filenames       = await jp.findAsync(...[...path, searchOptions]);

  return filenames.map(filename => {
    return new JetpackFile(jp, filename);
  });
};

exports.JetpackFile       = JetpackFile;
exports.jetpackFile       = jetpackFile;
exports.findJetpackFiles  = find;

/**
 *  Will split the path, irrespective of the OSs desired separator.
 */
function splitPath(str) {
  if (typeof str !== 'string')    { return str; }   /* hopefully, already split */

  return sg.reduce(str.split('/'), [], (m0, part0) => {
    return sg.reduce(part0.split('\\'), m0, (m, part) => {
      return [...m, part];
    });
  });
};

