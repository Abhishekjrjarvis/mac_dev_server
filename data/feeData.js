const numToWords = require("../helper/numToWords");
const changeDateFormat = require("../helper/changeDateFormat");
const fetchImage = require("../helper/fetchImage");
const axios = require("axios");
const { renderOneFeeReceiptUploadQuery } = require("../OptimizeController/Finance/financeController");
const fetchData = async (InsNo) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/v2/finance/${InsNo}/one/receipt`
    );
    return response.data;
  } catch (e) {
    console.log(e);
    return {};
  }
};

const rearrangeArray = async (arr) => {
  let governmentToApplicableIndex = arr.findIndex(
    (item) => item.head_name === "Government To Applicable"
  );
  let excessFeesIndex = arr.findIndex(
    (item) => item.head_name === "Excess Fees"
  );

  if (governmentToApplicableIndex !== -1) {
    let governmentToApplicable = arr.splice(governmentToApplicableIndex, 1)[0];
    arr.push(governmentToApplicable);
  }

  if (excessFeesIndex !== -1) {
    let excessFees = arr.splice(excessFeesIndex, 1)[0];
    arr.push(excessFees);
  }
  return arr;
};

const getData = async (InsNo) => {
    const response = await renderOneFeeReceiptUploadQuery(InsNo)
  const {
      receipt: {
        student: {
          studentFirstName,
          studentMiddleName,
          studentLastName,
          studentGRNO,
          active_fee_heads,
          fee_structure: {
            class_master: { className },
            batch_master: { batchName },
            department: { dName },
          },
        },
        application: {
          applicationName,
          admissionAdmin: { institute },
        },
        invoice_count,
        fee_transaction_date,
        fee_payment_mode,
        order_history,
      },
      all_remain: {
        applicable_fee,
        paid_fee,
        fee_structure: { total_admission_fees },
      },
    one_account,
  } = response;

  let transaction_info;
  if (order_history) {
    const { paytm_query, razor_query } = order_history;
    if (paytm_query) [transaction_info] = paytm_query;
    else [transaction_info] = razor_query;
  }
  const data = {
    header: {
      boardName: institute?.insAffiliated ?? "",
      universityName: institute?.insName ?? "",
      address: institute?.insAddress ?? "",
      mobNo: institute?.insPhoneNumber ?? "",
      email: institute?.insEmail ?? "",
    },
    assets: {
      instituteLogo:
        (await fetchImage(institute?.insProfilePhoto)) ?? "./assets/blank.jpg",
      universityLogo:
        (await fetchImage(institute?.affliatedLogo)) ?? "./assets/blank.jpg",
    },
    student: {
      name: `${studentFirstName} ${studentMiddleName} ${studentLastName}` ?? "",
      grNo: studentGRNO ?? "",
      department: dName ?? "",
      class: className ?? "",
      academicYear: batchName ?? "",
      appliedIn: applicationName ?? "",
    },
    receiptDetails: {
      receiptNo: invoice_count ?? "NA",
      date: changeDateFormat(fee_transaction_date) ?? "NA",
      totalFees: total_admission_fees ?? "NA",
      applicableFee: applicable_fee ?? "NA",
      feePaid: paid_fee ?? "NA",
    },
    feeDetails: await rearrangeArray(active_fee_heads),
    transactionDetails: {
      paymentMode: fee_payment_mode ?? "NA",
      refNo: transaction_info?.TXNID ?? "NA",
      bankName: one_account?.finance_bank_name ?? "NA",
      bankHolderName: one_account?.finance_bank_account_name ?? "NA",
      bankBranch: one_account?.finance_bank_branch_address ?? "NA",
      transactionId: transaction_info?.TXNID ?? "NA",
      transactionDate: changeDateFormat(fee_transaction_date) ?? "NA",
      transactionAmount: paid_fee,
      transactionAmountInWord: numToWords(paid_fee),
    },
  };
  return data;
};
module.exports = getData;