const invokeMemberTabNotification = require("../Firebase/MemberTab");
const Status = require("../models/Admission/status");
const { add_all_installment, add_total_installment } = require("./Installment");

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
      },
      {
        content: `Your seat has been confirmed, You will be alloted your class shortly, Stay Update!`,
        applicationId: args?._id,
        instituteId: iargs?._id,
      },
    ];

    Status.insertMany(statusArray)
      .then((value) => {
        uargs.applicationStatus.push(value._id);
      })
      .catch((e) => {
        console.log("Not Saved Status");
      });
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
  student,
  apply,
  institute,
  finance,
  admission
) => {
  try {
    var total_amount = add_total_installment(apply);
    if (type === "O_T_F" && price > 0) {
      student.remainingFeeList.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "No Installment",
        mode: mode,
        isEnable: true,
      });
      student.admissionRemainFeeCount = 0;
      finance.financeExemptBalance +=
        apply.admissionFee == price ? 0 : apply.admissionFee - price;
      admission.remainingFee.pull(student._id);
      admission.exemptAmount +=
        apply.admissionFee == price ? 0 : apply.admissionFee - price;
      apply.exemptAmount +=
        apply.admissionFee == price ? 0 : apply.admissionFee - price;
    } else if (type === "F_I_P" && price > 0) {
      admission.remainingFee.push(student._id);
      student.admissionRemainFeeCount += total_amount - price;
      apply.remainingFee += total_amount - price;
      admission.remainingFeeCount += total_amount - price;
      student.remainingFeeList.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "First Installment",
        mode: mode,
        isEnable: true,
      });
      await add_all_installment(apply, institute._id, student, price);
      if (apply.total_installments == "1") {
        finance.financeExemptBalance +=
          apply.one_installments.fees == price
            ? 0
            : apply.one_installments.fees - price;
        admission.remainingFee.pull(student._id);
        admission.exemptAmount +=
          apply.admissionFee == price ? 0 : apply.admissionFee - price;
        apply.exemptAmount +=
          apply.admissionFee == price ? 0 : apply.admissionFee - price;
      }
    } else {
    }
    admission.collected_fee += price;
    if (mode === "Offline") {
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
    apply.confirmedApplication.push({
      student: student._id,
      payment_status: mode,
      install_type:
        apply.admissionFee == price
          ? "One Time Fees Paid"
          : "First Installment Paid",
      fee_remain: total_amount - price,
    });
  } catch (e) {
    console.log(e);
  }
};
