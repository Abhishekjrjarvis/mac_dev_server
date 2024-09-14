const Finance = require("../models/Finance");
const BankAccount = require("../models/Finance/BankAccount");
const FeeMaster = require("../models/Finance/FeeMaster");
const FeeStructure = require("../models/Finance/FeesStructure");
const Hostel = require("../models/Hostel/hostel");
const InstituteAdmin = require("../models/InstituteAdmin");
const FeeReceipt = require("../models/RazorPay/feeReceipt");

// const dataObj = {
//   message: "Combined Daybook",
//   access: true,
//   combines: [
//     {
//       results: [
//         {
//           head_name: "Tuition Fee",
//           head_amount: 6707500,
//           cash_head_amount: 0,
//           pg_head_amount: 5770000,
//           bank_head_amount: 937500,
//           _id: "644a0b06d1679fcd6e76e7f2",
//         },
//         {
//           head_name: "Deposit Fees",
//           head_amount: 138000,
//           cash_head_amount: 0,
//           pg_head_amount: 107500,
//           bank_head_amount: 30500,
//           _id: "644a0b07d1679fcd6e76e7f5",
//         },
//         {
//           head_name: "Development Fee",
//           head_amount: 25581378,
//           cash_head_amount: 0,
//           pg_head_amount: 22483078,
//           bank_head_amount: 3098300,
//           _id: "644a0b07d1679fcd6e76e7f9",
//         },
//         {
//           head_name: "Laboratory Fee",
//           head_amount: 3011415,
//           cash_head_amount: 0,
//           pg_head_amount: 2598745,
//           bank_head_amount: 412670,
//           _id: "644a0b07d1679fcd6e76e7fd",
//         },
//         {
//           head_name: "Library Fee",
//           head_amount: 1874830,
//           cash_head_amount: 0,
//           pg_head_amount: 1613060,
//           bank_head_amount: 261770,
//           _id: "644a0b08d1679fcd6e76e801",
//         },
//         {
//           head_name: "Internet & Email Facility Fee",
//           head_amount: 1936930,
//           cash_head_amount: 0,
//           pg_head_amount: 1645560,
//           bank_head_amount: 291370,
//           _id: "644a0b08d1679fcd6e76e805",
//         },
//         {
//           head_name: "Gymkhana Fee",
//           head_amount: 402000,
//           cash_head_amount: 0,
//           pg_head_amount: 332000,
//           bank_head_amount: 70000,
//           _id: "644a0b08d1679fcd6e76e809",
//         },
//         {
//           head_name: "Training & Placement Fee",
//           head_amount: 526025,
//           cash_head_amount: 0,
//           pg_head_amount: 424497,
//           bank_head_amount: 101528,
//           _id: "644a0b09d1679fcd6e76e80d",
//         },
//         {
//           head_name: "Annual Social & Cultural Act Fees",
//           head_amount: 402375,
//           cash_head_amount: 0,
//           pg_head_amount: 333750,
//           bank_head_amount: 68625,
//           _id: "644a0b09d1679fcd6e76e811",
//         },
//         {
//           head_name: "I-Card",
//           head_amount: 55300,
//           cash_head_amount: 0,
//           pg_head_amount: 47800,
//           bank_head_amount: 7500,
//           _id: "644a0b0ad1679fcd6e76e815",
//         },
//         {
//           head_name: "Student Aid",
//           head_amount: 285900,
//           cash_head_amount: 0,
//           pg_head_amount: 221800,
//           bank_head_amount: 64100,
//           _id: "644a0b0ad1679fcd6e76e819",
//         },
//         {
//           head_name: "Administrative Fee",
//           head_amount: 76200,
//           cash_head_amount: 0,
//           pg_head_amount: 57300,
//           bank_head_amount: 18900,
//           _id: "644a0b0ad1679fcd6e76e81d",
//         },
//         {
//           head_name: "Magazine Fee",
//           head_amount: 50800,
//           cash_head_amount: 0,
//           pg_head_amount: 38200,
//           bank_head_amount: 12600,
//           _id: "644a0b0bd1679fcd6e76e821",
//         },
//         {
//           head_name: "Contigency Fee",
//           head_amount: 5605562,
//           cash_head_amount: 0,
//           pg_head_amount: 4971172,
//           bank_head_amount: 634390,
//           _id: "644a0b0bd1679fcd6e76e825",
//         },
//         {
//           head_name: "Exam Fee",
//           head_amount: 1501150,
//           cash_head_amount: 0,
//           pg_head_amount: 1338650,
//           bank_head_amount: 162500,
//           _id: "644a0b0cd1679fcd6e76e829",
//         },
//         {
//           head_name: "Exam Form Fee",
//           head_amount: 35800,
//           cash_head_amount: 0,
//           pg_head_amount: 31800,
//           bank_head_amount: 4000,
//           _id: "644a0b0cd1679fcd6e76e82d",
//         },
//         {
//           head_name: "Exam Gradesheet Fee",
//           head_amount: 143227,
//           cash_head_amount: 0,
//           pg_head_amount: 127227,
//           bank_head_amount: 16000,
//           _id: "644a0b0cd1679fcd6e76e831",
//         },
//         {
//           head_name: "Uni. Eligibity Fee",
//           head_amount: 12000,
//           cash_head_amount: 0,
//           pg_head_amount: 10800,
//           bank_head_amount: 1200,
//           _id: "644a0b0dd1679fcd6e76e835",
//         },
//         {
//           head_name: "Uni. Eligibity Form Fee",
//           head_amount: 40,
//           cash_head_amount: 0,
//           pg_head_amount: 40,
//           bank_head_amount: 0,
//           _id: "644a0b0dd1679fcd6e76e839",
//         },
//         {
//           head_name: "Uni. Enrollment Fee",
//           head_amount: 55200,
//           cash_head_amount: 0,
//           pg_head_amount: 43000,
//           bank_head_amount: 12200,
//           _id: "644a0b0ed1679fcd6e76e83d",
//         },
//         {
//           head_name: "Uni. Enrollment Form Fee",
//           head_amount: 5520,
//           cash_head_amount: 0,
//           pg_head_amount: 4300,
//           bank_head_amount: 1220,
//           _id: "644a0b0ed1679fcd6e76e841",
//         },
//         {
//           head_name: "Uni. E-Suvidha Fee",
//           head_amount: 35850,
//           cash_head_amount: 0,
//           pg_head_amount: 31850,
//           bank_head_amount: 4000,
//           _id: "644a0b0ed1679fcd6e76e845",
//         },
//         {
//           head_name: "Uni. Contribution for Sports & Culture",
//           head_amount: 43160,
//           cash_head_amount: 0,
//           pg_head_amount: 38360,
//           bank_head_amount: 4800,
//           _id: "644a0b0fd1679fcd6e76e849",
//         },
//         {
//           head_name: "Uni. E-charges Fees",
//           head_amount: 14400,
//           cash_head_amount: 0,
//           pg_head_amount: 12800,
//           bank_head_amount: 1600,
//           _id: "644a0b0fd1679fcd6e76e84d",
//         },
//         {
//           head_name: "Uni. Disaster Relief Fund Fees",
//           head_amount: 7200,
//           cash_head_amount: 0,
//           pg_head_amount: 6400,
//           bank_head_amount: 800,
//           _id: "644a0b0fd1679fcd6e76e851",
//         },
//         {
//           head_name: "Uni. NSS Registration fees",
//           head_amount: 7200,
//           cash_head_amount: 0,
//           pg_head_amount: 6400,
//           bank_head_amount: 800,
//           _id: "644a0b10d1679fcd6e76e855",
//         },
//         {
//           head_name: "Uni. NSS Ekak Yojna",
//           head_amount: 7200,
//           cash_head_amount: 0,
//           pg_head_amount: 6400,
//           bank_head_amount: 800,
//           _id: "644a0b10d1679fcd6e76e859",
//         },
//         {
//           head_name: "Uni. Convocation Fees",
//           head_amount: 33844,
//           cash_head_amount: 0,
//           pg_head_amount: 32594,
//           bank_head_amount: 1250,
//           _id: "644a0b11d1679fcd6e76e85d",
//         },
//         {
//           head_name: "Uni. State level contribution",
//           head_amount: 17256,
//           cash_head_amount: 0,
//           pg_head_amount: 15336,
//           bank_head_amount: 1920,
//           _id: "644a0b11d1679fcd6e76e861",
//         },
//         {
//           head_name: "Student Welfare fund Contribution",
//           head_amount: 4317,
//           cash_head_amount: 0,
//           pg_head_amount: 3837,
//           bank_head_amount: 480,
//           _id: "644a0b11d1679fcd6e76e865",
//         },
//         {
//           head_name: "Uni. Vice chancellers fund Contr",
//           head_amount: 14380,
//           cash_head_amount: 0,
//           pg_head_amount: 12780,
//           bank_head_amount: 1600,
//           _id: "644a0b12d1679fcd6e76e869",
//         },
//         {
//           head_name: "Uni. Exam Fees",
//           head_amount: 155824,
//           cash_head_amount: 0,
//           pg_head_amount: 122396,
//           bank_head_amount: 33428,
//           _id: "644a0b12d1679fcd6e76e86d",
//         },
//         {
//           head_name: "Alumni Fees",
//           head_amount: 357775,
//           cash_head_amount: 378,
//           pg_head_amount: 317775,
//           bank_head_amount: 39622,
//           _id: "644a0b13d1679fcd6e76e871",
//         },
//         {
//           head_name: "Insurance Charges",
//           head_amount: 89447,
//           cash_head_amount: 125,
//           pg_head_amount: 79447,
//           bank_head_amount: 9875,
//           _id: "644a0b13d1679fcd6e76e875",
//         },
//         {
//           head_name: "Entrance Form Fees",
//           head_amount: 71600,
//           cash_head_amount: 100,
//           pg_head_amount: 63600,
//           bank_head_amount: 7900,
//           _id: "644a0b13d1679fcd6e76e879",
//         },
//       ],
//       range: "2500 To 3708",
//     },
//     {
//       results: [
//         {
//           head_name: "Hostel Deposit Fees",
//           head_amount: 240000,
//           cash_head_amount: 0,
//           pg_head_amount: 220000,
//           bank_head_amount: 20000,
//           _id: "64c8a43700969d6a8ac78dea",
//         },
//         {
//           head_name: "Hostel Fees",
//           head_amount: 11268489,
//           cash_head_amount: 0,
//           pg_head_amount: 10903916,
//           bank_head_amount: 364573,
//           _id: "64e447a81c5035a6106fb418",
//         },
//         {
//           head_name: "Single Occupancy Charges",
//           head_amount: 60000,
//           cash_head_amount: 0,
//           pg_head_amount: 60000,
//           bank_head_amount: 0,
//           _id: "64e6e9648e3aa651eab89a7f",
//         },
//       ],
//       range: "2610 To ",
//     },
//     {
//       results: [],
//       range: "",
//     },
//   ],
//   day_range_from: "2024-08-01",
//   day_range_to: "2024-09-14",
//   ins_info: {
//     _id: "6449c83598fec071fbffd3ad",
//     insName: "Sardar Patel College Of Engineering",
//     name: "Bhavans_SPCE",
//     insState: "",
//     insDistrict: "",
//     insPincode: 400058,
//     insAddress: "Bhavans Campus, Munshi Nagar, Andheri West, Mumbai",
//     insAbout: "आ नो भद्रा क्रतवो यन्तू विश्वत ",
//     photoId: "0",
//     insProfilePhoto: "af2097827c9baa2a2771683f4a72eb1e",
//     insAffiliated: "Bhartiya Vidya Bhavan's",
//   },
//   account_info: {
//     _id: "64c22980e238a620b402e9e4",
//     finance_bank_account_number: "430414127",
//     finance_bank_name: "INDIAN BANK",
//     finance_bank_account_name: "THE PRINCIPAL, S P C E",
//     finance_bank_ifsc_code: "IDIB000B092",
//     finance_bank_branch_address: "Munshi Nagar, Andheri West",
//     finance_bank_upi_id: "NA",
//     finance_bank_upi_qrcode: null,
//     departments: [
//       "6449d24898fec071fbffd6e3",
//       "6449d28398fec071fbffd6f7",
//       "6449d2a598fec071fbffd70b",
//       "644a19f4d1679fcd6e77058d",
//     ],
//     due_repay: 17873412,
//     total_repay: 17873412,
//     collect_online: 88019456,
//     collect_offline: 0,
//     created_at: "2023-07-27T08:23:28.542Z",
//     finance: "644a09d6d1679fcd6e76e5ef",
//     __v: 38,
//     invoice_count: 0,
//     heads_list: [],
//   },
//   level: "info",
// };

