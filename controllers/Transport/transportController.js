const InstituteAdmin = require("../../models/InstituteAdmin");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const Notification = require("../../models/notification");
const Student = require("../../models/Student");
const Transport = require("../../models/Transport/transport");
const {
  uploadDocFile,
  uploadFile,
  uploadPostImageFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../Firebase/firebase");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

exports.renderNewTransportManager = async (req, res) => {
  try {
    const { id, sid } = req.params;
    if (!sid && !id)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const institute = await InstituteAdmin.findById({ _id: id });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff.user}` });
    const transport = new Transport({});
    const notify = new Notification({});
    staff.transportDepartment.push(transport._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = "Transportation Manager";
    transport.transport_manager = staff._id;
    institute.transportDepart.push(transport._id);
    institute.transportStatus = "Enable";
    transport.institute = institute._id;
    notify.notifyContent = `you got the designation of Transportation Manager 🎉🎉`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Transport Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      institute.save(),
      staff.save(),
      transport.save(),
      user.save(),
      notify.save(),
    ]);
    // const tEncrypt = await encryptionPayload(transport._id);
    res.status(200).send({
      message: "Successfully Assigned Transport Manager",
      transport: transport._id,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportManagerDashboard = async (req, res) => {
  try {
    const { tid } = req.params;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const trans_panel = await Transport.findById({ _id: tid })
      .select(
        "vehicle_count transport_staff_count passenger_count remaining_fee"
      )
      .populate({
        path: "transport_manager",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      })
      .populate({
        path: "institute",
        select: "insProfilePhoto",
      });
    // const tEncrypt = await encryptionPayload(trans_panel);
    res.status(200).send({
      message: "Handle Lot's of Data Counts Enjoy 😀",
      access: true,
      trans_panel: trans_panel,
    });
  } catch (e) {
    console.log(e);
  }
};
