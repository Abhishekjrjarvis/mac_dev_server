const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const { uploadDocFile, deleteFile } = require("../S3Configuration");

exports.file_to_aws = async (file) => {
  try {
    const obj = {
      documentType: "",
      documentName: "",
      documentSize: "",
      documentKey: "",
      documentEncoding: "",
    };
    obj.documentType = file.mimetype;
    obj.documentName = file.originalname;
    obj.documentEncoding = file.encoding;
    obj.documentSize = file.size;
    const results = await uploadDocFile(file);
    obj.documentKey = results.Key;
    await unlinkFile(file.path);
    return obj;
  } catch (e) {
    console.log(e);
  }
};

exports.file_to_aws_and_deleted_previous = async (file, previousKey) => {
  try {
    if (previousKey) {
      await deleteFile(previousKey);
    }
    const results = await uploadDocFile(file);
    const imageKey = results.Key;
    await unlinkFile(file.path);
    return imageKey;
  } catch (e) {
    console.log(e);
  }
};
