const invokeMemberTabNotification = require("../Firebase/MemberTab");
const Status = require("../models/Admission/status");
const Student = require("../models/Student");
const Batch = require("../models/Batch");
const NewApplication = require("../models/Admission/NewApplication");
const Admission = require("../models/Admission/Admission");
const FeeStructure = require("../models/Finance/FeesStructure");
const RemainingList = require("../models/Admission/RemainingList");
const OrderPayment = require("../models/RazorPay/orderPayment");
const FeeReceipt = require("../models/RazorPay/feeReceipt");
const Admin = require("../models/superAdmin");
const User = require("../models/User");
const StudentNotification = require("../models/Marks/StudentNotification");
const BankAccount = require("../models/Finance/BankAccount");
const {
  add_all_installment,
  add_total_installment,
  set_fee_head_query,
  add_all_installment_zero,
  lookup_applicable_grant,
  all_installment_paid,
  render_installment,
  render_government_installment_query,
  exempt_installment,
} = require("./Installment");
const { render_new_fees_card } = require("../Functions/FeesCard");
const { fee_receipt_count_query } = require("../Functions/AdmissionCustomFunctions.js/Reusable");
const NestedCard = require("../models/Admission/NestedCard");

exports.insert_multiple_status = async (
  args,
  uargs,
  iargs,
  sid,
  finance,
  structure,
  receipt
) => {
  try {
    var filtered_account = await BankAccount.findOne({
      departments: { $in: args?.applicationDepartment },
    });
    const statusArray = [
      {
        content: `Your application for ${args?.applicationName} have been filled successfully.

Below is the admission process:
1. You will get notified here after your selection or rejection from the institute. ( In case there is no notification within 3 working days, visit or contact the admission department)

2.After selection, confirm from your side and start the admission process.

3.After confirmation from your side, visit the institute with the required documents and applicable fees. (You will get Required documents and application fees information on your selection from the institute side. (Till then check our standard required documents and fee structures)

4.Payment modes available for fee payment: 
Online: UPI, Debit Card, Credit Card, Net banking & other payment apps (Phonepe, Google pay, Paytm)

5.After submission and verification of documents, you are required to pay application admission fees.

6. Pay application admission fees and your admission will be confirmed and complete.

7. For cancellation and refund, contact the admission department.

Note: Stay tuned for further updates. Tap here to see username ${uargs?.username}`,
        applicationId: args?._id,
        instituteId: iargs?._id,
        document_visible: true,
        finance: finance?._id,
        bank_account: filtered_account?._id,
        student: sid,
        group_by: "Admission_Application_Applied"
      },
    ];

    Status.insertMany(statusArray)
      .then((value) => {
        uargs.applicationStatus.push(...value);
      })
      .catch((e) => {
        console.log("Not Saved Status");
      });
    await uargs.save();
  } catch (e) {
    console.log(e);
  }
};

exports.ignite_multiple_alarm = async (arr) => {
  try {
    var all_status = await Status.find({
      _id: { $in: arr?.applicationStatus },
    });
    for (var ref of all_status) {
      var notify = new StudentNotification({});
      var apply = await NewApplication.findById({
        _id: `${ref?.applicationId}`,
      });
      var admission_admin = await Admission.findById({
        _id: `${apply?.admissionAdmin}`,
      }).populate({
        path: "admissionAdminHead",
        select: "user",
      });
      var student = await Student.findById({ _id: `${ref?.studentId}` });
      var user = await User.findById({ _id: `${student?.user}` });
      notify.notifyContent = `${ref?.content}`;
      notify.notifySender = admission_admin?.admissionAdminHead?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission_admin?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      await Promise.all([user.save(), notify.save()]);
      invokeMemberTabNotification(
        "Admission Status",
        ref.content,
        "Application Status",
        arr._id,
        arr.deviceToken
      );
    }
    return true;
  } catch (e) {
    console.log(e);
  }
};

