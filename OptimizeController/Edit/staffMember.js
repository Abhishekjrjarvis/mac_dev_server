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
const {
  designation_alarm,
  email_sms_designation_alarm,
} = require("../../WhatsAppSMS/payload");
const Transport = require("../../models/Transport/transport");
const EventManager = require("../../models/Event/eventManager");
const {
  generate_hash_pass,
  send_phone_login_query,
  send_email_authentication_login_query,
} = require("../../helper/functions");
const Hostel = require("../../models/Hostel/hostel");
const { handle_undefined } = require("../../Handler/customError");
const Alumini = require("../../models/Alumini/Alumini");
const LMS = require("../../models/Leave/LMS");

exports.photoEditByStaff = async (req, res) => {
  try {
    if (!req.params.sid || !req.file)
      throw "Please send staff id to perform task or upload photo";
    const staff = await Staff.findById(req.params.sid);
    // await deleteFile(staff.staffProfilePhoto);
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
    let password = await generate_hash_pass();
    finance.designation_password = password?.pass;
    newStaff.financeDepartment.push(finance._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Finance Manager";
    finance.financeHead = newStaff._id;
    oldStaff.financeDepartment.pull(finance._id);
    if (oldStaff.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    notify.notifyContent = `you got the designation of as Finance Manager A/c Access Pin - ${password?.pin}`;
    notify.notify_hi_content = `आपको वित्त व्यवस्थापक के रूप में पदनाम मिला है |`;
    notify.notify_mr_content = `तुम्हाला वित्त व्यवस्थापक म्हणून पद मिळाले आहे`;
    notify.notifySender = finance.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Finance Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = finance.institute._id;
    await invokeFirebaseNotification(
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
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "FINANCE",
        finance?.institute?.sms_lang,
        "",
        "",
        ""
      );
    }
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
    let password = await generate_hash_pass();
    admission.designation_password = password?.pass;
    newStaff.admissionDepartment.push(admission._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Admission Admin";
    oldStaff.admissionDepartment.pull(admission._id);
    if (oldStaff?.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    admission.admissionAdminHead = newStaff._id;
    notify.notifyContent = `you got the designation of Admission Admin A/c Access Pin - ${password?.pin}`;
    notify.notifySender = admission.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Admission Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyPid = "1";
    notify.notifyByInsPhoto = admission.institute._id;
    await invokeFirebaseNotification(
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
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "ADMISSION",
        admission?.institute?.sms_lang,
        "",
        "",
        ""
      );
    }
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
    await invokeFirebaseNotification(
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
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "SPORTSHEAD",
        sport?.institute?.sms_lang,
        "",
        "",
        ""
      );
    }
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
    await invokeFirebaseNotification(
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
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "SPORTSCLASS",
        sportClasses?.institute?.sms_lang,
        sportClasses?.sportClassName,
        "",
        ""
      );
    }
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
    await invokeFirebaseNotification(
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
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "LIBRARY",
        library?.institute?.sms_lang,
        "",
        "",
        ""
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransportStaffQuery = async (req, res) => {
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
      select: "transportDepart",
    });
    const newStaff = await Staff.findById({ _id: nsid });
    const user = await User.findById({ _id: `${newStaff.user}` });
    const trans = await Transport.findById({
      _id: `${oldStaff?.institute?.transportDepart[0]}`,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const notify = new Notification({});
    newStaff.transportDepartment.push(trans._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Transportation Manager";
    trans.transport_manager = newStaff._id;
    oldStaff.transportDepartment.pull(trans._id);
    if (oldStaff.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    notify.notifyContent = `you got the designation of Transportation Manager 🎉🎉`;
    notify.notifySender = trans.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Transport Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = trans.institute._id;
    await invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      trans.institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      oldStaff.save(),
      trans.save(),
      user.save(),
      notify.save(),
      newStaff.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned Transportation Manager",
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "TRANSPORT",
      trans?.institute?.sms_lang,
      "",
      "",
      ""
    );
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "TRANSPORT",
        trans?.institute?.sms_lang,
        "",
        "",
        ""
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEventManagerStaffQuery = async (req, res) => {
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
      select: "eventManagerDepart",
    });
    const newStaff = await Staff.findById({ _id: nsid });
    const user = await User.findById({ _id: `${newStaff.user}` });
    const event = await EventManager.findById({
      _id: `${oldStaff?.institute?.eventManagerDepart[0]}`,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const notify = new Notification({});
    newStaff.eventManagerDepartment.push(event._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Events / Seminar Administrator";
    event.event_head = newStaff._id;
    oldStaff.eventManagerDepartment.pull(event._id);
    if (oldStaff.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    notify.notifyContent = `you got the designation of as Events / Seminar Administrator`;
    notify.notifySender = event.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Event Manager Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = event.institute._id;
    await invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      event.institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      oldStaff.save(),
      event.save(),
      user.save(),
      notify.save(),
      newStaff.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned Event Manager",
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "EVENT_MANAGER",
      event?.institute?.sms_lang,
      "",
      "",
      ""
    );
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "EVENT_MANAGER",
        event?.institute?.sms_lang,
        "",
        "",
        ""
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelManagerStaffQuery = async (req, res) => {
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
      select: "hostelDepart",
    });
    const newStaff = await Staff.findById({ _id: nsid });
    const user = await User.findById({ _id: `${newStaff.user}` });
    const one_hostel = await Hostel.findById({
      _id: `${oldStaff?.institute?.hostelDepart[0]}`,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const notify = new Notification({});
    newStaff.hostelDepartment.push(one_hostel?._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Hostel Manager";
    one_hostel.hostel_manager = newStaff._id;
    oldStaff.hostelDepartment.pull(one_hostel?._id);
    if (oldStaff.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    notify.notifyContent = `you got the designation of Hostel Manager`;
    notify.notifySender = one_hostel?.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Hostel Manager Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = one_hostel?.institute._id;
    await invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      one_hostel?.institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      oldStaff.save(),
      one_hostel.save(),
      user.save(),
      notify.save(),
      newStaff.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned Hostel Manager",
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "HOSTEL_MANAGER",
      one_hostel?.institute?.sms_lang,
      "",
      "",
      ""
    );
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "HOSTEL_MANAGER",
        one_hostel?.institute?.sms_lang,
        "",
        "",
        ""
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderStaffUserLoginQuery = async (req, res) => {
  try {
    const { phone, email, sid } = req.body;
    if (!sid && !phone && !email)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var valid_phone = await handle_undefined(phone);
    var valid_email = await handle_undefined(email);
    const one_staff = await Staff.findById(sid).populate({
      path: "institute",
      select: "insName insEmail",
    });
    var name = `${one_staff?.staffFirstName} ${
      one_staff?.staffMiddleName ? `${one_staff?.staffMiddleName}` : ""
    } ${one_staff?.staffLastName}`;
    var one_user = await User.findById({ _id: `${one_staff?.user}` });
    if (valid_phone) {
      one_user.userPhoneNumber = valid_phone
        ? valid_phone
        : one_user?.userPhoneNumber;
      await one_user.save();
      await send_phone_login_query(
        one_user?.userPhoneNumber,
        name,
        one_staff?.institute?.insName
        // one_staff?.studentClass?.classTitle
      );
    }
    if (valid_email) {
      one_user.userEmail = valid_email ? valid_email : one_user?.userEmail;
      await one_user.save();
      await send_email_authentication_login_query(
        one_user.userEmail,
        one_staff?.institute?.insEmail,
        name,
        one_staff?.institute?.insName
      );
    }
    res.status(200).send({
      message: "Staff User Login Credentials edited successfully👍",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAluminiStaffQuery = async (req, res) => {
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
      select: "aluminiDepart",
    });
    const newStaff = await Staff.findById({ _id: nsid });
    const user = await User.findById({ _id: `${newStaff.user}` });
    const alumini = await Alumini.findById({
      _id: `${oldStaff?.institute?.aluminiDepart[0]}`,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const notify = new Notification({});
    newStaff.aluminiDepartment.push(alumini?._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "Alumini Head";
    alumini.alumini_head = newStaff._id;
    oldStaff.aluminiDepartment.pull(alumini?._id);
    if (oldStaff.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    notify.notifyContent = `you got the designation of Alumini Head`;
    notify.notifySender = alumini?.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Alumini Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = alumini?.institute._id;
    await invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      alumini?.institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      oldStaff.save(),
      alumini.save(),
      user.save(),
      notify.save(),
      newStaff.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned Alumini Head",
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "ALUMINI",
      alumini?.institute?.sms_lang,
      "",
      "",
      ""
    );
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "ALUMINI",
        alumini?.institute?.sms_lang,
        "",
        "",
        ""
      );
    }
  } catch (e) {
    console.log(e);
  }
};


exports.renderLMSStaffQuery = async (req, res) => {
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
      select: "lms_depart",
    });
    const newStaff = await Staff.findById({ _id: nsid });
    const user = await User.findById({ _id: `${newStaff.user}` });
    const lms = await LMS.findById({
      _id: `${oldStaff?.institute?.lms_depart[0]}`,
    }).populate({
      path: "institute",
      select: "insName sms_lang",
    });
    const notify = new Notification({});
    newStaff.lms_department.push(lms._id);
    newStaff.staffDesignationCount += 1;
    newStaff.recentDesignation = "LMS Administrator";
    lms.active_staff = newStaff._id;
    oldStaff.lms_department.pull(lms._id);
    if (oldStaff.staffDesignationCount > 0) {
      oldStaff.staffDesignationCount -= 1;
    }
    oldStaff.recentDesignation = "";
    notify.notifyContent = `you got the designation of as LMS Administrator`;
    notify.notifySender = lms.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "LMS Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByInsPhoto = lms.institute._id;
    await invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      lms.institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      oldStaff.save(),
      lms.save(),
      user.save(),
      notify.save(),
      newStaff.save(),
    ]);
    res.status(200).send({
      message: "Successfully Assigned LMS Administrator",
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "LMS",
      lms?.institute?.sms_lang,
      "",
      "",
      ""
    );
    if (user?.userEmail) {
      email_sms_designation_alarm(
        user?.userEmail,
        "LMS",
        lms?.institute?.sms_lang,
        "",
        "",
        ""
      );
    }
  } catch (e) {
    console.log(e);
  }
}