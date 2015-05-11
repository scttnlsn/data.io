var port = process.env.PORT || 3000;
var socket = require('socket.io-client').connect('http://localhost:' + port);
var connection = require('../../lib/index').client(socket);

var messages = connection.resource('messages');

messages.sync('create', function (err, result) {
  if (err) throw err;

  setInterval(function () {
    messages.sync('update', { id: result.id, text: new Date() });
  }, 1000);
});

messages.subscribe(function (message, info) {
  console.log('Message received:', message, info);
});
