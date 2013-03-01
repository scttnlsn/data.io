var express = require('express');
var store = require('./store');

var app = express();
var server = app.listen(process.env.PORT || 3000);

app.use(express.static(__dirname));

var io = require('socket.io').listen(server);
var data = require('../../lib/index')(io);

var messages = data.bucket('messages');
messages.use(store());