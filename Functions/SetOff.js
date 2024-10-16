exports.set_off_amount = async (r_args) => {
  try {
    var total = 0;
    var set_arr = [];
    for (var ref of r_args) {
      if (
        ref?.applicable_card?.paid_fee >= ref?.applicable_card?.applicable_fee
      ) {
        total +=
          ref?.applicable_card?.paid_fee - ref?.applicable_card?.applicable_fee;
        if (
          ref?.applicable_card?.paid_fee -
            ref?.applicable_card?.applicable_fee >
          0
        ) {
          set_arr.push({
            excess_fee:
              ref?.applicable_card?.paid_fee -
              ref?.applicable_card?.applicable_fee,
            remain: ref?._id,
          });
        }
      }
      if (
        ref?.government_card?.paid_fee >= ref?.government_card?.applicable_fee
      ) {
        total +=
          ref?.government_card?.paid_fee - ref?.government_card?.applicable_fee;
        if (
          ref?.government_card?.paid_fee -
            ref?.government_card?.applicable_fee >
          0
        ) {
          set_arr.push({
            excess_fee:
              ref?.government_card?.paid_fee -
              ref?.government_card?.applicable_fee,
            remain: ref?._id,
          });
        }
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
          s_args.applicable_fees_pending +=
            r_args?.applicable_card?.remaining_fee ?? 1;
          s_args.government_fees_pending +=
            r_args?.government_card?.remaining_fee;
        }
      }
      s_args.applicable_fees_pending = s_args?.applicable_fees_pending == 0 ? 1 : s_args?.applicable_fees_pending
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
            : 1;
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
