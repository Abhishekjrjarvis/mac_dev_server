const ManageAdmin = require("../../models/ManageAdmin/manageAdmin");
const User = require("../../models/User");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const bcrypt = require("bcryptjs");
const Notification = require("../../models/notification");
const { uploadDocFile, deleteFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const jwt = require("jsonwebtoken");
const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Finance = require("../../models/Finance");
const Student = require("../../models/Student");
const Admission = require("../../models/Admission/Admission");
const Sport = require("../../models/Sport");
const Staff = require("../../models/Staff");
const Library = require("../../models/Library/Library");
const Transport = require("../../models/Transport/transport");
const { handle_undefined } = require("../../Handler/customError");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const Hostel = require("../../models/Hostel/hostel");
const EventManager = require("../../models/Event/eventManager");
const Alumini = require("../../models/Alumini/Alumini");

function generateAccessManageToken(manage_name, manage_id, manage_pass) {
  return jwt.sign(
    { manage_name, manage_id, manage_pass },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "1y",
    }
  );
}

function generateAccessInsToken(ins_name, ins_id, ins_pass) {
  return jwt.sign({ ins_name, ins_id, ins_pass }, process.env.TOKEN_SECRET, {
    expiresIn: "1y",
  });
}

exports.renderAdministrator = async (req, res) => {
  try {
    const { user } = req.body;

    const valid_institute = await InstituteAdmin.findOne({
      name: `${req.body.affiliation_username}`,
    });
    const valid_admin = await Admin.findOne({
      adminUserName: `${req.body.affiliation_username}`,
    });
    const valid_user = await User.findOne({
      username: `${req.body.affiliation_username}`,
    });
    const manage_user = await ManageAdmin.findOne({
      affiliation_username: req.body.affiliation_username,
    });

    if (valid_institute) {
      res
        .status(400)
        .send({ message: "Username Already Exists 😡", deny: true });
    } else if (valid_user) {
      res
        .status(400)
        .send({ message: "Username Already Exists 😡", deny: true });
    } else if (valid_admin) {
      res
        .status(400)
        .send({ message: "Username Already Exists 😡", deny: true });
    } else if (manage_user) {
      res
        .status(400)
        .send({ message: "Username Already Exists 😡", deny: true });
    } else {
      const access_user = await User.findOne({ username: user });
      const manage = new ManageAdmin({ ...req.body });
      manage.affiliation_admin = access_user._id;
      manage.affiliation_status = "Approved";
      access_user.manage_admins.push(manage._id);
      manage.permission.push({
        role: "full_read_access",
        author: access_user._id,
      });
      if (req.file) {
        const results = await uploadDocFile(req.file);
        manage.photo = results.key;
        manage.photoId = "1";
      }
      await Promise.all([manage.save(), access_user.save()]);
      if (req.file) {
        await unlinkFile(req.file.path);
      }
      // const manageEncrypt = await encryptionPayload(manage._id);
      res.status(200).send({
        message: "You got the new responsibility 👍",
        status: true,
        manage: manage?._id,
      });
      const notify = new Notification({});
      notify.notifyContent = `Your got the designation of ${manage?.affiliation_name} as Afilliation Head`;
      notify.notifySender = manage._id;
      notify.notifyReceiever = access_user._id;
      notify.notifyCategory = "Manage Admin Designation";
      access_user.uNotify.push(notify._id);
      notify.user = access_user._id;
      notify.notifyByManageAdminPhoto = manage._id;
      invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        "New Affiliation",
        access_user._id,
        access_user.deviceToken
      );
    }
  } catch (e) {
    res.status(200).send({
      message: "There is a bug need to fixed immediately 😀",
      status: false,
      e,
    });
  }
};

exports.renderAdministratorPassword = async (req, res) => {
  try {
    const { mid } = req.params;
    const { password, rePassword } = req.body;
    const manage = await ManageAdmin.findById({ _id: mid });
    const genPass = bcrypt.genSaltSync(12);
    const hashPass = bcrypt.hashSync(password, genPass);
    if (password === rePassword) {
      manage.affiliation_password = hashPass;
      await manage.save();
      const token = generateAccessManageToken(
        manage?.affiliation_username,
        manage?._id,
        manage?.affiliation_password
      );
      // const passEncrypt = await encryptionPayload(manage);
      res.json({ token: `Bearer ${token}`, manage: manage, login: true });
    } else {
      res.send({ message: "Invalid Combination", login: false });
    }
  } catch (e) {
    console.log("Manage Pass", e);
  }
};

