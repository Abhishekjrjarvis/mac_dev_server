const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const InstituteAdmin = require("../../models/InstituteAdmin");
const User = require("../../models/User");
const Department = require("../../models/Department");
const Class = require("../../models/Class");
const Finance = require("../../models/Finance");
const EventManager = require("../../models/Event/eventManager");
const ELearning = require("../../models/ELearning");
const Library = require("../../models/Library/Library");
const Admission = require("../../models/Admission/Admission");
const Sport = require("../../models/Sport");
const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const InsAnnouncement = require("../../models/InsAnnouncement");
const ResourcesKey = require("../../models/ResourcesKey");
const Video = require("../../models/Video");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const ReplyComment = require("../../models/ReplyComment/ReplyComment");
const Answer = require("../../models/Question/Answer");
const AnswerReply = require("../../models/Question/AnswerReply");
const SportTeam = require("../../models/SportTeam");
const SportClass = require("../../models/SportClass");
const Transport = require("../../models/Transport/transport");
const Vehicle = require("../../models/Transport/vehicle");
const LandingCareer = require("../../models/LandingModel/Career/landingCareer");
const LandingTender = require("../../models/LandingModel/Tender/landingTender");
const Alumini = require("../../models/Alumini/Alumini");
const Hostel = require("../../models/Hostel/hostel");
const HostelUnit = require("../../models/Hostel/hostelUnit");
const HostelRoom = require("../../models/Hostel/hostelRoom");
const {
  getFileStream,
  deleteFile,
  uploadFile,
  uploadDocFile,
  uploadOneDocFile,
} = require("../../S3Configuration");
const {
  file_to_aws_and_deleted_previous,
} = require("../../Utilities/uploadFileAws");

exports.getImage = async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch (err) {
    console.log(err.message);
  }
};

