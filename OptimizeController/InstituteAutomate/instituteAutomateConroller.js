const Department = require("../../models/Department");
const Class = require("../../models/Class");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Batch = require("../../models/Batch");
const Subject = require("../../models/Subject");
const ClassMaster = require("../../models/ClassMaster");
const { universal_random_password } = require("../../Custom/universalId");
const ExamFeeStructure = require("../../models/BacklogStudent/ExamFeeStructure");
const {
  create_master_query,
  not_take_attendance_one_subject_teaching_plan_query,
  add_automate_chapter_query,
  create_cls_batch_query,
  create_cls_subject_query,
  create_department_po,
  holiday_date_split_query,
  one_department_holiday_date_query,
  in_week_one_class_timetable_subject_leacture_query,
  in_one_class_subjects_teaching_mapping_query,
  in_one_subjects_teaching_mapping_query,
  holiday_changes_in_one_class_subjects_teaching_mapping_query,
  more_lecture_in_same_day_one_subject_teaching_plan_query,
} = require("./institute-automate-function");
const {
  classCodeFunction,
  todayDate,
} = require("../../Utilities/timeComparison");
const Holiday = require("../../models/Holiday");
const AutomateInstitute = require("../../models/InstituteAutomate/AutomateInstitute");
const University = require("../../models/InstituteAutomate/University");
const DepartmentType = require("../../models/InstituteAutomate/DepartmentType");
const InstituteType = require("../../models/InstituteAutomate/InstituteType");
const StreamType = require("../../models/InstituteAutomate/StreamType");
const AutomateSubjectMaster = require("../../models/InstituteAutomate/AutomateSubjectMaster");
const {
  getj_institute_type_query,
  getj_university_query,
  getj_department_type_query,
  getj_stream_type_query,
  getj_stream_class_master_query,
  getj_stream_subject_master_query,
  getj_stream_subject_master_teaching_plan_query,
  getj_department_po_query,
  getj_subject_master_co_query,
  getj_department_holiday_query,
} = require("../../Custom/automateExcelToJSON");
const { simple_object } = require("../../S3Configuration");
const AutomateChapter = require("../../models/InstituteAutomate/AutomateChapter");
const AutomateChapterTopic = require("../../models/InstituteAutomate/AutomateChapterTopic");

