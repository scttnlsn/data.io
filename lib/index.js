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
    var url = '/data.io.js';
    var listeners = http.listeners('request').slice(0);

    http.removeAllListeners('request');
    http.on('request', function(req, res) {
      if (0 == req.url.indexOf(url)) {
        serve(req, res);
      } else {
        for (var i = 0; i < evs.length; i++) {
          listeners[i].call(http, req, res);
        }
      }
    });
  });

  var serve = function(req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.writeHead(200);
    res.end(code);
  };
}

module.exports.client = require('../data.io');
