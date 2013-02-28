var Bucket = require('./bucket');
var Response = require('./response');
var Sync = require('./sync');
var utils = require('./utils');

module.exports = Connection;

function Connection(bucket, client) {
    this.bucket = bucket;
    this.client = client;

    this.bucket.emit('connection', this.client);
}

Connection.prototype.sync = function(action, data, options, callback) {
    if (callback === undefined) {
        if (options === undefined && typeof data === 'function') {
            callback = data;
            data = {};
            options = {};
        } else if (typeof options === 'function') {
            callback = options;
            options = {};
        }
    }

    var self = this;

    var req = utils.extend(options, {
        action: action,
        data: data,
        client: this.client,
        bucket: this.bucket
    });

    var res = new Response();

    res.on('error', function(err) {
        callback(err);
    });

    res.on('send', function(result) {
        var sync = new Sync(req, result);

        self.bucket.emit('sync', sync);
        callback(null, result);
    });

    this.bucket.handle(req, res, function(err) {
        if (err) return callback(err);
        res.error(new Error('No handler for action: ' + req.action));
    });
};