module.exports.renderAdministratorAuthentication = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const manage = await ManageAdmin.findOne({
      affiliation_username: `${userName}`,
    });

    if (manage) {
      const checkAdminPass = bcrypt.compareSync(
        password,
        manage.affiliation_password
      );
      if (checkAdminPass) {
        const token = generateAccessManageToken(
          manage?.affiliation_username,
          manage?._id,
          manage?.affiliation_password
        );
        res.json({ token: `Bearer ${token}`, manage: manage, login: true });
      } else {
        res.send({ message: "Invalid Credentials", login: false });
      }
    } else {
      res.send({ message: "No Existence 😡", login: false });
    }
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.renderAdministratorQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    if (!mid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😀",
        query: false,
      });
    const manage = await ManageAdmin.findById({ _id: mid })
      .select(
        "affiliation_name affiliation_username affiliation_admin affiliation_institute_approve_count photoId photo"
      )
      .populate({
        path: "affiliation_admin",
        select: "username userLegalName photoId profilePhoto",
      })
      .populate({
        path: "affiliation_institute_approve",
        select: "studentCount staffCount insBankBalance",
      })
      .lean()
      .exec();

    // const classesCount = await Department
    // const rolesEncrypt = await encryptionPayload(manage);
    res
      .status(200)
      .send({ message: "Manage Admin with Roles 😀", manage, query: true });
  } catch (e) {}
};

exports.renderAdministratorAddInstitute = async (req, res) => {
  try {
    const { mid } = req.params;
    const { query_ins } = req.body;
    if (!mid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😀",
        added: false,
      });
    const manage = await ManageAdmin.findById({ _id: mid });
    const institute = await InstituteAdmin.findById({ _id: `${query_ins}` });
    manage.affiliation_institute_request.push(institute?._id);
    institute.request_at = manage._id;
    manage.affiliation_institute_request_count += 1;
    await Promise.all([manage.save(), institute.save()]);
    res.status(200).send({ message: "Successfully Added 😀", added: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdministratorStatus = async (req, res) => {
  try {
    const { mid } = req.params;
    const { status_ins, status } = req.query;
    if (!mid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 🔍",
        status: false,
      });
    const manage = await ManageAdmin.findById({ _id: mid });
    const institute = await InstituteAdmin.findById({ _id: `${status_ins}` });
    if (status === "Approve") {
      manage.affiliation_institute_request.splice(`${institute?._id}`, 1);
      if (manage.affiliation_institute_request_count > 0) {
        manage.affiliation_institute_request_count -= 1;
      }
      manage.affiliation_institute_approve.push(institute?._id);
      manage.affiliation_institute_approve_count += 1;
      institute.affiliation_by.push(manage._id);
      await Promise.all([manage.save(), institute.save()]);
      res
        .status(200)
        .send({ message: "Approve By Affiliation 😀", status: true });
    } else if (status === "Reject") {
      manage.affiliation_institute_request.splice(`${institute?._id}`, 1);
      if (manage.affiliation_institute_request_count > 0) {
        manage.affiliation_institute_request_count -= 1;
      }
      manage.affiliation_institute_reject.push(institute?._id);
      manage.affiliation_institute_reject_count += 1;
      institute.request_at = null;
      await Promise.all([manage.save(), institute.save()]);
      res
        .status(200)
        .send({ message: "Reject By Affiliation 😒", status: true });
    } else {
      res.status(400).send({ message: "Invalid Status 😡", status: false });
    }
  } catch (e) {}
};

exports.renderAdministratorAllInsQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    // var all_ins_token = [];
    // var token = {
    //   all_ins: [],
    //   token: "",
    // };
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!mid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😀",
        query: false,
      });
    const manage = await ManageAdmin.findById({ _id: mid }).select(
      "affiliation_institute_approve"
    );

    const all_ins = await InstituteAdmin.find({
      _id: { $in: manage?.affiliation_institute_approve },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "insName photoId insProfilePhoto financeDepart bankAccountPhoneNumber bankAccountType bankAccountHolderName bankIfscCode bankAccountPhoneNumber financeStatus admissionDepart admissionStatus name status isUniversal one_line_about insEmail insAddress followersCount coverId insProfileCoverPhoto"
      )
      .populate({
        path: "displayPersonList",
        select: "displayTitle createdAt",
        populate: {
          path: "displayUser",
          select: "userLegalName username photoId profilePhoto",
        },
      });

    // all_ins?.forEach((ele) => {
    //   var all = generateAccessInsToken(ele?.name, ele?._id, ele?.insPassword);
    //   token.all_ins = ele;
    //   token.token = all;
    //   all_ins_token.push(token);
    // });
    // const allEncrypt = await encryptionPayload(all_ins);
    res.status(200).send({
      message: "All Affiliated Institute 😀",
      all_ins: all_ins,
      query: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdministratorAllRequest = async (req, res) => {
  try {
    const { mid } = req.params;
    if (!mid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😀",
        query: false,
      });
    const manage = await ManageAdmin.findById({ _id: mid }).select(
      "affiliation_institute_request"
    );

    const all_ins = await InstituteAdmin.find({
      _id: { $in: manage?.affiliation_institute_request },
    })
      .sort("-createdAt")
      .select(
        "insName insType insMode name photoId insProfilePhoto insEmail insAddress insState insDistrict insPincode insPhoneNumber name status isUniversal coverId insProfileCoverPhoto"
      );
    // const reqEncrypt = await encryptionPayload(all_ins);
    res.status(200).send({
      message: "All Affiliated Institute 😀",
      all_ins: all_ins,
      query: true,
    });
  } catch (e) {}
};

exports.renderAdministratorAllFinance = async (req, res) => {
  try {
    const { mid } = req.params;
    if (!mid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😀",
        query: false,
      });
    const manage = await ManageAdmin.findById({ _id: mid }).select(
      "affiliation_institute_approve"
    );

    const all_finance = await Finance.find({
      institute: { $in: manage?.affiliation_institute_approve },
    }).select(
      "financeTotalBalance financeSubmitBalance financeBankBalance financeExemptBalance "
    );

    const student = await Student.find({
      $and: [
        { institute: { $in: manage?.affiliation_institute_approve } },
        { studentStatus: "Approved" },
      ],
    }).select("studentRemainingFeeCount");
    // Add Another Encryption
    res.status(200).send({
      message: "All Affiliated Institute 😀",
      all_finance: all_finance,
      all_remain: student,
      query: true,
    });
  } catch (e) {}
};

exports.renderAdministratorAllAdmission = async (req, res) => {
  try {
    const { mid } = req.params;
    if (!mid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😀",
        query: false,
      });
    const manage = await ManageAdmin.findById({ _id: mid }).select(
      "affiliation_institute_approve"
    );

    const all_admission = await Admission.find({
      institute: { $in: manage?.affiliation_institute_approve },
    }).select(
      "onlineFee offlineFee newAppCount queryCount remainingFeeCount completedCount"
    );

    const student = await Student.find({
      $and: [
        { institute: { $in: manage?.affiliation_institute_approve } },
        { studentStatus: "Approved" },
      ],
    }).select("admissionRemainFeeCount");
    // Add Another Encryption
    res.status(200).send({
      message: "All Affiliated Institute 😀",
      all_admission: all_admission,
      all_remain: student,
      query: true,
    });
  } catch (e) {}
};

