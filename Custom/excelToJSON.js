const xlsx = require("xlsx");
const fs = require("fs");
const { replace_query } = require("../helper/dayTimer");
const FeeCategory = require("../models/Finance/FeesCategory");
const ClassMaster = require("../models/ClassMaster");

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
          remark: ref[`remark${i}`],
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

const generate_excel_to_json_fee_structure = (fid, did) => {
  try {
    const w_query = xlsx.readFile("./FeeStructure.xlsx");
    // xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["FeeStructure"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    data_query?.map(async (struct) => {
      var heads = [];
      const fee_category = await FeeCategory.findOne({
        $and: [{ finance: fid }],
        $or: [
          {
            category_name: { $regex: struct?.CategoryName, $options: "i" },
          },
        ],
      });
      const master = await ClassMaster.findOne({
        $and: [{ department: did }],
        $or: [
          {
            className: { $regex: struct?.StandardName, $options: "i" },
          },
        ],
      });
      var head_count = struct?.FeeHeadCount
        ? parseInt(struct?.FeeHeadCount)
        : 0;
      var install_count = struct?.InstallCount
        ? parseInt(struct?.InstallCount)
        : 0;
      if (head_count > 0) {
        for (var i = 1; i <= head_count; i++) {
          heads.push({
            head_name: struct[`FeeHeadName${i}`],
            head_amount: struct[`FeeHeadAmount${i}`],
          });
        }
      }
      if (install_count > 0) {
        // for (var i = 1; i <= install_count; i++) {
        //   install.push({
        //     install: struct[`FeeHeadName${i}`],
        //     head_amount: struct[`FeeHeadAmount${i}`],
        //   });
        // }
      }
      struct.heads = [...heads];
      // console.log(struct);
      new_data_query.push({
        ...struct,
        CategoryId: fee_category?._id,
        StandardId: master?._id,
      });
    });
    // fs.writeFileSync("../structure.json", JSON.stringify(data_query, null, 2));
    // return { structure_array: new_data_query, value: true };
  } catch (e) {
    console.log("Structure Excel Query Not Resolved", e);
  }
};

// const data_params = generate_excel_to_json_fee_structure(
//   "63e7d006602c9998495e2335",
//   "64002f4fe3d12f9e1bf5e720"
// );
// console.log(data_params);

exports.generate_excel_to_json_fee_category = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["FeeCategory"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    return { category_array: data_query, value: true };
  } catch (e) {
    console.log("Category Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_fee_head_master = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["FeeHeadMaster"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    return { master_array: data_query, value: true };
  } catch (e) {
    console.log("Master Excel Query Not Resolved", e);
  }
};
