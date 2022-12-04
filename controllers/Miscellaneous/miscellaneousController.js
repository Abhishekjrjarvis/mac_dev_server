const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const User = require("../../models/User");
const Playlist = require("../../models/Playlist");
const Fees = require("../../models/Fees");
const Checklist = require("../../models/Checklist");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Batch = require("../../models/Batch");
const Video = require("../../models/Video");

exports.getAllStaff = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const staff = await Staff.find({})
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffStatus"
      )
      .populate({
        path: "user",
        select:
          "userLegalName photoId profilePhoto userStatus one_line_about followerCount coverId profileCoverPhoto",
      })
      .populate({
        path: "institute",
        select: "insName name photoId insProfilePhoto one_line_about",
      });
    res.status(200).send({ message: "staff data", sRandom: staff });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllStudent = async (req, res) => {
  try {
    const student = await Student.find({})
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto"
      )
      .populate({
        path: "institute",
        select: "insName photoId insProfilePhoto",
      });
    res.status(200).send({ message: "Student data", student });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const user = await User.find({})
      .sort("-created_at")
      .limit(limit)
      .skip(skip)
      .select(
        "userLegalName username photoId profilePhoto userStatus one_line_about followerCount coverId profileCoverPhoto"
      );
    res.status(200).send({ message: "User data", uRandom: user });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.find({}).populate({
      path: "elearning",
      populate: {
        path: "elearningHead",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      },
    });
    res.status(200).send({ message: "playlist data", playlist });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllFee = async (req, res) => {
  try {
    const fee = await Fees.find({});
    res.status(200).send({ message: "Fee data", fee });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllChecklist = async (req, res) => {
  try {
    const checklist = await Checklist.find({});
    res.status(200).send({ message: "checklist data", checklist });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllInstitute = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const institute = await InstituteAdmin.find({ status: "Approved" })
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
    res.status(200).send({ message: "Institute data", iRandom: institute });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const all = await OrderPayment.find({ payment_mode: "By Bank" })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "payment_module_type payment_amount createdAt payment_status razorpay_order_id"
      )
      .populate({
        path: "payment_fee",
        select: "feeName",
      })
      .populate({
        path: "payment_admission",
        select: "applicationName",
      })
      .populate({
        path: "payment_checklist",
        select: "checklistName",
      });
    res.status(200).send({ message: "Payment Data", allPayment: all });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllBatch = async (req, res) => {
  try {
    const batch = await Batch.find({});
    res.status(200).send({ message: "Batch data", batch });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllVideo = async (req, res) => {
  try {
    const video = await Video.find({});
    res.status(200).send({ message: "Video Data", video });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.fetchDeviceToken = async (req, res) => {
  try {
    const { deviceToken, id } = req.body;
    const user = await User.findOne({ _id: id });
    const institute = await InstituteAdmin.findOne({ _id: id });
    if (user) {
      user.deviceToken = deviceToken;
      await user.save();
    } else if (institute) {
      institute.deviceToken = deviceToken;
      await institute.save();
    } else {
    }
    res.status(200).send({ message: "device Token set" });
  } catch {}
};
