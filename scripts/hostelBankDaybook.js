const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const dynamicImages = require("../helper/dynamicImages");
const numToWords = require("../helper/numToWords");
const { uploadDocsFile } = require("../S3Configuration");
const util = require("util");
const BankAccount = require("../models/Finance/BankAccount");
const hostelDaybookData = require("../AjaxRequest/hostelDaybookData");
const Finance = require("../models/Finance");
const unlinkFile = util.promisify(fs.unlink);
const hostelBankDaybook = async (fid, hid, from, to, bank, payment_type, flow) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await hostelDaybookData(fid, hid, from, to, bank, payment_type);

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
  let in_string = instituteData?.insName;

  let in_string_divid = Math.ceil(in_string?.length / 55);

  for (let i = 0; i < +in_string_divid; i++) {
    doc
      .fontSize(16)
      .text(in_string?.substring(55 * i, 55 + 55 * i), { align: "center" });
  }

  // doc.fontSize(16).text(instituteData?.insName, { align: "center" });
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
    .text(`Payment Type: ${payment_type === "BOTH" ? "Total" : payment_type}`, {
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

  if (payment_type === "BOTH") {
    let data_dummy = [
      {
        head_name: "Workshop Fees",
        head_amount: 15600,
        cash_head_amount: 13400,
        bank_head_amount: 2200,
        _id: "6656d70f9764b93acce0cf8d",
      },
      {
        head_name: "Caution Money",
        head_amount: 112450,
        cash_head_amount: 100050,
        bank_head_amount: 12400,
        _id: "6656d9339764b93acce0d64a",
      },
      {
        head_name: "Administrative Services Char",
        head_amount: 666850,
        cash_head_amount: 615850,
        bank_head_amount: 51000,
        _id: "6656d9439764b93acce0d651",
      },
      {
        head_name: "Campus Conservancy Fee",
        head_amount: 1260005,
        cash_head_amount: 1163105,
        bank_head_amount: 96900,
        _id: "6656d94c9764b93acce0d676",
      },
      {
        head_name: "Internet Charges",
        head_amount: 390200,
        cash_head_amount: 359600,
        bank_head_amount: 30600,
        _id: "6656d9559764b93acce0d6a1",
      },
      {
        head_name: "Evaluation Fee",
        head_amount: 49000,
        cash_head_amount: 42000,
        bank_head_amount: 7000,
        _id: "6656d95d9764b93acce0d6d1",
      },
      {
        head_name: "Laboratory Brekage",
        head_amount: 112400,
        cash_head_amount: 102400,
        bank_head_amount: 10000,
        _id: "66580728130c5202986f3fca",
      },
      {
        head_name: "Laboratory Development Fee",
        head_amount: 160500,
        cash_head_amount: 143500,
        bank_head_amount: 17000,
        _id: "6658239e9ec999ce9339d73b",
      },
      {
        head_name: "Computer, Study Material Fee",
        head_amount: 77100,
        cash_head_amount: 72600,
        bank_head_amount: 4500,
        _id: "668166e0c1775c56bcd5c084",
      },
    ];
    let total = {
      sr_number: "",
      head_name: "Total",
      head_amount: 0,
      cash_head_amount: 0,
      bank_head_amount: 0,
      receipt_no: "",
    };

    const modify_list = [];

    for (let i = 0; i < daybook?.length; i++) {
      let dfg = daybook[i];
      // for (let i = 0; i < data_dummy?.length; i++) {
      //   let dfg = data_dummy[i];

      modify_list.push({
        sr_number: i + 1,
        head_name: dfg?.head_name,
        head_amount: dfg?.head_amount,
        cash_head_amount: dfg?.cash_head_amount,
        bank_head_amount: dfg?.bank_head_amount,
        // receipt_no: "1111 To 2574",
        receipt_no: account_other?.range ?? "",
      });
      total.head_amount += dfg?.head_amount;
      total.cash_head_amount += dfg?.cash_head_amount;
      total.bank_head_amount += dfg?.bank_head_amount;
    }

    modify_list.push(total);
    const table = {
      headers: [
        {
          label: "SN",
          property: "sr_number",
          width: 40,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          align: "center",
          padding: [10, 10, 10, 10],
        },
        {
          label: "Main Heads",
          property: "head_name",
          width: 190,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
        },
        {
          label: "Cash Amount",
          property: "cash_head_amount",
          width: 80,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
          align: "right",
        },
        {
          label: "PG Amount",
          property: "bank_head_amount",
          width: 90,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
          align: "right",
        },
        {
          label: "Total",
          property: "head_amount",
          width: 80,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
          align: "right",
        },
        {
          label: "Receipt No",
          property: "receipt_no",
          width: 80,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          align: "center",
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
        doc.addBackground(rectCell, "#a1a1a1", 0);
      },
    });
  } else {
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
  }

  doc.end();

  // Handle errors
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });

  // Handle stream close event
  stream.on("finish", async () => {
    // console.log("created");
    const finance = await Finance.findById({ _id: fid })
    const bank_acc = await BankAccount.findById({ _id: bank });
    let file = {
      path: `uploads/${name}-bank-daybook.pdf`,
      filename: `${name}-bank-daybook.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    bank_acc.day_book.push({
      excel_file: results?.Key,
      excel_file_name: `${name}-bank-daybook.pdf`,
      from: from,
      to: to,
      payment_type: payment_type,
      bank: bank,
    });
    finance.day_book.push({
      excel_file: results?.Key,
      excel_file_name: `${name}-bank-daybook.pdf`,
      from: from,
      to: to,
      payment_type: payment_type,
      bank: bank,
      flow: flow ?? ""
    });
    await unlinkFile(file.path);
    await Promise.all([ bank_acc.save(), finance.save() ])
  });
  return `${name}-bank-daybook.pdf`
};
module.exports = hostelBankDaybook;

