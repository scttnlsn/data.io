exports.extend = function(a, b) {
    var result = {};

    for (var key in a) {
        result[key] = a[key];
    }

    for (var key in b) {
        result[key] = b[key];
    }

    return result;
};