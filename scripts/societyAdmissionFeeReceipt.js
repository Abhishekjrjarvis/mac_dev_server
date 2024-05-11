const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const dynamicImages = require("../helper/dynamicImages");
const numToWords = require("../helper/numToWords");
const { uploadDocsFile } = require("../S3Configuration");
const util = require("util");
const societyReceiptData = require("../AjaxRequest/societyReceiptData");
const feeReceipt = require("../models/RazorPay/feeReceipt");
const unlinkFile = util.promisify(fs.unlink);

const societyAdmissionFeeReceipt = async (receiptId, instituteId) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await societyReceiptData(
    // "65dc162b0d8de10f7acdd490",
    receiptId,
    instituteId
  );
  const instituteData = result?.dt;
  const receiptData = result?.ft?.receipt;

  let date = new Date();
  let stu_name = `${receiptData?.student?.studentFirstName ?? ""} ${
    receiptData?.student?.studentMiddleName ?? ""
  } ${receiptData?.student?.studentLastName ?? ""}`;
  let name = `${date.getTime()}-${stu_name}`;

  const stream = fs.createWriteStream(`./uploads/${name}-society-receipt.pdf`);

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
  doc.fontSize(16).text(instituteData?.insName, { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).text(instituteData?.insAddress, { align: "center" });
  doc.moveDown(0.3);

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
    .text("Regular Admission Fee Receipt (Confirmed Admission)", {
      width: pageWidth - 100,
      align: "center",
    });

  doc.moveUp(1);

  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text("Section: ", { align: "right" });
  doc.y += 4;
  let pos1 = doc.y;
  //   doc.strokeColor("#121212").lineWidth(1);
  //   doc
  //     .moveTo(20, doc.y)
  //     .lineTo(pageWidth - 20, doc.y)
  //     .stroke();
  doc.moveDown(0.7);

  doc.fontSize(10).font("Times-Bold").fillColor("#121212").text("Name: ", {
    width: 70,
    align: "right",
  });

  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#2e2e2e")
    .text(`${stu_name}`, {
      indent: 80,
    });
  doc.moveUp(1);

  doc
    .fontSize(10)
    .font("Times-Bold")
    .fillColor("#121212")
    .text("Class: ", {
      width: pageWidth / 2 + 100,
      align: "right",
    });
  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#2e2e2e")
    .text("F.Y.B.SC.", {
      indent: pageWidth / 2 + 110,
    });
  doc.y += 4;
  doc.fontSize(10).font("Times-Bold").fillColor("#121212").text("GRNO: ", {
    width: 70,
    align: "right",
  });

  if (receiptData?.student?.studentGRNO) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(receiptData?.student?.studentGRNO, {
        indent: 80,
      });
  }

  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Bold")
    .fillColor("#121212")
    .text("Division Type: ", {
      width: pageWidth / 2 + 100,
      align: "right",
    });
  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#2e2e2e")
    .text("GRANT", {
      indent: pageWidth / 2 + 110,
    });
  doc.y += 4;

  doc
    .fontSize(10)
    .font("Times-Bold")
    .fillColor("#121212")
    .text("Receipt No: ", {
      width: 70,
      align: "right",
    });
  if (receiptData?.invoice_count) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(receiptData?.invoice_count, {
        indent: 80,
      });
  }

  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Bold")
    .fillColor("#121212")
    .text("Roll No: ", {
      width: pageWidth / 2 + 100,
      align: "right",
    });

  if (receiptData?.student?.studentROLLNO) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(receiptData?.student?.studentROLLNO, {
        indent: pageWidth / 2 + 110,
      });
  }

  doc.rect(93, pos1, 0, 56).stroke();
  doc.rect(pageWidth / 2 + 43, pos1, 0, 56).stroke();
  doc.rect(pageWidth / 2 + 123, pos1, 0, 56).stroke();
  doc.rect(doc.x, pos1, pageWidth - 40, 56).stroke();

  doc.moveDown(1);
  doc.fontSize(13).text("Fee Details", { align: "center" });
  pos1 = doc.y;

  doc.y += 8;

  let paid_fee = receiptData?.student?.active_fee_heads?.filter((fd) => {
    if (fd?.paid_fee > 0) {
      return fd;
    } else {
      return null;
    }
  });

  let dft = Math.ceil(paid_fee?.length / 3);
  let mt = +dft === 1 ? 20 : 16;
  let paidAmount = 0;
  let pos2 = +dft * mt;

  for (let i = 0; i < paid_fee?.length; i++) {
    let ft = i;
    let data = paid_fee?.[ft];
    let w1 = pageWidth / 3;
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.head_name ?? "", {
        width: w1 - 100,
        align: "left",
        indent: 10,
      });
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.paid_fee, {
        width: pageWidth / 3 - 60,
        align: "right",
        indent: 10,
      });

    if (data?.paid_fee) paidAmount += data?.paid_fee;
    ft += 1;
    data = paid_fee?.[ft];
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.head_name ?? "", {
        // width: pageWidth / 3 + 60,
        // align: "right",
        // indent: 10,
        width: 2 * (pageWidth / 3),
        align: "left",
        indent: 10 + pageWidth / 3,
      });
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.paid_fee, {
        width: 2 * (pageWidth / 3) - 60,
        align: "right",
        indent: 10,
      });
    if (data?.paid_fee) paidAmount += data?.paid_fee;

    ft += 1;
    data = paid_fee?.[ft];
    i += 2;
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.head_name ?? "", {
        // width: 2 * (pageWidth / 3) + 60,
        // align: "right",
        // indent: 10,
        width: 3 * (pageWidth / 3),
        align: "left",
        indent: 10 + 2 * (pageWidth / 3),
      });
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.paid_fee, {
        width: pageWidth - 50,
        indent: 10,
        align: "right",
      });
    if (data?.paid_fee) paidAmount += data?.paid_fee;

    doc.moveDown(0.2);
  }

  doc.rect(doc.x, pos1, pageWidth - 40, pos2).stroke();
  doc.y = pos1 + pos2 + 8;
  doc
    .fontSize(12)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`Fee In Words: Rupees ${numToWords(paidAmount)}`, {
      indent: 10,
      align: "left",
    });
  doc.moveUp(1);
  doc
    .fontSize(12)
    .font("Times-Roman")
    .fillColor("#121212")

    .text("Paid Fee", {
      width: pageWidth - 130,
      align: "right",
    });
  doc.moveUp(1);
  doc
    .fontSize(12)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(paidAmount, {
      width: pageWidth - 50,
      align: "right",
    });
  doc
    .fontSize(12)
    .font("Times-Roman")
    .fillColor("#121212")
    .text("Pending Fee For All Academic Year", {
      indent: 10,
      align: "left",
    });
  doc.moveUp(1);

  doc
    .fontSize(12)
    .font("Times-Roman")
    .fillColor("#121212")
    .text("0", {
      width: doc.widthOfString("Pending Fee For All Academic Year") + 40,
      align: "right",
    });
  doc.rect(doc.x, pos1 + pos2, pageWidth - 40, 37).stroke();
  doc.y += 7;
  doc
    .fontSize(7)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(
      "Instruction-(1) Please preserve this receipt for refund of deposits and fees. (2) Fees once paid will not be refunded on account of cancellation of admission (3) Receipt must be produced when demanded by the Office. (4) Pilease chock the amount entered in the receipt and amount actually paid before leaving the counter. No complaints will be entertained afterwards (5) Transfer Certificale will not be issued unless all the arrears of fees are paid.",
      {
        align: "left",
      }
    );

  doc.y += 20;
  doc.fontSize(14).text("A/C Clerk", {
    indent: 20,
    align: "left",
  });

  //   for society related data
  doc.y += 10;
  // let ac_border_height = doc.y;

  // doc.y += 15;
  let ac_border_height = pageHeight / 2 - 10;

  doc.y = pageHeight / 2 + 10;

  dy = doc.y;

  doc.fontSize(10).text(instituteData?.insAffiliated, { align: "center" });
  doc.moveDown(2);
  doc.fontSize(10).text(instituteData?.insAddress, { align: "center" });
  if (instituteData?.insProfilePhoto) {
    doc.image(
      await dynamicImages("CUSTOM", instituteData?.insProfilePhoto),
      doc.x - 1,
      dy - 10,
      {
        width: 50,
        height: 50,
        align: "center",
      }
    );
    doc
      .lineCap("square")
      .lineWidth(20)
      .circle(doc.x + 24.6, dy + 15, 34.2)
      .stroke("white");
  }
  if (instituteData?.affliatedLogo) {
    doc.image(
      await dynamicImages("CUSTOM", instituteData?.affliatedLogo),
      pageWidth - 70,
      dy - 10,
      {
        width: 50,
        height: 50,
        align: "right",
      }
    );
    doc
      .lineCap("square")
      .lineWidth(20)
      .circle(pageWidth - 45, dy + 15, 34.2)
      .stroke("white");
  }

  doc.moveDown(0.3);

  doc
    .moveTo(20, doc.y)
    .lineWidth(1)
    .lineTo(pageWidth - 20, doc.y)
    .stroke("#121212");

  doc
    .moveTo(20, ac_border_height)
    .lineTo(pageWidth - 20, ac_border_height)
    .stroke();

  doc.y += 8;
  doc
    .fontSize(11)
    .font("Times-Bold")
    .fillColor("#121212")
    .text("Other Fee Receipt", { align: "center" });

  pos1 = doc.y;
  doc.moveDown(1);

  doc.y -= 3;
  doc.fontSize(10).font("Times-Bold").fillColor("#121212").text("Name: ", {
    width: 70,
    align: "right",
  });

  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#2e2e2e")
    .text(`${stu_name}`, {
      indent: 80,
    });
  doc.moveUp(1);

  doc
    .fontSize(10)
    .font("Times-Bold")
    .fillColor("#121212")
    .text("Class: ", {
      width: pageWidth / 2 + 100,
      align: "right",
    });
  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#2e2e2e")
    .text("F.Y.B.SC.", {
      indent: pageWidth / 2 + 110,
    });
  doc.y += 4;
  doc.fontSize(10).font("Times-Bold").fillColor("#121212").text("GRNO: ", {
    width: 70,
    align: "right",
  });

  if (receiptData?.student?.studentGRNO) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(receiptData?.student?.studentGRNO, {
        indent: 80,
      });
  }

  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Bold")
    .fillColor("#121212")
    .text("Division Type: ", {
      width: pageWidth / 2 + 100,
      align: "right",
    });
  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Roman")
    .fillColor("#2e2e2e")
    .text("GRANT", {
      indent: pageWidth / 2 + 110,
    });
  doc.y += 4;

  doc
    .fontSize(10)
    .font("Times-Bold")
    .fillColor("#121212")
    .text("Receipt No: ", {
      width: 70,
      align: "right",
    });
  if (receiptData?.invoice_count) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(receiptData?.invoice_count, {
        indent: 80,
      });
  }
  doc.moveUp(1);
  doc
    .fontSize(10)
    .font("Times-Bold")
    .fillColor("#121212")
    .text("Roll No: ", {
      width: pageWidth / 2 + 100,
      align: "right",
    });
  if (receiptData?.student?.studentROLLNO) {
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(receiptData?.student?.studentROLLNO, {
        indent: pageWidth / 2 + 110,
      });
  }

  doc.rect(93, pos1, 0, 56).stroke();
  doc.rect(pageWidth / 2 + 43, pos1, 0, 56).stroke();
  doc.rect(pageWidth / 2 + 123, pos1, 0, 56).stroke();
  doc.rect(doc.x, pos1, pageWidth - 40, 56).stroke();

  doc.moveDown(1);
  doc.fontSize(13).text("Fee Details", { align: "center" });
  pos1 = doc.y;

  doc.y += 8;
  let society_paid_fee = receiptData?.student?.active_society_fee_heads?.filter(
    (fd) => {
      if (fd?.paid_fee > 0) {
        return fd;
      } else {
        return null;
      }
    }
  );
  dft = Math.ceil(society_paid_fee?.length / 3);
  mt = +dft === 1 ? 20 : 16;
  pos2 = +dft * mt;
  paidAmount = 0;
  for (let i = 0; i < society_paid_fee?.length; i++) {
    let ft = i;
    let data = society_paid_fee?.[ft];
    let w1 = pageWidth / 3;
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.head_name ?? "", {
        width: w1 - 100,
        align: "left",
        indent: 10,
      });
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.paid_fee, {
        width: pageWidth / 3 - 60,
        align: "right",
        indent: 10,
      });
    if (data?.paid_fee) paidAmount += data?.paid_fee;

    ft += 1;
    data = society_paid_fee?.[ft];
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.head_name ?? "", {
        // width: pageWidth / 3 + 60,
        width: 2 * (pageWidth / 3),
        align: "left",
        indent: 10 + pageWidth / 3,
      });
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.paid_fee, {
        width: 2 * (pageWidth / 3) - 60,
        align: "right",
        indent: 10,
      });
    if (data?.paid_fee) paidAmount += data?.paid_fee;

    ft += 1;
    data = society_paid_fee?.[ft];
    i += 2;
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.head_name ?? "", {
        // width: 2 * (pageWidth / 3) + 60,
        // align: "right",
        // indent: 10,
        width: 3 * (pageWidth / 3),
        align: "left",
        indent: 10 + 2 * (pageWidth / 3),
      });
    doc.moveUp(1);
    doc
      .fontSize(10)
      .font("Times-Roman")
      .fillColor("#2e2e2e")
      .text(data?.paid_fee, {
        width: pageWidth - 50,
        indent: 10,
        align: "right",
      });
    if (data?.paid_fee) paidAmount += data?.paid_fee;

    doc.moveDown(0.2);
    // pos2 += 14.3;
    // ht += 8;
  }
  doc.rect(doc.x, pos1, pageWidth - 40, pos2).stroke();
  doc.y = pos1 + pos2 + 8;

  doc
    .fontSize(12)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(`Fee In Words: Rupees ${numToWords(paidAmount)}`, {
      indent: 10,
      align: "left",
    });
  doc.moveUp(1);
  doc
    .fontSize(12)
    .font("Times-Roman")
    .fillColor("#121212")
    .text("Paid Fee", {
      width: pageWidth - 130,
      align: "right",
    });
  doc.moveUp(1);
  doc
    .fontSize(12)
    .font("Times-Roman")
    .fillColor("#121212")
    .text(paidAmount, {
      width: pageWidth - 50,
      align: "right",
    });
  doc
    .moveTo(20, doc.y)
    .lineTo(pageWidth - 20, doc.y)
    .stroke();

  doc.moveDown(0.3);

  doc
    .fontSize(12)
    .font("Times-Roman")
    .fillColor("#121212")
    .text("Total Pending Fee TIll Date (Including All Academic Years):", {
      indent: 10,
      align: "left",
    });
  doc.moveUp(1);

  doc
    .fontSize(12)
    .font("Times-Roman")
    .fillColor("#121212")
    .text("0", {
      width:
        doc.widthOfString(
          "Total Pending Fee TIll Date (Including All Academic Years):"
        ) + 40,
      align: "right",
    });

  if (pos1 + pos2 > doc.page.height) {
    doc.rect(doc.x, pos1 + pos2 - doc.page.height, pageWidth - 40, 40).stroke();
  } else {
    doc.rect(doc.x, pos1 + pos2, pageWidth - 40, 40).stroke();
  }

  doc.y += 7;
  doc
    .fontSize(7)
    .font("Times-Roman")
    .text(
      "Instruction-(1) Please preserve this receipt for refund of deposits and fees. (2) Fees once paid will not be refunded on account of cancellation of admission (3) Receipt must be produced when demanded by the Office. (4) Pilease chock the amount entered in the receipt and amount actually paid before leaving the counter. No complaints will be entertained afterwards (5) Transfer Certificale will not be issued unless all the arrears of fees are paid.",
      {
        align: "left",
      }
    );

  doc.y += 20;
  doc.fontSize(14).text("A/C Clerk", {
    indent: 20,
    align: "left",
  });

  doc.end();

  // Handle errors
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });

  // Handle stream close event
  stream.on("finish", async () => {
    const fee_receipt = await feeReceipt.findById({ _id: receiptId})
    console.log("created");
    let file = {
      path: `uploads/${name}-society-receipt.pdf`,
      filename: `${name}-society-receipt.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    fee_receipt.receipt_file = results?.Key
    await unlinkFile(file.path);
    await fee_receipt.save()
  });

  //   console.log(data);
};
module.exports = societyAdmissionFeeReceipt;
