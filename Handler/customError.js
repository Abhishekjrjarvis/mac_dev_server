exports.handle_undefined = async (args) => {
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    args == 0 ||
    args === NaN
  ) {
    return "";
  } else {
    return args;
  }
};

exports.handle_NAN = async (args) => {
  if (
    args === "NaN"
  ) {
    return 0;
  } else {
    return args;
  }
};
