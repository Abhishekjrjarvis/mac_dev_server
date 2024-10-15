const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const { uploadDocsFile } = require("../../S3Configuration");
const instituteReportData = require("../../AjaxRequest/instituteReportData");
const dynamicImages = require("../../helper/dynamicImages");
const instituteReportHeader = require("../subject/instituteReportHeader");
const inwardOutwardDataRequest = require("../../AjaxRequest/inwardOutward/inwardOutwardDataRequest");
const moment = require("moment");
const OutwardCreate = require("../../models/InwardOutward/OutwardCreate");
const outwardCreateReport = async (outwardId, instituteId) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const ins_data = await instituteReportData(instituteId);
  const instituteData = ins_data?.dt;
  const outwardData = await inwardOutwardDataRequest(outwardId, "OT");
  const outward_data = outwardData?.dt;

  //   console.log("->", outwardData?.dt?.approvals_for?.[0]?.staff);
  const date = new Date();
  let ot_name = `Outward`;
  let pdf_name = `${instituteData?.name}-${ot_name}-${date.getTime()}`;
  // let pdf_name = `${ot_name}`;

  const stream = fs.createWriteStream(`./uploads/${pdf_name}-Report.pdf`);
  doc.pipe(stream);
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  // let dy = doc.y - 12;

  await instituteReportHeader(instituteData, doc, pageWidth);
  doc.moveDown(1.2);

  doc.strokeColor("#121212").lineWidth(1);
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();
  doc.moveDown(1);

  doc.fontSize(10).font("Times-Roman").fillColor("#121212").text(`No. :`);
  if (outward_data?.outward_number) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${outward_data?.outward_number ?? ""}`, {
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
  if (outward_data?.created_at) {
    doc.moveUp(1);

    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${moment(outward_data?.created_at)?.format("DD/MM/yyyy")}`, {
        width: pageWidth - 40,
        align: "right",
      });
  }
  doc.moveDown(0.4);

  doc.fontSize(10).font("Times-Roman").fillColor("#121212").text(`Subject :`);
  if (outward_data?.subject) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(`${outward_data?.subject ?? ""}`, {
        indent: doc.widthOfString(`Subject :`) + 4,
        align: "left",
      });
  }

  doc.moveDown(1);

  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#2e2e2e")
    .text(`${outward_data?.body ?? ""}`, {
      align: "left",
    });

  doc.moveDown(1);

  if (outward_data?.image?.length > 0) {
    for (let dft of outward_data?.image) {
      if (doc.y > 245) {
        doc.addPage();
      } else {
        //   doc.addPage();
      }
      if (dft) {
        let dfgt = await dynamicImages("CUSTOM", dft);
        if (dfgt) {
          doc.image(dfgt, {
            width: 550.28,
            height: 550.28,
          });
        }
      }
    }
    doc.moveDown(2);
  }

  if (outward_data?.approvals_for?.length > 0) {
    let yAxix = doc.y;
    for (let i = 0; i < outward_data?.approvals_for?.length; i++) {
      let dft = outward_data?.approvals_for[i];
      //   if (dft?.status === "Approved") {
      if (dft?.staff) {
        let dfgt = await dynamicImages(
          "CUSTOM",
          dft?.staff?.inward_outward_signature
        );
        if (dfgt) {
          doc.image(dfgt, pageWidth - 165 - i * 165, yAxix, {
            width: 140,
            height: 50,
            align: "right",
          });
        }
        doc
          .font("Times-Roman")
          .text(
            `${dft?.staff?.staffFirstName ?? ""} ${
              dft?.staff?.staffMiddleName ?? ""
            } ${dft?.staff?.staffLastName ?? ""}`,
            approval_position[i],
            yAxix + 55,
            {
              align: "center",
            }
          );
        doc
          .font("Times-Roman")
          .text(`${dft?.designation ?? ""}`, approval_position[i], yAxix + 65, {
            align: "center",
          });
      }
      //   }
    }
  }
  doc.moveDown(1);

  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`Prepare By :`, 20, doc.y, {
      align: "left",
    });
  if (outward_data?.prepare_by?.staffFirstName) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(
        `${outward_data?.prepare_by?.staffFirstName ?? ""} ${
          outward_data?.prepare_by?.staffMiddleName ?? ""
        } ${outward_data?.prepare_by?.staffLastName ?? ""}`,
        74,
        doc.y,
        {
          align: "left",
        }
      );
  }

  doc.moveDown(1);

  doc.end();

  // Handle errors
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });

  // Handle stream close event
  stream.on("finish", async () => {
    // console.log("created");
    let file = {
      path: `uploads/${pdf_name}-Report.pdf`,
      filename: `${pdf_name}-Report.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    const out_cr = await OutwardCreate.findById(outwardId);
    out_cr.generated_report = results?.Key;
    await out_cr.save();
    await unlinkFile(file.path);
  });
  //   return `${pdf_name}-Report.pdf`;
};
module.exports = outwardCreateReport;

let approval_position = {
  0: 440,
  1: 100,
  2: -230,
};
