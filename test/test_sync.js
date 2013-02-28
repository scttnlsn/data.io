var assert = require('assert');
var events = require('events');
var Sync = require('../lib/sync');

describe('Sync', function() {
    beforeEach(function() {
        this.req = {
            action: 'foo',
            client: {},
            bucket: {}
        };

        this.sync = new Sync(this.req, { foo: 'bar' });
    });

    it('has action, client, bucket and result', function() {
        assert.equal(this.sync.action, 'foo');
        assert.equal(this.sync.client, this.req.client);
        assert.equal(this.sync.bucket, this.req.bucket);
        assert.deepEqual(this.sync.result, { foo: 'bar' });
    });

    describe('when notifying', function() {
        it('emitts a sync event on given emitters', function(done) {
            var emitter = new events.EventEmitter();

            emitter.on('sync', function(action, data) {
                assert.equal(action, 'foo');
                assert.deepEqual(data, { foo: 'bar' });
                done();
            });

            this.sync.notify(emitter);
        });
    });
});