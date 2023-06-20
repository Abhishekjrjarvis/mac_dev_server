const invokeSpecificRegister = require("../Firebase/specific");
const Student = require("../models/Student");
const RemainingList = require("../models/Admission/RemainingList");
const moment = require("moment");
const Renewal = require("../models/Hostel/renewal");
const HostelUnit = require("../models/Hostel/hostelUnit");
const { custom_date_time } = require("../helper/dayTimer");
const User = require("../models/User");

exports.dueDateAlarm = async () => {
  try {
    const all_remains = await RemainingList({})
      .select("remaining_array")
      .populate({
        path: "student",
        select: "user",
        populate: {
          path: "user",
          select: "deviceToken",
        },
      });
    for (let remind of all_remains) {
      for (let set of remind.remaining_array) {
        if (set?.status === "Not Paid") {
          invokeSpecificRegister(
            "Specific Notification",
            `Admission Fees ${set?.installmentValue} is due. Paid As Soon As Possible.`,
            "Fees Reminder",
            remind?.student?.user._id,
            remind?.student?.user.deviceToken
          );
        }
      }
    }
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
        var latest = custom_date_time(15);
        if (
          `${latest}` === `${moment(ref?.renewal_end).format("YYYY-MM-DD")}`
        ) {
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
