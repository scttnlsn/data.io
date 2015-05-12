var Resource = require('./resource');
var Connection = require('./connection');

module.exports = Server;

function Server(io) {
  this.io = io;
  this.resources = {};
}

Server.prototype.namespace = function (name) {
  return this.io.of(name);
};

Server.prototype.resource = function (name, resource) {
  var self = this;

  if (resource === undefined) {
    resource = this.resources[name];
    if (resource) return resource;
    resource = new Resource(name);
  }

  this.resources[name] = resource;

  this.namespace(name).on('connection', function (client) {
    self.connect(resource, client);
  });

  return resource;
};

Server.prototype.connect = function (resource, client) {
  var connection = new Connection(resource, client);

  client.on('sync', function () {
    var args = [].slice.apply(arguments);
    connection.sync.apply(connection, args);
  });

  return connection;
};
