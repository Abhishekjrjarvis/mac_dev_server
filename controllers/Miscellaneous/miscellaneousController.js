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


exports.getAllStaff = async(req, res) =>{
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const staff = await Staff.find({})
        .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select('staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffStatus')
        .populate({
          path: 'user',
          select: 'userLegalName photoId profilePhoto userStatus one_line_about followerCount coverId profileCoverPhoto'
        })
        .populate({
          path: 'institute',
          select: 'insName name photoId insProfilePhoto one_line_about'
        })
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
        .sort("-created_at")
        .limit(limit)
        .skip(skip)
        .select('userLegalName username photoId profilePhoto userStatus one_line_about followerCount coverId profileCoverPhoto')
        res.status(200).send({ message: "User data", uRandom: user });
      } catch(e) {
        console.log(`Error`, e.message);
      }
}

exports.getAllPaymentFee = async(req, res) =>{
    try {
        const payment = await Payment.find({})
        .select('txnDate createdAt txnId feeType txnAmount')
        .populate({
          path: 'studentId',
          select: 'studentFirstName studentMiddleName studentLastName',
          populate: {
            path: 'user',
            select: 'userLegalName username photoId profilePhoto'
          }
        })
        res.status(200).send({ message: "Data", payment });
      } catch(e){
        console.log(e)
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
        const institute = await InstituteAdmin.find({ status: 'Approved'})
        .sort('-createdAt')
        .limit(limit)
        .skip(skip)
        .select('insName photoId insProfilePhoto name status isUniversal one_line_about insEmail insAddress followersCount coverId insProfileCoverPhoto')
        .populate({
          path: "displayPersonList",
          select: "displayTitle createdAt",
          populate: {
            path: "displayUser",
            select: "userLegalName username photoId profilePhoto",
          },
        })
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


exports.fetchDeviceToken = async(req, res) => {
  try{
    const { deviceToken, id } = req.body
    const user = await User.findOne({_id: id})
    const institute = await InstituteAdmin.findOne({_id: id})
    if(user){
      user.deviceToken = deviceToken
      await user.save()
    }
    else if(institute){
      institute.deviceToken = deviceToken
      await institute.save()
    }
    else{}
    res.status(200).send({ message: 'device Token set'})
  }
  catch{

  }
}