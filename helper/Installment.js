const FeeMaster = require("../models/Finance/FeeMaster");

exports.add_all_installment = async (arg1, arg2, arg3, amount, arg4) => {
  try {
    if (arg4?.fee_structure.two_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount:
          arg4?.fee_structure.one_installments.fees -
          amount +
          arg4?.fee_structure.two_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Second Installment",
        isEnable: true,
        dueDate: arg4?.fee_structure.two_installments.dueDate,
      });
    }
    if (arg4?.fee_structure.three_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount: arg4?.fee_structure.three_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Third Installment",
        dueDate: arg4?.fee_structure.three_installments.dueDate,
      });
    }
    if (arg4?.fee_structure.four_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount: arg4?.fee_structure.four_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Four Installment",
        dueDate: arg4?.fee_structure.four_installments.dueDate,
      });
    }
    if (arg4?.fee_structure.five_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount: arg4?.fee_structure.five_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Five Installment",
        dueDate: arg4?.fee_structure.five_installments.dueDate,
      });
    }
    if (arg4?.fee_structure.six_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount: arg4?.fee_structure.six_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Six Installment",
        dueDate: arg4?.fee_structure.six_installments.dueDate,
      });
    }
    if (arg4?.fee_structure.seven_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount: arg4?.fee_structure.seven_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Seven Installment",
        dueDate: arg4?.fee_structure.seven_installments.dueDate,
      });
    }
    if (arg4?.fee_structure.eight_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount: arg4?.fee_structure.eight_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Eight Installment",
        dueDate: arg4?.fee_structure.eight_installments.dueDate,
      });
    }
    if (arg4?.fee_structure.nine_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount: arg4?.fee_structure.nine_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Nine Installment",
        dueDate: arg4?.fee_structure.nine_installments.dueDate,
      });
    }
    if (arg4?.fee_structure.ten_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount: arg4?.fee_structure.ten_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Ten Installment",
        dueDate: arg4?.fee_structure.ten_installments.dueDate,
      });
    }
    if (arg4?.fee_structure.eleven_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount: arg4?.fee_structure.eleven_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Eleven Installment",
        dueDate: arg4?.fee_structure.eleven_installments.dueDate,
      });
    }
    if (arg4?.fee_structure.tweleve_installments.fees > 0) {
      arg3.remaining_array.push({
        remainAmount: arg4?.fee_structure.tweleve_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Tweleve Installment",
        dueDate: arg4?.fee_structure.tweleve_installments.dueDate,
      });
    }
    await arg3.save();
  } catch (e) {
    console.log(e, "From All Installment");
  }
};

const second_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_two = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Second Installment"
        ) {
          ele.status = "Paid";
          flex_two = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Third Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_two;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "2") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_two,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
      if (
        arg2.two_installments.fees != amount &&
        arg5.admissionRemainFeeCount >= amount
      ) {
      }
    }
    await Promise.all([arg5.save(), arg4.save(), arg1.save()]);
  } catch (e) {
    console.log(e);
  }
};

