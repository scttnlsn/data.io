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
                this.bucket.subscribe(function(action, data) {
                    assert.equal(action, 'foo');
                    assert.deepEqual(data, { foo: 'bar' });
                    done();
                });

                this.namespace.emit('sync', 'foo', { foo: 'bar' });
            });
        });
    });
});