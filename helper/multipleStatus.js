const invokeMemberTabNotification = require("../Firebase/MemberTab");
const Status = require("../models/Admission/status");
const Student = require("../models/Student");
const RemainingList = require("../models/Admission/RemainingList");
const OrderPayment = require("../models/RazorPay/orderPayment");
const {
  add_all_installment,
  add_total_installment,
  set_fee_head_query,
} = require("./Installment");

exports.insert_multiple_status = async (args, uargs, iargs, sid) => {
  try {
    const statusArray = [
      {
        content: `You have applied for ${args.applicationName} has been filled successfully.Stay updated to check status of your application.Tap here to see username ${uargs?.username}`,
        applicationId: args?._id,
        instituteId: iargs?._id,
      },
      {
        content: `You have been selected for ${args.applicationName}. Confirm your admission`,
        applicationId: args?._id,
        instituteId: iargs?._id,
        for_selection: "No",
        studentId: sid,
        admissionFee: args.admissionFee,
        payMode: "offline",
        isPaid: "Paid",
      },
      {
        content: `Your admission is on hold please visit ${iargs.insName}, ${iargs.insDistrict}. with required fees or contact institute if neccessory`,
        applicationId: args?._id,
        instituteId: iargs?._id,
      },
      {
        content: `Welcome to Institute ${iargs.insName}, ${iargs.insDistrict}.Please visit with Required Documents to confirm your admission`,
        applicationId: args?._id,
        instituteId: iargs?._id,
        document_visible: true,
      },
      {
        content: `Your seat has been confirmed, You will be alloted your class shortly, Stay Update!`,
        applicationId: args?._id,
        instituteId: iargs?._id,
      },
    ];

    Status.insertMany(statusArray)
      .then((value) => {
        // for (var val of value) {
        uargs.applicationStatus.push(...value);
        // }
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
      price > student?.fee_structure?.one_installments?.fees
    ) {
      is_install = false;
    } else {
      is_install = true;
    }
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    s_admin.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${s_admin.invoice_count}`;
    var total_amount = add_total_installment(student);
    if (price > 0 && !is_install) {
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: student?.fee_structure?.total_admission_fees,
      });
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
      new_remainFee.paid_fee += price;
      new_remainFee.remaining_fee +=
        student?.fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      admission.remainingFee.push(student._id);
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
      });
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
      new_remainFee.paid_fee += price;
      new_remainFee.remaining_fee += total_amount - price;
      student.remainingFeeList.push(new_remainFee?._id);
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
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
    await set_fee_head_query(student, price, apply);
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
    order.payment_invoice_number = s_admin.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    await Promise.all([new_receipt.save(), new_remainFee.save(), order.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.fee_reordering_direct_student = async (
  price,
  stu_query,
  apply,
  institute,
  admission
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
      price > student?.fee_structure?.one_installments?.fees
    ) {
      is_install = false;
    } else {
      is_install = true;
    }
    var total_amount = add_total_installment(student);
    if (price > 0 && !is_install) {
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: student?.fee_structure?.total_admission_fees,
      });
      new_remainFee.paid_fee += price;
      new_remainFee.remaining_fee +=
        student?.fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      new_remainFee.student = student?._id;
      admission.remainingFee.push(student._id);
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
      });
      new_remainFee.paid_fee += price;
      new_remainFee.remaining_fee += total_amount - price;
      student.remainingFeeList.push(new_remainFee?._id);
      new_remainFee.student = student?._id;
      await add_all_installment(
        apply,
        institute._id,
        new_remainFee,
        price,
        student
      );
    }
    student.admissionPaidFeeCount += price;
    student.paidFeeList.push({
      paidAmount: price,
      appId: apply._id,
    });
    await set_fee_head_query(student, price, apply);
    apply.allottedApplication.push({
      student: student._id,
      payment_status: "Offline",
      install_type: is_install
        ? "First Installment Paid"
        : "One Time Fees Paid",
      fee_remain: is_install
        ? total_amount - price
        : student?.fee_structure?.total_admission_fees - price,
    });
    apply.allotCount += 1;
    await new_remainFee.save();
  } catch (e) {
    console.log(e);
  }
};
