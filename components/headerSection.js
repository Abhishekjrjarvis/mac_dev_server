const dynamicImages = require("../helper/dynamicImages");

const headerSection = async (
    doc,
    x,
    y,
    instituteLogo,
    universityLogo,
    boardName,
    universityName,
    address,
    mobNo,
    email
) => {
  if (instituteLogo) {
    doc.image(await dynamicImages("CUSTOM", instituteLogo), x, y, {
      width: 65,
      height: 65,
      align: "left",
    });
  }
  if (universityLogo) {
    doc.image(await dynamicImages("CUSTOM", universityLogo), doc.page.width - 90, y, {
      width: 65,
      height: 65,
      align: "left",
    });
  }
  
    doc.fontSize(10).text(boardName, 25, 25, { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(16).text(universityName, { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).text(address, { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).text(`Mob No : ${mobNo} , email : ${email}`, {
      align: "center",
    });
  };
  module.exports = headerSection;