const NewApplication = require("../../models/Admission/NewApplication");
const BankAccount = require("../../models/Finance/BankAccount");

exports.fee_receipt_count_query = async (ins, receipt, order, pattern, did) => {
  try {
    if (`${pattern}` === "Institute_Wise") {
      ins.invoice_count += 1;
      receipt.invoice_count = `${ins?.random_institute_code}-${
        new Date().getMonth() + 1
      }-${new Date().getFullYear()}-${ins?.invoice_count}`;
      order.payment_invoice_number = receipt?.invoice_count;
    } else {
      if (receipt?.application) {
        const app = await NewApplication.findById({
          _id: `${receipt?.application}`,
        }).select("applicationDepartment applicationHostel");
        if (app?.applicationDepartment) {
          let nums = [app?.applicationDepartment];
          const bank = await BankAccount.findOne({
            departments: { $in: nums },
          }).select("invoice_count bank_account_code");
          bank.invoice_count += 1;
          receipt.invoice_count = `${ins?.random_institute_code}-${
            new Date().getMonth() + 1
          }-${new Date().getFullYear()}-${
            bank?.bank_account_code > 9
              ? bank?.bank_account_code
              : `0${bank?.bank_account_code}`
          }-${bank?.invoice_count}`;
          order.payment_invoice_number = receipt?.invoice_count;
          await bank.save();
        } else if (app?.applicationHostel) {
          const bank = await BankAccount.findOne({
            hostel: app?.applicationHostel,
          }).select("invoice_count bank_account_code");
          bank.invoice_count += 1;
          receipt.invoice_count = `${ins?.random_institute_code}-${
            new Date().getMonth() + 1
          }-${new Date().getFullYear()}-${
            bank?.bank_account_code > 9
              ? bank?.bank_account_code
              : `0${bank?.bank_account_code}`
          }-${bank?.invoice_count}`;
          order.payment_invoice_number = receipt?.invoice_count;
          await bank.save();
        }
      } else if (receipt?.other_fees) {
        const bank = await BankAccount.findById({ _id: did }).select(
          "invoice_count bank_account_code"
        );
        bank.invoice_count += 1;
        receipt.invoice_count = `${ins?.random_institute_code}-${
          new Date().getMonth() + 1
        }-${new Date().getFullYear()}-${
          bank?.bank_account_code > 9
            ? bank?.bank_account_code
            : `0${bank?.bank_account_code}`
        }-${bank?.invoice_count}`;
        order.payment_invoice_number = receipt?.invoice_count;
        await bank.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fee_receipt_count_query_new = async (ins, receipt) => {
  try {
    ins.invoice_count += 1;
    receipt.invoice_count = `${ins?.random_institute_code}-${
      new Date().getMonth() + 1
    }-${new Date().getFullYear()}-${ins?.invoice_count}`;
    await Promise.all([ins.save(), receipt.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.form_no_query = (ins, student, flow) => {
  try {
    if (flow === "HOSTEL") {
      ins.form_no_count += 1;
      student.form_no = `H-${
        ins?.random_institute_code
      }-${new Date().getFullYear()} / ${ins?.form_no_count}`;
    } else {
      ins.form_no_count += 1;
      student.form_no = `${
        ins?.random_institute_code
      }-${new Date().getFullYear()} / ${ins?.form_no_count}`;
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fee_receipt_count_query_bank = (bank, receipt, order) => {
  try {
    bank.invoice_count += 1;
    //   ${bank?.random_institute_code}-
    receipt.invoice_count = `${
      new Date().getMonth() + 1
    }-${new Date().getFullYear()}-${bank?.invoice_count}`;
    order.payment_invoice_number = receipt?.invoice_count;
  } catch (e) {
    console.log(e);
  }
};
