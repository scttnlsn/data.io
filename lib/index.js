var Server = require('./server');

module.exports = function(io) {
    return new Server(io);
};