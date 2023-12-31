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
const HostelUnit = require("../models/Hostel/hostelUnit");
const HostelRoom = require("../models/Hostel/hostelRoom");
const HostelBed = require("../models/Hostel/hostelBed");
const BankAccount = require("../models/Finance/BankAccount");
const {
  add_all_installment,
  add_total_installment,
  set_fee_head_query,
} = require("../Functions/hostelInstallment");
const Renewal = require("../models/Hostel/renewal");
const { custom_month_query, custom_month_query_hostel } = require("./dayTimer");

exports.insert_multiple_hostel_status = async (
  args,
  uargs,
  iargs,
  sid,
  unit_args,
  finance,
  receipt
) => {
  try {
    var filtered_account = await BankAccount.findOne({
      hostel: args?.applicationHostel,
    });
    const statusArray = [
      {
        content: `Your Hostel has been confirmed, You will be alloted your bed shortly, Stay Update!`,
        applicationId: args?._id,
        instituteId: iargs?._id,
        hostelUnit: unit_args?._id,
        flow_status: "Hostel Application",
        student: sid,
        fee_receipt: receipt?._id,
      },
      {
        content: `Your application for ${unit_args.hostel_unit_name} have been filled successfully.

Below is the Hostel Admission process:
1. You will get notified here after your selection or rejection from the institute. ( In case there is no notification within 3 working days, visit or contact the hostel department)

2.After selection, confirm from your side and start the hostel admission process.

3.After confirmation from your side, visit the institute with the applicable fees. (You will get application fees information on your selection from the institute side. (Till then check our fee structures)

4.Payment modes available for fee payment: 
Online: UPI, Debit Card, Credit Card, Net banking & other payment apps (Phonepe, Google pay, Paytm)

5.After submission and verification of documents, you are required to pay application hostel admission fees.

6. Pay application admission fees and your hostel admission will be confirmed and complete.

7. For cancellation and refund, contact the hostel department.

Note: Stay tuned for further updates. Tap here to see username ${uargs?.username}`,
        applicationId: args?._id,
        instituteId: iargs?._id,
        document_visible: true,
        hostelUnit: unit_args?._id,
        flow_status: "Hostel Application",
        finance: finance?._id,
        bank_account: filtered_account?._id,
        student: sid,
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
        "Hostel Status",
        arr._id,
        arr.deviceToken
      );
    }
    return true;
  } catch (e) {
    console.log(e);
  }
};

