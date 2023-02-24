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
const { handle_undefined } = require("../../Handler/customError");
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
      accessApp: apps?._id,
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
      access: true,
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

exports.updateAdmissionAppModeratorQuery = async (req, res) => {
  try {
    const { aid, mid } = req.params;
    const { mod_role, new_roles, osid, appId, new_apps, new_staff } = req.body;
    if (!aid && !mod_role && !osid && !appId && !mid && osid !== new_staff)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var nsid = handle_undefined(new_staff);
    var new_appId = handle_undefined(new_apps);
    var new_mod_role = handle_undefined(new_roles);
    var ads_admin = await Admission.findById({ _id: aid });
    var apps = await NewApplication.findById({ _id: appId });
    if (new_appId) {
      var newApps = await NewApplication.findById({ _id: new_appId });
    }
    var institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    var notify = new Notification({});
    const staff = await Staff.findById({ _id: osid });
    if (nsid) {
      var newStaff = await Staff.findById({ _id: nsid });
    }
    if (nsid) {
      for (var author of ads_admin?.moderator_role) {
        if (`${author?._id}` === `${mid}`) {
          author.role = new_mod_role ? new_mod_role : mod_role;
          author.application = newApps?._id ? newApps?._id : apps?._id;
          author.staff = newStaff?._id;
        }
      }
      newStaff.admissionModeratorDepartment.push({
        admission: ads_admin._id,
        accessApp: newApps?._id ? newApps?._id : apps?._id,
        type: `Moderator of Admission Application - ${
          newApps?.applicationName
            ? newApps?.applicationName
            : apps?.applicationName
        }`,
      });
      staff.admissionModeratorDepartment?.splice(
        { accessApp: `${apps?._id}` },
        1
      );
      if (staff?.staffDesignationCount > 0) {
        staff.staffDesignationCount -= 1;
      }
      if (staff.permission.admission.includes(mod_role)) {
        staff.permission.admission.pull(mod_role);
      }
      staff.recentDesignation = "";
      if (new_mod_role) {
        newStaff.permission.admission.pull(mod_role);
        newStaff.permission.admission.push(new_mod_role);
      } else {
        if (newStaff.permission.admission.includes(mod_role)) {
        } else {
          newStaff.permission.admission.push(mod_role);
        }
      }
      newStaff.staffDesignationCount += 1;
      newStaff.recentDesignation = "Admission Admin Moderator";
      var user = await User.findById({ _id: `${newStaff?.user}` });
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
      designation_alarm(
        user?.userPhoneNumber,
        "ADMISSION_MODERATOR",
        institute?.sms_lang,
        "",
        "",
        ""
      );
      await Promise.all([newStaff.save(), staff.save()]);
    } else {
      for (var author of ads_admin?.moderator_role) {
        if (`${author?._id}` === `${mid}`) {
          author.role = new_mod_role ? new_mod_role : mod_role;
          author.application = newApps?._id ? newApps?._id : apps?._id;
        }
      }
      if (newApps) {
        for (var ele of staff.admissionModeratorDepartment) {
          if (`${ele?.accessApp}` === `${apps?._id}`) {
            (ele.admission = ads_admin._id),
              (ele.accessApp = newApps?._id),
              (ele.type = `Moderator of Admission Application - ${newApps?.applicationName}`);
          }
        }
      }
      if (new_mod_role) {
        staff.permission.admission.pull(mod_role);
        staff.permission.admission.push(new_mod_role);
      } else {
        if (staff.permission.admission.includes(mod_role)) {
        } else {
          staff.permission.admission.push(mod_role);
        }
      }
      var user = await User.findById({ _id: `${staff?.user}` });
      notify.notifyContent = `you got the new permission for Admission Application`;
      notify.notifySender = institute?._id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Admission Change Permission";
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
      await staff.save();
    }
    await Promise.all([ads_admin.save(), user.save(), notify.save()]);
    // const adsEncrypt = await encryptionPayload(ads_admin._id);
    res.status(200).send({
      message: "Successfully Assigned Admission Admin Moderator Staff",
      admission: ads_admin._id,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.destroyAdmissionAppModeratorQuery = async (req, res) => {
  try {
    const { aid, mid } = req.params;
    if (!aid && !mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var ads_admin = await Admission.findById({ _id: aid }).select(
      "moderator_role"
    );
    for (var del of ads_admin?.moderator_role) {
      if (`${del?._id}` === `${mid}`) {
        var staff = await Staff.findById({ _id: `${del?.staff}` });
        staff?.admissionModeratorDepartment.splice(
          {
            accessApp: `${del?.application}`,
          },
          1
        );
        staff.permission.admission.pull(`${del?.role}`);
        if (staff.staffDesignationCount > 0) {
          staff.staffDesignationCount -= 1;
        }
        staff.recentDesignation = "";
        await staff.save();
      }
    }
    ads_admin?.moderator_role.pull(mid);
    await ads_admin.save();
    res.status(200).send({
      message: "Deletion Operation Completed 👍",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

// const datas = () => {
//   const arr = [
//     {
//       0: {
//       key: "hello",
//       value: "world",
//       },
//     },
//     {
//       1: {
//       key: "Awesome",
//       value: "Marvelous",
//       },
//     },
//   ];

//   let has = arr.some((vendor, index) => vendor.index.["key"] === "hello");
//   console.log(has);
//   if (has) return true;
//   else return false;
// };

// console.log(datas());