const third_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_three = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Third Installment"
        ) {
          ele.status = "Paid";
          flex_three = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Four Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_three;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "3") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_three,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
    }
    if (
      arg2.three_installments.fees != amount &&
      arg5.admissionRemainFeeCount >= amount
    ) {
    }
    await Promise.all([arg5.save(), arg1.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const four_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_four = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Four Installment"
        ) {
          ele.status = "Paid";
          flex_four = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Five Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_four;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "4") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_four,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
    }
    if (
      arg2.four_installments.fees != amount &&
      arg5.admissionRemainFeeCount >= amount
    ) {
    }
    await Promise.all([arg1.save(), arg5.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const five_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_five = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Five Installment"
        ) {
          ele.status = "Paid";
          flex_five = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Six Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_five;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "5") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_five,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
    }
    if (
      arg2.five_installments.fees != amount &&
      arg5.admissionRemainFeeCount >= amount
    ) {
    }
    await Promise.all([arg1.save(), arg5.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const six_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_six = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Six Installment"
        ) {
          ele.status = "Paid";
          flex_six = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Seven Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_six;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "6") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_six,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
    }
    if (
      arg2.six_installments.fees != amount &&
      arg5.admissionRemainFeeCount >= amount
    ) {
    }
    await Promise.all([arg1.save(), arg5.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const seven_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_seven = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Seven Installment"
        ) {
          ele.status = "Paid";
          flex_seven = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Eight Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_seven;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "7") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_seven,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
    }
    if (
      arg2.seven_installments.fees != amount &&
      arg5.admissionRemainFeeCount >= amount
    ) {
    }
    await Promise.all([arg1.save(), arg5.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const eight_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_eight = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Eight Installment"
        ) {
          ele.status = "Paid";
          flex_eight = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Nine Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_eight;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "8") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_eight,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
    }
    if (
      arg2.eight_installments.fees != amount &&
      arg5.admissionRemainFeeCount >= amount
    ) {
    }
    await Promise.all([arg1.save(), arg5.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const nine_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_nine = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Nine Installment"
        ) {
          ele.status = "Paid";
          flex_nine = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Ten Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_nine;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "9") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_nine,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
    }
    if (
      arg2.nine_installments.fees != amount &&
      arg5.admissionRemainFeeCount >= amount
    ) {
    }
    await Promise.all([arg1.save(), arg5.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const ten_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_ten = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Ten Installment"
        ) {
          ele.status = "Paid";
          flex_ten = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Eleven Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_ten;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "10") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_ten,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
    }
    if (
      arg2.ten_installments.fees != amount &&
      arg5.admissionRemainFeeCount >= amount
    ) {
    }
    await Promise.all([arg1.save(), arg5.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const eleven_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_eleven = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Eleven Installment"
        ) {
          ele.status = "Paid";
          flex_eleven = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Tweleve Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_eleven;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "11") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_eleven,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
    }
    if (
      arg2.eleven_installments.fees != amount &&
      arg5.admissionRemainFeeCount >= amount
    ) {
    }
    await Promise.all([arg1.save(), arg5.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const tweleve_payable = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    var flex_tweleve = 0;
    if (arg1?.remaining_array?.length > 0) {
      arg1?.remaining_array.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Tweleve Installment"
        ) {
          ele.status = "Paid";
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.total_admission_fees;
          ele.isEnable = true;
          ele.fee_receipt = receipt_args?._id;
        }
        flex_tweleve = ele.remainAmount - amount;
      });
    }
    if (arg2.total_installments == "12") {
      if (arg1.remaining_fee > 0) {
        arg1.remaining_array.push({
          remainAmount: flex_tweleve,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      } else {
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
      }
    }
    if (
      arg2.tweleve_installments.fees != amount &&
      arg5.admissionRemainFeeCount >= amount
    ) {
    }
    await Promise.all([arg1.save(), arg5.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const installment_remain = async (
  arg1,
  arg2,
  mode,
  amount,
  arg4,
  arg5,
  receipt_args,
  app_args,
  ins_args
) => {
  try {
    const filter_student_install = arg1?.remaining_array?.filter((stu) => {
      if (
        `${stu.appId}` === `${app_args._id}` &&
        stu.status === "Not Paid" &&
        stu.installmentValue === "Installment Remain"
      )
        return stu;
    });

    for (var ref of filter_student_install) {
      if (amount < ref?.remainAmount) {
        arg1.remaining_array.push({
          remainAmount: ref.remainAmount - amount,
          appId: app_args._id,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
        ref.status = "Paid";
        ref.remainAmount = amount;
        ref.installmentValue = "Installment Paid";
        ref.mode = mode;
        ref.fee_receipt = receipt_args?._id;
      } else {
        ref.status = "Paid";
        ref.installmentValue = "All Installment Paid";
        ref.mode = mode;
        arg4.remainingFee.pull(arg5._id);
        arg1.status = "Paid";
        ref.fee_receipt = receipt_args?._id;
      }
    }
    await Promise.all([arg1.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.render_installment = async (
  type,
  student,
  mode,
  price,
  admin_ins,
  structure,
  remainList,
  receipt,
  apply,
  institute
) => {
  try {
    if (type === "Second Installment") {
      await second_payable(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        receipt,
        apply,
        institute
      );
    } else if (type === "Third Installment") {
      await third_payable(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        receipt,
        apply,
        institute
      );
    } else if (type === "Four Installment") {
      await four_payable(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        receipt,
        apply,
        institute
      );
    } else if (type === "Five Installment") {
      await five_payable(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        receipt,
        apply,
        institute
      );
    } else if (type === "Six Installment") {
      await six_payable(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        apply,
        institute
      );
    } else if (type === "Seven Installment") {
      await seven_payable(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        receipt,
        apply,
        institute
      );
    } else if (type === "Eight Installment") {
      await eight_payable(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        receipt,
        apply,
        institute
      );
    } else if (type === "Nine Installment") {
      await nine_payable(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        receipt,
        apply,
        institute
      );
    } else if (type === "Ten Installment") {
      await ten_payable(remainList, structure, mode, price, admin_ins, student);
    } else if (type === "Eleven Installment") {
      await eleven_payable(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        receipt,
        apply,
        institute
      );
    } else if (type === "Tweleve Installment") {
      await tweleve_payable(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        receipt,
        apply,
        institute
      );
    } else if (type === "Installment Remain") {
      await installment_remain(
        remainList,
        structure,
        mode,
        price,
        admin_ins,
        student,
        receipt,
        apply,
        institute
      );
    } else {
    }
  } catch (e) {
    console.log(e, "From Render Installment");
  }
};

exports.add_total_installment = (student) => {
  try {
    var total = 0;
    total =
      total +
      student?.fee_structure?.one_installments?.fees +
      student?.fee_structure?.two_installments?.fees +
      student?.fee_structure?.three_installments?.fees +
      student?.fee_structure?.four_installments?.fees +
      student?.fee_structure?.five_installments?.fees +
      student?.fee_structure?.six_installments?.fees +
      student?.fee_structure?.seven_installments?.fees +
      student?.fee_structure?.eight_installments?.fees +
      student?.fee_structure?.nine_installments?.fees +
      student?.fee_structure?.ten_installments?.fees +
      student?.fee_structure?.eleven_installments?.fees +
      student?.fee_structure?.tweleve_installments?.fees;

    return total;
  } catch (e) {
    console.log(e);
  }
};

exports.remain_one_time_query = async (
  ads_args,
  remain_args,
  apply_args,
  ins_args,
  student_args,
  price,
  receipt_args
) => {
  try {
    const filter_student_install = remain_args?.remaining_array?.filter(
      (stu) => {
        if (
          `${stu.appId}` === `${apply_args._id}` &&
          stu.status === "Not Paid" &&
          stu.installmentValue === "One Time Fees Remain"
        )
          return stu;
      }
    );
    for (var stu of filter_student_install) {
      if (price < stu?.remainAmount) {
        remain_args.remaining_array.push({
          appId: apply_args?._id,
          remainAmount: stu?.remainAmount - price,
          status: "Not Paid",
          instituteId: ins_args?._id,
          installmentValue: "One Time Fees Remain",
          isEnable: true,
        });
        stu.remainAmount = price;
        stu.status = "Paid";
        stu.installmentValue = "One Time Fees";
        stu.fee_receipt = receipt_args?._id;
      } else {
        stu.remainAmount = price;
        stu.status = "Paid";
        stu.installmentValue = "One Time Fees";
        remain_args.status = "Paid";
        stu.fee_receipt = receipt_args?._id;
        ads_args.remainingFee.pull(student_args?._id);
      }
    }
    await Promise.all([remain_args.save(), ads_args.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.remain_one_time_query_government = async (
  ads_args,
  remain_args,
  apply_args,
  ins_args,
  student_args,
  price,
  receipt_args
) => {
  try {
    const filter_student_install = remain_args?.remaining_array?.filter(
      (stu) => {
        if (`${stu.appId}` === `${apply_args._id}` && stu.status === "Not Paid")
          return stu;
      }
    );
    for (var stu of filter_student_install) {
      stu.remainAmount = price;
      stu.status = "Paid";
      stu.mode = receipt_args?.fee_payment_mode;
      stu.installmentValue = stu.installmentValue;
      remain_args.status = "Paid";
      stu.fee_receipt = receipt_args?._id;
      ads_args.remainingFee.pull(student_args?._id);
    }
    await Promise.all([remain_args.save(), ads_args.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.remain_government_installment = async (
  ads_args,
  remain_args,
  apply_args,
  ins_args,
  student_args,
  price,
  receipt_args,
  type
) => {
  try {
    const filter_student_install = remain_args?.remaining_array?.filter(
      (stu) => {
        if (`${stu.appId}` === `${apply_args._id}` && stu.status === "Not Paid")
          return stu;
      }
    );
    var holding_price = 0;
    for (var ref = 0; ref < filter_student_install?.length; ref++) {
      if (filter_student_install[ref].installmentValue === type) {
        if (filter_student_install[ref].remainAmount < price) {
          holding_price += price - filter_student_install[ref].remainAmount;
          filter_student_install[ref].status = "Paid";
          filter_student_install[ref].mode = receipt_args?.fee_payment_mode;
          filter_student_install[ref].fee_receipt = receipt_args?._id;
        } else {
          var valid_amount = filter_student_install[ref].remainAmount - price;
          filter_student_install[ref].remainAmount = price;
          filter_student_install[ref].status = "Paid";
          filter_student_install[ref].mode = receipt_args?.fee_payment_mode;
          filter_student_install[ref].fee_receipt = receipt_args?._id;
          remain_args.remaining_array.push({
            remainAmount: valid_amount,
            appId: filter_student_install[ref].appId,
            status: "Not Paid",
            instituteId: filter_student_install[ref].instituteId,
            installmentValue:
              type === "Installment Remain" ? "Installment Remain" : type,
            isEnable: true,
          });
        }
      } else {
        if (filter_student_install[ref].remainAmount < holding_price) {
          holding_price +=
            holding_price - filter_student_install[ref].remainAmount;
          filter_student_install[ref].status = "Paid";
          filter_student_install[ref].mode = receipt_args?.fee_payment_mode;
          filter_student_install[ref].fee_receipt = receipt_args?._id;
        } else {
          var valid_amount = filter_student_install[ref].remainAmount - price;
          filter_student_install[ref].remainAmount = price;
          filter_student_install[ref].status = "Paid";
          filter_student_install[ref].mode = receipt_args?.fee_payment_mode;
          filter_student_install[ref].fee_receipt = receipt_args?._id;
          remain_args.remaining_array.push({
            remainAmount: valid_amount,
            appId: filter_student_install[ref].appId,
            status: "Not Paid",
            instituteId: filter_student_install[ref].instituteId,
            installmentValue:
              type === "Installment Remain" ? "Installment Remain" : type,
            isEnable: true,
          });
        }
      }
    }
    student_args.fee_receipt = receipt_args?._id;
    // for(var ele of filter_student_install){
    //   if(ele.status === "Not Paid"){

    //   }
    //   else{
    //   remain_args.status = "Paid";
    //   ads_args.remainingFee.pull(student_args?._id);
    //   }
    // }
    await Promise.all([remain_args.save(), ads_args.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.exempt_installment = async (
  pay_type,
  remain_args,
  student_args,
  admin_args,
  apply_args,
  finance_args,
  price,
  receipt_args
) => {
  try {
    var real_price = 0;
    var imagine_price = 0;
    const filter_student_install = remain_args?.remaining_array?.filter(
      (stu) => {
        if (`${stu.appId}` === `${apply_args._id}` && stu.status === "Not Paid")
          return stu;
      }
    );
    for (var ref of filter_student_install) {
      ref.status = "Paid";
      ref.exempt_status = "Exempted";
      ref.fee_receipt = receipt_args?._id;
      await ref.save();
      real_price += ref?.remainAmount;
    }
    imagine_price -= price;
    admin_args.exemptAmount += real_price;
    apply_args.exemptAmount += real_price;
    finance_args.financeExemptBalance += real_price;
    if (admin_args?.remainingFeeCount >= imagine_price) {
      admin_args.remainingFeeCount -= imagine_price;
    }
    if (apply_args?.remainingFee >= imagine_price) {
      apply_args.remainingFee -= imagine_price;
    }
    if (pay_type === "Exempted/Unrecovered") {
      finance_args.exempt_receipt.push(receipt_args?._id);
      finance_args.exempt_receipt_count += 1;
    }
    remain_args.exempted_fee += real_price;
    remain_args.status = "Paid";
    if (remain_args?.remaining_fee >= real_price) {
      remain_args.remaining_fee -= real_price;
    }
    if (student_args?.admissionRemainFeeCount >= imagine_price) {
      student_args.admissionRemainFeeCount -= imagine_price;
    }
    student_args.admissionPaidFeeCount += imagine_price;
    admin_args.remainingFee.pull(student_args?._id);
    await Promise.all([
      admin_args.save(),
      finance_args.save(),
      student_args.save(),
      apply_args.save(),
      receipt_args.save(),
      remain_args.save(),
    ]);
  } catch (e) {
    console.log(e);
  }
};

exports.set_fee_head_query = async (
  student_args,
  price,
  apply_args,
  receipt_args,
  direct_args
) => {
  try {
    var price_query = price;
    if (direct_args) {
      var parent_head = {
        ...direct_args?.fees_heads,
        count: direct_args?.fees_heads?.length,
      };
    } else {
      var parent_head = {
        ...student_args.fee_structure?.fees_heads,
        count: student_args.fee_structure?.fees_heads?.length,
      };
    }
    var exist_filter_student_heads = student_args?.active_fee_heads?.filter(
      (stu) => {
        if (`${stu.appId}` === `${apply_args._id}`) return stu;
      }
    );
    if (exist_filter_student_heads?.length > 0) {
    } else {
      for (var i = 0; i < parent_head?.count; i++) {
        var one_master = await FeeMaster.findOne({
          $and: [
            { _id: parent_head[`${i}`]?.master },
            { finance: student_args?.fee_structure?.finance },
          ],
        });
        console.log("find Master", one_master?._id);
        if (one_master) {
          if (one_master?.paid_student?.includes(`${student_args?._id}`)) {
          } else {
            one_master.paid_student.push(student_args?._id);
            one_master.paid_student_count += 1;
          }
          if (`${one_master?.master_status}` === "Linked") {
            console.log("Master Linked", one_master?._id);
            student_args.deposit_pending_amount +=
              price_query >= parent_head[`${i}`]?.head_amount
                ? parent_head[`${i}`].head_amount
                : price_query;
            one_master.deposit_amount +=
              price_query >= parent_head[`${i}`]?.head_amount
                ? parent_head[`${i}`].head_amount
                : price_query;
          }
          await one_master.save();
        }
        console.log("update Master", one_master);
        student_args.active_fee_heads.push({
          appId: apply_args?._id,
          head_name: parent_head[`${i}`]?.head_name,
          applicable_fee: parent_head[`${i}`]?.head_amount,
          remain_fee:
            price_query >= parent_head[`${i}`]?.head_amount
              ? 0
              : parent_head[`${i}`].head_amount - price_query,
          paid_fee:
            price_query >= parent_head[`${i}`]?.head_amount
              ? parent_head[`${i}`].head_amount
              : price_query,
          fee_structure: student_args?.fee_structure?._id,
          master: one_master?._id,
          original_paid:
            price_query >= parent_head[`${i}`]?.head_amount
              ? parent_head[`${i}`].head_amount
              : price_query,
        });
        price_query =
          price_query >= parent_head[`${i}`].head_amount
            ? price_query - parent_head[`${i}`].head_amount
            : 0;
      }
      receipt_args.fee_flow = "FEE_HEADS";
      for (var ref of student_args?.active_fee_heads) {
        receipt_args.fee_heads.push({
          head_id: ref?._id,
          head_name: ref?.head_name,
          paid_fee: ref?.paid_fee,
          remain_fee: ref?.remain_fee,
          applicable_fee: ref?.applicable_fee,
          fee_structure: ref?.fee_structure,
          master: ref?.master,
          original_paid: ref?.original_paid,
        });
      }
      student_args.fee_receipt.push(receipt_args?._id);
      await Promise.all([student_args.save(), receipt_args.save()]);
      price_query = 0;
    }
  } catch (e) {
    console.log(e);
  }
};

exports.update_fee_head_query = async (
  student_args,
  price,
  apply_args,
  receipt_args
) => {
  try {
    var price_query = price;
    const filter_student_heads = student_args?.active_fee_heads?.filter(
      (stu) => {
        if (`${stu.appId}` === `${apply_args._id}` && stu.remain_fee > 0)
          return stu;
      }
    );

    for (var ele of filter_student_heads) {
      var one_master = await FeeMaster.findOne({
        $and: [{ _id: ele?.master }, { master_status: "Linked" }],
      });
      if (one_master) {
        student_args.deposit_pending_amount +=
          price_query >= ele.remain_fee ? ele.remain_fee : price_query;
        one_master.deposit_amount +=
          price_query >= ele.remain_fee ? ele.remain_fee : price_query;
        await one_master.save();
      }
      if (ele?.paid_fee == ele?.applicable_fee) {
      } else {
        ele.original_paid =
          price_query >= ele.remain_fee ? ele.remain_fee : price_query;
        ele.paid_fee +=
          price_query >= ele.remain_fee ? ele.remain_fee : price_query;
        price_query =
          price_query >= ele.remain_fee ? price_query - ele.remain_fee : 0;
        ele.remain_fee =
          ele.paid_fee == ele.applicable_fee
            ? 0
            : ele.applicable_fee - ele.paid_fee;
      }
    }
    await student_args.save();
    receipt_args.fee_flow = "FEE_HEADS";
    for (var ref of student_args?.active_fee_heads) {
      receipt_args.fee_heads.push({
        head_id: ref?._id,
        head_name: ref?.head_name,
        paid_fee: ref?.paid_fee,
        remain_fee: ref?.remain_fee,
        applicable_fee: ref?.applicable_fee,
        fee_structure: ref?.fee_structure,
        master: ref?.master,
        original_paid: ref?.original_paid,
      });
    }
    student_args.fee_receipt.push(receipt_args?._id);
    await receipt_args.save();
    return student_args;
  } catch (e) {
    console.log(e);
  }
};

exports.set_fee_head_query_retro = async (
  student_args,
  price,
  apply_args,
  receipt_args,
  direct_args
) => {
  try {
    var price_query = price;
    if (direct_args) {
      var parent_head = {
        ...direct_args?.fees_heads,
        count: direct_args?.fees_heads?.length,
      };
    } else {
      var parent_head = {
        ...student_args.fee_structure?.fees_heads,
        count: student_args.fee_structure?.fees_heads?.length,
      };
    }
    for (var i = 0; i < parent_head?.count; i++) {
      var one_master = await FeeMaster.findOne({
        $and: [
          { _id: parent_head[`${i}`]?.master },
          { finance: student_args?.fee_structure?.finance },
        ],
      });
      if (one_master) {
        if (one_master?.paid_student?.includes(`${student_args?._id}`)) {
        } else {
          one_master.paid_student.push(student_args?._id);
          one_master.paid_student_count += 1;
        }
        if (one_master?.master_status === "Linked") {
          student_args.deposit_pending_amount =
            price_query >= parent_head[`${i}`]?.head_amount
              ? parent_head[`${i}`].head_amount
              : price_query;
          one_master.deposit_amount +=
            price_query >= parent_head[`${i}`]?.head_amount
              ? parent_head[`${i}`].head_amount
              : price_query;
        }
        await one_master.save();
      }
      student_args.active_fee_heads.push({
        appId: apply_args?._id,
        head_name: parent_head[`${i}`]?.head_name,
        applicable_fee: parent_head[`${i}`]?.head_amount,
        remain_fee:
          price_query >= parent_head[`${i}`]?.head_amount
            ? 0
            : parent_head[`${i}`].head_amount - price_query,
        paid_fee:
          price_query >= parent_head[`${i}`]?.head_amount
            ? parent_head[`${i}`].head_amount
            : price_query,
        fee_structure: student_args?.fee_structure?._id,
        master: one_master?._id,
        original_paid:
          price_query >= parent_head[`${i}`]?.head_amount
            ? parent_head[`${i}`].head_amount
            : price_query,
      });
      price_query =
        price_query >= parent_head[`${i}`].head_amount
          ? price_query - parent_head[`${i}`].head_amount
          : 0;
    }
    for (var ele of receipt_args) {
      ele.fee_flow = "FEE_HEADS";
      for (var ref of student_args?.active_fee_heads) {
        ele.fee_heads.push({
          head_id: ref?._id,
          head_name: ref?.head_name,
          paid_fee: ref?.paid_fee,
          remain_fee: ref?.remain_fee,
          applicable_fee: ref?.applicable_fee,
          fee_structure: ref?.fee_structure,
          master: ref?.master,
          original_paid: ref?.original_paid,
        });
      }
      student_args.fee_receipt.push(ele?._id);
      await ele.save();
    }
    await student_args.save();
    price_query = 0;
  } catch (e) {
    console.log(e);
  }
};

const retro_installment_sequence_query = async (new_fee_args) => {
  try {
    const install_obj = {
      1: "First Installment",
      2: "Second Installment",
      3: "Third Installment",
      4: "Four Installment",
      5: "Five Installment",
      6: "Six Installment",
      7: "Seven Installment",
      8: "Eight Installment",
      9: "Nine Installment",
      10: "Ten Installment",
      11: "Eleven Installment",
      12: "Tweleve Installment",
    };
    var install_count =
      new_fee_args?.total_installments === "0"
        ? 0
        : parseInt(new_fee_args?.total_installments);
    var get_obj;
    var custom_obj = [];
    for (var i = 1; i <= install_count; i++) {
      var query = install_obj[i];
      get_obj = { ...get_obj, query, key: "key" };
      custom_obj.push(get_obj);
    }
    return custom_obj;
  } catch (e) {
    console.log(e);
  }
};

const buildObject = async (arr) => {
  var obj = {};
  for (let i = 1; i <= arr.length; i++) {
    var { query } = arr[i];
    obj[`key${i}`] = query;
  }
  return obj;
};

exports.set_retro_installment = async (
  ins_args,
  new_fee_args,
  app_args,
  remain_args
) => {
  try {
    const arr_query = await retro_installment_sequence_query(new_fee_args);
    var results = await buildObject(arr_query);
    for (var ref of remain_args?.remaining_array) {
      var index = remain_args?.remaining_array?.indexOf(ref);
      if (
        ref?.installmentValue === results[`key${index + 1}`] &&
        ref?.status === "Not Paid"
      ) {
        ref.remainAmount += remain_args.remaining_fee;
      } else if (
        ref?.installmentValue === "Installment Remain" &&
        ref?.status === "Not Paid"
      ) {
        ref.remainAmount += remain_args.remaining_fee;
      } else {
        if (remain_args.remaining_fee > 0) {
          remain_args?.remaining_array.push({
            remainAmount: remain_args.remaining_fee,
            appId: app_args?._id,
            instituteId: ins_args?._id,
            isEnable: true,
            installmentValue: "Installment Remain",
          });
        }
      }
    }
    await remain_args.save();
  } catch (e) {
    console.log(e);
  }
};
