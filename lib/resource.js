var events = require('events');
var util = require('util');

module.exports = Resource;

function Resource(name) {
  this.name = name;
  this.stack = [];
}

util.inherits(Resource, events.EventEmitter);

Resource.prototype.use = function () {
  var args = [].slice.call(arguments);
  var fn = args.pop();
  var actions = args.length ? args : ['*'];
  this.stack.push({ actions: actions, fn: fn });
};

Resource.prototype.handle = function (req, res, callback) {
  var self = this;
  var index = 0;

  function next(err) {
    var layer = self.stack[index++];

    if (!layer) {
      if (callback) callback(err);
      return;
    }

    var valid = function (action) {
      return layer.actions.indexOf(action) !== -1;
    };

    if (valid(req.action) || valid('*')) {
      try {
        if (err) {
          if (layer.fn.length === 4) {
            layer.fn(err, req, res, next);
          } else {
            next(err);
          }
        } else {
          layer.fn(req, res, next);
        }
      } catch (err) {
        next(err);
      }
    } else {
      next(err);
    }
  }

  next();
};
