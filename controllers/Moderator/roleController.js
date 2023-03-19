const Staff = require("../../models/Staff");
const Finance = require("../../models/Finance");
const Admission = require("../../models/Admission/Admission");
const NewApplication = require("../../models/Admission/NewApplication");
const User = require("../../models/User");
const { designation_alarm } = require("../../WhatsAppSMS/payload");
const Notification = require("../../models/notification");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const {
  all_access_role,
  all_access_role_finance,
  all_access_role_ins,
} = require("./accessRole");
const InstituteAdmin = require("../../models/InstituteAdmin");
const { nested_document_limit } = require("../../helper/databaseFunction");
const { handle_undefined } = require("../../Handler/customError");
const AdmissionModerator = require("../../models/Moderator/AdmissionModerator");
const FinanceModerator = require("../../models/Moderator/FinanceModerator");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

exports.render_admission_current_role = async (ads_admin, mid) => {
  try {
    var sorted = [];
    for (var mod of ads_admin) {
      if (`${mod}` === `${mid}`) {
        sorted.push(mod);
      }
    }
    const one_mod = await AdmissionModerator.find({ _id: { $in: sorted } });
    var permission = [...one_mod];
    if (permission) {
      return permission;
    } else {
      return [];
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_finance_current_role = async (finance, mid) => {
  try {
    var sorted = [];
    for (var mod of finance) {
      if (`${mod}` === `${mid}`) {
        sorted.push(mod);
      }
    }
    const one_mod = await FinanceModerator.find({ _id: { $in: sorted } });
    var permission = [...one_mod];
    if (permission) {
      return permission;
    } else {
      return [];
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_institute_current_role = async (institute, mid) => {
  try {
    var sorted = [];
    for (var mod of institute) {
      if (`${mod}` === `${mid}`) {
        sorted.push(mod);
      }
    }
    const one_mod = await FinanceModerator.find({ _id: { $in: sorted } });
    var permission = [...one_mod];
    if (permission) {
      return permission;
    } else {
      return [];
    }
  } catch (e) {
    console.log(e);
  }
};

exports.addAdmissionAppModerator = async (req, res) => {
  try {
    const { aid } = req.params;
    const { mod_role, sid, app_array } = req.body;
    if (!aid && !mod_role && !sid && !app_array)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var all_role = all_access_role();
    const ads_admin = await Admission.findById({ _id: aid });
    const institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff?.user}` });
    const notify = new Notification({});
    const new_mod = new AdmissionModerator({});
    new_mod.access_role = mod_role;
    new_mod.access_staff = staff?._id;
    if (mod_role === all_role[`${mod_role}`]?.role) {
      new_mod.permission.bound = [
        ...all_role[`${mod_role}`]?.permission?.bound,
      ];
    }
    if (app_array?.length > 0) {
      new_mod.access_application.push(...app_array);
    }
    new_mod.admission = ads_admin?._id;
    ads_admin.moderator_role.push(new_mod?._id);
    ads_admin.moderator_role_count += 1;
    staff.admissionModeratorDepartment.push(new_mod?._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = `Admission Admin Moderator - ${mod_role}`;
    staff.designation_array.push({
      role: "Admission Admin Moderator",
      role_id: new_mod?._id,
    });
    notify.notifyContent = `you got the designation of Admission Admin Moderator for ${mod_role} 🎉🎉`;
    notify.notifySender = institute?._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Admission Moderator Designation";
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
      new_mod.save(),
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

exports.renderOneModeratorAllAppsQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_moderator = await AdmissionModerator.findById({
      _id: mid,
    }).select("access_application");

    if (search) {
      var all_apps = await NewApplication.find({
        $and: [{ _id: { $in: one_moderator?.access_application } }],
        $or: [{ applicationName: { $regex: search, $options: "i" } }],
      }).select("applicationName");
    } else {
      var all_apps = await NewApplication.find({
        _id: { $in: one_moderator?.access_application },
      })
        .limit(limit)
        .skip(skip)
        .select("applicationName");
    }
    if (all_apps?.length > 0) {
      // const allEncrypt = await encryptionPayload(all_apps);
      res.status(200).send({
        message: "All Application List 😀",
        all_apps,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No Application List 😀",
        all_apps: [],
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdmissionAllAppModeratorArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid }).select(
      "moderator_role"
    );

    if (search) {
      var all_mods = await AdmissionModerator.find({
        $and: [{ _id: { $in: ads_admin?.moderator_role } }],
        $or: [{ access_role: { $regex: search, $options: "i" } }],
      })
        .populate({
          path: "access_staff",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        })
        .populate({
          path: "access_application",
          select: "applicationName",
        });
    } else {
      var all_mods = await AdmissionModerator.find({
        _id: { $in: ads_admin?.moderator_role },
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "access_staff",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        })
        .populate({
          path: "access_application",
          select: "applicationName",
        });
    }
    if (all_mods) {
      // const allEncrypt = await encryptionPayload(all_mods);
      res.status(200).send({
        message: "All Admin / Moderator List 😀",
        all_mods,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No Admin / Moderator List 😀",
        all_mods: [],
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.updateAdmissionAppModeratorQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    const { role, staffId, app_array } = req.body;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var sid = handle_undefined(staffId);
    var all_role = all_access_role();
    const one_moderator = await AdmissionModerator.findById({
      _id: mid,
    }).populate({
      path: "admission",
      select: "institute",
      populate: {
        path: "institute",
        select: "insName sms_lang",
      },
    });
    if (role) {
      one_moderator.access_role = role;
      one_moderator.permission.bound = [];
      if (role === all_role[`${role}`]?.role) {
        one_moderator.permission.bound = [
          ...all_role[`${role}`]?.permission?.bound,
        ];
      }
      if (
        role === "MULTI_APP_ACCESS" ||
        role === "INQUIRY_ACCESS" ||
        role === "FULL_ACCESS"
      ) {
      } else {
        var all_apps = await NewApplication.find({
          _id: { $in: one_moderator?.access_application },
        });
        for (var val of all_apps) {
          one_moderator.access_application.pull(val?._id);
        }
      }
    }
    if (sid) {
      var one_staff = await Staff.findById({
        _id: `${one_moderator?.access_staff}`,
      });
      one_staff.admissionModeratorDepartment.pull(one_moderator?._id);
      one_staff.recentDesignation = "";
      if (one_staff?.staffDesignationCount > 0) {
        one_staff.staffDesignationCount -= 1;
      }
      await one_staff.save();
      var new_staff = await Staff.findById({ _id: sid });
      new_staff.admissionModeratorDepartment.push(one_moderator?._id);
      new_staff.recentDesignation = `Admission Admin Moderator - ${one_moderator?.access_role}`;
      new_staff.staffDesignationCount += 1;
      one_moderator.access_staff = new_staff?._id;
      const notify = new Notification({});
      var user = await User.findById({ _id: `${new_staff?.user}` });
      notify.notifyContent = `you got the designation of Admission Admin Moderator 🎉🎉`;
      notify.notifySender = one_moderator?.admission?._id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Admission Moderator Designation";
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = one_moderator?.admission?.institute?._id;
      invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        one_moderator?.admission?.institute?.insName,
        user._id,
        user.deviceToken
      );
      designation_alarm(
        user?.userPhoneNumber,
        "ADMISSION_MODERATOR",
        one_moderator?.admission?.institute?.sms_lang,
        "",
        "",
        ""
      );
      await Promise.all([new_staff.save(), user.save(), notify.save()]);
    }
    if (app_array?.length > 0) {
      one_moderator.access_application.push(...app_array);
    }
    await one_moderator.save();
    res.status(200).send({ message: "Explore Update Role", access: true });
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
    const one_moderator = await AdmissionModerator.findById({ _id: mid });
    const one_staff = await Staff.findById({
      _id: `${one_moderator?.access_staff}`,
    });
    var ads_admin = await Admission.findById({ _id: aid }).select(
      "moderator_role"
    );
    ads_admin.moderator_role.pull(mid);
    one_staff.admissionModeratorDepartment.pull(mid);
    if (ads_admin.moderator_role_count > 0) {
      ads_admin.moderator_role_count -= 1;
    }
    if (one_staff.staffDesignationCount > 0) {
      one_staff.staffDesignationCount -= 1;
    }
    one_staff.recentDesignation = "";
    await Promise.all([one_staff.save(), ads_admin.save()]);
    await AdmissionModerator.findByIdAndDelete(mid);
    res.status(200).send({
      message: "Deletion Operation Completed 👍",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.addFinanceModeratorQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { mod_role, sid } = req.body;
    if (!fid && !mod_role && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var all_role = all_access_role_finance();
    const finance = await Finance.findById({ _id: fid });
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff?.user}` });
    const notify = new Notification({});
    const new_mod = new FinanceModerator({});
    new_mod.access_role = mod_role;
    new_mod.access_staff = staff?._id;
    if (mod_role === all_role[`${mod_role}`]?.role) {
      new_mod.permission.bound = [
        ...all_role[`${mod_role}`]?.permission?.bound,
      ];
    }
    new_mod.finance = finance?._id;
    finance.moderator_role.push(new_mod?._id);
    finance.moderator_role_count += 1;
    staff.financeModeratorDepartment.push(new_mod?._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = `Finance Manager Moderator - ${mod_role}`;
    staff.designation_array.push({
      role: "Finance Manager Moderator",
      role_id: new_mod?._id,
    });
    notify.notifyContent = `you got the designation of Finance Manager Moderator for ${mod_role} 🎉🎉`;
    notify.notifySender = institute?._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Finance Moderator Designation";
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
      finance.save(),
      new_mod.save(),
      user.save(),
      notify.save(),
    ]);
    // const adsEncrypt = await encryptionPayload(finance._id);
    res.status(200).send({
      message: "Successfully Assigned Finance Moderator Staff",
      finance: finance._id,
      access: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "FINANCE_MODERATOR",
      institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAllAppModeratorArray = async (req, res) => {
  try {
    const { fid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid }).select(
      "moderator_role"
    );

    if (search) {
      var all_mods = await FinanceModerator.find({
        $and: [{ _id: { $in: finance?.moderator_role } }],
        $or: [{ access_role: { $regex: search, $options: "i" } }],
      }).populate({
        path: "access_staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      });
    } else {
      var all_mods = await FinanceModerator.find({
        _id: { $in: finance?.moderator_role },
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "access_staff",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        });
    }
    if (all_mods?.length > 0) {
      // const allEncrypt = await encryptionPayload(all_mods);
      res.status(200).send({
        message: "All Admin / Moderator List 😀",
        all_mods,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No Admin / Moderator List 😀",
        all_mods: [],
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.updateFinanceAppModeratorQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    const { role, staffId } = req.body;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var sid = handle_undefined(staffId);
    var all_role = all_access_role_finance();
    const one_moderator = await FinanceModerator.findById({
      _id: mid,
    }).populate({
      path: "finance",
      select: "institute",
      populate: {
        path: "institute",
        select: "insName sms_lang",
      },
    });
    if (role) {
      one_moderator.access_role = role;
      one_moderator.permission.bound = [];
      if (role === all_role[`${role}`]?.role) {
        one_moderator.permission.bound = [
          ...all_role[`${role}`]?.permission?.bound,
        ];
      }
    }
    if (sid) {
      var one_staff = await Staff.findById({
        _id: `${one_moderator?.access_staff}`,
      });
      one_staff.financeModeratorDepartment.pull(one_moderator?._id);
      one_staff.recentDesignation = "";
      if (one_staff?.staffDesignationCount > 0) {
        one_staff.staffDesignationCount -= 1;
      }
      await one_staff.save();
      var new_staff = await Staff.findById({ _id: sid });
      new_staff.financeModeratorDepartment.push(one_moderator?._id);
      new_staff.recentDesignation = `Finance Manager Moderator - ${one_moderator?.access_role}`;
      new_staff.staffDesignationCount += 1;
      one_moderator.access_staff = new_staff?._id;
      const notify = new Notification({});
      var user = await User.findById({ _id: `${new_staff?.user}` });
      notify.notifyContent = `you got the designation of Finance Manager Moderator 🎉🎉`;
      notify.notifySender = one_moderator?.finance?._id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Finance Moderator Designation";
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = one_moderator?.finance?.institute?._id;
      invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        one_moderator?.finance?.institute?.insName,
        user._id,
        user.deviceToken
      );
      designation_alarm(
        user?.userPhoneNumber,
        "FINANCE_MODERATOR",
        one_moderator?.finance?.institute?.sms_lang,
        "",
        "",
        ""
      );
      await Promise.all([new_staff.save(), user.save(), notify.save()]);
    }
    await one_moderator.save();
    res.status(200).send({ message: "Explore Update Role", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.destroyFinanceModeratorQuery = async (req, res) => {
  try {
    const { fid, mid } = req.params;
    if (!fid && !mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const one_moderator = await FinanceModerator.findById({ _id: mid });
    const one_staff = await Staff.findById({
      _id: `${one_moderator?.access_staff}`,
    });
    var finance = await Finance.findById({ _id: fid }).select("moderator_role");
    finance.moderator_role.pull(mid);
    one_staff.financeModeratorDepartment.pull(mid);
    if (finance.moderator_role_count > 0) {
      finance.moderator_role_count -= 1;
    }
    if (one_staff.staffDesignationCount > 0) {
      one_staff.staffDesignationCount -= 1;
    }
    one_staff.recentDesignation = "";
    await Promise.all([one_staff.save(), finance.save()]);
    await FinanceModerator.findByIdAndDelete(mid);
    res.status(200).send({
      message: "Deletion Operation Completed 👍",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.addInstituteModeratorQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { mod_role, sid } = req.body;
    if (!id && !mod_role && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var all_role = all_access_role_ins();
    const institute = await InstituteAdmin.findById({
      _id: id,
    });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff?.user}` });
    const notify = new Notification({});
    const new_mod = new FinanceModerator({});
    new_mod.access_role = mod_role;
    new_mod.access_staff = staff?._id;
    if (mod_role === all_role[`${mod_role}`]?.role) {
      new_mod.permission.bound = [
        ...all_role[`${mod_role}`]?.permission?.bound,
      ];
    }
    new_mod.institute = institute?._id;
    institute.moderator_role.push(new_mod?._id);
    institute.moderator_role_count += 1;
    staff.instituteModeratorDepartment.push(new_mod?._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = `Institute Admin Moderator - ${mod_role}`;
    staff.designation_array.push({
      role: "Institute Admin Moderator",
      role_id: new_mod?._id,
    });
    notify.notifyContent = `you got the designation of Institute Admin Moderator for ${mod_role} 🎉🎉`;
    notify.notifySender = institute?._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Institute Moderator Designation";
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
      institute.save(),
      new_mod.save(),
      user.save(),
      notify.save(),
    ]);
    // const adsEncrypt = await encryptionPayload(institute._id);
    res.status(200).send({
      message: "Successfully Assigned Institute Moderator Staff",
      institute: institute._id,
      access: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "INSTITUTE_MODERATOR",
      institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderInstituteAllAppModeratorArray = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const institute = await InstituteAdmin.findById({ _id: id }).select(
      "moderator_role"
    );

    if (search) {
      var all_mods = await FinanceModerator.find({
        $and: [{ _id: { $in: institute?.moderator_role } }],
        $or: [{ access_role: { $regex: search, $options: "i" } }],
      }).populate({
        path: "access_staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      });
    } else {
      var all_mods = await FinanceModerator.find({
        _id: { $in: institute?.moderator_role },
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "access_staff",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        });
    }
    if (all_mods?.length > 0) {
      // const allEncrypt = await encryptionPayload(all_mods);
      res.status(200).send({
        message: "All Admin / Moderator List 😀",
        all_mods,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No Admin / Moderator List 😀",
        all_mods: [],
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.updateInstituteAppModeratorQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    const { role, staffId } = req.body;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var sid = handle_undefined(staffId);
    var all_role = all_access_role_ins();
    const one_moderator = await FinanceModerator.findById({
      _id: mid,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    if (role) {
      one_moderator.access_role = role;
      one_moderator.permission.bound = [];
      if (role === all_role[`${role}`]?.role) {
        one_moderator.permission.bound = [
          ...all_role[`${role}`]?.permission?.bound,
        ];
      }
    }
    if (sid) {
      var one_staff = await Staff.findById({
        _id: `${one_moderator?.access_staff}`,
      });
      one_staff.instituteModeratorDepartment.pull(one_moderator?._id);
      one_staff.recentDesignation = "";
      if (one_staff?.staffDesignationCount > 0) {
        one_staff.staffDesignationCount -= 1;
      }
      await one_staff.save();
      var new_staff = await Staff.findById({ _id: sid });
      new_staff.instituteModeratorDepartment.push(one_moderator?._id);
      new_staff.recentDesignation = `Institute Admin Moderator - ${one_moderator?.access_role}`;
      new_staff.staffDesignationCount += 1;
      one_moderator.access_staff = new_staff?._id;
      const notify = new Notification({});
      var user = await User.findById({ _id: `${new_staff?.user}` });
      notify.notifyContent = `you got the designation of Institute Admin Moderator 🎉🎉`;
      notify.notifySender = one_moderator?.institute?._id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Institute Moderator Designation";
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = one_moderator?.institute?._id;
      invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        one_moderator?.institute?.insName,
        user._id,
        user.deviceToken
      );
      designation_alarm(
        user?.userPhoneNumber,
        "INSTITUTE_MODERATOR",
        one_moderator?.institute?.sms_lang,
        "",
        "",
        ""
      );
      await Promise.all([new_staff.save(), user.save(), notify.save()]);
    }
    await one_moderator.save();
    res.status(200).send({ message: "Explore Update Role", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.destroyInstituteModeratorQuery = async (req, res) => {
  try {
    const { id, mid } = req.params;
    if (!id && !mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const one_moderator = await FinanceModerator.findById({ _id: mid });
    const one_staff = await Staff.findById({
      _id: `${one_moderator?.access_staff}`,
    });
    var institute = await InstituteAdmin.findById({ _id: id }).select(
      "moderator_role"
    );
    institute.moderator_role.pull(mid);
    one_staff.instituteModeratorDepartment.pull(mid);
    if (institute.moderator_role_count > 0) {
      institute.moderator_role_count -= 1;
    }
    if (one_staff.staffDesignationCount > 0) {
      one_staff.staffDesignationCount -= 1;
    }
    one_staff.recentDesignation = "";
    await Promise.all([one_staff.save(), institute.save()]);
    await FinanceModerator.findByIdAndDelete(mid);
    res.status(200).send({
      message: "Deletion Operation Completed 👍",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};
