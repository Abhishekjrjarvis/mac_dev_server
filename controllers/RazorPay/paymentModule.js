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

exports.feeInstituteFunction = async (order, paidBy, tx_amount, moduleId) => {
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
          finance.financeBankBalance =
            finance.financeBankBalance + parseInt(tx_amount);
          finance.financeTotalBalance =
            finance.financeTotalBalance + parseInt(tx_amount);
          // finance.institute.insBankBalance
          finance.institute.adminRepayAmount =
            finance.institute.adminRepayAmount + parseInt(tx_amount);
          admin.returnAmount += parseInt(tx_amount);
          notify.notifyContent = `${student.studentFirstName}${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} paid the ${
            fData.feeName
          }/ (Rs.${parseInt(tx_amount)}) successfully`;
          notify.notify_hi_content = `${student.studentFirstName}${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} ने ${fData.feeName}/ (Rs.${parseInt(
            tx_amount
          )}) का सफलतापूर्वक पेमेंट किया |`;
          notify.notify_mr_content = `${student.studentFirstName}${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} ने ${fData.feeName}/ (रु.${parseInt(
            tx_amount
          )}) यशस्वीरित्या भरले`;
          notify.notifySender = student._id;
          notify.notifyReceiever = user._id;
          finance.institute.iNotify.push(notify._id);
          notify.institute = finance.institute;
          user.uNotify.push(notify._id);
          notify.user = user._id;
          notify.notifyByStudentPhoto = student._id;
          classes.onlineFeeCollection.push({
            fee: parseInt(tx_amount),
            feeId: fData._id,
          });
          studentUser.payment_history.push(order);
          user.payment_history.push(order);
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
          student.studentChecklist.push(checklistData._id);
          student.studentPaidFeeCount += checklistData.checklistAmount;
          if (
            student.studentRemainingFeeCount >= checklistData.checklistAmount
          ) {
            student.studentRemainingFeeCount -= checklistData.checklistAmount;
          }
          checklistData.checklistFeeStatus = statusType;
          checklistData.studentsList.push(student._id);
          checklistData.checklistStudent = student._id;
          student.onlineCheckList.push(checklistData._id);
          finance.financeBankBalance =
            finance.financeBankBalance + parseInt(tx_amount);
          finance.financeTotalBalance =
            finance.financeTotalBalance + parseInt(tx_amount);
          // finance.institute.insBankBalance
          finance.institute.adminRepayAmount =
            finance.institute.adminRepayAmount + parseInt(tx_amount);
          admin.returnAmount += parseInt(tx_amount);
          notify.notifyContent = `${student.studentFirstName}${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} paid the ${
            checklistData.checklistName
          }/ (Rs.${parseInt(tx_amount)}) successfully`;
          notify.notify_hi_content = `${student.studentFirstName}${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} ने ${
            checklistData.checklistName
          }/ (Rs.${parseInt(tx_amount)}) का सफलतापूर्वक पेमेंट किया |`;
          notify.notify_mr_content = `${student.studentFirstName}${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} ने ${
            checklistData.checklistName
          }/ (रु.${parseInt(tx_amount)}) यशस्वीरित्या भरले`;
          notify.notifySender = student._id;
          notify.notifyReceiever = user._id;
          finance.institute.iNotify.push(notify._id);
          notify.institute = finance.institute;
          user.uNotify.push(notify._id);
          notify.user = user._id;
          notify.notifyByStudentPhoto = student._id;
          studentUser.payment_history.push(order);
          user.payment_history.push(order);
          await Promise.all([
            student.save(),
            checklistData.save(),
            finance.save(),
            institute.save(),
            user.save(),
            notify.save(),
            admin.save(),
            studentUser.save(),
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
  moduleId,
  statusId
) => {
  try {
    const student = await Student.findById({ _id: paidBy });
    const user = await User.findById({ _id: `${student.user}` });
    const apply = await NewApplication.findById({ _id: moduleId });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    const ins = await InstituteAdmin.findById({ _id: `${student.institute}` });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    const financeUser = await User.findById({
      _id: `${finance.financeHead.user}`,
    });
    const status = await Status.findById({ _id: statusId });
    const aStatus = new Status({});
    const notify = new Notification({});
    student.admissionPaymentStatus.push({
      applicationId: apply._id,
      status: "online",
      installment: "No Installment",
      fee: parseInt(tx_amount_ad),
    });
    if (student.admissionRemainFeeCount >= tx_amount_ad) {
      student.admissionRemainFeeCount -= tx_amount_ad;
    }
    admission.onlineFee += parseInt(tx_amount_ad);
    apply.onlineFee += parseInt(tx_amount_ad);
    apply.collectedFeeCount += parseInt(tx_amount_ad);
    finance.financeAdmissionBalance += parseInt(tx_amount_ad);
    finance.financeTotalBalance += parseInt(tx_amount_ad);
    admin.returnAmount += parseInt(tx_amount_ad);
    ins.adminRepayAmount += parseInt(tx_amount_ad);
    apply.selectedApplication.splice({
      student: student._id,
      fee_remain: apply.admissionFee,
    });
    apply.confirmedApplication.push({
      student: student._id,
      fee_remain:
        apply.admissionFee >= parseInt(tx_amount_ad)
          ? apply.admissionFee - parseInt(tx_amount_ad)
          : 0,
      payment_status: "online",
      paid_status:
        apply.admissionFee - parseInt(tx_amount_ad) == 0 ? "Paid" : "Not Paid",
    });
    apply.confirmCount += 1;
    aStatus.content = `Welcome to Institute ${ins.insName}, ${ins.insDistrict}.
    Your seat has been confirmed, You will be alloted your class shortly, Stay Update!`;
    aStatus.applicationId = apply._id;
    user.applicationStatus.push(aStatus._id);
    user.payment_history.push(order);
    (status.payMode = "online"), (status.isPaid = "Paid");
    notify.notifyContent = `${student.studentFirstName} 
    ${student.studentMiddleName ? `${student.studentMiddleName} ` : ""} 
    ${
      student.studentLastName
    } your transaction is successfull for Admission Fee ${parseInt(
      tx_amount_ad
    )}`;
    notify.notify_hi_content = `${student.studentFirstName} 
    ${student.studentMiddleName ? `${student.studentMiddleName} ` : ""} 
    ${student.studentLastName} प्रवेश शुल्क ${parseInt(
      tx_amount_ad
    )} के लिए आपका लेन-देन सफल है |`;
    notify.notify_mr_content = `प्रवेश शुल्कासाठी ${student.studentFirstName} 
    ${student.studentMiddleName ? `${student.studentMiddleName} ` : ""} 
    ${student.studentLastName} तुमचा व्यवहार यशस्वी झाला आहे ${parseInt(
      tx_amount_ad
    )}`;
    notify.notifySender = admission._id;
    notify.notifyReceiever = user._id;
    ins.iNotify.push(notify._id);
    notify.institute = ins._id;
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    financeUser.payment_history.push(order);
    await Promise.all([
      student.save(),
      user.save(),
      apply.save(),
      finance.save(),
      financeUser.save(),
      ins.save(),
      admin.save(),
      status.save(),
      aStatus.save(),
      admission.save(),
      notify.save(),
    ]);
    return `${user?.username}`;
  } catch (e) {
    console.log(e);
  }
};

exports.participateEventFunction = async (
  order,
  paidBy,
  tx_amount_ad,
  moduleId,
  notifyId
) => {
  try {
    const student = await Student.findById({ _id: paidBy });
    const user = await User.findById({ _id: `${student.user}` });
    const event = await Participate.findById({ _id: moduleId });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const depart = await Department.findById({ _id: `${event.department}` });
    const ins = await InstituteAdmin.findById({ _id: `${depart.institute}` });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    const financeUser = await User.findById({
      _id: `${finance.financeHead.user}`,
    });
    const status = await StudentNotification.findById({ _id: notifyId });
    const notify = new StudentNotification({});
    depart.onlineFee += parseInt(tx_amount_ad);
    event.online_fee += parseInt(tx_amount_ad);
    finance.financeParticipateEventBalance += parseInt(tx_amount_ad);
    finance.financeTotalBalance += parseInt(tx_amount_ad);
    admin.returnAmount += parseInt(tx_amount);
    ins.adminRepayAmount += parseInt(tx_amount_ad);
    status.event_payment_status = "Paid";
    event.event_fee.push({
      student: student._id,
      fee_status: "Paid",
    });
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
    notify.notifyCategory = "Participate Event";
    notify.redirectIndex = 13;
    student.notification.push(notify._id);
    user.payment_history.push(order);
    financeUser.payment_history.push(order);
    await Promise.all([
      student.save(),
      user.save(),
      event.save(),
      finance.save(),
      financeUser.save(),
      ins.save(),
      admin.save(),
      status.save(),
      depart.save(),
      notify.save(),
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
