const Finance = require("../models/Finance");
const BankAccount = require("../models/Finance/BankAccount");
const FeeMaster = require("../models/Finance/FeeMaster");
const InstituteAdmin = require("../models/InstituteAdmin");
const FeeReceipt = require("../models/RazorPay/feeReceipt");

const render_other_fees_daybook_heads_wise = async (
  fid,
  from,
  to,
  bank,
  payment_type
) => {
  try {
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    let pg = ["Payment Gateway - PG", "By Cash", "Payment Gateway / Online"];
    var sorted_array = [];
    const bank_acc = await BankAccount.findById({ _id: bank });
    const finance = await Finance.findById({ _id: fid }).select("institute");
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select(
      "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated affliatedLogo"
    );

    var g_year = new Date(`${from}`).getFullYear();
    var g_day = new Date(`${from}`).getDate();
    var l_year = new Date(`${to}`).getFullYear();
    var l_day = new Date(`${to}`).getDate();
    var g_month = new Date(`${from}`).getMonth() + 1;
    if (g_month < 10) {
      g_month = `0${g_month}`;
    }
    if (g_day < 10) {
      g_day = `0${g_day}`;
    }
    var l_month = new Date(`${to}`).getMonth() + 1;
    if (l_month < 10) {
      l_month = `0${l_month}`;
    }
    if (l_day < 10) {
      l_day = `0${l_day}`;
    }
    const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
    const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
    if (payment_type) {
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_FINANCE_MANAGER",
          },
          {
            refund_status: "No Refund",
          },
          {
            fee_payment_mode: payment_type,
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .select("fee_heads other_fees")
        .populate({
          path: "other_fees",
          select: "bank_account fees_heads",
          populate: {
            path: "bank_account",
            select:
              "finance_bank_account_number finance_bank_name finance_bank_account_name",
          },
        })
        .lean()
        .exec();
    } else {
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_FINANCE_MANAGER",
          },
          {
            refund_status: "No Refund",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .select("fee_heads other_fees")
        .populate({
          path: "other_fees",
          select: "bank_account fees_heads",
          populate: {
            path: "bank_account",
            select:
              "finance_bank_account_number finance_bank_name finance_bank_account_name",
          },
        })
        .lean()
        .exec();
    }
    // console.log(all_receipts)
    all_receipts = all_receipts?.filter((val) => {
      if (val?.other_fees?._id) return val;
    });
    if (bank_acc?.bank_account_type === "Society") {
    } else {
      all_receipts = all_receipts?.filter((val) => {
        if (`${val?.other_fees?.bank_account?._id}` === `${bank}`) return val;
      });
    }
    let heads_queue = [];
    for (let i of all_receipts) {
      for (let j of i?.other_fees?.fees_heads) {
        heads_queue.push(j?.master);
      }
    }
    const unique = [...new Set(heads_queue.map((item) => item))];
    const all_master = await FeeMaster.find({
      _id: { $in: unique },
    }).select("master_name");
    var obj = {};
    var nest_obj = [];
    for (let ele of all_master) {
      obj["head_name"] = ele?.master_name;
      obj["head_amount"] = 0;
      obj["_id"] = ele?._id;
      nest_obj.push(obj);
      obj = {};
    }
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
        if (ele?.fee_heads?.length > 0) {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                  // console.log(ads.head_amount);
                }
              }
            }
          }
        } else {
          console.log("NO");
        }
      }
      return {
        results: nest_obj,
        account_info: bank_acc,
        day_range_from: from,
        day_range_to: to,
        ins_info: institute,
      };
    } else {
      return {
        results: [],
        account_info: {},
        day_range_from: null,
        day_range_to: null,
        ins_info: {},
      };
    }
  } catch (e) {
    console.log(e);
  }
};

const miscellaneousDaybookData = async (
  fid = "",
  from = "",
  to = "",
  bank = "",
  payment_type = ""
) => {
  // const ft = await getReceiptData(receiptId);
  // const ft = dataObj;

  const ft = await render_other_fees_daybook_heads_wise(
    fid,
    from,
    to,
    bank,
    payment_type
  );
  return { ft };
};
module.exports = miscellaneousDaybookData;
