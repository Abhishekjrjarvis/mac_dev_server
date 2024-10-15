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
const Leave = require("../../models/Leave");
const staffLeaveRequestReport = async (leaveId, instituteId) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await staffLeaveRequestReportData(leaveId);
  let instituteData = await instituteReportData(instituteId);
  instituteData = instituteData?.dt;
  const data_args = result?.dt;
  const data_rep_args = result?.rep_data;

  let date = new Date();
  let stu_name = `${data_args?.staff?.staffFirstName ?? ""} ${
    data_args?.staff?.staffMiddleName ?? ""
  } ${data_args?.staff?.staffLastName ?? ""}`;
  // const stream = fs.createWriteStream(
  //   `./uploads/${stu_name}-leave-request.pdf`
  // );

  let name = `${stu_name}-${date.getTime()}`;
  const stream = fs.createWriteStream(`./uploads/${name}-leave-request.pdf`);

  doc.pipe(stream);
  const pageWidth = doc.page.width;
  let dy = doc.y - 12;

  await instituteReportHeader(instituteData, doc, pageWidth, true);

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
    .text(`${data_args?.leave_type ?? ""}`, {
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
  if (data_args?.staff?._id) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(
        `${data_args?.staff?.staffFirstName ?? ""} ${
          data_args?.staff?.staffMiddleName ?? ""
        } ${data_args?.staff?.staffLastName ?? ""}`,
        {
          indent: doc.widthOfString(`1. Name :`) + 4,
          align: "left",
        }
      );
  }

  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`2. Designation :`);
  if (data_args?.staff?.current_designation) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${data_args?.staff?.current_designation ?? ""}`, {
        indent: doc.widthOfString(`2. Designation :`) + 4,
      });
  }

  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`Department :`, {
      width:
        pageWidth -
        doc.widthOfString(
          `${data_args?.staff?.staff_department?.dName ?? ""}`
        ) -
        43,
      align: "right",
    });
  if (data_args?.staff?.staff_department?.dName ?? "") {
    doc.moveUp(1);

    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${data_args?.staff?.staff_department?.dName ?? ""}`, {
        width: pageWidth - 40,
        align: "right",
      });
  }

  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`3. Period of Leave Required :`);
  if (data_args?.total_days) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${data_args?.total_days ?? ""} Days`, {
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
  if (data_args?.from) {
    doc.moveUp(1);

    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${moment(data_args?.from)?.format("DD/MM/yyyy")}`, {
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
  if (data_args?.to) {
    doc.moveUp(1);

    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${moment(data_args?.to)?.format("DD/MM/yyyy")}`, {
        width: pageWidth - 40,
        align: "right",
      });
  }

  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`4. Reason of Leave :`);
  if (data_args?.reason) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${data_args?.reason ?? ""}`, {
        indent: doc.widthOfString(`4. Reason of Leave :`) + 4,
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

  if (data_args?.staff?.inward_outward_signature) {
    let p_sig = await dynamicImages(
      "CUSTOM",
      data_args?.staff?.inward_outward_signature
    );
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
  doc.x = 20;
  if (data_args?.is_replacement === "Yes") {
    doc.moveDown(2);

    doc.fontSize(10).font("Times-Roman").fillColor("#121212").text("");
    if (data_args?.staff_replace_type === "Single") {
      const table = {
        headers: [
          {
            label: "Date",
            property: "date",
            width: 60,
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2],
          },
          {
            label: "Class",
            property: "cls",
            width: 140,
            render: null,
            align: "left",
            valign: "center",
            padding: [2, 2],
          },
          {
            label: "Subject",
            property: "subject",
            width: 160,
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2],
          },
          {
            label: "Time",
            property: "time",
            width: 90,
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2],
          },
          {
            label: "Staff Name",
            property: "staff",
            width: 106,
            render: null,
            align: "center",
            valign: "center",
            padding: [2, 2],
          },
        ],

        datas: data_rep_args,
      };
      // Draw the table on the current page
      doc.table(table, {
        prepareHeader: () => doc.font("Times-Bold").fontSize(10),
        // hideHeader: false,
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          // console.log("indexRow", indexRow);
          // if (indexRow === 0 || indexRow === data_args_modify?.length - 1) {
          //   doc.font("Times-Bold").fontSize(10);
          // } else {
          doc.font("Times-Roman").fontSize(10);
          // }
          // doc.addBackground(rectCell, "#a1a1a1", 0);
          doc
            .rect(
              rectCell?.x ?? 0,
              rectCell?.y ?? 0,
              rectCell?.width ?? 0,
              rectCell?.height ?? 0
            )
            .fillOpacity(0)
            .fillAndStroke("red", "black")
            .fillColor("black", 1);

          //   }
        },
      });
    } else {
      doc
        .fontSize(10)
        .font("Times-Roman")
        .fillColor("#121212")
        .text(`Replaced Staff : ${data_rep_args ?? ""}`);
    }
  }

  doc.end();

  // Handle errors
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });

  // Handle stream close event
  stream.on("finish", async () => {
    // console.log("created");
    let file = {
      path: `uploads/${name}-leave-request.pdf`,
      filename: `${name}-leave-request.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    const out_cr = await Leave.findById(leaveId);
    out_cr.generated_report = results?.Key;
    await out_cr.save();
    await unlinkFile(file.path);
  });

  //   console.log(data);
};
module.exports = staffLeaveRequestReport;
