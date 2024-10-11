const Finance = require("../models/Finance");
const BankAccount = require("../models/Finance/BankAccount");
const FeeMaster = require("../models/Finance/FeeMaster");
const FeeStructure = require("../models/Finance/FeesStructure");
const Hostel = require("../models/Hostel/hostel");
const InstituteAdmin = require("../models/InstituteAdmin");
const FeeReceipt = require("../models/RazorPay/feeReceipt");
const Staff = require("../models/Staff");
const moment = require("moment");
const getDaysArray = function (start, end) {
  const arr = [];
  for (
    const dt = new Date(start);
    dt <= new Date(end);
    dt.setDate(dt.getDate() + 1)
  ) {
    arr.push(new Date(dt));
  }
  return arr;
};

const normal_daybook = async (from, to, bank, payment_type, fid, staff) => {
  try {
    var g_year;
    var l_year;
    var g_month;
    var l_month;
    var sorted_array = [];
    const bank_acc = await BankAccount.findById({ _id: bank }).select(
      "-day_book"
    );
    const finance = await Finance.findById({ _id: fid }).select("institute");
    if (bank_acc?.bank_account_type === "Society") {
      var all_struct = await FeeStructure.find({
        $and: [{ finance: finance?._id }, { document_update: false }],
      });
    } else {
      var all_struct = await FeeStructure.find({
        $and: [
          { department: { $in: bank_acc?.departments } },
          { document_update: false },
        ],
      });
    }
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select(
      "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
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
    const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
    date.setDate(date.getDate() + 1);
    let l_dates = date.getDate();
    if (l_dates < 10) {
      l_dates = `0${l_dates}`;
    }
    var l_months = l_month;
    let list1 = ["01", "03", "05", "07", "08", "10", "12"];
    let list2 = ["04", "06", "09", "11"];
    let list3 = ["02"];
    let g_days = l_months?.toString();
    let l_days = l_months?.toString();
    if (g_day == 30 && list2?.includes(String(g_days))) {
      date.setMonth(date.getMonth() + 1);
      var l_months = date.getMonth();
      if (l_months < 10) {
        l_months = `0${l_months}`;
      }
    }
    if (g_day >= 31 && list1?.includes(String(g_days))) {
      date.setMonth(date.getMonth() + 1);
      var l_months = date.getMonth();
      if (l_months < 10) {
        l_months = `0${l_months}`;
      }
    }
    if (g_day == 30 && l_day == 30) {
    } else if (g_day == 31 && l_day == 31) {
    } else {
      if (l_day == 30 && list2?.includes(String(l_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      if (l_day >= 31 && list1?.includes(String(l_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
    }
    const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
    if (staff) {
      var one_staff = await Staff.findById({ _id: `${staff}` }).select(
        "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO staff_emp_code"
      );
      if (payment_type) {
        if (payment_type == "Total") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_ADMISSION",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              {
                cashier_collect_by: `${staff}`,
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )
            .populate({
              path: "application",
              select: "applicationDepartment",
              populate: {
                path: "applicationDepartment",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
          var all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
              `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else if (payment_type == "Cash / Bank") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_ADMISSION",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              {
                cashier_collect_by: `${staff}`,
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )
            .populate({
              path: "application",
              select: "applicationDepartment",
              populate: {
                path: "applicationDepartment",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
          var all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
              `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else {
          var all_receipts = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_ADMISSION",
              },
              {
                refund_status: "No Refund",
              },
              {
                fee_payment_mode: payment_type,
              },
              {
                visible_status: "Not Hide",
              },
              {
                cashier_collect_by: `${staff}`,
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )
            .populate({
              path: "application",
              select: "applicationDepartment",
              populate: {
                path: "applicationDepartment",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
        }
      } else {
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_ADMISSION",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            {
              cashier_collect_by: `${staff}`,
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select("fee_heads application fee_payment_mode fee_transaction_date")
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
      }
    } else {
      if (payment_type) {
        if (payment_type == "Total") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_ADMISSION",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )
            .populate({
              path: "application",
              select: "applicationDepartment",
              populate: {
                path: "applicationDepartment",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
          var all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
              `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else if (payment_type == "Cash / Bank") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_ADMISSION",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )
            .populate({
              path: "application",
              select: "applicationDepartment",
              populate: {
                path: "applicationDepartment",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
          var all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
              `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else {
          var all_receipts = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_ADMISSION",
              },
              {
                refund_status: "No Refund",
              },
              {
                fee_payment_mode: payment_type,
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )
            .populate({
              path: "application",
              select: "applicationDepartment",
              populate: {
                path: "applicationDepartment",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
        }
      } else {
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_ADMISSION",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select("fee_heads application fee_payment_mode")
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
      }
    }
    // console.log(all_receipts)
    if (bank_acc?.bank_account_type === "Society") {
    } else {
      all_receipts = all_receipts?.filter((val) => {
        if (
          `${val?.application?.applicationDepartment?.bank_account?._id}` ===
          `${bank}`
        )
          return val;
      });
    }
    let heads_queue = [];
    if (bank_acc?.bank_account_type === "Society") {
      for (let ele of all_struct) {
        for (let val of ele?.applicable_fees_heads) {
          if (val?.is_society == true) {
            if (heads_queue?.includes(`${val?.master}`)) {
            } else {
              heads_queue.push(val?.master);
            }
          }
        }
      }
    } else {
      for (let ele of all_struct) {
        for (let val of ele?.applicable_fees_heads) {
          if (val?.is_society == false) {
            if (heads_queue?.includes(`${val?.master}`)) {
            } else {
              heads_queue.push(val?.master);
            }
          }
        }
      }
    }
    const all_master = await FeeMaster.find({
      _id: { $in: heads_queue },
    }).select("master_name");
    var obj = {};
    var nest_obj = [];
    for (let ele of all_master) {
      obj["head_name"] = ele?.master_name;
      obj["head_amount"] = 0;
      obj["cash_head_amount"] = 0;
      obj["pg_head_amount"] = 0;
      obj["bank_head_amount"] = 0;
      obj["_id"] = ele?._id;
      nest_obj.push(obj);
      obj = {};
    }
    // var t = 0
    var t = [];
    var l = [];
    const daylist = getDaysArray(new Date(`${from}`), new Date(`${to}`));
    daylist.map((v) => v.toISOString().slice(0, 10)).join("");
    let date_wise = [];
    for (let cls of daylist) {
      cls = `${cls}`;
      let obj = {
        date: `${moment(`${cls}`)?.format("YYYY-MM-DD")}`,
        cash_head_amount: 0,
        bank_head_amount: 0,
        pg_head_amount: 0,
        head_amount: 0,
        indian_format: `${moment(`${cls}`)?.format("DD/MM/YYYY")}`,
      };
      date_wise.push({
        ...obj,
      });
    }
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
        for (let cls of date_wise) {
          if (
            `${cls?.date}` ===
            `${moment(`${ele?.fee_transaction_date}`).format("YYYY-MM-DD")}`
          ) {
            if (payment_type == "Total") {
              for (let val of ele?.fee_heads) {
                for (let ads of nest_obj) {
                  if (ele?.fee_payment_mode == "By Cash") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.cash_head_amount += val?.original_paid;
                        cls.cash_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.cash_head_amount += val?.original_paid;
                        cls.cash_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.pg_head_amount += val?.original_paid;
                        cls.pg_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.pg_head_amount += val?.original_paid;
                        cls.pg_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.pg_head_amount += val?.original_paid;
                        cls.pg_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.pg_head_amount += val?.original_paid;
                        cls.pg_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Net Banking") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "UPI Transfer") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Cheque") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Demand Draft") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;

                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;
                    }
                  }
                }
              }
            } else if (payment_type == "Cash / Bank") {
              for (let val of ele?.fee_heads) {
                for (let ads of nest_obj) {
                  if (ele?.fee_payment_mode == "By Cash") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.cash_head_amount += val?.original_paid;
                        cls.cash_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.cash_head_amount += val?.original_paid;
                        cls.cash_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Net Banking") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "UPI Transfer") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Cheque") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Demand Draft") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;

                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;
                    }
                  }
                }
              }
            } else {
              for (let val of ele?.fee_heads) {
                for (let ads of nest_obj) {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;

                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;

                      // if (val?.master == "6654be24e36490a31bccd1db") {
                      //   t.push(`${val?.original_paid}`);
                      // }
                      // if (val?.master == "6654be3de36490a31bccd257") {
                      //   l.push(`${val?.original_paid}`);
                      // }
                      // t+= val?.original_paid
                    }
                  }
                }
              }
            }
          }
        }
      }
      // nest_obj.push({
      //   head_name: "Total Fees",
      //   head_amount: t
      // })
      all_receipts.sort(function (st1, st2) {
        return (
          parseInt(st1?.invoice_count?.substring(14)) -
          parseInt(st2?.invoice_count?.substring(14))
        );
      });

      return {
        message: "Explore Day Book Heads Query",
        access: true,
        all_receipts: all_receipts?.length,
        results: nest_obj,
        range: `${all_receipts[0]?.invoice_count?.substring(
          14
        )} To ${all_receipts[
          all_receipts?.length - 1
        ]?.invoice_count?.substring(14)}`,
        account_info: bank_acc,
        day_range_from: from,
        day_range_to: to,
        ins_info: institute,
        one_staff: staff ? one_staff : {},
        date_wise: date_wise ?? [],
      };
    } else {
      return {
        message: "No Other Fees Day Book Heads Query",
        access: true,
        all_receipts: 0,
        results: [],
        account_info: bank_acc,
        day_range_from: from,
        day_range_to: to,
        ins_info: institute,
        range: "",
        one_staff: {},
        date_wise: date_wise ?? [],
      };
    }
  } catch (e) {
    console.log(e);
  }
};

const hostel_daybook = async (
  from,
  to,
  bank,
  payment_type,
  hid,
  fid,
  staff
) => {
  try {
    var g_year;
    var l_year;
    var g_month;
    var l_month;
    var sorted_array = [];
    if (hid) {
      const bank_acc = await BankAccount.findById({ _id: bank }).select(
        "-day_book"
      );
      const finance = await Finance.findById({ _id: fid }).select("institute");
      const hostel = await Hostel.findById({ _id: hid }).select("institute");
      var all_struct = await FeeStructure.find({
        $and: [{ hostel: hostel?._id }, { document_update: false }],
      });
      const institute = await InstituteAdmin.findById({
        _id: `${finance?.institute}`,
      }).select(
        "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
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
      const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
      date.setDate(date.getDate() + 1);
      let l_dates = date.getDate();
      if (l_dates < 10) {
        l_dates = `0${l_dates}`;
      }
      var l_months = l_month;
      let list1 = ["01", "03", "05", "07", "08", "10", "12"];
      let list2 = ["04", "06", "09", "11"];
      let list3 = ["02"];
      let g_days = l_months?.toString();
      let l_days = l_months?.toString();
      if (g_day == 30 && list2?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      if (g_day >= 31 && list1?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      if (g_day == 30 && l_day == 30) {
      } else if (g_day == 31 && l_day == 31) {
      } else {
        if (l_day == 30 && list2?.includes(String(l_days))) {
          date.setMonth(date.getMonth() + 1);
          var l_months = date.getMonth();
          if (l_months < 10) {
            l_months = `0${l_months}`;
          }
        }
        if (l_day >= 31 && list1?.includes(String(l_days))) {
          date.setMonth(date.getMonth() + 1);
          var l_months = date.getMonth();
          if (l_months < 10) {
            l_months = `0${l_months}`;
          }
        }
      }
      const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
      if (staff) {
        var one_staff = await Staff.findById({ _id: `${staff}` }).select(
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO staff_emp_code"
        );
        if (payment_type) {
          if (payment_type == "Total") {
            var all_receipts_set = await FeeReceipt.find({
              $and: [
                { finance: fid },
                // { fee_flow: "FEE_HEADS" },
                {
                  fee_transaction_date: {
                    $gte: g_date,
                    $lt: l_date,
                  },
                },
                {
                  receipt_generated_from: "BY_HOSTEL_MANAGER",
                },
                {
                  refund_status: "No Refund",
                },
                {
                  visible_status: "Not Hide",
                },
                {
                  cashier_collect_by: `${staff}`,
                },
                // { student: { $in: sorted_array } },
              ],
            })
              .sort({ invoice_count: "1" })
              .select(
                "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
              )
              .populate({
                path: "application",
                select: "hostelAdmin",
                populate: {
                  path: "hostelAdmin",
                  select: "bank_account",
                  populate: {
                    path: "bank_account",
                    select:
                      "finance_bank_account_number finance_bank_name finance_bank_account_name",
                  },
                },
              })
              .lean()
              .exec();
            var all_receipts = all_receipts_set?.filter((val) => {
              if (
                `${val?.fee_payment_mode}` === "By Cash" ||
                `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
                `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
                `${val?.fee_payment_mode}` === "Cheque" ||
                `${val?.fee_payment_mode}` === "Net Banking" ||
                `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
                `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
                `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
                `${val?.fee_payment_mode}` === "UPI Transfer" ||
                `${val?.fee_payment_mode}` === "Demand Draft"
              ) {
                return val;
              }
            });
          } else if (payment_type == "Cash / Bank") {
            var all_receipts_set = await FeeReceipt.find({
              $and: [
                { finance: fid },
                // { fee_flow: "FEE_HEADS" },
                {
                  fee_transaction_date: {
                    $gte: g_date,
                    $lt: l_date,
                  },
                },
                {
                  receipt_generated_from: "BY_HOSTEL_MANAGER",
                },
                {
                  refund_status: "No Refund",
                },
                {
                  visible_status: "Not Hide",
                },
                {
                  cashier_collect_by: `${staff}`,
                },
                // { student: { $in: sorted_array } },
              ],
            })
              .sort({ invoice_count: "1" })
              .select(
                "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
              )
              .populate({
                path: "application",
                select: "hostelAdmin",
                populate: {
                  path: "hostelAdmin",
                  select: "bank_account",
                  populate: {
                    path: "bank_account",
                    select:
                      "finance_bank_account_number finance_bank_name finance_bank_account_name",
                  },
                },
              })
              .lean()
              .exec();
            var all_receipts = all_receipts_set?.filter((val) => {
              if (
                `${val?.fee_payment_mode}` === "By Cash" ||
                `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
                `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
                `${val?.fee_payment_mode}` === "Cheque" ||
                `${val?.fee_payment_mode}` === "Net Banking" ||
                `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
                `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
                `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
                `${val?.fee_payment_mode}` === "UPI Transfer" ||
                `${val?.fee_payment_mode}` === "Demand Draft"
              ) {
                return val;
              }
            });
          } else {
            var all_receipts = await FeeReceipt.find({
              $and: [
                { finance: fid },
                // { fee_flow: "FEE_HEADS" },
                {
                  fee_transaction_date: {
                    $gte: g_date,
                    $lt: l_date,
                  },
                },
                {
                  receipt_generated_from: "BY_HOSTEL_MANAGER",
                },
                {
                  refund_status: "No Refund",
                },
                {
                  fee_payment_mode: payment_type,
                },
                {
                  visible_status: "Not Hide",
                },
                {
                  cashier_collect_by: `${staff}`,
                },
                // { student: { $in: sorted_array } },
              ],
            })
              .sort({ invoice_count: "1" })
              .select(
                "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
              )
              .populate({
                path: "application",
                select: "hostelAdmin",
                populate: {
                  path: "hostelAdmin",
                  select: "bank_account",
                  populate: {
                    path: "bank_account",
                    select:
                      "finance_bank_account_number finance_bank_name finance_bank_account_name",
                  },
                },
              })
              .lean()
              .exec();
          }
        } else {
          console.log("ENTER", g_date, l_date);
          var all_receipts = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_HOSTEL_MANAGER",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              {
                cashier_collect_by: `${staff}`,
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode fee_transaction_date"
            )
            .populate({
              path: "application",
              select: "hostelAdmin",
              populate: {
                path: "hostelAdmin",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
        }
      } else {
        if (payment_type) {
          if (payment_type == "Total") {
            var all_receipts_set = await FeeReceipt.find({
              $and: [
                { finance: fid },
                // { fee_flow: "FEE_HEADS" },
                {
                  fee_transaction_date: {
                    $gte: g_date,
                    $lt: l_date,
                  },
                },
                {
                  receipt_generated_from: "BY_HOSTEL_MANAGER",
                },
                {
                  refund_status: "No Refund",
                },
                {
                  visible_status: "Not Hide",
                },
                // { student: { $in: sorted_array } },
              ],
            })
              .sort({ invoice_count: "1" })
              .select(
                "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
              )
              .populate({
                path: "application",
                select: "hostelAdmin",
                populate: {
                  path: "hostelAdmin",
                  select: "bank_account",
                  populate: {
                    path: "bank_account",
                    select:
                      "finance_bank_account_number finance_bank_name finance_bank_account_name",
                  },
                },
              })
              .lean()
              .exec();
            var all_receipts = all_receipts_set?.filter((val) => {
              if (
                `${val?.fee_payment_mode}` === "By Cash" ||
                `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
                `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
                `${val?.fee_payment_mode}` === "Cheque" ||
                `${val?.fee_payment_mode}` === "Net Banking" ||
                `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
                `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
                `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
                `${val?.fee_payment_mode}` === "UPI Transfer" ||
                `${val?.fee_payment_mode}` === "Demand Draft"
              ) {
                return val;
              }
            });
          } else if (payment_type == "Cash / Bank") {
            var all_receipts_set = await FeeReceipt.find({
              $and: [
                { finance: fid },
                // { fee_flow: "FEE_HEADS" },
                {
                  fee_transaction_date: {
                    $gte: g_date,
                    $lt: l_date,
                  },
                },
                {
                  receipt_generated_from: "BY_HOSTEL_MANAGER",
                },
                {
                  refund_status: "No Refund",
                },
                {
                  visible_status: "Not Hide",
                },
                // { student: { $in: sorted_array } },
              ],
            })
              .sort({ invoice_count: "1" })
              .select(
                "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
              )
              .populate({
                path: "application",
                select: "hostelAdmin",
                populate: {
                  path: "hostelAdmin",
                  select: "bank_account",
                  populate: {
                    path: "bank_account",
                    select:
                      "finance_bank_account_number finance_bank_name finance_bank_account_name",
                  },
                },
              })
              .lean()
              .exec();
            var all_receipts = all_receipts_set?.filter((val) => {
              if (
                `${val?.fee_payment_mode}` === "By Cash" ||
                `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
                `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
                `${val?.fee_payment_mode}` === "Cheque" ||
                `${val?.fee_payment_mode}` === "Net Banking" ||
                `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
                `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
                `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
                `${val?.fee_payment_mode}` === "UPI Transfer" ||
                `${val?.fee_payment_mode}` === "Demand Draft"
              ) {
                return val;
              }
            });
          } else {
            var all_receipts = await FeeReceipt.find({
              $and: [
                { finance: fid },
                // { fee_flow: "FEE_HEADS" },
                {
                  fee_transaction_date: {
                    $gte: g_date,
                    $lt: l_date,
                  },
                },
                {
                  receipt_generated_from: "BY_HOSTEL_MANAGER",
                },
                {
                  refund_status: "No Refund",
                },
                {
                  fee_payment_mode: payment_type,
                },
                {
                  visible_status: "Not Hide",
                },
                // { student: { $in: sorted_array } },
              ],
            })
              .sort({ invoice_count: "1" })
              .select(
                "fee_heads application fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
              )
              .populate({
                path: "application",
                select: "hostelAdmin",
                populate: {
                  path: "hostelAdmin",
                  select: "bank_account",
                  populate: {
                    path: "bank_account",
                    select:
                      "finance_bank_account_number finance_bank_name finance_bank_account_name",
                  },
                },
              })
              .lean()
              .exec();
          }
        } else {
          console.log("ENTER", g_date, l_date);
          var all_receipts = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_HOSTEL_MANAGER",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode fee_transaction_date"
            )
            .populate({
              path: "application",
              select: "hostelAdmin",
              populate: {
                path: "hostelAdmin",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
        }
      }
      // console.log(all_receipts)
      all_receipts = all_receipts?.filter((val) => {
        if (`${val?.application?.hostelAdmin?.bank_account?._id}` === `${bank}`)
          return val;
      });
      let heads_queue = [];
      for (let ele of all_struct) {
        for (let val of ele?.applicable_fees_heads) {
          if (val?.is_society == false) {
            if (heads_queue?.includes(`${val?.master}`)) {
            } else {
              heads_queue.push(val?.master);
            }
          }
        }
      }
      const all_master = await FeeMaster.find({
        _id: { $in: heads_queue },
      }).select("master_name");
      var obj = {};
      var nest_obj = [];
      for (let ele of all_master) {
        obj["head_name"] = ele?.master_name;
        obj["head_amount"] = 0;
        obj["cash_head_amount"] = 0;
        obj["pg_head_amount"] = 0;
        obj["bank_head_amount"] = 0;
        obj["_id"] = ele?._id;
        nest_obj.push(obj);
        obj = {};
      }
      // var t = 0
      var t = [];
      var l = [];
      const daylist = getDaysArray(new Date(`${from}`), new Date(`${to}`));
      daylist.map((v) => v.toISOString().slice(0, 10)).join("");
      let date_wise = [];
      for (let cls of daylist) {
        cls = `${cls}`;
        let obj = {
          date: `${moment(`${cls}`)?.format("YYYY-MM-DD")}`,
          cash_head_amount: 0,
          bank_head_amount: 0,
          pg_head_amount: 0,
          head_amount: 0,
          indian_format: `${moment(`${cls}`)?.format("DD/MM/YYYY")}`,
        };
        date_wise.push({
          ...obj,
        });
      }
      if (all_receipts?.length > 0) {
        for (let ele of all_receipts) {
          for (let cls of date_wise) {
            if (
              `${cls?.date}` ===
              `${moment(`${ele?.fee_transaction_date}`).format("YYYY-MM-DD")}`
            ) {
              if (payment_type == "Total") {
                for (let val of ele?.fee_heads) {
                  for (let ads of nest_obj) {
                    if (ele?.fee_payment_mode == "By Cash") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.cash_head_amount += val?.original_paid;
                        cls.cash_head_amount += val?.original_paid;
                      }
                    }
                    if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.pg_head_amount += val?.original_paid;
                        cls.pg_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                    if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.pg_head_amount += val?.original_paid;
                        cls.pg_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                    if (ele?.fee_payment_mode == "Net Banking") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                    if (ele?.fee_payment_mode == "UPI Transfer") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                    if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                    if (ele?.fee_payment_mode == "Cheque") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                    if (ele?.fee_payment_mode == "Demand Draft") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;
                    }
                  }
                }
              } else if (payment_type == "Cash / Bank") {
                for (let val of ele?.fee_heads) {
                  for (let ads of nest_obj) {
                    if (ele?.fee_payment_mode == "By Cash") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.cash_head_amount += val?.original_paid;
                        cls.cash_head_amount += val?.original_paid;
                      }
                    }
                    if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                    if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                    if (ele?.fee_payment_mode == "Net Banking") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                    if (ele?.fee_payment_mode == "UPI Transfer") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                    if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                    if (ele?.fee_payment_mode == "Cheque") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                    if (ele?.fee_payment_mode == "Demand Draft") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;
                    }
                  }
                }
              } else {
                for (let val of ele?.fee_heads) {
                  for (let ads of nest_obj) {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;
                    }
                  }
                }
              }
            }
          }
        }
        all_receipts.sort(function (st1, st2) {
          return (
            parseInt(st1?.invoice_count?.substring(14)) -
            parseInt(st2?.invoice_count?.substring(14))
          );
        });
        return {
          message: "Explore Day Book Heads Query",
          access: true,
          all_receipts: all_receipts?.length,
          results: nest_obj,
          range: `${all_receipts[0]?.invoice_count?.substring(
            14
          )} To ${all_receipts[
            all_receipts?.length - 1
          ]?.invoice_count?.substring(14)}`,
          account_info: bank_acc,
          day_range_from: from,
          day_range_to: to,
          ins_info: institute,
          one_staff: staff ? one_staff : {},
          date_wise: date_wise ?? [],
        };
      } else {
        return {
          message: "No Other Fees Day Book Heads Query",
          access: true,
          all_receipts: 0,
          results: [],
          account_info: {},
          day_range_from: null,
          day_range_to: null,
          ins_info: {},
          range: "",
          one_staff: {},
          date_wise: date_wise ?? [],
        };
      }
    } else {
      return {
        message: "No Other Fees Day Book Heads Query",
        access: true,
        all_receipts: 0,
        results: [],
        account_info: {},
        day_range_from: from,
        day_range_to: to,
        ins_info: "",
        range: "",
        one_staff: {},
        date_wise: [],
      };
    }
  } catch (e) {
    console.log(e);
  }
};

const miscellanous_daybook = async (
  from,
  to,
  bank,
  payment_type,
  fid,
  staff
) => {
  try {
    var g_year;
    var l_year;
    var g_month;
    var l_month;
    let pg = ["Payment Gateway - PG", "By Cash", "Payment Gateway / Online"];
    var sorted_array = [];
    const bank_acc = await BankAccount.findById({ _id: bank }).select(
      "-day_book"
    );
    const finance = await Finance.findById({ _id: fid }).select("institute");
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select(
      "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
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
    const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
    date.setDate(date.getDate() + 1);
    let l_dates = date.getDate();
    if (l_dates < 10) {
      l_dates = `0${l_dates}`;
    }

    var l_months = l_month;
    let list1 = ["01", "03", "05", "07", "08", "10", "12"];
    let list2 = ["04", "06", "09", "11"];
    let list3 = ["02"];
    let g_days = l_months?.toString();
    let l_days = l_months?.toString();
    if (g_day == 30 && list2?.includes(String(g_days))) {
      date.setMonth(date.getMonth() + 1);
      var l_months = date.getMonth();
      if (l_months < 10) {
        l_months = `0${l_months}`;
      }
    }
    if (g_day >= 31 && list1?.includes(String(g_days))) {
      date.setMonth(date.getMonth() + 1);
      var l_months = date.getMonth();
      if (l_months < 10) {
        l_months = `0${l_months}`;
      }
    }
    if (g_day == 30 && l_day == 30) {
    } else if (g_day == 31 && l_day == 31) {
    } else {
      if (l_day == 30 && list2?.includes(String(l_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      if (l_day >= 31 && list1?.includes(String(l_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
    }
    const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);

    if (staff) {
      var one_staff = await Staff.findById({ _id: `${staff}` }).select(
        "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO staff_emp_code"
      );
      if (payment_type) {
        if (payment_type === "Total") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
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
                visible_status: "Not Hide",
              },
              {
                cashier_collect_by: `${staff}`,
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )

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

          // console.log(all_receipts_set?.[0]);

          all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
              `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
          // console.log(all_receipts?.length);
        } else if (payment_type === "Cash / Bank") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
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
                visible_status: "Not Hide",
              },
              {
                cashier_collect_by: `${staff}`,
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )

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

          all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
              `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else {
          var all_receipts = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
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
              {
                visible_status: "Not Hide",
              },
              {
                cashier_collect_by: `${staff}`,
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )

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
      } else {
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
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
              visible_status: "Not Hide",
            },
            {
              cashier_collect_by: `${staff}`,
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
          )

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
    } else {
      if (payment_type) {
        if (payment_type === "Total") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
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
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )

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

          // console.log(all_receipts_set?.[0]);

          all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
              `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
          // console.log(all_receipts?.length);
        } else if (payment_type === "Cash / Bank") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
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
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )

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

          all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
              `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else {
          var all_receipts = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
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
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
            )

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
      } else {
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
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
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount fee_transaction_date"
          )

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
    }
    // console.log(all_receipts?.length);

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
      obj["cash_head_amount"] = 0;
      obj["pg_head_amount"] = 0;
      obj["bank_head_amount"] = 0;
      obj["_id"] = ele?._id;
      nest_obj.push(obj);
      obj = {};
    }
    const daylist = getDaysArray(new Date(`${from}`), new Date(`${to}`));
    daylist.map((v) => v.toISOString().slice(0, 10)).join("");
    let date_wise = [];
    for (let cls of daylist) {
      cls = `${cls}`;
      let obj = {
        date: `${moment(`${cls}`)?.format("YYYY-MM-DD")}`,
        cash_head_amount: 0,
        bank_head_amount: 0,
        pg_head_amount: 0,
        head_amount: 0,
        indian_format: `${moment(`${cls}`)?.format("DD/MM/YYYY")}`,
      };
      date_wise.push({
        ...obj,
      });
    }
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
        for (let cls of date_wise) {
          if (
            `${cls?.date}` ===
            `${moment(`${ele?.fee_transaction_date}`).format("YYYY-MM-DD")}`
          ) {
            if (payment_type == "Total") {
              for (let val of ele?.fee_heads) {
                for (let ads of nest_obj) {
                  if (ele?.fee_payment_mode == "By Cash") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.cash_head_amount += val?.original_paid;
                        cls.cash_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.cash_head_amount += val?.original_paid;
                        cls.cash_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.pg_head_amount += val?.original_paid;
                        cls.pg_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.pg_head_amount += val?.original_paid;
                        cls.pg_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.pg_head_amount += val?.original_paid;
                        cls.pg_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.pg_head_amount += val?.original_paid;
                        cls.pg_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Net Banking") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "UPI Transfer") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Cheque") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Demand Draft") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;

                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;
                    }
                  }
                }
              }
            } else if (payment_type == "Cash / Bank") {
              for (let val of ele?.fee_heads) {
                for (let ads of nest_obj) {
                  if (ele?.fee_payment_mode == "By Cash") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.cash_head_amount += val?.original_paid;
                        cls.cash_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.cash_head_amount += val?.original_paid;
                        cls.cash_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // if (val?.master == "6654be24e36490a31bccd1db") {
                        //   t.push(`${val?.original_paid}`);
                        // }
                        // if (val?.master == "6654be3de36490a31bccd257") {
                        //   l.push(`${val?.original_paid}`);
                        // }
                        // t+= val?.original_paid
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Net Banking") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "UPI Transfer") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Cheque") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (ele?.fee_payment_mode == "Demand Draft") {
                    if (bank_acc?.bank_account_type === "Society") {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == true
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;

                        // t+= val?.original_paid
                      }
                    } else {
                      if (
                        `${ads?._id}` === `${val?.master}` &&
                        val?.is_society == false
                      ) {
                        ads.bank_head_amount += val?.original_paid;
                        cls.bank_head_amount += val?.original_paid;
                      }
                    }
                  }
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;

                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;
                    }
                  }
                }
              }
            } else {
              for (let val of ele?.fee_heads) {
                for (let ads of nest_obj) {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;

                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.head_amount += val?.original_paid;
                      cls.head_amount += val?.original_paid;

                      // if (val?.master == "6654be24e36490a31bccd1db") {
                      //   t.push(`${val?.original_paid}`);
                      // }
                      // if (val?.master == "6654be3de36490a31bccd257") {
                      //   l.push(`${val?.original_paid}`);
                      // }
                      // t+= val?.original_paid
                    }
                  }
                }
              }
            }
          }
        }
      }
      // nest_obj.push({
      //   head_name: "Total Fees",
      //   head_amount: t
      // })
      // let n = []
      // for (let ele of all_receipts) {
      //   n.push(ele?.fee_payment_amount)
      // }
      // res.status(200).send({
      //   message: "Explore Other Fees Day Book Heads Query",
      //   access: true,
      //   all_receipts: all_receipts?.length,
      //   results: nest_obj,
      // account_info: bank_acc,
      // day_range_from: from,
      // day_range_to: to,
      // ins_info: institute,
      // });
      return {
        message: "Explore Other Fees Day Book Heads Query",
        access: true,
        all_receipts: all_receipts?.length,
        results: nest_obj,
        account_info: bank_acc,
        day_range_from: from,
        day_range_to: to,
        ins_info: institute,
        range: `${all_receipts[0]?.invoice_count?.substring(
          14
        )} To ${all_receipts[
          all_receipts?.length - 1
        ]?.invoice_count?.substring(14)}`,
        one_staff: staff ? one_staff : {},
        date_wise: date_wise ?? [],
      };
    } else {
      return {
        message: "No Other Fees Day Book Heads Query",
        access: true,
        all_receipts: 0,
        results: [],
        account_info: {},
        day_range_from: null,
        day_range_to: null,
        ins_info: {},
        range: "",
        one_staff: {},
        date_wise: date_wise ?? [],
      };
    }
  } catch (e) {
    console.log(e);
  }
};

