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

exports.dueDateAlarm = async (aid, type, content) => {
  try {
    var ads_admin = await Admission.findById({ _id: aid }).select(
      "alarm_enable alarm_enable_status"
    );
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var all_remains = await RemainingList.find({})
      .populate({
        path: "fee_structure",
      })
      .populate({
        path: "student",
        select: "user studentFirstName studentMiddleName studentLastName",
        populate: {
          path: "user institute",
          select: "deviceToken insName userEmail",
        },
      });
    if (ads_admin?.alarm_enable_status === "Enable") {
      var valid_date = custom_date_time(3);
      ads_admin.alarm_enable = new Date(`${valid_date}`);
      for (var remind of all_remains) {
        // for (let set of remind.remaining_array) {
        if (remind?.status === "Not Paid") {
          var valid_price =
            remind?.paid_fee >= remind?.fee_structure?.applicable_fees
              ? 0
              : remind?.fee_structure?.applicable_fees - remind?.paid_fee;
          if (valid_price > 0) {
            s_admin.alarm_student.push({
              student: remind?.student?._id,
              alarm_mode: `${type}`,
              content: content ? content : null,
            });
            s_admin.alarm_student_count += 1;
            if (type === "APP_NOTIFICATION") {
              invokeSpecificRegister(
                "Specific Notification",
                `Admission Outstanding Fees Rs. ${valid_price} is due. Paid As Soon As Possible.`,
                "Fees Reminder",
                remind?.student?.user._id,
                remind?.student?.user.deviceToken
              );
            } else if (type === "EMAIL_NOTIFICATION") {
              var name = `${remind?.student?.studentFirstName}${
                remind?.student?.studentMiddleName
                  ? ` ${remind?.student?.studentMiddleName}`
                  : ""
              } ${remind?.student?.studentLastName}`;
              const subject = "Outstanding Dues Reminder";

              const message = `Dear ${name},
You are requested to clear your dues for outstanding fees amount Rs.${valid_price}.
Note: ${content ? content : ""}

Login by Downloading app 'Qviple: Your College Online' from playstore

OR

Through link : https://play.google.com/store/apps/details?id=com.mithakalminds.qviple

Regards
Accounts Section
${remind?.student?.institute?.iName}
`;
              const url = `https://transemail.dove-soft.com/v2/email/send?apikey=${process.env.EMAIL_API_KEY}&subject=${subject}&to=${remind?.student?.user?.userEmail}&bodyText=${message}&encodingType=0&from=connect@qviple.com&from_name=Qviple`;
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
      }
      ads_admin.alarm_enable_status = "Disable";
      await ads_admin.save();
    } else {
    }
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
