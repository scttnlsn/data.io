var express = require('express');

var app = express();
var server = app.listen(process.env.PORT || 3000);

app.use(express.static(__dirname));

var io = require('socket.io').listen(server);
var data = require('../../lib/index')(io);

var messages = data.resource('messages');
messages.use(require('../middleware/memory-store')());
