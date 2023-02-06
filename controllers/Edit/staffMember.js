const InstituteAdmin = require("../../models/InstituteAdmin");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const Admission = require("../../models/Admission/Admission");
const Notification = require("../../models/notification");
const Finance = require("../../models/Finance");
const Sport = require("../../models/Sport");
const SportClass = require("../../models/SportClass");
const Library = require("../../models/Library/Library");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../Firebase/firebase");
const { deleteFile, uploadFile } = require("../../S3Configuration");
const { chart_category } = require("../../Custom/staffChart");
const { designation_alarm } = require("../../WhatsAppSMS/payload");

exports.photoEditByStaff = async (req, res) => {
  try {
    if (!req.params.sid || !req.file)
      throw "Please send staff id to perform task or upload photo";
    const staff = await Staff.findById(req.params.sid);
    await deleteFile(staff.staffProfilePhoto);
    const results = await uploadFile(req.file);
    staff.staffProfilePhoto = results.Key;
    await staff.save();
    res.status(200).send({
      message: "photo edited successfully👍",
    });
    await unlinkFile(req.file.path);
  } catch (e) {
    console.log(e);
  }
};

exports.formEditByInstitute = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send staff id to perform task";
    const old_data = {
      gender: "",
      caste: "",
    };
    const new_data = {
      gender: "",
      caste: "",
    };
    const staffs = await Staff.findById(req.params.sid);
    old_data.gender = staffs?.staffGender;
    old_data.caste = staffs?.staffCastCategory;
    for (let file of req.body?.fileArray) {
      if (file.name === "addharFrontCard")
        staffs.staffAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        staffs.staffAadharBackCard = file.key;
      else if (file.name === "bankPassbook")
        staffs.staffBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        staffs.staffCasteCertificatePhoto = file.key;
      else {
        const filterDocument = staffs.staffDocuments?.filter(
          (val) => val.documentName !== file.name
        );
        staffs.staffDocuments = [
          ...filterDocument,
          {
            documentName: file.name,
            documentKey: file.key,
            documentType: file.type,
          },
        ];
      }
    }
    for (let staffObj in req.body?.staff) {
      staffs[`${staffObj}`] = req.body?.staff[staffObj];
    }
    await staffs.save();
    new_data.gender = staffs?.staffGender;
    new_data.caste = staffs?.staffCastCategory;
    res.status(200).send({
      message: "staff form edited successfully👍",
      staffs,
    });
    await chart_category(staffs?.institute, "Edit_Staff", old_data, new_data);
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceStaffQuery = async (req, res) => {
  try {
    const { osid } = req.params;
    const { nsid } = req.query;
    if (!osid && !nsid && osid !== nsid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const oldStaff = await Staff.findById({ _id: osid }).populate({
      path: "institute",
      select: "financeDepart",
    });
    const newStaff = await Staff.findById({ _id: nsid });
    const user = await User.findById({ _id: `${newStaff.user}` });
    const finance = await Finance.findById({
      _id: `${oldStaff?.institute?.financeDepart[0]}`,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const notify = new Notification({});
    newStaff.financeDepartment.push(finance._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Finance Manager";
    finance.financeHead = newStaff._id;
    oldStaff.financeDepartment.pull(finance._id);
    if (oldStaff.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    notify.notifyContent = `you got the designation of as Finance Manager`;
    notify.notify_hi_content = `आपको वित्त व्यवस्थापक के रूप में पदनाम मिला है |`;
    notify.notify_mr_content = `तुम्हाला वित्त व्यवस्थापक म्हणून पद मिळाले आहे`;
    notify.notifySender = finance.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Finance Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = finance.institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      finance.institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      oldStaff.save(),
      finance.save(),
      user.save(),
      notify.save(),
      newStaff.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned Finance Manager",
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "FINANCE",
      finance?.institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdmissionStaffQuery = async (req, res) => {
  try {
    const { osid } = req.params;
    const { nsid } = req.query;
    if (!osid && !nsid && osid !== nsid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const oldStaff = await Staff.findById({ _id: osid }).populate({
      path: "institute",
      select: "admissionDepart",
    });
    const newStaff = await Staff.findById({ _id: nsid });
    const user = await User.findById({ _id: `${newStaff.user}` });
    const admission = await Admission.findById({
      _id: `${oldStaff?.institute?.admissionDepart[0]}`,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const notify = new Notification({});
    newStaff.admissionDepartment.push(admission._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Admission Admin";
    oldStaff.admissionDepartment.pull(admission._id);
    if (oldStaff?.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    admission.admissionAdminHead = newStaff._id;
    notify.notifyContent = `you got the designation of Admission Admin 🎉🎉`;
    notify.notifySender = admission.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Admission Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyPid = "1";
    notify.notifyByInsPhoto = admission.institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      admission.institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      oldStaff.save(),
      admission.save(),
      user.save(),
      notify.save(),
      newStaff.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned Admission Admin",
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "ADMISSION",
      admission?.institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderSportStaffQuery = async (req, res) => {
  try {
    const { osid } = req.params;
    const { nsid } = req.query;
    if (!osid && !nsid && osid !== nsid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const oldStaff = await Staff.findById({ _id: osid }).populate({
      path: "institute",
      select: "sportDepart",
    });
    const newStaff = await Staff.findById({ _id: nsid });
    const user = await User.findById({ _id: `${newStaff.user}` });
    const sport = await Sport.findById({
      _id: `${oldStaff?.institute?.sportDepart[0]}`,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const notify = new Notification({});
    newStaff.sportDepartment.push(sport._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Sport & Arts Head";
    sport.sportHead = newStaff._id;
    oldStaff.sportDepartment.pull(sport._id);
    if (oldStaff.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    notify.notifyContent = `you got the designation as Sport & Arts Head`;
    notify.notify_hi_content = `आपको खेल और कला प्रमुख प्रशिक्षक के रूप में पदनाम मिला है |`;
    notify.notify_mr_content = `तुम्हाला क्रीडा आणि कला मुख्य प्रशिक्षक म्हणून पद मिळाले आहे.`;
    notify.notifySender = sport.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Sports Head Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = sport.institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      sport.institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      sport.save(),
      oldStaff.save(),
      user.save(),
      notify.save(),
      newStaff.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned Sport & Arts Head",
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "SPORTSHEAD",
      sport?.institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderSportStaffClassQuery = async (req, res) => {
  try {
    const { osid } = req.params;
    const { nsid } = req.query;
    if (!osid && !nsid && osid !== nsid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const oldStaff = await Staff.findById({ _id: osid }).populate({
      path: "institute",
      select: "sportClassDepart",
    });
    const newStaff = await Staff.findById({ _id: nsid });
    const user = await User.findById({ _id: `${newStaff.user}` });
    const sportClasses = await SportClass.findById({
      _id: `${oldStaff?.institute?.sportClassDepart[0]}`,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const notify = new Notification({});
    newStaff.staffSportClass.push(sportClasses._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Sport & Arts Class Head";
    sportClasses.sportClassHead = newStaff._id;
    oldStaff.staffSportClass.pull(sportClasses._id);
    if (oldStaff.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    notify.notifyContent = `you got the designation of ${sportClasses.sportClassName} as Class Head`;
    notify.notify_hi_content = `आपको प्रशिक्षक के रूप में ${sportClasses.sportClassName} का पदनाम मिला है |`;
    notify.notify_mr_content = `तुम्हाला ${sportClasses.sportClassName} चे प्रशिक्षक म्हणून पद मिळाले आहे`;
    notify.notifySender = sportClasses.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Sports Class Head Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = sportClasses.institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      sportClasses.institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      oldStaff.save(),
      sportClasses.save(),
      user.save(),
      notify.save(),
      newStaff.save(),
    ]);
    res.status(200).send({
      message: "Successfully Created Sport & Arts Class Head",
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "SPORTSCLASS",
      sportClasses?.institute?.sms_lang,
      sportClasses?.sportClassName,
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderLibraryStaffQuery = async (req, res) => {
  try {
    const { osid } = req.params;
    const { nsid } = req.query;
    if (!osid && !nsid && osid !== nsid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const oldStaff = await Staff.findById({ _id: osid }).populate({
      path: "institute",
      select: "library",
    });
    const newStaff = await Staff.findById({ _id: nsid });
    const user = await User.findById({ _id: `${newStaff.user}` });
    const library = await Library.findById({
      _id: `${oldStaff?.institute?.library[0]}`,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const notify = new Notification({});
    newStaff.library.push(library._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Library Head";
    library.libraryHead = newStaff._id;
    oldStaff.library.pull(library._id);
    if (oldStaff.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    notify.notifyContent = `you got the designation of as Library Head`;
    notify.notifySender = library.institute._id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify._id);
    notify.notifyCategory = "Library Designation";
    notify.user = user._id;
    notify.notifyByInsPhoto = library.institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      library.institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      oldStaff.save(),
      library.save(),
      user.save(),
      notify.save(),
      newStaff.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned Library Head",
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "LIBRARY",
      library?.institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};
