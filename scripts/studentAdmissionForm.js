const PDFDocument = require("pdfkit");
const studentFormData = require("../AjaxRequest/studentFormData");
const { uploadDocsFile } = require("../S3Configuration");
const StudentAdmissionFormHeader = require("../components/StudentAdmissionFormHeader");
const fs = require("fs");
const util = require("util");
const dynamicImages = require("../helper/dynamicImages");
const cdnDynamicImages = require("../helper/cdnDynamicImages");
const Student = require("../models/Student");
const unlinkFile = util.promisify(fs.unlink);
const moment = require("moment");
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
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: "A4",
    margin: 25,
  });

  let date = new Date();
  let name = `${date.getTime()}-${studentName}`;
  // let name = `${studentName}`;
  // const stream = fs.createWriteStream(`uploads/${studentName}-form.pdf`);

  const stream = fs.createWriteStream(`uploads/${name}-form.pdf`);
  const nt_call = await studentFormData(studentId, instituteId);
  const data = nt_call?.dt;
  const result = nt_call?.ft;
  const oneProfile = nt_call?.oneProfile;
  // console.log(result?.[0]);
  doc.on("pageAdded", () => {
    drawBorder(doc);
  });

  doc.pipe(stream);
  // console.log("oneProfile", oneProfile);
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
      .text(`Form No.: ${oneProfile?.form_no}`, {
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

          let yt = doc.y;
          doc
            .fontSize(10)
            .font("Times-Bold")
            .fillColor("#121212")
            .text("On", 28, yt);

          doc
            .fontSize(10)
            .font("Times-Bold")
            .fillColor("#121212")
            .text("Off", 57, yt);

          // doc.y -= 5;
          doc
            .fontSize(10)
            .font("Times-Bold")
            .fillColor("#121212")
            .text("On", pageWidth / 2 + 3, yt);

          doc
            .fontSize(10)
            .font("Times-Bold")
            .fillColor("#121212")
            .text("Off", pageWidth / 2 + 28, yt);

          for (let i = 0; i < itr?.fields?.length; i++) {
            let ft = itr?.fields[i];
            if (i === 0) {
              let sc_y = doc.y;
              if (ft?.value) {
                doc.image(
                  await cdnDynamicImages("CUSTOM", "check.png"),
                  25,
                  sc_y,
                  {
                    width: 20,
                    height: 20,
                  }
                );
              } else {
                doc.image(
                  await cdnDynamicImages("CUSTOM", "uncheck.png"),
                  25,
                  sc_y,
                  {
                    width: 20,
                    height: 20,
                  }
                );
              }
              // doc.y -= 20;
              doc.image(
                await cdnDynamicImages("CUSTOM", "uncheck.png"),
                55,
                sc_y,
                {
                  width: 20,
                  height: 20,
                }
              );

              // doc.y -= 12;
              doc
                .fontSize(10)
                .font("Times-Bold")
                .fillColor("#121212")
                .text(`${ft?.form_checklist_name}`, 85, sc_y + 6);
            } else if (i % 2 !== 0) {
              doc.moveUp(1);
              let sc_y = doc.y;

              // doc.y -= 8;
              if (ft?.value) {
                doc.image(
                  await cdnDynamicImages("CUSTOM", "check.png"),
                  pageWidth / 2,
                  sc_y,
                  {
                    width: 20,
                    height: 20,
                  }
                );
              } else {
                doc.image(
                  await cdnDynamicImages("CUSTOM", "uncheck.png"),
                  pageWidth / 2,
                  sc_y,
                  {
                    width: 20,
                    height: 20,
                  }
                );
              }
              // doc.y -= 20;
              doc.image(
                await cdnDynamicImages("CUSTOM", "uncheck.png"),
                pageWidth / 2 + 30,
                sc_y,
                {
                  width: 20,
                  height: 20,
                }
              );
              // doc.y -= 12;
              doc
                .fontSize(10)
                .font("Times-Bold")
                .fillColor("#121212")
                .text(
                  `${ft?.form_checklist_name}`,
                  pageWidth / 2 + 60,
                  sc_y + 6
                  // {
                  //   width: pageWidth,
                  //   indent: pageWidth / 2 - 25,
                  //   height: sc_y + 6,
                  // }
                );

              // doc.y += 8;
            } else {
              let sc_y = doc.y;

              if (ft?.value) {
                doc.image(
                  await cdnDynamicImages("CUSTOM", "check.png"),
                  25,
                  sc_y,
                  {
                    width: 20,
                    height: 20,
                  }
                );
              } else {
                doc.image(
                  await cdnDynamicImages("CUSTOM", "uncheck.png"),
                  25,
                  sc_y,
                  {
                    width: 20,
                    height: 20,
                  }
                );
              }
              // doc.y -= 20;
              doc.image(
                await cdnDynamicImages("CUSTOM", "uncheck.png"),
                55,
                sc_y,
                {
                  width: 20,
                  height: 20,
                }
              );
              // doc.y -= 12;
              doc
                .fontSize(10)
                .font("Times-Bold")
                .fillColor("#121212")
                .text(`${ft?.form_checklist_name}`, 85, sc_y + 6);
            }
          }
          doc
            .moveTo(25, doc.y + 10)
            .lineTo(pageWidth - 25, doc.y + 10)
            .stroke();
          doc.moveDown(1.3);
        } else {
          if (
            ["antiragging_affidavit", "undertakings"]?.includes(itr?.static_key)
          ) {
            if (itr?.static_key === "undertakings") {
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
                      value: `${dt?.value} ${
                        arrObj["studentFatherName"]
                          ? `${arrObj["studentFatherName"]} `
                          : ""
                      }${
                        arrObj["studentLastName"]
                          ? `${arrObj["studentLastName"]} `
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
                doc.image(
                  await dynamicImages(
                    "CUSTOM",
                    oneProfile?.studentIdProfilePhoto
                  ),
                  pageWidth - 90,
                  yAxis - 19,
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
  // doc.moveDown(2);

  // if (oneProfile?.student_signature) {
  //   doc.image(
  //     await dynamicImages("CUSTOM", oneProfile?.student_signature),
  //     pageWidth - 185,
  //     doc.y,
  //     {
  //       width: 160,
  //       height: 60,
  //       align: "right",
  //     }
  //   );
  //   doc.moveDown(1);
  // }

  // doc.font("Times-Bold").text("Signature of Candidate", 440, doc.y);
  doc.moveDown();
  // doc.strokeColor("black").lineWidth(1);
  // // doc.moveDown();
  // doc
  //   .moveTo(25, doc.y)
  //   .lineTo(pageWidth - 25, doc.y)
  //   .stroke();
  // doc.moveDown();

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

