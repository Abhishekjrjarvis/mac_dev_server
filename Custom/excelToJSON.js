const xlsx = require("xlsx");
const fs = require("fs");
const { replace_query } = require("../helper/dayTimer");

exports.generate_excel_to_json = async (file) => {
  try {
    const w_query = xlsx.read(file.Body, {
      dateNF: "yyyy-mm-dd",
    });
    // xlsx.readFile("./Student.xlsx", {
    //   dateNF: "yyyy-mm-dd",
    // });

    const w_sheet = w_query.Sheets["Student"];

    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    data_query?.map((ref) => {
      var batch_set = [];
      var remain_array = [];
      var b_count = +ref?.batchcount;
      ref.studentDOB = replace_query(ref?.studentDOB);

      for (var i = 1; i <= b_count; i++) {
        var i_count = +ref[`instcount_${i}`];
        for (var j = 1; j <= i_count; j++) {
          remain_array.push({
            amount: ref[`paid${i}_${j}`],
            mode: ref[`mode${i}_${j}`],
          });
        }
        batch_set.push({
          batchId: ref[`batchId_${i}`],
          appId: ref[`appId_${i}`],
          fee_struct: ref[`fee_struct_${i}`],
          amount: ref[`amount${i}`],
          remain_array: [...remain_array],
        });
        remain_array = [];
      }

      remain_array = remain_array.filter(
        (value) => JSON.stringify(value) !== "{}"
      );

      batch_set = batch_set.filter((value) => JSON.stringify(value) !== "{}");

      let name_query = ref?.name?.split(" ");
      if (name_query?.length > 2) {
        new_data_query.push({
          ...ref,
          batch_set,
          studentFirstName: name_query[0],
          studentMiddleName: name_query[1],
          studentLastName: name_query[2],
          fee_struct: ref?.fee_struct,
          is_remain: ref?.isremain,
          fileArray: [],
          sample_pic: "",
          fee_struct: ref?.fee_struct,
        });
      } else {
        new_data_query.push({
          ...ref,
          batch_set,
          studentFirstName: name_query[0],
          studentLastName: name_query[1],
          fee_struct: ref?.fee_struct,
          is_remain: ref?.isremain,
          fileArray: [],
          sample_pic: "",
          fee_struct: ref?.fee_struct,
        });
      }
    });
    return { student_array: new_data_query, value: true };
    // fs.writeFileSync(
    //   "../studentJSON.json",
    //   JSON.stringify(new_data_query, null, 2)
    // );
  } catch (e) {
    console.log("Excel Query Not Resolved", e);
  }
};
