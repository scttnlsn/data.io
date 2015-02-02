var assert = require('assert');
var events = require('events');
var sinon = require('sinon');
var Sync = require('../lib/sync');

describe('Sync', function() {
    beforeEach(function() {
        this.req = {
            action: 'foo',
            resource: {},
            client: {
                broadcast: {
                    emit: sinon.spy()
                }
            }
        };

        this.sync = new Sync(this.req, { foo: 'bar' });
    });

    it('has action, client, resource and result', function() {
        assert.equal(this.sync.action, 'foo');
        assert.equal(this.sync.client, this.req.client);
        assert.equal(this.sync.resource, this.req.resource);
        assert.deepEqual(this.sync.result, { foo: 'bar' });
    });

    it('can broadcast sync to clients', function() {
        this.sync.broadcast();

        var emit = this.sync.client.broadcast.emit;

        assert.ok(emit.calledOnce);

        var args = emit.getCall(0).args;

        assert.equal(args[0], 'sync');
        assert.equal(args[1], 'foo');
        assert.deepEqual(args[2], { foo: 'bar' });
    });

    describe('when performing default', function() {
        it('broadcasts to clients', function() {
            this.sync.broadcast = sinon.spy();
            this.sync.perform();
            assert.ok(this.sync.broadcast.calledOnce);
        });

        it('can be stopped', function() {
            this.sync.broadcast = sinon.spy();
            this.sync.stop();
            this.sync.perform();
            assert.ok(!this.sync.broadcast.called);
        });
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
