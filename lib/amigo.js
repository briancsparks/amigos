

exports.Amigo = function() {
  var   self = this;

  // const streamJson = function(streamName, json, callback)

  self.inform = function(data) {
    const { all, body, query, pathname } = data;

    console.log(`asd1a amigo`);
    return self.streamJson(pathname, body, function(err, result) {
      console.log(`informed, and streaming json`, {pathname, body, err, result});
    });
  };
};


