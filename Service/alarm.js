const invokeSpecificRegister = require("../Firebase/specific");
const Student = require("../models/Student");
const RemainingList = require("../models/Admission/RemainingList");
const moment = require("moment");

exports.dueDateAlarm = async () => {
  try {
    const alarmTrigger = moment(new Date()).format("YYYY-MM-DD");
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
            `Admission ${set?.installmentValue} is due on ${set?.dueDate}`,
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
