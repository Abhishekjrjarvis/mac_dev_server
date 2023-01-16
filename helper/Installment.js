exports.add_all_installment = async (arg1, arg2, arg3, amount) => {
  try {
    if (arg1.two_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount:
          arg1.one_installments.fees - amount + arg1.two_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Second Installment",
        isEnable: true,
        dueDate: arg1.two_installments.dueDate,
      });
    }
    if (arg1.three_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.three_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Third Installment",
        dueDate: arg1.three_installments.dueDate,
      });
    }
    if (arg1.four_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.four_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Four Installment",
        dueDate: arg1.four_installments.dueDate,
      });
    }
    if (arg1.five_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.five_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Five Installment",
        dueDate: arg1.five_installments.dueDate,
      });
    }
    if (arg1.six_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount:
          arg1.one_installments.fees - amount + arg1.six_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Six Installment",
        dueDate: arg1.six_installments.dueDate,
      });
    }
    if (arg1.seven_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.seven_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Seven Installment",
        dueDate: arg1.seven_installments.dueDate,
      });
    }
    if (arg1.eight_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.eight_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Eight Installment",
        dueDate: arg1.eight_installments.dueDate,
      });
    }
    if (arg1.nine_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.nine_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Nine Installment",
        dueDate: arg1.nine_installments.dueDate,
      });
    }
    if (arg1.ten_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.ten_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Ten Installment",
        dueDate: arg1.ten_installments.dueDate,
      });
    }
    if (arg1.eleven_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.eleven_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Eleven Installment",
        dueDate: arg1.eleven_installments.dueDate,
      });
    }
    if (arg1.tweleve_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.tweleve_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Tweleve Installment",
        dueDate: arg1.tweleve_installments.dueDate,
      });
    }
    await arg3.save();
  } catch (e) {
    console.log(e, "From All Installment");
  }
};

const second_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_two = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Second Installment"
        ) {
          ele.status = "Paid";
          flex_two = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
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
      kwargs.financeExemptBalance +=
        arg2.two_installments.fees == amount
          ? 0
          : arg2.two_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
      if (
        arg2.two_installments.fees != amount &&
        arg1.admissionRemainFeeCount >= amount
      ) {
        // arg1.admissionRemainFeeCount -= amount;
      }
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const third_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_three = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Third Installment"
        ) {
          ele.status = "Paid";
          flex_three = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
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
      kwargs.financeExemptBalance +=
        arg2.three_installments.fees == amount
          ? 0
          : arg2.three_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.three_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const four_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_four = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Four Installment"
        ) {
          ele.status = "Paid";
          flex_four = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
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
      kwargs.financeExemptBalance +=
        arg2.four_installments.fees == amount
          ? 0
          : arg2.four_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.four_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const five_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_five = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Five Installment"
        ) {
          ele.status = "Paid";
          flex_five = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
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
      kwargs.financeExemptBalance +=
        arg2.five_installments.fees == amount
          ? 0
          : arg2.five_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.five_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const six_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_six = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Six Installment"
        ) {
          ele.status = "Paid";
          flex_six = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
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
      kwargs.financeExemptBalance +=
        arg2.six_installments.fees == amount
          ? 0
          : arg2.six_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.six_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const seven_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_seven = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Seven Installment"
        ) {
          ele.status = "Paid";
          flex_seven = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
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
      kwargs.financeExemptBalance +=
        arg2.seven_installments.fees == amount
          ? 0
          : arg2.seven_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.seven_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const eight_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_eight = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Eight Installment"
        ) {
          ele.status = "Paid";
          flex_eight = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
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
      kwargs.financeExemptBalance +=
        arg2.eight_installments.fees == amount
          ? 0
          : arg2.eight_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.eight_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const nine_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_nine = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Nine Installment"
        ) {
          ele.status = "Paid";
          flex_nine = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
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
      kwargs.financeExemptBalance +=
        arg2.nine_installments.fees == amount
          ? 0
          : arg2.nine_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.nine_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const ten_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_ten = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Ten Installment"
        ) {
          ele.status = "Paid";
          flex_ten = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
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
      kwargs.financeExemptBalance +=
        arg2.ten_installments.fees == amount
          ? 0
          : arg2.ten_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.ten_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const eleven_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_eleven = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Eleven Installment"
        ) {
          ele.status = "Paid";
          flex_eleven = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
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
      kwargs.financeExemptBalance +=
        arg2.eleven_installments.fees == amount
          ? 0
          : arg2.eleven_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.eleven_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const tweleve_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Tweleve Installment"
        ) {
          ele.status = "Paid";
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "12") {
      kwargs.financeExemptBalance +=
        arg2.tweleve_installments.fees == amount
          ? 0
          : arg2.tweleve_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.tweleve_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

exports.render_installment = async (
  type,
  student,
  apply,
  mode,
  price,
  admin_ins,
  finance
) => {
  try {
    if (type === "Second Installment") {
      await second_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Third Installment") {
      await third_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Four Installment") {
      await four_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Five Installment") {
      await five_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Six Installment") {
      await six_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Seven Installment") {
      await seven_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Eight Installment") {
      await eight_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Nine Installment") {
      await nine_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Ten Installment") {
      await ten_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Eleven Installment") {
      await eleven_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Tweleve Installment") {
      await tweleve_payable(student, apply, mode, price, admin_ins, finance);
    } else {
    }
  } catch (e) {
    console.log(e, "From Render Installment");
  }
};
