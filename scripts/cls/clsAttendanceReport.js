const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const dynamicImages = require("../../helper/dynamicImages");
const clsDataRequest = require("../../AjaxRequest/cls/clsDataRequest");
const Class = require("../../models/Class");
const { uploadDocsFile } = require("../../S3Configuration");

const clsAttendanceReport = async (
  datalist,
  clsId,
  from,
  to,
  excel_type = "",
  type = ""
) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A2",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await clsDataRequest(clsId);
  const instituteData = result?.dt;
  const cls_data = result?.cls;

  let date = new Date();

  let ot_name = type
    ? `${cls_data?.classTitle}-${type}`
    : `${cls_data?.classTitle}-Monthly`;
  let pdf_name = `${ot_name}-${date.getTime()}`;

  const stream = fs.createWriteStream(
    `./uploads/${pdf_name}-Attendance-Report.pdf`
  );
  doc.pipe(stream);
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  let dy = doc.y - 12;

  if (instituteData?.insProfilePhoto) {
    doc.image(
      await dynamicImages("CUSTOM", instituteData?.insProfilePhoto),
      doc.x - 5,
      dy + 1,
      {
        width: 60,
        height: 60,
        align: "center",
      }
    );
    doc
      .lineCap("square")
      .lineWidth(20)
      .circle(doc.x + 24.6, dy + 30.3, 39.2)
      .stroke("white");
  }
  if (instituteData?.affliatedLogo) {
    doc.image(
      await dynamicImages("CUSTOM", instituteData?.affliatedLogo),
      pageWidth - 80,
      dy,
      {
        width: 60,
        height: 60,
        align: "right",
      }
    );
    doc
      .lineCap("square")
      .lineWidth(20)
      .circle(pageWidth - 50, dy + 30.3, 39.2)
      .stroke("white");
  }
  doc
    .fontSize(10)
    .text(instituteData?.insAffiliated, 20, 20, { align: "center" });
  doc.moveDown(0.3);
  let in_string = instituteData?.insName;

  let in_string_divid = Math.ceil(in_string?.length / 55);

  for (let i = 0; i < +in_string_divid; i++) {
    doc
      .fontSize(16)
      .text(in_string?.substring(55 * i, 55 + 55 * i), { align: "center" });
  }
  doc.moveDown(0.3);
  doc.fontSize(10).text(instituteData?.insAddress, { align: "center" });
  doc.moveDown(1);

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Department : ${cls_data?.department?.dName ?? ""}`, {
      align: "left",
    });

  doc.moveUp(1);
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Academic Year : ${cls_data?.batch?.batchName ?? ""}`, {
      width: pageWidth - 40,
      align: "right",
    });
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Class : ${cls_data?.classTitle ?? ""}`, {
      align: "left",
    });

  doc.moveUp(1);
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(
      `Class Co-ordinator : ${cls_data?.classTeacher?.staffFirstName ?? ""} ${
        cls_data?.classTeacher?.staffMiddleName ?? ""
      } ${cls_data?.classTeacher?.staffLastName ?? ""}`,
      {
        width: pageWidth - 40,
        align: "right",
      }
    );
  doc.strokeColor("#121212").lineWidth(1);
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();

  doc.moveDown(1);
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`From : ${from} To: ${to}`, {
      align: "left",
    });

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`${cls_data?.classTitle ?? ""} Attendance Report`, {
      width: pageWidth - 100,
      align: "center",
    });

  doc.y += 2;

  doc.moveDown(0.3);

  let header = [
    {
      label: "Roll No.",
      property: "RollNo",
      render: null,
      align: "center",
      valign: "center",
      padding: [0, 5, 0, 0],
    },
    {
      label: "Name",
      property: "Name",
      render: null,
      align: "left",
      valign: "center",
      padding: [2, 2, 2, 2],
    },
  ];
  if (datalist?.length > 0) {
    let dt = datalist[0];
    for (let obj in dt) {
      if (
        ["GRNO", "Enrollment / PRN", "Gender", "RollNo", "Name"]?.includes(obj)
      ) {
      } else {
        header.push({
          label: `${obj}`,
          property: `${obj}`,
          render: null,
          align: "center",
          valign: "center",
          padding: [0, 5, 0, 0],
        });
      }
    }
  }
  const table = {
    headers: header,
    datas: datalist,
  };

  // Draw the table on the current page
  doc.table(table, {
    prepareHeader: () => doc.font("Times-Bold").fontSize(10),
    hideHeader: false,
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      if (indexColumn === 0) {
        doc.font("Times-Bold").fontSize(10);
      } else {
        doc.font("Times-Roman").fontSize(10);
      }
      doc
        .rect(
          rectCell?.x ?? 0,
          rectCell?.y ?? 0,
          rectCell?.width ?? 0,
          rectCell?.height ?? 0
        )
        .fillOpacity(0)
        .fillAndStroke("red", "gray")
        .fillColor("black", 1);
    },
  });

  doc.end();

  // Handle errors
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });

  // Handle stream close event
  stream.on("finish", async () => {
    console.log("created");
    let file = {
      path: `uploads/${pdf_name}-Attendance-Report.pdf`,
      filename: `${pdf_name}-Attendance-Report.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    const cls = await Class.findById(clsId);
    cls.export_collection.push({
      excel_type: excel_type,
      excel_file: results?.Key,
      excel_file_name: `${pdf_name}-Attendance-Report`,
    });
    cls.export_collection_count += 1;
    await cls.save();
    await unlinkFile(file.path);
  });
  return `${pdf_name}-Attendance-Report.pdf`;
};
module.exports = clsAttendanceReport;
