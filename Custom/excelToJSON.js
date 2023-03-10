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

const push_to_new_query = (ele) => {
  try {
    var array = [];
    array.push({ ...ele });
  } catch (e) {
    console.log(e);
  }
};

exports.generate_excel_to_json_fee_structure = async (file, fid, did) => {
  try {
    const w_query = xlsx.read(file.Body);
    // xlsx.readFile("./FeeStructure.xlsx");
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
        struct.one_installments = {
          fees: struct?.one_installments
            ? parseInt(struct?.one_installments)
            : 0,
          dueDate: "",
        };
        struct.two_installments = {
          fees: struct?.two_installments
            ? parseInt(struct?.two_installments)
            : 0,
          dueDate: "",
        };
        struct.three_installments = {
          fees: struct?.three_installments
            ? parseInt(struct?.three_installments)
            : 0,
          dueDate: "",
        };
        struct.four_installments = {
          fees: struct?.four_installments
            ? parseInt(struct?.four_installments)
            : 0,
          dueDate: "",
        };
        struct.five_installments = {
          fees: struct?.five_installments
            ? parseInt(struct?.five_installments)
            : 0,
          dueDate: "",
        };
        struct.six_installments = {
          fees: struct?.six_installments
            ? parseInt(struct?.six_installments)
            : 0,
          dueDate: "",
        };
        struct.seven_installments = {
          fees: struct?.seven_installments
            ? parseInt(struct?.seven_installments)
            : 0,
          dueDate: "",
        };
        struct.eight_installments = {
          fees: struct?.eight_installments
            ? parseInt(struct?.eight_installments)
            : 0,
          dueDate: "",
        };
        struct.nine_installments = {
          fees: struct?.nine_installments
            ? parseInt(struct?.nine_installments)
            : 0,
          dueDate: "",
        };
        struct.ten_installments = {
          fees: struct?.ten_installments
            ? parseInt(struct?.ten_installments)
            : 0,
          dueDate: "",
        };
        struct.eleven_installments = {
          fees: struct?.eleven_installments
            ? parseInt(struct?.eleven_installments)
            : 0,
          dueDate: "",
        };
        struct.tweleve_installments = {
          fees: struct?.tweleve_installments
            ? parseInt(struct?.tweleve_installments)
            : 0,
          dueDate: "",
        };
      }
      struct.heads = [...heads];
      struct.CategoryId = fee_category?._id;
      struct.StandardId = master?._id;
      if (struct) {
        new_data_query.push({ ...struct });
        console.log("push");
      } else {
        new_data_query = [];
        console.log("Empty");
      }
    });
    // fs.writeFileSync("../structure.json", JSON.stringify(data_query, null, 2));
    return { structure_array: new_data_query, value: true };
  } catch (e) {
    console.log("Structure Excel Query Not Resolved", e);
  }
};

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
