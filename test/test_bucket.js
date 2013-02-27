var assert = require('assert');
var Bucket = require('../lib/bucket');

describe('Bucket', function() {
    beforeEach(function() {
        this.bucket = new Bucket();
    });

    it('has initialize method', function() {
        this.bucket.initialize();
    });

    it('has listeners method', function() {
        this.bucket.listeners();
    });

    describe('when handling request', function() {
        it('calls first layer', function(done) {
            this.bucket.use(function(req, res, next) {
                done();
            });

            this.bucket.handle({}, {});
        });

        it('passes request and response objects to layer', function(done) {
            var a = {};
            var b = {};

            this.bucket.use(function(req, res) {
                assert.equal(req, a);
                assert.ok(res, b);
                done();
            });

            this.bucket.handle(a, b);
        });

        it('passes control to the next layer', function(done) {
            this.bucket.use(function(req, res, next) {
                next();
            });

            this.bucket.use(function(req, res, next) {
                done();
            });

            this.bucket.handle({}, {});
        });

        it('calls callback if control reaches the bottom of stack', function(done) {
            this.bucket.use(function(req, res, next) {
                next();
            });

            this.bucket.use(function(req, res, next) {
                next();
            });

            this.bucket.handle({}, {}, done);
        });

        it('calls layers in order', function(done) {
            var count = 0;
            var value = 0;

            this.bucket.use(function(req, res, next) {
                count++;
                value = 1;
                next();
            });

            this.bucket.use(function(req, res, next) {
                count++;
                value = 2;
                next();
            });

            this.bucket.handle({}, {}, function(err) {
                if (err) return done(err);

                assert.equal(count, 2);
                assert.equal(value, 2);
                done();
            });
        });

        describe('when error occurs', function() {
            describe('when error is passed down the stack', function() {
                beforeEach(function() {
                    this.bucket.use(function(req, res, next) {
                        next(new Error());
                    });

                    this.bucket.use(function(req, res, next) {
                        done(new Error('This should never be called'));
                    });
                });

                it('passes any error to next accepting layer', function(done) {
                    this.bucket.use(function(err, req, res, next) {
                        assert.ok(err);
                        done();
                    });

                    this.bucket.handle({}, {});
                });

                it('passes error to callback if no layer accepts it', function(done) {
                    this.bucket.handle({}, {}, function(err) {
                        assert.ok(err);
                        done();
                    });
                });
            });

            describe('when error is thrown', function() {
                beforeEach(function() {
                    this.bucket.use(function(req, res, next) {
                        throw new Error();
                    });

                    this.bucket.use(function(req, res, next) {
                        done(new Error('This should never be called'));
                    });
                });

                it('catches error and passes it down the stack', function(done) {
                    this.bucket.use(function(err, req, res, next) {
                        assert.ok(err);
                        done();
                    });

                    this.bucket.handle({}, {});
                });
            });
        });

        describe('when action is specified', function() {
            it('calls all layers by default', function(done) {
                var count = 0;

                this.bucket.use(function(req, res, next) {
                    count++;
                    next();
                });

                this.bucket.handle({ action: 'foo' }, {}, function(err) {
                    if (err) return done(err);

                    assert.equal(count, 1);
                    done();
                });
            });

            it('only calls layers with corresponding action', function(done) {
                var counts = { one: 0, two: 0, three: 0 };

                this.bucket.use(function(req, res, next) {
                    counts.one++;
                    next();
                });

                this.bucket.use('foo', function(req, res, next) {
                    counts.two++;
                    next();
                });

                this.bucket.use('bar', function(req, res, next) {
                    counts.three++;
                    next();
                });

                this.bucket.handle({ action: 'foo' }, {}, function(err) {
                    if (err) return done(err);

                    assert.equal(counts.one, 1);
                    assert.equal(counts.two, 1);
                    assert.equal(counts.three, 0);
                    done();
                });
            });

            it('accepts multiple actions', function(done) {
                var self = this;
                var counts = { one: 0, two: 0 };

                this.bucket.use('foo', 'bar', function(req, res, next) {
                    counts.one++;
                    next();
                });

                this.bucket.use('foo', function(req, res, next) {
                    counts.two++;
                    next();
                });

                this.bucket.handle({ action: 'foo' }, {}, function(err) {
                    if (err) return done(err);

                    self.bucket.handle({ action: 'bar' }, {}, function(err) {
                        if (err) return done(err);

                        assert.equal(counts.one, 2);
                        assert.equal(counts.two, 1);
                        done();
                    });
                });
            });
        });
    });
});