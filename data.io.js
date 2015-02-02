(function(name, root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        root[name] = factory();
    }
}('data', this, function() {

    function Resource(name, socket) {
        this.name = name;
        this.socket = socket.io.socket('/' + this.name);
    }

    Resource.prototype.sync = function(action, data, options, callback) {
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

        this.socket.emit('sync', action, data, options, callback);
    };

    Resource.prototype.subscribe = function() {
        var args = [].slice.apply(arguments);
        var callback = args.pop();
        var actions = args.length ? args : ['*'];

        var valid = function(action) {
            return actions.indexOf(action) !== -1;
        };

        this.socket.on('sync', function(action, data) {
            if (valid(action) || valid('*')) {
                callback(data, { action: action });
            }
        });
    };

    return function(socket) {
        return {
            resource: function(name) {
                return new Resource(name, socket);
            }
        };
    };

}));
