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

exports.applicable_pending_calc = async (arr) => {
  try {
    for (var s_args of arr) {
      if (s_args?.remainingFeeList?.length > 0) {
        for (var r_args of s_args?.remainingFeeList) {
          s_args.applicable_fees_pending += r_args?.applicable_card?.remaining_fee
        }
      }
    }
    return arr;
  } catch (e) {
    console.log(e);
  }
};

exports.applicable_pending_calc_singleton = async (s_args) => {
  try {
    if (s_args?.remainingFeeList?.length > 0) {
      for (var r_args of s_args?.remainingFeeList) {
        s_args.applicable_fees_pending +=
          r_args?.fee_structure?.applicable_fees - r_args?.paid_fee > 0
            ? r_args?.fee_structure?.applicable_fees - r_args?.paid_fee
            : 0;
      }
    }
    return s_args;
  } catch (e) {
    console.log(e);
  }
};

exports.remaining_card_initiate_query = async (r_args) => {
  try {
    var value = 0;
    var filter_card = await r_args?.remaining_array?.filter((val) => {
      if (`${val?.status}` === "Not Paid") return val;
    });
    if (filter_card?.length > 0) {
      value = filter_card?.length;
      return value;
    } else {
      return value;
    }
  } catch (e) {
    console.log(e);
  }
};
