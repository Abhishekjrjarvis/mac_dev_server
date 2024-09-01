const invokeSpecificRegister = require("../Firebase/specific");
const Student = require("../models/Student");
const RemainingList = require("../models/Admission/RemainingList");
const moment = require("moment");
const Renewal = require("../models/Hostel/renewal");
const Admission = require("../models/Admission/Admission");
const HostelUnit = require("../models/Hostel/hostelUnit");
const { custom_date_time, ms_calc } = require("../helper/dayTimer");
const User = require("../models/User");
const axios = require("axios");
const Admin = require("../models/superAdmin");
const StudentNotification = require("../models/Marks/StudentNotification");
const InstituteAdmin = require("../models/InstituteAdmin");
const StudentMessage = require("../models/Content/StudentMessage");

exports.dueDateAlarm = async (aid, type, content, student_arr, title, doc) => {
  try {
    var ads_admin = await Admission.findById({ _id: aid }).populate({
      path: "admissionAdminHead",
    });
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    if (ads_admin?.alarm_enable_status === "Enable") {
      var valid_date = custom_date_time(3);
      ads_admin.alarm_enable = new Date(`${valid_date}`);
      if (student_arr?.length > 0) {
        var valid_ins = await InstituteAdmin.findById({
          _id: ads_admin?.institute,
        });
        var new_message = new StudentMessage({
          message: `${content}`,
          student_list: [...student_arr],
          student_list_count: student_arr?.length,
          message_type: `${type}`,
          from_name: "Institute Admin",
          message_title: title,
          message_document: doc,
          institute: valid_ins?._id,
          message_mode: "STUDENT_REMINDER",
        });
        valid_ins.student_reminder.push(new_message?._id);
        valid_ins.student_reminder_count += 1;
        await Promise.all([new_message.save(), valid_ins.save()]);
      }
      for (var ele of student_arr) {
        var all_remains = await RemainingList.find({
          student: ele?._id,
        }).populate({
          path: "fee_structure applicable_card",
        });
        var valid_price = 0;
        for (var remind of all_remains) {
          if (remind?.status === "Not Paid") {
            valid_price +=
              remind?.applicable_card?.paid_fee >=
              remind?.fee_structure?.applicable_fees
                ? 0
                : remind?.fee_structure?.applicable_fees -
                  remind?.applicable_card?.paid_fee;
          }
        }
        // for (let set of remind.remaining_array) {
        if (valid_price > 0) {
          s_admin.alarm_student.push({
            student: ele?._id,
            alarm_mode: `${type}`,
            content: content ? content : null,
          });
          s_admin.alarm_student_count += 1;
          if (type === "APP_NOTIFICATION") {
            var user = await User.findById({
              _id: `${ele?.user?._id}`,
            });
            var notify = new StudentNotification({});
            notify.notifyContent = `Admission Outstanding Fees Rs. ${valid_price} is due. Paid As Soon As Possible.`;
            notify.notifySender = `${ads_admin?.admissionAdminHead?.user}`;
            notify.notifyReceiever = `${user?._id}`;
            notify.notifyType = "Student";
            notify.notifyPublisher = ele?._id;
            user.activity_tab.push(notify?._id);
            user.student_message.push(new_message?._id);
            notify.notifyByAdmissionPhoto = aid;
            notify.notifyCategory = "Outstanding Reminder Alert";
            notify.redirectIndex = 39;
            await Promise.all([user.save(), notify.save()]);
            invokeSpecificRegister(
              "Specific Notification",
              `Admission Outstanding Fees Rs. ${valid_price} is due. Paid As Soon As Possible.`,
              "Fees Reminder",
              ele?.user._id,
              ele?.user.deviceToken
            );
          } else if (type === "EMAIL_NOTIFICATION") {
            var name = `${ele?.studentFirstName}${
              ele?.studentMiddleName ? ` ${ele?.studentMiddleName}` : ""
            } ${ele?.studentLastName}`;
            const subject = "Outstanding Dues Reminder";

            const message = `Dear ${name},
You are requested to clear your dues for outstanding fees amount Rs.${valid_price}.
Note: ${content ? content : ""}

Login by Downloading app 'Qviple: Your College Online' from playstore

OR

Through link : https://play.google.com/store/apps/details?id=com.mithakalminds.qviple

Regards
Accounts Section
${ele?.institute?.iName}
`;
            var user = await User.findById({
              _id: `${ele?.user?._id}`,
            });
            var notify = new StudentNotification({});
            notify.notifyContent = `${message}`;
            notify.notifySender = `${ads_admin?.admissionAdminHead?.user}`;
            notify.notifyReceiever = `${user?._id}`;
            notify.notifyType = "Student";
            notify.notifyPublisher = ele?._id;
            user.activity_tab.push(notify?._id);
            user.student_message.push(new_message?._id);
            notify.notifyByAdmissionPhoto = aid;
            notify.notifyCategory = "Outstanding Reminder Alert";
            notify.redirectIndex = 39;
            await Promise.all([user.save(), notify.save()]);
            const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${ele?.user?.userEmail}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
            const encodeURL = encodeURI(url);
            axios
              .post(encodeURL)
              .then((res) => {
                console.log("Sended Successfully");
              })
              .catch((e) => {
                console.log("Alarm Bug", e.message);
              });
          } else if (type === "SMS_NOTIFICATION") {
          }
        }
      }
      ads_admin.alarm_enable_status = "Disable";
      await ads_admin.save();
    } else {
    }
    // if(student_arr?.length > 0){
    //   var valid_ins = await InstituteAdmin.findById({ _id: ads_admin?.institute });
    //   const new_message = new StudentMessage({
    //     message: `${content}`,
    //     student_list: [...student_arr],
    //     student_list_count: student_arr?.length,
    //     message_type: `${type}`,
    //     from_name: "Institute Admin",
    //     message_title: title,
    //     message_document: doc,
    //     institute: valid_ins?._id,
    //     message_mode: "STUDENT_REMINDER"
    //   })
    //   valid_ins.student_reminder.push(new_message?._id);
    //   valid_ins.student_reminder_count += 1
    //   await Promise.all([ new_message.save(), valid_ins.save()]);
    // }
    await s_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renewal_request_alarm = async () => {
  try {
    var all_renewals = await Renewal.find({});
    for (var ref of all_renewals) {
      if (ref?.renewal_notification_status === "Requested") {
      } else {
        var latest = custom_date_time(0);
        var num = await ms_calc(
          moment(ref?.renewal_end).format("YYYY-MM-DD"),
          latest
        );
        if (num > 0 && num <= 15) {
          var one_student = await Student.findById({
            _id: `${ref?.renewal_student}`,
          });
          var one_unit = await HostelUnit.findById({
            _id: `${one_student?.student_unit}`,
          });
          const renew = new Renewal({});
          one_unit.renewal_receieved_application.push({
            student: one_student?._id,
            fee_remain: one_student?.hostel_fee_structure?.total_admission_fees,
            appId: ref?.renewal_application,
          });
          one_unit.renewal_receieved_application_count += 1;
          renew.renewal_status = "Current Stay Request";
          renew.renewal_application = ref?.renewal_application;
          renew.renewal_student = one_student?._id;
          renew.renewal_start = ref?.renewal_start;
          renew.renewal_end = ref?.renewal_end;
          renew.renewal_hostel = ref?.renewal_hostel;
          renew.renewal_unit = one_student?.student_unit;
          one_student.student_renewal.push(renew?._id);
          ref.renewal_notification_status = "Requested";
          // Check When Comes Again Later Add
          renew.renewal_notification_status = "Requested";
          await Promise.all([
            ref.save(),
            one_student.save(),
            renew.save(),
            one_unit.save(),
          ]);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.quote_disappear = async (req, res) => {
  try {
    var all_user = await User.find({}).select("daily_quote_query");
    if (all_user?.length > 0) {
      for (var ref of all_user) {
        if (ref?.daily_quote_query?.status === "Displayed") {
          ref.daily_quote_query.quote = null;
          ref.daily_quote_query.status = "Not Display";
          await ref.save();
        }
      }
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};

exports.outstanding_reminder_disable_query = async (req, res) => {
  try {
    var ads_admin = await Admission.find({});
    var date = custom_date_time(0);
    for (var val of ads_admin) {
      if (`${date}` === moment(val?.alarm_enable).format("YYYY-MM-DD")) {
        val.alarm_enable_status = "Enable";
        await val.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.document_alarm = async (
  aid,
  type,
  content,
  student_arr,
  title,
  doc
) => {
  try {
    var ads_admin = await Admission.findById({ _id: aid }).populate({
      path: "admissionAdminHead",
    });
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    if (ads_admin?.document_alarm_enable_status === "Enable") {
      var valid_date = custom_date_time(3);
      // ads_admin.document_alarm_enable = new Date(`${valid_date}`);
      if (student_arr?.length > 0) {
        var valid_ins = await InstituteAdmin.findById({
          _id: ads_admin?.institute,
        });
        var new_message = new StudentMessage({
          message: `${content ?? ""}`,
          student_list: [...student_arr],
          student_list_count: student_arr?.length,
          message_type: `${type}`,
          from_name: "Institute Admin",
          message_title: title,
          message_document: doc,
          institute: valid_ins?._id,
          message_mode: "DOCUMENT_STUDENT_REMINDER",
        });
        valid_ins.student_reminder.push(new_message?._id);
        valid_ins.student_reminder_count += 1;
        await Promise.all([new_message.save(), valid_ins.save()]);
      }
      var numss = {};
      for (var ele of student_arr) {
        for (let val of ele?.collect_docs) {
          numss[val?.docs?.document_name] = val?.not_filled;
        }
        let cls = [];
        Object.entries(numss).forEach(([key, value], index) => {
          cls.push(`${index + 1}. ${key}: ${value}`);
        });
        // for (let set of remind.remaining_array) {
        if (ele?.collect_docs?.length > 0) {
          s_admin.alarm_student.push({
            student: ele?._id,
            alarm_mode: `${type}`,
            content: content ? content : null,
          });
          s_admin.alarm_student_count += 1;
          if (type === "APP_NOTIFICATION") {
            var user = await User.findById({
              _id: `${ele?.user?._id}`,
            });
            var notify = new StudentNotification({});
            notify.notifyContent = `${ele?.studentFirstName} ${
              ele?.studentMiddleName ?? ele?.studentFatherName
            } ${ele?.studentLastName},
Your below documents are still pending for submission in ${valid_ins?.insName}.
Kindly visit institute with below documents in person.
Documents Pending:-
${cls}


Note: ${content ?? ""}`;
            notify.notifySender = `${ads_admin?.admissionAdminHead?.user}`;
            notify.notifyReceiever = `${user?._id}`;
            notify.notifyType = "Student";
            notify.notifyPublisher = ele?._id;
            user.activity_tab.push(notify?._id);
            user.student_message.push(new_message?._id);
            notify.notifyByAdmissionPhoto = aid;
            notify.notifyCategory = "Document Outstanding Reminder Alert";
            notify.redirectIndex = 39;
            await Promise.all([user.save(), notify.save()]);
            invokeSpecificRegister(
              "Specific Notification",
              `Admission Document Reminder`,
              "Document Reminder",
              ele?.user._id,
              ele?.user.deviceToken
            );
          } else if (type === "EMAIL_NOTIFICATION") {
            var name = `${ele?.studentFirstName}${
              ele?.studentMiddleName ? ` ${ele?.studentMiddleName}` : ""
            } ${ele?.studentLastName}`;
            const subject = "Pending Document Reminder";

            const message = `${ele?.studentFirstName} ${
              ele?.studentMiddleName ?? ele?.studentFatherName
            } ${ele?.studentLastName},
Your below documents are still pending for submission in ${valid_ins?.insName}.
Kindly visit institute with below documents in person.
Documents Pending:-
${cls}


Note: ${content ?? ""}`;
            var user = await User.findById({
              _id: `${ele?.user?._id}`,
            });
            var notify = new StudentNotification({});
            notify.notifyContent = `${message}`;
            notify.notifySender = `${ads_admin?.admissionAdminHead?.user}`;
            notify.notifyReceiever = `${user?._id}`;
            notify.notifyType = "Student";
            notify.notifyPublisher = ele?._id;
            user.activity_tab.push(notify?._id);
            user.student_message.push(new_message?._id);
            notify.notifyByAdmissionPhoto = aid;
            notify.notifyCategory = "Document Outstanding Reminder Alert";
            notify.redirectIndex = 39;
            await Promise.all([user.save(), notify.save()]);
            const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${ele?.studentEmail}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
            const encodeURL = encodeURI(url);
            axios
              .post(encodeURL)
              .then((res) => {
                console.log("Sended Successfully");
              })
              .catch((e) => {
                console.log("Alarm Bug", e.message);
              });
          } else if (type === "SMS_NOTIFICATION") {
          }
        }
        numss = {};
        cls = [];
      }
      // ads_admin.document_alarm_enable_status = "Disable";
      await ads_admin.save();
    } else {
    }
    await s_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.outstanding_document_reminder_disable_query = async (req, res) => {
  try {
    var ads_admin = await Admission.find({});
    var date = custom_date_time(0);
    for (var val of ads_admin) {
      if (
        `${date}` === moment(val?.document_alarm_enable).format("YYYY-MM-DD")
      ) {
        val.document_alarm_enable_status = "Enable";
        await val.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};
