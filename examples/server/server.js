var express = require('express');
var memoryStore = require('../middleware/memory-store');

var app = express();
var server = app.listen(process.env.PORT || 3000);

var io = require('socket.io').listen(server);
var data = require('../../lib/index')(io);

var messages = data.resource('messages');
messages.use(memoryStore());

messages.on('sync', function (sync) {
  sync.notify(sync.client);
});
