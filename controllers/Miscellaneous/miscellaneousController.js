const Staff = require('../../models/Staff')
const Student = require('../../models/Student')
const User = require('../../models/User')
const Payment = require('../../models/Payment')
const PlaylistPayment = require('../../models/PlaylistPayment')
const Playlist = require('../../models/Playlist')
const Fees = require('../../models/Fees')
const Checklist = require('../../models/Checklist')
const InstituteAdmin = require('../../models/InstituteAdmin')
const Batch = require('../../models/Batch')
const IdCardPayment = require('../../models/IdCardPayment')
const Video = require('../../models/Video')
const ApplyPayment = require('../../models/ApplyPayment')
const DepartmentApplication = require('../../models/DepartmentApplication')
const InstituteSupport = require('../../models/InstituteSupport')
const UserSupport = require('../../models/UserSupport')


exports.getAllStaff = async(req, res) =>{
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const staff = await Staff.find({})
        .select('staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto')
        .limit(limit)
        .skip(skip)

        res.status(200).send({ message: "staff data", sRandom: staff });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getAllStudent = async(req, res) =>{
    try {
        const student = await Student.find({})
        .select('studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto')
        .populate({
          path: "institute",
          select: 'insName photoId insProfilePhoto'
        });
        res.status(200).send({ message: "Student data", student });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllUser = async(req, res) =>{
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const user = await User.find({})
        .select('userLegalName username photoId profilePhoto')
        .limit(limit)
        .skip(skip)
        res.status(200).send({ message: "User data", uRandom: user });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getAllPaymentFee = async(req, res) =>{
    try {
        const payment = await Payment.find({});
        res.status(200).send({ message: "Data", payment });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllPlaylistPayment = async(req, res) =>{
    try {
        const ePayment = await PlaylistPayment.find({});
        res.status(200).send({ message: "Data", ePayment });
      } catch {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllPlaylist = async(req, res) =>{
    try {
        const playlist = await Playlist.find({}).populate({
          path: "elearning",
          populate: {
            path: "elearningHead",
            select: 'staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto'
          },
        });
        res.status(200).send({ message: "playlist data", playlist });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllPaymentUser = async(req, res) =>{
    try {
        const { id } = req.params;
        const payment = await Payment.find({ userId: `${id}` });
        res.status(200).send({ message: "pay", payment });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getAllPlaylistPaymentUser = async(req, res) =>{
    try {
        const { id } = req.params;
        const ePayment = await PlaylistPayment.find({ userId: `${id}` });
        res.status(200).send({ message: "pay", ePayment });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllFee = async(req, res) =>{
    try {
        const fee = await Fees.find({});
        res.status(200).send({ message: "Fee data", fee });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getAllChecklist = async(req, res) =>{
    try {
        const checklist = await Checklist.find({});
        res.status(200).send({ message: "checklist data", checklist });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllInstitute = async(req, res) =>{
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const institute = await InstituteAdmin.find({})
        .select('insName photoId insProfilePhoto name')
        .limit(limit)
        .skip(skip)
        res.status(200).send({ message: "Institute data", iRandom: institute });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllBatch = async(req, res) =>{
    try {
        const batch = await Batch.find({});
        res.status(200).send({ message: "Batch data", batch });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getAllIdCardPayment = async(req, res) =>{
    try {
        const iPayment = await IdCardPayment.find({});
        res.status(200).send({ message: "Data", iPayment });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllVideo = async(req, res) =>{
    try {
        const video = await Video.find({});
        res.status(200).send({ message: "Video Data", video });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getAllApplyPaymentUser = async(req, res) =>{
    try {
        const { id } = req.params;
        const aPayment = await ApplyPayment.find({ userId: `${id}` });
        res.status(200).send({ message: "Data", aPayment });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllDepartmentApplication = async(req, res) =>{
    try {
        const application = await DepartmentApplication.find({});
        res.status(200).send({ message: "Application Data", application });
      } catch(e) {
        console.log(
          `Error`, e.message
        );
      }
}

exports.getAllInsSupport = async(req, res) =>{
    try {
    const support = await InstituteSupport.find({}).populate({
      path: "institute",
      select: 'insName name photoId insProfilePhoto'
    });
    res.status(200).send({ message: "all institute support data", support });
  } catch(e) {
    console.log(`Error`, e.message);
  }
}

exports.getAllUserSupport = async(req, res) =>{
    try {
        const userSupport = await UserSupport.find({}).populate({
          path: "user",
          select: 'userLegalName username photoId profilePhoto'
        });
        res
          .status(200)
          .send({ message: "all institute userSupport data", userSupport });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}