exports.renderAdministratorAllManageAdmin = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      var manage = await ManageAdmin.find({
        $or: [{ affiliation_name: { $regex: search, $options: "i" } }],
      }).select(
        "affiliation_name photoId photo affiliation_institute_approve affiliation_institute_approve_count affiliation_institute_request"
      );
    } else {
      var manage = await ManageAdmin.find({})
        .limit(limit)
        .skip(skip)
        .select(
          "affiliation_name photoId photo affiliation_institute_approve affiliation_institute_approve_count affiliation_institute_request "
        );
    }
    if (manage?.length > 0) {
      // const searchEncrypt = await encryptionPayload(manage);
      res.status(200).send({
        message: "Affiliation at one place",
        manage: manage,
      });
    } else {
      res.status(404).send({ message: "Renovation at manage", manage: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdministratorAllUser = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      var user = await User.find({
        $or: [{ userLegalName: { $regex: search, $options: "i" } }],
      }).select("userLegalName username photoId profilePhoto");
    } else {
      var user = await User.find({})
        .limit(limit)
        .skip(skip)
        .select("userLegalName username photoId profilePhoto");
    }
    if (user?.length > 0) {
      // const userEncrypt = await encryptionPayload(user);
      res.status(200).send({
        message: "Affiliation at one place",
        user: user,
      });
    } else {
      res.status(404).send({ message: "Renovation at user", user: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdministratorOneInstituteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😀",
        query: false,
      });
    const institute = await InstituteAdmin.findById({ _id: id })
      .select(
        "insName status photoId insProfilePhoto career_count tender_count sportStatus sms_lang sportClassStatus blockStatus one_line_about staff_privacy email_privacy contact_privacy tag_privacy questionCount pollCount insAffiliated insEditableText insEditableTexts activateStatus accessFeature coverId insRegDate departmentCount announcementCount admissionCount insType insMode insAffiliated insAchievement joinedCount staffCount studentCount insProfileCoverPhoto followersCount name followingCount postCount insAbout insEmail insAddress insEstdDate createdAt insPhoneNumber insAffiliated insAchievement admissionCount request_at affiliation_by"
      )
      .populate({
        path: "displayPersonList",
        select: "displayTitle createdAt",
        populate: {
          path: "displayUser",
          select: "userLegalName username profilePhoto",
        },
      })
      .lean()
      .exec();

    const finance = await Finance.findOne({ institute: institute?._id }).select(
      "financeTotalBalance"
    );
    const admission = await Admission.findOne({
      institute: institute?._id,
    }).select("newAppCount");
    const sport = await Sport.findOne({ institute: institute?._id }).select(
      "sportEventCount"
    );
    const library = await Library.findOne({ institute: institute?._id }).select(
      "bookCount"
    );
    const alumini = await Alumini.findOne({ institute: institute?._id }).select(
      "certifcate_given_count"
    );
    const transport = await Transport.findOne({
      institute: institute?._id,
    }).select("vehicle_count passenger_count");
    const hostel = await Hostel.findOne({
      institute: institute?._id,
    }).select("hostelities_count");
    const event = await EventManager.findOne({}).select("event_count");
    const count = {
      totalBalance: finance?.financeTotalBalance,
      ongoingEvent: sport?.sportEventCount,
      totalBooks: library?.bookCount,
      totalVehicles: transport?.vehicle_count,
      totalPassenger: transport?.passenger_count,
      totalHostelities: hostel?.hostelities_count,
      totalApplication: admission?.newAppCount,
      totalAlumini: alumini?.certifcate_given_count,
      totalEvent: event?.event_count,
    };
    res.status(200).send({ message: "Limit Post Ins", institute, count });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdministratorAllMentorsArray = async (req, res) => {
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
    var manage = await ManageAdmin.findById({ _id: mid }).select(
      "affiliation_institute_approve"
    );
    if (search) {
      var all_staff = await Staff.find({
        $and: [
          { institute: { $in: manage?.affiliation_institute_approve } },
          { staffStatus: "Approved" },
        ],
        $or: [
          {
            staffFirstName: { $regex: search, $options: "i" },
          },
          {
            staffMiddleName: { $regex: search, $options: "i" },
          },
          {
            staffLastName: { $regex: search, $options: "i" },
          },
        ],
      })
        .select(
          "staffFirstName staffMiddleNamr staffLastName photoId staffProfilePhoto staffJoinDate staffGender"
        )
        .populate({
          path: "user",
          select: "userPhoneNumber",
        })
        .populate({
          path: "institute",
          select: "insName name photoId insProfilePhoto",
        });
    } else {
      var all_staff = await Staff.find({
        $and: [
          { institute: { $in: manage?.affiliation_institute_approve } },
          { staffStatus: "Approved" },
        ],
      })
        .limit(limit)
        .skip(skip)
        .select(
          "staffFirstName staffMiddleNamr staffLastName photoId staffProfilePhoto staffJoinDate staffGender"
        )
        .populate({
          path: "user",
          select: "userPhoneNumber",
        })
        .populate({
          path: "institute",
          select: "insName name photoId insProfilePhoto",
        });
    }
    if (all_staff?.length > 0) {
      res.status(200).send({
        message: "Lot's of Mentors Available",
        access: true,
        all_staff: all_staff,
      });
    } else {
      res.status(200).send({
        message: "No Mentors Available",
        access: false,
        all_staff: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdministratorAllStudentsArray = async (req, res) => {
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
    var manage = await ManageAdmin.findById({ _id: mid }).select(
      "affiliation_institute_approve"
    );
    if (search) {
      var all_student = await Student.find({
        $and: [
          { institute: { $in: manage?.affiliation_institute_approve } },
          { studentStatus: "Approved" },
        ],
        $or: [
          {
            studentFirstName: { $regex: search, $options: "i" },
          },
          {
            studentMiddleName: { $regex: search, $options: "i" },
          },
          {
            studentLastName: { $regex: search, $options: "i" },
          },
        ],
      })
        .select(
          "studentFirstName studentMiddleNamr studentLastName photoId studentProfilePhoto studentAdmissionDate studentGender"
        )
        .populate({
          path: "user",
          select: "userPhoneNumber",
        })
        .populate({
          path: "institute",
          select: "insName name photoId insProfilePhoto",
        });
    } else {
      var all_student = await Student.find({
        $and: [
          { institute: { $in: manage?.affiliation_institute_approve } },
          { studentStatus: "Approved" },
        ],
      })
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleNamr studentLastName photoId studentProfilePhoto studentAdmissionDate studentGender"
        )
        .populate({
          path: "user",
          select: "userPhoneNumber",
        })
        .populate({
          path: "institute",
          select: "insName name photoId insProfilePhoto",
        });
    }
    if (all_student?.length > 0) {
      res.status(200).send({
        message: "Lot's of Students Available",
        access: true,
        all_student: all_student,
      });
    } else {
      res.status(200).send({
        message: "No Students Available",
        access: false,
        all_student: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdministratorPersonalQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    const { delete_pic } = req.query;
    const image = handle_undefined(delete_pic);
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    await ManageAdmin.findByIdAndUpdate(mid, req.body);
    if (image) {
      await deleteFile(image);
    }
    res.status(200).send({ message: "Successfully Updated", access: true });
  } catch (e) {
    console.log(e);
  }
};
