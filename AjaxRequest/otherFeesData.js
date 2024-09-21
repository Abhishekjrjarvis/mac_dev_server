require("dotenv").config();

const axios = require("axios");
const https = require("https");
const FeeReceipt = require("../models/RazorPay/feeReceipt");
const BankAccount = require("../models/Finance/BankAccount");
const RemainingList = require("../models/Admission/RemainingList");
const orderPayment = require("../models/RazorPay/orderPayment");
const QvipleId = require("../models/Universal/QvipleId");
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});
const obj = {
  DEV: "http://44.197.120.176/api/api",
  PROD: "https://qviple.com/api",
  OTHER: false,
};

const getReceiptData = async (receiptId) => {
  try {
    const response = await axios.get(
      `${
        obj[process.env.CONNECT_DB]
      }/v2/finance/${receiptId}/one/receipt/other/fees`,
      { httpsAgent }
    );
    // console.log("sfdbsgd", response);
    return response?.data?.encrypt;
  } catch (e) {
    console.log(e);
    return {};
  }
};

const renderOneOtherFeeReceipt = async (frid) => {
  try {
    const receipt = await FeeReceipt.findById({ _id: frid })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName other_fees_remain_price studentCastCategory active_society_fee_heads studentClass studentROLLNO qviple_student_pay_id user",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName other_fees_remain_price studentCastCategory active_society_fee_heads studentClass studentROLLNO qviple_student_pay_id user",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName other_fees_remain_price  studentCastCategory active_society_fee_heads studentROLLNO qviple_student_pay_id user",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "finance",
        select: "financeHead show_receipt institute is_dublicate_receipt",
        populate: {
          path: "financeHead",
          select: "staffFirstName staffMiddleName staffLastName",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName other_fees_remain_price studentCastCategory student_bed_number active_society_fee_heads studentROLLNO qviple_student_pay_id user",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "other_fees",
        populate: {
          path: "fee_structure",
          select:
            "category_master structure_name unique_structure_name department batch_master applicable_fees class_master structure_month",
          populate: {
            path: "category_master class_master batch_master department",
            select: "category_name className batchName dName",
          },
        },
      })
      .populate({
        path: "order_history",
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName other_fees_remain_price studentCastCategory active_society_fee_heads studentROLLNO qviple_student_pay_id user",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      });

    if (receipt?.other_fees?.fee_structure?._id) {
      var one_account = await BankAccount.findOne({
        departments: { $in: receipt?.other_fees?.fee_structure?.department },
      }).select(
        "finance_bank_account_number finance_bank_name finance_bank_account_name finance_bank_ifsc_code finance_bank_branch_address finance_bank_upi_id finance_bank_upi_qrcode"
      );
    }
    if (receipt?.finance?.show_receipt === "Normal") {
      receipt.fee_heads = [...receipt?.fee_heads];
    } else if (receipt?.finance?.show_receipt === "Society") {
      receipt.fee_heads = receipt?.fee_heads?.filter((qwe) => {
        if (!qwe?.is_society) {
          return qwe;
        } else {
          receipt.student.active_society_fee_heads.push(qwe);
          return null;
        }
      });
      receipt.fee_heads = [...receipt?.fee_heads];
    }
    const qviple_id = await QvipleId.findOne({ user: receipt?.student?.user });

    return {
      message: "Come up with Tea and Snacks",
      access: true,
      receipt: receipt,
      one_account: one_account,
      qviple_id: qviple_id,
    };
  } catch (e) {
    console.log(e);
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
const otherFeesData = async (receiptId, instituteId) => {
  // const ft = await getReceiptData(receiptId);
  const ft = await renderOneOtherFeeReceipt(receiptId, instituteId);
  // await studentOtherFeeReceipt(frid, instituteId);
  // const ft = await getReceiptDataByFunction(receiptId);
  const dt = await getInstituteProfile(instituteId);
  return { ft, dt };
};
module.exports = otherFeesData;