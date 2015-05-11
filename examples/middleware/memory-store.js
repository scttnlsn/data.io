module.exports = function() {
  var models = {};
  var id = 1;

  return function (req, res, next) {
    var crud = {
      create: function () {
        var model = req.data;
        model.id = id++;
        models[model.id] = model;
        res.send(model);
      },

      read: function () {
        res.send(models[req.data.id]);
      },

      list: function () {
        var values = [];
        for (var id in models) values.push(models[id]);
        res.send(values);
      },

      update: function () {
        models[req.data.id] = req.data;
        res.send(req.data);
      },

      delete: function () {
        delete models[req.data.id];
        res.send(req.data);
      }
    };

    if (!crud[req.action]) return next(new Error('Unsuppored action: ' + req.action));
    crud[req.action]();
  }
};
