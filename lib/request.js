var utils = require('./utils');

module.exports = Request;

function Request(connection, action, data, options) {
    this.connection = connection;
    this.action = action;
    this.data = data;
    this.client = connection.client;
    this.bucket = connection.bucket;
    this.store = {};

    for (var key in options) {
        this[key] = options[key];
    }
}

Request.prototype.set = function(key, value) {
    this.store[key] = value;
};

Request.prototype.get = function(key) {
    return this.store[key];
};