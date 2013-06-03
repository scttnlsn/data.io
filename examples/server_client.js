var express = require('express');
var store = require('./store');

var app = express();
var server = app.listen(process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

var io = require('socket.io').listen(server);
var data = require('../lib/index')(io);

var messages = data.resource('messages');
messages.use(store());

// Server-side client

var socket = require('socket.io-client').connect('http://localhost:' + server.address().port);
var connection = require('../lib/index').client(socket);
var client = connection.resource('messages');

client.sync('create', function (err, result) {
    if (err) throw err;

    setInterval(function () {
        client.sync('update', { id: result.id, text: new Date() });
    }, 1000);
});

client.subscribe(function (message, info) {
    console.log('Message received:', message, info);
});