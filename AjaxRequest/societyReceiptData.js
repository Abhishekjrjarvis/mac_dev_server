require("dotenv").config();

const axios = require("axios");
const https = require("https");
const feeReceipt = require("../models/RazorPay/feeReceipt");
const BankAccount = require("../models/Finance/BankAccount");
const RemainingList = require("../models/Admission/RemainingList");
const QvipleId = require("../models/Universal/QvipleId");
const orderPayment = require("../models/RazorPay/orderPayment");
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});
const obj = {
  DEV: "http://44.197.120.176/api/api",
  PROD: "https://qviple.com/api",
  OTHER: false,
};

// const getReceiptData = async (receiptId) => {
//   try {
//     const response = await axios.get(
//       `${obj[process.env.CONNECT_DB]}/v2/finance/${receiptId}/one/receipt`,
//       { httpsAgent }
//     );
//     return response?.data?.encrypt;
//   } catch (e) {
//     console.log(e);
//     return {};
//   }
// };

const renderOneFeeReceiptUploadQuery = async (frid) => {
  try {
    const receipt = await feeReceipt
      .findById({ _id: frid })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName qviple_student_pay_id user active_fee_heads active_society_fee_heads studentCastCategory",
        populate: {
          path: "remainingFeeList",
          select: "appId",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName qviple_student_pay_id user active_fee_heads hostel_fee_structure active_society_fee_heads studentCastCategory",
        populate: {
          path: "fee_structure hostel_fee_structure",
          select:
            "category_master structure_name unique_structure_name department batch_master applicable_fees class_master structure_month",
          populate: {
            path: "category_master class_master batch_master department",
            select: "category_name className batchName dName",
          },
        },
      })
      .populate({
        path: "finance",
        select: "financeHead show_receipt is_dublicate_receipt",
        populate: {
          path: "financeHead",
          select: "staffFirstName staffMiddleName staffLastName",
        },
      })
      .populate({
        path: "application",
        select:
          "applicationName applicationDepartment applicationHostel applicationMaster",
        populate: {
          path: "admissionAdmin",
          select: "_id site_info",
          populate: {
            path: "institute",
            select:
              "insName name insAddress insPhoneNumber insEmail insState insDistrict insProfilePhoto photoId affliatedLogo insAffiliated insEditableText_one insEditableText_two",
            populate: {
              path: "displayPersonList",
              select: "displayTitle",
              populate: {
                path: "displayUser displayStaff",
                select:
                  "userLegalName staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
              },
            },
          },
        },
      })
      .populate({
        path: "application",
        select:
          "applicationName applicationDepartment applicationHostel applicationMaster",
        populate: {
          path: "admissionAdmin",
          select: "_id site_info",
          populate: {
            path: "site_info",
          },
        },
      })
      .populate({
        path: "application",
        select:
          "applicationName applicationDepartment applicationHostel applicationMaster",
        populate: {
          path: "applicationMaster",
          select: "_id className",
        },
      })
      .populate({
        path: "application",
        select:
          "applicationName applicationDepartment applicationHostel applicationMaster applicationUnit",
        populate: {
          path: "applicationUnit",
          select: "hostel_unit_name",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName qviple_student_pay_id user active_fee_heads student_bed_number active_society_fee_heads studentCastCategory",
        populate: {
          path: "student_bed_number",
          select: "bed_number hostelRoom",
          populate: {
            path: "hostelRoom",
            select: "room_name hostelUnit",
            populate: {
              path: "hostelUnit",
              select: "hostel_unit_name",
            },
          },
        },
      })
      .populate({
        path: "application",
        select:
          "applicationName applicationDepartment applicationHostel applicationMaster",
        populate: {
          path: "hostelAdmin",
          select: "_id institute",
          populate: {
            path: "institute",
            select:
              "insName name insAddress insPhoneNumber insEmail insState insDistrict insProfilePhoto photoId affliatedLogo insAffiliated insEditableText_one insEditableText_two",
            populate: {
              path: "displayPersonList",
              select: "displayTitle",
              populate: {
                path: "displayUser displayStaff",
                select:
                  "userLegalName staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
              },
            },
          },
        },
      })
      .populate({
        path: "application",
        select:
          "applicationName applicationDepartment applicationHostel applicationMaster applicationUnit",
        populate: {
          path: "applicationHostel",
          select: "site_info",
          populate: {
            path: "site_info",
          },
        },
      })
      .populate({
        path: "order_history",
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName qviple_student_pay_id user active_fee_heads active_society_fee_heads studentCastCategory",
        populate: {
          path: "remainingFeeList",
          populate: {
            path: "fee_structure",
            select: "batch_master class_master",
            populate: {
              path: "batch_master class_master",
              select: "batchName className",
            },
          },
        },
      });

    if (receipt?.application?.applicationDepartment) {
      var one_account = await BankAccount.findOne({
        departments: { $in: receipt?.application?.applicationDepartment },
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    } else {
      var one_account = await BankAccount.findOne({
        hostel: receipt?.application?.applicationHostel,
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    }

    var ref = receipt?.student?.remainingFeeList?.filter((ele) => {
      if (`${ele?.appId}` === `${receipt?.application?._id}`) return ele;
    });

    if (ref?.length > 0) {
      var all_remain = await RemainingList.findById({ _id: ref[0]?._id })
        .select(
          "applicable_fee paid_fee remaining_fee refund_fee remaining_flow appId"
        )
        .populate({
          path: "batchId",
          select: "batchName",
        })
        .populate({
          path: "fee_structure",
          select: "total_admission_fees",
        })
        .populate({
          path: "applicable_card",
        });
    }

    // var new_format = receipt?.fee_heads?.filter((ref) => {
    //   if (ref?.original_paid > 0) return ref;
    // });

    // receipt.student.active_fee_heads = [...new_format];
    var excess_obj = {
      head_name: "Excess Fees",
      paid_fee:
        all_remain?.applicable_card?.paid_fee -
          all_remain?.applicable_card?.applicable_fee >
        0
          ? all_remain?.applicable_card?.paid_fee -
            all_remain?.applicable_card?.applicable_fee
          : 0,
      remain_fee: 0,
      applicable_fee: 0,
      fee_structure: all_remain?.fee_structure?._id,
      original_paid: 0,
      // all_remain?.applicable_card?.paid_fee -
      //   all_remain?.applicable_card?.applicable_fee >
      // 0
      //   ? all_remain?.applicable_card?.paid_fee -
      //     all_remain?.applicable_card?.applicable_fee
      //   : 0,
      appId: all_remain?.appId,
    };
    var gta_obj = {
      head_name: "Government To Applicable",
      paid_fee:
        all_remain?.applicable_card?.paid_fee -
          all_remain?.applicable_card?.applicable_fee >
        0
          ? all_remain?.applicable_card?.paid_fee -
            all_remain?.applicable_card?.applicable_fee
          : 0,
      remain_fee: 0,
      applicable_fee: 0,
      fee_structure: all_remain?.fee_structure?._id,
      original_paid: 0,
      // all_remain?.applicable_card?.paid_fee -
      //   all_remain?.applicable_card?.applicable_fee >
      // 0
      //   ? all_remain?.applicable_card?.paid_fee -
      //     all_remain?.applicable_card?.applicable_fee
      //   : 0,
      appId: all_remain?.appId,
    };
    if (excess_obj?.paid_fee > 0) {
      receipt.fee_heads.push(excess_obj);
    }
    if (gta_obj?.paid_fee > 0) {
      receipt.fee_heads.push(gta_obj);
    }
    // receipt.fee_heads.push(gta_obj);
    if (receipt?.finance?.show_receipt === "Normal") {
      receipt.student.active_fee_heads = [...receipt?.fee_heads];
    } else if (receipt?.finance?.show_receipt === "Society") {
      receipt.fee_heads = receipt?.fee_heads?.filter((qwe) => {
        if (!qwe?.is_society) {
          return qwe;
        } else {
          receipt.student.active_society_fee_heads.push(qwe);
          return null;
        }
      });
      receipt.student.active_fee_heads = [...receipt?.fee_heads];
      const new_receipt = await feeReceipt.findById({ _id: `${receipt?._id}` });
      const bank_acc = await BankAccount.findOne({
        $and: [
          { finance: `${receipt?.finance?._id}` },
          { bank_account_type: "Society" },
        ],
      })
        .select("bank_account_code invoice_count")
        .populate({
          path: "finance",
          select: "institute",
          populate: {
            path: "institute",
            select: "random_institute_code",
          },
        });
      bank_acc.invoice_count += 1;
      new_receipt.society_invoice_count = `${
        bank_acc?.finance?.institute?.random_institute_code
      }-${new Date().getMonth() + 1}-${new Date().getFullYear()}-${
        bank_acc?.bank_account_code > 9
          ? bank_acc?.bank_account_code
          : `0${bank_acc?.bank_account_code}`
      }-${bank_acc?.invoice_count}`;
      await Promise.all([bank_acc.save(), new_receipt.save()]);
      receipt.society_invoice_count = new_receipt?.society_invoice_count ?? "";
    }
    const qviple_id = await QvipleId.findOne({ user: receipt?.student?.user });

    let op = await orderPayment
      .findOne({ fee_receipt: receipt?._id })
      .select("paytm_query razor_query");
    receipt.order_history = op;

    const obj = {
      message: "Come up with Tea and Snacks",
      access: true,
      receipt: receipt,
      one_account: one_account,
      all_remain: all_remain,
      qviple_id: qviple_id,
    };
    return obj;
  } catch (e) {
    console.log(e);
  }
};
const getReceiptDataByFunction = async (receiptId) => {
  try {
    const response = await renderOneFeeReceiptUploadQuery(receiptId);
    return response;
  } catch (e) {
    console.log(e);
    return {};
  }
};

const getInstituteProfile = async (instituteId) => {
  try {
    const response = await axios.get(
      `${
        obj[process.env.CONNECT_DB]
      }/v1/ins/${instituteId}/profile?user_mod_id=`,
      { httpsAgent }
    );
    return response?.data?.institute;
  } catch (e) {
    console.log(e);
    return {};
  }
};
const societyReceiptData = async (receiptId, instituteId) => {
  // const ft = await getReceiptData(receiptId);
  const ft = await getReceiptDataByFunction(receiptId);
  // console.log("665eed56fe80b4410e5b4eff", ft);
  const dt = await getInstituteProfile(instituteId);
  return { ft, dt };
};
module.exports = societyReceiptData;
