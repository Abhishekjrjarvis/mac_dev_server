const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const dynamicImages = require("../helper/dynamicImages");
const { uploadDocsFile } = require("../S3Configuration");
const util = require("util");
const staffLeaveRequestData = require("../AjaxRequest/staffLeaveRequestData");
const Admission = require("../models/Admission/Admission");
const Batch = require("../models/Batch");
const unlinkFile = util.promisify(fs.unlink);
const staffLeaveRequest = async (admissionId, batchId) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await staffLeaveRequestData(admissionId, batchId);

  const instituteData = result?.dt?.ads_admin;
  const data_args = result?.dt;
  const data_batch = result?.dt?.batch;

  let date = new Date();
  let stu_name = `${instituteData?.name}`;
  const stream = fs.createWriteStream(
    `./uploads/${stu_name}-leave-request.pdf`
  );

  let name = `${stu_name}-${date.getTime()}`;
  // const stream = fs.createWriteStream(`./uploads/${name}-leave-request.pdf`);

  doc.pipe(stream);
  const pageWidth = doc.page.width;
  let dy = doc.y - 12;
  // if (instituteData?.insProfilePhoto) {
  //   doc.image(
  //     await dynamicImages("CUSTOM", instituteData?.insProfilePhoto),
  //     doc.x - 5,
  //     dy + 1,
  //     {
  //       width: 60,
  //       height: 60,
  //       align: "center",
  //     }
  //   );
  //   doc
  //     .lineCap("square")
  //     .lineWidth(20)
  //     .circle(doc.x + 24.6, dy + 30.3, 39.2)
  //     .stroke("white");
  //   doc.lineWidth(0);
  // }
  // if (instituteData?.affliatedLogo) {
  //   doc.image(
  //     await dynamicImages("CUSTOM", instituteData?.affliatedLogo),
  //     pageWidth - 80,
  //     dy,
  //     {
  //       width: 60,
  //       height: 60,
  //       align: "right",
  //     }
  //   );
  //   doc
  //     .lineCap("square")
  //     .lineWidth(20)
  //     .circle(pageWidth - 50, dy + 30.3, 39.2)
  //     .stroke("white");
  //   doc.lineWidth(0);
  // }

  doc
    .fontSize(10)
    .text(instituteData?.insAffiliated, 20, 20, { align: "center" });
  doc.moveDown(0.3);
  let in_string = instituteData?.insName;

  let in_string_divid = Math.ceil(in_string?.length / 55);

  for (let i = 0; i < +in_string_divid; i++) {
    doc
      .fontSize(10)
      .text(in_string?.substring(55 * i, 55 + 55 * i), { align: "center" });
  }
  doc.moveDown(0.3);
  doc.fontSize(10).text(instituteData?.insAddress, { align: "center" });
  doc.moveDown(1);

  doc
    .fontSize(16)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Leave Application`, {
      align: "center",
    });

  console.log("pageWidth", pageWidth);
  let data_args_modify = [];
  // data_args?.length
  for (let i = 0; i < data_args?.length; i++) {
    let dfg = data_args[i];
    data_args_modify.push(dfg);
    // data_args_modify.push({
    //   // key_label: i + 1,
    //   // key_value: i + 2,
    // });
  }

  const table = {
    headers: [
      {
        label: "Label",
        property: "key_label",
        width: 220,
        render: null,
        align: "left",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "Value",
        property: "key_value",
        width: 335,
        render: null,
        align: "left",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
    ],

    datas: data_args_modify,
  };

  // Draw the table on the current page
  doc.table(table, {
    prepareHeader: () => doc.font("Times-Bold").fontSize(10),
    hideHeader: true,
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      if (indexColumn === 0) {
        doc.font("Times-Bold").fontSize(10);
      } else {
        doc.font("Times-Roman").fontSize(10);
      }
      // doc.addBackground(rectCell, "#a1a1a1", 0);
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

      //   }
    },
  });

  doc.strokeColor("#121212").lineWidth(1);
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();

  doc.end();

  // Handle errors
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });

  // Handle stream close event
  stream.on("finish", async () => {
    console.log("created");
    // const ads_admin = await Admission.findById({ _id: admissionId });
    // const batch = await Batch.findById({ _id: batchId });
    // let file = {
    //   path: `uploads/${name}-leave-request.pdf`,
    //   filename: `${name}-leave-request.pdf`,
    //   mimetype: "application/pdf",
    // };
    // const results = await uploadDocsFile(file);
    // ads_admin.admission_intake_set.push({
    //   excel_file: results?.Key,
    //   excel_file_name: `${name}-leave-request.pdf`,
    //   batch: batch?.batchName,
    // });
    // await unlinkFile(file.path);
    // await ads_admin.save();
  });

  //   console.log(data);
};
module.exports = staffLeaveRequest;
