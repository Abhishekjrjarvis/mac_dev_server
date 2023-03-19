const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const Notification = require("../../models/notification");
const Student = require("../../models/Student");
const Fees = require("../../models/Fees");
const Checklist = require("../../models/Checklist");
const Finance = require("../../models/Finance");
const User = require("../../models/User");
const Class = require("../../models/Class");
const Status = require("../../models/Admission/status");
const NewApplication = require("../../models/Admission/NewApplication");
const Admission = require("../../models/Admission/Admission");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const Department = require("../../models/Department");
const Participate = require("../../models/ParticipativeEvent/participate");
const BusinessTC = require("../../models/Finance/BToC");
const Transport = require("../../models/Transport/transport");
const Vehicle = require("../../models/Transport/vehicle");
const RemainingList = require("../../models/Admission/RemainingList");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const {
  add_all_installment,
  render_installment,
  add_total_installment,
  exempt_installment,
  set_fee_head_query,
  remain_one_time_query,
  update_fee_head_query,
} = require("../../helper/Installment");

exports.unlockInstituteFunction = async (order, paidBy, tx_amounts) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const institute = await InstituteAdmin.findById({ _id: paidBy });
    const orderPay = await OrderPayment.findById({ _id: order });
    const notify = new Notification({});
    admin.featureAmount = admin.featureAmount + parseInt(tx_amounts);
    admin.activateAccount += 1;
    admin.exploreFeatureList.push(order);
    institute.featurePaymentStatus = "Paid";
    institute.accessFeature = "UnLocked";
    institute.activateStatus = "Activated";
    institute.activateDate = new Date();
    orderPay.payment_to_end_user_id = admin._id;
    orderPay.payment_flag_to = "Credit";
    notify.notifyContent = `Feature Unlock Amount ${institute.insName}/ (Rs.${tx_amounts})  has been paid successfully stay tuned...`;
    notify.notify_hi_content = `फ़ीचर अनलॉक राशि ${institute.insName}/ (Rs.${tx_amounts}) का पेमेंट सफलतापूर्वक कर दिया गया है |`;
    notify.notify_mr_content = `वैशिष्ट्य अनलॉक रक्कम ${institute.insName}/ (रु.${tx_amounts}) यशस्वीरित्या भरली गेली आहे`;
    notify.notifySender = institute._id;
    notify.notifyReceiever = admin._id;
    admin.aNotify.push(notify._id);
    notify.notifyByInsPhoto = institute._id;
    notify.notifyCategory = "Unlock Payment";
    institute.payment_history.push(orderPay._id);
    await Promise.all([
      institute.save(),
      admin.save(),
      orderPay.save(),
      notify.save(),
    ]);
    return `${institute?.name}`;
  } catch (e) {
    console.log(e);
  }
};

