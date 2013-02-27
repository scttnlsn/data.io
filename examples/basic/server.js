var express = require('express');

var app = express();
var server = app.listen(process.env.PORT || 3000);

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/../..'));

var io = require('socket.io').listen(server);
var data = require('../../lib/index')(io);

// CRUD

var store = {};
var id = 1;
var messages = data.bucket('messages');

messages.use('create', function(req, res, next) {
    var message = req.data;
    message.id = id++;
    store[message.id] = message;

    res.send(message);
});

messages.use('update', function(req, res, next) {
    var id = req.data.id;
    var message = store[id];

    if (!message) return res.error(new Error('No such message'));

    for (var key in req.data) {
        message[key] = req.data[key];
    }

    store[id] = message;
    res.send(message);
});

messages.use('delete', function(req, res, next) {
    var id = req.data.id;
    var message = store[id];
    delete store[id];
    res.send(message);
});

messages.use('list', function(req, res, next) {
    var messages = [];
    for (var id in store) {
        messages.push(store[id]);
    }
    res.send(messages);
});

messages.use('read', function(req, res, next) {
    var id = req.data.id;
    res.send(store[id]);
});

// Notify

messages.on('sync', function(result, req) {
    // TODO: This needs to be cleaner
    req.client.broadcast.emit('sync', req.action, result);
});