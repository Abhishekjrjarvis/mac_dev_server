const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const createTable = require("../components/createTable");
const numToWords = require("../helper/numToWords");
const dynamicImages = require("../helper/dynamicImages");
const moment = require("moment");
const feeReceipt = require("../models/RazorPay/feeReceipt");
const { uploadDocsFile } = require("../S3Configuration");
const normalReceiptData = require("../AjaxRequest/normalReceiptData");

const normalAdmissionFeeReceipt = async (receiptId, appId) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margins: { top: 25, bottom: 25, left: 25, right: 25 },
  });

  const result = await normalReceiptData(receiptId, appId);

  const institute = result?.institute;
  const studentInfo = result?.studentInfo;
  const paymentReceiptInfo = result?.paymentReceiptInfo;

  let date = new Date();
  let time = date.getTime();

  const stream = fs.createWriteStream(
    `./uploads/${paymentReceiptInfo.invoiceNumber}-${time}normal-receipt.pdf`
  );
  doc.pipe(stream);
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  if (institute?.instituteImage) {
    doc.image(
      await dynamicImages("CUSTOM", institute?.instituteImage),
      doc.x,
      doc.y,
      {
        width: 65,
        height: 65,
        align: "left",
      }
    );
  }
  if (institute?.affiliatedImage) {
    doc.image(
      await dynamicImages("CUSTOM", institute?.affiliatedImage),
      doc.page.width - 90,
      doc.y,
      {
        width: 65,
        height: 65,
        align: "left",
      }
    );
  }

  doc.fontSize(10).text(institute?.insAffiliated, 25, 25, { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(16).text(institute?.insName, { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(10).text(institute?.insAddress, { align: "center" });
  doc.moveDown(0.3);
  doc
    .fontSize(10)
    .text(
      `Mob No : ${institute?.insPhoneNumber} , email : ${institute?.insEmail}`,
      {
        align: "center",
      }
    );

  doc.moveDown(2);
  doc.fontSize(18).text("Fee Receipt", { align: "center" });
  doc.moveDown();
  let heightBar = doc.y;
  doc.fontSize(11).text("Name : " + studentInfo?.name, 25, heightBar);
  doc
    .fontSize(11)
    .text("GRNo : " + studentInfo?.grNumber, pageWidth / 2 + 5, heightBar);
  heightBar = doc.y;
  doc.fontSize(11).text("A Y : " + studentInfo?.batchName, 25, heightBar);
  doc
    .fontSize(11)
    .text(
      "Department : " + studentInfo?.departmentName,
      pageWidth / 2 + 5,
      heightBar
    );
  heightBar = doc.y;
  doc.fontSize(11).text("Class : " + studentInfo?.standard, 25, heightBar);
  doc
    .fontSize(11)
    .text(
      "Applied In : " + studentInfo?.applicationName,
      pageWidth / 2 + 5,
      heightBar
    );

  let currentPosition = doc.y + 10;
  doc.strokeColor("black").lineWidth(2);
  doc
    .moveTo(25, currentPosition)
    .lineTo(pageWidth - 25, currentPosition)
    .stroke();
  doc.moveDown(2);
  currentPosition = doc.y;

  doc.text(
    "Receipt No : " + paymentReceiptInfo.invoiceNumber,
    25,
    currentPosition
  );
  doc.text("Dated : " + paymentReceiptInfo.createdAt, 440, currentPosition);
  currentPosition += 20;
  doc.text(
    "Total Fee : Rs. " + paymentReceiptInfo.totalFee,
    25,
    currentPosition
  );
  doc.text(
    "Applicable Fee : Rs. " + paymentReceiptInfo.applicableTotalFee,
    260,
    currentPosition
  );
  doc.text(
    "Total Fee Paid : Rs. " + paymentReceiptInfo.paidFee,
    440,
    currentPosition
  );

  doc.moveDown(2);
  doc.text("");

  doc.x = 25;

  createTable(doc, paymentReceiptInfo);

  doc.moveDown();

  // Transaction Details
  // declaration
  doc
    .font("Times-Bold")
    .fontSize(10)
    .text("On Account of : ", { align: "left" });
  doc
    .font("Times-Roman")
    .fontSize(10)
    .text(
      `Being fees received by  ${paymentReceiptInfo?.transactionMode}, Ref No : ${paymentReceiptInfo?.referenceNumber} Dated : ${paymentReceiptInfo.transactionDate} for Rs. ${paymentReceiptInfo?.transactionAmount} from ${studentInfo?.name}, towards fees for ${paymentReceiptInfo?.transactionApplication} for academic year ${paymentReceiptInfo?.transactionBatchName}.`,
      { align: "justify" }
    );
  doc.moveDown();

  doc
    .font("Times-Bold")
    .fontSize(10)
    .text("Bank Transaction Details : ", { align: "left" });
  doc.moveDown(0.5);
  doc
    .font("Times-Roman")
    .fontSize(10)
    .text(
      "Payment Mode : " +
        `${
          paymentReceiptInfo?.transactonSetOff === "Set Off"
            ? "SetOff"
            : `${paymentReceiptInfo.transactionMode}`
        }`,
      {
        align: "justify",
      }
    );
  doc.moveDown(0.5);
  doc.text("Bank Name : " + paymentReceiptInfo?.bankName, {
    align: "justify",
  });
  doc.moveDown(0.5);
  doc.text("Branch Name : " + "", {
    align: "justify",
  });
  doc.moveDown(0.5);
  doc.text("Bank Holder Name : " + paymentReceiptInfo?.bankHolderName, {
    align: "justify",
  });
  doc.moveDown(0.5);
  doc.text("Transaction Id : " + paymentReceiptInfo?.transactionId, {
    align: "justify",
  });
  doc.moveDown(0.5);
  doc.text("Date : " + paymentReceiptInfo?.transactionDate, {
    align: "justify",
  });
  doc.moveDown(0.5);
  doc.text("Amount : Rs. " + paymentReceiptInfo?.transactionAmount, {
    align: "justify",
  });
  doc.moveDown(0.5);
  doc.text(
    "Amount in Words : " + numToWords(paymentReceiptInfo?.transactionAmount),
    { align: "justify" }
  );
  doc.moveDown(10);
  currentPosition = doc.y;

  if (Math.abs(doc.y - doc.page.height) < 160) {
    doc.addPage();
    currentPosition = 160;
  }
  if (studentInfo?.receiverSignature) {
    doc.image(
      await dynamicImages("DEV", studentInfo?.receiverSignature),
      doc.page.width - 120,
      currentPosition - 60,
      {
        width: 80,
        height: 60,
      }
    );
  }

  currentPosition += 10;
  doc.text(
    "Date : " + ` ${moment().format("Do MMM YYYY")}`,
    25,
    currentPosition,
    {
      align: "left",
    }
  );
  doc
    .font("Times-Bold")
    .text("Receiver", doc.page.width - 100, currentPosition);
  doc.moveDown();
  currentPosition = doc.y + 10;
  doc.strokeColor("black").lineWidth(2);
  doc
    .moveTo(25, currentPosition)
    .lineTo(pageWidth - 25, currentPosition)
    .stroke();
  doc.moveDown(2);
  currentPosition = doc.y;
  doc
    .font("Times-Roman")
    .fontSize(7)
    .text(
      "Note : No one except one who is making this receipt should interfere with any details of this invoice, othewise students will be expelled and legal action will be taken.",
      25,
      currentPosition,
      { align: "center" }
    );
  doc.end();

  // Handle errors
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });
  // Handle stream close event
  stream.on("finish", async () => {
    const fee_receipt = await feeReceipt.findById({ _id: receiptId });
    console.log("PDF created successfully");
    let file = {
      path: `uploads/${paymentReceiptInfo.invoiceNumber}-${time}normal-receipt.pdf`,
      filename: `${paymentReceiptInfo.invoiceNumber}-${time}normal-receipt.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    fee_receipt.receipt_file = results?.Key;
    await unlinkFile(file.path);
    await fee_receipt.save();
  });
};

module.exports = normalAdmissionFeeReceipt;

