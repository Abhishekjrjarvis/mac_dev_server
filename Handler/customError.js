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
