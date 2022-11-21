// const InstituteAdmin = require("../../models/InstituteAdmin");
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
    await Staff.findByIdAndUpdate(req.params.sid, req.body);
    res.status(200).send({
      message: "staff form edited successfully👍",
    });
  } catch (e) {
    console.log(e);
  }
};
