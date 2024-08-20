const xlsx = require("xlsx");
const fs = require("fs");
const Admission = require("../models/Admission/Admission");
const InstituteAdmin = require("../models/InstituteAdmin");
const Finance = require("../models/Finance");
const Hostel = require("../models/Hostel/hostel");
const NewApplication = require("../models/Admission/NewApplication");
const { uploadExcelFile } = require("../S3Configuration");
const RePay = require("../models/Return/RePay");
const Library = require("../models/Library/Library");
const DayBook = require("../models/Finance/DayBook");
const { custom_date_time_reverse } = require("../helper/dayTimer");
const Mentor = require("../models/MentorMentee/mentor");
const StudentFeedback = require("../models/StudentFeedback/StudentFeedback");
const Subject = require("../models/Subject");
const BankAccount = require("../models/Finance/BankAccount");
const SubjectInternalEvaluation = require("../models/InternalEvaluation/SubjectInternalEvaluation");



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
    console.log("Enter")
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
  id,
  bank,
  from,
  to
) => {
  try {
    console.log("BANK", bank)
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Fee Receipt Heads");
    var name = `${insName}-receipt-${new Date().getHours()}-${new Date().getMinutes()}`;
    if (bank) {
      const bank_acc = await BankAccount.findById({ _id: bank })
      var name = `${bank_acc?.finance_bank_account_name}-${from}-To-${to}-receipt-${new Date().getHours()}-${new Date().getMinutes()}`;
    }
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
    console.log("GEN")
    return results
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
    const apply = await NewApplication.findById({ _id: appId });
    var sheet_name;
    if (apply?.applicationHostel) {
      sheet_name = "Hostel Application Students"
    }
    else {
      sheet_name = "Admission Application Students"
    }
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, sheet_name);
    // let apps_name = "Allotted Subject"
    var name = `${app_name}-${flow}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

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
  rid,
  excel_file
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
    repay.excel_attach = excel_file;
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
  id,
  excel_sheet_name
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Mismatch Scholarship");
    var name = `${flow}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ins_admin = await InstituteAdmin.findById({ _id: id });
    ins_admin.export_collection.push({
      excel_file: results,
      excel_file_name: excel_sheet_name, //name,
      excel_val: "Mismatch_Scholarship"
    });
    ins_admin.export_collection_count += 1;
    await ins_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.library_json_to_excel = async (
  lid,
  list,
  sheetName,
  excelType,
  exportTypeName
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(list);

    xlsx.utils.book_append_sheet(real_book, real_sheet, sheetName);
    var name = `library-${exportTypeName}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const library = await Library.findById(lid);
    library.export_collection.push({
      excel_type: excelType,
      excel_file: results,
      excel_file_name: name,
    });
    library.export_collection_count += 1;
    await library.save();
  } catch (e) {
    console.log(e);
  }
};

exports.excess_refund_fees_json_query = async (
  data_query,
  flow,
  id,
  s_name,
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, `${s_name}`);
    var name = `${flow}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ins_admin = await Admission.findById({ _id: id });
    ins_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
      excel_val: `${flow}`
    });
    ins_admin.export_collection_count += 1;
    await ins_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.certificate_json_query = async (
  data_query,
  flow,
  id,
  s_name,
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, `${s_name}`);
    var name = `${flow}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const ins_admin = await InstituteAdmin.findById({ _id: id });
    ins_admin.export_collection.push({
      excel_file: results,
      excel_file_name: name,
      excel_val: `Certificate`
    });
    ins_admin.export_collection_count += 1;
    await ins_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_structure_code_query = async (
  d_name,
  data_query,
) => {
  try {
    var s_name = d_name?.split(" ")
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(
      real_book,
      real_sheet,
      `${s_name[0]} Structures List`
    );
    var name = `${s_name[0]}-structure-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);
    return results
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_timetable_export_query = async (
  d_name,
  data_query,
) => {
  try {
    var s_name = d_name?.split(" ")
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(
      real_book,
      real_sheet,
      `${s_name?.[0]} Timetable List`
    );
    var name = `${s_name?.[0]}-timetable-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);
    return results
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_non_applicable_fees_export_query = async (
  category,
  data_query,
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(
      real_book,
      real_sheet,
      `${category} Non Applicable Fees List`
    );
    var name = `${category}-Non-Applicable-Fees-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);
    return results
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_deposit_export_query = async (
  flow,
  data_query,
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(
      real_book,
      real_sheet,
      `${flow} List`
    );
    var name = `${flow}-List-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);
    return results
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_slip_export_query = async (
  flow,
  data_query,
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(
      real_book,
      real_sheet,
      `${flow} List`
    );
    var name = `${flow}-List-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);
    return results
  } catch (e) {
    console.log(e);
  }
};

