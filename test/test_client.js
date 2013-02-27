var assert = require('assert');
var events = require('events');
var client = require('../data.io');

describe('Client', function() {
    beforeEach(function() {
        this.connection = client();
    });

    it('creates buckets', function() {
        assert.ok(this.connection.bucket('foo'));
    });

    describe('bucket', function() {
        beforeEach(function() {
            var self = this;

            this.namespace = new events.EventEmitter();
            this.bucket = this.connection.bucket('foo');

            this.bucket.namespace = function() {
                return self.namespace;
            };
        });

        describe('when syncing', function() {
            it('emits sync event on namespace', function(done) {
                this.namespace.on('sync', function(action, data, options, callback) {
                    assert.equal(action, 'foo');
                    assert.deepEqual(data, { foo: 'bar' });
                    assert.deepEqual(options, { baz: 'qux' });
                    done();
                });

                this.bucket.sync('foo', { foo: 'bar' }, { baz: 'qux' }, done);
            });
        });

        describe('when subscribing', function() {
            it('listens to sync event', function(done) {
                this.bucket.subscribe(function(data, options) {
                    assert.deepEqual(data, { foo: 'bar' });
                    assert.equal(options.action, 'foo');
                    done();
                });

                this.namespace.emit('sync', 'foo', { foo: 'bar' });
            });

            it('accepts optional action arguments', function(done) {
                var count = 0;
                var inc = function() {
                    count++;
                    if (count >= 3) done();
                };

                this.bucket.subscribe('foo', 'bar', inc);
                this.bucket.subscribe('baz', inc);

                this.namespace.emit('sync', 'foo', {});
                this.namespace.emit('sync', 'bar', {});
                this.namespace.emit('sync', 'baz', {});
                this.namespace.emit('sync', 'qux', {});
            });
        });
    });
});