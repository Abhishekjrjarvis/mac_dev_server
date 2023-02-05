exports.valid_initials = (real, imaginary) => {
  if (imaginary) {
    var valid_start = imaginary.startsWith(real);
    if (valid_start) {
      var frame_initials = imaginary?.slice(real?.length);
      var final = real + frame_initials;
      return final;
    } else {
      return real + imaginary;
    }
  }
};