const normal_daybook = async (from, to, bank, payment_type, fid) => {
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
    const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
    if (payment_type) {
      if (payment_type == "Total") {
        var all_receipts_set = await FeeReceipt.find({
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
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
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
              created_at: {
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
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
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
              created_at: {
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
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
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
            created_at: {
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
    console.log("ND", all_receipts?.length);
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
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
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
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
      };
    }
  } catch (e) {
    console.log(e);
  }
};

const hostel_daybook = async (from, to, bank, payment_type, hid, fid) => {
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
      const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
      if (payment_type) {
        if (payment_type == "Total") {
          var all_receipts_set = await FeeReceipt.find({
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
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
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
                created_at: {
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
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
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
                created_at: {
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
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
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
              created_at: {
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
          .select("fee_heads application fee_payment_mode")
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
      console.log("HH", all_receipts?.length);
      if (all_receipts?.length > 0) {
        for (let ele of all_receipts) {
          if (payment_type == "Total") {
            for (let val of ele?.fee_heads) {
              for (let ads of nest_obj) {
                if (ele?.fee_payment_mode == "By Cash") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
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
                  }
                }
                if (ele?.fee_payment_mode == "UPI Transfer") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Cheque") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Demand Draft") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
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
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                  }
                }
                if (ele?.fee_payment_mode == "UPI Transfer") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Cheque") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Demand Draft") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
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
      };
    }
  } catch (e) {
    console.log(e);
  }
};

const miscellanous_daybook = async (from, to, bank, payment_type, fid) => {
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
    const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
    if (payment_type) {
      if (payment_type === "Total") {
        var all_receipts_set = await FeeReceipt.find({
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
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount"
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
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount"
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
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount"
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
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .select(
          "fee_heads other_fees fee_payment_mode invoice_count fee_payment_amount"
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
    console.log("MM", all_receipts?.length);
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
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
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
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
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
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
  payment_type = ""
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
    let data_1 = await normal_daybook(from, to, bank, payment_type, fid);
    let data_2 = await hostel_daybook(
      from,
      to,
      bank,
      payment_type,
      hostel,
      fid
    );
    let data_3 = await miscellanous_daybook(from, to, bank, payment_type, fid);
    let combine = [data_1, data_2, data_3];
    let combines = [];
    for (let cls of combine) {
      combines.push({
        results: cls?.results,
        range: cls?.range,
      });
    }
    const valid_bank = await BankAccount.findById({ _id: bank }).select(
      "-day_book"
    );
    return {
      message: "Combined Daybook",
      access: true,
      combines,
      day_range_from: from,
      day_range_to: to,
      ins_info: data_1?.ins_info,
      account_info: valid_bank ?? "",
    };
  } catch (e) {
    console.log(e);
  }
};

const combinedDaybookData = async (
  fid = "",
  from = "",
  to = "",
  bank = "",
  payment_type = ""
) => {
  // const ft = dataObj;
  const ft = await render_combined_daybook_heads_wise(
    fid,
    from,
    to,
    bank,
    payment_type
  );
  return { ft };
};
module.exports = combinedDaybookData;
