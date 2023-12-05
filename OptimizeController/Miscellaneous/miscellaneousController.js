const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const User = require("../../models/User");
const Playlist = require("../../models/Playlist");
const Fees = require("../../models/Fees");
const Checklist = require("../../models/Checklist");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Batch = require("../../models/Batch");
const Video = require("../../models/Video");
const OrderPayment = require("../../models/RazorPay/orderPayment");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

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
    // const sEncrypt = await encryptionPayload(staff);
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
    // const studentEncrypt = await encryptionPayload(student);
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
    // const userEncrypt = await encryptionPayload(user);
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
    // const playEncrypt = await encryptionPayload(playlist);
    res.status(200).send({ message: "playlist data", playlist });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllFee = async (req, res) => {
  try {
    const fee = await Fees.find({});
    // const feeEncrypt = await encryptionPayload(fee);
    res.status(200).send({ message: "Fee data", fee });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllChecklist = async (req, res) => {
  try {
    const checklist = await Checklist.find({});
    // const checkEncrypt = await encryptionPayload(checklist);
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
    // const iEncrypt = await encryptionPayload(institute);
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
      .sort("-created_at")
      .limit(limit)
      .skip(skip)
      .select(
        "payment_module_type payment_amount created_at payment_status razorpay_order_id"
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
      })
      .populate({
        path: "payment_by_end_user_id",
        select: "userLegalName username photoId profilePhoto",
      })
      .populate({
        path: "payment_to_end_user_id",
        select: "insName photoId insProfilePhoto",
      });
    // const payEncrypt = await encryptionPayload(all);
    res.status(200).send({ message: "Payment Data", allPayment: all });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllBatch = async (req, res) => {
  try {
    const batch = await Batch.find({});
    // const batchEncrypt = await encryptionPayload(batch);
    res.status(200).send({ message: "Batch data", batch });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getAllVideo = async (req, res) => {
  try {
    const video = await Video.find({});
    // const vEncrypt = await encryptionPayload(video);
    res.status(200).send({ message: "Video Data", video });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