exports.fee_reordering_hostel = async (
  type,
  mode,
  price,
  stu_query,
  apply,
  institute,
  finance,
  hostel,
  s_admin,
  new_receipt,
  user,
  one_unit,
  roomId,
  bed_number,
  start_date
) => {
  try {
    // console.log(start_date);
    const room = await HostelRoom.findOne({
      $and: [{ _id: roomId }, { hostelUnit: one_unit?._id }],
    });
    var renew = new Renewal({});
    const bed = new HostelBed({});
    var student = await Student.findById({ _id: `${stu_query?._id}` }).populate(
      {
        path: "hostel_fee_structure",
      }
    );
    var is_install;
    if (
      price <= student?.hostel_fee_structure?.total_admission_fees &&
      price <= student?.hostel_fee_structure?.one_installments?.fees
    ) {
      is_install = true;
    } else {
      is_install = false;
    }
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.unit = one_unit?._id;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    var total_amount = add_total_installment(student);
    if (price > 0 && !is_install) {
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
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.active_payment_type = "One Time Fees";
      new_remainFee.paid_fee += price;
      new_remainFee.remaining_fee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      student.remainingFeeList_count += 1;
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      hostel.remainingFee.push(student._id);
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      student.hostelRemainFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      apply.remainingFee +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      hostel.remainingFeeCount +=
        student?.hostel_fee_structure?.total_admission_fees - price;
      const valid_one_time_fees =
        student?.hostel_fee_structure?.total_admission_fees - price == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        hostel.remainingFee.pull(student._id);
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
    } else if (is_install && price > 0) {
      hostel.remainingFee.push(student._id);
      student.hostelRemainFeeCount += total_amount - price;
      apply.remainingFee += total_amount - price;
      hostel.remainingFeeCount += total_amount - price;
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
      new_remainFee.fee_structure = student?.hostel_fee_structure?._id;
      if (total_amount - price > 0 && price > 0) {
        await add_all_installment(
          apply,
          institute._id,
          new_remainFee,
          price,
          student
        );
      }
      if (
        total_amount - price > 0 &&
        price > 0 &&
        `${student?.hostel_fee_structure?.total_installments}` === "1"
      ) {
        new_remainFee.remaining_array.push({
          remainAmount: total_amount - price,
          appId: apply._id,
          instituteId: institute._id,
          installmentValue: "Installment Remain",
          isEnable: true,
        });
      }
    }
    if (mode === "Offline") {
      hostel.collected_fee += price;
      hostel.offlineFee += price;
      apply.collectedFeeCount += price;
      apply.offlineFee += price;
      finance.financeHostelBalance += price;
      finance.financeTotalBalance += price;
      finance.financeSubmitBalance += price;
    } else if (mode === "Online") {
      hostel.onlineFee += price;
      apply.collectedFeeCount += price;
      apply.onlineFee += price;
      finance.financeHostelBalance += price;
      finance.financeTotalBalance += price;
      finance.financeBankBalance += price;
    } else {
    }
    student.hostelPaidFeeCount += price;
    student.paidFeeList.push({
      paidAmount: price,
      appId: apply._id,
    });
    await set_fee_head_query(student, price, apply, new_receipt);
    apply.allottedApplication.push({
      student: student._id,
      payment_status: mode,
      alloted_room: room?.room_name,
      alloted_status: "Alloted",
      fee_remain: student.hostelRemainFeeCount,
      paid_status: student.hostelRemainFeeCount == 0 ? "Paid" : "Not Paid",
    });
    apply.allotCount += 1;
    bed.bed_allotted_candidate = student?._id;
    bed.hostelRoom = room?._id;
    bed.bed_number = parseInt(bed_number);
    if (room?.vacant_count > 0) {
      room.vacant_count -= 1;
    }
    room.beds.push(bed?._id);
    one_unit.hostelities_count += 1;
    one_unit.hostelities.push(student?._id);
    hostel.hostelities_count += 1;
    student.student_bed_number = bed?._id;
    student.student_unit = one_unit?._id;
    if (student?.studentGender === "Male") {
      hostel.boy_count += 1;
    } else if (student?.studentGender === "Female") {
      hostel.girl_count += 1;
    } else if (student?.studentGender === "Other") {
      hostel.other_count += 1;
    } else {
    }
    const order = new OrderPayment({});
    order.payment_module_type = "Hostel Fees";
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
    var valid_end = student?.hostel_fee_structure?.structure_month;
    var month_query = custom_month_query_hostel(
      valid_end,
      new Date(`${start_date}`)
    );
    student.hostel_renewal = new Date(`${month_query}`);
    renew.renewal_student = student?._id;
    renew.renewal_application = apply?._id;
    new_remainFee.renewal_start = new Date(`${start_date}`);
    new_remainFee.renewal_end = student?.hostel_renewal;
    renew.renewal_start = new Date(`${start_date}`);
    renew.renewal_end = student?.hostel_renewal;
    renew.renewal_status = "Current Stay";
    renew.renewal_hostel = hostel?._id;
    student.student_renewal.push(renew?._id);
    await Promise.all([
      new_receipt.save(),
      new_remainFee.save(),
      order.save(),
      one_unit.save(),
      hostel.save(),
      bed.save(),
      room.save(),
      student.save(),
      renew.save(),
      institute.save(),
    ]);
  } catch (e) {
    console.log(e);
  }
};
