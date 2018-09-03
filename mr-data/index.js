
// I am Mr, Data!

const sg                      = require('sgsg');

console.log('open for data', sg.kv('a', 42));

exports.Hello = function(amigos, playground) {
  var   self = this;

  self.name = 'mrdata';


  self.ingest = function(data, callback) {
    const { all, body, query, pathname } = data;

    console.log(`Ingeting data -- Mr. Data`);
    return callback(null, {data});
  };
};


