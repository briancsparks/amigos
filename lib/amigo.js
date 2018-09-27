
const _                       = require('underscore');

exports.Amigo = function() {
  var   self = this;

  // This function gets attached
  // const streamJson = function(streamName, json, callback)

  /**
   *  Gets called when JSON arrives on the main listener.
   *
   */
  self.inform = function(data) {

    // Fix / normalize the input data
    const { all, body, query, pathname } = data;

    // TODO: Introspect and understand the data, and route it appropriately

    // For now, there is only one destination -- the JSON stream
    const items = getItems(body);
    return self.streamJson(pathname, items, function(err, result) {
      // console.log(`informed, and streaming json`, {pathname, body, err, result});
    });
  };
};

/**
 *  Get the payload
 */
function getItems(body) {
  if (_.isArray(body))      { return body; }

  if (body.items)           { return arrayify(body.items); }

  return arrayify(body);
}

function arrayify(x) {
  if (_.isArray(x))     { return x; }
  return [x];
}

