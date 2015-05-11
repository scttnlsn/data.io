var fs = require('fs');
var path = require('path');
var Server = require('./server');

module.exports = function (io) {
  serve(io.httpServer);
  return new Server(io);
};

function serve(http) {
  var code = fs.readFileSync(path.dirname(__dirname) + '/data.io.js');

  http.on('request', function (req, res) {
    if (req.url === '/data.io.js') {
      res.setHeader('Content-Type', 'application/javascript');
      res.writeHead(200);
      res.end(code);
    }
  });
}

module.exports.client = require('../data.io');
