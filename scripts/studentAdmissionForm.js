const studentFormData = require("../AjaxRequest/studentFormData");
const { uploadDocsFile } = require("../S3Configuration");
const StudentAdmissionFormHeader = require("../components/StudentAdmissionFormHeader");

// upload file
const fs = require("fs");
const util = require("util");
const dynamicImages = require("../helper/dynamicImages");
const Student = require("../models/Student");
const unlinkFile = util.promisify(fs.unlink);

const drawBorder = (doc) => {
  doc
    .roundedRect(12.5, 12.5, doc.page.width - 25, doc.page.height - 25, 5)
    .lineWidth(1)
    .strokeColor("black")
    .stroke();
};
const generateStudentAdmissionForm = async (
  studentId,
  instituteId,
  studentName,
  applicationName
) => {
  const PDFDocument = require("pdfkit");
  const fs = require("fs");
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margin: 25,
  });

  let date = new Date();
  let name = `${date.getTime()}-${studentName}`;
  // let name = `${studentName}`;
  const stream = fs.createWriteStream(`uploads/${name}-form.pdf`);
  const nt_call = await studentFormData(studentId, instituteId);
  const data = nt_call?.dt;
  const result = nt_call?.ft;
  const oneProfile = nt_call?.oneProfile;
  // console.log(oneProfile);
  doc.on("pageAdded", () => {
    drawBorder(doc);
  });

  doc.pipe(stream);

  const pageWidth = doc.page.width;
  await StudentAdmissionFormHeader(doc, doc.x, doc.y, pageWidth, data);
  drawBorder(doc);
  doc.moveDown(2);

  if (applicationName) {
    doc
      .fontSize(16)
      .font("Times-Bold")
      .fillColor("#121212")
      .text(`Admission Form For ${applicationName}`, {
        align: "center",
      });
  } else {
    doc
      .fontSize(16)
      .font("Times-Bold")
      .fillColor("#121212")
      .text(`Admission Form`, {
        align: "center",
      });
  }

  // const dmsfbs = ;
  // const dmsfbs = await fetchImage("f78c2409a4ea20dc4309df29ccaf52a2");

  let currentY = doc.y;
  doc.strokeColor("black").lineWidth(1);
  doc
    .moveTo(25, currentY + 10)
    .lineTo(pageWidth - 25, currentY + 10)
    .stroke();

  doc.x = 25;
  doc.moveDown(1.3);
  doc.fontSize(12);
  if (result?.length > 0) {
    for (let itr of result) {
      if (["documents"]?.includes(itr?.static_key)) {
      } else {
        doc.fontSize(12);
        doc.font("Times-Bold");
        doc.fillColor("#121212").text(`${itr?.key}: -`, 25);
        doc.moveDown();
        doc.fontSize(11);
        if (
          ["antiragging_affidavit", "undertakings"]?.includes(itr?.static_key)
        ) {
          if (itr?.fields?.[0]?.value) {
            doc.font("Times-Roman").text(`${itr?.fields?.[0]?.value ?? ""}`);
          }
        } else {
          if (itr?.static_key === "basic_details") {
            let yAxis = doc.y;
            let arr = [];
            let arrObj = {};

            for (let dt of itr?.fields) {
              if (
                [
                  "studentFirstName",
                  "studentFatherName",
                  "studentLastName",
                  "studentMiddleName",
                ]?.includes(dt?.form_checklist_key)
              ) {
                arrObj[dt?.form_checklist_key] = dt?.value;
              }
            }
            for (let dt of itr?.fields) {
              if (
                [
                  "studentFirstName",
                  "studentFatherName",
                  "studentLastName",
                  "studentMiddleName",
                ]?.includes(dt?.form_checklist_key)
              ) {
                if (dt?.form_checklist_key === "studentFirstName") {
                  arr.push({
                    ...dt,
                    form_checklist_name: "Name",
                    value: `${dt?.value}, ${arrObj["studentFatherName"]
                        ? `${arrObj["studentFatherName"]} `
                        : ""
                      }${arrObj["studentLastName"]
                        ? `${arrObj["studentLastName"]} `
                        : ""
                      }${arrObj["studentMiddleName"]
                        ? `${arrObj["studentMiddleName"]} `
                        : ""
                      }`,
                  });
                }
              } else {
                arr.push(dt);
              }
            }
            for (let i = 0; i < arr?.length; i++) {
              let ft = arr[i];
              // if (i < 4) {
              //   doc
              //     .fontSize(10)
              //     .font("Times-Bold")
              //     .fillColor("#121212")
              //     .text(`${ft?.form_checklist_name} :`, 25);
              //   if (ft?.value) {
              //     doc.moveUp(1);
              //     doc
              //       .fontSize(10)
              //       .font("Times-Roman")
              //       .fillColor("#2e2e2e")
              //       .text(`${ft?.value ?? ""}`, {
              //         indent:
              //           doc.widthOfString(`${ft?.form_checklist_name} :`) + 15,
              //       });
              //   }
              // }
              // // else if (i % 2 !== 0) {
              // //   doc.moveUp(1);
              // //   doc
              // //     .fontSize(10)
              // //     .font("Times-Bold")
              // //     .fillColor("#121212").text(`${ft?.form_checklist_name} :`, {
              // //     width: pageWidth / 2 + 80,
              // //     align: "right",
              // //   });
              // //   if (ft?.value) {
              // //     doc.moveDown(-1);
              // //     doc
              // //     .fontSize(10)
              // //     .font("Times-Roman")
              // //     .fillColor("#2e2e2e").text(
              // //       `${ft?.value ?? ""}`,

              // //       pageWidth / 2 + 112
              // //     );
              // //   }
              // // }
              // else {
              doc
                .fontSize(10)
                .font("Times-Bold")
                .fillColor("#121212")
                .text(`${ft?.form_checklist_name} :`, 25);
              if (ft?.value) {
                doc.moveUp(1);
                doc
                  .fontSize(10)
                  .font("Times-Roman")
                  .fillColor("#2e2e2e")
                  .text(`${ft?.value ?? ""}`, {
                    indent:
                      doc.widthOfString(`${ft?.form_checklist_name} :`) + 15,
                  });
              }
            }
            // }
            if (oneProfile?.studentProfilePhoto) {
              doc.image(
                await dynamicImages("CUSTOM", oneProfile?.studentProfilePhoto),
                pageWidth - 90,
                yAxis - 32,
                {
                  width: 65,
                  height: 65,
                  align: "right",
                }
              );
            }
          } else if (itr?.static_key === "contactDetails") {
            let arr = [];
            let arrObj = {};
            for (let dt of itr?.fields) {
              if (
                [
                  "studentCurrentAddress",
                  "studentCurrentPincode",
                  "studentCurrentState",
                  "studentCurrentDistrict",
                  "studentAddress",
                  "studentPincode",
                  "studentState",
                  "studentDistrict",
                ]?.includes(dt?.form_checklist_key)
              ) {
                arrObj[dt?.form_checklist_key] = dt?.value;
              }
            }
            for (let dt of itr?.fields) {
              if (
                [
                  "studentCurrentAddress",
                  "studentCurrentPincode",
                  "studentCurrentState",
                  "studentCurrentDistrict",
                ]?.includes(dt?.form_checklist_key)
              ) {
                if (dt?.form_checklist_key === "studentCurrentAddress") {
                  arr.push({
                    ...dt,
                    value: `${dt?.value}, ${arrObj["studentCurrentDistrict"]
                        ? `${arrObj["studentCurrentDistrict"]}, `
                        : ""
                      }${arrObj["studentCurrentState"]
                        ? `${arrObj["studentCurrentState"]}, `
                        : ""
                      }${arrObj["studentCurrentPincode"]
                        ? `${arrObj["studentCurrentPincode"]}, `
                        : ""
                      }`,
                  });
                }
              } else if (
                [
                  "studentAddress",
                  "studentPincode",
                  "studentState",
                  "studentDistrict",
                ]?.includes(dt?.form_checklist_key)
              ) {
                if (dt?.form_checklist_key === "studentAddress") {
                  arr.push({
                    ...dt,
                    value: `${dt?.value}, ${arrObj["studentDistrict"]
                        ? `${arrObj["studentDistrict"]}, `
                        : ""
                      }${arrObj["studentState"] ? `${arrObj["studentState"]}, ` : ""
                      }${arrObj["studentPincode"]
                        ? `${arrObj["studentPincode"]}, `
                        : ""
                      }`,
                  });
                }
              } else {
                arr.push(dt);
              }
            }
            for (let i = 0; i < arr?.length; i++) {
              let ft = arr[i];
              if (
                ["studentAddress", "studentCurrentAddress"]?.includes(
                  ft?.form_checklist_key
                )
              ) {
                doc
                  .fontSize(10)
                  .font("Times-Bold")
                  .fillColor("#121212")
                  .text(`${ft?.form_checklist_name} :`, 25);
                if (ft?.value) {
                  doc.moveUp(1);
                  doc
                    .fontSize(10)
                    .font("Times-Roman")
                    .fillColor("#2e2e2e")
                    .text(`${ft?.value ?? ""}`, {
                      indent:
                        doc.widthOfString(`${ft?.form_checklist_name} :`) + 15,
                    });
                }
              } else {
                if (i === 0) {
                  doc
                    .fontSize(10)
                    .font("Times-Bold")
                    .fillColor("#121212")
                    .text(`${ft?.form_checklist_name} :`, 25);
                  if (ft?.value) {
                    doc.moveUp(1);
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(`${ft?.value ?? ""}`, {
                        indent:
                          doc.widthOfString(`${ft?.form_checklist_name} :`) + 15,
                      });
                  }
                } else if (i % 2 !== 0) {
                  doc.moveUp(1);
                  doc;
                  doc
                    .fontSize(10)
                    .font("Times-Bold")
                    .fillColor("#121212")
                    .text(`${ft?.form_checklist_name} :`, {
                      width: pageWidth / 2 + 80,
                      align: "right",
                    });
                  if (ft?.value) {
                    doc.moveDown(-1);
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(
                        `${ft?.value ?? ""}`,

                        pageWidth / 2 + 112
                      );
                  }
                } else {
                  doc
                    .fontSize(10)
                    .font("Times-Bold")
                    .fillColor("#121212")
                    .text(`${ft?.form_checklist_name} :`, 25);
                  if (ft?.value) {
                    doc.moveUp(1);
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(`${ft?.value ?? ""}`, {
                        indent:
                          doc.widthOfString(`${ft?.form_checklist_name} :`) + 15,
                      });
                  }
                }
              }
            }
          } else {
            for (let i = 0; i < itr?.fields?.length; i++) {
              let ft = itr?.fields[i];
              if (i === 0) {
                doc
                  .fontSize(10)
                  .font("Times-Bold")
                  .fillColor("#121212")
                  .text(`${ft?.form_checklist_name} :`, 25);
                if (ft?.value) {
                  doc.moveUp(1);

                  doc
                    .fontSize(10)
                    .font("Times-Roman")
                    .fillColor("#2e2e2e")
                    .text(`${ft?.value ?? ""}`, {
                      indent:
                        doc.widthOfString(`${ft?.form_checklist_name} :`) + 15,
                    });
                }
              } else if (i % 2 !== 0) {
                doc.moveUp(1);
                doc
                  .fontSize(10)
                  .font("Times-Bold")
                  .fillColor("#121212")
                  .text(`${ft?.form_checklist_name} :`, {
                    // width: pageWidth / 2 + 80,
                    // align: "right",
                    width: pageWidth,
                    indent: pageWidth / 2,
                    align: "left",
                  });
                if (ft?.value) {
                  doc.moveDown(-1);
                  doc
                    .fontSize(10)
                    .font("Times-Roman")
                    .fillColor("#2e2e2e")
                    .text(
                      `${ft?.value ?? ""}`,
                      // {
                      //   width: pageWidth - 50,
                      //   indent:
                      //     pageWidth / 2 +
                      //     15 +
                      //     doc.widthOfString(`${ft?.form_checklist_name} :`),
                      //   align: "left",
                      // }
                      pageWidth / 2 +
                      38 +
                      doc.widthOfString(`${ft?.form_checklist_name} :`)
                      // {
                      //   width: pageWidth / 2 + 80,
                      //   indent: pageWidth / 2 + 82,
                      //   height: 50,
                      //   lineBreak: false,
                      //   // align: "right",
                      // }
                    );
                }
              } else {
                doc
                  .fontSize(10)
                  .font("Times-Bold")
                  .fillColor("#121212")
                  .text(`${ft?.form_checklist_name} :`, 25);
                if (ft?.value) {
                  doc.moveUp(1);
                  doc
                    .fontSize(10)
                    .font("Times-Roman")
                    .fillColor("#2e2e2e")
                    .text(`${ft?.value ?? ""}`, {
                      indent:
                        doc.widthOfString(`${ft?.form_checklist_name} :`) + 15,
                    });
                }
              }
            }
          }
        }

        doc
          .moveTo(25, doc.y + 10)
          .lineTo(pageWidth - 25, doc.y + 10)
          .stroke();
        doc.moveDown(1.3);
      }
    }
  }
  doc.moveDown(1);

  if (oneProfile?.student_signature) {
    doc.image(
      await dynamicImages("CUSTOM", oneProfile?.student_signature),
      pageWidth - 185,
      doc.y,
      {
        width: 160,
        height: 60,
        align: "right",
      }
    );
    doc.moveDown(1);
  }

  doc.font("Times-Bold").text("Signature of Candidate", 440, doc.y);
  doc.moveDown();
  doc.strokeColor("black").lineWidth(1);
  // doc.moveDown();
  doc
    .moveTo(25, doc.y)
    .lineTo(pageWidth - 25, doc.y)
    .stroke();
  doc.moveDown();

  doc.end();
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });
  // console.log(pageWidth);

  // Handle stream close event
  stream.on("finish", async () => {
    const student = await Student.findById({ _id: studentId })
    console.log("created");
    let file = {
      path: `uploads/${name}-form.pdf`,
      filename: `${name}-form.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    student.application_print.push({
      flow: "BACKEND",
      value: results?.Key,
      from: "false",
    })
    await unlinkFile(file.path);
    await student.save()
    // console.log("PDF created successfully", results.Key);
  });
};
module.exports = generateStudentAdmissionForm;

// district , state , pincode.
