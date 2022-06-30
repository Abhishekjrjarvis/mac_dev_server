const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const InstituteAdmin = require("../../models/InstituteAdmin");
const User = require("../../models/User");
const Department = require("../../models/User");
const Class = require("../../models/Class");
const Finance = require("../../models/Finance");
const ELearning = require("../../models/ELearning");
const Library = require("../../models/Library");
const AdmissionAdmin = require("../../models/AdmissionAdmin");
const Sport = require("../../models/Sport");
const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const InsAnnouncement = require("../../models/InsAnnouncement");
const ResourcesKey = require("../../models/ResourcesKey");
const Video = require("../../models/Video");
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const ReplyComment = require('../../models/ReplyComment/ReplyComment')

const {
  getFileStream,
  deleteFile,
  uploadFile,
  uploadDocFile,
} = require("../../S3Configuration");

exports.getImage = async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch (err) {
    console.log(err.message);
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
    const post = await Post.find({author: institute._id})
    post.forEach(async (ele) =>{
      ele.authorPhotoId = "0"
      ele.authorProfilePhoto = institute.insProfilePhoto
      await ele.save()
    })
    const comment = await Comment.find({ author: institute._id})
    comment.forEach(async (com) => {
      com.authorPhotoId = "0"
      com.authorProfilePhoto = institute.insProfilePhoto
      await com.save()
    })
    const replyComment = await ReplyComment.find({ author: institute._id})
    replyComment.forEach(async (reply) => {
      reply.authorPhotoId = "0"
      reply.authorProfilePhoto = institute.insProfilePhoto
      await reply.save()
    })
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
    const file = req.file;
    const user = await User.findById({ _id: id });
    if (user.profilePhoto) await deleteFile(user.profilePhoto);
    const width = 112;
    const height = 112;
    const results = await uploadFile(file, width, height);
    user.profilePhoto = results.key;
    user.photoId = "0";
    await user.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "Successfully photo change" });
    const post = await Post.find({author: user._id})
    post.forEach(async (ele) =>{
      ele.authorPhotoId = "0"
      ele.authorProfilePhoto = user.profilePhoto
      await ele.save()
    })
    const comment = await Comment.find({ author: user._id})
    comment.forEach(async (com) => {
      com.authorPhotoId = "0"
      com.authorProfilePhoto = user.profilePhoto
      await com.save()
    })
    const replyComment = await ReplyComment.find({ author: user._id})
    replyComment.forEach(async (reply) => {
      reply.authorPhotoId = "0"
      reply.authorProfilePhoto = user.profilePhoto
      await reply.save()
    })
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
    if (department.photoId !== '1') await deleteFile(department.photo);
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
    const admissionAdmin = await AdmissionAdmin.findById({ _id: aid });
    if (admissionAdmin.photo) await deleteFile(admissionAdmin.photo);
    const width = 112;
    const height = 112;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    admissionAdmin.photo = results.key;
    admissionAdmin.photoId = "0";
    await admissionAdmin.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch (err) {
    console.log(err.message);
  }
};

exports.patchAdmissionImageCover = async (req, res) => {
  try {
    const { aid } = req.params;
    const admissionAdmin = await AdmissionAdmin.findById({ _id: aid });
    if (admissionAdmin.cover) await deleteFile(admissionAdmin.cover);
    const width = 375;
    const height = 245;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    admissionAdmin.cover = results.key;
    admissionAdmin.coverId = "0";
    await admissionAdmin.save();
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
