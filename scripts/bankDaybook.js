const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const dynamicImages = require("../helper/dynamicImages");
const numToWords = require("../helper/numToWords");
const { uploadDocsFile } = require("../S3Configuration");
const util = require("util");
const daybookData = require("../AjaxRequest/daybookData");
const BankAccount = require("../models/Finance/BankAccount");
const unlinkFile = util.promisify(fs.unlink);
const bankDaybook = async (fid, from, to, bank, payment_type) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await daybookData(fid, from, to, bank, payment_type);

  const instituteData = result?.ft?.ins_info;
  const daybook = result?.ft?.results;
  const account_other = result?.ft;

  let date = new Date();
  let stu_name = `${instituteData?.name}`;
  // const stream = fs.createWriteStream(`./uploads/${stu_name}-bank-daybook.pdf`);

  let name = `${date.getTime()}-${stu_name}`;
  const stream = fs.createWriteStream(`./uploads/${name}-bank-daybook.pdf`);

  doc.pipe(stream);
  const pageWidth = doc.page.width;
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
  doc.fontSize(16).text(instituteData?.insName, { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).text(instituteData?.insAddress, { align: "center" });
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
    .text(`Payment Type: ${payment_type}`, {
      width: pageWidth - 40,
      align: "right",
    });

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
  //   let total = {
  //     head_name: "TOTAL",
  //     applicable_fee: paymentReceiptInfo?.applicableFee,
  //     paid_fee: paymentReceiptInfo?.paidFee,
  //     remain_fee: paymentReceiptInfo?.remaingFeeManual ?? 0,
  //   };
  let total = {
    head_name: "Total",
    head_amount: 0,
  };
  for (let i = 0; i < daybook?.length; i++) {
    let dfg = daybook[i];
    total.head_amount += dfg?.head_amount;
  }

  const table = {
    headers: [
      {
        label: "Head",
        property: "head_name",
        width: 405,
        render: null,
        headerColor: "#b4b4b4",
        headerOpacity: 0.5,
        padding: [10, 10, 10, 10],
      },
      {
        label: "Amount",
        property: "head_amount",
        width: 150,
        render: null,
        headerColor: "#b4b4b4",
        headerOpacity: 0.5,
        align: "center",
      },
    ],
    datas: [...daybook, total, total],
    // datas: [...paymentReceiptInfo?.feeheadList, total],
  };

  // Draw the table on the current page
  doc.table(table, {
    prepareHeader: () => doc.font("Times-Bold").fontSize(10),
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      //   if (row.head_name === "TOTAL") {
      //     doc.font("Times-Bold").fontSize(10);
      //     doc.addBackground(rectCell, "b4b4b4", 0.08);
      //   } else {
      doc.font("Times-Roman").fontSize(10);
      doc.addBackground(rectCell, "#a1a1a1", 0);
      //   }
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
      const bank_acc = await BankAccount.findById({ _id: bank })
      let file = {
        path: `uploads/${name}-bank-daybook.pdf`,
        filename: `${name}-bank-daybook.pdf`,
        mimetype: "application/pdf",
      };
      const results = await uploadDocsFile(file);
      bank_acc.day_book.push({
        excel_file: results?.Key,
        excel_file_name: `${name}-bank-daybook.pdf`,
      })
      await unlinkFile(file.path);
      await bank_acc.save();
  });

  //   console.log(data);
};
module.exports = bankDaybook;

