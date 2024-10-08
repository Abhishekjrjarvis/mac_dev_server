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
const FeeStructure = require("../../models/Finance/FeesStructure");
const Transport = require("../../models/Transport/transport");
const Vehicle = require("../../models/Transport/vehicle");
const RemainingList = require("../../models/Admission/RemainingList");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const InternalFees = require("../../models/RazorPay/internalFees");
const Exam = require("../../models/Exam");
const ExamFeeStructure = require("../../models/BacklogStudent/ExamFeeStructure");
const Library = require("../../models/Library/Library");
const {
  add_all_installment,
  render_installment,
  add_total_installment,
  exempt_installment,
  set_fee_head_query,
  remain_one_time_query,
  update_fee_head_query,
  lookup_applicable_grant,
  all_installment_paid,
  set_fee_head_query_redesign,
  update_fee_head_query_redesign,
} = require("../../helper/Installment");
const Hostel = require("../../models/Hostel/hostel");
const Renewal = require("../../models/Hostel/renewal");
const { custom_month_query } = require("../../helper/dayTimer");
const BankAccount = require("../../models/Finance/BankAccount");
const Batch = require("../../models/Batch");
const { universal_random_password } = require("../../Custom/universalId");
const NestedCard = require("../../models/Admission/NestedCard");
const CertificateQuery = require("../../models/Certificate/CertificateQuery");
const { classes_status } = require("../Admission/admissionController");
const OtherFees = require("../../models/Finance/Other/OtherFees");
const FeeMaster = require("../../models/Finance/FeeMaster");
const ErrorPayment = require("../../models/Acid/ErrorPayment");
const studentOtherFeeReceipt = require("../../scripts/studentOtherFeeReceipt");

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
    var new_internal = await InternalFees.findById({ _id: moduleId });
    if (new_internal?.fees) {
      var fData = await Fees.findOne({ _id: `${new_internal?.fees}` });
      var depart = await Department.findById({
        _id: `${fData?.feeDepartment}`,
      });
      var account = await BankAccount.findOne({
        departments: { $in: depart?._id },
      });
    }
    if (new_internal?.checklist) {
      var checklistData = await Checklist.findOne({
        _id: `${new_internal?.checklist}`,
      });
      var depart = await Department.findById({
        _id: `${checklistData?.feeDepartment}`,
      });
      var account = await BankAccount.findOne({
        departments: { $in: depart?._id },
      });
    }
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var notify = new StudentNotification({});
    var new_receipt = new FeeReceipt({});
    new_receipt.fee_payment_amount = new_internal?.internal_fee_amount;
    new_receipt.receipt_generated_from = "BY_CLASS_TEACHER";
    new_receipt.fee_payment_mode = "Payment Gateway - PG";
    new_receipt.student = student?._id;
    new_receipt.fee_transaction_date = new Date();
    new_receipt.finance = finance?._id;
    new_receipt.invoice_count = orderPay?.payment_invoice_number;
    new_receipt.order_history = orderPay?._id;
    orderPay.fee_receipt = new_receipt?._id;
    orderPay.payment_student = student?._id;
    orderPay.payment_student_name = student?.valid_full_name;
    orderPay.payment_student_gr = student?.studentGRNO;
    new_internal.fee_receipt = new_receipt?._id;
    new_receipt.internal_fees = new_internal?._id;
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
          new_internal.internal_fee_status = "Paid";
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
            admin.returnAmount += parseInt(tx_amount_charges);
            depart.due_repay += parseInt(tx_amount);
            depart.total_repay += parseInt(tx_amount);
            account.due_repay += parseInt(tx_amount);
            account.total_repay += parseInt(tx_amount);
            account.collect_online += parseInt(tx_amount);
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
          user.activity_tab.push(notify._id);
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
            new_internal.save(),
            new_receipt.save(),
            depart.save(),
            account.save(),
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
          new_internal.internal_fee_status = "Paid";
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
            admin.returnAmount += parseInt(tx_amount_charges);
            depart.due_repay += parseInt(tx_amount);
            depart.total_repay += parseInt(tx_amount);
            account.due_repay += parseInt(tx_amount);
            account.total_repay += parseInt(tx_amount);
            account.collect_online += parseInt(tx_amount);
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
          user.activity_tab.push(notify._id);
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
            new_internal.save(),
            new_receipt.save(),
            depart.save(),
            account.save(),
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
  paidTo,
  type,
  is_author,
  payment_type,
  remain_1,
  payment_card_id,
  pay_remain,
  statusId,
  eid
) => {
  try {
    var student = await Student.findById({ _id: paidBy }).populate({
      path: "fee_structure",
    });
    var user = await User.findById({ _id: `${student?.user}` });
    var apply = await NewApplication.findById({ _id: moduleId });
    var orderPay = await OrderPayment.findById({ _id: order });
    var admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    var ins = await InstituteAdmin.findById({ _id: `${paidTo}` });
    var depart = await Department.findById({
      _id: `${apply?.applicationDepartment}`,
    });
    var account = await BankAccount.findOne({
      departments: { $in: depart?._id },
    });
    var finance = await Finance.findById({
      _id: `${ins?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    var all_status = await Status.find({
      $and: [
        { applicationId: apply?._id },
        { student: student?._id },
        { payment_status: "Not Paid" },
      ],
    });
    var finance_user = await User.findById({
      _id: `${finance?.financeHead?.user}`,
    });
    console.log("EXISTING BLOCK");
    const new_receipt = new FeeReceipt({
      fee_payment_mode: "Payment Gateway / Online",
      fee_payment_amount: parseInt(tx_amount_ad),
    });
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.receipt_generated_from = "BY_ADMISSION";
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date();
    var remaining_fee_lists = await RemainingList.findById({
      _id: payment_card_id,
    })
      .populate({
        path: "applicable_card",
      })
      .populate({
        path: "government_card",
      });
    new_receipt.fee_structure = remaining_fee_lists?.fee_structure;
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    new_receipt.invoice_count = orderPay?.payment_invoice_number;
    if (remaining_fee_lists?.applicable_card?._id) {
      const nest_card = await NestedCard.findById({
        _id: `${remaining_fee_lists?.applicable_card?._id}`,
      });
      remaining_fee_lists.active_payment_type = `${type}`;
      nest_card.active_payment_type = `${type}`;
      remaining_fee_lists.paid_fee += parseInt(tx_amount_ad);
      nest_card.paid_fee += parseInt(tx_amount_ad);

      if (remaining_fee_lists?.remaining_fee >= parseInt(tx_amount_ad)) {
        remaining_fee_lists.remaining_fee -= parseInt(tx_amount_ad);
      }
      if (nest_card?.remaining_fee >= parseInt(tx_amount_ad)) {
        nest_card.remaining_fee -= parseInt(tx_amount_ad);
      } else {
        // if(nest_card?.remaining_fee > 0){
        nest_card.remaining_fee =
          parseInt(tx_amount_ad) - nest_card?.remaining_fee;
        nest_card.excess_fee +=
          parseInt(tx_amount_ad) - nest_card?.remaining_fee;
        // }
      }
      if (student.admissionRemainFeeCount >= parseInt(tx_amount_ad)) {
        student.admissionRemainFeeCount -= parseInt(tx_amount_ad);
      }
      if (apply.remainingFee >= parseInt(tx_amount_ad)) {
        apply.remainingFee -= parseInt(tx_amount_ad);
      }
      if (admission.remainingFeeCount >= parseInt(tx_amount_ad)) {
        admission.remainingFeeCount -= parseInt(tx_amount_ad);
      }
      var valid_one_time_fees =
        student?.fee_structure?.applicable_fees - parseInt(tx_amount_ad) == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        admission.remainingFee.pull(student._id);
      } else {
        // nest_card.remaining_array.push({
        //   remainAmount: student?.fee_structure?.applicable_fees - price,
        //   appId: apply._id,
        //   status: "Not Paid",
        //   instituteId: institute._id,
        //   installmentValue: "One Time Fees Remain",
        //   isEnable: true,
        // });
      }
      var extra_price = 0;
      await nest_card.save();
      if (type === "First Installment") {
        await set_fee_head_query_redesign(
          student,
          new_receipt?.fee_payment_amount,
          apply?._id,
          new_receipt
        );
        // await set_fee_head_query(student, parseInt(tx_amount_ad), apply, new_receipt);
      } else {
        await update_fee_head_query_redesign(
          student,
          new_receipt?.fee_payment_amount,
          apply?._id,
          new_receipt
        );
        // await update_fee_head_query(student, parseInt(tx_amount_ad), apply, new_receipt);
      }
      if (pay_remain) {
        await all_installment_paid(
          remaining_fee_lists,
          student?.fee_structure,
          "Online",
          parseInt(tx_amount_ad),
          admission,
          student,
          new_receipt,
          apply,
          ins,
          nest_card,
          type
        );
      } else {
        await render_installment(
          type,
          student,
          "Online",
          parseInt(tx_amount_ad),
          admission,
          student?.fee_structure,
          remaining_fee_lists,
          new_receipt,
          apply,
          ins,
          nest_card
        );
      }
      if (type === "First Installment") {
        console.log("Enter");
        for (var val of apply?.FeeCollectionApplication) {
          if (`${val?.student}` === `${student?._id}`) {
            apply.confirmedApplication.push({
              student: student._id,
              payment_status: "Online",
              install_type: "First Installment Paid",
              fee_remain: nest_card.remaining_fee ?? 0,
            });
            apply.confirmCount += 1;
            apply.FeeCollectionApplication.pull(val?._id);
            if (apply?.fee_collect_count > 0) {
              apply.fee_collect_count -= 1;
            }
          }
        }
        for (var val of admission?.FeeCollectionApplication) {
          if (`${val?.student}` === `${student?._id}`) {
            admission.confirmedApplication_query.push({
              student: student._id,
              payment_status: "Online",
              install_type: "First Installment Paid",
              fee_remain: nest_card.remaining_fee ?? 0,
            });
            admission.FeeCollectionApplication.pull(val?._id);
          }
        }
      }
    }
    student.admissionPaidFeeCount += parseInt(tx_amount_ad);
    if (remaining_fee_lists.remaining_fee <= 0) {
      remaining_fee_lists.status = "Paid";
    }
    admission.onlineFee += parseInt(tx_amount_ad);
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
      admin.returnAmount += parseInt(tx_amount_ad_charges);
      ins.adminRepayAmount += parseInt(tx_amount_ad);
      depart.due_repay += parseInt(tx_amount_ad);
      depart.total_repay += parseInt(tx_amount_ad);
      account.due_repay += parseInt(tx_amount_ad);
      account.total_repay += parseInt(tx_amount_ad);
      account.collect_online += parseInt(tx_amount_ad);
    }
    // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
    await lookup_applicable_grant(
      new_receipt?.fee_payment_mode,
      parseInt(tx_amount_ad),
      remaining_fee_lists,
      new_receipt
    );
    for (var match of student.paidFeeList) {
      if (`${match.appId}` === `${apply._id}`) {
        match.paidAmount += parseInt(tx_amount_ad);
      }
    }
    if (statusId) {
      const status = await Status.findById({ _id: statusId });
      const aStatus = new Status({});
      const notify = new StudentNotification({});
      aStatus.content = `Your seat has been confirmed, You will be alloted your class shortly, Stay Update!`;
      aStatus.group_by = "Admission_Confirmation";
      aStatus.applicationId = apply._id;
      aStatus.document_visible = false;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = ins._id;
      aStatus.fee_receipt = new_receipt?._id;
      (status.payMode = "online"), (status.isPaid = "Paid");
      status.for_selection = "Yes";
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
      user.activity_tab.push(notify._id);
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      finance_user.activity_tab.push(notify._id);
      notify.notifyCategory = "Admission Online Fee";
      notify.user = user._id;
      notify.notifyByStudentPhoto = student._id;
      await Promise.all([
        status.save(),
        aStatus.save(),
        notify.save(),
        finance_user.save(),
      ]);
    }
    user.payment_history.push(order);
    ins.payment_history.push(order);
    orderPay.payment_admission = apply._id;
    orderPay.payment_by_end_user_id = user?._id;
    new_receipt.order_history = orderPay?._id;
    orderPay.fee_receipt = new_receipt?._id;
    orderPay.payment_student = student?._id;
    orderPay.payment_student_name = student?.valid_full_name;
    orderPay.payment_student_gr = student?.studentGRNO;
    if (
      remaining_fee_lists?.re_admission_class != null &&
      remaining_fee_lists?.re_admission_flow
    ) {
      var classes = await Class.findById({
        _id: `${remaining_fee_lists?.re_admission_class}`,
      });
      var batch = await Batch.findById({ _id: `${classes?.batch}` });
      var depart = await Department.findById({
        _id: `${batch?.department}`,
      });
      if (classes?.ApproveStudent?.includes(student._id)) {
      } else {
        classes?.ApproveStudent.push(student._id);
        classes?.UnApproveStudent.pull(student._id);
      }
      if (batch?.ApproveStudent?.includes(student._id)) {
      } else {
        batch?.ApproveStudent.push(student._id);
        batch?.UnApproveStudent.pull(student._id);
      }
      if (depart?.ApproveStudent?.includes(student._id)) {
      } else {
        depart?.ApproveStudent.push(student._id);
        depart?.UnApproveStudent.pull(student._id);
      }
      classes.studentCount += 1;
      if (student.studentGender === "Male") {
        classes.boyCount += 1;
      } else if (student.studentGender === "Female") {
        classes.girlCount += 1;
      } else if (student.studentGender === "Other") {
        classes.otherCount += 1;
      } else {
      }
      student.studentROLLNO = classes.ApproveStudent?.length + 1;
      await classes_status(apply, ins, depart, user, classes);
      await Promise.all([classes.save(), batch.save(), depart.save()]);
    }
    for (var val of all_status) {
      val.payment_status = "Paid";
      val.fee_receipt = new_receipt?._id;
      await val.save();
    }
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
      depart.save(),
      account.save(),
      user.save(),
    ]);
    if (eid) {
      console.log("PAYMENT BUG CHECKED + FIXED");
      const bug = await ErrorPayment.findById({ _id: eid });
      bug.error_receipt = new_receipt?._id;
      bug.error_op = orderPay?._id;
      await bug.save();
    }
    return `${user?.username}`;
  } catch (e) {
    // if (e) {
    //   const error = new ErrorPayment({
    //     error_flow: "Admission",
    //     error_student: paidBy,
    //     error_module: moduleId,
    //     error_order: order,
    //     error_message: e?.message,
    //     error_payment_card: payment_card_id ?? null,
    //     error_amount_charges: tx_amount_ad_charges,
    //     error_amount: tx_amount_ad,
    //     error_paid_to: paidTo,
    //     error_status_id: statusId ?? "",
    //     error_type: type
    //   })
    //   await error.save()
    // }
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
    var account = await BankAccount.findOne({
      departments: { $in: depart?._id },
    });
    const ins = await InstituteAdmin.findById({ _id: `${depart.institute}` });
    const finance = await Finance.findById({
      _id: `${ins?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    var finance_user = await User.findById({
      _id: `${finance?.financeHead?.user}`,
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
      admin.returnAmount += parseInt(tx_amount_ad_charges);
      ins.adminRepayAmount += parseInt(tx_amount_ad);
      depart.due_repay += parseInt(tx_amount_ad);
      depart.total_repay += parseInt(tx_amount_ad);
      account.due_repay += parseInt(tx_amount_ad);
      account.total_repay += parseInt(tx_amount_ad);
      account.collect_online += parseInt(tx_amount_ad);
    }
    // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
    status.event_payment_status = "Paid";
    event.apply_student.push(student?._id);
    event.apply_student_count += 1;
    event.event_fee_array.push({
      student: student._id,
      fee_status: "Paid",
    });
    student.participate_event.push(event?._id);
    event.paid_participant += 1;
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      event.event_name
    } ${parseInt(tx_amount_ad)}`;
    notify.notifySender = depart._id;
    notify.notifyReceiever = user._id;
    user.activity_tab.push(notify._id);
    // ins.iNotify.push(notify._id);
    finance_user.activity_tab.push(notify._id);
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
    orderPay.payment_student = student?._id;
    orderPay.payment_student_name = student?.valid_full_name;
    orderPay.payment_student_gr = student?.studentGRNO;
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
      account.save(),
      finance_user.save(),
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
  // try {
  //   const student = await Student.findById({ _id: paidBy });
  //   const user = await User.findById({ _id: `${student.user}` });
  //   const vehicle = await Vehicle.findById({ _id: moduleId });
  //   const trans = await Transport.findById({ _id: `${vehicle?.transport}` });
  //   var account = await BankAccount.findOne({ transport: `${trans?._id}` });
  //   const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
  //   const orderPay = await OrderPayment.findById({ _id: order });
  //   const ins = await InstituteAdmin.findById({ _id: `${trans.institute}` });
  //   const finance = await Finance.findById({
  //     _id: `${institute?.financeDepart[0]}`,
  //   }).populate({
  //     path: "financeHead",
  //     select: "user",
  //   });
  //   var finance_user = await User.findById({
  //     _id: `${finance?.financeHead?.user}`,
  //   });
  //   if (trans?.pending_student?.includes(`${student?._id}`)) {
  //     var total_amount = await add_total_installment(student);
  //     const new_receipt = new FeeReceipt({
  //       fee_payment_mode: "Payment Gateway / Online",
  //       fee_payment_amount: parseInt(tx_amount_ad),
  //     });
  //     new_receipt.student = student?._id;
  //     new_receipt.fee_transaction_date = new Date();
  //     new_receipt.vehicle = vehicle?._id;
  //     new_receipt.receipt_generated_from = "BY_TRANSPORT";
  //     new_receipt.finance = finance?._id;
  //     new_receipt.invoice_count = orderPay?.payment_invoice_number;
  //     const notify = new StudentNotification({});
  //     admission.onlineFee += parseInt(tx_amount_ad);
  //     // admission.collected_fee += parseInt(tx_amount_ad);
  //     apply.onlineFee += parseInt(tx_amount_ad);
  //     apply.collectedFeeCount += parseInt(tx_amount_ad);
  //     finance.financeAdmissionBalance += parseInt(tx_amount_ad);
  //     student.admissionPaidFeeCount += parseInt(tx_amount_ad);
  //     if (is_author) {
  //       finance.financeBankBalance =
  //         finance.financeBankBalance + parseInt(tx_amount_ad);
  //       finance.financeTotalBalance =
  //         finance.financeTotalBalance + parseInt(tx_amount_ad);
  //       ins.insBankBalance = ins.insBankBalance + parseInt(tx_amount_ad);
  //     } else {
  //       admin.returnAmount += parseInt(tx_amount_ad_charges);
  //       ins.adminRepayAmount += parseInt(tx_amount_ad);
  //       depart.due_repay += parseInt(tx_amount_ad);
  //       depart.total_repay += parseInt(tx_amount_ad);
  //       account.due_repay += parseInt(tx_amount_ad);
  //       account.total_repay += parseInt(tx_amount_ad);
  //       account.collect_online += parseInt(tx_amount_ad);
  //     }
  //     // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
  //     if (parseInt(tx_amount_ad) > 0 && is_install) {
  //       admission.remainingFee.push(student._id);
  //       student.admissionRemainFeeCount +=
  //         total_amount - parseInt(tx_amount_ad);
  //       apply.remainingFee += total_amount - parseInt(tx_amount_ad);
  //       admission.remainingFeeCount += total_amount - parseInt(tx_amount_ad);
  //       var new_remainFee = new RemainingList({
  //         appId: apply._id,
  //         applicable_fee: total_amount,
  //         institute: ins?._id,
  //       });
  //       new_remainFee.access_mode_card = "Installment_Wise";
  //       new_remainFee.remaining_array.push({
  //         remainAmount: parseInt(tx_amount_ad),
  //         appId: apply._id,
  //         status: "Paid",
  //         instituteId: ins._id,
  //         installmentValue: "First Installment",
  //         mode: "online",
  //         fee_receipt: new_receipt?._id,
  //       });
  //       new_remainFee.active_payment_type = "First Installment";
  //       new_remainFee.paid_fee += parseInt(tx_amount_ad);
  //       new_remainFee.fee_structure = student?.fee_structure?._id;
  //       new_remainFee.remaining_fee += total_amount - parseInt(tx_amount_ad);
  //       student.remainingFeeList.push(new_remainFee?._id);
  //       student.remainingFeeList_count += 1;
  //       new_remainFee.student = student?._id;
  //       new_remainFee.fee_receipts.push(new_receipt?._id);
  //       if (total_amount - parseInt(tx_amount_ad)) {
  //         await add_all_installment(
  //           apply,
  //           ins._id,
  //           new_remainFee,
  //           parseInt(tx_amount_ad),
  //           student
  //         );
  //       }
  //       if (
  //         total_amount - parseInt(tx_amount_ad) > 0 &&
  //         `${student?.fee_structure?.total_installments}` === "1"
  //       ) {
  //         new_remainFee.remaining_array.push({
  //           remainAmount: total_amount - parseInt(tx_amount_ad),
  //           appId: apply._id,
  //           instituteId: ins._id,
  //           installmentValue: "Installment Remain",
  //           isEnable: true,
  //         });
  //       }
  //     } else if (parseInt(tx_amount_ad) > 0 && !is_install) {
  //       var new_remainFee = new RemainingList({
  //         appId: apply._id,
  //         applicable_fee: student?.fee_structure?.total_admission_fees,
  //         institute: ins?._id,
  //       });
  //       new_remainFee.access_mode_card = "One_Time_Wise";
  //       new_remainFee.remaining_array.push({
  //         remainAmount: parseInt(tx_amount_ad),
  //         appId: apply._id,
  //         status: "Paid",
  //         instituteId: ins._id,
  //         installmentValue: "One Time Fees",
  //         mode: "online",
  //         fee_receipt: new_receipt?._id,
  //       });
  //       new_remainFee.active_payment_type = "One Time Fees";
  //       new_remainFee.paid_fee += parseInt(tx_amount_ad);
  //       new_remainFee.fee_structure = student?.fee_structure?._id;
  //       new_remainFee.remaining_fee +=
  //         student?.fee_structure?.total_admission_fees - parseInt(tx_amount_ad);
  //       student.remainingFeeList.push(new_remainFee?._id);
  //       student.remainingFeeList_count += 1;
  //       new_remainFee.student = student?._id;
  //       new_remainFee.fee_receipts.push(new_receipt?._id);
  //       admission.remainingFee.push(student._id);
  //       student.admissionRemainFeeCount +=
  //         student?.fee_structure?.total_admission_fees - parseInt(tx_amount_ad);
  //       apply.remainingFee +=
  //         student?.fee_structure?.total_admission_fees - parseInt(tx_amount_ad);
  //       admission.remainingFeeCount +=
  //         student?.fee_structure?.total_admission_fees - parseInt(tx_amount_ad);
  //       const valid_one_time_fees =
  //         student?.fee_structure?.total_admission_fees -
  //           parseInt(tx_amount_ad) ==
  //         0
  //           ? true
  //           : false;
  //       if (valid_one_time_fees) {
  //         admission.remainingFee.pull(student._id);
  //       } else {
  //         new_remainFee.remaining_array.push({
  //           remainAmount:
  //             student?.fee_structure?.total_admission_fees -
  //             parseInt(tx_amount_ad),
  //           appId: apply._id,
  //           status: "Not Paid",
  //           instituteId: ins?._id,
  //           installmentValue: "One Time Fees Remain",
  //           isEnable: true,
  //         });
  //       }
  //     } else {
  //     }
  //     await set_fee_head_query(
  //       student,
  //       parseInt(tx_amount_ad),
  //       apply,
  //       new_receipt
  //     );
  //     if (is_install) {
  //       apply.confirmedApplication.push({
  //         student: student._id,
  //         payment_status: "Online",
  //         install_type: "First Installment Paid",
  //         fee_remain: total_amount - parseInt(tx_amount_ad),
  //       });
  //     } else {
  //       apply.confirmedApplication.push({
  //         student: student._id,
  //         payment_status: "Online",
  //         install_type: "One Time Fees Paid",
  //         fee_remain:
  //           student?.fee_structure?.total_admission_fees -
  //           parseInt(tx_amount_ad),
  //       });
  //     }
  //     apply.confirmCount += 1;
  //     for (let app of apply.selectedApplication) {
  //       if (`${app.student}` === `${student._id}`) {
  //         apply.selectedApplication.pull(app?._id);
  //       } else {
  //       }
  //     }
  //     await apply.save();
  //     // for (var match of student.paidFeeList) {
  //     //   if (`${match.appId}` === `${apply._id}`) {
  //     //     match.paidAmount += parseInt(tx_amount_ad);
  //     //   }
  //     // }
  //     student.paidFeeList.push({
  //       paidAmount: parseInt(tx_amount_ad),
  //       appId: apply._id,
  //     });
  //     aStatus.content = `Your seat has been confirmed, You will be alloted your class shortly, Stay Update!`;
  //     aStatus.applicationId = apply._id;
  //     aStatus.document_visible = false;
  //     user.applicationStatus.push(aStatus._id);
  //     aStatus.instituteId = ins._id;
  //     aStatus.fee_receipt = new_receipt?._id;
  //     user.payment_history.push(order);
  //     (status.payMode = "online"), (status.isPaid = "Paid");
  //     status.for_selection = "Yes";
  //     notify.notifyContent = `${student.studentFirstName} ${
  //       student.studentMiddleName ? `${student.studentMiddleName} ` : ""
  //     } ${
  //       student.studentLastName
  //     } your transaction is successfull for Admission Fee ${parseInt(
  //       tx_amount_ad
  //     )}`;
  //     notify.notify_hi_content = `${student.studentFirstName} ${
  //       student.studentMiddleName ? `${student.studentMiddleName} ` : ""
  //     } ${student.studentLastName} प्रवेश शुल्क ${parseInt(
  //       tx_amount_ad
  //     )} के लिए आपका लेन-देन सफल है |`;
  //     notify.notify_mr_content = `प्रवेश शुल्कासाठी ${
  //       student.studentFirstName
  //     } ${student.studentMiddleName ? `${student.studentMiddleName} ` : ""} ${
  //       student.studentLastName
  //     } तुमचा व्यवहार यशस्वी झाला आहे ${parseInt(tx_amount_ad)}`;
  //     notify.notifySender = admission._id;
  //     notify.notifyReceiever = user._id;
  //     // ins.iNotify.push(notify._id);
  //     // notify.institute = ins._id;
  //     user.activity_tab.push(notify._id);
  //     notify.notifyType = "Student";
  //     notify.notifyPublisher = student?._id;
  //     finance_user.activity_tab.push(notify._id);
  //     notify.notifyCategory = "Admission Online Fee";
  //     notify.user = user._id;
  //     notify.notifyByStudentPhoto = student._id;
  //     ins.payment_history.push(order);
  //     orderPay.payment_admission = apply._id;
  //     orderPay.payment_by_end_user_id = user._id;
  //     new_receipt.order_history = orderPay?._id;
  //     orderPay.fee_receipt = new_receipt?._id;
  //     orderPay.payment_student = student?._id;
  //     await Promise.all([
  //       student.save(),
  //       user.save(),
  //       apply.save(),
  //       finance.save(),
  //       ins.save(),
  //       admin.save(),
  //       status.save(),
  //       aStatus.save(),
  //       admission.save(),
  //       notify.save(),
  //       orderPay.save(),
  //       new_receipt.save(),
  //       new_remainFee.save(),
  //       depart.save(),
  //       account.save(),
  //       finance_user.save(),
  //     ]);
  //   }
  //   const notify = new StudentNotification({});
  //   trans.online_fee += parseInt(tx_amount_ad);
  //   // trans.collected_fee += parseInt(tx_amount_ad);
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
  //   student.vehicle_payment_status.push({
  //     vehicle: vehicle?._id,
  //     status: "Paid",
  //     amount: parseInt(tx_amount_ad),
  //   });
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

exports.backlogFunction = async (
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
    var new_internal = await InternalFees.findById({ _id: moduleId });
    var exam_struct = await ExamFeeStructure.findById({
      _id: `${new_internal?.exam_structure}`,
    });
    const valid_depart = await Department.findById({
      _id: `${exam_struct?.department}`,
    });
    var account = await BankAccount.findOne({
      departments: { $in: valid_depart?._id },
    });
    const exam = await Exam.findById({ _id: `${exam_struct?.exam}` });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const orderPay = await OrderPayment.findById({ _id: order });
    const ins = await InstituteAdmin.findById({
      _id: `${valid_depart?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    var finance_user = await User.findById({
      _id: `${finance?.financeHead?.user}`,
    });
    const notify = new StudentNotification({});
    var new_receipt = new FeeReceipt({});
    new_receipt.fee_payment_amount = new_internal?.internal_fee_amount;
    new_receipt.fee_payment_mode = "Payment Gateway - PG";
    new_receipt.student = student?._id;
    new_receipt.receipt_generated_from = "BY_CLASS_TEACHER";
    new_receipt.fee_transaction_date = new Date();
    new_receipt.finance = finance?._id;
    new_receipt.invoice_count = orderPay?.payment_invoice_number;
    new_receipt.order_history = orderPay?._id;
    orderPay.fee_receipt = new_receipt?._id;
    orderPay.payment_student = student?._id;
    new_internal.fee_receipt = new_receipt?._id;
    new_receipt.internal_fees = new_internal?._id;
    if (is_author) {
      finance.financeBankBalance =
        finance.financeBankBalance + parseInt(tx_amount_ad);
      finance.financeTotalBalance =
        finance.financeTotalBalance + parseInt(tx_amount_ad);
      ins.insBankBalance = institute.insBankBalance + parseInt(tx_amount_ad);
    } else {
      admin.returnAmount += parseInt(tx_amount_ad_charges);
      ins.adminRepayAmount += parseInt(tx_amount_ad);
      valid_depart.due_repay += parseInt(tx_amount_ad);
      valid_depart.total_repay += parseInt(tx_amount_ad);
      account.due_repay += parseInt(tx_amount_ad);
      account.total_repay += parseInt(tx_amount_ad);
      account.collect_online += parseInt(tx_amount_ad);
    }
    // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
    exam_struct.total_paid_collection += parseInt(tx_amount_ad);
    if (student?.studentRemainingFeeCount >= parseInt(tx_amount_ad)) {
      student.studentRemainingFeeCount -= parseInt(tx_amount_ad);
    }
    student.studentPaidFeeCount += parseInt(tx_amount_ad);
    var valid_pay = exam_struct?.paid_student?.filter((ref) => {
      if (`${ref?.student}` === `${student?._id}`) return ref;
    });
    if (valid_pay?.length > 0) {
      for (var ref of valid_pay) {
        ref.status = "Paid";
      }
    }
    // var valid_fees = student?.backlog_exam_fee?.filter((ref) => {
    //   if (`${ref?._id}` === `${notify_id}`) return ref;
    // });
    // if (valid_fees?.length > 0) {
    //   for (var ref of valid_fees) {
    //     ref.status = "Paid";
    //   }
    // }
    new_internal.internal_fee_status = "Paid";
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      exam?.examName
    } ${parseInt(tx_amount_ad)} Fees`;
    notify.notifySender = valid_depart?._id;
    notify.notifyReceiever = user._id;
    user.activity_tab.push(notify._id);
    // ins.iNotify.push(notify._id);
    finance_user.activity_tab.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    notify.notifyType = "Student";
    notify.notifyCategory = "Backlog Payment";
    notify.redirectIndex = 27;
    student.notification.push(notify._id);
    user.payment_history.push(order);
    ins.payment_history.push(order);
    orderPay.payment_backlog = exam_struct?._id;
    orderPay.payment_by_end_user_id = user._id;
    await Promise.all([
      student.save(),
      user.save(),
      exam_struct.save(),
      finance.save(),
      ins.save(),
      admin.save(),
      notify.save(),
      orderPay.save(),
      new_internal.save(),
      new_receipt.save(),
      valid_depart.save(),
      account.save(),
      finance_user.save(),
    ]);
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      "Backlog Payment Successfull",
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

exports.directAdmissionInstituteFunction = async (
  exist_order,
  paidBy,
  tx_amount_ad,
  tx_amount_ad_charges,
  moduleId,
  is_author,
  body
) => {
  try {
    // var user = await User.findById({ _id: `${paidBy}` });
    // var price = parseInt(tx_amount_ad);
    // var apply = await NewApplication.findById({ _id: `${moduleId}` }).populate({
    //   path: "direct_attach_class",
    //   select: "className classTitle",
    // });
    // var depart = await Department.findById({
    //   _id: `${apply?.applicationDepartment}`,
    // });
    // var account = await BankAccount.findOne({
    //   departments: { $in: depart?._id },
    // });
    // var admission = await Admission.findById({
    //   _id: `${apply?.admissionAdmin}`,
    // }).populate({
    //   path: "admissionAdminHead",
    //   select: "user",
    // });
    // const admin = await Admin.findById({
    //   _id: `${process.env.S_ADMIN_ID}`,
    // }).select("invoice_count");
    // var institute = await InstituteAdmin.findById({
    //   _id: `${admission?.institute}`,
    // });
    // var finance = await Finance.findById({
    //   _id: `${institute?.financeDepart?.[0]}`,
    // }).populate({
    //   path: "financeHead",
    //   select: "user",
    // });
    // var finance_user = await User.findById({
    //   _id: `${finance?.financeHead?.user}`,
    // });
    // var structure = await FeeStructure.findById({
    //   _id: `${apply?.direct_linked_structure}`,
    // });
    // var status = new Status({});
    // var notify = new StudentNotification({});
    // var student = new Student({ ...body });
    // student.valid_full_name = `${student?.studentFirstName} ${
    //   student?.studentMiddleName ?? ""
    // } ${student?.studentLastName}`;
    // student.student_join_mode = "ADMISSION_PROCESS";
    // const codess = universal_random_password()
    // student.member_module_unique = `${codess}`
    // const studentOptionalSubject = body?.optionalSubject
    //   ? body?.optionalSubject
    //   : [];
    // for (var file of body?.fileArray) {
    //   if (file.name === "file") {
    //     student.photoId = "0";
    //     student.studentProfilePhoto = file.key;
    //   } else if (file.name === "addharFrontCard")
    //     student.studentAadharFrontCard = file.key;
    //   else if (file.name === "addharBackCard")
    //     student.studentAadharBackCard = file.key;
    //   else if (file.name === "bankPassbook")
    //     student.studentBankPassbook = file.key;
    //   else if (file.name === "casteCertificate")
    //     student.studentCasteCertificatePhoto = file.key;
    //   else {
    //     student.studentDocuments.push({
    //       documentName: file.name,
    //       documentKey: file.key,
    //       documentType: file.type,
    //     });
    //   }
    // }
    // if (studentOptionalSubject?.length > 0) {
    //   student.studentOptionalSubject?.push(...studentOptionalSubject);
    // }
    // status.feeStructure = structure?._id;
    // student.fee_structure = structure?._id;
    // await student.save();
    // student = await Student.findById({ _id: student?._id }).populate({
    //   path: "fee_structure",
    // });
    // var order = await OrderPayment.findById({ _id: exist_order });
    // var new_receipt = new FeeReceipt({ ...body });
    // new_receipt.student = student?._id;
    // new_receipt.fee_transaction_date = new Date().toISOString();
    // new_receipt.application = apply?._id;
    // new_receipt.finance = finance?._id;
    // new_receipt.receipt_generated_from = "BY_ADMISSION";
    // order.payment_module_type = "Direct Admission Fees";
    // order.payment_to_end_user_id = institute?._id;
    // order.payment_by_end_user_id = user._id;
    // order.payment_module_id = apply._id;
    // order.payment_amount = price;
    // order.payment_status = "Captured";
    // order.payment_flag_to = "Credit";
    // order.payment_flag_by = "Debit";
    // order.payment_mode = "Online";
    // order.payment_admission = apply._id;
    // order.payment_from = student._id;
    // order.payment_student = student?._id;
    // user.payment_history.push(order._id);
    // institute.payment_history.push(order._id);
    // new_receipt.invoice_count = order?.payment_invoice_number;
    // var total_amount = await add_total_installment({
    //   fee_structure: structure,
    // });
    // admission.onlineFee += price;
    // apply.collectedFeeCount += price;
    // apply.onlineFee += price;
    // student.admissionPaidFeeCount += price;
    // student.paidFeeList.push({
    //   paidAmount: price,
    //   appId: apply._id,
    // });
    // if (is_author) {
    //   finance.financeAdmissionBalance += price;
    //   finance.financeTotalBalance += price;
    //   finance.financeBankBalance += price;
    //   institute.insBankBalance += price;
    // } else {
    //   admin.returnAmount += parseInt(tx_amount_ad_charges);
    //   institute.adminRepayAmount += price;
    //   depart.due_repay += price;
    //   depart.total_repay += price;
    //   account.due_repay += price;
    //   account.total_repay += price;
    //   account.collect_online += price;
    // }
    // await set_fee_head_query(student, price, apply, new_receipt);
    // if (apply?.direct_attach_class?._id) {
    //   status.content = `Your Payment (Rs. ${price}/) for Admission ${apply?.applicationName} Receieved successfully & your admission has been confirmed. You have been allotted to your ${apply?.direct_attach_class?.className}-${apply?.direct_attach_class?.classTitle}. Enjoy your learning.`;
    //   status.group_by = "Admission_Class_Allotment"
    // } else {
    //   status.content = `Your Payment (Rs. ${price}/) for Admission ${apply?.applicationName} Receieved successfully & your admission has been confirmed.`;
    // }
    // status.applicationId = apply._id;
    // status.instituteId = institute._id;
    // status.finance = finance?._id;
    // user.student.push(student._id);
    // user.applyApplication.push(apply._id);
    // student.user = user._id;
    // user.applicationStatus.push(status._id);
    // if (apply?.direct_attach_class?._id) {
    //   apply.allottedApplication.push({
    //     student: student?._id,
    //     payment_status: "Online",
    //     fee_remain: student?.admissionRemainFeeCount,
    //     alloted_status: "Alloted",
    //     alloted_class: `${apply?.direct_attach_class?.className}-${apply?.direct_attach_class?.classTitle}`,
    //   });
    //   apply.allotCount += 1;
    // } else {
    //   apply.confirmedApplication.push({
    //     student: student?._id,
    //     payment_status: "Online",
    //     install_type: is_install
    //       ? "First Installment Paid"
    //       : "One Time Fees Paid",
    //     fee_remain: is_install
    //       ? total_amount - price
    //       : structure?.total_admission_fees - price,
    //   });
    //   apply.confirmCount += 1;
    // }
    // if (apply?.direct_attach_class?._id) {
    //   notify.notifyContent = `Your Payment (Rs. ${price}/) for Admission ${apply?.applicationName} Receieved successfully & your admission has been confirmed. You have been allotted to your ${apply?.direct_attach_class?.className}-${apply?.direct_attach_class?.classTitle}. Enjoy your learning.`;
    // } else {
    //   notify.notifyContent = `Your Payment (Rs. ${price}/) for Admission ${apply?.applicationName} Receieved successfully & your admission has been confirmed.`;
    // }
    // notify.notifySender = admission?.admissionAdminHead?.user;
    // notify.notifyReceiever = user?._id;
    // notify.notifyType = "Student";
    // notify.notifyPublisher = student?._id;
    // user.activity_tab.push(notify?._id);
    // // institute.iNotify.push(notify?._id);
    // finance_user.activity_tab.push(notify._id);
    // notify.notifyByAdmissionPhoto = admission?._id;
    // notify.notifyCategory = "Direct Admission Status Alert";
    // notify.redirectIndex = 29;
    // if (institute.userFollowersList.includes(uid)) {
    // } else {
    //   user.userInstituteFollowing.push(institute._id);
    //   user.followingUICount += 1;
    //   institute.userFollowersList.push(uid);
    //   institute.followersCount += 1;
    // }
    // await Promise.all([
    //   student.save(),
    //   user.save(),
    //   status.save(),
    //   apply.save(),
    //   institute.save(),
    //   notify.save(),
    //   admin.save(),
    //   order.save(),
    //   new_receipt.save(),
    //   new_remainFee.save(),
    //   admission.save(),
    //   finance.save(),
    //   depart.save(),
    //   account.save(),
    //   finance_user.save(),
    // ]);
    // return `${user?.username}`;
  } catch (e) {
    console.log(e);
  }
};

exports.libraryInstituteFunction = async (
  order,
  paidBy,
  tx_amount,
  tx_amount_charges,
  moduleId,
  is_author,
  bookId
) => {
  try {
    const student = await Student.findById({ _id: paidBy });
    const studentUser = await User.findById({ _id: `${student?.user}` });
    const institute = await InstituteAdmin.findById({
      _id: `${student?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    var finance_user = await User.findById({
      _id: `${finance?.financeHead?.user}`,
    });
    const library = await Library.findById({
      _id: `${institute?.library[0]}`,
    }).populate({
      path: "libraryHead",
      select: "user",
    });
    var account = await BankAccount.findOne({ library: `${library?._id}` });
    const user = await User.findById({
      _id: `${finance.financeHead.user}`,
    });
    const orderPay = await OrderPayment.findById({ _id: order });
    var new_internal = await InternalFees.findById({ _id: moduleId });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var notify = new StudentNotification({});
    var new_receipt = new FeeReceipt({});
    new_receipt.fee_payment_amount = new_internal?.internal_fee_amount;
    new_receipt.receipt_generated_from = "BY_LIBRARIAN";
    new_receipt.fee_payment_mode = "Payment Gateway - PG";
    new_receipt.student = student?._id;
    new_receipt.fee_transaction_date = new Date();
    new_receipt.finance = finance?._id;
    new_receipt.invoice_count = orderPay?.payment_invoice_number;
    new_receipt.order_history = orderPay?._id;
    orderPay.fee_receipt = new_receipt?._id;
    orderPay.payment_student = student?._id;
    orderPay.payment_student_name = student?.valid_full_name;
    orderPay.payment_student_gr = student?.studentGRNO;
    new_internal.fee_receipt = new_receipt?._id;
    new_receipt.internal_fees = new_internal?._id;
    new_internal.internal_fee_status = "Paid";
    student.studentPaidFeeCount += parseInt(tx_amount);
    if (student.studentRemainingFeeCount >= parseInt(tx_amount)) {
      student.studentRemainingFeeCount -= parseInt(tx_amount);
    }
    library.onlineFine += parseInt(tx_amount);
    student.libraryFinePaidCount += parseInt(tx_amount);
    if (student.libraryFineRemainCount >= parseInt(tx_amount)) {
      student.libraryFineRemainCount -= parseInt(tx_amount);
    }
    var ele_type;
    for (var ref of library?.pending_fee) {
      if (
        `${ref?.student}` === `${student?._id}` &&
        `${ref?.book}` === `${bookId}` &&
        `${ref?.status}` === "Not Paid"
      ) {
        ele_type = ref?.fine_type;
        library.pending_fee.pull(ref?._id);
      }
    }
    library.paid_fee.push({
      student: student?._id,
      book: bookId,
      fee_receipt: new_receipt?._id,
      fine_charge: parseInt(tx_amount),
      fine_type: `${ele_type}`,
      status: "Paid",
    });
    // library.pending_fee.pull(student?._id);
    library.totalFine += parseInt(tx_amount);
    if (library?.remainFine >= parseInt(tx_amount)) {
      library.remainFine -= parseInt(tx_amount);
    }
    if (is_author) {
      finance.financeBankBalance =
        finance.financeBankBalance + parseInt(tx_amount);
      finance.financeTotalBalance =
        finance.financeTotalBalance + parseInt(tx_amount);
      institute.insBankBalance = institute.insBankBalance + parseInt(tx_amount);
    } else {
      institute.adminRepayAmount =
        institute.adminRepayAmount + parseInt(tx_amount);
      admin.returnAmount += parseInt(tx_amount_charges);
      // depart.due_repay += parseInt(tx_amount);
      // depart.total_repay += parseInt(tx_amount);
      account.due_repay += parseInt(tx_amount);
      account.total_repay += parseInt(tx_amount);
      account.collect_online += parseInt(tx_amount);
    }
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} paid the Library Fee/ (Rs.${parseInt(
      tx_amount
    )}) successfully`;
    notify.notify_hi_content = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} ने Library Fee/ (Rs.${parseInt(
      tx_amount
    )}) का सफलतापूर्वक पेमेंट किया |`;
    notify.notify_mr_content = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} ने Library Fee/ (रु.${parseInt(
      tx_amount
    )}) यशस्वीरित्या भरले`;
    notify.notifySender = student._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Online Fee";
    user.activity_tab.push(notify._id);
    // institute.iNotify.push(notify?._id);
    finance_user.activity_tab.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    studentUser.payment_history.push(order);
    institute.payment_history.push(order);
    orderPay.payment_library = library?._id;
    orderPay.payment_by_end_user_id = studentUser._id;
    await Promise.all([
      student.save(),
      library.save(),
      finance.save(),
      institute.save(),
      user.save(),
      notify.save(),
      admin.save(),
      studentUser.save(),
      orderPay.save(),
      new_internal.save(),
      new_receipt.save(),
      account.save(),
      finance_user.save(),
    ]);
    return `${studentUser?.username}`;
  } catch (e) {
    console.log(e);
  }
};

exports.certificateInstituteFunction = async (
  order,
  paidBy,
  tx_amount,
  tx_amount_charges,
  // moduleId,
  is_author,
  cert_type,
  cert_content,
  is_original
) => {
  try {
    const student = await Student.findById({ _id: paidBy });
    const studentUser = await User.findById({ _id: `${student?.user}` });
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
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var notify = new StudentNotification({});
    var new_receipt = new FeeReceipt({});
    if (cert_type === "Leaving") {
      new_receipt.fee_payment_amount =
        institute?.certificate_fund_charges?.leaving_charges;
    } else if (cert_type === "Bonafide") {
      new_receipt.fee_payment_amount =
        institute?.certificate_fund_charges?.bona_charges;
    } else if (cert_type === "Transfer") {
      new_receipt.fee_payment_amount =
        institute?.certificate_fund_charges?.transfer_charges;
    } else if (cert_type === "Migration") {
      new_receipt.fee_payment_amount =
        institute?.certificate_fund_charges?.migration_charges;
    }
    new_receipt.receipt_generated_from = "BY_CERTIFICATE_AUTHORITY";
    new_receipt.fee_payment_mode = "Payment Gateway - PG";
    new_receipt.student = student?._id;
    new_receipt.fee_transaction_date = new Date();
    new_receipt.finance = finance?._id;
    new_receipt.invoice_count = orderPay?.payment_invoice_number;
    new_receipt.order_history = orderPay?._id;
    orderPay.fee_receipt = new_receipt?._id;
    orderPay.payment_student = student?._id;
    new_receipt.certificate = new_cert?._id;
    orderPay.payment_student_name = student?.valid_full_name;
    orderPay.payment_student_gr = student?.studentGRNO;
    var new_cert = new CertificateQuery({});
    new_cert.certificate_type = cert_type;
    new_cert.query_content = cert_content;
    new_cert.is_original = is_original === "false" ? false : true;
    new_cert.student = student?._id;
    new_cert.institute = institute?._id;
    new_cert.fee_receipt = new_receipt?._id;
    student.certificate.push(new_cert?._id);
    student.certificate_count += 1;
    student.studentCertificatePaidAmount += parseInt(tx_amount);
    institute.certificate_fund_collection.online += parseInt(tx_amount);
    if (is_author) {
      finance.financeBankBalance =
        finance.financeBankBalance + parseInt(tx_amount);
      finance.financeTotalBalance =
        finance.financeTotalBalance + parseInt(tx_amount);
      institute.insBankBalance = institute.insBankBalance + parseInt(tx_amount);
    } else {
      institute.adminRepayAmount =
        institute.adminRepayAmount + parseInt(tx_amount);
      admin.returnAmount += parseInt(tx_amount_charges);
    }
    // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount);
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} paid the ${
      new_cert?.certificate_type
    }/ (Rs.${parseInt(tx_amount)}) successfully`;
    notify.notify_hi_content = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} ने ${
      new_cert?.certificate_type
    }/ (Rs.${parseInt(tx_amount)}) का सफलतापूर्वक पेमेंट किया |`;
    notify.notify_mr_content = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} ने ${
      new_cert?.certificate_type
    }/ (रु.${parseInt(tx_amount)}) यशस्वीरित्या भरले`;
    notify.notifySender = student._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Online Fee";
    user.activity_tab.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    studentUser.payment_history.push(order);
    institute.payment_history.push(order);
    orderPay.payment_certificate = new_cert?._id;
    orderPay.payment_by_end_user_id = studentUser._id;
    await Promise.all([
      student.save(),
      finance.save(),
      institute.save(),
      user.save(),
      notify.save(),
      admin.save(),
      studentUser.save(),
      orderPay.save(),
      new_cert.save(),
      new_receipt.save(),
    ]);
    return `${studentUser?.username}`;
  } catch (e) {
    console.log(e);
  }
};

exports.otherFeesFunction = async (
  order,
  paidBy,
  tx_amount,
  tx_amount_charges,
  moduleId,
  is_author
) => {
  try {
    const student = await Student.findById({ _id: paidBy });
    const studentUser = await User.findById({ _id: `${student?.user}` });
    const institute = await InstituteAdmin.findById({
      _id: `${student?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    var finance_user = await User.findById({
      _id: `${finance?.financeHead?.user}`,
    });
    var new_internal = await OtherFees.findById({ _id: moduleId }).populate({
      path: "fee_structure",
      select: "department",
      populate: {
        path: "department",
        populate: {
          path: "bank_account",
        },
      },
    });
    if (new_internal?.bank_account) {
      var account = await BankAccount.findById({
        _id: `${new_internal?.bank_account}`,
      });
    } else {
      var account = await BankAccount.findById({
        _id: `${new_internal?.fee_structure?.department?.bank_account?._id}`,
      });
    }
    const user = await User.findById({
      _id: `${finance.financeHead.user}`,
    });
    const orderPay = await OrderPayment.findById({ _id: order });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var notify = new StudentNotification({});
    var new_receipt = new FeeReceipt({});
    new_receipt.fee_payment_amount = new_internal?.payable_amount;
    new_receipt.receipt_generated_from = "BY_FINANCE_MANAGER";
    new_receipt.fee_payment_mode = "Payment Gateway - PG";
    new_receipt.fee_structure = new_internal?.fee_structure?._id ?? null;
    new_receipt.student = student?._id;
    new_receipt.fee_transaction_date = new Date();
    new_receipt.finance = finance?._id;
    new_receipt.invoice_count = orderPay?.payment_invoice_number;
    new_receipt.order_history = orderPay?._id;
    orderPay.fee_receipt = new_receipt?._id;
    orderPay.payment_student = student?._id;
    orderPay.payment_module_type = "Other Fees";
    orderPay.payment_student_name = student?.valid_full_name;
    orderPay.payment_student_gr = student?.studentGRNO;
    new_receipt.other_fees = new_internal?._id;
    student.other_fees_paid_price += parseInt(tx_amount);
    if (student.other_fees_remain_price >= parseInt(tx_amount)) {
      student.other_fees_remain_price -= parseInt(tx_amount);
    }
    for (var ref of new_internal?.remaining_students) {
      if (`${ref}` === `${student?._id}`) {
        new_internal?.remaining_students?.pull(student?._id);
      }
    }
    new_internal.paid_students.push(student?._id);
    new_internal.status = "Paid";
    for (let val of new_internal?.fees_heads) {
      const nums = await FeeMaster.findById({ _id: `${val?.master}` });
      nums.paid_student.push(student?._id);
      nums.paid_student_count += 1;
      val.paid_amount += new_internal?.payable_amount;
      await nums.save();
    }
    // library.pending_fee.pull(student?._id);
    for (let ele of student?.other_fees) {
      if (`${ele?.fees}` === `${new_internal?._id}`) {
        ele.fee_receipt = new_receipt?._id;
        ele.status = "Paid";
      }
    }
    student.other_fee_receipt.push(new_receipt?._id);
    // if (new_internal?.fee_structure) {
    for (let ele of new_internal?.fees_heads) {
      new_receipt.fee_heads.push({
        head_id: ele?._id,
        head_name: ele?.head_name,
        paid_fee: ele?.head_amount,
        applicable_fee: ele?.head_amount,
        remain_fee: new_receipt?.fee_payment_amount - ele?.head_amount,
        fee_structure: new_internal?.fee_structure?._id ?? null,
        master: ele?.master,
        original_paid: new_receipt?.fee_payment_amount,
        is_society: ele?.is_society,
      });
    }
    // }
    if (is_author) {
      finance.financeBankBalance =
        finance.financeBankBalance + parseInt(tx_amount);
      finance.financeTotalBalance =
        finance.financeTotalBalance + parseInt(tx_amount);
      institute.insBankBalance = institute.insBankBalance + parseInt(tx_amount);
    } else {
      institute.adminRepayAmount =
        institute.adminRepayAmount + parseInt(tx_amount);
      admin.returnAmount += parseInt(tx_amount_charges);
      // depart.due_repay += parseInt(tx_amount);
      // depart.total_repay += parseInt(tx_amount);
      account.due_repay += parseInt(tx_amount);
      account.total_repay += parseInt(tx_amount);
      account.collect_online += parseInt(tx_amount);
    }
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} paid the ${
      new_internal?.other_fees_name
    } / (Rs.${parseInt(tx_amount)}) successfully`;
    notify.notify_hi_content = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} ने ${
      new_internal?.other_fees_name
    } / (Rs.${parseInt(tx_amount)}) का सफलतापूर्वक पेमेंट किया |`;
    notify.notify_mr_content = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} ने ${
      new_internal?.other_fees_name
    } / (रु.${parseInt(tx_amount)}) यशस्वीरित्या भरले`;
    notify.notifySender = student._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Online Fee";
    user.activity_tab.push(notify._id);
    finance_user.activity_tab.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    studentUser.payment_history.push(order);
    institute.payment_history.push(order);
    orderPay.payment_other_fees = new_internal?._id;
    orderPay.payment_by_end_user_id = studentUser._id;
    await Promise.all([
      student.save(),
      finance.save(),
      institute.save(),
      user.save(),
      notify.save(),
      admin.save(),
      studentUser.save(),
      orderPay.save(),
      new_internal.save(),
      new_receipt.save(),
      account.save(),
      finance_user.save(),
    ]);
    await studentOtherFeeReceipt(new_receipt._id, institute._id);
    return `${studentUser?.username}`;
  } catch (e) {
    console.log(e);
  }
};
