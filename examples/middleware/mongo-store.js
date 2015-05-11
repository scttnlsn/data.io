module.exports = function (Model) {
  return function (req, res, next) {
    var callback = function (err, result) {
      if (err) return next(err);
      res.send(result);
    };

    var crud = {
      create: function () {
        Model.create(req.model, callback);
      },

      read: function () {
        Model.findById(req.data._id, callback);
      },

      list: function () {
        Model.find(req.options, callback);
      },

      update: function () {
        Model.update({ _id: req.data._id }, req.data, callback);
      }

      delete: function () {
        Model.remove({ _id: req.data._id }, function (err) {
          if (err) return next(err);
          res.send(req.data);
        });
      }
    };

    if (!crud[req.action]) return next(new Error('Unsuppored action: ' + req.action));
    crud[req.action]();
  };
};
