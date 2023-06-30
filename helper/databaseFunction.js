function limit(c) {
  return this.filter((x, i) => {
    if (i <= c - 1) {
      return true;
    }
  });
}
Array.prototype.limit = limit;

function skip(c) {
  return this.filter((x, i) => {
    if (i > c - 1) {
      return true;
    }
  });
}
Array.prototype.skip = skip;

exports.nested_document_limit = (page, limit, nested_array) => {
  try {
    const skip = (page - 1) * limit;
    var skip_array = nested_array.skip(skip);
    var limit_array = skip_array.limit(limit);
    return limit_array;
  } catch (e) {
    console.log(e);
  }
};

exports.nested_document_select = (nested_array, args1) => {
  try {
    const filter_select = [];
    for (var child of nested_array) {
      for (var [key, value] of Object.entries(child)) {
        if (key === args1) {
          filter_select.push({
            key: value,
          });
        }
      }
    }
    return filter_select;
  } catch (e) {
    console.log(e);
  }
};
