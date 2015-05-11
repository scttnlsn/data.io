var assert = require('assert');
var events = require('events');
var sinon = require('sinon');
var Server = require('../lib/server');

describe('Server', function () {
  beforeEach(function () {
    this.server = new Server();
    this.resource = new events.EventEmitter();
    this.client = new events.EventEmitter();
  });

  describe('when registering a resource', function () {
    beforeEach(function () {
      var self = this;

      this.namespace = new events.EventEmitter();
      this.server.namespace = function () {
        return self.namespace;
      };

      this.server.connect = sinon.spy();
    });

    it('registers connection handler', function () {
      this.server.resource('foo', this.resource);
      this.namespace.emit('connection', this.client);

      assert.ok(this.server.connect.calledOnce);
      assert.equal(this.server.connect.getCall(0).args[0], this.resource);
      assert.equal(this.server.connect.getCall(0).args[1], this.client);
    });

    it('stores resource', function () {
      this.server.resource('foo', this.resource);
      assert.equal(this.server.resource('foo'), this.resource);
    });

    it('creates resources that do not exist', function () {
      var b1 = this.server.resource('foo');
      var b2 = this.server.resource('foo');

      assert.ok(b1);
      assert.ok(b2);
      assert.equal(b1, b2);
    });
  });

  describe('when connecting', function () {
    beforeEach(function () {
      this.connection = this.server.connect(this.resource, this.client);
    });

    it('registers a sync handler', function () {
      this.connection.sync = sinon.spy();

      this.client.emit('sync', 1, 2, 3);

      assert.ok(this.connection.sync.calledOnce);
      assert.equal(this.connection.sync.getCall(0).args[0], 1);
      assert.equal(this.connection.sync.getCall(0).args[1], 2);
      assert.equal(this.connection.sync.getCall(0).args[2], 3);
    });
  });
});
