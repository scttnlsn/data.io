(function(name, root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root[name] = factory();
    }
}('data', this, function() {

    function Bucket(name, socket) {
        this.name = name;
        this.socket = socket;
    }

    Bucket.prototype.namespace = function() {
        return this.socket.of(this.name);
    };

    Bucket.prototype.sync = function(action, data, options, callback) {
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

        this.namespace().emit('sync', action, data, options, callback);
    };

    Bucket.prototype.subscribe = function() {
        var args = [].slice.apply(arguments);
        var callback = args.pop();
        var actions = args.length ? args : ['*'];

        var valid = function(action) {
            return actions.indexOf(action) !== -1;
        };

        this.namespace().on('sync', function(action, data) {
            if (valid(action) || valid('*')) {
                callback(data, { action: action });
            }
        });
    };

    return function(socket) {
        return {
            bucket: function(name) {
                return new Bucket(name, socket);
            }
        };
    };

}));