exports.fee_heads_receipt_json_to_excel_daybook_query = async (
  data_query,
  dbid,
  status
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);
 var date = custom_date_time_reverse(1)
    xlsx.utils.book_append_sheet(
      real_book,
      real_sheet,
      `${date} DayBook`
    );
    var name = `${date}-DayBook-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const db = await DayBook.findById({ _id: dbid });
    db.db_file = results;
    db.db_file_type = `${status}`
    await db.save();
  } catch (e) {
    console.log(e);
  }
};

exports.mentor_json_to_excel = async (
  id,
  list,
  sheetName,
  excelType,
  exportTypeName
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(list);

    xlsx.utils.book_append_sheet(real_book, real_sheet, sheetName);
    var name = `mentor-${exportTypeName}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const mentor = await Mentor.findById(id);
    mentor.export_collection.push({
      excel_type: excelType,
      excel_file: results,
      excel_file_name: name,
    });
    mentor.export_collection_count += 1;
    await mentor.save();
  } catch (e) {
    console.log(e);
  }
};

exports.department_feedback_json_to_excel = async (
  id,
  list,
  sheetName,
  excelType,
  exportTypeName,
  departmentId
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(list);

    xlsx.utils.book_append_sheet(real_book, real_sheet, sheetName);
    var name = `department-${exportTypeName}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const feedback = await StudentFeedback.findById(id);
    feedback.export_collection.push({
      excel_type: excelType,
      excel_file: results,
      excel_file_name: name,
      department: departmentId,
    });
    feedback.export_collection_count += 1;
    await feedback.save();
    return results;
  } catch (e) {
    console.log(e);
  }
};

exports.subject_marks_student_json_to_excel = async (
  id,
  list,
  sheetName,
  excelType,
  exportTypeName
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(list);

    xlsx.utils.book_append_sheet(real_book, real_sheet, sheetName);
    var name = `subject-${exportTypeName}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const subject = await Subject.findById(id);
    subject.export_collection.push({
      excel_type: excelType,
      excel_file: results,
      excel_file_name: name,
    });
    subject.export_collection_count += 1;
    await subject.save();
    return results;
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_admission_subject_application_query = async (
  data_query,
  app_name,
  appId,
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "SubjectStudentList");
    var name = `${app_name}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const apply = await NewApplication.findById({ _id: appId });
      const ads_admin = await Admission.findById({
        _id: `${apply?.admissionAdmin}`,
      });
      ads_admin.export_collection.push({
        excel_file: results,
        excel_file_name: name,
      });
      ads_admin.export_collection_count += 1;
      await ads_admin.save();
    return {
      back: true,
    };
  } catch (e) {
    console.log(e);
  }
};

exports.subject_internal_evaluation_marks_student_json_to_excel = async (
  id,
  list,
  sheetName,
  excelType,
  exportTypeName
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(list);

    xlsx.utils.book_append_sheet(real_book, real_sheet, sheetName);
    var name = `internal-evaluation-${exportTypeName}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const subject = await SubjectInternalEvaluation.findById(id);
    subject.export_collection.push({
      excel_type: excelType,
      excel_file: results,
      excel_file_name: name,
    });
    subject.export_collection_count += 1;
    await subject.save();
    return results;
  } catch (e) {
    console.log(e);
  }
};

exports.subject_attendance_json_to_excel = async (
  id,
  list,
  sheetName,
  excelType,
  exportTypeName
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(list);

    xlsx.utils.book_append_sheet(real_book, real_sheet, sheetName);
    var name = `subject-attendance-${exportTypeName}-${new Date().getHours()}-${new Date().getMinutes()}-${new Date().getSeconds()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

    const subject = await Subject.findById(id);
    subject.export_collection.push({
      excel_type: excelType,
      excel_file: results,
      excel_file_name: name,
    });
    subject.export_collection_count += 1;
    await subject.save();
    return results;
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_admission_query = async (
  data_query,
  app_name,
  appId,
  flow
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(real_book, real_sheet, "Admission Application Students");
    var name = `${app_name}-${flow}-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);

      const ads_admin = await Admission.findById({
        _id: appId,
      });
      ads_admin.export_collection.push({
        excel_file: results,
        excel_file_name: name,
      });
      ads_admin.export_collection_count += 1;
      await ads_admin.save();
    return {
      back: true,
    };
  } catch (e) {
    console.log(e);
  }
};

exports.json_to_excel_academic_export_query= async (
  data_query,
  c_name
) => {
  try {
    var real_book = xlsx.utils.book_new();
    var real_sheet = xlsx.utils.json_to_sheet(data_query);

    xlsx.utils.book_append_sheet(
      real_book,
      real_sheet,
      `Academic Student List`
    );
    var name = `${c_name}-academic-students-${new Date().getHours()}-${new Date().getMinutes()}`;
    xlsx.writeFile(real_book, `./export/${name}.xlsx`);

    const results = await uploadExcelFile(`${name}.xlsx`);
    return results
  } catch (e) {
    console.log(e);
  }
};






