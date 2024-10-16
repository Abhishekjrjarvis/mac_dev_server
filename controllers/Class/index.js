const Class = require("../../models/Class");
const InstituteAdmin = require("../../models/InstituteAdmin");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const Subject = require("../../models/Subject");
const Student = require("../../models/Student");
const { handle_undefined } = require("../../Handler/customError");
const Batch = require("../../models/Batch");
const { nested_document_limit } = require("../../helper/databaseFunction");
const { cls_json_to_excel } = require("../../Custom/JSONToExcel");
const Department = require("../../models/Department");
// const Checklist = require("../../models/Checklist");

exports.getOneInstitute = async (req, res) => {
  const classDetail = await InstituteAdmin.findById(req.params.id);
  // const classDetailEncrypt = await encryptionPayload(classDetail.classCodeList);
  res.status(200).send({
    message: "code is refreshed",
    classDetail: classDetail.classCodeList,
  });
};

exports.getOneClass = async (req, res) => {
  const classDetail = await Class.findById(req.params.cid);
  // const classEncrypt = await encryptionPayload(classDetail);
  res
    .status(200)
    .send({ message: "code is refreshed", classDetail: classDetail });
};
exports.classRefreshCode = async (req, res) => {
  try {
    const classDetail = await Class.findById(req.params.cid);
    const institute = await InstituteAdmin.findById(classDetail.institute);
    const classRandomCodeHandler = () => {
      const c_1 = Math.floor(Math.random() * 9) + 1;
      const c_2 = Math.floor(Math.random() * 9) + 1;
      const c_3 = Math.floor(Math.random() * 9) + 1;
      const c_4 = Math.floor(Math.random() * 9) + 1;
      const c_5 = Math.floor(Math.random() * 9) + 1;
      const c_6 = Math.floor(Math.random() * 9) + 1;
      var r_class_code = `${c_1}${c_2}${c_3}${c_4}${c_5}${c_6}`;
      return r_class_code;
    };
    const code = classRandomCodeHandler();
    if (institute.classCodeList.includes(classDetail.classCode)) {
      institute.classCodeList.pull(classDetail.classCode);
      institute.classCodeList.push(code);
    } else {
      institute.classCodeList.push(code);
    }
    classDetail.classCode = code;

    await Promise.all([institute.save(), classDetail.save()]);
    // const classCodeEncrypt = await encryptionPayload(code);
    res.status(200).send({ message: "code is refreshed", classCode: code });
  } catch {}
};

exports.classStartDate = async (req, res) => {
  try {
    await Class.findByIdAndUpdate(req.params.cid, req.body);
    // const classes = await Class.findById(req.params.cid);
    // await classDetail.save();
    res.status(200).send({
      message: "start date of class and settings edited",
    });
  } catch {}
};

exports.classReportSetting = async (req, res) => {
  try {
    // await Class.findByIdAndUpdate(req.params.cid, req.body);
    // console.log(req.body);
    const classes = await Class.findById(req.params.cid);
    // console.log(classes.finalReportsSettings);
    if (req.body?.finalReport || req.body?.finalReport === false)
      classes.finalReportsSettings.finalReport = req.body?.finalReport;
    else
      classes.finalReportsSettings.finalReport =
        classes.finalReportsSettings.finalReport;
    if (req.body?.attendance || req.body?.attendance === false)
      classes.finalReportsSettings.attendance = req.body?.attendance;
    else
      classes.finalReportsSettings.attendance =
        classes.finalReportsSettings.attendance;
    if (req.body?.behaviour || req.body?.behaviour === false)
      classes.finalReportsSettings.behaviour = req.body?.behaviour;
    else
      classes.finalReportsSettings.behaviour =
        classes.finalReportsSettings.behaviour;
    if (req.body?.gradeMarks || req.body?.gradeMarks === false)
      classes.finalReportsSettings.gradeMarks = req.body?.gradeMarks;
    else
      classes.finalReportsSettings.gradeMarks =
        classes.finalReportsSettings.gradeMarks;
    classes.finalReportsSettings.aggregatePassingPercentage = req.body
      ?.aggregatePassingPercentage
      ? req.body?.aggregatePassingPercentage
      : classes.finalReportsSettings.aggregatePassingPercentage;
    await classes.save();

    res.status(200).send({
      message: "report settings edited",
    });
  } catch {}
};

