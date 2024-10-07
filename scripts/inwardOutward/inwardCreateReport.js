const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const subjectDataRequest = require("../../AjaxRequest/subject/subjectDataRequest");
const { uploadDocsFile } = require("../../S3Configuration");
const Subject = require("../../models/Subject");
const instituteReportHeader = require("./instituteReportHeader");
const instituteReportData = require("../../AjaxRequest/instituteReportData");

const inwardCreateReport = async (
  outwardData,
  outwardId,
  instituteId,
  type
) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await subjectDataRequest(subjectId);
  const ins_data = await instituteReportData(instituteId);
  const instituteData = ins_data?.dt;
  const subject_data = result?.subject_data;

  const date = new Date();
  let ot_name = `${subject_data?.subject?.subjectName}-${type}`;
  // let pdf_name = `${ot_name}-${date.getTime()}`;
  let pdf_name = `${ot_name}`;

  const stream = fs.createWriteStream(`./uploads/${pdf_name}-Report.pdf`);
  doc.pipe(stream);
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  // let dy = doc.y - 12;

  await instituteReportHeader(instituteData, doc, pageWidth);
  doc.moveDown(1.2);

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`TEACHING PLAN`, {
      width: pageWidth,
      align: "center",
    });
  doc.moveDown(1);
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
    .text(
      `Programme : ${subject_data?.subject?.class?.department?.dName ?? ""}`,
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
    .text(
      `Class & Div : ${subject_data?.subject?.class?.className ?? ""} ${
        subject_data?.subject?.class?.classTitle ?? ""
      }`,
      {
        width: pageWidth - 40,
        align: "right",
      }
    );

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(
      `Course & Code : ${subject_data?.current_subject_name ?? ""} - ${
        subject_data?.subject?.subjectMasterName?.course_code ?? ""
      }`,
      {
        align: "left",
      }
    );

  doc.moveUp(1);

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Course Type : ${subject_data?.subject?.subject_category ?? ""}`, {
      width: pageWidth - 40,
      align: "right",
    });

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Credits : ${subject_data?.subject?.course_credit ?? ""}`, {
      align: "left",
    });

  doc.moveUp(1);
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(
      `Allotted Lectures : ${subject_data?.subject?.allotted_lecture ?? ""}`,
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
    .text(`Hrs/Week : ${subject_data?.subject?.hours_per_weak ?? ""}`, {
      width: pageWidth - 40,
      align: "right",
    });

  doc.moveDown(1);

  if (subject_data?.subject?.course_objective) {
    doc
      .fontSize(11)
      .font("Times-Bold")
      .fillColor("#121212")
      .text(`Course Objectives:`, {
        width: pageWidth,
        align: "left",
      });
    doc.moveDown(0.4);
    doc
      .fontSize(11)
      .font("Times-Roman")
      .fillColor("#121212")
      .text(`${subject_data?.subject?.course_objective ?? ""}`, {
        width: pageWidth,
        align: "left",
      });
    doc.moveDown(1);
  }

  if (subject_data?.subject?.course_outcome) {
    doc
      .fontSize(11)
      .font("Times-Bold")
      .fillColor("#121212")
      .text(`Course Outcomes:`, {
        width: pageWidth,
        align: "left",
      });
    doc.moveDown(0.4);
    doc
      .fontSize(11)
      .font("Times-Roman")
      .fillColor("#121212")
      .text(`${subject_data?.subject?.course_outcome ?? ""}`, {
        width: pageWidth,
        align: "left",
      });
    doc.moveDown(1);
  }

  if (co_po_map?.length > 0) {
    doc
      .fontSize(11)
      .font("Times-Bold")
      .fillColor("#121212")
      .text(`Programme Outcomes (Pos) addressed in this course`, {
        width: pageWidth,
        align: "left",
      });
    doc.moveDown(0.4);
    let header = [];

    for (let mt in co_po_map[0]) {
      header.push({
        label: co_po_map[0][mt],
        property: mt,
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
      });
    }

    const table = {
      headers: header,
      datas: co_po_map,
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

  doc.fontSize(11).font("Times-Bold").fillColor("#121212").text(`Syllabus:`, {
    width: pageWidth,
    align: "left",
  });
  doc.moveDown(0.9);

  doc.y += 2;
  // console.log(pageHeight, doc.y);
  if (teaching_list?.length > 0) {
    let header = [
      {
        label: "Lecture No.",
        property: "cos",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
        width: 50,
      },
      {
        label: "Contents",
        property: "name",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
        width: 285,
      },

      {
        label: "Schedule Date",
        property: "schedule_date",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
        width: 55,
      },
      {
        label: "Execution Date",
        property: "execution_date",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
        width: 55,
      },
      {
        label: "CO Mapping",
        property: "co",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
        width: 55,
      },
      {
        label: "Teaching Method",
        property: "tech_method",
        render: null,
        align: "center",
        valign: "center",
        padding: [2, 2, 2, 2],
        width: 55,
      },
    ];
    const table = {
      headers: header,
      datas: [
        // {
        //   name: "",
        //   schedule_date: "",
        //   execution_date: "",
        //   co: "",
        // },
      ],
    };
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

    for (let i = 0; i < teaching_list?.length; i++) {
      let tech = teaching_list[i];
      if (i === 0) {
        doc
          .fontSize(11)
          .font("Times-Bold")
          .fillColor("#121212")
          .text(`${tech?.name}`, {
            width: pageWidth,
            align: "center",
          });
        doc.moveDown(0.5);
        let header = [
          {
            label: "Lecture No.",
            property: "lecture_no",
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 50,
          },
          {
            label: "Contents",
            property: "name",
            render: null,
            align: "left",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 285,
          },
          {
            label: "Schedule Date",
            property: "schedule_date",
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 55,
          },
          {
            label: "Execution Date",
            property: "execution_date",
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 55,
          },
          {
            label: "CO Mapping",
            property: "co",
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 55,
          },
          {
            label: "Teaching Method",
            property: "tech_method",
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 55,
          },
        ];
        const table = {
          headers: header,
          datas: tech?.topics,
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
          // addPage: true,
        });
      } else {
        let dbt = pageHeight - 60;
        if (doc.y >= dbt) {
          doc.addPage();
        }
        doc
          .fontSize(11)
          .font("Times-Bold")
          .fillColor("#121212")
          .text(`${tech?.name}`, {
            width: pageWidth,
            align: "center",
          });
        doc.moveDown(0.5);

        let header = [
          {
            label: "Lecture No.",
            property: "lecture_no",
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 50,
          },
          {
            label: "Contents",
            property: "name",
            render: null,
            align: "left",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 285,
          },

          {
            label: "Schedule Date",
            property: "schedule_date",
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 55,
          },
          {
            label: "Execution Date",
            property: "execution_date",
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 55,
          },
          {
            label: "CO Mapping",
            property: "co",
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 55,
          },
          {
            label: "Teaching Method",
            property: "tech_method",
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2, 2, 2],
            width: 50,
          },
        ];
        const table = {
          headers: header,
          datas: tech?.topics,
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
          // addPage: true,
        });
      }
    }
  }

  doc.moveDown(1);
  doc.y += 2;

  if (subject_data?.subject?.web_reference) {
    let dbt = pageHeight - 60;
    if (doc.y >= dbt) {
      doc.addPage();
    }
    doc
      .fontSize(11)
      .font("Times-Bold")
      .fillColor("#121212")
      .text(`Web Source References:`, {
        width: pageWidth,
        align: "left",
      });
    doc.moveDown(0.4);
    doc
      .fontSize(11)
      .font("Times-Roman")
      .fillColor("#121212")
      .text(`${subject_data?.subject?.web_reference ?? ""}`, {
        width: pageWidth,
        align: "left",
      });
    doc.moveDown(1);
  }
  doc.moveDown(1);

  if (subject_data?.subject?.book_reference) {
    let dbt = pageHeight - 60;
    if (doc.y >= dbt) {
      doc.addPage();
    }
    doc
      .fontSize(11)
      .font("Times-Bold")
      .fillColor("#121212")
      .text(`Books References:`, {
        width: pageWidth,
        align: "left",
      });
    doc.moveDown(0.4);
    doc
      .fontSize(11)
      .font("Times-Roman")
      .fillColor("#121212")
      .text(`${subject_data?.subject?.book_reference ?? ""}`, {
        width: pageWidth,
        align: "left",
      });
    doc.moveDown(1);
  }

  doc.moveDown(1);

  doc.end();

  // Handle errors
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });

  // Handle stream close event
  stream.on("finish", async () => {
    console.log("created");
    let file = {
      path: `uploads/${pdf_name}-Report.pdf`,
      filename: `${pdf_name}-Report.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    const subject = await Subject.findById(subjectId);
    subject.export_collection.push({
      excel_type: "SUBJECT_TEACHING_PLAN",
      excel_file: results?.Key,
      excel_file_name: `${pdf_name}-Report`,
    });
    subject.export_collection_count += 1;
    await subject.save();
    await unlinkFile(file.path);
  });
  return `${pdf_name}-Report.pdf`;
};
module.exports = inwardCreateReport;
