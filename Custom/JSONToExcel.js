const xlsx = require("xlsx");
const fs = require("fs");
const Admission = require("../models/Admission/Admission");
const { uploadExcelFile } = require("../S3Configuration");

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