const render_combined_daybook_heads_wise = async (
  fid = "",
  from = "",
  to = "",
  bank = "",
  payment_type = "",
  staff = ""
) => {
  try {
    const banks = await BankAccount.find({ finance: fid });
    let hbank;
    let hostel;
    for (let ele of banks) {
      if (`${ele?.hostel}`) {
        hbank = ele?._id;
        hostel = ele?.hostel;
      }
    }
    let data_1 = await normal_daybook(from, to, bank, payment_type, fid, staff);
    let data_2 = await hostel_daybook(
      from,
      to,
      bank,
      payment_type,
      hostel,
      fid,
      staff
    );
    let data_3 = await miscellanous_daybook(
      from,
      to,
      bank,
      payment_type,
      fid,
      staff
    );
    let combine = [data_1, data_2, data_3];
    let combines = [];
    for (let cls of combine) {
      combines.push({
        date_wise: cls?.date_wise,
      });
    }
    const valid_bank = await BankAccount.findById({ _id: bank }).select(
      "-day_book"
    );
    if (staff) {
      var staff_obj = await Staff.findById({ _id: `${staff}` }).select(
        "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO staff_emp_code"
      );
    }
    // const key = "Name";

    //   const arrayUniqueByKey = [
    //     ...new Map(head_list.map((item) => [item[key], item])).values(),
    //   ];
    return {
      message: "Combined Daybook",
      access: true,
      combines,
      day_range_from: from,
      day_range_to: to,
      ins_info: data_1?.ins_info,
      account_info: valid_bank ?? "",
      one_staff: staff ? staff_obj : "",
    };
  } catch (e) {
    console.log(e);
  }
};

