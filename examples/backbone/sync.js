var example = window.example || (window.example = {});

example.sync = function (collection, resource) {
  var sync = function (method, model, options) {
    options || (options = {});

    var success = options.success || function () {};
    var error = options.error || function () {};

    delete options.success;
    delete options.error;

    var deferred = $.Deferred();

    if (method === 'read' && !model.id) method = 'list';

    resource.sync(method, model, options, function (err, res) {
      if (err) {
        error(err);
        deferred.reject(err);
      } else {
        success(res);
        deferred.resolve(res);
      }
    });

    return deferred.promise();
  };

  var proto = Object.getPrototypeOf(collection);
  proto.model = proto.model.extend({ sync: sync });
  collection.sync = sync;

  resource.subscribe('create', function (data) {
    collection.add(data);
  });

  resource.subscribe('update', function (data) {
    var item = collection.get(data.id);
    if (item) item.set(data);
  });

  resource.subscribe('delete', function (data) {
    collection.remove(data.id);
  });
};