// testing done
exports.addInstituteTypeQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { excel_file } = req.query;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    var automate = null;
    automate = await AutomateInstitute.findOne({
      instituteId: id,
    });
    if (!automate) {
      automate = new AutomateInstitute({
        instituteId: id,
      });
      await automate.save();
    }
    // res.status(200).send({
    //   message: "Adding Institute type in process",
    // });
    const file = await simple_object(excel_file);
    const { data_query } = await getj_institute_type_query(file);
    let iteration_count = data_query?.length;
    if (automate && iteration_count > 0) {
      for (let i = 0; i < iteration_count; i++) {
        let tp = data_query[i];
        const institute_type = new InstituteType({
          name: tp?.name ?? "",
          automate_institute: automate?._id,
          instituteId: id,
        });
        await institute_type.save();
        automate.institute_type?.push(institute_type?._id);
      }
      await automate.save();
    }
    res.status(200).send({
      message: "Adding Institute type in process",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.addUniversityQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { excel_file } = req.query;

    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    var automate = null;
    automate = await AutomateInstitute.findOne({
      instituteId: id,
    });
    if (!automate) {
      automate = new AutomateInstitute({
        instituteId: id,
      });
      await automate.save();
    }
    // res.status(200).send({
    //   message: "Adding University in process",
    // });
    const file = await simple_object(excel_file);

    const { data_query } = await getj_university_query(file);
    let iteration_count = data_query?.length;
    if (automate && iteration_count > 0) {
      for (let i = 0; i < iteration_count; i++) {
        let tp = data_query[i];
        const affiliated = new University({
          name: tp?.name,
          automate_institute: automate?._id,
          instituteId: id,
        });
        await affiliated.save();
        automate.affiliated_with?.push(affiliated?._id);
        // console.log(affiliated);
      }
      await automate.save();
    }
    res.status(200).send({
      message: "Adding University in process",
    });
    // console.log(automate);
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.addDepartmentTypeQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { excel_file } = req.query;

    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    var automate = null;
    automate = await AutomateInstitute.findOne({
      instituteId: id,
    });
    if (!automate) {
      automate = new AutomateInstitute({
        instituteId: id,
      });
      await automate.save();
    }
    // res.status(200).send({
    //   message: "Adding University in process",
    // });
    const file = await simple_object(excel_file);

    const { data_query } = await getj_department_type_query(file);
    let iteration_count = data_query?.length;
    if (automate && iteration_count > 0) {
      for (let i = 0; i < iteration_count; i++) {
        let tp = data_query[i];
        const department_t = new DepartmentType({
          name: tp?.name,
          automate_institute: automate?._id,
          instituteId: id,
        });
        await department_t.save();
        automate.department_type?.push(department_t?._id);
      }
      await automate.save();
    }
    res.status(200).send({
      message: "Adding University in process",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.addStreamTypeQuery = async (req, res) => {
  try {
    const { excel_file } = req.query;
    const file = await simple_object(excel_file);

    // res.status(200).send({
    //   message: "Adding streams in process",
    // });

    const { data_query } = await getj_stream_type_query(file);
    let iteration_count = data_query?.length;
    if (iteration_count > 0) {
      for (let i = 0; i < iteration_count; i++) {
        let rt = data_query[i];
        if (rt?.institute_type && rt?.name && rt?.affiliated_with) {
          const institute_type = await InstituteType.findOne({
            $and: [
              {
                name: { $eq: `${rt?.institute_type}` },
              },
            ],
          });
          const affiliated_with = await University.findOne({
            $and: [
              {
                name: { $eq: `${rt?.affiliated_with}` },
              },
            ],
          });
          const d_type = await DepartmentType.findOne({
            $and: [
              {
                name: { $eq: `${rt?.departmentType}` },
              },
            ],
          });
          // console.log("institute_type", institute_type);
          // console.log("affiliated_with", affiliated_with);
          if (institute_type?._id && affiliated_with?._id && d_type?._id) {
            const stream_type = new StreamType({
              institute_type: institute_type?._id,
              affiliated_with: affiliated_with?._id,
              name: rt?.name ?? "",
              automate_institute: institute_type?.automate_institute,
              instituteId: institute_type?.instituteId,
              department_type: d_type?._id,
            });
            affiliated_with.streams?.push(stream_type?._id);
            institute_type.streams?.push(stream_type?._id);
            await Promise.all([
              stream_type.save(),
              institute_type.save(),
              affiliated_with.save(),
            ]);
          }
        }
      }
    }
    res.status(200).send({
      message: "Adding streams in process",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.addStreamPoQuery = async (req, res) => {
  try {
    const { stid } = req.params;
    const { excel_file } = req.query;

    if (!stid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const stream = await StreamType.findById(stid);
    // res.status(200).send({
    //   message: "Adding po in streams is process",
    // });

    const file = await simple_object(excel_file);

    const { data_query } = await getj_department_po_query(file);
    let iteration_count = data_query?.length;
    if (iteration_count > 0) {
      for (let i = 0; i < iteration_count; i++) {
        let rt = data_query[i];
        if (rt?.attainment_name) {
          stream?.po.push({
            attainment_name: rt?.attainment_name,
            attainment_type: "PO",
            attainment_description: rt?.attainment_description,
          });
        }
      }
      stream.po_count = stream.po?.length;
      await stream.save();
    }
    res.status(200).send({
      message: "Adding po in streams is process",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.addStreamClassMasterQuery = async (req, res) => {
  try {
    const { stid } = req.params;
    const { excel_file } = req.query;

    if (!stid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const stream = await StreamType.findById(stid);
    // res.status(200).send({
    //   message: "Adding class master in streams is process",
    // });
    const file = await simple_object(excel_file);

    const { data_query } = await getj_stream_class_master_query(file);
    let iteration_count = data_query?.length;

    if (stream?._id && iteration_count > 0) {
      for (let i = 0; i < iteration_count; i++) {
        let ot = data_query[i];
        if (ot?.name) {
          stream?.cls_master.push({
            name: ot?.name,
          });
        }
      }
      await stream.save();
    }
    res.status(200).send({
      message: "Adding class master in streams is process",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.addStreamSubjectMasterQuery = async (req, res) => {
  try {
    const { stid } = req.params;
    const { excel_file } = req.query;

    if (!stid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const stream = await StreamType.findById(stid);
    // res.status(200).send({
    //   message: "Adding streams in process",
    // });

    const file = await simple_object(excel_file);

    const { data_query } = await getj_stream_subject_master_query(file);
    let iteration_count = data_query?.length;

    if (stream?._id && iteration_count > 0) {
      for (let i = 0; i < iteration_count; i++) {
        let ot = data_query[i];
        if (ot?.subjectName && ot?.subjectType) {
          const st_master = new AutomateSubjectMaster({
            subjectName: ot?.subjectName ?? "",
            subjectType: ot?.subjectType ?? "",
            className: ot?.className ?? "",
            is_practical: ot?.is_practical === "Yes" ? true : false,
            stream_type: stream?._id,
          });
          await st_master.save();
          stream?.subject_master.push(st_master?._id);
        }
      }
      await stream.save();
    }
    res.status(200).send({
      message: "Adding streams in process",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.addStreamCoSubjectMasterQuery = async (req, res) => {
  try {
    const { asmid } = req.params;
    const { excel_file } = req.query;

    if (!asmid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const st_master = await AutomateSubjectMaster.findById(asmid);
    // res.status(200).send({
    //   message: "Adding subject master co in process",
    // });

    const file = await simple_object(excel_file);

    const { data_query } = await getj_subject_master_co_query(file);
    let iteration_count = data_query?.length;

    if (iteration_count > 0) {
      for (let i = 0; i < iteration_count; i++) {
        let rt = data_query[i];
        if (rt?.attainment_name) {
          st_master?.co.push({
            attainment_name: rt?.attainment_name,
            attainment_type: "CO",
            attainment_description: rt?.attainment_description,
            attainment_target: rt?.attainment_target,
            attainment_code: rt?.attainment_code,
          });
        }
      }
      st_master.co_count = st_master.co?.length;
      await st_master.save();
    }
    res.status(200).send({
      message: "Adding subject master co in process",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.addStreamSubjectMasterTeachingPlanQuery = async (req, res) => {
  try {
    const { asmid } = req.params;
    const { excel_file } = req.query;

    if (!asmid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const st_master = await AutomateSubjectMaster.findById(asmid);

    // res.status(200).send({
    //   message: "Adding streams in process",
    // });
    const file = await simple_object(excel_file);

    const { data_query } = await getj_stream_subject_master_teaching_plan_query(
      file
    );
    let iteration_count = data_query?.length;

    if (st_master?._id && iteration_count > 0) {
      for (let i = 0; i < iteration_count; i++) {
        let ot = data_query[i];
        if (ot?.teachingType && ot?.chapter_name) {
          if (ot?.teachingType === "Theory") {
            const chapter = await add_automate_chapter_query(
              ot,
              st_master?._id,
              "Theory"
            );
            if (chapter) {
              st_master.teaching_plan.theory?.push(chapter);
              await st_master.save();
            }
          } else if (ot?.teachingType === "Tutorial") {
            const chapter = await add_automate_chapter_query(
              ot,
              st_master?._id,
              "Tutorial"
            );
            if (chapter) {
              st_master.teaching_plan.tutorial?.push(chapter);
              await st_master.save();
            }
          } else if (ot?.teachingType === "Practical") {
            const chapter = await add_automate_chapter_query(
              ot,
              st_master?._id,
              "Practical"
            );
            if (chapter) {
              st_master.teaching_plan.practical?.push(chapter);
              await st_master.save();
            }
          } else {
          }
        }
      }
    }

    res.status(200).send({
      message: "Adding streams in process",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done with complete department type
exports.createDepartmentInInstitiuteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const code = universal_random_password();
    const department = new Department(req.body);
    department.member_module_unique = `${code}`;
    department.institute = id;
    await department.save();

    // res.status(200).send({
    //   message: "Institute department created successfully.",
    //   department: department?._id,
    // });

    const institute = await InstituteAdmin.findById(id);
    institute.depart.push(department?._id);
    institute.departmentCount += 1;
    const new_exam_fee = new ExamFeeStructure({
      exam_fee_type: "Per student",
      exam_fee_status: "Static Department Linked",
    });
    new_exam_fee.department = department?._id;
    department.exam_fee_structure.push(new_exam_fee?._id);
    department.exam_fee_structure_count += 1;
    await Promise.all([
      institute.save(),
      department.save(),
      new_exam_fee.save(),
    ]);

    // let institute_type_id = "Engineering";
    // let affiliated_with_id = "SPPU";
    // let department_type_id = "Complete Department";
    // let stream_type_id = "Computer Science";

    // let institute_type_id = req.body?.institute_type_id;
    // let affiliated_with_id = req.body?.affiliated_with_id;
    // let department_type_id = req.body?.department_type_id;
    let stream_type_id = req.body?.stream_type_id;

    if (
      // institute_type_id &&
      // affiliated_with_id &&
      // department_type_id &&
      stream_type_id &&
      department?._id &&
      institute?._id
    ) {
      const stream = await StreamType.findById(stream_type_id);
      if (stream?._id) {
        let { attinment_id } = await create_department_po(
          department?._id,
          stream?.po
        );
        department.po_attainment.push(...attinment_id);
        department.po_attainment_count += attinment_id?.length;
        stream.department?.push(department?._id);
        await Promise.all([department.save(), stream.save()]);
      }

      await create_master_query(
        department?._id,
        institute?._id,
        stream_type_id
      );
    }
    res.status(200).send({
      message: "Institute department created successfully.",
      department: department?._id,
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done with complete department type
exports.createClassInDepartmentQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const {
      classTitle,
      classHeadTitle,
      mcId,
      aggregatePassingPercentage,
      optionalSubjectCount,
      batchCount,
      stream,
    } = req.body;
    if (!did || !mcId) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const code = universal_random_password();
    const class_code = await classCodeFunction();

    const that_day = await todayDate();

    const department = await Department.findById(did);
    const institute = await InstituteAdmin.findById(department?.institute);
    const masterClass = await ClassMaster.findById(mcId);

    if (department?.departmentSelectBatch) {
      const cls = new Class({
        masterClassName: mcId,
        className: masterClass?.className,
        classTitle: classTitle,
        classHeadTitle: classHeadTitle,
        classCode: class_code,
        classStartDate: that_day,
        finalReportsSettings: {
          aggregatePassingPercentage: aggregatePassingPercentage,
        },
        optionalSubjectCount: optionalSubjectCount,
        member_module_unique: `${code}`,
        institute: institute?._id,
        department: department?._id,
        batch: department?.departmentSelectBatch,
      });
      if (stream) {
        cls.cls_stream_type = stream;
      } else {
        cls.stream_type = department.stream_type_id;
      }
      await cls.save();

      // res.status(200).send({
      //   message: "Department class created successfully.",
      //   classRoom: cls?._id,
      // });

      const batch = await Batch.findById(department?.departmentSelectBatch);

      institute.classCodeList.push(`${class_code}`);
      institute.classRooms.push(cls?._id);
      batch.classroom.push(cls?._id);
      masterClass.classDivision.push(cls?._id);
      masterClass.classCount += 1;
      department.class.push(cls?._id);
      department.classCount += 1;

      await Promise.all([
        institute.save(),
        batch.save(),
        masterClass.save(),
        department.save(),
      ]);

      if (batchCount > 0 && cls?._id) {
        const { batch_list } = await create_cls_batch_query(
          cls?._id,
          batchCount
        );
        cls.multiple_batches = batch_list;
        cls.multiple_batches_count += batch_list?.length;
        await cls.save();
      }
      let stream_id = cls?.stream_type
        ? cls?.stream_type
        : cls?.cls_stream_type;
      if (stream_id) {
        await create_cls_subject_query(stream_id, cls?._id, batch?._id);
      }
      res.status(200).send({
        message: "Department class created successfully.",
        classRoom: cls?._id,
      });
    } else {
      res.status(200).send({
        message:
          "Please create department batch first and select as a current batch.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.addDepartmentHolidayByExcelQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { excel_file } = req.query;
    if (!did) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const department = await Department.findById(did);

    const file = await simple_object(excel_file);

    // res.status(200).send({
    //   message: "Adding all department holiday excel",
    // });

    const { data_query } = await getj_department_holiday_query(file);
    let iteration_count = data_query?.length;
    if (department?._id && iteration_count > 0) {
      let hd = [];
      for (let i = 0; i < iteration_count; i++) {
        let rows = data_query[i];
        const holiday = new Holiday({
          dHolidayReason: rows?.reason ?? "",
          department: did,
          description: rows?.description ?? "",
        });
        holiday.dDate =
          rows?.holiday_dates?.length > 0
            ? holiday_date_split_query(rows?.holiday_dates)
            : [];
        await holiday.save();
        hd.push(holiday?._id);
        // console.log("holiday", holiday);
      }
      department.holiday.push(...hd);
      await department.save();
    }

    // let data = {
    //   flow: "Add Holiday",
    //   holiday: {
    //     dDate: ["07/03/2024", "08/03/2024"],
    //   },
    // };
    // let calling_fetch = await fetch(
    //   `http://localhost:8080/api/v2/institute/automate/after/holiday/update/${department?._id}/rearrange/teaching/plan`,
    //   {
    //     method: "PATCH",
    //     mode: "cors",
    //     cache: "no-cache",
    //     credentials: "same-origin",
    //     redirect: "follow",
    //     referrerPolicy: "no-referrer",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(data),
    //   }
    // );
    // const fetch_response = await calling_fetch.json();

    res.status(200).send({
      message: "Adding all department holiday excel",
      // fetch_response,
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.updateAcademicsStartDateOfDepartmentQuery = async (req, res) => {
  try {
    const { did } = req.params;

    if (!did) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { academic_date } = req.body;
    let split_date = academic_date?.split("/");
    let new_date = new Date(
      `${split_date?.[2]}-${split_date?.[1]}-${split_date?.[0]}`
    );
    await Department.findByIdAndUpdate(did, {
      ...req.body,
      academic_start_date: new_date,
    });
    res.status(200).send({
      message: "Department academics start date is updated.",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.afterUpdatedClassTimetableSetTeachingPlanQuery = async (
  req,
  res
  // clsId
) => {
  try {
    const { cid } = req.params;

    if (!cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const cls = await Class.findById(cid).populate({
      path: "timetableDayWise",
    });
    const department = await Department.findById(cls?.department).populate({
      path: "holiday",
    });

    const { subject_list } =
      await in_week_one_class_timetable_subject_leacture_query(
        cls?.timetableDayWise
      );
    const { holiday_dates } = await one_department_holiday_date_query(
      department?.holiday
    );
    await in_one_class_subjects_teaching_mapping_query(
      department.academic_start_date,
      subject_list,
      holiday_dates
    );
    return res.status(200).send({
      message: "set Teaching Plan after update time table excel",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.updateOneSubjectTimetableReassignTeachingPlanQuery = async (
  req,
  res
  // clsId,
  // subjectId
) => {
  try {
    const { cid } = req.params;
    const { subjectId } = req.query;

    if (!cid || !subjectId) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const cls = await Class.findById(cid).populate({
      path: "timetableDayWise",
    });
    const department = await Department.findById(cls?.department).populate({
      path: "holiday",
    });

    const { subject_list } =
      await in_week_one_class_timetable_subject_leacture_query(
        cls?.timetableDayWise,
        true,
        subjectId
      );
    const { holiday_dates } = await one_department_holiday_date_query(
      department?.holiday
    );
    await in_one_subjects_teaching_mapping_query(
      department?.academic_start_date,
      subject_list,
      subjectId,
      holiday_dates
    );

    return res.status(200).send({
      message: "update Teaching Plan after update one subject timetable",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.changesHolidayInDepartmentReassignTeachingPlanQuery = async (
  req,
  res
  // departmentId,
  // holiday,
  // flow
) => {
  try {
    const { did } = req.params;
    const { flow, holiday } = req.body;
    // console.log("Department Id", did);

    // console.log("body", req.body);
    if (!did || !flow || !holiday) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const department = await Department.findById(did).populate({
      path: "holiday",
    });

    var cls_list = [];
    cls_list = await Class.find({
      batch: { $eq: `${department?.departmentSelectBatch}` },
    }).populate({
      path: "timetableDayWise",
    });
    const { holiday_dates } = await one_department_holiday_date_query([
      holiday,
    ]);
    // console.log("holiday_dates", holiday_dates);
    for (let i = 0; i < cls_list?.length; i++) {
      let cls = cls_list[i];
      await holiday_changes_in_one_class_subjects_teaching_mapping_query(
        flow,
        cls?.subject,
        holiday_dates,
        department?.holiday,
        cls?.timetableDayWise
      );
    }
    res.status(200).send({
      message: "update Teaching Plan after update holiday changes.",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.changesNotTakeAttendanceSubjectReassignTeachingPlanQuery = async (
  req,
  res
  // subjectId,
  // last_attendance_date
) => {
  try {
    const { sid } = req.params;
    const { last_attendance_date, current_attendance_date } = req.body;

    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const subject = await Subject.findById(sid);

    const cls = await Class.findById(subject?.class).populate({
      path: "timetableDayWise",
    });
    const department = await Department.findById(cls?.department).populate({
      path: "holiday",
    });

    const { subject_list } =
      await in_week_one_class_timetable_subject_leacture_query(
        cls?.timetableDayWise,
        true,
        sid
      );
    const { holiday_dates } = await one_department_holiday_date_query(
      department?.holiday
    );
    let dt = new Date(department?.academic_start_date);
    dt.setDate(dt.getDate() + 1);

    let startdate = last_attendance_date ? new Date(last_attendance_date) : dt;

    const teaching_plan_history_id =
      await not_take_attendance_one_subject_teaching_plan_query(
        startdate,
        current_attendance_date,
        subject_list,
        sid,
        holiday_dates,
        subject?.chapter
      );
    if (teaching_plan_history_id) {
      subject.teaching_plan_logs?.push(teaching_plan_history_id);
      await subject.save();
    }
    return res.status(200).send({
      message: "update Teaching Plan after attendance not mark previous dates.",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.changesAddMoreLectureSubjectReassignTeachingPlanQuery = async (
  req,
  res
  // subjectId,
  // schedule_date,
  // extra_complete_topic
) => {
  try {
    const { sid } = req.params;
    const { schedule_date, extra_complete_topic, current_date } = req.body;

    if (!sid || !extra_complete_topic?.length || !current_date) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const subject = await Subject.findById(sid);

    await more_lecture_in_same_day_one_subject_teaching_plan_query(
      schedule_date,
      subject?.chapter,
      extra_complete_topic,
      current_date
    );
    return res.status(200).send({
      message: "update Teaching Plan after update one subject academic record",
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.automateConfigAllQuery = async (req, res) => {
  try {
    const automate = await AutomateInstitute.find({})
      .populate({
        path: "institute_type",
        populate: {
          path: "streams",
          select: "name",
        },
        select: "name",
      })
      .populate({
        path: "affiliated_with department_type",
        select: "name name",
      });
    return res.status(200).send({
      message: "Automate config",
      config: automate?.[0],
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.automateAllStreamQuery = async (req, res) => {
  try {
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    var streams = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      streams = await StreamType.find({
        $and: [
          {
            name: { $regex: req.query.search, $options: "i" },
          },
        ],
      })
        .populate({
          path: "institute_type affiliated_with department_type",
          select: "name name name",
        })
        .select("name cls_master po");
    } else {
      streams = await StreamType.find({})
        .populate({
          path: "institute_type affiliated_with department_type",
          select: "name name name",
        })
        .select("name cls_master po")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    return res.status(200).send({
      message: "Automate all streams list",
      streams,
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.automateStreamAllSubjectMasterQuery = async (req, res) => {
  try {
    const { stid } = req.params;
    if (!stid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    var subjects = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      subjects = await AutomateSubjectMaster.find({
        $and: [
          {
            stream_type: { $eq: stid },
          },
          {
            subjectName: { $regex: req.query.search, $options: "i" },
          },
          {
            className: { $regex: req.query.search, $options: "i" },
          },
        ],
      }).select("subjectName className co subjectType is_practical");
    } else {
      subjects = await AutomateSubjectMaster.find({
        $and: [
          {
            stream_type: { $eq: stid },
          },
        ],
      })
        .select("subjectName className co subjectType is_practical")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    return res.status(200).send({
      message: "Automate all streams subject master list",
      subjects,
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.automateSubjectMasterAllTeachingPlanQuery = async (req, res) => {
  try {
    const { smid } = req.params;
    const { flow } = req.query;
    if (!smid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const master = await AutomateSubjectMaster.findById(smid);
    var teaching_plan = [];
    let chap_id =
      flow === "Theory"
        ? master.teaching_plan?.theory
        : flow === "Tutorial"
        ? master.teaching_plan?.tutorial
        : master.teaching_plan?.practical;
    if (!["", undefined, ""]?.includes(req.query?.search)) {
      teaching_plan = await AutomateChapter.find({
        $and: [
          {
            _id: { $in: chap_id },
          },
          {
            chapter_name: { $regex: req.query.search, $options: "i" },
          },
        ],
      }).select("chapter_name topic_count chapter_link");
    } else {
      teaching_plan = await AutomateChapter.find({
        $and: [
          {
            _id: { $in: chap_id },
          },
        ],
      })
        .select("chapter_name topic_count chapter_link")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    return res.status(200).send({
      message: "Automate all chapter subject master list",
      teaching_plan,
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.automateTeachingPlanTopicListQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    var teaching_plan = [];
    if (!["", undefined, ""]?.includes(req.query?.search)) {
      teaching_plan = await AutomateChapterTopic.find({
        $and: [
          {
            automate_chapter: { $eq: `${cid}` },
          },
          {
            topic_name: { $regex: req.query.search, $options: "i" },
          },
        ],
      }).select("topic_name topic_last_date topic_link");
    } else {
      teaching_plan = await AutomateChapterTopic.find({
        $and: [
          {
            automate_chapter: { $eq: `${cid}` },
          },
        ],
      })
        .select("topic_name topic_last_date topic_link")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    return res.status(200).send({
      message: "Automate all chapter topic of subject master list",
      teaching_plan,
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.automateInstituteTypeListQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    var institute_type = [];
    if (!["", undefined, ""]?.includes(req.query?.search)) {
      institute_type = await InstituteType.find({
        $and: [
          {
            instituteId: { $eq: `${id}` },
          },
          {
            name: { $regex: req.query.search, $options: "i" },
          },
        ],
      }).select("name");
    } else {
      institute_type = await InstituteType.find({
        $and: [
          {
            instituteId: { $eq: `${id}` },
          },
        ],
      })
        .select("name")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    return res.status(200).send({
      message: "Automate all institute type list",
      institute_type,
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.automateUniversityListQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    var university = [];
    if (!["", undefined, ""]?.includes(req.query?.search)) {
      university = await University.find({
        $and: [
          {
            instituteId: { $eq: `${id}` },
          },
          {
            name: { $regex: req.query.search, $options: "i" },
          },
        ],
      }).select("name");
    } else {
      university = await University.find({
        $and: [
          {
            instituteId: { $eq: `${id}` },
          },
        ],
      })
        .select("name")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    return res.status(200).send({
      message: "Automate all institute type list",
      university,
    });
  } catch (e) {
    console.log(e);
  }
};

// testing done
exports.automateDepartmentTypeListQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    var department_type = [];
    if (!["", undefined, ""]?.includes(req.query?.search)) {
      department_type = await DepartmentType.find({
        $and: [
          {
            instituteId: { $eq: `${id}` },
          },
          {
            name: { $regex: req.query.search, $options: "i" },
          },
        ],
      }).select("name");
    } else {
      department_type = await DepartmentType.find({
        $and: [
          {
            instituteId: { $eq: `${id}` },
          },
        ],
      })
        .select("name")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    return res.status(200).send({
      message: "Automate all institute type list",
      department_type,
    });
  } catch (e) {
    console.log(e);
  }
};
