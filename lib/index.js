var path = require('path');
var Server = require('./server');

module.exports = function(io) {
    io.static.add('/data.io.js', { file: path.dirname(__dirname) + '/data.io.js' });
    return new Server(io);
};

module.exports.client = require('../data.io');