let dataObj = {
  message: "Combined Daybook",
  access: true,
  combines: [
    {
      date_wise: [
        {
          date: "2024-09-10",
          cash_head_amount: 0,
          bank_head_amount: 0,
          pg_head_amount: 0,
          head_amount: 1350,
          indian_format: "10/09/2024",
        },
        {
          date: "2024-09-11",
          cash_head_amount: 0,
          bank_head_amount: 0,
          pg_head_amount: 0,
          head_amount: 4915,
          indian_format: "11/09/2024",
        },
        {
          date: "2024-09-12",
          cash_head_amount: 0,
          bank_head_amount: 0,
          pg_head_amount: 0,
          head_amount: 5920,
          indian_format: "12/09/2024",
        },
      ],
    },
    {
      date_wise: [],
    },
    {
      date_wise: [
        {
          date: "2024-09-10",
          cash_head_amount: 0,
          bank_head_amount: 0,
          pg_head_amount: 0,
          head_amount: 84300,
          indian_format: "10/09/2024",
        },
        {
          date: "2024-09-11",
          cash_head_amount: 0,
          bank_head_amount: 0,
          pg_head_amount: 0,
          head_amount: 55310,
          indian_format: "11/09/2024",
        },
        {
          date: "2024-09-12",
          cash_head_amount: 0,
          bank_head_amount: 0,
          pg_head_amount: 0,
          head_amount: 42900,
          indian_format: "12/09/2024",
        },
      ],
    },
  ],
  day_range_from: "2024-09-10",
  day_range_to: "2024-09-12",
  ins_info: {
    _id: "660bd1c7d5016c9947aef713",
    insName: "H.P.T. Arts and R.Y.K. Science College, Nashik-05",
    name: "HPT_RYK",
    insPincode: null,
    insAddress: "Prin. T.A. Kulkarni, Vidya Nagar, Nashik-422005",
    photoId: "0",
    insProfilePhoto: "2fa048badf75cd5a00b775c2307bcac1",
    insAffiliated: "Gokhale Education Society's",
    insState: "Maharashtra",
  },
  account_info: {
    _id: "665caffa0e2f935f4eb4768d",
    finance_bank_account_number: "20135700567",
    finance_bank_name:
      "Maharashtra Bank (Principal H.P.T. Arts R.Y.K. Sci College Nashik - 5",
    finance_bank_account_name: "GRANT UNIT (UG & PG GRANT)",
    finance_bank_ifsc_code: "MAHB0000214",
    finance_bank_branch_address: "NBT Law College Campus",
    finance_bank_upi_id: "",
    finance_bank_upi_qrcode: "",
    departments: [
      "664092de0728cf14e8be2394",
      "664092f00728cf14e8be2f5f",
      "6670226b496dc1715381d871",
      "66681d4d5f25de64033fa1eb",
      "668d6982e473898a9093df4a",
    ],
    due_repay: 91245,
    total_repay: 91245,
    collect_online: 1086005,
    collect_offline: 0,
    created_at: "2024-06-02T17:46:34.850Z",
    finance: "662e8ff2a73be706305ec252",
    __v: 723,
    invoice_count: 3687,
    heads_list: [],
    bank_account_code: 1,
  },
  one_staff: "",
  level: "info",
};
const settlementReportData = async (
  fid = "",
  from = "",
  to = "",
  bank = "",
  payment_type = "",
  staff = ""
) => {
  // const ft = dataObj;
  const ft = await render_combined_daybook_heads_wise(
    fid,
    from,
    to,
    bank,
    payment_type,
    staff
  );
  return { ft };
};
module.exports = settlementReportData;
