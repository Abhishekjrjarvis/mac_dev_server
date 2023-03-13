const invokeSpecificRegister = require("../Firebase/specific");
const Student = require("../models/Student");
const RemainingList = require("../models/Admission/RemainingList");
const moment = require("moment");

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
