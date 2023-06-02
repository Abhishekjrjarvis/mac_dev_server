exports.set_off_amount = async (r_args) => {
  try {
    var total = 0;
    var set_arr = [];
    for (var ref of r_args) {
      if (ref?.paid_fee >= ref?.applicable_fee) {
        total += ref?.paid_fee - ref?.applicable_fee;
        set_arr.push({
          excess_fee: ref?.paid_fee - ref?.applicable_fee,
          remain: ref?._id,
        });
      }
    }
    return { total: total, set_off_arr: set_arr };
  } catch (e) {
    console.log(e);
  }
};
