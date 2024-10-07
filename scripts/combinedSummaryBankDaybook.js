const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const { uploadDocsFile } = require("../S3Configuration");
const util = require("util");
const combinedSummaryBankDaybookData = require("../AjaxRequest/combinedSummaryBankDaybookData");
const BankAccount = require("../models/Finance/BankAccount");
const Finance = require("../models/Finance");
const instituteReportHeader = require("./subject/instituteReportHeader");
const unlinkFile = util.promisify(fs.unlink);
const combinedSummaryBankDaybook = async (
  fid,
  from,
  to,
  bank,
  payment_type,
  flow,
  staff
) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await combinedSummaryBankDaybookData(
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

  let date = new Date();
  let stu_name = `${instituteData?.name}`;
  // const stream = fs.createWriteStream(
  //   `./uploads/${stu_name}-combined-summary-bank-daybook.pdf`
  // );

  let name = `${stu_name}-${date.getTime()}`;
  const stream = fs.createWriteStream(
    `./uploads/${name}-combined-summary-bank-daybook.pdf`
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

  if (account_other?.one_staff?.staffFirstName) {
    doc
      .fontSize(11)
      .font("Times-Bold")
      .fillColor("#121212")
      .text(
        `Cashier :${account_other?.one_staff?.staffFirstName ?? ""} ${
          account_other?.one_staff?.staffMiddleName ?? ""
        } ${account_other?.one_staff?.staffLastName ?? ""}`,
        {
          align: "left",
        }
      );

    doc.moveDown(1);
  }

  if (payment_type === "BOTH" || payment_type === "Total") {
    let total = {
      sr_number: "",
      head_name: "Total",
      head_amount: 0,
      cash_head_amount: 0,
      pg_head_amount: 0,
      bank_head_amount: 0,
      receipt_no: "",
    };

    let daybook_print_type = {
      admission: daybook?.[0]?.date_wise?.length,
      hostel: daybook?.[0]?.date_wise?.length + daybook?.[1]?.date_wise?.length,
      miscellaneous:
        daybook?.[0]?.date_wise?.length +
        daybook?.[1]?.date_wise?.length +
        daybook?.[2]?.date_wise?.length,
    };

    const modify_list = [];
    let cti = 1;
    for (let i = 0; i < daybook?.length; i++) {
      let dbt = daybook[i];
      for (let j = 0; j < dbt?.date_wise?.length; j++) {
        let dfg = dbt?.date_wise[j];
        modify_list.push({
          sr_number: cti,
          head_name: dfg?.indian_format,
          head_amount: dfg?.head_amount,
          cash_head_amount: dfg?.cash_head_amount,
          pg_head_amount: dfg?.pg_head_amount,
          bank_head_amount: dfg?.bank_head_amount,
          receipt_no: dbt?.range ?? "",
        });
        total.head_amount += dfg?.head_amount;
        total.cash_head_amount += dfg?.cash_head_amount;
        total.bank_head_amount += dfg?.bank_head_amount;
        total.pg_head_amount += dfg?.pg_head_amount;
        ++cti;
      }
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
          label: "Date",
          property: "head_name",
          width: 140,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
        },
        {
          label: "Cash",
          property: "cash_head_amount",
          width: 70,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
          align: "right",
        },
        {
          label: "PG",
          property: "pg_head_amount",
          width: 70,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
          align: "right",
        },
        {
          label: "Bank",
          property: "bank_head_amount",
          width: 70,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
          align: "right",
        },
        {
          label: "Total",
          property: "head_amount",
          width: 70,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
          align: "right",
        },
        {
          label: "Receipt No",
          property: "receipt_no",
          width: 100,
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
        if (indexRow < daybook_print_type.admission) {
          doc.addBackground(rectCell, "#a1a1a1", 0.1);
          // doc.addBackground(rectCell, "#4a1e85", 0.1);
        } else if (
          indexRow >= daybook_print_type.admission &&
          indexRow < daybook_print_type.hostel
        ) {
          doc.addBackground(rectCell, "#21a086", 0.2);
        } else if (
          indexRow >= daybook_print_type.hostel &&
          indexRow < daybook_print_type.miscellaneous
        ) {
          doc.addBackground(rectCell, "#4a1e85", 0.1);
        } else {
        }
      },
    });
  } else if (payment_type === "CASH_BANK" || payment_type === "Cash / Bank") {
    let total = {
      sr_number: "",
      head_name: "Total",
      head_amount: 0,
      cash_head_amount: 0,
      bank_head_amount: 0,
      receipt_no: "",
    };

    let daybook_print_type = {
      admission: daybook?.[0]?.date_wise?.length,
      hostel: daybook?.[0]?.date_wise?.length + daybook?.[1]?.date_wise?.length,
      miscellaneous:
        daybook?.[0]?.date_wise?.length +
        daybook?.[1]?.date_wise?.length +
        daybook?.[2]?.date_wise?.length,
    };
    const modify_list = [];

    let cti = 1;
    for (let i = 0; i < daybook?.length; i++) {
      let dbt = daybook[i];
      for (let j = 0; j < dbt?.date_wise?.length; j++) {
        let dfg = dbt?.date_wise[j];
        modify_list.push({
          sr_number: i + 1,
          head_name: dfg?.indian_format,
          head_amount: dfg?.head_amount,
          cash_head_amount: dfg?.cash_head_amount,
          bank_head_amount: dfg?.bank_head_amount,
          receipt_no: dbt?.range ?? "",
        });
        total.head_amount += dfg?.head_amount;
        total.cash_head_amount += dfg?.cash_head_amount;
        total.bank_head_amount += dfg?.bank_head_amount;
        ++cti;
      }
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
          label: "Date",
          property: "head_name",
          width: 180,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
        },
        {
          label: "Cash",
          property: "cash_head_amount",
          width: 80,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [10, 10, 10, 10],
          align: "right",
        },
        {
          label: "Bank",
          property: "bank_head_amount",
          width: 80,
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
          width: 100,
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

        if (indexRow < daybook_print_type.admission) {
          doc.addBackground(rectCell, "#a1a1a1", 0.1);
          // doc.addBackground(rectCell, "#4a1e85", 0.1);
        } else if (
          indexRow >= daybook_print_type.admission &&
          indexRow < daybook_print_type.hostel
        ) {
          doc.addBackground(rectCell, "#21a086", 0.2);
        } else if (
          indexRow >= daybook_print_type.hostel &&
          indexRow < daybook_print_type.miscellaneous
        ) {
          doc.addBackground(rectCell, "#4a1e85", 0.1);
        } else {
        }
      },
    });
  } else {
    let total = {
      head_name: "Total",
      head_amount: 0,
    };

    let daybook_print_type = {
      admission: daybook?.[0]?.date_wise?.length,
      hostel: daybook?.[0]?.date_wise?.length + daybook?.[1]?.date_wise?.length,
      miscellaneous:
        daybook?.[0]?.date_wise?.length +
        daybook?.[1]?.date_wise?.length +
        daybook?.[2]?.date_wise?.length,
    };
    const modify_list = [];

    let cti = 1;
    for (let i = 0; i < daybook?.length; i++) {
      let dbt = daybook[i];
      for (let j = 0; j < dbt?.date_wise?.length; j++) {
        let dfg = dbt?.date_wise[j];
        modify_list.push({
          head_name: dfg?.indian_format,
          head_amount: dfg?.head_amount,
        });
        total.head_amount += dfg?.head_amount;
        ++cti;
      }
    }

    const table = {
      headers: [
        {
          label: "Date",
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
      datas: [...modify_list, total, total],
      // datas: [...paymentReceiptInfo?.feeheadList, total],
    };

    // Draw the table on the current page
    doc.table(table, {
      prepareHeader: () => doc.font("Times-Bold").fontSize(10),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Times-Roman").fontSize(10);

        if (indexRow < daybook_print_type.admission) {
          doc.addBackground(rectCell, "#a1a1a1", 0.1);
          // doc.addBackground(rectCell, "#4a1e85", 0.1);
        } else if (
          indexRow >= daybook_print_type.admission &&
          indexRow < daybook_print_type.hostel
        ) {
          doc.addBackground(rectCell, "#21a086", 0.2);
        } else if (
          indexRow >= daybook_print_type.hostel &&
          indexRow < daybook_print_type.miscellaneous
        ) {
          doc.addBackground(rectCell, "#4a1e85", 0.1);
        } else {
        }
      },
    });
  }

  doc.moveDown(7);

  doc.strokeColor("#a1a1a1", 0.1).lineWidth(8);
  doc.moveTo(20, doc.y).lineTo(60, doc.y).stroke();
  doc.moveUp(0.4);

  doc
    .fontSize(11)
    .font("Times-Roman")
    .fillColor("#121212")
    .text("Admission Fee Heads", {
      indent: 50,
    });
  doc.moveDown(1);

  doc.strokeColor("#21a086", 0.2).lineWidth(8);
  doc.moveTo(20, doc.y).lineTo(60, doc.y).stroke();
  doc.moveUp(0.4);

  doc
    .fontSize(11)
    .font("Times-Roman")
    .fillColor("#121212")
    .text("Hostel Fee Heads", {
      indent: 50,
    });
  doc.moveDown(1);

  doc.strokeColor("#4a1e85", 0.1).lineWidth(8);
  doc.moveTo(20, doc.y).lineTo(60, doc.y).stroke();
  doc.moveUp(0.4);

  doc
    .fontSize(11)
    .font("Times-Roman")
    .fillColor("#121212")
    .text("Miscellaneous Fee Heads", {
      indent: 50,
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
      path: `uploads/${name}-combined-summary-bank-daybook.pdf`,
      filename: `${name}-combined-summary-bank-daybook.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    bank_acc.day_book.push({
      excel_file: results?.Key,
      excel_file_name: `${name}-combined-summary-bank-daybook.pdf`,
      from: from,
      to: to,
      payment_type: payment_type,
      bank: bank,
    });
    finance.day_book.push({
      excel_file: results?.Key,
      excel_file_name: `${name}-combined-summary-bank-daybook.pdf`,
      from: from,
      to: to,
      payment_type: payment_type,
      bank: bank,
      flow: flow ?? "",
    });
    await unlinkFile(file.path);
    await Promise.all([bank_acc.save(), finance.save()]);
  });

  return `${name}-combined-summary-bank-daybook.pdf`;
  //   console.log(data);
};
module.exports = combinedSummaryBankDaybook;
