const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const dynamicImages = require("../../helper/dynamicImages");
const { uploadDocsFile } = require("../../S3Configuration");
const util = require("util");
const staffLeaveRequestReportData = require("../../AjaxRequest/leave/staffLeaveRequestReportData");
const instituteReportHeader = require("../subject/instituteReportHeader");
const instituteReportData = require("../../AjaxRequest/instituteReportData");
const unlinkFile = util.promisify(fs.unlink);
const moment = require("moment");
const staffLeaveRequestReport = async (leaveId, instituteId) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await staffLeaveRequestReportData(leaveId, instituteId);
  let instituteData = await instituteReportData("651ba22de39dbdf817dd520c");
  instituteData = instituteData?.dt;
  const data_args = result?.dt;

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

  // await instituteReportHeader(instituteData, doc, pageWidth, true);

  doc.moveDown(1);

  doc
    .fontSize(16)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`APPLICATION FOR LEAVE`, {
      align: "center",
    });
  doc
    .fontSize(14)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`Casula Leave`, {
      align: "center",
    });
  doc.strokeColor("#121212").lineWidth(1);
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();
  doc.moveDown(1);

  doc.fontSize(10).font("Times-Roman").fillColor("#121212").text(`No. :`);
  if (data_args?.leave_number) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${data_args?.leave_number ?? ""}`, {
        indent: doc.widthOfString(`No. :`) + 4,
      });
  }

  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`Date :`, {
      width: pageWidth - 90,
      align: "right",
    });
  if (data_args?.createdAt) {
    doc.moveUp(1);

    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${moment(data_args?.createdAt)?.format("DD/MM/yyyy")}`, {
        width: pageWidth - 40,
        align: "right",
      });
  }
  doc.moveDown(0.4);

  doc.fontSize(10).font("Times-Roman").fillColor("#121212").text(`1. Name :`);
  if (data_args?.subject) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${data_args?.subject ?? ""}`, {
        indent: doc.widthOfString(`Subject :`) + 4,
        align: "left",
      });
  }

  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`2. Designation :`);
  if (data_args?.leave_number) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${data_args?.leave_number ?? ""}`, {
        indent: doc.widthOfString(`2. Designation :`) + 4,
      });
  }

  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`Department :`, {
      width: pageWidth - doc.widthOfString(`${data_args?.createdAt}`) - 43,
      align: "right",
    });
  if (data_args?.createdAt) {
    doc.moveUp(1);

    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${moment(data_args?.createdAt)?.format("DD/MM/yyyy")}`, {
        width: pageWidth - 40,
        align: "right",
      });
  }

  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`3. Period of Leave Required :`);
  if (data_args?.leave_number) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${data_args?.leave_number ?? ""} Days`, {
        indent: doc.widthOfString(`3. Period of Leave Required :`) + 4,
      });
  }

  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`From :`, {
      width: (pageWidth / 3) * 2 + 80,
      align: "center",
    });
  if (data_args?.createdAt) {
    doc.moveUp(1);

    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${moment(data_args?.createdAt)?.format("DD/MM/yyyy")}`, {
        width: (pageWidth / 3) * 2 + 160,
        align: "center",
      });
  }
  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`To :`, {
      width: pageWidth - 90,
      align: "right",
    });
  if (data_args?.createdAt) {
    doc.moveUp(1);

    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${moment(data_args?.createdAt)?.format("DD/MM/yyyy")}`, {
        width: pageWidth - 40,
        align: "right",
      });
  }

  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`4. Reason of Leave :`);
  if (data_args?.subject) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${data_args?.subject ?? ""}`, {
        indent: doc.widthOfString(`Subject :`) + 4,
        align: "left",
      });
  }

  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`5. If on Duty Leave, Details :`);
  if (data_args?.subject) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${data_args?.subject ?? ""}`, {
        indent: doc.widthOfString(`Subject :`) + 4,
        align: "left",
      });
  }

  if (data_args?.student_signature) {
    let p_sig = await dynamicImages("CUSTOM", data_args?.student_signature);
    if (p_sig) {
      doc.image(p_sig, pageWidth - 185, doc.y, {
        width: 160,
        height: 60,
        align: "right",
      });
      doc.moveDown(1);
    }
    doc.font("Times-Bold").text("Applicant's Signature", 440, doc.y);
  }

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
module.exports = staffLeaveRequestReport;
