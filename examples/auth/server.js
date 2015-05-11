var express = require('express');
var expressSession = require('express-session');
var path = require('path');

// Express
// ----------

var app = express();
var server = app.listen(process.env.PORT || 3000);

var session = {
  store: new expressSession.MemoryStore(),
  secret: 'mysecret'
};

app.use(require('cookie-parser')());
app.use(expressSession(session));

// Serve `backbone` example client
app.use(express.static(path.dirname(__dirname) + '/backbone'));

app.get('/status', function (req, res) {
  if (req.session.user) {
    res.send('You are logged in');
  } else {
    res.send('You are not logged in');
  }
});

app.get('/login', function (req, res) {
  req.session.user = 'some user';
  res.redirect('/');
});

app.get('/logout', function (req, res) {
  req.session.user = undefined;
  res.redirect('/');
});

// Data.IO
// ----------

var io = require('socket.io').listen(server);
var data = require('../../lib/index')(io);

var messages = data.resource('messages');

var auth = function (req, res, next) {
  if (!req.session.user) {
    next(new Error('Unauthorized'));
  } else {
    next();
  }
};

messages.use(require('../middleware/cookie-parser')());
messages.use(require('../middleware/session')(session));
messages.use('create', 'update', 'delete', auth);
messages.use(require('../middleware/memory-store')());
