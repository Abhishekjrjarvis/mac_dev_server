const InstituteAdmin = require("../../models/InstituteAdmin");
// const User = require("../../models/User");
// const Staff = require("../../models/Staff");
// const Post = require("../../models/Post");
// const Notification = require("../../models/notification");
// const InsAnnouncement = require("../../models/InsAnnouncement");
const Student = require("../../models/Student");
// const Comment = require("../../models/Comment");
// const Department = require("../../models/Department");
// const Admin = require("../../models/superAdmin");
// const Report = require("../../models/Report");
// const Batch = require("../../models/Batch");
// const InstituteSupport = require("../../models/InstituteSupport");
// const Complaint = require("../../models/Complaint");
// const Transfer = require("../../models/Transfer");
// const Finance = require("../../models/Finance");
// const Library = require("../../models/Library");
// const Subject = require("../../models/Subject");
// const AdmissionAdmin = require("../../models/AdmissionAdmin");
// const Class = require("../../models/Class");
// const Leave = require("../../models/Leave");
// const ClassMaster = require("../../models/ClassMaster");
// const SubjectMaster = require("../../models/SubjectMaster");

// const {
//   getFileStream,
//   uploadDocFile,
//   uploadVideo,
//   uploadFile,
// } = require("../../S3Configuration");
// const fs = require("fs");
// const util = require("util");
// const unlinkFile = util.promisify(fs.unlink);

exports.approveStudent = async (req, res) => {
  try {
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const insId = req.params.id;
    const ins = await InstituteAdmin.findById(insId);
    const students = await Student.find({ _id: { $in: ins.ApproveStudent } })
      .limit(itemPerPage)
      .skip(dropItem)
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto"
      );
    res.status(200).send({ message: "Student data", students });
  } catch (e) {}
};
