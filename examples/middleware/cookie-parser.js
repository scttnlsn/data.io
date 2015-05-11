var cookie = require('cookie');

module.exports = function (secret) {
  return function (req, res, next) {
    var value = req.client.handshake.headers.cookie;
    req.cookies = {};

    if (value) {
      req.cookies = cookie.parse(value);

      if (secret) {
        req.cookies = cookie.signedCookies(req.cookies, secret);
      }
    }

    next();
  };
};
