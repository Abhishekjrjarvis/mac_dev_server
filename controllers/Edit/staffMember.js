const InstituteAdmin = require("../../models/InstituteAdmin");
const Staff = require("../../models/Staff");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const { deleteFile, uploadFile } = require("../../S3Configuration");

exports.photoEditByStaff = async (req, res) => {
  try {
    if (!req.params.sid || !req.file)
      throw "Please send staff id to perform task or upload photo";
    const staff = await Staff.findById(req.params.sid);
    await deleteFile(staff.staffProfilePhoto);
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
    const staffs = await Staff.findByIdAndUpdate(req.params.sid, req.body);
    res.status(200).send({
      message: "staff form edited successfully👍",
    });
    const institute = await InstituteAdmin.findById({ _id: staffs?.institute });
    if (staffs.staffGender === "Male") {
      institute.staff_category.boyCount += 1;
    } else if (staffs.staffGender === "Female") {
      institute.staff_category.girlCount += 1;
    } else {
      institute.staff_category.otherCount += 1;
    }
    if (staffs.staffCastCategory === "General") {
      institute.staff_category.generalCount += 1;
    } else if (staffs.staffCastCategory === "OBC") {
      institute.staff_category.obcCount += 1;
    } else if (staffs.staffCastCategory === "SC") {
      institute.staff_category.scCount += 1;
    } else if (staffs.staffCastCategory === "ST") {
      institute.staff_category.stCount += 1;
    } else if (staffs.staffCastCategory === "NT-A") {
      institute.staff_category.ntaCount += 1;
    } else if (staffs.staffCastCategory === "NT-B") {
      institute.staff_category.ntbCount += 1;
    } else if (staffs.staffCastCategory === "NT-C") {
      institute.staff_category.ntcCount += 1;
    } else if (staffs.staffCastCategory === "NT-D") {
      institute.staff_category.ntdCount += 1;
    } else if (staffs.staffCastCategory === "VJ") {
      institute.staff_category.vjCount += 1;
    } else {
    }
    await Promise.all([institute.save()]);
  } catch (e) {
    console.log(e);
  }
};
