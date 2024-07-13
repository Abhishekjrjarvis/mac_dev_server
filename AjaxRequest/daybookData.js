const Finance = require("../models/Finance");
const BankAccount = require("../models/Finance/BankAccount");
const FeeMaster = require("../models/Finance/FeeMaster");
const FeesStructure = require("../models/Finance/FeesStructure");
const InstituteAdmin = require("../models/InstituteAdmin");
const FeeReceipt = require("../models/RazorPay/feeReceipt");

let dataObj = {
    message: "Explore Day Book Heads Query",
    access: true,
    results: [
      {
        head_name: "Tuition Fees",
        head_amount: 30,
      },
      {
        head_name: "Deposit Fees",
        head_amount: 5,
      },
      {
        head_name: "Development Fees",
        head_amount: 20,
      },
      {
        head_name: "Library Fees",
        head_amount: 15,
      },
      {
        head_name: "Admission Fee",
        head_amount: 0,
      },
      {
        head_name: "Gymkhana Fee",
        head_amount: 0,
      },
      {
        head_name: "Laboratory Fee",
        head_amount: 0,
      },
      {
        head_name: "Students Activity Fee",
        head_amount: 0,
      },
      {
        head_name: "Medical Fee",
        head_amount: 0,
      },
      {
        head_name: "Insurance",
        head_amount: 0,
      },
      {
        head_name: "Students Aid fund",
        head_amount: 0,
      },
      {
        head_name: "University Eligibility Fees",
        head_amount: 350,
      },
      {
        head_name: "Registration Fees",
        head_amount: 75,
      },
      {
        head_name: "Students Welfare Fund",
        head_amount: 0,
      },
      {
        head_name: "Uni. Computerization Fee",
        head_amount: 0,
      },
      {
        head_name: "Sports Fund",
        head_amount: 0,
      },
      {
        head_name: "University Disaster Mgt. Fee",
        head_amount: 0,
      },
      {
        head_name: "Contribution of Ashwamedh",
        head_amount: 0,
      },
      {
        head_name: "Physical Education Scheme",
        head_amount: 100,
      },
      {
        head_name: "Eligibility Form Fee",
        head_amount: 50,
      },
      {
        head_name: "NSS",
        head_amount: 0,
      },
      {
        head_name: "Corpus Fund",
        head_amount: 5,
      },
      {
        head_name: "Laboratory Deposit",
        head_amount: 420,
      },
      {
        head_name: "Library Deposit",
        head_amount: 0,
      },
      {
        head_name: "Caution Money",
        head_amount: 0,
      },
      {
        head_name: "Administrative Services Char",
        head_amount: 0,
      },
      {
        head_name: "Campus Conservancy Fee",
        head_amount: 0,
      },
      {
        head_name: "Internet Charges",
        head_amount: 0,
      },
      {
        head_name: "Evaluation Fee",
        head_amount: 0,
      },
      {
        head_name: "Laboratory Brekage",
        head_amount: 0,
      },
      {
        head_name: "Uni.Development Fee",
        head_amount: 0,
      },
      {
        head_name: "Laboratory Development Fee",
        head_amount: 0,
      },
      {
        head_name: "Total Fees",
        head_amount: 1070,
      },
    ],
    account_info: {
      _id: "6654bf9be36490a31bccd763",
      finance_bank_account_number: "1234",
      finance_bank_name: "Sample",
      finance_bank_account_name: "Testing Account",
      finance_bank_ifsc_code: "IFSC1234",
      finance_bank_branch_address: "Nashik",
      finance_bank_upi_id: "",
      finance_bank_upi_qrcode: "",
      departments: ["664092f00728cf14e8be2f5f"],
      due_repay: 70,
      total_repay: 70,
      collect_online: 70,
      collect_offline: 0,
      created_at: "2024-05-27T17:15:07.759Z",
      finance: "662e8ff2a73be706305ec252",
      __v: 0,
    },
    day_range_from: "2024-05-26",
    day_range_to: "2024-06-01",
    ins_info: {
      _id: "660bd1c7d5016c9947aef713",
      insName: "H.P.T. Arts and R.Y.K. Science College, Nashik-05",
      name: "HPT_RYK",
      insPincode: null,
      insAddress: "Prin. T.A. Kulkarni, Vidya Nagar, Nashik-422005",
      photoId: "0",
      insProfilePhoto: "f2420bb4980eeb0552546c2eb1fd999f",
      insAffiliated: "Gokhale Education Society's",
      insState: "Maharashtra",
    },
    level: "info",
};
  
const render_daybook_heads_wise = async (fid, from, to, bank, payment_type) => {
    try {
      var g_year;
      var l_year;
      var g_month;
      var l_month;
  
      var sorted_array = [];
    const bank_acc = await BankAccount.findById({ _id: bank });
    const finance = await Finance.findById({ _id: fid }).select("institute");
    if (bank_acc?.bank_account_type === "Society") {
      var all_struct = await FeesStructure.find({
        $and: [{finance: finance?._id}, { document_update: false}],
      });
    }
    else {
      var all_struct = await FeesStructure.find({
        $and: [{department: { $in: bank_acc?.departments }}, { document_update: false}],
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
            receipt_generated_from: "BY_ADMISSION",
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
        .select("fee_heads application")
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
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .select("fee_heads application")
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
      
    }
    else{
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
      obj["_id"] = ele?._id;
      nest_obj.push(obj);
      obj = {};
    }
    // var t = 0
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
        for (let val of ele?.fee_heads) {
          for (let ads of nest_obj) {
            if (bank_acc?.bank_account_type === "Society") {
              if (`${ads?._id}` === `${val?.master}` && val?.is_society == true) {
                ads.head_amount += val?.original_paid;
                // t+= val?.original_paid
              }
            }
            else {
              if (`${ads?._id}` === `${val?.master}` && val?.is_society == false) {
                ads.head_amount += val?.original_paid;
                // t+= val?.original_paid
              }
            }
          }
        }
      }
        // nest_obj.push({
        //   head_name: "Total Fees",
        //   head_amount: t
          // })
          return {
            results: nest_obj,
            account_info: bank_acc,
            day_range_from: from,
            day_range_to: to,
            ins_info: institute,
          }
      } else {
          return {
            results: [],
            account_info: {},
            day_range_from: null,
            day_range_to: null,
            ins_info: {},
        }
      }
    } catch (e) {
      console.log(e);
    }
  };
  
  const daybookData = async (
    fid = "",
    from = "",
    to = "",
    bank = "",
    payment_type = ""
  ) => {
    // const ft = await getReceiptData(receiptId);
    // const ft = dataObj;
    const ft = await render_daybook_heads_wise(fid, from, to, bank, payment_type);
    return { ft };
  };
  module.exports = daybookData;
  
  