exports.renderAllStudentMentors = async (req, res) => {
  try {
    const { sid } = req.params;
    const stu = await handle_undefined(sid);
    if (!stu)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const student = await Student.findById({ _id: stu });
    const classes = await Class.findOne({ _id: `${student?.studentClass}` })
      .select("subject classTeacher classHeadTitle")
      .populate({
        path: "classTeacher",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      });

    const all_subjects = await Subject.find({ _id: { $in: classes?.subject } })
      .populate({
        path: "selected_batch_query",
        select: "class_student_query batchName",
      })
      .select(
        "subjectTeacherName subjectName subjectTitle optionalStudent selected_batch_query"
      )
      .populate({
        path: "subjectTeacherName",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      });

    var ref_subject = [];

    for (var ref of all_subjects) {
      if (ref?.selected_batch_query) {
        if (ref?.selected_batch_query?.class_student_query?.length > 0) {
          for (let ele of ref?.selected_batch_query?.class_student_query) {
            if (`${ele}` === `${stu}`) {
              ref_subject.push(ref);
              break;
            }
          }
        }
      } else {
        if (student?.student_optional_subject_access === "Yes") {
          if (ref?.optionalStudent?.length > 0) {
            for (let ele of ref?.optionalStudent) {
              if (`${ele}` === `${stu}`) {
                ref_subject.push(ref);
                break;
              }
            }
          }
        } else {
          ref_subject.push(ref);
        }
      }
    }

    if (student?.academic_subject?.length > 0) {
      const aca_subject = await Subject.find({
        _id: { $in: student?.academic_subject },
      })
        .select("subjectTeacherName subjectName subjectTitle")
        .populate({
          path: "subjectTeacherName",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        })
        .lean()
        .exec();
      if (aca_subject?.length > 0) {
        for (let acu of aca_subject) {
          if (acu?.subjectTeacherName) {
            ref_subject.push(acu);
          }
        }
      }
    }
    if (ref_subject?.length > 0 || classes) {
      res.status(200).send({
        message: "All Active Mentors ClassTeacher / Subject Teacher",
        access: true,
        classes: classes?.classTeacher,
        all_subjects: ref_subject,
      });
    } else {
      res.status(200).send({
        message: "No Active Mentors",
        access: false,
        all_subjects: [],
        classes: null,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

// exports.createClassChecklist = async (req, res) => {
//   try {
//     const checklist = new Checklist(req.body);
//     res.status(201).send({ message: "checklist is created", checklist });
//   } catch {}
// };

exports.renderNewBatchQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_class = await Class.findById({ _id: cid });
    var new_batch = new Batch({ ...req.body });
    one_class.multiple_batches.push(new_batch?._id);
    one_class.multiple_batches_count += 1;
    new_batch.class_batch_select = one_class?._id;
    await Promise.all([one_class.save(), new_batch.save()]);
    res.status(200).send({ message: "Explore New Batch Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewStudentQuery = async (req, res) => {
  try {
    const { bid } = req.params;
    const { student_arr } = req.body;
    if (!bid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_batch = await Batch.findById({ _id: bid });
    var all_student = await Student.find({ _id: { $in: student_arr } });

    for (var ref of all_student) {
      one_batch.class_student_query.push(ref?._id);
      one_batch.class_student_query_count += 1;
      ref.class_selected_batch.push(one_batch?._id);
      await ref.save();
    }
    await one_batch.save();

    const arr_batch = await Batch.findById({ _id: bid }).populate({
      path: "class_student_query",
      select: "studentROLLNO",
    });
    let arr = [];
    if (arr_batch?.class_student_query?.length > 0) {
      for (let st of arr_batch?.class_student_query) {
        arr.push({
          student: st?._id,
          roll: +st?.studentROLLNO,
        });
      }
      arr = arr?.sort((a, b) => a?.roll - b?.roll);
      let dt = [];
      for (let ft of arr) {
        dt.push(ft?.student);
      }
      arr_batch.class_student_query = dt;
      await arr_batch.save();
    }

    res.status(200).send({
      message: "Explore New Student In One Batch Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllClassBatchQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_class = await Class.findById({ _id: cid }).select(
      "multiple_batches"
    );

    var all_batches = await Batch.find({
      _id: { $in: one_class?.multiple_batches },
    }).select("batchName batchStatus createdAt");
    if (all_batches?.length > 0) {
      res.status(200).send({
        message: "Explore All Batches Query",
        access: true,
        all_batches: all_batches,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Batches Query", access: false, all_batches: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllBatchStudentQuery = async (req, res) => {
  try {
    const { bid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!bid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (search) {
      var valid_batch = await Batch.findById({ _id: bid })
        .select("class_student_query")
        .populate({
          path: "class_student_query",
          match: {
            $or: [
              {
                studentFirstName: { $regex: `${search}`, $options: "i" },
              },
              {
                studentMiddleName: { $regex: `${search}`, $options: "i" },
              },
              {
                studentLastName: { $regex: `${search}`, $options: "i" },
              },
              {
                valid_full_name: { $regex: `${search}`, $options: "i" },
              },
              {
                studentGRNO: { $regex: `${search}`, $options: "i" },
              },
            ],
          },
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO studentROLLNO student_prn_enroll_number class_selected_batch",
          populate: {
            path: "class_selected_batch",
            select: "batchName batchStatus",
          },
        });
      var all_students = [...valid_batch?.class_student_query];
    } else {
      var valid_batch = await Batch.findById({ _id: bid })
        .select("class_student_query")
        .populate({
          path: "class_student_query",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO studentROLLNO student_prn_enroll_number class_selected_batch",
          populate: {
            path: "class_selected_batch",
            select: "batchName batchStatus",
          },
        });

      var all_students = await nested_document_limit(
        page,
        limit,
        valid_batch?.class_student_query
      );
    }

    if (all_students?.length > 0) {
      res.status(200).send({
        message: "Explore One Batch All Students Query",
        access: true,
        all_students: all_students,
      });
    } else {
      res.status(200).send({
        message: "No Students Query",
        access: false,
        all_students: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderBatchDestroyQuery = async (req, res) => {
  try {
    const { bid } = req.params;
    if (!bid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_batch = await Batch.findById({ _id: bid }).select(
      "class_batch_select class_student_query"
    );

    var one_class = await Class.findById({
      _id: `${one_batch?.class_batch_select}`,
    });
    one_class.multiple_batches.pull(one_batch?._id);
    if (one_class.multiple_batches_count > 0) {
      one_class.multiple_batches_count -= 1;
    }

    for (var val of one_batch?.class_student_query) {
      var valid_student = await Student.findById({ _id: `${val}` });
      valid_student.class_selected_batch.pull(one_batch?._id);
      await valid_student.save();
    }

    await one_class.save();
    await Batch.findByIdAndDelete(bid);
    res
      .status(200)
      .send({ message: "Explore Batch Deletion Operation", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDestroyStudentQuery = async (req, res) => {
  try {
    const { bid } = req.params;
    const { student_arr } = req.body;
    if (!bid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_batch = await Batch.findById({ _id: bid });
    var all_student = await Student.find({ _id: { $in: student_arr } });

    for (var ref of all_student) {
      one_batch.class_student_query.pull(ref?._id);
      if (one_batch.class_student_query_count > 0) {
        one_batch.class_student_query_count -= 1;
      }
      ref.class_selected_batch.pull(one_batch?._id);
      await ref.save();
    }
    await one_batch.save();
    res.status(200).send({
      message: "Explore Destroy Student In One Batch Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllStudentSubjectQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { subjectId, today } = req.query;
    var normal_classes = await Class.findById({ _id: cid })
      .select(
        "className classStatus classTitle exams boyCount girlCount studentCount"
      )
      .populate({
        path: "ApproveStudent",
        select:
          "studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO student_prn_enroll_number",
        populate: {
          path: "user class_selected_batch",
          select: "userLegalName username username_chat batchName batchStatus",
        },
      })
      .lean()
      .exec();
    if (subjectId && today) {
      var subject = await Subject.findById(subjectId).populate({
        path: "attendance",
        match: {
          attendDate: { $eq: `${today}` },
        },
      });

      var subjectAttend = await Subject.findById(subjectId).populate({
        path: "attendance",
      });
    }
    var all_students = [];
    if (subjectId) {
      var subject = await Subject.findById(subjectId)
        .select("subjectName")
        .populate({
          path: "optionalStudent",
          select:
            "studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO student_prn_enroll_number",
          populate: {
            path: "user class_selected_batch",
            select:
              "userLegalName username username_chat batchName batchStatus",
          },
        })
        .lean()
        .exec();
      if (subject?.optionalStudent?.length > 0) {
        for (let stu of subject?.optionalStudent) {
          let subjectWise = {
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
            todayStatus: "",
          };
          for (let att of subjectAttend?.attendance ?? []) {
            for (let pre of att?.presentStudent) {
              if (String(stu._id) === String(pre.student))
                subjectWise.presentCount += 1;
            }
            subjectWise.totalCount += 1;
          }
          subjectWise.totalPercentage = (
            (subjectWise.presentCount * 100) /
            subjectWise.totalCount
          ).toFixed(2);
          for (let att of subject?.attendance ?? []) {
            for (let pre of att?.presentStudent) {
              if (String(stu._id) === String(pre.student))
                subjectWise.todayStatus = "P";
            }
            for (let pre of att?.absentStudent) {
              if (String(stu._id) === String(pre.student))
                subjectWise.todayStatus = "A";
            }
          }

          all_students.push({
            ...stu,
            todayStatus: subjectWise.todayStatus,
            totalPercentage: subjectWise.totalPercentage,
          });
        }
      } else {
        if (normal_classes?.ApproveStudent?.length > 0) {
          for (let stu of normal_classes?.ApproveStudent) {
            let subjectWise = {
              presentCount: 0,
              totalCount: 0,
              totalPercentage: 0,
              todayStatus: "",
            };
            for (let att of subjectAttend?.attendance ?? []) {
              for (let pre of att?.presentStudent) {
                if (String(stu._id) === String(pre.student))
                  subjectWise.presentCount += 1;
              }
              subjectWise.totalCount += 1;
            }
            subjectWise.totalPercentage = (
              (subjectWise.presentCount * 100) /
              subjectWise.totalCount
            ).toFixed(2);
            for (let att of subject?.attendance ?? []) {
              for (let pre of att?.presentStudent) {
                if (String(stu._id) === String(pre.student))
                  subjectWise.todayStatus = "P";
              }
              for (let pre of att?.absentStudent) {
                if (String(stu._id) === String(pre.student))
                  subjectWise.todayStatus = "A";
              }
            }

            all_students.push({
              ...stu,
              todayStatus: subjectWise.todayStatus,
              totalPercentage: subjectWise.totalPercentage,
            });
          }
        }
      }
    } else {
      if (normal_classes?.ApproveStudent?.length > 0) {
        for (let stu of normal_classes?.ApproveStudent) {
          let subjectWise = {
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
            todayStatus: "",
          };
          for (let att of subjectAttend?.attendance ?? []) {
            for (let pre of att?.presentStudent) {
              if (String(stu._id) === String(pre.student))
                subjectWise.presentCount += 1;
            }
            subjectWise.totalCount += 1;
          }
          subjectWise.totalPercentage = (
            (subjectWise.presentCount * 100) /
            subjectWise.totalCount
          ).toFixed(2);
          for (let att of subject?.attendance ?? []) {
            for (let pre of att?.presentStudent) {
              if (String(stu._id) === String(pre.student))
                subjectWise.todayStatus = "P";
            }
            for (let pre of att?.absentStudent) {
              if (String(stu._id) === String(pre.student))
                subjectWise.todayStatus = "A";
            }
          }

          all_students.push({
            ...stu,
            todayStatus: subjectWise.todayStatus,
            totalPercentage: subjectWise.totalPercentage,
          });
        }
      }
    }

    var classes = {
      className: normal_classes?.className,
      classStatus: normal_classes?.classStatus,
      classTitle: normal_classes?.classTitle,
      exams: normal_classes?.exams,
      boyCount: normal_classes?.boyCount,
      girlCount: normal_classes?.girlCount,
      studentCount: normal_classes?.studentCount,
      ApproveStudent: all_students,
    };
    // console.log(classes)
    classes?.ApproveStudent?.sort(function (st1, st2) {
      return parseInt(st1.studentROLLNO) - parseInt(st2.studentROLLNO);
    });
    // const cEncrypt = await encryptionPayload(classes);
    res
      .status(200)
      .send({ message: "Approve catalog", classes: classes, normal_classes });
  } catch (e) {
    console.log(e);
  }
};

exports.getClassTabManageQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { flow } = req.query;

    if (!cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    if (flow === "Cls_flow") {
      const cls = await Class.findById(cid);
      const inst = await InstituteAdmin.findById(cls?.institute).select(
        "class_tab_manage"
      );
      res.status(200).send({
        message: "Class Tab Manage toggle",
        tab_manage: inst.class_tab_manage,
      });
    } else {
      const inst = await InstituteAdmin.findById(cid).select(
        "class_tab_manage"
      );
      res.status(200).send({
        message: "Class Tab Manage toggle",
        tab_manage: inst.class_tab_manage,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.updateClassTabManageQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    await InstituteAdmin.findByIdAndUpdate(cid, req.body);
    res.status(200).send({
      message: "Class Tab Manage toggle updated",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getShuffleQuery = async (req, res) => {
  try {
    const { cid } = req?.params;
    const classes = await Class.findById({ _id: cid }).populate({
      path: "ApproveStudent",
      select: "studentFirstName studentMiddleName studentLastName studentGRNO",
    });

    for (var val of classes?.ApproveStudent) {
      var split_g = val?.studentGRNO?.split("undefined");
      val.studentGRNO = `${split_g[1]}`;
      await val.save();
    }

    res.status(200).send({ message: "Sorted" });
  } catch (e) {
    console.log(e);
  }
};

exports.cls_catalog_export_query = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let excel_key = "";
    const cls = await Class.findById(cid)
      .populate({
        path: "ApproveStudent",
        select:
          "studentFirstName studentLastName studentMiddleName studentGRNO studentROLLNO student_prn_enroll_number studentGender studentEmail studentPhoneNumber studentAddress studentParentsPhoneNumber",
      })
      .lean()
      .exec();
    let students = [];

    if (cls?.ApproveStudent?.length > 0) {
      students = cls?.ApproveStudent?.map((stu) => {
        let dObj = {
          GRNO: "",
          "Enrollment / PRN": "",
          RollNo: "",
          Name: "",
          Gender: "",
          Email: "",
          "Mobile No": "",
          "Parent's Mobile No": "",
          Address: "",
        };
        dObj.GRNO = stu?.studentGRNO ?? "N/A";
        dObj["Enrollment / PRN"] = stu?.student_prn_enroll_number
          ? stu?.student_prn_enroll_number
          : "N/A";
        dObj.RollNo = stu?.studentROLLNO;
        dObj.Name = `${
          stu?.studentFirstName +
          " " +
          stu?.studentMiddleName +
          " " +
          stu?.studentLastName
        }`;
        dObj.Gender = stu?.studentGender;
        dObj.Email = stu?.studentEmail ?? "N/A";
        dObj["Mobile No"] = stu?.studentPhoneNumber ?? "N/A";
        dObj["Parent's Mobile No"] = stu?.studentParentsPhoneNumber ?? "N/A";
        dObj.Address = stu?.studentAddress ?? "N/A";
        return dObj;
      });
    }

    if (students?.length > 0) {
      excel_key = await cls_json_to_excel(
        cid,
        students,
        "Catalog Students",
        "CATALOG_STUDENT",
        `catalog-of-student-${cls?.classTitle ?? ""}`
      );
    }
    return res.status(200).send({
      message: "All student zip with catalog.",
      excel_key: excel_key,
    });
  } catch (e) {
    console.log(e);
  }
};

// for batch wise student sort

exports.custom_sort_batch_wise_student_in_class_internal_batch_query = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    console.log("HIT");
    const depart = await Department.find({
      institute: { $eq: `${id}` },
    }).select("departmentSelectBatch");

    let i = 0;
    if (depart?.length > 0) {
      for (let dt of depart) {
        if (dt?.departmentSelectBatch) {
          const cls = await Class.find({
            batch: {
              $eq: `${dt?.departmentSelectBatch}`,
            },
          }).select("multiple_batches");

          if (cls?.length > 0) {
            for (let ct of cls) {
              if (ct?.multiple_batches?.length > 0) {
                for (let bt of ct?.multiple_batches) {
                  ++i;
                  console.log("-> ", i);
                  const arr_batch = await Batch.findById(bt).populate({
                    path: "class_student_query",
                    select: "studentROLLNO",
                  });
                  if (arr_batch?.class_student_query?.length > 0) {
                    let arr = [];

                    for (let st of arr_batch?.class_student_query) {
                      arr.push({
                        student: st?._id,
                        roll: +st?.studentROLLNO,
                      });
                    }
                    arr = arr?.sort((a, b) => a?.roll - b?.roll);
                    let dt = [];
                    for (let ft of arr) {
                      dt.push(ft?.student);
                    }
                    arr_batch.class_student_query = dt;
                    await arr_batch.save();
                  }
                }
              }
            }
          }
        }
      }
    }

    res.status(200).send({
      message: "Custom Sort all student with roll number wise",
      access: true,
      depart,
    });
  } catch (e) {
    console.log(e);
  }
};