exports.uploadOneImage = async (req, res) => {
  try {
    const file = req.file;
    const results = await uploadDocFile(file);
    const imageKey = results.Key;
    res.status(200).send({ message: "Uploaded file Successfully", imageKey });
    await unlinkFile(file.path);
  } catch (err) {
    console.log(err);
  }
};
exports.patchInstituteImagePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const institute = await InstituteAdmin.findById({ _id: id });
    if (institute.insProfilePhoto) await deleteFile(institute.insProfilePhoto);
    const width = 112;
    const height = 112;
    const results = await uploadFile(file, width, height);
    institute.insProfilePhoto = results.key;
    institute.photoId = "0";
    await institute.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Successfully photo change" });
    const post = await Post.find({ author: institute._id });
    post.forEach(async (ele) => {
      ele.authorPhotoId = "0";
      ele.authorProfilePhoto = institute.insProfilePhoto;
      await ele.save();
    });
    const comment = await Comment.find({ author: institute._id });
    comment.forEach(async (com) => {
      com.authorPhotoId = "0";
      com.authorProfilePhoto = institute.insProfilePhoto;
      await com.save();
    });
    const replyComment = await ReplyComment.find({ author: institute._id });
    replyComment.forEach(async (reply) => {
      reply.authorPhotoId = "0";
      reply.authorProfilePhoto = institute.insProfilePhoto;
      await reply.save();
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchInstituteImageCover = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const institute = await InstituteAdmin.findById({ _id: id });
    if (institute.insProfileCoverPhoto)
      await deleteFile(institute.insProfileCoverPhoto);
    const width = 375;
    const height = 245;
    const results = await uploadFile(file, width, height);
    institute.insProfileCoverPhoto = results.key;
    institute.coverId = "0";
    await institute.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Successfully cover change" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchInstituteDoc = async (req, res) => {
  try {
    const id = req.params.id;
    const file = req.file;
    const results = await uploadDocFile(file);
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.insDocument = results.key;
    await institute.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Uploaded" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.patchInstituteAnnouncementPhoto = async (req, res) => {
  try {
    const sid = req.params.id;
    const file = req.file;
    const width = 112;
    const height = 112;
    const results = await uploadFile(file, width, height);
    const announcements = await InsAnnouncement.findById({ _id: sid });
    announcements.insAnnPhoto = results.key;
    await announcements.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Uploaded" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.patchInstituteAnnouncementDoc = async (req, res) => {
  try {
    const sid = req.params.id;
    const announcements = await InsAnnouncement.findById({ _id: sid });
    for (let file in req.files) {
      const results = await uploadDocFile(file);
      announcements.anouncementDocument.push(results.Key);
      await unlinkFile(file.path);
    }
    await announcements.save();
    res.status(201).send({ message: "Uploaded" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.patchUserImagePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { sample_pic } = req.body;
    const user = await User.findById({ _id: id });
    if (!sample_pic) {
      // if (user.profilePhoto) await deleteFile(user.profilePhoto);
      const file = req.file;
      const width = 112;
      const height = 112;
      const results = await uploadFile(file, width, height);
      user.profilePhoto = results.key;
      user.photoId = "0";
      await user.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "Successfully photo change" });
    } else {
      user.profilePhoto = sample_pic;
      user.photoId = "0";
      await user.save();
      res.status(201).send({ message: "Successfully photo change" });
    }
    const post = await Post.find({ author: user._id });
    post.forEach(async (ele) => {
      ele.authorPhotoId = "0";
      ele.authorProfilePhoto = user.profilePhoto;
      await ele.save();
    });
    const comment = await Comment.find({ author: user._id });
    comment.forEach(async (com) => {
      com.authorPhotoId = "0";
      com.authorProfilePhoto = user.profilePhoto;
      await com.save();
    });
    const replyComment = await ReplyComment.find({ author: user._id });
    replyComment.forEach(async (reply) => {
      reply.authorPhotoId = "0";
      reply.authorProfilePhoto = user.profilePhoto;
      await reply.save();
    });
    const answers = await Answer.find({ author: user._id });
    answers.forEach(async (ans) => {
      ans.authorPhotoId = "0";
      ans.authorProfilePhoto = user.profilePhoto;
      await ans.save();
    });
    const answerReply = await AnswerReply.find({ author: user._id });
    answerReply.forEach(async (ansRep) => {
      ansRep.authorPhotoId = "0";
      ansRep.authorProfilePhoto = user.profilePhoto;
      await ansRep.save();
    });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchUserImageCover = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const user = await User.findById({ _id: id });
    if (user.profileCoverPhoto) await deleteFile(user.profileCoverPhoto);
    const width = 375;
    const height = 245;
    const results = await uploadFile(file, width, height);
    user.profileCoverPhoto = results.key;
    user.coverId = "0";
    await user.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Successfully cover change" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchDepartmentImagePhoto = async (req, res) => {
  try {
    const { did } = req.params;
    const department = await Department.findById({ _id: did });
    if (department.photo) await deleteFile(department.photo);
    const width = 112;
    const height = 112;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    department.photo = results.key;
    department.photoId = "0";
    await department.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchDepartmentImageCover = async (req, res) => {
  try {
    const { did } = req.params;
    const department = await Department.findById({ _id: did });
    if (department.cover) await deleteFile(department.cover);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    department.cover = results.key;
    department.coverId = "0";
    await department.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchClassImagePhoto = async (req, res) => {
  try {
    const { cid } = req.params;
    const clas = await Class.findById({ _id: cid });
    if (clas.photo) await deleteFile(clas.photo);
    const width = 112;
    const height = 112;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    clas.photo = results.key;
    clas.photoId = "0";
    await clas.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchClassImageCover = async (req, res) => {
  try {
    const { cid } = req.params;
    const clas = await Class.findById({ _id: cid });
    if (clas.cover) await deleteFile(clas.cover);
    const width = 375;
    const height = 250;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    clas.cover = results.key;
    clas.coverId = "0";
    await clas.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchFinanceImagePhoto = async (req, res) => {
  try {
    const { fid } = req.params;
    const finance = await Finance.findById({ _id: fid });
    if (finance.photo) await deleteFile(finance.photo);
    const width = 112;
    const height = 112;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    finance.photo = results.key;
    finance.photoId = "0";
    await finance.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchFinanceImageCover = async (req, res) => {
  try {
    const { fid } = req.params;
    const finance = await Finance.findById({ _id: fid });
    if (finance.cover) await deleteFile(finance.cover);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    finance.cover = results.key;
    finance.coverId = "0";
    await finance.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchElearningImagePhoto = async (req, res) => {
  try {
    const { eid } = req.params;
    const file = req.file;
    const elearning = await ELearning.findById({ _id: eid });
    if (elearning.photo) await deleteFile(elearning.photo);
    const width = 112;
    const height = 112;
    const results = await uploadFile(file, width, height);
    elearning.photoId = "0";
    elearning.photo = results.key;
    await elearning.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Photo is uploades" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchElearningImageCover = async (req, res) => {
  try {
    const { eid } = req.params;
    const file = req.file;
    const elearning = await ELearning.findById({ _id: eid });
    if (elearning.cover) await deleteFile(elearning.cover);
    const width = 375;
    const height = 245;
    const results = await uploadFile(file, width, height);
    elearning.coverId = "0";
    elearning.cover = results.key;
    await elearning.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Photo is uploades" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.postElearningVideoResources = async (req, res) => {
  try {
    const { vid } = req.params;
    const resource = new Resource({ name: req.body.name });
    for (let file of req.files) {
      const results = await uploadDocFile(file);
      const fileKey = new ResourcesKey({ resourceName: file.originalname });
      fileKey.resourceKey = results.key;
      resource.resourceKeys.push(fileKey._id);
      await fileKey.save();
      await unlinkFile(file.path);
    }
    const video = await Video.findById({ _id: vid });
    video.resource = resource._id;
    await Promise.all([video.save(), resource.save()]);
    res.status(201).send({ message: "Resources is added" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.patchLibraryImagePhoto = async (req, res) => {
  try {
    const { lid } = req.params;
    const file = req.file;
    const library = await Library.findById({ _id: lid });
    if (library.photo) await deleteFile(library.photo);
    const width = 112;
    const height = 112;
    const results = await uploadFile(file, width, height);
    library.photoId = "0";
    library.photo = results.key;
    await library.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Photo is uploades" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchLibraryImageCover = async (req, res) => {
  try {
    const { lid } = req.params;
    const file = req.file;
    const library = await Library.findById({ _id: lid });
    if (library.cover) await deleteFile(library.cover);
    const width = 375;
    const height = 245;
    const results = await uploadFile(file, width, height);
    library.coverId = "0";
    library.cover = results.key;
    await library.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Photo is uploades" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.patchAdmissionImagePhoto = async (req, res) => {
  try {
    const { aid } = req.params;
    const admission = await Admission.findById({ _id: aid });
    if (admission.photo) await deleteFile(admission.photo);
    const width = 112;
    const height = 112;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    admission.photo = results.key;
    admission.photoId = "0";
    await admission.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchAdmissionImageCover = async (req, res) => {
  try {
    const { aid } = req.params;
    const admission = await Admission.findById({ _id: aid });
    if (admission.cover) await deleteFile(admission.cover);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    admission.cover = results.key;
    admission.coverId = "0";
    await admission.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchSportImagePhoto = async (req, res) => {
  try {
    const { sid } = req.params;
    const sport = await Sport.findById({ _id: sid });
    if (sport.photo) await deleteFile(sport.photo);
    const width = 112;
    const height = 112;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    sport.photo = results.key;
    sport.photoId = "0";
    await sport.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchSportImageCover = async (req, res) => {
  try {
    const { sid } = req.params;
    const sport = await Sport.findById({ _id: sid });
    if (sport.cover) await deleteFile(sport.cover);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    sport.cover = results.key;
    sport.coverId = "0";
    await sport.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchSportClassImagePhoto = async (req, res) => {
  try {
    const { sid } = req.params;
    const sport = await SportClass.findById({ _id: sid });
    if (sport.photo) await deleteFile(sport.photo);
    const width = 112;
    const height = 112;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    sport.photo = results.key;
    sport.photoId = "0";
    await sport.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchSportClassImageCover = async (req, res) => {
  try {
    const { sid } = req.params;
    const sport = await SportClass.findById({ _id: sid });
    if (sport.cover) await deleteFile(sport.cover);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    sport.cover = results.key;
    sport.coverId = "0";
    await sport.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchSportTeamImageCover = async (req, res) => {
  try {
    const { sid } = req.params;
    const sport = await SportTeam.findById({ _id: sid });
    if (sport.cover) await deleteFile(sport.cover);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    sport.sportTeamPhoto = results.key;
    sport.photoId = "0";
    await sport.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchVehicleImageCover = async (req, res) => {
  try {
    const { vid } = req.params;
    const vehicle = await Vehicle.findById({ _id: vid });
    if (vehicle.vehicle_photo) await deleteFile(vehicle.vehicle_photo);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    vehicle.vehicle_photo = results.key;
    vehicle.photoId = "0";
    await vehicle.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchTransportImageCover = async (req, res) => {
  try {
    const { tid } = req.params;
    const trans = await Transport.findById({ _id: tid });
    if (trans.transport_photo) await deleteFile(trans.transport_photo);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    trans.transport_photo = results.key;
    trans.photoId = "0";
    await trans.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchEventManagerImageCover = async (req, res) => {
  try {
    const { eid } = req.params;
    const event = await EventManager.findById({ _id: eid });
    if (event.event_photo) await deleteFile(event.event_photo);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    event.event_photo = results.key;
    event.photoId = "0";
    await event.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchLandingCareerImageCover = async (req, res) => {
  try {
    const { lcid } = req.params;
    const career = await LandingCareer.findById({ _id: lcid });
    if (career.career_photo) await deleteFile(career.career_photo);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    career.career_photo = results.key;
    career.photoId = "0";
    await career.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Explore New Landing Career photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchLandingTenderImageCover = async (req, res) => {
  try {
    const { ltid } = req.params;
    const tender = await LandingTender.findById({ _id: ltid });
    if (tender.tender_photo) await deleteFile(tender.tender_photo);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    tender.tender_photo = results.key;
    tender.photoId = "0";
    await tender.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Explore New Landing Tender photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchAluminiImageCover = async (req, res) => {
  try {
    const { aid } = req.params;
    const alumini = await Alumini.findById({ _id: aid });
    if (alumini.alumini_photo) await deleteFile(alumini.alumini_photo);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    alumini.alumini_photo = results.key;
    alumini.photoId = "0";
    await alumini.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Explore New Alumini photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchHostelImageCover = async (req, res) => {
  try {
    const { hid } = req.params;
    const hostel = await Hostel.findById({ _id: hid });
    if (hostel.hostel_photo) await deleteFile(hostel.hostel_photo);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    hostel.hostel_photo = results.key;
    hostel.photoId = "0";
    await hostel.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Explore New Hostel photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchHostelUnitImageCover = async (req, res) => {
  try {
    const { huid } = req.params;
    const hostel_unit = await HostelUnit.findById({ _id: huid });
    if (hostel_unit.hostel_unit_photo)
      await deleteFile(hostel_unit.hostel_unit_photo);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    hostel_unit.hostel_unit_photo = results.key;
    hostel_unit.photoId = "0";
    await hostel_unit.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Explore New Hostel Unit photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchHostelRoomImageCover = async (req, res) => {
  try {
    const { hrid } = req.params;
    const room = await HostelRoom.findById({ _id: hrid });
    if (room.room_photo) await deleteFile(room.room_photo);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    room.room_photo = results.key;
    room.photoId = "0";
    await room.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Explore New Hostel Room photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchStaffImagePhoto = async (req, res) => {
  try {
    const sid = req.params.id;
    const file = req.file;
    const width = 112;
    const height = 112;
    const results = await uploadFile(file, width, height);
    const staff = await Staff.findById({ _id: sid });
    staff.staffProfilePhoto = results.key;
    staff.photoId = "0";
    await staff.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Uploaded" });
  } catch (err) {
    console.log(err.message);
  }
};
exports.patchStaffAddharDoc = async (req, res) => {
  try {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadDocFile(file);
    const staff = await Staff.findById({ _id: sid });
    staff.staffAadharCard = results.key;
    await staff.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Uploaded" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchStudentImagePhoto = async (req, res) => {
  try {
    const sid = req.params.id;
    const file = req.file;
    const width = 112;
    const height = 112;
    const results = await uploadFile(file, width, height);
    const student = await Student.findById({ _id: sid });
    student.studentProfilePhoto = results.key;
    student.photoId = "0";
    await student.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Uploaded" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchStudentAddharDoc = async (req, res) => {
  try {
    const sid = req.params.id;
    const file = req.file;
    const results = await uploadDocFile(file);
    const student = await Student.findById({ _id: sid });
    student.studentAadharCard = results.key;
    await student.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Uploaded" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.uploadOneWithDeletedPreviousImage = async (req, res) => {
  try {
    const file = req?.file;
    const previousKey = req.body?.previousKey || "";
    if (!file) throw "Please send to file to upload server";
    const imageKey = await file_to_aws_and_deleted_previous(file, previousKey);
    res.status(200).send({
      message: "File deleted and Uploaded file Successfully",
      imageKey,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.uploadOneImageDocs = async (req, res) => {
  try {
    const file = req.file;
    const results = await uploadOneDocFile(file);
    const locate = results.Location;
    const imageKey = results.Key;
    res.status(200).send({
      message: "Uploaded Document file Successfully",
      imageKey,
      locate,
    });
    await unlinkFile(file.path);
  } catch (err) {
    console.log(err);
  }
};

const build_Object_Chat_Images = async (arr) => {
  var obj = {};
  for (let i = 0; i < arr.length; i++) {
    const { chatKey, chatOriginalKey, chatLocation, chatOriginalLocation } =
      arr[i];
    obj[chatKey] = chatOriginalKey;
    obj[chatLocation] = chatOriginalLocation;
  }
  return obj;
};

exports.uploadChatDocumentImages = async (req, res) => {
  try {
    const { chatImageCount } = req.body;
    var obj_chat = [];
    var result_obj;
    for (var i = 1; i <= parseInt(chatImageCount); i++) {
      var fileValue = req?.files[`file${i}`];
      for (let file of fileValue) {
        const results = await uploadOneDocFile(file);
        obj_chat.push({
          chatKey: `key-${i}${results?.Key}`,
          chatOriginalKey: results?.Key,
          chatLocation: `Locate-${i}${results?.Location}`,
          chatOriginalLocation: results?.Location,
        });
        await unlinkFile(file.path);
      }
    }
    result_obj = await build_Object_Chat_Images(obj_chat);
    res.status(200).send({
      message: "Uploaded Document file Upto 30 Images Successfully",
      result_obj,
    });
  } catch (e) {
    console.log(e);
  }
};
