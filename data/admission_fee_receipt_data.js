// const { decryption } = require("../helper/decrypt");
const axios = require("axios");
const changeDateFormat = require("../helper/changeDateFormat");
const getData = require("./feeData");
const get_one_receipt = async (receipt) => {
  try {
    const response = await axios.get(
      // `https://www.qviple.com/api/v2/finance/${InsNo}/one/receipt`
      `http://44.197.120.176/api/api/v2/finance/${receipt}/one/receipt`
    );
    // return decryption(response.data?.encrypt);
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
  let institute = {
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
      args2?.application?.admissionAdmin?.institute?.insEditableText_one ?? "",
    ediatbel2:
      args2?.application?.admissionAdmin?.institute?.insEditableText_two ?? "",
    insPhoneNumber:
      args2?.application?.admissionAdmin?.institute?.insPhoneNumber ?? "N/A",
    insEmail: args2?.application?.admissionAdmin?.institute?.insEmail ?? "N/A",
  };

  let selectedApplication = args2?.student?.remainingFeeList?.find(
    (val) => val?.appId === selectedApplicationId
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
    afterDataSncyRemainList?.remaining_array[
      afterDataSncyRemainList?.remaining_array?.length - 1
    ];
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
        afterDataSncyPaidFees += fee?.paid_fee;
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
      args2?.order_history?.razorpay_payment_id ??
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
      args2?.order_history?.razorpay_payment_id ??
      "N/A",
  };

  return { institute, studentInfo, paymentReceiptInfo };
};

module.exports.one_receipt_format_data = async (receipt, appId) => {
    //   const data = await get_one_receipt(receipt);
    const data = await getData(receipt);
  const { institute, studentInfo, paymentReceiptInfo } =
    admissionModifyReceiptData(data?.all_remain, data?.receipt, appId);

  return { institute, studentInfo, paymentReceiptInfo };
};

