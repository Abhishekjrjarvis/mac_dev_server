require("dotenv").config();

const axios = require("axios");
const https = require("https");
const feeReceipt = require("../models/RazorPay/feeReceipt");
const BankAccount = require("../models/Finance/BankAccount");
const RemainingList = require("../models/Admission/RemainingList");
const QvipleId = require("../models/Universal/QvipleId");
const changeDateFormat = require("../helper/changeDateFormat");
const orderPayment = require("../models/RazorPay/orderPayment");
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});
const obj = {
  DEV: "http://44.197.120.176/api/api",
  PROD: "http://qviple.com/api",
  OTHER: false,
};

const renderOneFeeReceiptUploadQuery = async (frid) => {
  try {
    const receipt = await feeReceipt
      .findById({ _id: frid })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads active_society_fee_heads studentROLLNO apps_fees_obj",
        populate: {
          path: "remainingFeeList",
          select: "appId",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads active_society_fee_heads studentClass studentROLLNO apps_fees_obj",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads hostel_fee_structure active_society_fee_heads studentROLLNO apps_fees_obj",
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
        select: "financeHead show_receipt",
        populate: {
          path: "financeHead",
          select: "staffFirstName staffMiddleName staffLastName",
        },
      })
      .populate({
        path: "application",
        select: "applicationName applicationDepartment applicationHostel",
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
        select: "applicationName applicationDepartment applicationHostel",
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
          "applicationName applicationDepartment applicationHostel applicationUnit",
        populate: {
          path: "applicationUnit",
          select: "hostel_unit_name",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads student_bed_number active_society_fee_heads studentROLLNO apps_fees_obj",
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
        select: "applicationName applicationDepartment applicationHostel",
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
          "applicationName applicationDepartment applicationHostel applicationUnit",
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
          "studentFirstName studentMiddleName studentGRNO studentLastName active_fee_heads active_society_fee_heads studentROLLNO apps_fees_obj",
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
    if (
      receipt?.student?.apps_fees_obj?.gta > 0 &&
      receipt?.student?.apps_fees_obj?.appId == receipt?.application?._id &&
      receipt?.student?.apps_fees_obj?.struct == receipt?.fee_structure
    ) {
      var gta_obj = {
        head_name: "Government To Applicable",
        paid_fee: receipt?.student?.apps_fees_obj?.gta ?? 0,
        remain_fee: 0,
        applicable_fee: receipt?.student?.apps_fees_obj?.gta ?? 0,
        fee_structure: all_remain?.fee_structure?._id,
        original_paid: 0,
        // receipt?.student?.apps_fees_obj?.gta ?? 0,
        appId: all_remain?.appId,
      };
    }
    if (excess_obj?.paid_fee > 0) {
      receipt.fee_heads.push(excess_obj);
    }
    if (gta_obj?.paid_fee > 0) {
      receipt.fee_heads.push(gta_obj);
    }
    // console.log(receipt.fee_heads);
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
    }
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
    };
    return obj;
  } catch (e) {
    console.log(e);
  }
};
const admissionModifyReceiptData = (
  args1,
  args2,
  selectedApplicationId = ""
) => {
  // console.info("args1", args1, args2);
  let institute = null;
  if (args2?.application?.admissionAdmin?.institute) {
    institute = {
      // instituteImage: args2?.application?.admissionAdmin?.institute
      //   ?.insProfilePhoto
      //   ? `${imageShowUrl1}/${args2?.application?.admissionAdmin?.institute?.insProfilePhoto}`
      //   : "/images/certificate/logodemo.jpg",
      instituteImage:
        args2?.application?.admissionAdmin?.institute?.insProfilePhoto ?? "",
      affiliatedImage:
        args2?.application?.admissionAdmin?.institute?.affliatedLogo ?? "",
      //   affiliatedImage: args2?.application?.admissionAdmin?.institute
      //   ?.affliatedLogo
      //   ? `${imageShowUrl1}/${args2?.application?.admissionAdmin?.institute?.affliatedLogo}`
      //   : "/images/certificate/logodemo.jpg",
      insName: args2?.application?.admissionAdmin?.institute?.insName ?? "N/A",
      insAffiliated:
        args2?.application?.admissionAdmin?.institute?.insAffiliated ?? "",
      insAddress:
        args2?.application?.admissionAdmin?.institute?.insAddress ?? "N/A",
      ediatbel1:
        args2?.application?.admissionAdmin?.institute?.insEditableText_one ??
        "",
      ediatbel2:
        args2?.application?.admissionAdmin?.institute?.insEditableText_two ??
        "",
      insPhoneNumber:
        args2?.application?.admissionAdmin?.institute?.insPhoneNumber ?? "N/A",
      insEmail:
        args2?.application?.admissionAdmin?.institute?.insEmail ?? "N/A",
    };
  } else {
    institute = {
      instituteImage:
        args2?.application?.hostelAdmin?.institute?.insProfilePhoto ?? "",
      affiliatedImage:
        args2?.application?.hostelAdmin?.institute?.affliatedLogo ?? "",

      insName: args2?.application?.hostelAdmin?.institute?.insName ?? "N/A",
      insAffiliated:
        args2?.application?.hostelAdmin?.institute?.insAffiliated ?? "",
      insAddress:
        args2?.application?.hostelAdmin?.institute?.insAddress ?? "N/A",
      ediatbel1:
        args2?.application?.hostelAdmin?.institute?.insEditableText_one ?? "",
      ediatbel2:
        args2?.application?.hostelAdmin?.institute?.insEditableText_two ?? "",
      insPhoneNumber:
        args2?.application?.hostelAdmin?.institute?.insPhoneNumber ?? "N/A",
      insEmail: args2?.application?.hostelAdmin?.institute?.insEmail ?? "N/A",
    };
  }

  let selectedApplication = args2?.student?.remainingFeeList?.find(
    (val) => `${val?.appId}` === `${selectedApplicationId}`
  );

  let studentInfo = {
    name: `${args2?.student?.studentFirstName ?? ""} ${
      args2?.student?.studentMiddleName ?? ""
    } ${args2?.student?.studentLastName ?? ""}`,
    grNumber: args2?.student?.studentGRNO ?? "N/A",
    batchName:
      selectedApplication?.fee_structure?.batch_master?.batchName ??
      args2?.student?.fee_structure?.batch_master?.batchName ??
      "N/A",
    departmentName: args2?.student?.fee_structure?.department?.dName ?? "N/A",
    standard:
      selectedApplication?.fee_structure?.class_master?.className ??
      args2?.student?.fee_structure?.class_master?.className ??
      "N/A",
    applicationName: args2?.application?.applicationName ?? "N/A",
    // applicationName: "Applied In",
    // receiverSignature: args2?.application?.admissionAdmin?.site_info?.[0]
    //   ?.cashier_signature
    //   ? `${imageShowUrl1}/${args2?.application?.admissionAdmin?.site_info?.[0]?.cashier_signature}`
    //   : "",
    receiverSignature:
      args2?.application?.admissionAdmin?.site_info?.[0]?.cashier_signature ??
      "",
    receiverName:
      args2?.application?.admissionAdmin?.site_info?.[0]?.cashier_name ?? "",
  };

  let studentAplicableFee = 0;
  for (let i = 0; i < args2?.student?.active_fee_heads.length; i++) {
    studentAplicableFee =
      studentAplicableFee + args2?.student?.active_fee_heads[i].applicable_fee;
  }

  let afterDataSncyRemainList = "";
  for (let rl of args2?.student?.remainingFeeList ?? []) {
    if (rl?.appId === args2?.application?._id) {
      afterDataSncyRemainList = rl;
      break;
    }
  }
  let afterDataSncyPaidFees = 0;
  let afterDataSncyFeeHead = [];
  let afterDataSncyInstall =
    afterDataSncyRemainList?.remaining_array?.length > 0
      ? afterDataSncyRemainList?.remaining_array[
          afterDataSncyRemainList?.remaining_array?.length - 1
        ]
      : null;
  let flag = true;
  if (afterDataSncyInstall?.fee_receipt === args2?._id) {
    flag = true;
  } else {
    flag = false;
  }
  for (let fee of args2?.student?.active_fee_heads ?? []) {
    if (flag) {
      afterDataSncyPaidFees += fee?.paid_fee;
      afterDataSncyFeeHead.push(fee);
    } else {
      if (
        fee?.head_name === "Excess Applicable Fees" ||
        fee?.head_name === "Excess Fees"
      ) {
      } else {
        // if (fee?.head_name === "Excess Fees") {
        // } else {
        afterDataSncyPaidFees += fee?.paid_fee;
        // }
        afterDataSncyFeeHead.push(fee);
      }
    }
  }
  let paymentReceiptInfo = {
    invoiceNumber: args2?.invoice_count ?? "",
    createdAt: changeDateFormat(args2?.created_at) ?? "",
    // totalFee: args1?.fee_structure?.total_admission_fees ?? "",
    // applicableFee: args1?.applicable_fee ?? "",
    totalFee: args1?.applicable_fee ?? "",
    applicableFee: studentAplicableFee,
    applicableTotalFee: studentAplicableFee,
    // applicableTotalFee: args1?.remaining_fee?.applicable_card?.applicable_fee,
    paidFee: afterDataSncyPaidFees ?? "",
    // paidFee: args1?.paid_fee ?? "",
    remainFee: args1?.remaining_fee ?? "",
    receiptFlow: args1?.remaining_flow ?? "",
    feeheadList: afterDataSncyFeeHead,
    // feeheadList: args2?.student?.active_fee_heads ?? [],
    transactonSetOff: args2?.set_off_status ?? "",
    transactonRefund: args2?.refund_status ?? "",
    transactionMode:
      `${
        args2?.fee_payment_mode === "Fee Receipt Not Generated"
          ? "Online"
          : args2?.fee_payment_mode
      } (${args2?.order_history?.razor_query?.[0]?.method ?? "N/A"})` ?? "N/A",
    referenceNumber:
      args2?.fee_utr_reference ??
      args2?.order_history?.paytm_query?.[0]?.BANKTXNID ??
      // args2?.order_history?.razorpay_payment_id ??
      "N/A",
    transactionDate: changeDateFormat(args2?.fee_transaction_date) ?? "N/A",
    transactionAmount: args2?.fee_payment_amount ?? "N/A",
    transactionApplication: args2?.application?.applicationName ?? "N/A",
    transactionBatchName: studentInfo.batchName,
    bankName:
      args2?.fee_bank_name ??
      args2?.order_history?.razor_query?.[0]?.bank ??
      "N/A",
    bankHolderName: args2?.fee_bank_holder ?? "N/A",
    transactionId:
      args2?.fee_utr_reference ??
      args2?.order_history?.paytm_query?.[0]?.BANKTXNID ??
      // args2?.order_history?.razorpay_payment_id ??
      "N/A",
  };

  return { institute, studentInfo, paymentReceiptInfo };
};

const normalReceiptData = async (receiptId, appId) => {
  const data = await renderOneFeeReceiptUploadQuery(receiptId);
  const { institute, studentInfo, paymentReceiptInfo } =
    await admissionModifyReceiptData(data?.all_remain, data?.receipt, appId);

  return { institute, studentInfo, paymentReceiptInfo };
};
module.exports = normalReceiptData;
