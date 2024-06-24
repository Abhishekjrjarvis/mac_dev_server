const dynamicImages = require("../helper/dynamicImages");
const wrapText = require("../helper/wrapText");
const StudentAdmissionFormHeader = async (doc, x, y, pageWidth, institute) => {
  if (institute?.insProfilePhoto) {
    doc.image(
      await dynamicImages("CUSTOM", institute?.insProfilePhoto),
      x,
      y + 1,
      {
        width: 60,
        height: 60,
        align: "center",
      }
    );
    doc
      .lineCap("square")
      .lineWidth(20)
      .circle(x + 29.6, y + 30.3, 39.2)
      .stroke("white");
  }

  if (institute?.affliatedLogo) {
    doc.image(
      await dynamicImages("CUSTOM", institute?.affliatedLogo),
      pageWidth - 90,
      y,
      {
        width: 60,
        height: 60,
        align: "right",
      }
    );
    doc
      .lineCap("square")
      .lineWidth(20)
      .circle(pageWidth - 60, y + 30.3, 39.2)
      .stroke("white");
  }

  doc.fontSize(10).text(institute?.insAffiliated, 25, 25, { align: "center" });
  doc.moveDown(0.3);
  // doc.fontSize(16).text(institute?.insName, { align: "center" });
  let in_string = institute?.insName;

  let in_string_divid = Math.ceil(in_string?.length / 55);

  for (let i = 0; i < +in_string_divid; i++) {
    doc
      .fontSize(16)
      .text(in_string?.substring(55 * i, 55 + 55 * i), { align: "center" });
  }

  doc.moveDown(0.3);
  doc.fontSize(10).text(institute?.insAddress, { align: "center" });
  doc.moveDown(0.3);
  wrapText(
    doc,
    `Email Id : ${institute?.insEmail}, Mob.No. : ${institute?.insPhoneNumber}`,
    x,
    doc.y,
    doc.page.width - 160,
    "center"
  );
};
module.exports = StudentAdmissionFormHeader;

