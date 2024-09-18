const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const subjectDataRequest = require("../../AjaxRequest/subject/subjectDataRequest");
const dynamicImages = require("../../helper/dynamicImages");
const { uploadDocsFile } = require("../../S3Configuration");
const Subject = require("../../models/Subject");
const moment = require("moment");

const subjectAssignmentReport = async (data_come, subjectId, type) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await subjectDataRequest(subjectId);
  const instituteData = result?.dt;
  const subject_data = result?.subject_data;
  const date = new Date();
  let ot_name = `${subject_data?.subject?.subjectName}-${type}`;
  let pdf_name = `${ot_name}-${date.getTime()}`;

  const stream = fs.createWriteStream(
    `./uploads/${pdf_name}-Assignment-Report.pdf`
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
    .text(
      `Department : ${subject_data?.subject?.class?.department?.dName ?? ""}`,
      {
        align: "left",
      }
    );

  doc.moveUp(1);
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(
      `Academic Year : ${subject_data?.subject?.class?.batch?.batchName ?? ""}`,
      {
        width: (pageWidth / 3) * 1.5,
        align: "right",
      }
    );

  doc.moveUp(1);
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Class : ${subject_data?.subject?.class?.classTitle ?? ""}`, {
      width: pageWidth - 40,
      align: "right",
    });

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Subject : ${subject_data?.current_subject_name ?? ""}`, {
      align: "left",
    });

  doc.moveUp(1);
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(
      `Course Code : ${
        subject_data?.subject?.subjectMasterName?.course_code ?? ""
      }`,
      {
        width: (pageWidth / 3) * 1.5,
        align: "right",
      }
    );
  doc.moveUp(1);
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(
      `Subject Teacher : ${
        subject_data?.subject?.subjectTeacherName?.staffFirstName ?? ""
      } ${subject_data?.subject?.subjectTeacherName?.staffMiddleName ?? ""} ${
        subject_data?.subject?.subjectTeacherName?.staffLastName ?? ""
      }`,
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
    .text(`${data_come?.assignmentName ?? ""}`, {
      width: pageWidth - 100,
      align: "center",
    });
  doc.moveDown(0.7);

  doc.y += 2;

  doc
    .fontSize(11)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(
      `Date : ${
        data_come?.createdAt
          ? moment(data_come?.createdAt)?.format("DD/MM/yyyy")
          : ""
      }`,
      {
        width: pageWidth - 40,
        align: "right",
      }
    );

  doc.moveDown(1);

  doc
    .fontSize(11)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`${data_come?.descritpion ?? ""}`, {
      width: pageWidth,
      align: "left",
    });

  doc.moveDown(2);

  doc
    .fontSize(11)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(
      `Submission Date : ${
        data_come?.dueDate
          ? moment(data_come?.dueDate)?.format("DD/MM/yyyy")
          : ""
      }`,
      {
        width: pageWidth / 2,
        align: "left",
      }
    );
  doc.moveUp(1);

  doc
    .fontSize(11)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`Submitted : ${data_come?.submittedCount}/${data_come?.totalCount}`, {
      width: pageWidth - 40,
      align: "right",
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
      path: `uploads/${pdf_name}-Assignment-Report.pdf`,
      filename: `${pdf_name}-Assignment-Report.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    const subject = await Subject.findById(subjectId);
    subject.export_collection.push({
      excel_type: "SUBJECT_ASSIGNMENT",
      excel_file: results?.Key,
      excel_file_name: `${pdf_name}-Assignment-Report`,
    });
    subject.export_collection_count += 1;
    await subject.save();
    await unlinkFile(file.path);
  });
  return `${pdf_name}-Assignment-Report.pdf`;
};
module.exports = subjectAssignmentReport;
