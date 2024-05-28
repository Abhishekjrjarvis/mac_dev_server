const dynamicImages = require("../helper/dynamicImages");

const headerSection = async (doc, x, y, institute) => {
  if (institute?.instituteImage) {
    doc.image(await dynamicImages("DEV", institute?.instituteImage), x, y, {
      width: 65,
      height: 65,
      align: "left",
    });
  }
  if (institute?.affiliatedImage) {
    doc.image(
      await dynamicImages("DEV", institute?.affiliatedImage),
      doc.page.width - 90,
      y,
      {
        width: 65,
        height: 65,
        align: "left",
      }
    );
  }

  doc.fontSize(10).text(institute?.insAffiliated, 25, 25, { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(16).text(institute?.insName, { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).text(institute?.insAddress, { align: "center" });
  doc.moveDown(0.3);
  doc
    .fontSize(10)
    .text(
      `Mob No : ${institute?.insPhoneNumber} , email : ${institute?.insEmail}`,
      {
        align: "center",
      }
    );
};
module.exports = headerSection;

