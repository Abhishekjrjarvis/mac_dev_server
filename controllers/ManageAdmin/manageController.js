const ManageAdmin = require("../../models/ManageAdmin/manageAdmin");
const User = require("../../models/User");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const bcrypt = require("bcryptjs");
const Notification = require("../../models/notification");
const { uploadDocFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const jwt = require("jsonwebtoken");
const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");

function generateAccessManageToken(manage_name, manage_id, manage_pass) {
  return jwt.sign(
    { manage_name, manage_id, manage_pass },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "1y",
    }
  );
}

exports.renderAdministrator = async (req, res) => {
  try {
    const { user } = req.query;

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
      const access_user = await User.findById({ _id: user });
      const manage = new ManageAdmin({ ...req.body });
      manage.affiliation_admin = access_user._id;
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
      res
        .status(200)
        .send({ message: "You got the new responsibility 👍", status: true });
      const notify = new Notification({});
      notify.notifyContent = `Your got the designation of ${manage?.affiliation_name} as Afilliation Head`;
      notify.notifySender = manage._id;
      notify.notifyReceiever = access_user._id;
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
    });
  }
};

exports.renderAdministratorPassword = async (req, res) => {
  try {
    const { mid } = req.query;
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
      res.json({
        token: `Bearer ${token}`,
        manage: manage,
        institute: manage?.affiliation_institute_approve,
        login: true,
      });
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
        "affiliation_name affiliation_admin affiliation_institute_approve_count photoId photo"
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
    res
      .status(200)
      .send({ message: "Manage Admin with Roles 😀", manage, query: true });
  } catch (e) {}
};

exports.renderAdministratorAddInstitute = async (req, res) => {
  try {
    const { mid } = req.params;
    const { query_ins } = req.query;
    if (!mid)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😀",
        added: false,
      });
    const manage = await ManageAdmin.findById({ _id: mid });
    const institute = await InstituteAdmin.findById({ _id: `${query_ins}` });
    manage.affiliation_institute_request.push(institute?._id);
    manage.affiliation_institute_request_count += 1;
    await Promise.all([manage.save()]);
    res.status(200).send({ message: "Successfully Added 😀", added: true });
  } catch (e) {}
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
        "insName photoId insProfilePhoto name status isUniversal one_line_about insEmail insAddress followersCount coverId insProfileCoverPhoto"
      )
      .populate({
        path: "displayPersonList",
        select: "displayTitle createdAt",
        populate: {
          path: "displayUser",
          select: "userLegalName username photoId profilePhoto",
        },
      });
    res.status(200).send({
      message: "All Affiliated Institute 😀",
      all_ins: all_ins,
      query: true,
    });
  } catch (e) {}
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
    res.status(200).send({
      message: "All Affiliated Institute 😀",
      all_ins: all_ins,
      query: true,
    });
  } catch (e) {}
};
