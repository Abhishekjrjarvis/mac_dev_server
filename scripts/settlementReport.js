const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const { uploadDocsFile } = require("../S3Configuration");
const util = require("util");
const settlementReportData = require("../AjaxRequest/settlementReportData");
const BankAccount = require("../models/Finance/BankAccount");
const Finance = require("../models/Finance");
const instituteReportHeader = require("./subject/instituteReportHeader");
const unlinkFile = util.promisify(fs.unlink);
const settlementReport = async (fid, from, to, bank, payment_type, staff) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 10, left: 20, right: 20 },
  });
  const result = await settlementReportData(
    fid,
    from,
    to,
    bank,
    payment_type,
    staff
  );

  // const ins_data = await instituteReportData(instituteId);
  const instituteData = result?.ft?.ins_info;
  const daybook = result?.ft?.combines;
  const account_other = result?.ft;
  // console.log("daybook", daybook);
  let date = new Date();
  let stu_name = `${instituteData?.name}`;
  // const stream = fs.createWriteStream(
  //   `./uploads/${stu_name}-settlement-report.pdf`
  // );

  let name = `${stu_name}-${date.getTime()}`;
  const stream = fs.createWriteStream(
    `./uploads/${name}-settlement-report.pdf`
  );

  doc.pipe(stream);
  const pageWidth = doc.page.width;
  await instituteReportHeader(instituteData, doc, pageWidth);
  doc.moveDown(0.3);

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(
      `From: ${account_other?.day_range_from} To ${account_other?.day_range_to}`,
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
      `Payment Type: ${
        payment_type === "BOTH"
          ? "Total"
          : payment_type === "CASH_BANK"
          ? "Cash / Bank"
          : payment_type
      }`,
      {
        width: pageWidth - 40,
        align: "right",
      }
    );

  doc.strokeColor("#121212").lineWidth(2);
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();

  doc.moveDown(0.5);
  doc.y += 2;
  let pos1 = doc.y;
  doc.moveDown(0.3);
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`${account_other?.account_info?.finance_bank_account_name ?? ""}`, {
      align: "left",
    });

  doc.moveDown(1);

  let daybook_print_type = daybook;

  const modify_list = [];
  let cti = 1;
  for (let i = 0; i < daybook?.length; i++) {
    let dfg = daybook[i];
    modify_list.push({
      head_name: dfg?.indian_format,
      head_amount: dfg?.head_amount,
    });
  }

  const table = {
    headers: [
      {
        label: "Date",
        property: "head_name",
        width: 140,
        render: null,
        headerColor: "#b4b4b4",
        headerOpacity: 0.5,
        padding: [10, 10],
      },

      {
        label: "Total",
        property: "head_amount",
        width: 70,
        render: null,
        headerColor: "#b4b4b4",
        headerOpacity: 0.5,
        padding: [10, 10],
        align: "right",
      },
    ],
    datas: modify_list,
  };

  // Draw the table on the current page
  doc.table(table, {
    prepareHeader: () => doc.font("Times-Bold").fontSize(10),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      if (row.head_name === "Total") {
        doc.font("Times-Bold").fontSize(10);
      } else {
        doc.font("Times-Roman").fontSize(10);
      }

      doc.addBackground(rectCell, "#a1a1a1", 0.1);
    },
  });

  doc.moveDown(1);

  doc.end();

  // Handle errors
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });

  // Handle stream close event
  stream.on("finish", async () => {
    // console.log("created");
    const finance = await Finance.findById({ _id: fid });
    const bank_acc = await BankAccount.findById({ _id: bank });
    let file = {
      path: `uploads/${name}-settlement-report.pdf`,
      filename: `${name}-settlement-report.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    bank_acc.day_book.push({
      excel_file: results?.Key,
      excel_file_name: `${name}-settlement-report.pdf`,
      from: from,
      to: to,
      payment_type: payment_type,
      bank: bank,
    });
    finance.day_book.push({
      excel_file: results?.Key,
      excel_file_name: `${name}-settlement-report.pdf`,
      from: from,
      to: to,
      payment_type: payment_type,
      bank: bank,
    });
    await unlinkFile(file.path);
    await Promise.all([bank_acc.save(), finance.save()]);
  });

  return `${name}-settlement-report.pdf`;
  //   console.log(data);
};
module.exports = settlementReport;