exports.fee_reordering = async (
  type,
  mode,
  price,
  stu_query,
  apply,
  institute,
  finance,
  admission,
  s_admin,
  new_receipt,
  user
) => {
  try {
    var student = await Student.findById({ _id: `${stu_query?._id}` }).populate(
      {
        path: "fee_structure",
      }
    );
    var is_install;
    if (
      price <= student?.fee_structure?.total_admission_fees &&
      price <= student?.fee_structure?.one_installments?.fees
    ) {
      is_install = true;
    } else {
      is_install = false;
    }
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute?.invoice_count}`;
    var total_amount = await add_total_installment(student);
    if (price > 0 && !is_install) {
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: student?.fee_structure?.total_admission_fees,
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "One_Time_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "One Time Fees",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "One Time Fees";
      new_remainFee.paid_fee += price;
      new_remainFee.remaining_fee +=
        student?.fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      admission.remainingFee.push(student._id);
      new_remainFee.fee_structure = student?.fee_structure?._id;
      student.admissionRemainFeeCount +=
        student?.fee_structure?.total_admission_fees - price;
      apply.remainingFee +=
        student?.fee_structure?.total_admission_fees - price;
      admission.remainingFeeCount +=
        student?.fee_structure?.total_admission_fees - price;
      const valid_one_time_fees =
        student?.fee_structure?.total_admission_fees - price == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        admission.remainingFee.pull(student._id);
      } else {
        new_remainFee.remaining_array.push({
          remainAmount: student?.fee_structure?.total_admission_fees - price,
          appId: apply._id,
          status: "Not Paid",
          instituteId: institute._id,
          installmentValue: "One Time Fees Remain",
          isEnable: true,
        });
      }
    } else if (is_install && price > 0) {
      admission.remainingFee.push(student._id);
      student.admissionRemainFeeCount += total_amount - price;
      apply.remainingFee += total_amount - price;
      admission.remainingFeeCount += total_amount - price;
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: total_amount,
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "Installment_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "First Installment",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "First Installment";
      new_remainFee.paid_fee += price;
      new_remainFee.remaining_fee += total_amount - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      new_remainFee.fee_structure = student?.fee_structure?._id;
      await add_all_installment(
        apply,
        institute._id,
        new_remainFee,
        price,
        student
      );
    }
    if (mode === "Offline") {
      admission.collected_fee += price;
      admission.offlineFee += price;
      apply.collectedFeeCount += price;
      apply.offlineFee += price;
      finance.financeAdmissionBalance += price;
      finance.financeTotalBalance += price;
      finance.financeSubmitBalance += price;
    } else if (mode === "Online") {
      admission.onlineFee += price;
      apply.collectedFeeCount += price;
      apply.onlineFee += price;
      finance.financeAdmissionBalance += price;
      finance.financeTotalBalance += price;
      finance.financeBankBalance += price;
    } else {
    }
    student.admissionPaidFeeCount += price;
    student.paidFeeList.push({
      paidAmount: price,
      appId: apply._id,
    });
    await set_fee_head_query(student, price, apply, new_receipt);
    apply.confirmedApplication.push({
      student: student._id,
      payment_status: mode,
      install_type: is_install
        ? "First Installment Paid"
        : "One Time Fees Paid",
      fee_remain: is_install
        ? total_amount - price
        : student?.fee_structure?.total_admission_fees - price,
    });
    apply.confirmCount += 1;
    const order = new OrderPayment({});
    order.payment_module_type = "Admission Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    order.payment_invoice_number = new_receipt?.invoice_count;
    order.fee_receipt = new_receipt?._id;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    await Promise.all([
      new_receipt.save(),
      new_remainFee.save(),
      order.save(),
      institute.save(),
    ]);
  } catch (e) {
    console.log(e);
  }
};

exports.fee_reordering_direct_student = async (
  student,
  institute,
  batchSet,
  user,
  finance
) => {
  try {
    for (var ref of batchSet) {
      // var student = await Student.findById({ _id: stu_query?._id });
      var price = parseInt(ref.amount);
      const new_receipt = new FeeReceipt({
        fee_payment_mode: "Offline",
        fee_payment_amount: price,
      });
      new_receipt.receipt_generated_from = "BY_ADMISSION";
      var apply = await NewApplication.findById({ _id: ref?.appId });
      var admission = await Admission.findById({
        _id: `${apply?.admissionAdmin}`,
      });
      var batch = await Batch.findById({ _id: ref?.batchId });
      var fee_structure = await FeeStructure.findById({ _id: ref?.fee_struct });
      var student_structure = {
        fee_structure: fee_structure,
      };
      new_receipt.student = student?._id;
      new_receipt.application = apply?._id;
      new_receipt.finance = finance?._id;
      new_receipt.fee_transaction_date = new Date();
      var is_install;
      if (
        price <= fee_structure?.total_admission_fees &&
        price <= fee_structure?.one_installments?.fees
      ) {
        is_install = true;
      } else {
        is_install = false;
      }
      var total_amount = await add_total_installment(student_structure);
      if (price > 0 && !is_install) {
        var new_remainFee = new RemainingList({
          appId: apply._id,
          applicable_fee: fee_structure?.total_admission_fees,
          institute: institute?._id,
        });
        new_remainFee.access_mode_card = "One_Time_Wise";
        new_remainFee.paid_fee += price;
        new_remainFee.fee_structure = fee_structure?._id;
        new_remainFee.remaining_fee +=
          fee_structure?.total_admission_fees - price;
        student.remainingFeeList.push(new_remainFee?._id);
        student.remainingFeeList_count += 1;
        new_remainFee.student = student?._id;
        admission.remainingFee.push(student._id);
        student.admissionRemainFeeCount +=
          fee_structure?.total_admission_fees - price;
        new_remainFee.fee_receipts.push(new_receipt?._id);
        apply.remainingFee += fee_structure?.total_admission_fees - price;
        admission.remainingFeeCount +=
          fee_structure?.total_admission_fees - price;
        new_remainFee.remaining_array.push({
          remainAmount: price,
          appId: apply._id,
          status: "Paid",
          instituteId: institute._id,
          installmentValue: "One Time Fees",
          mode: "Offline",
          isEnable: true,
          fee_receipt: new_receipt?._id,
        });
        new_remainFee.active_payment_type = "One Time Fees";
        const valid_one_time_fees =
          fee_structure?.total_admission_fees - price == 0 ? true : false;
        if (valid_one_time_fees) {
          admission.remainingFee.pull(student._id);
        } else {
          new_remainFee.remaining_array.push({
            remainAmount: fee_structure?.total_admission_fees - price,
            appId: apply._id,
            status: "Not Paid",
            instituteId: institute._id,
            installmentValue: "One Time Fees Remain",
            isEnable: true,
          });
        }
      } else if (is_install && price > 0) {
        admission.remainingFee.push(student._id);
        student.admissionRemainFeeCount += total_amount - price;
        apply.remainingFee += total_amount - price;
        admission.remainingFeeCount += total_amount - price;
        var new_remainFee = new RemainingList({
          appId: apply._id,
          applicable_fee: total_amount,
          institute: institute?._id,
        });
        new_remainFee.access_mode_card = "Installment_Wise";
        new_remainFee.paid_fee += price;
        new_remainFee.fee_structure = fee_structure?._id;
        new_remainFee.remaining_fee += total_amount - price;
        student.remainingFeeList.push(new_remainFee?._id);
        student.remainingFeeList_count += 1;
        new_remainFee.fee_receipts.push(new_receipt?._id);
        new_remainFee.student = student?._id;
        new_remainFee.remaining_array.push({
          remainAmount: price,
          appId: apply._id,
          status: "Paid",
          instituteId: institute._id,
          installmentValue: "First Installment",
          mode: "Offline",
          isEnable: true,
          fee_receipt: new_receipt?._id,
        });
        new_remainFee.active_payment_type = "First Installment";
        await add_all_installment(
          apply,
          institute._id,
          new_remainFee,
          price,
          student_structure
        );
      }
      student.admissionPaidFeeCount += price;
      student.paidFeeList.push({
        paidAmount: price,
        appId: apply._id,
      });
      await set_fee_head_query(
        student,
        price,
        apply,
        new_receipt,
        fee_structure
      );
      apply.allottedApplication.push({
        student: student._id,
        payment_status: "Offline",
        install_type: is_install
          ? "First Installment Paid"
          : "One Time Fees Paid",
        fee_remain: is_install
          ? total_amount - price
          : fee_structure?.total_admission_fees - price,
      });
      apply.allotCount += 1;
      new_remainFee.batchId = batch?._id;
      user.applyApplication.push(apply._id);
      await Promise.all([
        new_remainFee.save(),
        apply.save(),
        admission.save(),
        new_receipt.save(),
      ]);
    }
  } catch (e) {
    console.log(e);
  }
};

const one_time_zero_fees_query = async (
  new_remainFee,
  fee_structure,
  nestPrice,
  apply,
  institute,
  student,
  admission
) => {
  try {
    if (fee_structure?.total_admission_fees - nestPrice >= 0) {
      new_remainFee.remaining_array.push({
        remainAmount: fee_structure?.total_admission_fees - nestPrice,
        appId: apply._id,
        status: "Not Paid",
        instituteId: institute._id,
        installmentValue: "One Time Fees Remain",
        isEnable: true,
      });
    }
    new_remainFee.fee_structure = fee_structure?._id;
    // if (fee_structure?.total_admission_fees - nestPrice > 0) {
    //   new_remainFee.remaining_fee +=
    //     fee_structure?.total_admission_fees - nestPrice;
    //   student.remainingFeeList.push(new_remainFee?._id);
    //   student.remainingFeeList_count += 1;
    //   new_remainFee.student = student?._id;
    //   admission.remainingFee.push(student._id);
    //   student.admissionRemainFeeCount +=
    //     fee_structure?.total_admission_fees - nestPrice;
    //   apply.remainingFee += fee_structure?.total_admission_fees - nestPrice;
    //   admission.remainingFeeCount +=
    //     fee_structure?.total_admission_fees - nestPrice;
    // } else {
    //   new_remainFee.remaining_fee += 0;
    //   student.remainingFeeList.push(new_remainFee?._id);
    //   new_remainFee.student = student?._id;
    //   student.admissionRemainFeeCount += 0;
    //   if (new_remainFee.remaining_fee > 0) {
    //   } else {
    //     new_remainFee.status = "Paid";
    //   }
    //   apply.remainingFee += 0;
    //   admission.remainingFeeCount += 0;
    //   if (nestPrice - fee_structure?.total_admission_fees > 0) {
    //     admission.refundCount +=
    //       nestPrice - fee_structure?.total_admission_fees;
    //     admission.refundFeeList.push({
    //       student: student?._id,
    //       refund: nestPrice - fee_structure?.total_admission_fees,
    //     });
    //   }
    // }
    await Promise.all([
      new_remainFee.save(),
      student.save(),
      apply.save(),
      admission.save(),
    ]);
  } catch (e) {
    console.log(e);
  }
};

const installment_zero_fees_query = async (
  new_remainFee,
  total_amount,
  nestPrice,
  apply,
  institute,
  student,
  admission,
  price,
  student_structure
) => {
  try {
    await add_all_installment_zero(
      apply,
      institute._id,
      new_remainFee,
      price,
      student_structure
    );
    // new_remainFee.remaining_fee +=
    //   total_amount - nestPrice > 0 ? total_amount - nestPrice : 0;
    student.remainingFeeList.push(new_remainFee?._id);
    student.remainingFeeList_count += 1;
    // if (new_remainFee.remaining_fee > 0) {
    // } else {
    //   new_remainFee.status = "Paid";
    // }
    new_remainFee.student = student?._id;
    await Promise.all([
      new_remainFee.save(),
      student.save(),
      apply.save(),
      admission.save(),
    ]);
  } catch (e) {
    console.log(e);
  }
};

exports.fee_reordering_direct_student_payload = async (
  students,
  institute,
  batchSet,
  user,
  finance
) => {
  try {
    for (var ref of batchSet) {
      var student = await Student.findById({ _id: students?._id }).populate({
        path: "fee_structure",
      });
      var price = ref?.amount ? parseInt(ref?.amount) : -1;
      if (price >= 0 && ref?.batchId && ref?.appId && ref?.fee_struct) {
        var apply = await NewApplication.findById({ _id: ref?.appId });
        var admission = await Admission.findById({
          _id: `${apply?.admissionAdmin}`,
        });
        var batch = await Batch.findById({ _id: ref?.batchId });
        var fee_structure = await FeeStructure.findById({
          _id: ref?.fee_struct,
        });
        var student_structure = {
          fee_structure: fee_structure,
        };
        var is_install;
        if (
          price <= fee_structure?.total_admission_fees &&
          price <= fee_structure?.one_installments?.fees
        ) {
          is_install = true;
        } else {
          is_install = false;
        }
        // console.log("Amount Issue");
        // console.log(price);
        var total_amount = await add_total_installment(student_structure);
        // console.log("Total Amount", total_amount);
        if (price >= 0 && !is_install) {
          var new_remainFee = new RemainingList({
            appId: apply._id,
            applicable_fee: fee_structure?.total_admission_fees,
            institute: institute?._id,
          });
          new_remainFee.access_mode_card = "One_Time_Wise";
          // console.log("card created");
          for (var nest of ref?.remain_array) {
            const s_admin = await Admin.findById({
              _id: `${process.env.S_ADMIN_ID}`,
            }).select("invoice_count");
            const nestPrice = nest?.amount ? parseInt(nest?.amount) : -1;
            // console.log(nestPrice);
            if (nestPrice == 0) {
              // console.log(
              //   "One Time Entering",
              //   nestPrice,
              //   fee_structure?.total_admission_fees
              // );
              await one_time_zero_fees_query(
                new_remainFee,
                fee_structure,
                nestPrice,
                apply,
                institute,
                student,
                admission
              );
              if (nest?.mode) {
                await lookup_applicable_grant(
                  nest?.mode,
                  nestPrice,
                  new_remainFee
                );
              }
            } else if (nestPrice > 0) {
              var new_receipt = new FeeReceipt({
                fee_payment_mode: nest?.mode,
                fee_payment_amount: nestPrice,
              });
              new_receipt.receipt_generated_from = "BY_ADMISSION";
              new_receipt.student = student?._id;
              new_receipt.application = apply?._id;
              new_receipt.finance = finance?._id;
              new_receipt.fee_transaction_date = new Date();
              if (nest?.mode) {
                await lookup_applicable_grant(
                  nest?.mode,
                  nestPrice,
                  new_remainFee,
                  new_receipt
                );
              }
              // s_admin.invoice_count += 1;
              // new_receipt.invoice_count = `${
              //   new Date().getMonth() + 1
              // }${new Date().getFullYear()}${s_admin.invoice_count}`;
              new_remainFee.fee_receipts.push(new_receipt?._id);
              new_remainFee.remaining_array.push({
                remainAmount: nestPrice,
                appId: apply._id,
                status: "Paid",
                instituteId: institute._id,
                installmentValue: "One Time Fees",
                mode: nest?.mode,
                isEnable: true,
                fee_receipt: new_receipt?._id,
              });
              new_remainFee.active_payment_type = "One Time Fees";
              const order = new OrderPayment({});
              order.payment_module_type = "Admission Fees";
              order.payment_to_end_user_id = institute?._id;
              order.payment_by_end_user_id = user._id;
              order.payment_module_id = apply._id;
              order.payment_amount = nestPrice;
              order.payment_status = "Captured";
              order.payment_flag_to = "Credit";
              order.payment_flag_by = "Debit";
              order.payment_mode = nest?.mode;
              order.payment_admission = apply._id;
              order.payment_from = student._id;
              order.payment_student = student?._id;
              order.payment_student_name = student?.valid_full_name;
              order.payment_student_gr = student?.studentGRNO;
              institute.invoice_count += 1;
              user.payment_history.push(order._id);
              order.fee_receipt = new_receipt?._id;
              institute.payment_history.push(order._id);
              new_receipt.invoice_count = `${
                new Date().getMonth() + 1
              }${new Date().getFullYear()}${institute?.invoice_count}`;
              order.payment_invoice_number = new_receipt?.invoice_count;
              await Promise.all([
                new_receipt.save(),
                institute.save(),
                order.save(),
              ]);
            }
          }
          new_remainFee.paid_fee += price;
          new_remainFee.fee_structure = fee_structure?._id;
          if (fee_structure?.total_admission_fees - price > 0) {
            new_remainFee.remaining_fee +=
              fee_structure?.total_admission_fees - price;
            student.remainingFeeList.push(new_remainFee?._id);
            student.remainingFeeList_count += 1;
            new_remainFee.student = student?._id;
            admission.remainingFee.push(student._id);
            student.admissionRemainFeeCount +=
              fee_structure?.total_admission_fees - price;
            apply.remainingFee += fee_structure?.total_admission_fees - price;
            admission.remainingFeeCount +=
              fee_structure?.total_admission_fees - price;
            const valid_one_time_fees =
              fee_structure?.total_admission_fees - price == 0 ? true : false;
            if (valid_one_time_fees) {
              admission.remainingFee.pull(student._id);
            } else {
              if (fee_structure?.total_admission_fees - price >= 0) {
                new_remainFee.remaining_array.push({
                  remainAmount: fee_structure?.total_admission_fees - price,
                  appId: apply._id,
                  status: "Not Paid",
                  instituteId: institute._id,
                  installmentValue: "One Time Fees Remain",
                  isEnable: true,
                });
              }
            }
          } else {
            new_remainFee.remaining_fee += 0;
            student.remainingFeeList.push(new_remainFee?._id);
            new_remainFee.student = student?._id;
            student.admissionRemainFeeCount += 0;
            if (new_remainFee.remaining_fee > 0) {
            } else {
              new_remainFee.status = "Paid";
            }
            apply.remainingFee += 0;
            admission.remainingFeeCount += 0;
            if (price - fee_structure?.total_admission_fees > 0) {
              admission.refundCount +=
                price - fee_structure?.total_admission_fees;
              admission.refundFeeList.push({
                student: student?._id,
                refund: price - fee_structure?.total_admission_fees,
              });
            }
            const valid_one_time_fees =
              fee_structure?.total_admission_fees - price == 0 ? true : false;
            if (valid_one_time_fees) {
              admission.remainingFee.pull(student._id);
            } else {
              new_remainFee.remaining_array.push({
                remainAmount: fee_structure?.total_admission_fees - price,
                appId: apply._id,
                status: "Not Paid",
                instituteId: institute._id,
                installmentValue: "One Time Fees Remain",
                isEnable: true,
              });
            }
          }
        } else if (is_install && price >= 0) {
          if (total_amount - price > 0) {
            student.admissionRemainFeeCount += total_amount - price;
            apply.remainingFee += total_amount - price;
            admission.remainingFeeCount += total_amount - price;
            admission.remainingFee.push(student._id);
          } else {
            student.admissionRemainFeeCount += 0;
            apply.remainingFee += 0;
            admission.remainingFeeCount += 0;
            if (price - total_amount > 0) {
              admission.refundCount += price - total_amount;
              admission.refundFeeList.push({
                student: student?._id,
                refund: price - total_amount,
              });
            }
          }
          var new_remainFee = new RemainingList({
            appId: apply._id,
            applicable_fee: total_amount,
            institute: institute?._id,
          });
          new_remainFee.access_mode_card = "Installment_Wise";
          // console.log("card created");
          for (var nest of ref?.remain_array) {
            const s_admin = await Admin.findById({
              _id: `${process.env.S_ADMIN_ID}`,
            }).select("invoice_count");
            var nestPrice = nest?.amount ? parseInt(nest?.amount) : -1;
            // console.log(nestPrice);
            if (nestPrice == 0) {
              // console.log("Installment Entering", nestPrice, total_amount);
              await installment_zero_fees_query(
                new_remainFee,
                total_amount,
                nestPrice,
                apply,
                institute,
                student,
                admission,
                price,
                student_structure
              );
              if (nest?.mode) {
                await lookup_applicable_grant(
                  nest?.mode,
                  nestPrice,
                  new_remainFee
                );
              }
            } else if (nestPrice > 0) {
              var new_receipt = new FeeReceipt({
                fee_payment_mode: nest?.mode,
                fee_payment_amount: nestPrice,
              });
              new_receipt.receipt_generated_from = "BY_ADMISSION";
              new_receipt.student = student?._id;
              new_receipt.application = apply?._id;
              new_receipt.finance = finance?._id;
              new_receipt.fee_transaction_date = new Date();
              institute.invoice_count += 1;
              new_receipt.invoice_count = `${
                new Date().getMonth() + 1
              }${new Date().getFullYear()}${institute?.invoice_count}`;
              new_remainFee.fee_receipts.push(new_receipt?._id);
              new_remainFee.remaining_array.push({
                remainAmount: nestPrice,
                appId: apply._id,
                status: "Paid",
                instituteId: institute._id,
                installmentValue: "First Installment",
                mode: nest?.mode,
                isEnable: true,
                fee_receipt: new_receipt?._id,
              });
              new_remainFee.active_payment_type = "First Installment";
              if (nest?.mode) {
                await lookup_applicable_grant(
                  nest?.mode,
                  nestPrice,
                  new_remainFee,
                  new_receipt
                );
              }
              const order = new OrderPayment({});
              order.payment_module_type = "Admission Fees";
              order.payment_to_end_user_id = institute?._id;
              order.payment_by_end_user_id = user._id;
              order.payment_module_id = apply._id;
              order.payment_amount = nestPrice;
              order.payment_status = "Captured";
              order.payment_flag_to = "Credit";
              order.payment_flag_by = "Debit";
              order.payment_mode = nest?.mode;
              order.payment_admission = apply._id;
              order.payment_from = student._id;
              order.payment_student = student?._id;
              order.payment_student_name = student?.valid_full_name;
              order.payment_student_gr = student?.studentGRNO;
              order.payment_invoice_number = new_receipt?.invoice_count;
              user.payment_history.push(order._id);
              institute.payment_history.push(order._id);
              order.fee_receipt = new_receipt?._id;
              await Promise.all([
                new_receipt.save(),
                institute.save(),
                order.save(),
              ]);
              // }
            }
          }

          new_remainFee.paid_fee += price;
          new_remainFee.fee_structure = fee_structure?._id;
          new_remainFee.remaining_fee +=
            total_amount - price > 0 ? total_amount - price : 0;
          student.remainingFeeList.push(new_remainFee?._id);
          student.remainingFeeList_count += 1;
          if (new_remainFee.remaining_fee > 0) {
          } else {
            new_remainFee.status = "Paid";
          }
          new_remainFee.student = student?._id;
          if (
            new_remainFee.remaining_fee > 0 &&
            `${student_structure?.fee_structure?.total_installments}` === "1"
          ) {
            new_remainFee.remaining_array.push({
              remainAmount: new_remainFee?.remaining_fee,
              appId: apply._id,
              instituteId: institute._id,
              installmentValue: "Installment Remain",
              isEnable: true,
            });
          }
          if (new_remainFee?.remaining_fee > 0) {
            await add_all_installment(
              apply,
              institute._id,
              new_remainFee,
              price,
              student_structure
            );
          }
        }
        student.admissionPaidFeeCount += price;
        student.paidFeeList.push({
          paidAmount: price,
          appId: apply._id,
        });
        if (new_receipt) {
          await set_fee_head_query(
            student,
            price,
            apply,
            new_receipt,
            fee_structure
          );
        }
        apply.allottedApplication.push({
          student: student._id,
          payment_status: "Offline",
          install_type: is_install
            ? "First Installment Paid"
            : "One Time Fees Paid",
          fee_remain: is_install
            ? total_amount - price > 0
              ? total_amount - price
              : 0
            : fee_structure?.total_admission_fees - price,
        });
        apply.allotCount += 1;
        new_remainFee.batchId = batch?._id;
        new_remainFee.remark = ref?.remark;
        user.applyApplication.push(apply._id);
        await Promise.all([
          new_remainFee.save(),
          apply.save(),
          admission.save(),
          // new_receipt.save(),
        ]);
        // console.log(student?.remainingFeeList?.length);
      } else {
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const applicable_fees_query = async (
  student,
  user,
  apply,
  admission,
  finance,
  institute,
  new_remainFee,
  price,
  mode,
  fee_structure,
  // pay_remain
) => {
  try {
    var order = new OrderPayment({});
        var new_receipt = new FeeReceipt({});
        new_receipt.fee_payment_mode = mode
        new_receipt.fee_payment_amount = price
        new_receipt.student = student?._id;
        new_receipt.fee_transaction_date = new Date();
        new_receipt.application = apply?._id;
        new_receipt.receipt_generated_from = "BY_ADMISSION";
        new_receipt.finance = finance?._id;
        new_receipt.receipt_status = "Already Generated";
        order.payment_module_type = "Admission Fees";
        order.payment_to_end_user_id = institute?._id;
        order.payment_by_end_user_id = user._id;
        order.payment_module_id = apply._id;
        order.payment_amount = price;
        order.payment_status = "Captured";
        order.payment_flag_to = "Credit";
        order.payment_flag_by = "Debit";
        order.payment_mode = mode;
        order.payment_admission = apply._id;
        order.payment_from = student._id;
        order.payment_student = student?._id;
        order.payment_student_name = student?.valid_full_name;
        order.payment_student_gr = student?.studentGRNO;
        order.fee_receipt = new_receipt?._id;
        fee_receipt_count_query(institute, new_receipt, order)
        user.payment_history.push(order._id);
        institute.payment_history.push(order._id);
    if (new_remainFee?.applicable_card?._id) {
      const nest_card = await NestedCard.findById({ _id: `${new_remainFee?.applicable_card?._id}`})
      new_remainFee.active_payment_type = `${type}`;
      nest_card.active_payment_type = `${type}`;
      new_remainFee.paid_fee += price;
      nest_card.paid_fee += price;
      if(new_remainFee?.remaining_fee >= price){
        new_remainFee.remaining_fee -= price
      }
      if(nest_card?.remaining_fee >= price){
        nest_card.remaining_fee -= price
      }
      else {
        nest_card.remaining_fee = 0
      }
      if(student.admissionRemainFeeCount >= price){
        student.admissionRemainFeeCount -= price
      }
      if(apply.remainingFee >= price){
        apply.remainingFee -= price
      }
      if(admission.remainingFeeCount >= price){
        admission.remainingFeeCount -= price
      }
        var valid_one_time_fees =
        fee_structure?.applicable_fees - price == 0
          ? true
          : false;
          if (valid_one_time_fees) {
            admission.remainingFee.pull(student._id);
          } else {
          }
          if (new_receipt?.fee_payment_mode === "Exempted/Unrecovered") {
            await exempt_installment(
              new_receipt?.fee_payment_mode,
              new_remainFee,
              student,
              admission,
              apply,
              finance,
              price,
              new_receipt,
              nest_card
            );
          }
      // if (pay_remain) {
      //   await all_installment_paid(
      //     new_remainFee,
      //     fee_structure,
      //     mode,
      //     price,
      //     admission,
      //     student,
      //     new_receipt,
      //     apply,
      //     institute,
      //     nest_card,
      //     type
      //   )
      // }
      // else {
        await render_installment(
          type,
          student,
          mode,
          price,
          admission,
          fee_structure,
          new_remainFee,
          new_receipt,
          apply,
          institute,
          nest_card
        );
      // }
        await nest_card.save()
          console.log("Enter");
          await set_fee_head_query(student, price, apply, new_receipt);
          console.log("Exit");
        apply.allottedApplication.push({
          student: student._id,
          payment_status: "Online",
          fee_remain: new_remainFee?.remaining_fee,
        });
        apply.allotCount += 1;
    }
    new_remainFee.fee_receipts.push(new_receipt?._id);
      admission.onlineFee += price;
      apply.collectedFeeCount += price;
      apply.onlineFee += price;
      finance.financeAdmissionBalance += price;
      finance.financeTotalBalance += price;
      finance.financeBankBalance += price;
    if (new_remainFee?.remaining_fee > 0) {
    } else {
      new_remainFee.status = "Paid";
    }
    await lookup_applicable_grant(
      new_receipt?.fee_payment_mode,
      price,
      new_remainFee,
      new_receipt
    );
    student.admissionPaidFeeCount += price;
    student.paidFeeList.push({
      paidAmount: price,
      appId: apply._id,
    });
    await Promise.all([
      admission.save(),
      apply.save(),
      student.save(),
      finance.save(),
      user.save(),
      order.save(),
      institute.save(),
      new_remainFee.save(),
      new_receipt.save(),
    ]);
  }
  catch (e) {
    console.log(e)
  }
}

const government_fees_query = async(
  student,
  user,
  apply,
  admin_ins,
  finance,
  institute,
  remaining_fee_lists,
  price_gov,
  mode_gov,
  fee_structure
) => {
  try {
    var extra_price = 0;
    var order = new OrderPayment({});
    const new_receipt = new FeeReceipt({});
    new_receipt.fee_payment_mode = mode_gov
    new_receipt.fee_payment_amount = price_gov
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.receipt_generated_from = "BY_ADMISSION";
    new_receipt.scholarship_status = "MARK_AS_SCHOLARSHIP"
    new_receipt.fee_transaction_date = new Date();
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    finance.government_receipt.push(new_receipt?._id);
    finance.financeGovernmentScholarBalance += price;
    finance.scholarship_candidates.push(new_receipt?._id);
    finance.scholarship_candidates_count += 1;
    finance.government_receipt_count += 1;
    order.payment_module_type = "Admission Fees";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price_gov;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode_gov;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    fee_receipt_count_query(institute, new_receipt, order)
    user.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    institute.payment_history.push(order._id);
    remaining_fee_lists.paid_fee += price_gov;
      if (remaining_fee_lists?.applicable_card?._id) {
        var nest_app = await NestedCard.findById({ _id: `${remaining_fee_lists?.applicable_card?._id}` })
      }
    if (remaining_fee_lists?.government_card?._id) {
      const nest_card = await NestedCard.findById({ _id: `${remaining_fee_lists?.government_card?._id}` })
      remaining_fee_lists.active_payment_type = `${type}`;
      nest_card.active_payment_type = `${type}`;
      nest_card.paid_fee += price_gov;
      if (nest_card?.remaining_fee >= price_gov) {
        nest_card.remaining_fee -= price_gov
      }
      else {
        nest_card.remaining_fee = 0
      }
      if(student.admissionRemainFeeCount >= price_gov){
        student.admissionRemainFeeCount -= price_gov
      }
      if(apply.remainingFee >= price_gov){
        apply.remainingFee -= price_gov
      }
      if(admin_ins.remainingFeeCount >= price_gov){
        admin_ins.remainingFeeCount -= price_gov
      }
        await nest_card.save()
      console.log("Enter")
      // console.log(nest_app)
            await render_government_installment_query(
              type,
              student,
              mode_gov,
              price_gov,
              admin_ins,
              fee_structure,
              remaining_fee_lists,
              new_receipt,
              apply,
              institute,
              nest_card,
              nest_app
            );
            console.log("Exit")
    }
    student.admissionPaidFeeCount += price_gov;
      admin_ins.onlineFee += price_gov + extra_price;
      apply.onlineFee += price_gov + extra_price;
      apply.collectedFeeCount += price_gov + extra_price;
      // finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price_gov + extra_price;
      finance.financeBankBalance += price_gov + extra_price;
      if (finance?.financeIncomeBankBalance >= price_gov + extra_price) {
        finance.financeIncomeBankBalance -= price_gov + extra_price;
      }
    if (finance?.financeTotalBalance >= price_gov + extra_price) {
      finance.financeTotalBalance -= price_gov + extra_price;
    }
    await lookup_applicable_grant(
      new_receipt?.fee_payment_mode,
      price_gov,
      remaining_fee_lists,
      new_receipt
    );
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price_gov;
      }
    }
    await Promise.all([
      admin_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      remaining_fee_lists.save(),
      new_receipt.save(),
    ]);
    var is_refund =
      remaining_fee_lists?.paid_fee - remaining_fee_lists?.applicable_fee;
    if (is_refund > 0) {
      const filter_student_refund = admin_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          admin_ins.refundCount += is_refund;
        }
      } else {
        admin_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        admin_ins.refundCount += is_refund;
      }
    }
    await admin_ins.save();
  }
  catch (e) {
    console.log(e)
  }
}

