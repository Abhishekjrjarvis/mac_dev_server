const xlsx = require("xlsx");
const fs = require("fs");
const Admission = require("../models/Admission/Admission");
const InstituteAdmin = require("../models/InstituteAdmin");
const Finance = require("../models/Finance");
const Hostel = require("../models/Hostel/hostel");
const NewApplication = require("../models/Admission/NewApplication");
const { uploadExcelFile } = require("../S3Configuration");
const RePay = require("../models/Return/RePay");

exports.json_to_excel_query = async (
  data_query,
  all_depart,
  batch_status,
  category,
  gender,
  is_all,
  aid
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Student");
    var name = `${all_depart}-${batch_status}-${category ?? "NA"}-${
      gender ?? "NA"
    }-${
      is_all ? "All" : "Pending"
    }-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ads_admin = await Admission.findById({ _id: aid });
    ads_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
    });
    ads_admin.export_collection_count += 1;
    await ads_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.transaction_json_to_excel_query = async (
  data_query,
  flow,
  access,
  id
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Transaction History");
    var name = `${flow}-${access}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ins_admin = await InstituteAdmin.findById({ _id: id });
    ins_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
    });
    ins_admin.export_collection_count += 1;
    await ins_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.scholar_transaction_json_to_excel_query = async (
  data_query,
  flow,
  access,
  id
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Transaction History");
    var name = `${flow}-${access}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ins_admin = await InstituteAdmin.findById({ _id: id });
    ins_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
      excel_val: "Scholarship"
    });
    ins_admin.export_collection_count += 1;
    await ins_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.fee_heads_json_to_excel_query = async (
  data_query,
  structure,
  category,
  fid
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Fee Heads");
    var name = `${structure}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const finance = await Finance.findById({ _id: fid });
    const ins_admin = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    ins_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
    });
    ins_admin.export_collection_count += 1;
    await ins_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.fee_heads_receipt_json_to_excel_query = async (
  data_query,
  insName,
  id
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Fee Receipt Heads");
    var name = `${insName}-receipt-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ins_admin = await InstituteAdmin.findById({
      _id: id,
    });
    ins_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
    });
    ins_admin.export_collection_count += 1;
    await ins_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_hostel_application_query = async (
  data_query,
  app_name,
  unit_name,
  appId,
  flow
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "HostelApplications");
    var name = `${unit_name}-${app_name}-${flow}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const apply = await NewApplication.findById({ _id: appId });
    const hostel_admin = await Hostel.findById({
      _id: `${apply?.applicationHostel}`,
    });
    hostel_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
    });
    hostel_admin.export_collection_count += 1;
    await hostel_admin.save();

    return {
      back: true,
    };
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_admission_application_query = async (
  data_query,
  app_name,
  appId,
  flow
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "HostelApplications");
    var name = `${app_name}-${flow}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const apply = await NewApplication.findById({ _id: appId });
    if (apply?.applicationHostel) {
      const hostel_admin = await Hostel.findById({
        _id: `${apply?.applicationHostel}`,
      });
      hostel_admin.export_collection.push({
        excel_file: results,
        excel_file_name: name,
      });
      hostel_admin.export_collection_count += 1;
      await hostel_admin.save();
    } else {
      const ads_admin = await Admission.findById({
        _id: `${apply?.admissionAdmin}`,
      });
      ads_admin.export_collection.push({
        excel_file: results,
        excel_file_name: name,
      });
      ads_admin.export_collection_count += 1;
      await ads_admin.save();
    }
    return {
      back: true,
    };
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_hostel_query = async (
  data_query,
  all_depart,
  category,
  gender,
  is_all,
  aid
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "HostelStudent");
    var name = `${all_depart}-${category ?? "NA"}-${gender ?? "NA"}-${
      is_all ? "All" : "Pending"
    }-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ads_admin = await Hostel.findById({ _id: aid });
    ads_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
    });
    ads_admin.export_collection_count += 1;
    await ads_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.fee_heads_receipt_json_to_excel_repay_query = async (
  data_query,
  insName,
  rid
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(
      real_book,
      real_sheet,
      "Settlement Fee Receipt Heads"
    );
    var name = `${insName}-receipt-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const repay = await RePay.findById({ _id: rid });
    repay.excel_attach = results;
    await repay.save();
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_normal_student_promote_query= async (
  data_query,
  id,
  className,
  flow
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(
      real_book,
      real_sheet,
      `${flow}Students`
    );
    var name = `${flow}-${className}-receipt-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);
    const valid_ins = await InstituteAdmin.findById({ _id: id})
    valid_ins.student_export_collection.push({
      excel_file: results,
      excel_file_name: name,
    });
    valid_ins.student_export_collection_count += 1;
    await valid_ins.save();
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_statistics_promote_query= async (
  data_query,
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(
      real_book,
      real_sheet,
      `Statistics Data`
    );
    var name = `statistics-receipt-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);
    return results
    // const valid_ins = await InstituteAdmin.findById({ _id: id})
    // valid_ins.student_export_collection.push({
    //   excel_file: results,
    //   excel_file_name: name,
    // });
    // valid_ins.student_export_collection_count += 1;
    // await valid_ins.save();
  } catch (e) {
    console.log(e);
  }
};

exports.setoff_json_to_excel_query = async (
  data_query,
  flow,
  id
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Set Off List");
    var name = `${flow}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ins_admin = await InstituteAdmin.findById({ _id: id });
    ins_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
    });
    ins_admin.export_collection_count += 1;
    await ins_admin.save();
    return results
  } catch (e) {
    console.log(e);
  }
};

exports.internal_fee_heads_receipt_json_to_excel_query = async (
  data_query,
  insName,
  id
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Internal Fee Receipt Heads");
    var name = `Internal-${insName}-receipt-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ins_admin = await InstituteAdmin.findById({
      _id: id,
    });
    ins_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
    });
    ins_admin.export_collection_count += 1;
    await ins_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.mismatch_scholar_transaction_json_to_excel_query = async (
  data_query,
  flow,
  id
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Mismatch Scholarship");
    var name = `${flow}-${access}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ins_admin = await InstituteAdmin.findById({ _id: id });
    ins_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
      excel_val: "Mismatch_Scholarship"
    });
    ins_admin.export_collection_count += 1;
    await ins_admin.save();
  } catch (e) {
    console.log(e);
  }
};