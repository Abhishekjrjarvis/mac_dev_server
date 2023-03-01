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
    var limit_array = nested_array.limit(limit);
    var skip_array = limit_array.skip(skip);
    return skip_array;
    console.log(skip_array?.length);
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

// const nums = [
//   {
//     hello: "World",
//     Awesome: "Marvelous",
//   },
//   {
//     hello: "Marvel",
//     Awesome: "Marvelous",
//   },
// ];
// console.log(nested_document_select(nums, "hello"));
