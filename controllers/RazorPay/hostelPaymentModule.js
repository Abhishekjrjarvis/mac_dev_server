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
  hostel_lookup_applicable_grant,
} = require("../../Functions/hostelInstallment");
const Hostel = require("../../models/Hostel/hostel");
const Renewal = require("../../models/Hostel/renewal");
const { custom_month_query } = require("../../helper/dayTimer");
const BankAccount = require("../../models/Finance/BankAccount");

exports.hostelInstituteFunction = async (
  order,
  paidBy,
  tx_amount_ad,
  tx_amount_ad_charges,
  moduleId,
  statusId,
  paidTo,
  type,
  is_author,
  rid
) => {
  try {
    var student = await Student.findById({ _id: paidBy }).populate({
      path: "hostel_fee_structure",
    });
    var user = await User.findById({ _id: `${student.user}` });
    var apply = await NewApplication.findById({ _id: moduleId });
    var orderPay = await OrderPayment.findById({ _id: order });
    var admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var one_hostel = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    });
    // var depart = await Department.findById({ _id: `${apply?.applicationDepartment}`})
    var account = await BankAccount.findOne({ hostel: `${one_hostel?._id}` });
    var ins = await InstituteAdmin.findById({ _id: `${paidTo}` });
    var finance = await Finance.findById({
      _id: `${ins?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    var finance_user = await User.findById({
      _id: `${finance?.financeHead?.user}`,
    });
    var is_install;
    if (
      parseInt(tx_amount_ad) <=
        student?.hostel_fee_structure?.total_admission_fees &&
      parseInt(tx_amount_ad) >
        student?.hostel_fee_structure?.one_installments?.fees
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
      business_data.b_to_c_name = "Hostel Fees";
      business_data.finance = finance._id;
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = parseInt(tx_amount_ad);
      await business_data.save();
    }
    if (statusId) {
      var total_amount = add_total_installment(student);
      const status = await Status.findById({ _id: statusId });
      const aStatus = new Status({});
      var renew = new Renewal({});
      const new_receipt = new FeeReceipt({
        fee_payment_mode: "Payment Gateway / Online",
        fee_payment_amount: parseInt(tx_amount_ad),
      });
      new_receipt.student = student?._id;
      new_receipt.fee_transaction_date = new Date();
      new_receipt.application = apply?._id;
      new_receipt.finance = finance?._id;
      renew.renewal_student = student?._id;
      renew.renewal_application = apply?._id;
      ins.invoice_count += 1;
      new_receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${ins.invoice_count}`;
      const notify = new Notification({});
      one_hostel.onlineFee += parseInt(tx_amount_ad);
      // one_hostel.collected_fee += parseInt(tx_amount_ad);
      apply.onlineFee += parseInt(tx_amount_ad);
      apply.collectedFeeCount += parseInt(tx_amount_ad);
      finance.financeHostelBalance += parseInt(tx_amount_ad);
      student.hostelPaidFeeCount += parseInt(tx_amount_ad);
      if (is_author) {
        finance.financeBankBalance =
          finance.financeBankBalance + parseInt(tx_amount_ad);
        finance.financeTotalBalance =
          finance.financeTotalBalance + parseInt(tx_amount_ad);
        ins.insBankBalance = ins.insBankBalance + parseInt(tx_amount_ad);
      } else {
        admin.returnAmount += parseInt(tx_amount_ad_charges);
        ins.adminRepayAmount += parseInt(tx_amount_ad);
        // depart.due_repay += parseInt(tx_amount);
        // depart.total_repay += parseInt(tx_amount);
        account.due_repay += parseInt(tx_amount_ad);
        account.total_repay += parseInt(tx_amount_ad);
        account.collect_online += parseInt(tx_amount_ad);
      }
      // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
      if (parseInt(tx_amount_ad) > 0 && is_install) {
        one_hostel.remainingFee.push(student._id);
        student.hostelRemainFeeCount += total_amount - parseInt(tx_amount_ad);
        apply.remainingFee += total_amount - parseInt(tx_amount_ad);
        one_hostel.remainingFeeCount += total_amount - parseInt(tx_amount_ad);
        var new_remainFee = new RemainingList({
          appId: apply._id,
          applicable_fee: total_amount,
          remaining_flow: "Hostel Application",
          institute: ins?._id,
        });
        new_remainFee.access_mode_card = "Installment_Wise";
        new_remainFee.remaining_array.push({
          remainAmount: parseInt(tx_amount_ad),
          appId: apply._id,
          status: "Paid",
          instituteId: ins._id,
          installmentValue: "First Installment",
          mode: "online",
          fee_receipt: new_receipt?._id,
        });
        new_remainFee.active_payment_type = "First Installment";
        new_remainFee.paid_fee += parseInt(tx_amount_ad);
        new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
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
          applicable_fee: student?.hostel_fee_structure?.total_admission_fees,
          institute: ins?._id,
          remaining_flow: "Hostel Application",
        });
        new_remainFee.access_mode_card = "One_Time_Wise";
        new_remainFee.remaining_array.push({
          remainAmount: parseInt(tx_amount_ad),
          appId: apply._id,
          status: "Paid",
          instituteId: ins._id,
          installmentValue: "One Time Fees",
          mode: "online",
          fee_receipt: new_receipt?._id,
        });
        new_remainFee.active_payment_type = "One Time Fees";
        new_remainFee.paid_fee += parseInt(tx_amount_ad);
        new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
        new_remainFee.remaining_fee +=
          student?.hostel_fee_structure?.total_admission_fees -
          parseInt(tx_amount_ad);
        student.remainingFeeList.push(new_remainFee?._id);
        student.remainingFeeList_count += 1;
        new_remainFee.student = student?._id;
        new_remainFee.fee_receipts.push(new_receipt?._id);
        one_hostel.remainingFee.push(student._id);
        student.hostelRemainFeeCount +=
          student?.hostel_fee_structure?.total_admission_fees -
          parseInt(tx_amount_ad);
        apply.remainingFee +=
          student?.hostel_fee_structure?.total_admission_fees -
          parseInt(tx_amount_ad);
        one_hostel.remainingFeeCount +=
          student?.hostel_fee_structure?.total_admission_fees -
          parseInt(tx_amount_ad);
        const valid_one_time_fees =
          student?.hostel_fee_structure?.total_admission_fees -
            parseInt(tx_amount_ad) ==
          0
            ? true
            : false;
        if (valid_one_time_fees) {
          one_hostel.remainingFee.pull(student._id);
        } else {
          new_remainFee.remaining_array.push({
            remainAmount:
              student?.hostel_fee_structure?.total_admission_fees -
              parseInt(tx_amount_ad),
            appId: apply._id,
            status: "Not Paid",
            instituteId: ins._id,
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
      for (let app of apply?.selectedApplication) {
        if (`${app.student}` === `${student._id}`) {
          apply.selectedApplication.pull(app._id);
        } else {
        }
      }
      apply.confirmedApplication.push({
        student: student._id,
        payment_status: "Online",
        install_type: is_install
          ? "First Installment Paid"
          : "One Time Fees Paid",
        fee_remain: is_install
          ? total_amount - parseInt(tx_amount_ad)
          : student?.hostel_fee_structure?.total_admission_fees -
            parseInt(tx_amount_ad),
      });
      apply.confirmCount += 1;
      // for (var match of student.paidFeeList) {
      //   if (`${match.appId}` === `${apply._id}`) {
      //     match.paidAmount += parseInt(tx_amount_ad);
      //   }
      // }
      new_remainFee.renewal_start = new Date();
      new_remainFee.renewal_end = student?.hostel_renewal;
      renew.renewal_start = new Date();
      renew.renewal_end = student?.hostel_renewal;
      renew.renewal_status = "Current Stay";
      renew.renewal_hostel = one_hostel?._id;
      student.student_renewal.push(renew?._id);
      student.paidFeeList.push({
        paidAmount: parseInt(tx_amount_ad),
        appId: apply._id,
      });
      aStatus.content = `Your hostel seat has been confirmed, You will be alloted your bed shortly, Stay Updated!`;
      aStatus.applicationId = apply._id;
      aStatus.fee_receipt = new_receipt?._id;
      aStatus.document_visible = false;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = ins._id;
      user.payment_history.push(order);
      (status.payMode = "online"), (status.isPaid = "Paid");
      notify.notifyContent = `${student.studentFirstName} ${
        student.studentMiddleName ? `${student.studentMiddleName} ` : ""
      } ${
        student.studentLastName
      } your transaction is successfull for Hostel Admission Fee ${parseInt(
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
      notify.notifySender = one_hostel?._id;
      notify.notifyReceiever = user._id;
      // ins.iNotify.push(notify._id);
      // notify.institute = ins._id;
      user.activity_tab.push(notify._id);
      finance_user.activity_tab.push(notify._id);
      notify.notifyCategory = "Hostel Online Fee";
      notify.user = user._id;
      notify.notifyByStudentPhoto = student._id;
      ins.payment_history.push(order);
      orderPay.payment_admission = apply._id;
      orderPay.payment_by_end_user_id = user?._id;
      new_receipt.order_history = orderPay?._id;
      orderPay.fee_receipt = new_receipt?._id;
      await Promise.all([
        student.save(),
        user.save(),
        apply.save(),
        finance.save(),
        ins.save(),
        admin.save(),
        status.save(),
        aStatus.save(),
        one_hostel.save(),
        notify.save(),
        orderPay.save(),
        new_receipt.save(),
        new_remainFee.save(),
        renew.save(),
        account.save(),
        finance_user.save(),
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
      const remaining_fee_lists = await RemainingList.findById({
        _id: rid,
      });
      remaining_fee_lists.fee_receipts.push(new_receipt?._id);
      ins.invoice_count += 1;
      new_receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${ins.invoice_count}`;
      await render_installment(
        type,
        student,
        "Online",
        parseInt(tx_amount_ad),
        one_hostel,
        student?.hostel_fee_structure,
        remaining_fee_lists,
        new_receipt,
        apply,
        ins
      );
      remaining_fee_lists.paid_fee += parseInt(tx_amount_ad);
      if (remaining_fee_lists.remaining_fee >= parseInt(tx_amount_ad)) {
        remaining_fee_lists.remaining_fee -= parseInt(tx_amount_ad);
      }
      student.hostelPaidFeeCount += parseInt(tx_amount_ad);
      if (one_hostel?.remainingFeeCount >= parseInt(tx_amount_ad)) {
        one_hostel.remainingFeeCount -= parseInt(tx_amount_ad);
      }
      if (apply?.remainingFee >= parseInt(tx_amount_ad)) {
        apply.remainingFee -= parseInt(tx_amount_ad);
      }
      if (student?.hostelRemainFeeCount >= parseInt(tx_amount_ad)) {
        student.hostelRemainFeeCount -= parseInt(tx_amount_ad);
      }
      // admission.remainingFee.pull(student._id);
      one_hostel.onlineFee += parseInt(tx_amount_ad);
      // one_hostel.collected_fee += parseInt(tx_amount_ad);
      apply.onlineFee += parseInt(tx_amount_ad);
      apply.collectedFeeCount += parseInt(tx_amount_ad);
      finance.financeHostelBalance += parseInt(tx_amount_ad);
      if (is_author) {
        finance.financeBankBalance =
          finance.financeBankBalance + parseInt(tx_amount_ad);
        finance.financeTotalBalance =
          finance.financeTotalBalance + parseInt(tx_amount_ad);
        ins.insBankBalance = ins.insBankBalance + parseInt(tx_amount_ad);
      } else {
        admin.returnAmount += parseInt(tx_amount_ad_charges);
        ins.adminRepayAmount += parseInt(tx_amount_ad);
        account.due_repay += parseInt(tx_amount_ad);
        account.total_repay += parseInt(tx_amount_ad);
        account.collect_online += parseInt(tx_amount_ad);
      }
      // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount_ad);
      await update_fee_head_query(
        student,
        parseInt(tx_amount_ad),
        apply,
        new_receipt
      );
      await hostel_lookup_applicable_grant(
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
      if (type === "One Time Fees Remain") {
        await remain_one_time_query(
          one_hostel,
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
      orderPay.payment_by_end_user_id = user?._id;
      new_receipt.order_history = orderPay?._id;
      orderPay.fee_receipt = new_receipt?._id;
      await Promise.all([
        one_hostel.save(),
        student.save(),
        apply.save(),
        finance.save(),
        ins.save(),
        orderPay.save(),
        admin.save(),
        new_receipt.save(),
        remaining_fee_lists.save(),
        account.save(),
      ]);
    }
    return `${user?.username}`;
  } catch (e) {
    console.log(e);
  }
};

exports.directHostelInstituteFunction = async (
  exist_order,
  paidBy,
  tx_amount_ad,
  tx_amount_ad_charges,
  moduleId,
  is_author,
  body
) => {
  try {
    var user = await User.findById({ _id: `${paidBy}` });
    var price = parseInt(tx_amount_ad);
    var apply = await NewApplication.findById({ _id: `${moduleId}` });
    const one_hostel = await Hostel.findById({
      _id: `${apply.hostelAdmin}`,
    });
    var account = BankAccount.findOne({ hostel: `${one_hostel?._id}` });
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var institute = await InstituteAdmin.findById({
      _id: `${admission?.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart?.[0]}`,
    });
    var renew = new Renewal({});
    var structure = await FeeStructure.findById({
      _id: `${apply?.direct_linked_structure}`,
    });
    var status = new Status({});
    // var notify = new StudentNotification({});
    var student = new Student({ ...body });
    student.valid_full_name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    const studentOptionalSubject = body?.optionalSubject
      ? body?.optionalSubject
      : [];
    for (var file of body?.fileArray) {
      if (file.name === "file") {
        student.photoId = "0";
        student.studentProfilePhoto = file.key;
      } else if (file.name === "addharFrontCard")
        student.studentAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        student.studentAadharBackCard = file.key;
      else if (file.name === "bankPassbook")
        student.studentBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        student.studentCasteCertificatePhoto = file.key;
      else {
        student.studentDocuments.push({
          documentName: file.name,
          documentKey: file.key,
          documentType: file.type,
        });
      }
    }
    if (studentOptionalSubject?.length > 0) {
      student.studentOptionalSubject?.push(...studentOptionalSubject);
    }
    status.hostel_fee_structure = structure?._id;
    student.hostel_fee_structure = structure?._id;
    student.hostel_fee_structure_month = structure?.structure_month;
    var month_query = custom_month_query(structure?.structure_month);
    student.hostel_renewal = new Date(`${month_query}`);
    await student.save();
    student = await Student.findById({ _id: student?._id }).populate({
      path: "hostel_fee_structure",
    });
    var order = await OrderPayment.findById({ _id: exist_order });
    var new_receipt = new FeeReceipt({ ...body });
    new_receipt.student = student?._id;
    new_receipt.fee_transaction_date = new Date().toISOString();
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    order.payment_module_type = "Direct Hostel Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = "Online";
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    institute.invoice_count += 1;
    order.payment_invoice_number = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    user.payment_history.push(order._id);
    renew.renewal_student = student?._id;
    renew.renewal_application = apply?._id;
    institute.payment_history.push(order._id);
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    var total_amount = add_total_installment(student);
    var is_install;
    if (
      price <= student?.hostel_fee_structure?.total_admission_fees &&
      price > student?.hostel_fee_structure?.one_installments?.fees
    ) {
      is_install = false;
    } else {
      is_install = true;
    }
    if (price > 0 && is_install) {
      one_hostel.remainingFee.push(student._id);
      student.hostelRemainFeeCount += total_amount - price;
      apply.remainingFee += total_amount - price;
      one_hostel.remainingFeeCount += total_amount - price;
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: total_amount,
        remaining_flow: "Hostel Application",
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "Installment_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "First Installment",
        mode: "Online",
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "First Installment";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      new_remainFee.remaining_fee += total_amount - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      await add_all_installment(
        apply,
        institute._id,
        new_remainFee,
        price,
        student
      );
    } else if (price > 0 && !is_install) {
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: student?.hostel_fee_structure?.total_admission_fees,
        remaining_flow: "Hostel Application",
        institute: institute?._id,
      });
      new_remainFee.access_mode_card = "One_Time_Wise";
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "One Time Fees",
        mode: "Online",
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "One Time Fees";
      new_remainFee.paid_fee += price;
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      new_remainFee.remaining_fee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      one_hostel.remainingFee.push(student._id);
      student.hostelRemainFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      apply.remainingFee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      one_hostel.remainingFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      const valid_one_time_fees =
        student?.hostel_fee_structure?.total_admission_fees - price == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        one_hostel.remainingFee.pull(student._id);
      } else {
        new_remainFee.remaining_array.push({
          remainAmount:
            student?.hostel_fee_structure?.total_admission_fees - price,
          appId: apply._id,
          status: "Not Paid",
          instituteId: institute._id,
          installmentValue: "One Time Fees Remain",
          isEnable: true,
        });
      }
    }
    one_hostel.onlineFee += price;
    apply.collectedFeeCount += price;
    apply.onlineFee += price;
    finance.financeHostelBalance += price;
    finance.financeTotalBalance += price;
    finance.financeBankBalance += price;
    if (is_author) {
      finance.financeAdmissionBalance += price;
      finance.financeTotalBalance += price;
      finance.financeBankBalance += price;
      institute.insBankBalance += price;
    } else {
      s_admin.returnAmount += parseInt(tx_amount_ad_charges);
      institute.adminRepayAmount += price;
      account.due_repay += price;
      account.total_repay += price;
      account.collect_online += price;
    }
    await set_fee_head_query(student, price, apply, new_receipt);
    for (let app of apply?.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.selectedApplication.pull(app._id);
      } else {
      }
    }
    apply.confirmedApplication.push({
      student: student._id,
      payment_status: mode,
      install_type: is_install
        ? "First Installment Paid"
        : "One Time Fees Paid",
      fee_remain: is_install
        ? total_amount - price
        : student?.hostel_fee_structure?.total_admission_fees - price,
    });
    apply.confirmCount += 1;
    student.hostelPaidFeeCount += price;
    student.paidFeeList.push({
      paidAmount: price,
      appId: apply._id,
    });
    status.content = `Your hostel has been confirmed, You will be alloted to your room / bed shortly, Stay Update!. Please visit hostel once to check sourroundings.`;
    status.applicationId = apply._id;
    user.applicationStatus.push(status._id);
    status.instituteId = institute._id;
    status.document_visible = true;
    new_remainFee.renewal_start = new Date();
    new_remainFee.renewal_end = student?.hostel_renewal;
    renew.renewal_start = new Date();
    renew.renewal_end = student?.hostel_renewal;
    renew.renewal_status = "Current Stay";
    renew.renewal_hostel = one_hostel?._id;
    student.student_renewal.push(renew?._id);
    await Promise.all([
      one_hostel.save(),
      apply.save(),
      student.save(),
      finance.save(),
      user.save(),
      order.save(),
      institute.save(),
      s_admin.save(),
      new_remainFee.save(),
      new_receipt.save(),
      status.save(),
      renew.save(),
      account.save(),
    ]);
    return `${user?.username}`;
  } catch (e) {
    console.log(e);
  }
};