exports.feeInstituteFunction = async (
  order,
  paidBy,
  tx_amount,
  tx_amount_charges,
  moduleId,
  is_author
) => {
  try {
    const student = await Student.findById({ _id: paidBy });
    const studentUser = await User.findById({ _id: `${student.user}` });
    const institute = await InstituteAdmin.findById({
      _id: `${student?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    const user = await User.findById({
      _id: `${finance.financeHead.user}`,
    });
    const orderPay = await OrderPayment.findById({ _id: order });
    const classes = await Class.findById({ _id: `${student.studentClass}` });
    const fData = await Fees.findById({ _id: moduleId });
    const checklistData = await Checklist.findById({ _id: moduleId });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const notify = new Notification({});
    if (fData) {
      if (
        fData.studentsList.length >= 1 &&
        fData.studentsList.includes(String(student._id))
      ) {
        //
      } else {
        try {
          student.studentFee.push(fData._id);
          fData.onlineList.push(student._id);
          student.onlineFeeList.push(fData._id);
          student.studentPaidFeeCount += fData.feeAmount;
          if (student.studentRemainingFeeCount >= fData.feeAmount) {
            student.studentRemainingFeeCount -= fData.feeAmount;
          }
          if (is_author) {
            finance.financeBankBalance =
              finance.financeBankBalance + parseInt(tx_amount);
            finance.financeTotalBalance =
              finance.financeTotalBalance + parseInt(tx_amount);
            institute.insBankBalance =
              institute.insBankBalance + parseInt(tx_amount);
          } else {
            institute.adminRepayAmount =
              institute.adminRepayAmount + parseInt(tx_amount);
            admin.returnAmount += tx_amount_charges;
          }
          // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount);
          notify.notifyContent = `${student.studentFirstName} ${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} paid the ${
            fData.feeName
          }/ (Rs.${parseInt(tx_amount)}) successfully`;
          notify.notify_hi_content = `${student.studentFirstName} ${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} ने ${fData.feeName}/ (Rs.${parseInt(
            tx_amount
          )}) का सफलतापूर्वक पेमेंट किया |`;
          notify.notify_mr_content = `${student.studentFirstName} ${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} ने ${fData.feeName}/ (रु.${parseInt(
            tx_amount
          )}) यशस्वीरित्या भरले`;
          notify.notifySender = student._id;
          notify.notifyReceiever = user._id;
          notify.notifyCategory = "Online Fee";
          // institute.iNotify.push(notify._id);
          // notify.institute = institute._id;
          user.uNotify.push(notify._id);
          notify.user = user._id;
          notify.notifyByStudentPhoto = student._id;
          classes.onlineFeeCollection.push({
            fee: parseInt(tx_amount),
            feeId: fData._id,
          });
          studentUser.payment_history.push(order);
          institute.payment_history.push(order);
          orderPay.payment_fee = fData._id;
          orderPay.payment_by_end_user_id = studentUser._id;
          if (fData.gstSlab > 0) {
            var business_data = new BusinessTC({});
            business_data.b_to_c_month = new Date().toISOString();
            business_data.b_to_c_i_slab = parseInt(fData?.gstSlab) / 2;
            business_data.b_to_c_s_slab = parseInt(fData?.gstSlab) / 2;
            business_data.finance = finance._id;
            finance.gst_format.b_to_c.push(business_data?._id);
            business_data.b_to_c_total_amount = parseInt(tx_amount);
            await business_data.save();
          }
          await Promise.all([
            student.save(),
            fData.save(),
            finance.save(),
            institute.save(),
            user.save(),
            notify.save(),
            admin.save(),
            classes.save(),
            studentUser.save(),
            orderPay.save(),
          ]);
        } catch (e) {
          console.log(e);
        }
      }
    } else if (checklistData) {
      if (
        checklistData.studentsList.length >= 1 &&
        checklistData.studentsList.includes(String(student._id))
      ) {
        //
      } else {
        try {
          student.studentPaidFeeCount += checklistData.checklistAmount;
          if (
            student.studentRemainingFeeCount >= checklistData.checklistAmount
          ) {
            student.studentRemainingFeeCount -= checklistData.checklistAmount;
          }
          checklistData.studentsList.push(student._id);
          student.onlineCheckList.push(checklistData._id);
          if (is_author) {
            finance.financeBankBalance =
              finance.financeBankBalance + parseInt(tx_amount);
            finance.financeTotalBalance =
              finance.financeTotalBalance + parseInt(tx_amount);
            institute.insBankBalance =
              institute.insBankBalance + parseInt(tx_amount);
          } else {
            institute.adminRepayAmount =
              institute.adminRepayAmount + parseInt(tx_amount);
            admin.returnAmount += tx_amount_charges;
          }
          // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount);
          notify.notifyContent = `${student.studentFirstName} ${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} paid the ${
            checklistData.checklistName
          }/ (Rs.${parseInt(tx_amount)}) successfully`;
          notify.notify_hi_content = `${student.studentFirstName} ${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} ने ${
            checklistData.checklistName
          }/ (Rs.${parseInt(tx_amount)}) का सफलतापूर्वक पेमेंट किया |`;
          notify.notify_mr_content = `${student.studentFirstName} ${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} ने ${
            checklistData.checklistName
          }/ (रु.${parseInt(tx_amount)}) यशस्वीरित्या भरले`;
          notify.notifySender = student._id;
          notify.notifyReceiever = user._id;
          // institute.iNotify.push(notify._id);
          // notify.institute = institute._id;
          notify.notifyCategory = "Online Fee";
          user.uNotify.push(notify._id);
          notify.user = user._id;
          notify.notifyByStudentPhoto = student._id;
          studentUser.payment_history.push(order);
          institute.payment_history.push(order);
          orderPay.payment_checklist = checklistData._id;
          orderPay.payment_by_end_user_id = studentUser._id;
          if (checklistData.gstSlab > 0) {
            var business_data = new BusinessTC({});
            business_data.b_to_c_month = new Date().toISOString();
            business_data.b_to_c_i_slab = parseInt(checklistData?.gstSlab) / 2;
            business_data.b_to_c_s_slab = parseInt(checklistData?.gstSlab) / 2;
            business_data.finance = finance._id;
            finance.gst_format.b_to_c.push(business_data?._id);
            business_data.b_to_c_total_amount = parseInt(tx_amount);
            await business_data.save();
          }
          await Promise.all([
            student.save(),
            checklistData.save(),
            finance.save(),
            institute.save(),
            user.save(),
            notify.save(),
            admin.save(),
            studentUser.save(),
            orderPay.save(),
          ]);
        } catch (e) {
          console.log(e);
        }
      }
    }
    return `${studentUser?.username}`;
  } catch (e) {
    console.log(e);
  }
};

exports.admissionInstituteFunction = async (
  order,
  paidBy,
  tx_amount_ad,
  tx_amount_ad_charges,
  moduleId,
  statusId,
  paidTo,
  type,
  is_author
) => {
  try {
    var student = await Student.findById({ _id: paidBy }).populate({
      path: "fee_structure",
    });
    var user = await User.findById({ _id: `${student.user}` });
    var apply = await NewApplication.findById({ _id: moduleId });
    var orderPay = await OrderPayment.findById({ _id: order });
    var admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    var ins = await InstituteAdmin.findById({ _id: `${paidTo}` });
    var finance = await Finance.findById({
      _id: `${ins?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    var is_install;
    if (
      parseInt(tx_amount_ad) <= student?.fee_structure?.total_admission_fees &&
      parseInt(tx_amount_ad) > student?.fee_structure?.one_installments?.fees
    ) {
      is_install = false;
    } else {
      is_install = true;
    }
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_name = "Admission Fees";
      business_data.finance = finance._id;
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = parseInt(tx_amount_ad);
      await business_data.save();
    }
    if (statusId) {
      var total_amount = add_total_installment(student);
      const status = await Status.findById({ _id: statusId });
      const aStatus = new Status({});
      const new_receipt = new FeeReceipt({
        fee_payment_mode: "Payment Gateway / Online",
        fee_payment_amount: parseInt(tx_amount_ad),
      });
      new_receipt.student = student?._id;
      new_receipt.fee_transaction_date = new Date();
      new_receipt.application = apply?._id;
      new_receipt.finance = finance?._id;
      admin.invoice_count += 1;
      new_receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${admin.invoice_count}`;
      const notify = new Notification({});
      admission.onlineFee += parseInt(tx_amount_ad);
      admission.collected_fee += parseInt(tx_amount_ad);
      apply.onlineFee += parseInt(tx_amount_ad);
      apply.collectedFeeCount += parseInt(tx_amount_ad);
      finance.financeAdmissionBalance += parseInt(tx_amount_ad);
      student.admissionPaidFeeCount += parseInt(tx_amount_ad);
      if (is_author) {
        finance.financeBankBalance =
          finance.financeBankBalance + parseInt(tx_amount_ad);
        finance.financeTotalBalance =
          finance.financeTotalBalance + parseInt(tx_amount_ad);
        ins.insBankBalance = ins.insBankBalance + parseInt(tx_amount_ad);
      } else {
        admin.returnAmount += tx_amount_ad_charges;
        ins.adminRepayAmount += parseInt(tx_amount_ad);
      }
      // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
      if (parseInt(tx_amount_ad) > 0 && is_install) {
        admission.remainingFee.push(student._id);
        student.admissionRemainFeeCount +=
          total_amount - parseInt(tx_amount_ad);
        apply.remainingFee += total_amount - parseInt(tx_amount_ad);
        admission.remainingFeeCount += total_amount - parseInt(tx_amount_ad);
        var new_remainFee = new RemainingList({
          appId: apply._id,
          applicable_fee: total_amount,
        });
        new_remainFee.remaining_array.push({
          remainAmount: parseInt(tx_amount_ad),
          appId: apply._id,
          status: "Paid",
          instituteId: ins._id,
          installmentValue: "First Installment",
          mode: "online",
          fee_receipt: new_receipt?._id,
        });
        new_remainFee.paid_fee += parseInt(tx_amount_ad);
        new_remainFee.fee_structure = student?.fee_structure?._id;
        new_remainFee.remaining_fee += total_amount - parseInt(tx_amount_ad);
        student.remainingFeeList.push(new_remainFee?._id);
        student.remainingFeeList_count += 1;
        new_remainFee.student = student?._id;
        new_remainFee.fee_receipts.push(new_receipt?._id);
        await add_all_installment(
          apply,
          ins._id,
          new_remainFee,
          parseInt(tx_amount_ad),
          student
        );
      } else if (parseInt(tx_amount_ad) > 0 && !is_install) {
        var new_remainFee = new RemainingList({
          appId: apply._id,
          applicable_fee: student?.fee_structure?.total_admission_fees,
        });
        new_remainFee.remaining_array.push({
          remainAmount: parseInt(tx_amount_ad),
          appId: apply._id,
          status: "Paid",
          instituteId: ins._id,
          installmentValue: "One Time Fees",
          mode: "online",
          fee_receipt: new_receipt?._id,
        });
        new_remainFee.paid_fee += parseInt(tx_amount_ad);
        new_remainFee.fee_structure = student?.fee_structure?._id;
        new_remainFee.remaining_fee +=
          student?.fee_structure?.total_admission_fees - parseInt(tx_amount_ad);
        student.remainingFeeList.push(new_remainFee?._id);
        student.remainingFeeList_count += 1;
        new_remainFee.student = student?._id;
        new_remainFee.fee_receipts.push(new_receipt?._id);
        admission.remainingFee.push(student._id);
        student.admissionRemainFeeCount +=
          student?.fee_structure?.total_admission_fees - parseInt(tx_amount_ad);
        apply.remainingFee +=
          student?.fee_structure?.total_admission_fees - parseInt(tx_amount_ad);
        admission.remainingFeeCount +=
          student?.fee_structure?.total_admission_fees - parseInt(tx_amount_ad);
        const valid_one_time_fees =
          student?.fee_structure?.total_admission_fees -
            parseInt(tx_amount_ad) ==
          0
            ? true
            : false;
        if (valid_one_time_fees) {
          admission.remainingFee.pull(student._id);
        } else {
          new_remainFee.remaining_array.push({
            remainAmount:
              student?.fee_structure?.total_admission_fees -
              parseInt(tx_amount_ad),
            appId: apply._id,
            status: "Not Paid",
            instituteId: institute._id,
            installmentValue: "One Time Fees Remain",
            isEnable: true,
          });
        }
      } else {
      }
      await set_fee_head_query(
        student,
        parseInt(tx_amount_ad),
        apply,
        new_receipt
      );
      for (let app of apply.selectedApplication) {
        if (`${app.student}` === `${student._id}`) {
          app.payment_status = "Online";
          if (is_install) {
            app.install_type = "First Installment Paid";
            app.fee_remain = total_amount - parseInt(tx_amount_ad);
          } else {
            app.install_type = "One Time Fees Paid";
            app.fee_remain =
              student?.fee_structure?.total_admission_fees -
              parseInt(tx_amount_ad);
          }
        } else {
        }
      }
      // for (var match of student.paidFeeList) {
      //   if (`${match.appId}` === `${apply._id}`) {
      //     match.paidAmount += parseInt(tx_amount_ad);
      //   }
      // }
      student.paidFeeList.push({
        paidAmount: parseInt(tx_amount_ad),
        appId: apply._id,
      });
      aStatus.content = `Welcome to Institute ${ins.insName}, ${ins.insDistrict}.Please visit with Required Documents to confirm your admission`;
      aStatus.applicationId = apply._id;
      aStatus.document_visible = true;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = ins._id;
      user.payment_history.push(order);
      (status.payMode = "online"), (status.isPaid = "Paid");
      status.for_selection = "No";
      notify.notifyContent = `${student.studentFirstName} ${
        student.studentMiddleName ? `${student.studentMiddleName} ` : ""
      } ${
        student.studentLastName
      } your transaction is successfull for Admission Fee ${parseInt(
        tx_amount_ad
      )}`;
      notify.notify_hi_content = `${student.studentFirstName} ${
        student.studentMiddleName ? `${student.studentMiddleName} ` : ""
      } ${student.studentLastName} प्रवेश शुल्क ${parseInt(
        tx_amount_ad
      )} के लिए आपका लेन-देन सफल है |`;
      notify.notify_mr_content = `प्रवेश शुल्कासाठी ${
        student.studentFirstName
      } ${student.studentMiddleName ? `${student.studentMiddleName} ` : ""} ${
        student.studentLastName
      } तुमचा व्यवहार यशस्वी झाला आहे ${parseInt(tx_amount_ad)}`;
      notify.notifySender = admission._id;
      notify.notifyReceiever = user._id;
      // ins.iNotify.push(notify._id);
      // notify.institute = ins._id;
      user.uNotify.push(notify._id);
      notify.notifyCategory = "Admission Online Fee";
      notify.user = user._id;
      notify.notifyByStudentPhoto = student._id;
      ins.payment_history.push(order);
      orderPay.payment_admission = apply._id;
      orderPay.payment_by_end_user_id = user._id;
      await Promise.all([
        student.save(),
        user.save(),
        apply.save(),
        finance.save(),
        ins.save(),
        admin.save(),
        status.save(),
        aStatus.save(),
        admission.save(),
        notify.save(),
        orderPay.save(),
        new_receipt.save(),
        new_remainFee.save(),
      ]);
    } else {
      const new_receipt = new FeeReceipt({
        fee_payment_mode: "Payment Gateway / Online",
        fee_payment_amount: parseInt(tx_amount_ad),
      });
      new_receipt.student = student?._id;
      new_receipt.application = apply?._id;
      new_receipt.finance = finance?._id;
      new_receipt.fee_transaction_date = new Date();
      const remaining_fee_lists = await RemainingList.findOne({
        $and: [{ student: student?._id }, { appId: apply?._id }],
      });
      remaining_fee_lists.fee_receipts.push(new_receipt?._id);
      admin.invoice_count += 1;
      new_receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${admin.invoice_count}`;
      await render_installment(
        type,
        student,
        apply,
        "Online",
        parseInt(tx_amount_ad),
        admission,
        student?.fee_structure,
        remaining_fee_lists,
        new_receipt
      );
      remaining_fee_lists.paid_fee += parseInt(tx_amount_ad);
      if (remaining_fee_lists.remaining_fee >= parseInt(tx_amount_ad)) {
        remaining_fee_lists.remaining_fee -= parseInt(tx_amount_ad);
      }
      student.admissionPaidFeeCount += parseInt(tx_amount_ad);
      if (admission?.remainingFeeCount >= parseInt(tx_amount_ad)) {
        admission.remainingFeeCount -= parseInt(tx_amount_ad);
      }
      if (apply?.remainingFee >= parseInt(tx_amount_ad)) {
        apply.remainingFee -= parseInt(tx_amount_ad);
      }
      if (student?.admissionRemainFeeCount >= parseInt(tx_amount_ad)) {
        student.admissionRemainFeeCount -= parseInt(tx_amount_ad);
      }
      // admission.remainingFee.pull(student._id);
      admission.onlineFee += parseInt(tx_amount_ad);
      admission.collected_fee += parseInt(tx_amount_ad);
      apply.onlineFee += parseInt(tx_amount_ad);
      apply.collectedFeeCount += parseInt(tx_amount_ad);
      finance.financeAdmissionBalance += parseInt(tx_amount_ad);
      if (is_author) {
        finance.financeBankBalance =
          finance.financeBankBalance + parseInt(tx_amount_ad);
        finance.financeTotalBalance =
          finance.financeTotalBalance + parseInt(tx_amount_ad);
        ins.insBankBalance = ins.insBankBalance + parseInt(tx_amount_ad);
      } else {
        admin.returnAmount += tx_amount_ad_charges;
        ins.adminRepayAmount += parseInt(tx_amount_ad);
      }
      // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
      await update_fee_head_query(
        student,
        parseInt(tx_amount_ad),
        apply,
        new_receipt
      );
      for (var match of student.paidFeeList) {
        if (`${match.appId}` === `${apply._id}`) {
          match.paidAmount += parseInt(tx_amount_ad);
        }
      }
      if (type === "One Time Fees Remain") {
        await remain_one_time_query(
          admission,
          remaining_fee_lists,
          apply,
          ins,
          student,
          parseInt(tx_amount_ad),
          new_receipt
        );
      }
      if (apply?.allottedApplication?.length > 0) {
        apply?.allottedApplication.forEach((ele) => {
          if (`${ele.student}` === `${student._id}`) {
            ele.paid_status = "Paid";
            ele.second_pay_mode = "Online";
            if (apply?.remainingFee >= parseInt(tx_amount_ad)) {
              apply.remainingFee -= parseInt(tx_amount_ad);
            }
          }
        });
      }
      if (apply?.confirmedApplication?.length > 0) {
        apply?.confirmedApplication.forEach((ele) => {
          if (`${ele.student}` === `${student._id}`) {
            ele.paid_status = "Paid";
            ele.second_pay_mode = "Online";
            if (ele.fee_remain >= parseInt(tx_amount_ad)) {
              ele.fee_remain -= parseInt(tx_amount_ad);
            }
            if (apply?.remainingFee >= parseInt(tx_amount_ad)) {
              apply.remainingFee -= parseInt(tx_amount_ad);
            }
          }
        });
      }
      ins.payment_history.push(order);
      orderPay.payment_admission = apply._id;
      orderPay.payment_by_end_user_id = user._id;
      await Promise.all([
        admission.save(),
        student.save(),
        apply.save(),
        finance.save(),
        ins.save(),
        orderPay.save(),
        admin.save(),
        new_receipt.save(),
        remaining_fee_lists.save(),
      ]);
    }
    return `${user?.username}`;
  } catch (e) {
    console.log(e);
  }
};

exports.participateEventFunction = async (
  order,
  paidBy,
  tx_amount_ad,
  tx_amount_ad_charges,
  moduleId,
  notifyId,
  is_author
) => {
  try {
    const student = await Student.findById({ _id: paidBy });
    const user = await User.findById({ _id: `${student.user}` });
    const event = await Participate.findById({ _id: moduleId });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const orderPay = await OrderPayment.findById({ _id: order });
    const depart = await Department.findById({ _id: `${event.department}` });
    const ins = await InstituteAdmin.findById({ _id: `${depart.institute}` });
    const finance = await Finance.findById({
      _id: `${ins?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    const status = await StudentNotification.findById({ _id: notifyId });
    const notify = new StudentNotification({});
    depart.onlineFee += parseInt(tx_amount_ad);
    event.online_fee += parseInt(tx_amount_ad);
    finance.financeParticipateEventBalance += parseInt(tx_amount_ad);
    // finance.financeTotalBalance += parseInt(tx_amount_ad);
    if (is_author) {
      finance.financeBankBalance =
        finance.financeBankBalance + parseInt(tx_amount_ad);
      finance.financeTotalBalance =
        finance.financeTotalBalance + parseInt(tx_amount_ad);
      ins.insBankBalance = ins.insBankBalance + parseInt(tx_amount_ad);
    } else {
      admin.returnAmount += tx_amount_ad_charges;
      ins.adminRepayAmount += parseInt(tx_amount_ad);
    }
    // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
    status.event_payment_status = "Paid";
    event.apply_student.push(student?._id);
    event.apply_student_count += 1;
    event.event_fee_array.push({
      student: student._id,
      fee_status: "Paid",
    });
    student.eventicipate_event.push(event?._id);
    event.paid_participant += 1;
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      event.event_name
    } ${parseInt(tx_amount_ad)}`;
    notify.notifySender = depart._id;
    notify.notifyReceiever = user._id;
    user.activity_tab.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    notify.notifyType = "Student";
    notify.notifyCategory = "Participate Event Payment";
    notify.redirectIndex = 13;
    notify.participateEventId = event?._id;
    student.notification.push(notify._id);
    user.payment_history.push(order);
    ins.payment_history.push(order);
    orderPay.payment_participate = event._id;
    orderPay.payment_by_end_user_id = user._id;
    await Promise.all([
      student.save(),
      user.save(),
      event.save(),
      finance.save(),
      ins.save(),
      admin.save(),
      status.save(),
      depart.save(),
      notify.save(),
      orderPay.save(),
    ]);
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      "Payment Successfull",
      user._id,
      user.deviceToken,
      "Student",
      notify
    );
    return `${user?.username}`;
  } catch (e) {
    console.log(e);
  }
};

exports.transportFunction = async (
  order,
  paidBy,
  tx_amount_ad,
  tx_amount_ad_charges,
  moduleId,
  is_author
) => {
  try {
    const student = await Student.findById({ _id: paidBy });
    const user = await User.findById({ _id: `${student.user}` });
    const vehicle = await Vehicle.findById({ _id: moduleId });
    const trans = await Transport.findById({ _id: `${vehicle?.transport}` });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const orderPay = await OrderPayment.findById({ _id: order });
    const ins = await InstituteAdmin.findById({ _id: `${trans.institute}` });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    const notify = new StudentNotification({});
    if (is_author) {
      finance.financeBankBalance =
        finance.financeBankBalance + parseInt(tx_amount_ad);
      finance.financeTotalBalance =
        finance.financeTotalBalance + parseInt(tx_amount_ad);
      ins.insBankBalance = institute.insBankBalance + parseInt(tx_amount_ad);
    } else {
      admin.returnAmount += tx_amount_ad_charges;
      ins.adminRepayAmount += parseInt(tx_amount_ad);
    }
    // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
    trans.online_fee += parseInt(tx_amount_ad);
    // trans.collected_fee += parseInt(tx_amount_ad);
    if (trans.remaining_fee > parseInt(tx_amount_ad)) {
      trans.remaining_fee -= parseInt(tx_amount_ad);
    }
    if (vehicle?.remaining_fee >= parseInt(tx_amount_ad)) {
      vehicle.remaining_fee -= parseInt(tx_amount_ad);
    }
    if (student?.vehicleRemainFeeCount >= parseInt(tx_amount_ad)) {
      student.vehicleRemainFeeCount -= parseInt(tx_amount_ad);
    }
    student.vehiclePaidFeeCount += parseInt(tx_amount_ad);
    trans.fund_history.push({
      student: student?._id,
      is_install: false,
      amount: parseInt(tx_amount_ad),
      mode: "Online",
    });
    student.vehicle_payment_status.push({
      vehicle: vehicle?._id,
      status: "Paid",
      amount: parseInt(tx_amount_ad),
    });
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      vehicle.vehicle_number
    } ${parseInt(tx_amount_ad)} Fees`;
    notify.notifySender = trans._id;
    notify.notifyReceiever = user._id;
    user.activity_tab.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    notify.notifyType = "Student";
    notify.notifyCategory = "Transport Payment";
    notify.redirectIndex = 27;
    student.notification.push(notify._id);
    user.payment_history.push(order);
    ins.payment_history.push(order);
    orderPay.payment_transport = vehicle._id;
    orderPay.payment_by_end_user_id = user._id;
    await Promise.all([
      student.save(),
      user.save(),
      trans.save(),
      finance.save(),
      ins.save(),
      admin.save(),
      notify.save(),
      orderPay.save(),
      vehicle.save(),
    ]);
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      "Transport Payment Successfull",
      user._id,
      user.deviceToken,
      "Student",
      notify
    );
    return `${user?.username}`;
  } catch (e) {
    console.log(e);
  }
};

exports.applicationFunction = async (
  order,
  paidBy,
  tx_amount_ad,
  tx_amount_ad_charges,
  moduleId,
  is_author
) => {
  // try {
  //   const user = await User.findById({ _id: paidBy });
  //   const apps = await NewApplication.findById({ _id: moduleId });
  //   const ads = await Admission.findById({ _id: `${apps?.admissionAdmin}` });
  //   const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
  //   const orderPay = await OrderPayment.findById({ _id: order });
  //   const ins = await InstituteAdmin.findById({ _id: `${ads.institute}` });
  //   const finance = await Finance.findById({
  //     _id: `${institute?.financeDepart[0]}`,
  //   }).populate({
  //     path: "financeHead",
  //     select: "user",
  //   });
  //   const notify = new StudentNotification({});
  //   if (is_author) {
  //     // finance.financeBankBalance =
  //     //   finance.financeBankBalance + parseInt(tx_amount_ad);
  //     // finance.financeTotalBalance =
  //     //   finance.financeTotalBalance + parseInt(tx_amount_ad);
  //     // ins.insBankBalance = institute.insBankBalance + parseInt(tx_amount_ad);
  //     ins.return_to_qviple = parseInt()
  //   } else {
  //     admin.returnAmount += tx_amount_ad_charges;
  //     ins.adminRepayAmount += parseInt(tx_amount_ad);
  //   }
  //   // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
  //   trans.online_fee += parseInt(tx_amount_ad);
  //   trans.collected_fee += parseInt(tx_amount_ad);
  //   if (trans.remaining_fee > parseInt(tx_amount_ad)) {
  //     trans.remaining_fee -= parseInt(tx_amount_ad);
  //   }
  //   if (vehicle?.remaining_fee >= parseInt(tx_amount_ad)) {
  //     vehicle.remaining_fee -= parseInt(tx_amount_ad);
  //   }
  //   if (student?.vehicleRemainFeeCount >= parseInt(tx_amount_ad)) {
  //     student.vehicleRemainFeeCount -= parseInt(tx_amount_ad);
  //   }
  //   student.vehiclePaidFeeCount += parseInt(tx_amount_ad);
  //   trans.fund_history.push({
  //     student: student?._id,
  //     is_install: false,
  //     amount: parseInt(tx_amount_ad),
  //     mode: "Online",
  //   });
  //   notify.notifyContent = `${student.studentFirstName} ${student.studentMiddleName ? `${student.studentMiddleName} ` : ""} ${student.studentLastName} your transaction is successfull for ${vehicle.vehicle_number} ${parseInt(tx_amount_ad)} Fees`;
  //   notify.notifySender = trans._id;
  //   notify.notifyReceiever = user._id;
  //   user.activity_tab.push(notify._id);
  //   notify.user = user._id;
  //   notify.notifyByStudentPhoto = student._id;
  //   notify.notifyType = "Student";
  //   notify.notifyCategory = "Transport Payment";
  //   notify.redirectIndex = 27;
  //   student.notification.push(notify._id);
  //   user.payment_history.push(order);
  //   ins.payment_history.push(order);
  //   orderPay.payment_transport = vehicle._id;
  //   orderPay.payment_by_end_user_id = user._id;
  //   await Promise.all([
  //     student.save(),
  //     user.save(),
  //     trans.save(),
  //     finance.save(),
  //     ins.save(),
  //     admin.save(),
  //     notify.save(),
  //     orderPay.save(),
  //     vehicle.save(),
  //   ]);
  //   invokeMemberTabNotification(
  //     "Student Activity",
  //     notify,
  //     "Transport Payment Successfull",
  //     user._id,
  //     user.deviceToken,
  //     "Student",
  //     notify
  //   );
  //   return `${user?.username}`;
  // } catch (e) {
  //   console.log(e);
  // }
};
