module.exports = Sync;

function Sync(req, result) {
    this.client = req.client;
    this.bucket = req.bucket;
    this.action = req.action;
    this.result = result;
}

Sync.prototype.notify = function() {
    var self = this;
    var clients = [].slice.apply(arguments);

    clients.forEach(function(client) {
        client.emit('sync', self.action, self.result);
    });
};