const generateFeeReceipt = async (InsNo) => {
    const PDFDocument = require("pdfkit-table");
    const fs = require("fs");
    const createTable = require("../components/createTable");
    const headerSection = require("../components/headerSection");
    const getData = require("../data/feeData");
    const doc = new PDFDocument({
      font: "Times-Roman",
      size: "A4",
      margins: { top: 25, bottom: 25, left: 25, right: 25 },
    });
    const data = await getData(InsNo);
    const stream = fs.createWriteStream(
      `./outputs/${data.receiptDetails.receiptNo}.pdf`
    );
    doc.pipe(stream);
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    // console.log(doc)
    // Header Section
    headerSection(
      doc,
      doc.x,
      doc.y,
      data.assets.instituteLogo,
      data.assets.universityLogo,
      data.header.boardName,
      data.header.universityName,
      data.header.address,
      data.header.mobNo,
      data.header.email
    );
  
    // Student Details
  
    doc.moveDown(2);
    doc.fontSize(18).text("Fee Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).text("Name : " + data.student.name, 25, 150);
    doc.fontSize(11).text("GRNo : " + data.student.grNo, 260, 150);
    doc.fontSize(11).text("A Y : " + data.student.academicYear, 440, 150);
    doc.fontSize(11).text("Department : " + data.student.department, 25, 170);
    doc.fontSize(11).text("Class : " + data.student.class, 260, 170);
    doc.fontSize(11).text("Applied In : " + data.student.appliedIn, 440, 170);
    let currentPosition = doc.y + 10;
    doc.strokeColor("black").lineWidth(2);
    doc
      .moveTo(25, currentPosition)
      .lineTo(pageWidth - 25, currentPosition)
      .stroke();
    doc.moveDown(2);
    currentPosition = doc.y;
  
    // Recipt Details
  
    doc.text(
      "Receipt No : " + data.receiptDetails.receiptNo,
      25,
      currentPosition
    );
    doc.text("Dated : " + data.receiptDetails.date, 440, currentPosition);
    currentPosition += 20;
    doc.text(
      "Total Fee : Rs. " + data.receiptDetails.totalFees,
      25,
      currentPosition
    );
    doc.text(
      "Applicable Fee : Rs. " + data.receiptDetails.applicableFee,
      260,
      currentPosition
    );
    doc.text(
      "Total Fee Paid : Rs. " + data.receiptDetails.feePaid,
      440,
      currentPosition
    );
  
    doc.moveDown(2);
    doc.text("");
  
    // generate Table
    doc.x = 25;
  
    createTable(doc, data.feeDetails);
  
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
        `Being fees recived by  ${data.transactionDetails.paymentMode}, Ref No : ${data.transactionDetails.refNo} Dated : ${data.transactionDetails.transactionDate} for Rs. ${data.transactionDetails.transactionAmount} from ${data.student.name}, towards fees for ${data.student.appliedIn} for academic year ${data.student.academicYear}.`,
        { align: "justify" }
      );
    doc.moveDown();
  
    // details
  
    doc
      .font("Times-Bold")
      .fontSize(10)
      .text("Bank Transaction Details : ", { align: "left" });
    doc.moveDown(0.5);
    doc
      .font("Times-Roman")
      .fontSize(10)
      .text("Payment Mode : " + data.transactionDetails.paymentMode, {
        align: "justify",
      });
    doc.moveDown(0.5);
    doc.text("Bank Name : " + data.transactionDetails.bankName, {
      align: "justify",
    });
    doc.moveDown(0.5);
    doc.text("Branch Name : " + data.transactionDetails.bankBranch, {
      align: "justify",
    });
    doc.moveDown(0.5);
    doc.text("Bank Holder Name : " + data.transactionDetails.bankHolderName, {
      align: "justify",
    });
    doc.moveDown(0.5);
    doc.text("Transaction Id : " + data.transactionDetails.transactionId, {
      align: "justify",
    });
    doc.moveDown(0.5);
    doc.text("Date : " + data.transactionDetails.transactionDate, {
      align: "justify",
    });
    doc.moveDown(0.5);
    doc.text("Amount : " + data.transactionDetails.transactionAmount, {
      align: "justify",
    });
    doc.moveDown(0.5);
    doc.text(
      "Amount in Words : " + data.transactionDetails.transactionAmountInWord,
      { align: "justify" }
    );
    doc.moveDown(12);
    currentPosition = doc.y;
    doc.text("Date : " + data.receiptDetails.date, 25, currentPosition, {
      align: "left",
    });
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
    stream.on("finish", () => {
      console.log("PDF created successfully");
    });
  
    //   console.log(data);
  };
  module.exports = generateFeeReceipt;