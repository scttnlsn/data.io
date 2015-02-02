var assert = require('assert');
var Response = require('../lib/response');

describe('Response', function() {
    beforeEach(function() {
        this.res = new Response();
    });

    it('is an event emitter', function(done) {
        this.res.on('foo', done);
        this.res.emit('foo');
    });

    it('emits a send event', function(done) {
        this.res.on('send', function(result) {
            assert.equal(result, 'foo');
            done();
        });

        this.res.send('foo');
    });

    it('emits an error event', function(done) {
        this.res.on('error', function(err) {
            assert.equal(err.type, 'Error');
            assert.equal(err.message, 'foobar');
            assert.equal(err.foo, 'bar');
            done();
        });

        var err = new Error('foobar');
        err.foo = 'bar';
        this.res.error(err);
    });

    describe('when debug option is true', function() {
        beforeEach(function() {
            this.res = new Response({ debug: true });
        });

        it('includes stack in error', function(done) {
            this.res.on('error', function(err) {
                assert.ok(err.stack);
                done();
            });

            this.res.error(new Error());
        });
    });
});
