var Q = require('q');
var Bucket = require('./bucket');
var Request = require('./request');
var Response = require('./response');
var Sync = require('./sync');

module.exports = Connection;

function Connection(bucket, client) {
    this.bucket = bucket;
    this.client = client;
    this.promises = [];

    var self = this;
    var emitter = Object.create(this.bucket);

    emitter.async = function() {
        var deferred = Q.defer();
        self.promises.push(deferred.promise);

        return function(err) {
            if (err) return deferred.reject(err);
            deferred.resolve();
        };
    };

    emitter.emit('connection', this.client);
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

    var req = new Request(this, action, data, options);
    var res = new Response();

    res.on('error', function(err) {
        callback(err);
    });

    res.on('send', function(result) {
        var sync = new Sync(req, result);

        self.bucket.emit('sync', sync);
        sync.perform();
        
        callback(null, result);
    });

    var handle = function() {
        self.bucket.handle(req, res, function(err) {
            if (err) return callback(err);
            res.error(new Error('No handler for action: ' + req.action));
        });
    };

    // Wait until all promises are resolved before handling the request
    Q.all(this.promises).then(handle, callback);
};