const { custom_date_time_receipt } = require("../helper/dayTimer");
const InstituteAdmin = require("../models/InstituteAdmin");
const FeeReceipt = require("../models/RazorPay/feeReceipt");

exports.fail_safe_receipt = async (inc) => {
  try {
    var fail_safe = false;
    const valid_receipt = await FeeReceipt.find({ invoice_count: `${inc}` });
    if (valid_receipt?.length > 0) {
      return { fail_safe: false, skip: valid_receipt?.length };
    } else {
      return { fail_safe: true, skip: 0 };
    }
  } catch (e) {
    console.log(e);
  }
};

exports.reset_receipt = async () => {
  try {
    var all_ins = await InstituteAdmin.find({});
    var date = new Date();
    var assign_date = custom_date_time_receipt(0);
    var new_date = JSON.stringify(date)?.slice(1, 8);
    for (var ins of all_ins) {
      for (var ref of ins?.invoice_count_array) {
        if (`${ref?.year}` === `${new_date}`) {
        } else {
          ins.invoice_count_array.push({
            year: `${assign_date}`,
          });
          ins.invoice_count = 0;
        }
      }
      await ins.save();
    }
  } catch (e) {
    console.log(e);
  }
};
