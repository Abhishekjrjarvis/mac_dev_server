exports.handle_undefined = (args) => {
  if (
    args === undefined ||
    args === null ||
    args === "" ||
    args == 0 ||
    args === NaN ||
    args
  )
    return "";
};
