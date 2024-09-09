const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const dynamicImages = require("../../helper/dynamicImages");
const Class = require("../../models/Class");
const { uploadDocsFile } = require("../../S3Configuration");
const clsTheoryPracticalDataRequest = require("../../AjaxRequest/cls/clsTheoryPracticalDataRequest");

const clsAttendanceTheoryPracticalReport = async (
  theory_subject,
  pt_subject,
  datalist,
  clsId,
  from,
  to,
  excel_type = "",
  type = "",
  criteria
) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A2",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await clsTheoryPracticalDataRequest(clsId);
  const instituteData = result?.dt;
  const cls_data = result?.cls;

  let date = new Date();

  let ot_name = type
    ? `${cls_data?.classTitle}-${type}-Theory-Practical`
    : `${cls_data?.classTitle}-Theory-Practical`;
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
      `Academic Co-ordinator : ${
        cls_data?.classTeacher?.staffFirstName ?? ""
      } ${cls_data?.classTeacher?.staffMiddleName ?? ""} ${
        cls_data?.classTeacher?.staffLastName ?? ""
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
    .text(`Attendance Report`, {
      width: pageWidth - 100,
      align: "center",
    });

  doc.y += 2;

  doc.moveDown(0.3);

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Theory Courses`, {
      width: pageWidth - 100,
      align: "center",
    });

  doc.y += 2;

  doc.moveDown(0.5);

  if (theory_subject?.length > 0) {
    let header = [
      {
        label: "Sr. No.",
        property: "sr_number",
        render: null,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 0],
      },
      {
        label: "Name of the Course",
        property: "subjectName",
        render: null,
        align: "left",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Initials of Faculty",
        property: "faculty_inintals",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "No. of Sessions held",
        property: "session_held",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Average Attendance in %",
        property: "avg_attendance",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Remark of AC/HOD/HOI",
        property: "remark_of_ac_hod",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Remark of Verifying authority/HOI",
        property: "remark_verify_authority",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
    ];
    const table = {
      headers: header,
      datas: theory_subject,
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
  }

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Practical / Tutorials`, {
      width: pageWidth - 100,
      align: "center",
    });

  doc.y += 2;

  doc.moveDown(0.5);
  if (pt_subject?.length > 0) {
    let header = [
      {
        label: "Sr. No.",
        property: "sr_number",
        render: null,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 0],
      },
      {
        label: "Name of the Course",
        property: "subjectName",
        render: null,
        align: "left",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Initials of Faculty",
        property: "faculty_inintals",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "No. of Sessions held",
        property: "session_held",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Average Attendance in %",
        property: "avg_attendance",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Remark of AC/HOD/HOI",
        property: "remark_of_ac_hod",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Remark of Verifying authority/HOI",
        property: "remark_verify_authority",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
    ];
    const table = {
      headers: header,
      datas: pt_subject,
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
  }

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Poor Attendance (Less than ${criteria})`, {
      width: pageWidth - 100,
      align: "center",
    });

  doc.y += 2;

  doc.moveDown(0.5);

  if (datalist?.length > 0) {
    let header = [
      {
        label: "Sr.",
        property: "sr_number",
        render: null,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 0],
      },
      {
        label: "Name of the Student",
        property: "name",
        render: null,
        align: "left",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Roll No.",
        property: "studentROLLNO",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Theory Attendance in %",
        property: "theory_avg",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Practical Attendance in %",
        property: "practical_tutorial_avg",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Remark of the CC",
        property: "remark_cc",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Remark of the AC/HOD",
        property: "remark_ac_hod",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
      {
        label: "Remark of HOD/HOI",
        property: "remark_hod",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      },
    ];
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
  }

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
module.exports = clsAttendanceTheoryPracticalReport;
