const QRCode = require("qrcode");
const { uploadDocsFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
exports.generate_qr = async (data) => {
  try {
    let date = new Date();
    let name = `${date.getTime()}-${data?.fileName}`;
    let in_string = JSON.stringify(data?.object_contain);
    QRCode.toFile(`uploads/${name}.png`, in_string, function (err) {
      if (err) return console.log("error occurred");
    });
    let file = {
      path: `uploads/${name}.png`,
      filename: `${name}.png`,
      mimetype: "png",
    };
    const results = await uploadDocsFile(file);
    const qrKey = results.Key;
    await unlinkFile(file.path);

    return qrKey;
  } catch (e) {
    console.log("this is from qr generation error occured.");
  }
};
