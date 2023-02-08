const Staff = require("../../models/Staff");
const Admission = require("../../models/Admission/Admission");
const NewApplication = require("../../models/Admission/NewApplication");
const User = require("../../models/User");
const { designation_alarm } = require("../../WhatsAppSMS/payload");
const Notification = require("../../models/notification");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const { all_access_role } = require("./accessRole");
const InstituteAdmin = require("../../models/InstituteAdmin");
const { nested_document_limit } = require("../../helper/databaseFunction");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

exports.render_admission_current_role = async (ads_admin, sid) => {
  try {
    var sorted = [];
    var all_role = all_access_role();
    const one_staff = await Staff.findById({ _id: sid });
    for (var mod of ads_admin) {
      for (ref of all_role) {
        if (
          `${mod?.staff}` === `${one_staff?._id}` &&
          one_staff?.permission.admission?.includes(ref?.role)
        ) {
          const val = ref;
          val.permission.appArray.push(mod?.application);
          sorted.push(val);
        }
      }
    }
    var permission = { ...sorted };
    if (permission) {
      return permission;
    } else {
      return {};
    }
  } catch (e) {
    console.log(e);
  }
};

exports.addAdmissionAppModerator = async (req, res) => {
  try {
    const { aid } = req.params;
    const { mod_role, sid, appId } = req.body;
    if (!aid && !mod_role && !sid && !appId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid });
    const apps = await NewApplication.findById({ _id: appId });
    const institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff?.user}` });
    const notify = new Notification({});
    ads_admin.moderator_role.push({
      role: mod_role,
      application: apps?._id,
      staff: staff?._id,
    });
    staff.admissionModeratorDepartment.push({
      admission: ads_admin._id,
      type: `Moderator of Admission Application - ${apps?.applicationName}`,
    });
    staff.permission.admission.push(mod_role);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = "Admission Admin Moderator";
    notify.notifyContent = `you got the designation of Admission Admin Moderator 🎉🎉`;
    notify.notifySender = institute?._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Admission Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyPid = "1";
    notify.notifyByInsPhoto = institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      staff.save(),
      ads_admin.save(),
      user.save(),
      notify.save(),
    ]);
    // const adsEncrypt = await encryptionPayload(ads_admin._id);
    res.status(200).send({
      message: "Successfully Assigned Admission Admin Moderator Staff",
      admission: ads_admin._id,
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "ADMISSION_MODERATOR",
      institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdmissionAllAppModeratorArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid })
      .select("moderator_role")
      .populate({
        path: "moderator_role",
        populate: {
          path: "application",
          select: "applicationName",
        },
      })
      .populate({
        path: "moderator_role",
        populate: {
          path: "staff",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
      });

    const all_admins = nested_document_limit(
      page,
      limit,
      ads_admin?.moderator_role
    );
    if (all_admins) {
      // const allEncrypt = await encryptionPayload(all_admins);
      res.status(200).send({
        message: "All Admin / Moderator List 😀",
        all_admins,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No Admin / Moderator List 😀",
        all_admins: [],
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
