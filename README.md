data.io
===

Bidirectional data syncing via Socket.IO

[![NPM](https://img.shields.io/npm/v/data.io.svg?style=flat)](http://npm.im/data.io)
[![Build Status](https://img.shields.io/travis/scttnlsn/data.io.svg?style=flat)](https://travis-ci.org/scttnlsn/data.io)

Example
---

On the server:

```javascript
var io = require('socket.io').listen(3000);
var data = require('data.io')(io);

var messages = data.resource('messages');

var store = {};
var id = 1;

messages.use('create', 'update', function (req, res) {
  var message = req.data;
  if (!message.id) message.id = id++;
  store[message.id] = message;
  res.send(message);
});

messages.use('delete', function (req, res) {
  var message = store[req.data.id];
  delete store[message.id];
  res.send(message);
});

messages.use('read', function (req, res) {
  var message = store[req.data.id];
  res.send(message);
});
```

On the client:

```html
<script src="/socket.io/socket.io.js"></script>
<script src="/data.io.js"></script>

<script>
  var conn = data(io.connect());
  var messages = conn.resource('messages');

  messages.subscribe('create', 'update', function (message) {
    // Message created or updated on the server
  });

  messages.subscribe('delete', function (message) {
    // Message deleted on the server
  });

  // Create a new message on the server
  messages.sync('create', { text: 'Hello World' }, function (err, message) {
    // Message saved
  });
</script>
```

Resources
---

Resources are stacks of composable middleware functions that are responsible for handling sync requests from the client and responding appropriately.  Each middleware layer is a function that accepts a request and response object (as well as a function that can be called to continue execution down the stack).  A middleware layer will generally either modify the request context and pass control to the next layer or respond to the client with some kind of result or error.

For example, we could add logging middleware to a resource:

```javascript
var messages = data.resource('messages');

messages.use(function (req, res, next) {
  console.log(new Date(), req.action, req.data);
  next();
});

messages.use(...);
```

Middleware can be selectively applied to particular actions by specifying them in your calls to `use`.  If a request's action does not match a particular layer then that layer will be skipped in the stack.  For example, we might want to authorize requests on create, update and delete actions:

```javascript
messages.use('create', 'update', 'delete', function(req, res, next) {
  // req.action is one of 'create', 'update' or 'delete'

  req.client.get('access token', function (err, token) {
    if (err) return next(err);

    if (isAuthorized(token)) {
      next();
    } else {
      next(new Error('Unauthorized'));
    }
  });
});

messages.use(function (req, res, next) {
  // req.action could be anything
  // 'create', 'update' or 'delete' is authorized
});
```

Request
---

When clients initiate a sync with the server a request object is created and passed through the middleware stack.  A request object will contain the following properties:

* `action` - the type of sync action being performed (i.e. create, read, update, etc.)
* `data` - any data provided by the client
* `options` - additional options set by the client
* `resource` - the resource handling the sync
* `client` - the Socket.IO client that initiated the request

Middleware functions can use the request object for storing arbitrary data via the `get(key)` and `set(key, value)` functions:

```javascript
messages.use('create', function (req, res, next) {
  req.set('date', new Date());
  next();
});

messages.use(function (req, res, next) {
  console.log(req.get('date'));
  next();
});
```

Response
---

The response object provides mechanisms for responding to client requests.  It exposes two function `send` and `error` that can be used for returning results or errors back to the client.

Events
---

When a client connects to a particular resource a `connection` event is emitted on the resource.  This can be used to perform any initialization, etc.

```javascript
messages.on('connection', function (client) {
  console.log(new Date(), 'connected', client);
  client.join('some room');
});
```

If your connection event handler needs to perform an async operation, call `this.async()` from within your callback.  The connection will not handle any requests until all async operations have completed without error.

```javascript
messages.on('connection', function(client) {
  var done = this.async();

  client.set('access token', client.handshake.query.access_token, function () {
    done();
  });
});
```

When a response is sucessfully sent back to the client a `sync` event is emitted on the resource and a sync object is provided.

```javascript
messages.on('sync', function (sync) {
  // Messages resource handled a sync
});
```

The sync object contains the following properties:

* `client` - the client that initiated the sync
* `resource` - the resource that handled the sync
* `action` - the sync action performed
* `result` - the result returned to the client

And provides these methods:

* `notify(emitter, ...)` - emit a sync event on the given emitters
* `stop()` - stop the default notification (syncs are broadcast to all clients by default)

For example:

```javascript
messages.on('sync', function (sync) {
  // Prevent sync event from being broadcast to connected clients
  sync.stop();

  // Notify clients in rooms 'foo' and 'bar'
  if (sync.action !== 'read') {
    sync.notify(sync.client.broadcast.to('foo'), sync.client.broadcast.to('bar'));
  }
});
```

Client
---

The client-side component provides a thin wrapper around Socket.IO for syncing data to the server and listening for sync events triggered by the server.

```javascript
var conn = data(io.connect());
var messages = conn.resource('messages');
```

Make requests to the server with a resource's `sync` function:

* `sync(action, [data], [options], callback)` - perform the specified action optionally sending the given data and request options, callback takes an error and a result

```javascript
messages.sync('create', { text: 'Hello World' }, function (err, result) {

});
```

Listen to syncs from the server with a resource's `subscribe` function:

* `subscribe([action], ..., callback)` - listen for syncs happening on the server optionally passing the actions to which the client should listen, callback accepts a result and action

```javascript
// Listen to all actions
messages.subscribe(function (data, action) {
  console.log(action, data);
});

// Listen to specific actions
messages.subscribe('create', 'update', 'delete', function (data, action) {
  // Action is one of 'create', 'update', or 'delete'
});
```

The client library can also be used server-side via the [socket.io-client](https://github.com/LearnBoost/socket.io-client) module:

```javascript
var socket = require('socket.io-client').connect('http://localhost:3000');
var conn = require('data.io').client(socket);
var messages = conn.resource('messages');
// etc.
```

Install
---

    npm install data.io

Test
---

    npm test

License
---

Copyright (C) 2013-2015 Scott Nelson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
