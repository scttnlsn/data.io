var assert = require('assert');
var sinon = require('sinon');
var Bucket = require('../lib/bucket');
var Connection = require('../lib/connection');

describe('Connection', function() {
    beforeEach(function() {
        this.bucket = new Bucket();
        this.client = {};
    });

    it('emits connection event on bucket', function(done) {
        var self = this;

        this.bucket.on('connection', function(client) {
            assert.equal(client, self.client);
            done();
        });

        this.connection = new Connection(this.bucket, this.client);
    });

    describe('when syncing', function() {
        beforeEach(function() {
            var self = this;

            this.connection = new Connection(this.bucket, this.client);

            this.sync = function(callback) {
                self.connection.sync('foo', { foo: 'bar' }, { baz: 'qux' }, callback);
            };
        });

        it('passes req and res to bucket handler', function() {
            this.bucket.handle = sinon.spy();
            this.sync();

            assert.ok(this.bucket.handle.calledOnce);

            var req = this.bucket.handle.getCall(0).args[0];
            var res = this.bucket.handle.getCall(0).args[1];

            assert.equal(req.action, 'foo');
            assert.deepEqual(req.data, { foo: 'bar' });
            assert.equal(req.baz, 'qux');
            assert.equal(req.bucket, this.bucket);
            assert.equal(req.client, this.client);
        });

        it('returns error if action is unhandled', function(done) {
            this.sync(function(err) {
                assert.ok(err);
                done();
            });
        });

        it('returns result sent from handler', function(done) {
            this.bucket.use(function(req, res, next) {
                res.send('my response');
            });

            this.sync(function(err, result) {
                if (err) return done(err);

                assert.equal(result, 'my response');
                done();
            });
        });

        it('emits sync event on bucket', function(done) {
            var self = this;
            var sync = sinon.spy();

            this.bucket.use(function(req, res, next) {
                res.send('my response');
            });

            this.bucket.on('sync', sync);

            this.sync(function(err, result) {
                if (err) return done(err);

                assert.ok(sync.calledOnce);

                var req = sync.getCall(0).args[0];
                
                assert.equal(req.action, 'foo');
                assert.deepEqual(req.data, { foo: 'bar' });
                assert.equal(req.baz, 'qux');
                assert.equal(req.bucket, self.bucket);
                assert.equal(req.client, self.client);

                done();
            });
        });
    });
});