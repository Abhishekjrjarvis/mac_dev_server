const invokeSpecificRegister = require("../Firebase/specific");
const Student = require("../models/Student");
const moment = require("moment");

exports.dueDateAlarm = async () => {
  try {
    const alarmTrigger = moment(new Date()).format("YYYY-MM-DD");
    const all_students = await Student.find({})
      .select("remainingFeeList")
      .populate({
        path: "user",
        select: "deviceToken",
      });
    for (let remind of all_students) {
      for (let set of remind.remainingFeeList) {
        if (
          set?.status === "Not Paid" &&
          // `${alarmTrigger}` <= `${set?.dueDate}` &&
          `${alarmTrigger}` >=
            `${moment(
              new Date(set?.dueDate).setDate(
                new Date(set?.dueDate).getDate() - 3
              )
            ).format("YYYY-MM-DD")}`
        ) {
          invokeSpecificRegister(
            "Specific Notification",
            `Admission Fee Installment is due on ${set?.dueDate}`,
            "Fees Reminder",
            remind?.user._id,
            remind?.user.deviceToken
          );
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
