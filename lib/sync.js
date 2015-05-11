module.exports = Sync;

function Sync(req, result) {
  this.client = req.client;
  this.resource = req.resource;
  this.action = req.action;
  this.result = result;

  this._stopped = false;
}

Sync.prototype.notify = function () {
  var self = this;
  var clients = [].slice.apply(arguments);

  clients.forEach(function (client) {
    client.emit('sync', self.action, self.result);
  });
};

Sync.prototype.broadcast = function () {
  this.notify(this.client.broadcast);
};

Sync.prototype.perform = function () {
  if (!this._stopped) {
    // Default is to broadcast `sync` to all clients
    this.broadcast();
  }
};

Sync.prototype.stop = function () {
  this._stopped = true;
};