exports.fee_reordering_direct_student_payload_exist_query = async (
  students,
  institute,
  batchSet,
  finance,
  admission
) => {
  try {
    for (var ref of batchSet) {
      var user = await User.findById({ _id: students?.user })
      var apply = await NewApplication.findById({ _id: ref?.appId });
      var structure = await FeeStructure.findById({ _id: ref?.fee_struct })
      var price_student = ref?.amount_student ? parseInt(ref?.amount_student) : -1;
      var price_gov = ref?.amount_gov ? parseInt(ref?.amount_gov) : -1;
      var price_exempt = ref?.amount_exempt ? parseInt(ref?.amount_exempt) : -1;
      var mode_student = price_student > 0 ? "RTGS/NEFT/IMPS" : ""
      var mode_gov = price_gov > 0 ? "Government/Scholarship" : ""
      var mode_exempt = price_exempt > 0 ? "Exempted/Unrecovered" : ""
      var fees_data = await render_new_fees_card(students?._id, apply?._id, structure?._id)
      if (fees_data?.card) {
        var new_remainFee = await RemainingList.findById({ _id: fees_data?.card })
        .populate({
          path: "applicable_card"
        })
        .populate({
          path: "government_card"
        })
        // var pay_remain = new_remainFee?.
        if (price_student > 0) {
          await applicable_fees_query(
            students,
            user,
            apply,
            admission,
            finance,
            institute,
            new_remainFee,
            price_student,
            mode_student,
            structure
          )
        }
        if (price_exempt > 0) {
          await applicable_fees_query(
            students,
            user,
            apply,
            admission,
            finance,
            institute,
            new_remainFee,
            price_exempt,
            mode_exempt,
            structure
          )
        }
        if (price_gov > 0) {
          await government_fees_query(
            students,
            user,
            apply,
            admission,
            finance,
            institute,
            new_remainFee,
            mode_gov,
            mode_student,
            structure
          )
        }
        new_remainFee.remark = new_remainFee?.remark ? `${new_remainFee.remark} ${ref?.remark}` : `${ref?.remark}`
        user.applyApplication.push(apply._id);
        await Promise.all([ new_remainFee.save(), user.save() ])
      }
      else {
        console.log("Problem in Fees Card Creation")
      }
    }
  } catch (e) {
    console.log(e);
  }
};