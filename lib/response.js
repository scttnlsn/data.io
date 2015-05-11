var events = require('events');
var util = require('util');

module.exports = Response;

function Response(options) {
  options || (options = {});
  this.options = options;
}

util.inherits(Response, events.EventEmitter);

Response.prototype.send = function (result) {
  this.emit('send', result);
};

Response.prototype.error = function (err) {
  var error = { type: err.name, message: err.message };

  for (var key in err) {
    error[key] = err[key];
  }

  if (this.options.debug) {
    error.stack = err.stack;
  }

  this.emit('error', error);
};
