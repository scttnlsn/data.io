var assert = require('assert');
var sinon = require('sinon');
var Resource = require('../lib/resource');
var Connection = require('../lib/connection');

describe('Connection', function() {
    beforeEach(function() {
        this.resource = new Resource();
        this.client = {};
    });

    describe('when connecting', function() {
        it('emits connection event on resource', function(done) {
            var self = this;

            this.resource.on('connection', function(client) {
                assert.equal(client, self.client);
                done();
            });

            this.connection = new Connection(this.resource, this.client);
        });

        it('waits for async connection callbacks before handling syncs', function(done) {
            var connected = sinon.spy();

            this.resource.on('connection', function(client) {
                var callback = this.async();

                process.nextTick(function() {
                    connected();
                    callback();
                });
            });

            this.connection = new Connection(this.resource, this.client);

            this.connection.sync('foo', function() {
                assert.ok(connected.calledOnce);
                done();
            });
        });
    });

    describe('when syncing', function() {
        beforeEach(function() {
            var self = this;

            this.connection = new Connection(this.resource, this.client);

            this.sync = function(callback) {
                self.connection.sync('foo', { foo: 'bar' }, { baz: 'qux' }, callback);
            };

            this.resource.on('sync', function(sync) {
                self.perform = sync.perform = sinon.spy();
            });
        });

        it('passes req and res to resource handler', function(done) {
            var self = this;

            this.resource.handle = sinon.stub().yields();

            this.sync(function() {
                assert.ok(self.resource.handle.calledOnce);

                var req = self.resource.handle.getCall(0).args[0];
                var res = self.resource.handle.getCall(0).args[1];

                assert.equal(req.action, 'foo');
                assert.deepEqual(req.data, { foo: 'bar' });
                assert.equal(req.baz, 'qux');
                assert.equal(req.resource, self.resource);
                assert.equal(req.client, self.client);

                done();
            });
        });

        it('returns error if action is unhandled', function(done) {
            this.sync(function(err) {
                assert.ok(err);
                done();
            });
        });

        it('returns result sent from handler', function(done) {
            this.resource.use(function(req, res, next) {
                res.send('my response');
            });

            this.sync(function(err, result) {
                if (err) return done(err);

                assert.equal(result, 'my response');
                done();
            });
        });

        it('emits sync event on resource', function(done) {
            var self = this;
            var sync = sinon.spy();

            this.resource.use(function(req, res, next) {
                res.send('my response');
            });

            this.resource.on('sync', sync);

            this.sync(function(err, result) {
                if (err) return done(err);

                assert.ok(sync.calledOnce);

                var ret = sync.getCall(0).args[0];

                assert.equal(ret.result, 'my response');
                assert.equal(ret.action, 'foo');
                assert.equal(ret.resource, self.resource);
                assert.equal(ret.client, self.client);

                done();
            });
        });

        it('performs defaults on sync', function(done) {
            var self = this;

            this.resource.use(function(req, res, next) {
                res.send('my response');
            });

            this.sync(function(err, result) {
                if (err) return done(err);
                assert.ok(self.perform.calledOnce);
                done();
            });
        });
    });
});
