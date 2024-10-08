const PDFDocument = require("pdfkit");
const studentFormData = require("../AjaxRequest/studentFormData");
const { uploadDocsFile } = require("../S3Configuration");
const StudentAdmissionFormHeader = require("../components/StudentAdmissionFormHeader");
const fs = require("fs");
const util = require("util");
const dynamicImages = require("../helper/dynamicImages");
const Student = require("../models/Student");
const unlinkFile = util.promisify(fs.unlink);
const path = require("path");

const {
  email_sms_designation_application_apply,
} = require("../WhatsAppSMS/payload");
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
  // console.log("studentId", studentId);

  // if (`${studentId}` === "666db5569b434b407b86282e") {
  //   return null;
  // }
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margin: 25,
  });
  let date = new Date();
  let name = `${studentName}-${date.getTime()}`;
  // let name = `${studentName}`;
  // const stream = fs.createWriteStream(`uploads/${studentName}-form.pdf`);

  const stream = fs.createWriteStream(`uploads/${name}-form.pdf`);
  const nt_call = await studentFormData(studentId, instituteId);
  const data = nt_call?.dt;
  const result = nt_call?.ft?.result;
  const add_last_page_images = nt_call?.ft?.img_content;
  const oneProfile = nt_call?.oneProfile;
  doc.on("pageAdded", () => {
    drawBorder(doc);
  });

  doc.pipe(stream);
  // console.log("oneProfile", result?.[0]);
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

  if (oneProfile?.form_no) {
    doc
      .fontSize(12)
      .font("Times-Bold")
      .fillColor("#121212")
      .text(
        `Form No.: ${oneProfile?.form_no}, Pay Id: ${
          oneProfile?.qviple_student_pay_id ?? ""
        }`,
        {
          align: "center",
        }
      );
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
      if (itr?.static_key === "selected_subjects") {
        if (itr?.fields?.length > 0) {
          doc.fontSize(12);
          doc.font("Times-Bold");
          doc.fillColor("#121212").text(`${itr?.key}: -`, 25);
          doc.moveDown(0.3);
          doc.fontSize(11);
          for (let i = 0; i < itr?.fields?.length; i++) {
            let ft = itr?.fields[i];
            doc
              .fontSize(10)
              .font("Times-Roman")
              .fillColor("#121212")
              .text(`${ft?.value}`, 25);
          }
          doc
            .moveTo(25, doc.y + 10)
            .lineTo(pageWidth - 25, doc.y + 10)
            .stroke();
          doc.moveDown(1.3);
        }
      } else {
        if (
          ["documents", "social_reservation_information_section"]?.includes(
            itr?.static_key
          )
        ) {
          doc.fontSize(12);
          doc.font("Times-Bold");
          doc.text(`${itr?.key}: -`, 25);
          doc.moveDown(0.3);
          doc.fontSize(11);
          let down_range = 11.53;
          doc
            .fontSize(10)
            .font("Times-Bold")
            .fillColor("#121212")
            // .text("On", 28, yt);
            .text("On", 28, doc.y);

          doc
            .fontSize(10)
            .font("Times-Bold")
            .fillColor("#121212")
            // .text("Off", 57, yt);
            .text("Off", 57, doc.y - down_range);
          doc
            .fontSize(10)
            .font("Times-Bold")
            .fillColor("#121212")
            // .text("On", pageWidth / 2 + 3, yt);
            .text("On", pageWidth / 2 + 3, doc.y - down_range);
          doc
            .fontSize(10)
            .font("Times-Bold")
            .fillColor("#121212")
            // .text("Off", pageWidth / 2 + 28, yt);
            .text("Off", pageWidth / 2 + 28, doc.y - down_range);
          for (let i = 0; i < itr?.fields?.length; i++) {
            let ft = itr?.fields[i];
            let inner_down_range = 20;
            if (i === 0) {
              if (doc.y + 20 > doc.page.height - 25) {
                doc.addPage();
              }
              if (ft?.value) {
                doc.image(path.join(__dirname, "./check.png"), 25, doc.y, {
                  width: 20,
                  height: 20,
                });
              } else {
                doc.image(path.join(__dirname, "./uncheck.png"), 25, doc.y, {
                  width: 20,
                  height: 20,
                });
              }
              doc.image(
                path.join(__dirname, "./uncheck.png"),
                55,
                doc.y - inner_down_range,
                {
                  width: 20,
                  height: 20,
                }
              );
              doc.y -= inner_down_range - 6;
              doc
                .fontSize(10)
                .font("Times-Bold")
                .fillColor("#121212")
                .text(`${ft?.form_checklist_name}`, 85, doc.y);
            } else if (i % 2 !== 0) {
              doc.y -= 17.53;
              if (ft?.value) {
                doc.image(
                  path.join(__dirname, "./check.png"),
                  pageWidth / 2,
                  doc.y,
                  {
                    width: 20,
                    height: 20,
                  }
                );
              } else {
                doc.image(
                  path.join(__dirname, "./uncheck.png"),
                  pageWidth / 2,
                  doc.y,
                  {
                    width: 20,
                    height: 20,
                  }
                );
              }
              doc.image(
                path.join(__dirname, "./uncheck.png"),
                pageWidth / 2 + 30,
                doc.y - inner_down_range,
                {
                  width: 20,
                  height: 20,
                }
              );
              doc.y -= inner_down_range - 6;
              doc
                .fontSize(10)
                .font("Times-Bold")
                .fillColor("#121212")
                .text(`${ft?.form_checklist_name}`, pageWidth / 2 + 60, doc.y);
            } else {
              doc.y += 6;
              if (doc.y + 20 > doc.page.height - 25) {
                doc.addPage();
              }
              if (ft?.value) {
                doc.image(path.join(__dirname, "./check.png"), 25, doc.y, {
                  width: 20,
                  height: 20,
                });
              } else {
                doc.image(path.join(__dirname, "./uncheck.png"), 25, doc.y, {
                  width: 20,
                  height: 20,
                });
              }
              doc.image(
                path.join(__dirname, "./uncheck.png"),
                55,
                doc.y - inner_down_range,
                {
                  width: 20,
                  height: 20,
                }
              );
              doc.y -= inner_down_range - 6;
              doc
                .fontSize(10)
                .font("Times-Bold")
                .fillColor("#121212")
                .text(`${ft?.form_checklist_name}`, 85, doc.y);
            }
          }
          doc
            .moveTo(25, doc.y + 10)
            .lineTo(pageWidth - 25, doc.y + 10)
            .stroke();
          doc.moveDown(1.3);
        } else {
          if (
            [
              "antiragging_affidavit",
              "undertakings",
              "antiragging_affidavit_parents",
            ]?.includes(itr?.static_key) ||
            ["UNDERTAKING"]?.includes(itr?.status)
          ) {
            if (itr?.static_key === "undertakings") {
              doc.addPage();
              doc.fontSize(12);
              doc.font("Times-Bold");
              doc.fillColor("#121212").text(`${itr?.key}: -`, 25);
              doc.moveDown(0.3);
              doc.fontSize(11);
              if (itr?.fields?.[0]?.value) {
                doc
                  .font("Times-Roman")
                  .text(`${itr?.fields?.[0]?.value ?? ""}`);
              }
              doc.moveDown(2);
              if (oneProfile?.student_signature) {
                let sig = await dynamicImages(
                  "CUSTOM",
                  oneProfile?.student_signature
                );
                if (sig) {
                  doc.image(sig, pageWidth - 185, doc.y, {
                    width: 160,
                    height: 60,
                    align: "right",
                  });
                  doc.moveDown(1);
                }
              }
              doc.font("Times-Bold").text("Signature of Candidate", 440, doc.y);

              doc.moveDown(6);
              doc.font("Times-Bold").text("Clerk", 55);
              doc.moveUp(1);
              doc.font("Times-Bold").text("Principal", 470, doc.y);
            }
            if (itr?.static_key === "antiragging_affidavit") {
              doc.addPage();

              doc.fontSize(12);
              doc.font("Times-Bold");
              doc.fillColor("#121212").text(`${itr?.key}: -`, 25);
              doc.moveDown(0.3);
              doc.fontSize(11);
              if (itr?.fields?.[0]?.value) {
                doc
                  .font("Times-Roman")
                  .text(`${itr?.fields?.[0]?.value ?? ""}`);
              }
              doc.moveDown(2);
              if (oneProfile?.student_signature) {
                let sig = await dynamicImages(
                  "CUSTOM",
                  oneProfile?.student_signature
                );
                if (sig) {
                  doc.image(sig, pageWidth - 185, doc.y, {
                    width: 160,
                    height: 60,
                    align: "right",
                  });
                  doc.moveDown(1);
                }
              }
              doc.font("Times-Bold").text("Signature of Candidate", 440, doc.y);
            }
            if (itr?.static_key === "antiragging_affidavit_parents") {
              doc.addPage();

              doc.fontSize(12);
              doc.font("Times-Bold");
              doc.fillColor("#121212").text(`${itr?.key}: -`, 25);
              doc.moveDown(0.3);
              doc.fontSize(11);
              if (itr?.fields?.[0]?.value) {
                doc
                  .font("Times-Roman")
                  .text(`${itr?.fields?.[0]?.value ?? ""}`);
              }
              doc.moveDown(2);
              if (oneProfile?.student_parents_signature) {
                let p_sig = await dynamicImages(
                  "CUSTOM",
                  oneProfile?.student_parents_signature
                );
                if (p_sig) {
                  doc.image(p_sig, pageWidth - 185, doc.y, {
                    width: 160,
                    height: 60,
                    align: "right",
                  });
                  doc.moveDown(1);
                }
              }
              doc.font("Times-Bold").text("Signature of Parent", 440, doc.y);
            }

            if (itr?.status === "UNDERTAKING") {
              doc.addPage();
              doc.fontSize(12);
              doc.font("Times-Bold");
              doc.fillColor("#121212").text(`${itr?.key}: -`, 25);
              doc.moveDown(0.3);
              doc.fontSize(11);
              if (itr?.fields?.[0]?.value) {
                doc
                  .font("Times-Roman")
                  .text(`${itr?.fields?.[0]?.value ?? ""}`);
              }
              doc.moveDown(2);
              if (itr?.type === "STUDENT") {
                if (oneProfile?.student_signature) {
                  let sig = await dynamicImages(
                    "CUSTOM",
                    oneProfile?.student_signature
                  );
                  if (sig) {
                    doc.image(sig, pageWidth - 185, doc.y, {
                      width: 160,
                      height: 60,
                      align: "right",
                    });
                    doc.moveDown(1);
                  }
                }
                doc
                  .font("Times-Bold")
                  .text("Signature of Candidate", 440, doc.y);

                doc.moveDown(6);
                doc.font("Times-Bold").text("Clerk", 55);
                doc.moveUp(1);
                doc.font("Times-Bold").text("Principal", 470, doc.y);
              } else if (itr?.type === "PARENTS") {
                if (oneProfile?.student_parents_signature) {
                  let p_sig = await dynamicImages(
                    "CUSTOM",
                    oneProfile?.student_parents_signature
                  );
                  if (p_sig) {
                    doc.image(p_sig, pageWidth - 185, doc.y, {
                      width: 160,
                      height: 60,
                      align: "right",
                    });
                    doc.moveDown(1);
                  }
                }
                doc.font("Times-Bold").text("Signature of Parent", 440, doc.y);
              } else if (itr?.type === "STUDENT_PARENTS") {
                let dty = doc.y;
                if (oneProfile?.student_parents_signature) {
                  let p_sig = await dynamicImages(
                    "CUSTOM",
                    oneProfile?.student_parents_signature
                  );
                  if (p_sig) {
                    doc.image(p_sig, 30, dty, {
                      width: 160,
                      height: 60,
                      align: "right",
                    });
                    doc.moveDown(1);
                  }
                }
                doc
                  .font("Times-Bold")
                  .text("Signature of Parent", 55, dty + 70);

                if (oneProfile?.student_signature) {
                  let p_sig = await dynamicImages(
                    "CUSTOM",
                    oneProfile?.student_signature
                  );
                  if (p_sig) {
                    doc.image(p_sig, pageWidth - 185, dty, {
                      width: 160,
                      height: 60,
                      align: "right",
                    });
                    doc.moveDown(1);
                  }
                }
                doc
                  .font("Times-Bold")
                  .text("Signature of Candidate", 440, dty + 70);

                doc.moveDown(6);
                doc.font("Times-Bold").text("Clerk", 55);
                doc.moveUp(1);
                doc.font("Times-Bold").text("Principal", 470, doc.y);
              } else {
              }
            }
          } else {
            doc.fontSize(12);
            doc.font("Times-Bold");
            doc.fillColor("#121212").text(`${itr?.key}: -`, 25);
            doc.moveDown(0.3);
            doc.fontSize(11);
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
                      value: `${
                        arrObj["studentLastName"]
                          ? `${arrObj["studentLastName"]} `
                          : ""
                      } ${dt?.value ?? ""} ${
                        arrObj["studentFatherName"]
                          ? `${arrObj["studentFatherName"]} `
                          : ""
                      }${
                        arrObj["studentMiddleName"]
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
                  .font("Times-Roman")
                  .fillColor("#121212")
                  .text(`${ft?.form_checklist_name} :`, 25);

                if (ft?.value) {
                  if (ft?.form_checklist_key === "studentDOB") {
                    doc.moveUp(1);
                    // doc
                    //   .fontSize(10)
                    //   .font("Times-Roman")
                    //   .fillColor("#2e2e2e")
                    //   .text(`${moment(ft?.value).format("DD/MM/yyyy")}`, {
                    //     indent:
                    //       doc.widthOfString(`${ft?.form_checklist_name} :`) +
                    //       15,
                    //   });
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(`${ft?.value}`, {
                        indent:
                          doc.widthOfString(`${ft?.form_checklist_name} :`) +
                          15,
                      });
                  } else if (ft?.form_checklist_key === "studentFirstName") {
                    doc.moveUp(1);
                    doc
                      .fontSize(10)
                      .font("Times-Bold")
                      .fillColor("#121212")
                      .text(`${ft?.value?.toUpperCase()}`, {
                        indent:
                          doc.widthOfString(`${ft?.form_checklist_name} :`) +
                          15,
                      });
                  } else {
                    doc.moveUp(1);
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(`${ft?.value ?? ""}`, {
                        indent:
                          doc.widthOfString(`${ft?.form_checklist_name} :`) +
                          15,
                      });
                  }
                }
              }
              // }

              // for student profile
              if (oneProfile?.studentIdProfilePhoto) {
                let pprf = await dynamicImages(
                  "CUSTOM",
                  // "C:/fakepath/IMG_20240627_113223.jpg"
                  oneProfile?.studentIdProfilePhoto
                );
                if (pprf) {
                  doc.image(pprf, pageWidth - 90, yAxis - 19, {
                    width: 65,
                    height: 65,
                    align: "right",
                  });
                }
              }
            } else if (itr?.static_key === "other_details") {
              for (let i = 0; i < itr?.fields?.length; i++) {
                let ft = itr?.fields[i];
                if (i === 0) {
                  doc
                    .fontSize(10)
                    .font("Times-Roman")
                    .fillColor("#121212")
                    .text(`${ft?.form_checklist_name} :`, 25);
                  if (ft?.form_checklist_typo === "FILE") {
                    doc.moveUp(1);
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(`${ft?.value ? "Yes" : "No"}`, {
                        indent:
                          doc.widthOfString(`${ft?.form_checklist_name} :`) +
                          15,
                      });
                  } else if (ft?.form_checklist_key === "studentCastCategory") {
                    if (ft?.value) {
                      doc.moveUp(1);

                      doc
                        .fontSize(10)
                        .font("Times-Bold")
                        .fillColor("#121212")
                        .text(`${ft?.value?.toUpperCase()}`, {
                          indent:
                            doc.widthOfString(`${ft?.form_checklist_name} :`) +
                            15,
                        });
                    }
                  } else {
                    if (ft?.value) {
                      doc.moveUp(1);

                      doc
                        .fontSize(10)
                        .font("Times-Roman")
                        .fillColor("#2e2e2e")
                        .text(`${ft?.value ?? ""}`, {
                          indent:
                            doc.widthOfString(`${ft?.form_checklist_name} :`) +
                            15,
                        });
                    }
                  }
                } else if (i % 2 !== 0) {
                  doc.moveUp(1);
                  doc
                    .fontSize(10)
                    .font("Times-Roman")
                    .fillColor("#121212")
                    .text(`${ft?.form_checklist_name} :`, {
                      // width: pageWidth / 2 + 80,
                      // align: "right",
                      width: pageWidth,
                      indent: pageWidth / 2,
                      align: "left",
                    });
                  if (ft?.form_checklist_typo === "FILE") {
                    doc.moveDown(-1);
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(
                        `${ft?.value ? "Yes" : "No"}`,
                        pageWidth / 2 +
                          38 +
                          doc.widthOfString(`${ft?.form_checklist_name} :`)
                      );
                  } else if (ft?.form_checklist_key === "studentCastCategory") {
                    if (ft?.value) {
                      doc.moveUp(1);

                      doc
                        .fontSize(10)
                        .font("Times-Bold")
                        .fillColor("#121212")
                        .text(
                          `${ft?.value?.toUpperCase()}`,
                          pageWidth / 2 +
                            38 +
                            doc.widthOfString(`${ft?.form_checklist_name} :`)
                        );
                    }
                  } else {
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
                  }
                } else {
                  doc
                    .fontSize(10)
                    .font("Times-Roman")
                    .fillColor("#121212")
                    .text(`${ft?.form_checklist_name} :`, 25);
                  if (ft?.form_checklist_typo === "FILE") {
                    doc.moveUp(1);
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(`${ft?.value ? "Yes" : "No"}`, {
                        indent:
                          doc.widthOfString(`${ft?.form_checklist_name} :`) +
                          15,
                      });
                  } else if (ft?.form_checklist_key === "studentCastCategory") {
                    if (ft?.value) {
                      doc.moveUp(1);

                      doc
                        .fontSize(10)
                        .font("Times-Bold")
                        .fillColor("#121212")
                        .text(`${ft?.value?.toUpperCase()}`, {
                          indent:
                            doc.widthOfString(`${ft?.form_checklist_name} :`) +
                            15,
                        });
                    }
                  } else {
                    if (ft?.value) {
                      doc.moveUp(1);
                      doc
                        .fontSize(10)
                        .font("Times-Roman")
                        .fillColor("#2e2e2e")
                        .text(`${ft?.value ?? ""}`, {
                          indent:
                            doc.widthOfString(`${ft?.form_checklist_name} :`) +
                            15,
                        });
                    }
                  }
                }
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
                      value: `${dt?.value}, ${
                        arrObj["studentCurrentDistrict"]
                          ? `${arrObj["studentCurrentDistrict"]}, `
                          : ""
                      }${
                        arrObj["studentCurrentState"]
                          ? `${arrObj["studentCurrentState"]}, `
                          : ""
                      }${
                        arrObj["studentCurrentPincode"]
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
                      value: `${dt?.value}, ${
                        arrObj["studentDistrict"]
                          ? `${arrObj["studentDistrict"]}, `
                          : ""
                      }${
                        arrObj["studentState"]
                          ? `${arrObj["studentState"]}, `
                          : ""
                      }${
                        arrObj["studentPincode"]
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
                    .font("Times-Roman")
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
                          doc.widthOfString(`${ft?.form_checklist_name} :`) +
                          15,
                      });
                  }
                } else {
                  if (i === 0) {
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
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
                            doc.widthOfString(`${ft?.form_checklist_name} :`) +
                            15,
                        });
                    }
                  } else if (i % 2 !== 0) {
                    doc.moveUp(1);
                    doc;
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
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
                      .font("Times-Roman")
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
                            doc.widthOfString(`${ft?.form_checklist_name} :`) +
                            15,
                        });
                    }
                  }
                }
              }
            } else if (itr?.static_key === "academic_details") {
              for (let i = 0; i < itr?.fields?.length; i++) {
                let ft = itr?.fields[i];
                doc
                  .fontSize(10)
                  .font("Times-Bold")
                  .fillColor("#121212")
                  .text(`${ft?.form_checklist_name}:`, 25);
                doc.moveDown(0.2);
                if (
                  [
                    "std_tenth_details",
                    "hsc_diploma",
                    "fyjc",
                    "fy_sem_I",
                    "fy_sem_II",
                    "sy_sem_III",
                    "sy_sem_IV",
                    "ty_sem_V",
                    "ty_sem_VI",
                    "msc_mcom",
                  ]?.includes(ft?.form_checklist_key)
                ) {
                  for (let j = 0; j < ft?.nested_form_checklist?.length; j++) {
                    let nested_field = ft?.nested_form_checklist[j];
                    if (j === 0) {
                      doc
                        .fontSize(10)
                        .font("Times-Roman")
                        .fillColor("#121212")
                        .text(
                          `${nested_field?.form_checklist_name}:${"     "}${
                            nested_field?.value
                          }`,
                          25
                        );
                    } else if (j % 2 !== 0) {
                      doc.moveUp(1);
                      doc
                        .fontSize(10)
                        .font("Times-Roman")
                        .fillColor("#121212")
                        .text(
                          `${nested_field?.form_checklist_name}:${"     "}${
                            nested_field?.value
                          }`,
                          {
                            width: pageWidth,
                            indent: pageWidth / 2,
                            align: "left",
                          }
                        );
                    } else {
                      doc
                        .fontSize(10)
                        .font("Times-Roman")
                        .fillColor("#121212")
                        .text(
                          `${nested_field?.form_checklist_name}:${"     "}${
                            nested_field?.value
                          }`,
                          25
                        );
                    }
                  }
                } else {
                  for (let j = 0; j < ft?.nested_form_checklist?.length; j++) {
                    let nested_field = ft?.nested_form_checklist[j];

                    doc
                      .fontSize(10)
                      .font("Times-Bold")
                      .fillColor("#121212")
                      .text(`${nested_field?.form_checklist_name}:`, 25);
                    doc.moveDown(0.2);

                    for (
                      let k = 0;
                      k < nested_field?.nested_form_checklist_nested?.length;
                      k++
                    ) {
                      let nested_field_nested =
                        nested_field?.nested_form_checklist_nested[k];
                      if (k === 0) {
                        doc
                          .fontSize(10)
                          .font("Times-Roman")
                          .fillColor("#121212")
                          .text(
                            `${
                              nested_field_nested?.form_checklist_name
                            }:${"     "}${nested_field_nested?.value}`,
                            25
                          );
                      } else if (k % 2 !== 0) {
                        doc.moveUp(1);
                        doc
                          .fontSize(10)
                          .font("Times-Roman")
                          .fillColor("#121212")
                          .text(
                            `${
                              nested_field_nested?.form_checklist_name
                            }:${"     "}${nested_field_nested?.value}`,
                            {
                              width: pageWidth,
                              indent: pageWidth / 2,
                              align: "left",
                            }
                          );
                      } else {
                        doc
                          .fontSize(10)
                          .font("Times-Roman")
                          .fillColor("#121212")
                          .text(
                            `${
                              nested_field_nested?.form_checklist_name
                            }:${"     "}${nested_field_nested?.value}`,
                            25
                          );
                      }
                    }
                    doc.moveDown(0.7);
                  }
                }

                doc.moveDown(1);
              }
            } else {
              for (let i = 0; i < itr?.fields?.length; i++) {
                let ft = itr?.fields[i];
                if (i === 0) {
                  doc
                    .fontSize(10)
                    .font("Times-Roman")
                    .fillColor("#121212")
                    .text(`${ft?.form_checklist_name} :`, 25);
                  if (ft?.form_checklist_typo === "FILE") {
                    doc.moveUp(1);
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(`${ft?.value ? "Yes" : "No"}`, {
                        indent:
                          doc.widthOfString(`${ft?.form_checklist_name} :`) +
                          15,
                      });
                  } else {
                    if (ft?.value) {
                      doc.moveUp(1);

                      doc
                        .fontSize(10)
                        .font("Times-Roman")
                        .fillColor("#2e2e2e")
                        .text(`${ft?.value ?? ""}`, {
                          indent:
                            doc.widthOfString(`${ft?.form_checklist_name} :`) +
                            15,
                        });
                    }
                  }
                } else if (i % 2 !== 0) {
                  doc.moveUp(1);
                  doc
                    .fontSize(10)
                    .font("Times-Roman")
                    .fillColor("#121212")
                    .text(`${ft?.form_checklist_name} :`, {
                      // width: pageWidth / 2 + 80,
                      // align: "right",
                      width: pageWidth,
                      indent: pageWidth / 2,
                      align: "left",
                    });
                  if (ft?.form_checklist_typo === "FILE") {
                    doc.moveDown(-1);
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(
                        `${ft?.value ? "Yes" : "No"}`,
                        pageWidth / 2 +
                          38 +
                          doc.widthOfString(`${ft?.form_checklist_name} :`)
                      );
                  } else {
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
                  }
                } else {
                  doc
                    .fontSize(10)
                    .font("Times-Roman")
                    .fillColor("#121212")
                    .text(`${ft?.form_checklist_name} :`, 25);
                  if (ft?.form_checklist_typo === "FILE") {
                    doc.moveUp(1);
                    doc
                      .fontSize(10)
                      .font("Times-Roman")
                      .fillColor("#2e2e2e")
                      .text(`${ft?.value ? "Yes" : "No"}`, {
                        indent:
                          doc.widthOfString(`${ft?.form_checklist_name} :`) +
                          15,
                      });
                  } else {
                    if (ft?.value) {
                      doc.moveUp(1);
                      doc
                        .fontSize(10)
                        .font("Times-Roman")
                        .fillColor("#2e2e2e")
                        .text(`${ft?.value ?? ""}`, {
                          indent:
                            doc.widthOfString(`${ft?.form_checklist_name} :`) +
                            15,
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
    }
  }
  // console.log("add_last_page_images", add_last_page_images);
  if (add_last_page_images?.length > 0) {
    for (let dft of add_last_page_images) {
      doc.addPage();
      if (dft?.attach) {
        let dfgt = await dynamicImages("CUSTOM", dft?.attach);
        if (dfgt) {
          doc.image(dfgt, {
            width: 545.28,
            height: 790.89,
          });
        }
      }
    }
  }

  doc.moveDown();

  doc.end();
  stream.on("error", (err) => {
    console.error("Error creating PDF:", err);
  });
  // console.log(pageWidth);

  // Handle stream close event
  stream.on("finish", async () => {
    const student = await Student.findById({ _id: studentId }).populate({
      path: "user",
      select: "userEmail userPhoneNumber",
    });
    // console.log("created");
    let file = {
      path: `uploads/${name}-form.pdf`,
      filename: `${name}-form.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    // student.application_print = [];
    student.application_print.push({
      flow: "BACKEND",
      value: results?.Key,
      from: "false",
    });
    await unlinkFile(file.path);
    await student.save();
    let names = `${student?.studentFirstName} ${
      student?.studentMiddleName
        ? student?.studentMiddleName
        : student?.studentFatherName ?? ""
    } ${student?.studentLastName}`;

    if (student?.studentEmail) {
      let login = student?.user?.userPhoneNumber
        ? student?.user?.userPhoneNumber
        : student?.user?.userEmail ?? "";
      email_sms_designation_application_apply(
        student?.studentEmail,
        names,
        applicationName,
        login,
        results?.Key
      );
    }
    // console.log("PDF created successfully", results.Key);
  });
};
module.exports = generateStudentAdmissionForm;
