const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const dynamicImages = require("../helper/dynamicImages");
const { uploadDocsFile } = require("../S3Configuration");
const util = require("util");
const admissionIntakeReportData = require("../AjaxRequest/admissionIntakeReportData");
const Admission = require("../models/Admission/Admission");
const Batch = require("../models/Batch");
const unlinkFile = util.promisify(fs.unlink);
const moment = require("moment");
const admissionIntakeReport = async (admissionId, batchId) => {
  const doc = new PDFDocument({
    font: "Times-Roman",
    size: [841.89, 595.28],
    margins: { top: 20, bottom: 20, left: 20, right: 20 },
  });
  const result = await admissionIntakeReportData(admissionId, batchId);

  const instituteData = result?.dt?.ads_admin;
  const data_args = result?.dt?.data_set;
  const data_batch = result?.dt?.batch;

  let date = new Date();
  let stu_name = `${instituteData?.name}`;
  // const stream = fs.createWriteStream(
  //   `./uploads/${stu_name}-admission-intake.pdf`
  // );

  let name = `${stu_name}-${date.getTime()}`;
  const stream = fs.createWriteStream(`./uploads/${name}-admission-intake.pdf`);

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
    doc.lineWidth(0);
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
    doc.lineWidth(0);
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
  doc.moveDown(1);

  doc
    .fontSize(16)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`ADMITTED STUDENT RECORD`, {
      align: "center",
    });
  if (data_batch) {
    doc
      .fontSize(16)
      .font("Times-Bold")
      .fillColor("#121212")
      .text(`${data_batch}`, {
        align: "center",
      });
  }
  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .font("Times-Bold")
    .fillColor("#121212")
    .text(`Date: ${moment()?.format("DD/MM/yyyy")}`);
  doc.moveDown(0.5);

  // if (data_batch?.insAffiliated) {
  //   doc
  //     .fontSize(16)
  //     .font("Times-Bold")
  //     .fillColor("#121212")
  //     .text(`${instituteData?.insAffiliated}`, {
  //       align: "center",
  //     });
  // }

  let total_obj = {
    sr_number: "",
    course_status: "",
    total_intake: 0,
    cap_intake: 0,
    il_intake: 0,
    ad_th_cap: 0,
    ad_th_ag_cap: 0,
    ad_th_il: 0,
    ad_th_ews: 0,
    ad_th_tfws: 0,
    grand_total: 0,
  };

  let data_args_modify = [];
  data_args_modify.push({
    sr_number: "Sr.No",
    course_status: "Course Status",
    total_intake: "Total Intake For",
    cap_intake: "CAP Seats",
    il_intake: "IL Seats",
    ad_th_cap: "Admitted Through CAP Student",
    ad_th_ag_cap: "Admitted Through AGAINST CAP Student",
    ad_th_il: "Admitted Through IL Student",
    ad_th_ews: "Admitted Through EWS Student",
    ad_th_tfws: "Admitted Through TFWS Student",
    grand_total: "Grand Total",
  });
  for (let i = 0; i < data_args?.length; i++) {
    let dfg = data_args[i];
    if (dfg?.name) {
      data_args_modify.push({
        sr_number: i + 1,
        course_status: dfg?.name,
        total_intake: dfg?.value?.total_intake ?? 0,
        cap_intake: dfg?.value?.cap_intake ?? 0,
        il_intake: dfg?.value?.il_intake ?? 0,
        ad_th_cap: dfg?.value?.ad_th_cap ?? 0,
        ad_th_ag_cap: dfg?.value?.ad_th_ag_cap ?? 0,
        ad_th_il: dfg?.value?.ad_th_il ?? 0,
        ad_th_ews: dfg?.value?.ad_th_ews ?? 0,
        ad_th_tfws: dfg?.value?.ad_th_tfws ?? 0,
        grand_total: dfg?.value?.grand_total ?? 0,
      });

      total_obj.total_intake += dfg?.value?.total_intake ?? 0;
      total_obj.cap_intake += dfg?.value?.cap_intake ?? 0;
      total_obj.il_intake += dfg?.value?.il_intake ?? 0;
      total_obj.ad_th_cap += dfg?.value?.ad_th_cap ?? 0;
      total_obj.ad_th_ag_cap += dfg?.value?.ad_th_ag_cap ?? 0;
      total_obj.ad_th_il += dfg?.value?.ad_th_il ?? 0;
      total_obj.ad_th_ews += dfg?.value?.ad_th_ews ?? 0;
      total_obj.ad_th_tfws += dfg?.value?.ad_th_tfws ?? 0;
      total_obj.grand_total += dfg?.value?.grand_total ?? 0;
    }
  }
  data_args_modify.push(total_obj);

  const table = {
    headers: [
      {
        label: "Sr.No",
        property: "sr_number",
        width: 35,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "Course Status",
        property: "course_status",
        width: 170,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "left",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "Total Intake For",
        property: "total_intake",
        width: 66,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "CAP Seats",
        property: "cap_intake",
        width: 66,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "IL Seats",
        property: "il_intake",
        width: 66,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "Admitted Through CAP Student",
        property: "ad_th_cap",
        width: 66,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "Admitted Through AGAINST CAP Student",
        property: "ad_th_ag_cap",
        width: 66,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "Admitted Through IL Student",
        property: "ad_th_il",
        width: 66,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "Admitted Through EWS Student",
        property: "ad_th_ews",
        width: 66,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "Admitted Through TFWS Student",
        property: "ad_th_tfws",
        width: 66,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
      {
        label: "Grand Total",
        property: "grand_total",
        width: 66,
        render: null,
        // headerColor: "#ffffff",
        // headerOpacity: 0.5,
        align: "center",
        valign: "center",
        padding: [0, 5, 0, 5],
      },
    ],

    datas: data_args_modify,
  };

  // Draw the table on the current page
  doc.table(table, {
    prepareHeader: () => doc.font("Times-Bold").fontSize(10),
    hideHeader: true,
    prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
      // console.log("indexRow", indexRow);
      if (indexRow === 0 || indexRow === data_args_modify?.length - 1) {
        doc.font("Times-Bold").fontSize(10);
      } else {
        doc.font("Times-Roman").fontSize(10);
      }
      // doc.addBackground(rectCell, "#a1a1a1", 0);
      doc
        .rect(
          rectCell?.x ?? 0,
          rectCell?.y ?? 0,
          rectCell?.width ?? 0,
          rectCell?.height ?? 0
        )
        .fillOpacity(0)
        .fillAndStroke("red", "black")
        .fillColor("black", 1);

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
    const ads_admin = await Admission.findById({ _id: admissionId });
    const batch = await Batch.findById({ _id: batchId });
    let file = {
      path: `uploads/${name}-admission-intake.pdf`,
      filename: `${name}-admission-intake.pdf`,
      mimetype: "application/pdf",
    };
    const results = await uploadDocsFile(file);
    ads_admin.admission_intake_set.push({
      excel_file: results?.Key,
      excel_file_name: `${name}-admission-intake.pdf`,
      batch: batch?.batchName,
    });
    // await unlinkFile(file.path);
    await ads_admin.save();
  });

  //   console.log(data);
};
module.exports = admissionIntakeReport;
