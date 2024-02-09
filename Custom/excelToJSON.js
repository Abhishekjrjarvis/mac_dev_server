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
const Department = require("../models/Department");
const SubjectMaster = require("../models/SubjectMaster");
// const Batch = require("../models/Batch");

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
      // ref.studentDOB = replace_query(ref?.studentDOB);
      ref.studentAdmissionDate = ref?.admissionDate;
      ref.student_abc_id = ref?.AbcID;

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
      const batch = await Batch.findOne({
        $and: [
          { department: did },
          { batchName: { $regex: `${struct?.BatchName}`, $options: "i" } },
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
      struct.batchId = batch?._id;
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
      if (ref?.Name) {
        // if (ref?.DOB) {
        //   ref.staffDOB = replace_query(ref?.DOB);
        // }
        ref.staffGender = ref?.Gender;
        ref.staffMotherName = ref?.MotherName;
        ref.staffPhoneNumber = ref?.PhoneNumber;
        ref.userPhoneNumber = parseInt(ref?.PhoneNumber);
        ref.current_designation = ref?.Designation ?? "NA";
        ref.teaching_type = ref?.Type ?? "NA";
        ref.userEmail = ref?.Email ?? "";
        ref.code = ref?.EmployeeCode ?? "";
        ref.staffNationality = ref?.Nationality ?? "";
        ref.staffReligion = ref?.Religion ?? "";
        ref.staffCast = ref?.Caste ?? "";
        ref.staffCastCategory = ref?.CasteCategory ?? "";
        ref.staffMTongue = ref?.MotherTongue ?? "";
        ref.staffAddress = ref?.Address ?? "";
        ref.staffAadharNumber = ref?.AadharNumber ?? "";
        ref.staffPanNumber = ref?.PanNumber ?? "";
        let name_query = ref?.Name?.split(" ");
        console.log(name_query);
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

exports.generate_excel_to_json_scholarship_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["ScholarshipDetail"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    return { scholar_array: data_query, value: true };
  } catch (e) {
    console.log("Scholarship Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_scholarship_gr_batch_query = async (
  id,
  file
) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["ScholarshipStudent"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var ref of data_query) {
      var new_depart = await Department.findOne({
        $and: [
          { institute: id },
          {
            dName: { $regex: `${ref?.DepartName}`, $options: "i" },
          },
        ],
      });
      var new_batchId = await Batch.findOne({
        $and: [
          { department: new_depart?._id },
          {
            batchName: { $regex: `${ref?.BatchName}`, $options: "i" },
          },
        ],
      });
      new_data_query.push({
        GRNO: ref?.GRNO,
        ScholarNumber: ref?.ScholarNumber,
        batchId: new_batchId,
      });
    }
    return { gr_array: new_data_query, value: true };
  } catch (e) {
    console.log("Scholarship GR Batch Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_library_offline_book_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["LibraryBook"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var val of data_query) {
      val.bookName = val?.Name;
      val.bookStatus = val?.Status;
      val.author = val?.Author;
      val.language = val?.Language;
      val.totalCopies = val?.Copies;
      val.description = val?.Description;
      val.price = val?.Price;
      val.shellNumber = val?.ShelvesNumber;
      val.subject = val?.Subject,
      val.bill_date = val?.BillDate,
      val.bill_number = val?.BillNumber,
      val.purchase_order_date = val?.PurchaseOrderDate,
      val.purchase_order_number = val?.PurchaseOrderNumber,
      val.supplier = val?.Supplier,
      val.publisher_place = val?.PublisherPlace,
      val.publication_year = val?.PublicationYear,
      val.edition = val?.Edition,
      val.class_number = val?.ClassNumber,
      val.accession_number = val?.AccessionNumber,
      val.date = val?.Date,
      val.publisher = val?.Publisher,
      val.totalPage = val?.Pages
      val.depart = val.Department
      new_data_query.push(val);
    }
    return { book_array: new_data_query, value: true };
  } catch (e) {
    console.log("Library Offline Book Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_login_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body, {
      dateNF: "yyyy-mm-dd",
    });
    // xlsx.readFile("./Student.xlsx", {
    //   dateNF: "yyyy-mm-dd",
    // });

    const w_sheet = w_query.Sheets["ReplaceEmail"];

    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var ref of data_query) {
      ref.studentGRNO = ref?.GRNO;
      ref.userEmail = ref?.Email;
      new_data_query.push(ref);
    }
    return { email_array: new_data_query, value: true };
    // fs.writeFileSync(
    //   "../studentJSON.json",
    //   JSON.stringify(new_data_query, null, 2)
    // );
  } catch (e) {
    console.log("Login Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_un_approved = async (file, aid, fid, did) => {
  try {
    const w_query = xlsx.read(file.Body, {
      dateNF: "yyyy-mm-dd",
    });

    const w_sheet = w_query.Sheets["UnApprovedStudent"];

    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var ref of data_query) {
      ref.studentDOB = ref?.DOB ?? "";
      ref.studentGender = ref?.Gender;
      ref.studentMotherName = ref?.MotherName ?? "";
      ref.studentPhoneNumber = ref?.PhoneNumber;
      ref.userPhoneNumber = parseInt(ref?.PhoneNumber);
      ref.userEmail = ref?.Email ?? "";
      ref.studentNationality = ref?.Nationality ?? "";
      ref.studentReligion = ref?.Religion ?? "";
      ref.studentCast = ref?.Caste ?? "";
      ref.studentCastCategory = ref?.CasteCategory ?? "";
      ref.studentAddress = ref?.Address ?? "";
      ref.student_prn_enroll_number = ref?.EnrollmentNumber ?? "";
      ref.studentMTongue = ref?.MotherTongue ?? "";
      let name_query = ref?.Name?.split(" ");
      if (name_query?.length > 2) {
        new_data_query.push({
          ...ref,
          studentFirstName: name_query[0],
          studentMiddleName: name_query[1],
          studentLastName: name_query[2],
          fileArray: [],
          sample_pic: "",
        });
        // console.log("PUSH");
      } else {
        new_data_query.push({
          ...ref,
          studentFirstName: name_query[0],
          studentLastName: name_query[1],
          fileArray: [],
          sample_pic: "",
        });
        // console.log("PUSH");
      }
    }
    return { student_array: new_data_query, value: true };
  } catch (e) {
    console.log("Un Approved Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_subject_chapter_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["SubjectChapter"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var ref of data_query) {
      var chap_arr = [];
      ref.chapter_name = ref?.Topic ?? "";
      ref.topic_name = ref?.SubTopic ?? "";
      ref.topic_last_date = ref?.LastDate ?? "";
      ref.planning_date = ref?.PlanningDate ?? "";
      ref.execution_date = ref?.ExecutionDate ?? "";
      ref.course_outcome = ref?.CourseOutcome ?? "";
      ref.learning_outcome = ref?.LearningOutcome ?? "";
      ref.hours = ref?.Hours ?? "";
      ref.minutes = ref?.Minutes ?? "";
      // var valid_count = ref?.count ? parseInt(ref?.count) : d1;
      // for (var i = 1; i <= valid_count; i++) {
      //   chap_arr.push({
      //     topic_name: ref?.[`Name${i}`],
      //     topic_last_date: ref?.[`LastDate${i}`],
      //   });
      // }
      if (ref?.chapter_name) {
        new_data_query.push({
          ...ref
        });
      }
    }
    console.log(new_data_query)
    return { chapter_array: new_data_query, value: true };
  } catch (e) {
    console.log("Subject Chapter Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_fee_query = async (file, aid, fid) => {
  try {
    const w_query = xlsx.read(file.Body, {
      dateNF: "yyyy-mm-dd",
    });

    const w_sheet = w_query.Sheets["StudentFees"];

    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var ref of data_query) {
      var batch_set = [];
      var b_count = +ref?.Count;
      for (var i = 1; i <= b_count; i++) {
        var new_fee_struct = await FeeStructure.findOne({
          $and: [
            { finance: fid },
            {
              fee_structure_code: {
                $regex: `${ref[`StructureCode_${i}`]}`,
                $options: "i",
              },
            },
          ],
        });
        var new_appId = await NewApplication.findOne({
          $and: [
            { admissionAdmin: aid },
            { applicationDepartment: new_fee_struct?.department },
            { applicationMaster: new_fee_struct?.class_master },
            { applicationBatch: new_fee_struct?.batch_master}
          ],
        });
        // console.log(new_appId?.applicationDepartment, new_appId?.applicationBatch, new_appId?.applicationMaster)
        // console.log(new_fee_struct?.department, new_fee_struct?.batch_master, new_fee_struct?.class_master)
        if (new_appId?._id) {
          // console.log("push")
          batch_set.push({
            appId: new_appId?._id,
            fee_struct: new_fee_struct?._id,
            amount_student: ref[`PaidByStudent_${i}`],
            amount_gov: ref[`PaidByGovernment_${i}`],
            amount_exempt: ref[`Exempted_${i}`],
            remark: ref[`Remark_${i}`],
          });
        }
      }
      // console.log(batch_set?.length)
      batch_set = batch_set.filter((value) => JSON.stringify(value) !== "{}");

        new_data_query.push({
          ...ref,
          batch_set,
        });
    }
    // console.log(new_data_query)
    return { student_array: new_data_query, value: true }; 
    // fs.writeFileSync(
    //   "../studentJSON.json",
    //   JSON.stringify(new_data_query, null, 2)
    // );
  } catch (e) {
    console.log("Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_department_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["NewDepartment"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var val of data_query) {
      val.dName = val?.Name;
      val.dTitle = val?.Title ?? "HOD";
      new_data_query.push(val);
    }
    return { depart_array: new_data_query, value: true };
  } catch (e) {
    console.log("New Department Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_class_master_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["NewClassMaster"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var val of data_query) {
      val.className = val?.ClassName;
      new_data_query.push(val);
    }
    return { class_master_array: new_data_query, value: true };
  } catch (e) {
    console.log("New Class Master Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_subject_master_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["NewSubjectMaster"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var val of data_query) {
      val.subjectName = val?.SubjectName;
      val.subjectType = val?.SubjectType ?? "Mandatory";
      val.course_code = val?.CourseCode
      new_data_query.push(val);
    }
    return { subject_master_array: new_data_query, value: true };
  } catch (e) {
    console.log("New Subject Master Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_class_query = async (file, did) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["NewClass"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var val of data_query) {
      var new_master = await ClassMaster.findOne({
        $and: [
          { department: did },
          {
            className: { $regex: `${val?.MasterName}`, $options: "i" },
          },
        ],
      });
      val.classTitle = val?.ClassTitle;
      val.classHeadTitle = val?.ClassHeadTitle ?? "Class Teacher";
      val.mcId = new_master?._id;
      new_data_query.push(val);
    }
    return { class_array: new_data_query, value: true };
  } catch (e) {
    console.log("New Class Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_subject_query = async (file, did, cid) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["NewSubject"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var val of data_query) {
      if(val?.MasterName){
      var new_master = await SubjectMaster.findOne({
        $and: [
          { department: did },
          {
            subjectName: { $regex: `${val?.MasterName}`, $options: "i" },
          },
        ],
      });
      if (val?.Batch) {
        var new_batch = await Batch.findOne({
          $and: [
            { class_batch_select: cid },
            {
              batchName: { $regex: `${val.Batch}`, $options: "i" },
            },
          ],
        });
      }
      val.subjectTitle = val?.SubjectTitle ?? "Subject Teacher";
      val.subject_category = val?.SubjectCategory;
      if (val?.SubjectType === "Full Class") {
      } else {
        val.selected_batch = new_batch?._id;
      }
      val.msid = new_master?._id;
      new_data_query.push(val);
    }
    }
    // console.log(new_data_query)
    return { subject_array: new_data_query, value: true };
  } catch (e) {
    console.log("New Subject Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_attendence_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["MarkPreviousAttendence"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var val of data_query) {
      val.subjectName = val?.SubjectName;
      val.subjectType = val?.SubjectType;
      new_data_query.push(val);
    }
    return { subject_master_array: new_data_query, value: true };
  } catch (e) {
    console.log("New Subject Master Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_department_po_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["po"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var val of data_query) {
      val.attainment_name = val?.Name;
      val.attainment_description = val?.Description;
      new_data_query.push(val);
    }
    return { po_list: new_data_query, value: true };
  } catch (e) {
    console.log("Department PO Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_subject_master_co_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["co"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    var new_data_query = [];
    for (var val of data_query) {
      val.attainment_name = val?.Name;
      val.attainment_description = val?.Description;
      val.attainment_target = val?.Target;
      val.attainment_code = val?.Code;
      new_data_query.push(val);
    }
    return { co_list: new_data_query, value: true };
  } catch (e) {
    console.log("Subject Master CO Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_biometric_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["BiometricStaff"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    return { biometric_array: data_query, value: true };
  } catch (e) {
    console.log("Biometric Excel Query Not Resolved", e);
  }
};

exports.generate_excel_to_json_staff_leave_query = async (file) => {
  try {
    const w_query = xlsx.read(file.Body);
    const w_sheet = w_query.Sheets["StaffLeave"];
    const data_query = xlsx.utils.sheet_to_json(w_sheet, { raw: false });
    return { staff_array: data_query, value: true };
  } catch (e) {
    console.log("Staff Leave Excel Query Not Resolved", e);
  }
};