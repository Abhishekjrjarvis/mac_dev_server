const xlsx = require("xlsx");
const fs = require("fs");
const { replace_query } = require("../helper/dayTimer");
const FeeCategory = require("../models/Finance/FeesCategory");
const FeeMaster = require("../models/Finance/FeeMaster");
const Batch = require("../models/Batch");
const NewApplication = require("../models/Admission/NewApplication");
const FeeStructure = require("../models/Finance/FeesStructure");
const ClassMaster = require("../models/ClassMaster");
const HostelUnit = require("../models/Hostel/hostelUnit");
const HostelRoom = require("../models/Hostel/hostelRoom");

exports.generate_excel_to_json = async (file, aid, fid, did) => {
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
    for (var ref of data_query) {
      var batch_set = [];
      var remain_array = [];
      var b_count = +ref?.batchcount;
      ref.studentDOB = replace_query(ref?.studentDOB);
      ref.studentAdmissionDate = ref?.admissionDate;

      for (var i = 1; i <= b_count; i++) {
        var i_count = +ref[`instcount_${i}`];
        for (var j = 1; j <= i_count; j++) {
          remain_array.push({
            amount: ref[`paid${i}_${j}`],
            mode: ref[`mode${i}_${j}`],
          });
        }
        var new_appId = await NewApplication.findOne({
          $and: [
            { admissionAdmin: aid },
            {
              applicationName: {
                $regex: `${ref[`appId_${i}`]}`,
                $options: "i",
              },
            },
          ],
        });
        var new_batchId = await Batch.findOne({
          $and: [
            { department: did },
            {
              batchName: { $regex: `${ref[`batchId_${i}`]}`, $options: "i" },
            },
          ],
        });
        var new_fee_struct = await FeeStructure.findOne({
          $and: [
            { finance: fid },
            {
              unique_structure_name: {
                $regex: `${ref[`fee_struct_${i}`]}`,
                $options: "i",
              },
            },
          ],
        });
        batch_set.push({
          batchId: new_batchId?._id,
          appId: new_appId?._id,
          fee_struct: new_fee_struct?._id,
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
    }
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
    var new_query = [];
    for (var struct of data_query) {
      var heads = [];
      const fee_category = await FeeCategory.findOne({
        $and: [
          { finance: fid },
          {
            category_name: { $regex: `${struct?.CategoryName}`, $options: "i" },
          },
        ],
      });
      // console.log("ID's - ", fee_category?._id, struct?.CategoryName);
      const master = await ClassMaster.findOne({
        $and: [
          { department: did },
          {
            className: { $regex: `${struct?.StandardName}`, $options: "i" },
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
          var one_master = await FeeMaster.findOne({
            $and: [
              { finance: fid },
              {
                master_name: {
                  $regex: `${struct[`FeeHeadName${i}`]}`,
                  $options: "i",
                },
              },
            ],
          });
          if (one_master) {
            heads.push({
              head_name: struct[`FeeHeadName${i}`],
              head_amount: struct[`FeeHeadAmount${i}`],
              master: one_master?._id,
            });
          }
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
      if (struct?.CategoryId) {
        new_data_query.push(struct);
        // console.log("push");
      } else {
        // console.log("Empty");
      }
      new_query = [...new_data_query];
    }
    // fs.writeFileSync("../structure.json", JSON.stringify(data_query, null, 2));
    return { structure_array: new_query, value: true };
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

exports.generate_excel_to_json_direct_staff = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["Staff"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    data_query?.map((ref) => {
      ref.staffDOB = replace_query(ref?.DOB);
      ref.staffGender = ref?.Gender;
      ref.staffMotherName = ref?.MotherName;
      ref.staffPhoneNumber = ref?.PhoneNumber;
      ref.userPhoneNumber = parseInt(ref?.PhoneNumber);
      let name_query = ref?.Name?.split(" ");
      if (name_query?.length > 2) {
        new_data_query.push({
          ...ref,
          staffFirstName: name_query[0],
          staffMiddleName: name_query[1],
          staffLastName: name_query[2],
          fileArray: [],
          sample_pic: "",
        });
      } else {
        new_data_query.push({
          ...ref,
          staffFirstName: name_query[0],
          staffLastName: name_query[1],
          fileArray: [],
          sample_pic: "",
        });
      }
    });
    return { staff_array: new_data_query, value: true };
  } catch (e) {
    console.log("Staff Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_direct_hostelities = async (file, hid, fid) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["HostelStudent"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var ref of data_query) {
      var valid_app = await NewApplication.findOne({
        $and: [
          { applicationHostel: hid },
          {
            applicationName: { $regex: `${ref?.application}`, $options: "i" },
          },
        ],
      });
      var valid_unit = await HostelUnit.findOne({
        $and: [
          { hostel: hid },
          { hostel_unit_name: { $regex: `${ref?.unit}`, $options: "i" } },
        ],
      });
      var room_name = await HostelRoom.findOne({
        $and: [
          { room_name: { $regex: `${ref?.room}`, $options: "i" } },
          { hostelUnit: valid_unit?._id },
        ],
      });
      var new_fee_struct = await FeeStructure.findOne({
        $and: [
          { finance: fid },
          {
            unique_structure_name: {
              $regex: `${ref?.structure}`,
              $options: "i",
            },
          },
        ],
      });
      ref.aid = valid_app?._id;
      ref.studentDOB = replace_query(ref?.DOB);
      ref.studentGender = ref?.Gender;
      ref.studentMotherName = ref?.MotherName;
      ref.studentPhoneNumber = ref?.PhoneNumber ?? 0;
      ref.userPhoneNumber = ref?.PhoneNumber ? parseInt(ref?.PhoneNumber) : 0;
      ref.userEmail = ref?.email;
      ref.fee_payment_mode = ref?.paymentMode;
      ref.fee_payment_amount = ref?.paymentAmount;
      ref.fee_transaction_date = new Date();
      ref.fee_bank_name = ref?.bankName;
      ref.fee_bank_holder = ref?.bankHolder;
      ref.fee_utr_reference = ref?.UTRNumber;
      ref.fee_struct = new_fee_struct?._id;
      ref.room = room_name?._id;
      ref.unit = valid_unit?._id;
      let name_query = ref?.Name?.split(" ");
      if (name_query?.length > 2) {
        new_data_query.push({
          ...ref,
          studentFirstName: name_query[0],
          studentMiddleName: name_query[1],
          studentLastName: name_query[2],
          fileArray: [],
          optionalSubject: [],
        });
      } else {
        new_data_query.push({
          ...ref,
          studentFirstName: name_query[0],
          studentLastName: name_query[1],
          fileArray: [],
          optionalSubject: [],
        });
      }
    }
    return { student_array: new_data_query, value: true };
  } catch (e) {
    console.log("Hostel Student Excel Query Not Resolved", e);
  }
};
