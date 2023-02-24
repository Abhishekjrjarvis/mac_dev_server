const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const Notification = require("../../models/notification");

exports.student_notification_func = async (
  contentType,
  sender,
  receiever,
  candType,
  pubType,
  category,
  index
) => {
  try {
    const notify = new StudentNotification({});
    notify.notifyContent = contentType;
    notify.notifySender = sender._id;
    notify.notifyReceiever = receiever._id;
    notify.notifyType = candType;
    notify.notifyPublisher = pubType._id;
    notify.financeId = sender._id;
    receiever.activity_tab.push(notify._id);
    notify.notifyByFinancePhoto = sender._id;
    notify.notifyCategory = category;
    notify.redirectIndex = index;
    //
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      "Monthly Payroll",
      receiever._id,
      receiever.deviceToken,
      "Staff",
      notify
    );
  } catch (e) {
    console.log(e);
  }
};

exports.all_notification_func = async (req, res) => {
  try {
  } catch (e) {
    console.log(e);
  }
};
