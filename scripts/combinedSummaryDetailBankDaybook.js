const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const { uploadDocsFile } = require("../S3Configuration");
const util = require("util");
const combinedSummaryDetailBankDaybookData = require("../AjaxRequest/combinedSummaryDetailBankDaybookData");
const BankAccount = require("../models/Finance/BankAccount");
const Finance = require("../models/Finance");
const instituteReportHeader = require("./subject/instituteReportHeader");
const unlinkFile = util.promisify(fs.unlink);
const combinedSummaryDetailBankDaybook = async (
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
    size: "A1",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await combinedSummaryDetailBankDaybookData(
    fid,
    from,
    to,
    bank,
    payment_type,
    staff
  );

  const instituteData = result?.ft?.ins_info;
  const daybook = result?.ft?.combines;
  const account_other = result?.ft;

  let date = new Date();
  let stu_name = `${instituteData?.name}`;
  // const stream = fs.createWriteStream(
  //   `./uploads/${stu_name}-combined-summary-detail-bank-daybook.pdf`
  // );

  let name = `${stu_name}-${date.getTime()}`;
  const stream = fs.createWriteStream(
    `./uploads/${name}-combined-summary-detail-bank-daybook.pdf`
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

  let colunm_list = [];

  let modify_obj = {};
  // let modify_list = [];
  if (daybook?.length > 0) {
    // let ct = 1;
    for (let dt of daybook) {
      let obj = {
        indian_format: dt?.indian_format,
        modify_list: [],
      };
      if (dt?.results?.length > 0) {
        let obj_nest = {
          ReceiptNumber: "",
          Name: "Total",
          BankTxnValue: 0,
        };
        for (let yt of dt?.results) {
          obj.modify_list.push(yt);
          for (let jh in yt) {
            if (["ReceiptNumber", "Name", "BankTxnValue"]?.includes(jh)) {
              if (jh === "BankTxnValue") {
                if (obj_nest[jh]) {
                  obj_nest[jh] += yt[jh] ?? 0;
                } else {
                  obj_nest[jh] = yt[jh] ?? 0;
                }
              }
            } else {
              if (colunm_list?.includes(jh)) {
              } else {
                colunm_list.push(jh);
              }
              if (obj_nest[jh]) {
                obj_nest[jh] += yt[jh] ?? 0;
              } else {
                obj_nest[jh] = yt[jh] ?? 0;
              }
            }
          }
        }
        obj.modify_list.push(obj_nest);
      }
      modify_obj[dt?.indian_format] = obj;
      // modify_list.push({
      //   obj,
      // });
    }
  }

  // let tb_list = [];
  let uyt = 1;
  for (let ht in modify_obj) {
    if (uyt !== 1) {
      doc.addPage();
    }
    let table = {
      headers: [
        {
          label: "Receipt No",
          property: "ReceiptNumber",
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [2, 2],
          align: "center",
          valign: "center",
          width: 120,
        },
        {
          label: "Name",
          property: "Name",
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [2, 2],
          width: 150,
          align: "center",
          valign: "center",
        },
        {
          label: "Amount",
          property: "BankTxnValue",
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          padding: [2, 2],
          align: "center",
          valign: "center",
          width: 50,
        },
      ],
      datas: modify_obj[ht]?.modify_list,
    };
    if (colunm_list?.length > 0) {
      for (let i = 0; i < colunm_list?.length; i++) {
        let ft = colunm_list[i];
        table.headers.push({
          label: ft,
          property: ft,
          render: null,
          headerColor: "#b4b4b4",
          headerOpacity: 0.5,
          align: "center",
          valign: "center",
          padding: [2, 2],
          width: 40,
        });
      }

      // let range = 5;
      // let range_itr = Math.ceil(colunm_list?.length / range);

      // for (let j = 0; j < range_itr; j++) {
      //   let table = {
      //     headers: [
      //       {
      //         label: "SN",
      //         property: "sr_number",
      //         render: null,
      //         headerColor: "#b4b4b4",
      //         headerOpacity: 0.5,
      //         align: "center",
      //         padding: [2, 2],
      //       },
      //       {
      //         label: "Name",
      //         property: "Name",
      //         render: null,
      //         headerColor: "#b4b4b4",
      //         headerOpacity: 0.5,
      //         padding: [2, 2],
      //       },
      //       {
      //         label: "Receipt No",
      //         property: "ReceiptNumber",
      //         render: null,
      //         headerColor: "#b4b4b4",
      //         headerOpacity: 0.5,
      //         padding: [2, 2],
      //         align: "right",
      //       },
      //       {
      //         label: "Amount",
      //         property: "BankTxnValue",
      //         render: null,
      //         headerColor: "#b4b4b4",
      //         headerOpacity: 0.5,
      //         padding: [2, 2],
      //         align: "right",
      //       },
      //     ],
      //     datas: modify_list,
      //   };
      //   for (let i = j * range; i < j * range + range; i++) {
      //     let ft = colunm_list[i];
      //     table.headers.push({
      //       label: ft,
      //       property: ft,
      //       render: null,
      //       headerColor: "#b4b4b4",
      //       headerOpacity: 0.5,
      //       align: "center",
      //       padding: [2, 2],
      //     });
      //   }
      //   tb_list.push(table);
      // }
    }

    if (modify_obj[ht]?.indian_format) {
      doc
        .fontSize(11)
        .font("Times-Bold")
        .fillColor("#121212")
        .text(`Date : ${modify_obj[ht]?.indian_format}`, {
          align: "left",
        });
      doc.moveDown(1);
    }

    // Draw the table on the current page
    doc.table(table, {
      prepareHeader: () => doc.font("Times-Bold").fontSize(10),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        if (row.head_name === "Total") {
          doc.font("Times-Bold").fontSize(10);
        } else {
          doc.font("Times-Roman").fontSize(8);
        }
        doc.addBackground(rectCell, "#a1a1a1", 0.1);
      },
    });
    ++uyt;
  }

  // if (tb_list?.length > 0) {
  //   for (let table of tb_list) {
  //     // Draw the table on the current page
  //     doc.table(table, {
  //       prepareHeader: () => doc.font("Times-Bold").fontSize(10),
  //       prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
  //         if (row.head_name === "Total") {
  //           doc.font("Times-Bold").fontSize(10);
  //         } else {
  //           doc.font("Times-Roman").fontSize(10);
  //         }
  //         doc.addBackground(rectCell, "#a1a1a1", 0.1);
  //       },
  //     });
  //   }
  // }

  doc.moveDown(7);

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
      path: `uploads/${name}-combined-summary-detail-bank-daybook.pdf`,
      filename: `${name}-combined-summary-detail-bank-daybook.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    bank_acc.day_book.push({
      excel_file: results?.Key,
      excel_file_name: `${name}-combined-summary-detail-bank-daybook.pdf`,
      from: from,
      to: to,
      payment_type: payment_type,
      bank: bank,
    });
    finance.day_book.push({
      excel_file: results?.Key,
      excel_file_name: `${name}-combined-summary-detail-bank-daybook.pdf`,
      from: from,
      to: to,
      payment_type: payment_type,
      bank: bank,
      flow: flow ?? "",
    });
    await unlinkFile(file.path);
    await Promise.all([bank_acc.save(), finance.save()]);
  });

  return `${name}-combined-summary-detail-bank-daybook.pdf`;
  //   console.log(data);
};
module.exports = combinedSummaryDetailBankDaybook;
