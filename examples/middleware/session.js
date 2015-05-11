var signature = require('cookie-signature');

module.exports = function (options) {
  options || (options = {});
  options.key || (options.key = 'connect.sid');

  if (!options.store) throw new Error('No session store provided');

  return function (req, res, next) {
    var sid = req.cookies[options.key];

    if (sid && sid.indexOf('s:') === 0) {
      sid = sid.slice(2);
    }

    if (options.secret) {
      sid = signature.unsign(sid, options.secret);
    }

    if (sid) {
      options.store.load(sid, function (err, session) {
        if (err) return next(err);
        if (!session) return next(new Error('Session not found'));
        req.session = session;
        next();
      });
    } else {
      next();
    }
  };
};
