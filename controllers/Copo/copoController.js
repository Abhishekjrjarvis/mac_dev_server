const Attainment = require("../../models/Marks/Attainment");
const SubjectAttainment = require("../../models/Marks/SubjectAttainment");
const SubjectAttainmentMapping = require("../../models/Marks/SubjectAttainmentMapping");
const SubjectMaster = require("../../models/SubjectMaster");
const Subject = require("../../models/Subject");
const Class = require("../../models/Class");
const Student = require("../../models/Student");
const Department = require("../../models/Department");
const Batch = require("../../models/Batch");
const InstituteAdmin = require("../../models/InstituteAdmin");
const {
  generate_excel_to_json_department_po_query,
  generate_excel_to_json_subject_master_co_query,
  getj_subject_one_experiment_query,
} = require("../../Custom/excelToJSON");
const { simple_object } = require("../../S3Configuration");
const SubjectInternalEvaluation = require("../../models/InternalEvaluation/SubjectInternalEvaluation");
const SubjectInternalEvaluationTest = require("../../models/InternalEvaluation/SubjectInternalEvaluationTest");
const {
  subject_internal_evaluation_marks_student_json_to_excel,
  subject_continuous_json_to_excel,
} = require("../../Custom/JSONToExcel");
const StudentTestSet = require("../../models/MCQ/StudentTestSet");
const SubjectMasterTestSet = require("../../models/MCQ/SubjectMasterTestSet");
const SubjectQuestion = require("../../models/MCQ/SubjectQuestion");
const User = require("../../models/User");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const moment = require("moment");
const SubjectContinuousEvaluation = require("../../models/ContinuousEvaluation/SubjectContinuousEvaluation");
const SubjectContinuousEvaluationExperiment = require("../../models/ContinuousEvaluation/SubjectContinuousEvaluationExperiment");
const StudentAssignment = require("../../models/MCQ/StudentAssignment");
const SubjectMarks = require("../../models/Marks/SubjectMarks");

exports.getAllAttainmentQuery = async (req, res) => {
  try {
    const { smid } = req.params;
    const { flow, filter_by } = req.query;
    if (!smid) throw "Please send subject master id to perform operations";
    if (filter_by === "DEPARTMENT") {
      var attainment = await Attainment.find({
        department: { $eq: `${smid}` },
        attainment_type: { $eq: `PO` },
      });

      let po_count = 0;
      for (let att of attainment) {
        if (att?.attainment_type === "PO") {
          po_count += 1;
        }
      }
      res.status(200).send({
        message: "All list of copo in subjects",
        attainment: attainment ? attainment : [],
        attainment_count: attainment?.length,
        attainment_po_count: po_count,
      });
    } else {
      if (flow === "MARKING_COPO") {
        var attainment = await Attainment.find({
          subject_master: { $eq: `${smid}` },
          attainment_type: { $eq: `CO` },
        });
      } else {
        var attainment = await Attainment.find({
          subject_master: { $eq: `${smid}` },
          attainment_type: { $eq: `CO` },
        });
      }

      let po_count = 0;
      for (let att of attainment) {
        if (att?.attainment_type === "PO") {
          po_count += 1;
        }
      }
      res.status(200).send({
        message: "All list of copo in subjects",
        attainment: attainment ? attainment : [],
        attainment_count: attainment?.length,
        attainment_po_count: po_count,
      });
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.addAttainmentQuery = async (req, res) => {
  try {
    const { smid } = req.params;
    if (!smid) throw "Please send subject master id to perform operations";

    const attainment = new Attainment(req.body);
    attainment.attainment_type = req.body?.attainment_type;
    if (req.body?.attainment_type === "CO") {
      attainment.subject_master = smid;
      const subject_master = await SubjectMaster.findById(smid);
      subject_master.co_attainment.push(attainment?._id);
      subject_master.co_attainment_count += 1;
      await subject_master.save();
    } else {
      attainment.department = smid;
      const department = await Department.findById(smid);
      department.po_attainment.push(attainment?._id);
      department.po_attainment_count += 1;
      await department.save();
    }

    await attainment.save();
    res.status(201).send({
      message: "Attainment created by subject master",
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.editAttainmentQuery = async (req, res) => {
  try {
    const { atid } = req.params;
    if (!atid) throw "Please send attainment id to perform operations";
    await Attainment.findByIdAndUpdate(atid, req.body);
    res.status(201).send({
      message: "Attainment is edited success.",
    });
    const attainment = await Attainment.findById(atid);
    if (attainment.attainment_type === "CO") {
      for (let satid of attainment?.subject_attainment) {
        const sub_attainment = await SubjectAttainment.findById(satid);
        sub_attainment.attainment_name = req.body?.attainment_name;
        await sub_attainment.save();
      }
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.destroyAttainmentQuery = async (req, res) => {
  try {
    const { atid } = req.params;
    if (!atid) throw "Please send attainment id to perform operations";
    const attainment = await Attainment.findById(atid);
    if (attainment?.subject_attainment?.length) {
      res.status(200).send({
        message:
          "Attainment is not deleted because it now added somewhere for evaluation.",
      });
    } else {
      if (attainment.attainment_type === "CO") {
        const sub_master = await SubjectMaster.findById(
          attainment?.subject_master
        );
        sub_master.co_attainment.pull(attainment?._id);
        sub_master.co_attainment_count -= 1;
        await sub_master.save();
      } else {
        const department = await Department.findById(attainment?.department);
        department.po_attainment.pull(attainment?._id);
        department.po_attainment_count -= 1;
        await department.save();
      }
      await Attainment.findByIdAndDelete(atid);
      res.status(201).send({
        message: "Attainment is deleted successfully.",
      });
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.editDepartmentAssesmentQuery = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did) throw "Please send department id to perform operations";
    await Department.findByIdAndUpdate(did, req.body);
    res.status(201).send({
      message: "Department is assesment success.",
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.getCoAttainmentTabelQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    // const { smid } = req.query;
    // if (!smid || !sid)
    if (!sid)
      throw "Please send subject master id and subject id to perform operations";

    // const master_attainment = await Attainment.find({
    //   subject_master: { $eq: `${smid}` },
    //   attainment_type: { $eq: "CO" },
    // });
    const subject = await Subject.findById(sid);
    var all_student_ids = [];
    if (subject?.selected_batch_query) {
      const subject_batch = await Batch.findById(subject?.selected_batch_query);
      all_student_ids = subject_batch.class_student_query;
    } else {
      const classes = await Class.findById(subject?.class);
      all_student_ids = classes.ApproveStudent;
    }

    const sub_attainment = await SubjectAttainment.find({
      subject: { $eq: `${sid}` },
    })
      .populate({
        path: "attainment",
        select: "attainment_target",
      })
      .lean()
      .exec();

    const all_students = await Student.find({
      _id: { $in: all_student_ids },
    })
      .populate({
        path: "subjectMarks",
        match: {
          subject: { $eq: `${sid}` },
        },
      })
      .populate({
        path: "assignments",
        match: {
          subject: { $eq: `${sid}` },
        },
      })
      .select(
        "studentFirstName studentMiddleName studentLastName studentProfilePhoto studentROLLNO studentGRNO"
      )
      .lean()
      .exec();

    var modify_student = [];

    var uni_co_wise = {};
    var uni_co_assignment_wise = {};
    var uni_co_assignment_wise_internal = {};
    var uni_co_assignment_wise_external = {};
    if (all_students?.length > 0) {
      for (let stu of all_students) {
        let stu_obj = {
          studentFirstName: stu?.studentFirstName,
          studentMiddleName: stu?.studentMiddleName,
          studentLastName: stu?.studentLastName,
          studentProfilePhoto: stu?.studentProfilePhoto,
          studentGRNO: stu?.studentGRNO,
          studentROLLNO: stu?.studentROLLNO,
          marks: [],
          co_wise: "",
          co_assignment_wise: "",
        };
        let co_wise = {};
        if (stu?.subjectMarks?.[0]?.marks?.length > 0) {
          for (let sub_marks of stu?.subjectMarks?.[0]?.marks) {
            if (sub_attainment?.length > 0) {
              for (let sub_att of sub_attainment) {
                if (sub_att?.attainment_assign?.length > 0) {
                  for (let assign_att of sub_att?.attainment_assign) {
                    if (
                      String(assign_att?.examId) === String(sub_marks?.examId)
                    ) {
                      let mark = +(
                        (sub_marks?.obtainMarks *
                          assign_att?.attainment_mark_weight) /
                        100
                      ).toFixed(2);

                      co_wise[sub_att.attainment_name] =
                        co_wise[sub_att.attainment_name]?.length > 0
                          ? [...co_wise[sub_att.attainment_name], mark]
                          : [mark];
                      if (uni_co_wise[sub_att.attainment_name]) {
                        if (
                          String(
                            uni_co_wise[sub_att.attainment_name][
                              assign_att?.examId
                            ]?.examId
                          ) === String(assign_att?.examId)
                        ) {
                          uni_co_wise[sub_att.attainment_name][
                            assign_att?.examId
                          ].mark =
                            uni_co_wise[sub_att.attainment_name][
                              assign_att?.examId
                            ].mark + mark;
                        } else {
                          uni_co_wise[sub_att.attainment_name] = {
                            ...uni_co_wise[sub_att.attainment_name],
                            [assign_att?.examId]: {
                              attainment_name: assign_att?.attainment_name,
                              examId: assign_att?.examId,
                              mark: mark,
                            },
                          };
                        }
                      } else {
                        uni_co_wise[sub_att.attainment_name] = {
                          ...uni_co_wise[sub_att.attainment_name],
                          [assign_att?.examId]: {
                            attainment_name: assign_att?.attainment_name,
                            examId: assign_att?.examId,
                            mark: mark,
                          },
                        };
                      }

                      stu_obj.marks.push(+mark);
                    }
                  }
                }
              }
            }
          }
        }

        let co_assignment_wise = {};

        for (let assignment of stu?.assignments) {
          for (let sub_att of sub_attainment) {
            for (let assign_att of sub_att?.attainment_assign) {
              if (
                String(assign_att?.assignmentId) ===
                String(assignment?.assignment)
              ) {
                let mark = +(
                  (assignment?.assignment_obtain_mark *
                    assign_att?.attainment_mark_weight) /
                  100
                ).toFixed(2);

                co_assignment_wise[sub_att.attainment_name] =
                  co_assignment_wise[sub_att.attainment_name]
                    ? co_assignment_wise[sub_att.attainment_name] + mark
                    : mark;

                if (uni_co_assignment_wise[sub_att.attainment_name]) {
                  if (
                    String(
                      uni_co_assignment_wise[sub_att.attainment_name][
                        assign_att?.assignmentId
                      ]?.assignmentId
                    ) === String(assign_att?.assignmentId)
                  ) {
                    uni_co_assignment_wise[sub_att.attainment_name][
                      assign_att?.assignmentId
                    ].mark =
                      uni_co_assignment_wise[sub_att.attainment_name][
                        assign_att?.assignmentId
                      ].mark + mark;
                  } else {
                    uni_co_assignment_wise[sub_att.attainment_name] = {
                      ...uni_co_assignment_wise[sub_att.attainment_name],
                      [assign_att?.assignmentId]: {
                        attainment_name: assign_att?.attainment_name,
                        assignmentId: assign_att?.assignmentId,
                        mark: mark,
                      },
                    };
                  }
                } else {
                  uni_co_assignment_wise[sub_att.attainment_name] = {
                    ...uni_co_assignment_wise[sub_att.attainment_name],
                    [assign_att?.assignmentId]: {
                      attainment_name: assign_att?.attainment_name,
                      assignmentId: assign_att?.assignmentId,
                      mark: mark,
                    },
                  };
                }

                stu_obj.marks.push(+mark);
              }
              if (assign_att?.copo_attainment_type === "INTERNAL") {
                if (
                  String(assign_att?.assignmentId) ===
                  String(assignment?.assignment)
                ) {
                  let mark = +(
                    (assignment?.assignment_obtain_mark *
                      assign_att?.attainment_mark_weight) /
                    100
                  ).toFixed(2);

                  if (
                    uni_co_assignment_wise_internal[sub_att.attainment_name]
                  ) {
                    if (
                      String(
                        uni_co_assignment_wise_internal[
                          sub_att.attainment_name
                        ][assign_att?.assignmentId]?.assignmentId
                      ) === String(assign_att?.assignmentId)
                    ) {
                      uni_co_assignment_wise_internal[sub_att.attainment_name][
                        assign_att?.assignmentId
                      ].mark =
                        uni_co_assignment_wise_internal[
                          sub_att.attainment_name
                        ][assign_att?.assignmentId].mark + mark;
                    } else {
                      uni_co_assignment_wise_internal[sub_att.attainment_name] =
                        {
                          ...uni_co_assignment_wise_internal[
                            sub_att.attainment_name
                          ],
                          [assign_att?.assignmentId]: {
                            attainment_name: assign_att?.attainment_name,
                            assignmentId: assign_att?.assignmentId,
                            mark: mark,
                            present_student: assign_att.present_student_count,
                            attainment_mark: assign_att.attainment_mark,
                          },
                        };
                    }
                  } else {
                    uni_co_assignment_wise_internal[sub_att.attainment_name] = {
                      ...uni_co_assignment_wise_internal[
                        sub_att.attainment_name
                      ],
                      [assign_att?.assignmentId]: {
                        attainment_name: assign_att?.attainment_name,
                        assignmentId: assign_att?.assignmentId,
                        mark: mark,
                        present_student: assign_att.present_student_count,
                        attainment_mark: assign_att.attainment_mark,
                      },
                    };
                  }
                }
              } else {
                if (
                  String(assign_att?.assignmentId) ===
                  String(assignment?.assignment)
                ) {
                  let mark = +(
                    (assignment?.assignment_obtain_mark *
                      assign_att?.attainment_mark_weight) /
                    100
                  ).toFixed(2);

                  if (
                    uni_co_assignment_wise_external[sub_att.attainment_name]
                  ) {
                    if (
                      String(
                        uni_co_assignment_wise_external[
                          sub_att.attainment_name
                        ][assign_att?.assignmentId]?.assignmentId
                      ) === String(assign_att?.assignmentId)
                    ) {
                      uni_co_assignment_wise_external[sub_att.attainment_name][
                        assign_att?.assignmentId
                      ].mark =
                        uni_co_assignment_wise_external[
                          sub_att.attainment_name
                        ][assign_att?.assignmentId].mark + mark;
                    } else {
                      uni_co_assignment_wise_external[sub_att.attainment_name] =
                        {
                          ...uni_co_assignment_wise_external[
                            sub_att.attainment_name
                          ],
                          [assign_att?.assignmentId]: {
                            attainment_name: assign_att?.attainment_name,
                            assignmentId: assign_att?.assignmentId,
                            mark: mark,
                            present_student: assign_att.present_student_count,
                            attainment_mark: assign_att.attainment_mark,
                          },
                        };
                    }
                  } else {
                    uni_co_assignment_wise_external[sub_att.attainment_name] = {
                      ...uni_co_assignment_wise_external[
                        sub_att.attainment_name
                      ],
                      [assign_att?.assignmentId]: {
                        attainment_name: assign_att?.attainment_name,
                        assignmentId: assign_att?.assignmentId,
                        mark: mark,
                        present_student: assign_att.present_student_count,
                        attainment_mark: assign_att.attainment_mark,
                      },
                    };
                  }
                }
              }
            }
          }
        }
        stu_obj.co_wise = co_wise;
        stu_obj.co_assignment_wise = co_assignment_wise;
        modify_student.push(stu_obj);
      }
    }

    const subject_attainment = [];
    let co_weightage_total = {};
    if (sub_attainment?.length > 0) {
      for (let sub_att of sub_attainment) {
        let sub_obj = {
          attainment_name: sub_att?.attainment_name,
          attainment_target: sub_att?.attainment?.attainment_target,
          attainment_assign: [],
        };
        let assignment_obj = {
          attainment_assign_type: "ASSIGNMENT",
          attainment_name: "ASSIGNMENT",
          attainment_mark: 0,
          attainment_mark_weight: 0,
          assignmentId: [],
          assignment_count: 0,
          student_count: 0,
          present_student_count: 0,
          absent_student_count: 0,
          total_marks: {
            mark: 0,
          },
          avg_marks: 0,
          cls_avg_marks: 0,
        };
        if (sub_att?.attainment_assign?.length > 0) {
          for (let att_assign of sub_att?.attainment_assign) {
            if (att_assign?.attainment_assign_type === "ASSIGNMENT") {
              assignment_obj.attainment_mark += att_assign?.attainment_mark;
              assignment_obj.attainment_mark_weight = +(
                (assignment_obj.attainment_mark_weight +
                  att_assign?.attainment_mark_weight) /
                2
              ).toFixed(2);
              assignment_obj.assignment_count += 1;
              assignment_obj.student_count += att_assign?.student_count;
              assignment_obj.present_student_count +=
                att_assign?.present_student_count;
              assignment_obj.absent_student_count +=
                att_assign?.absent_student_count;

              assignment_obj.total_marks.mark +=
                +uni_co_assignment_wise[sub_att?.attainment_name]?.[
                  att_assign?.assignmentId
                ]?.mark?.toFixed(2);

              let a_t_avg = +(
                assignment_obj.total_marks.mark /
                att_assign?.present_student_count
              ).toFixed(3);
              assignment_obj.avg_marks += a_t_avg;
              assignment_obj.cls_avg_marks += +(
                a_t_avg / att_assign?.attainment_mark
              ).toFixed(3);
              assignment_obj.assignmentId.push(att_assign?.assignmentId);
              if (co_weightage_total["ASSIGNMENT"]) {
                co_weightage_total["ASSIGNMENT"] += att_assign.attainment_mark;
              } else {
                co_weightage_total["ASSIGNMENT"] = att_assign.attainment_mark;
              }

              assignment_obj.total_marks.mark =
                +assignment_obj.total_marks.mark?.toFixed(2);
              assignment_obj.avg_marks = +assignment_obj.avg_marks?.toFixed(2);
            } else {
              let t_avg = +(
                uni_co_wise[sub_att?.attainment_name]?.[att_assign?.examId]
                  ?.mark / att_assign?.present_student_count
              ).toFixed(3);
              sub_obj.attainment_assign.push({
                ...att_assign,
                total_marks: {
                  attainment_name:
                    uni_co_wise[sub_att?.attainment_name]?.[att_assign?.examId][
                      "attainment_name"
                    ],
                  examId:
                    uni_co_wise[sub_att?.attainment_name]?.[att_assign?.examId][
                      "examId"
                    ],
                  mark: +uni_co_wise[sub_att?.attainment_name]?.[
                    att_assign?.examId
                  ]["mark"]?.toFixed(2),
                  // ...uni_co_wise[sub_att?.attainment_name]?.[att_assign?.examId],
                },
                avg_marks: t_avg,
                cls_avg_marks: +(t_avg / att_assign?.attainment_mark).toFixed(
                  3
                ),
              });
              if (co_weightage_total[att_assign.examId]) {
                if (
                  String(co_weightage_total[att_assign.examId]?.examId) ===
                  String(att_assign?.examId)
                ) {
                  co_weightage_total[att_assign.examId].exam_wise_total =
                    co_weightage_total[att_assign.examId].exam_wise_total +
                    att_assign.attainment_mark;
                } else {
                  co_weightage_total[att_assign.examId] = {
                    attainment_name: att_assign?.attainment_name,
                    examId: att_assign?.examId,
                    exam_wise_total: att_assign.attainment_mark,
                  };
                }
              } else {
                co_weightage_total[att_assign.examId] = {
                  attainment_name: att_assign?.attainment_name,
                  examId: att_assign?.examId,
                  exam_wise_total: att_assign.attainment_mark,
                };
              }
            }
          }
        }

        if (assignment_obj?.assignment_count) {
          sub_obj.attainment_assign.push(assignment_obj);
        }

        subject_attainment.push(sub_obj);
      }
    }

    let co_weightage = {
      key0: ["CO"],
      key_count: 0,
    };
    let co_weightage_assignment = ["ASSIGNMENT"];
    if (sub_attainment?.length > 0) {
      for (let sub_att of sub_attainment) {
        let co_weightage_count = 0;
        co_weightage["key0"].push(sub_att?.attainment_name);

        let assignment_obj = {
          attainment_mark: 0,
        };
        if (sub_att?.attainment_assign?.length > 0) {
          for (let att_assign of sub_att?.attainment_assign) {
            if (att_assign?.attainment_assign_type === "ASSIGNMENT") {
              assignment_obj.attainment_mark += att_assign?.attainment_mark;
            } else {
              co_weightage_count += 1;
              for (let tt in co_weightage) {
                if (tt === "key0" || tt === "key_count") {
                } else {
                  if (
                    `${co_weightage[tt]?.[0]?.examId}` ===
                    `${att_assign.examId}`
                  ) {
                    co_weightage_count = +tt?.substring(3);
                  }
                }
              }

              if (co_weightage[`key${co_weightage_count}`]?.length > 0) {
                if (
                  `${co_weightage[`key${co_weightage_count}`]?.[0]?.examId}` ===
                  `${att_assign.examId}`
                ) {
                  co_weightage[`key${co_weightage_count}`]?.push({
                    attainment_name: att_assign.attainment_name,
                    marks: att_assign.attainment_mark,
                    examId: att_assign.examId,
                    name: sub_att?.attainment_name,
                  });
                } else {
                  co_weightage.key_count += 1;
                  co_weightage[`key${co_weightage.key_count}`]?.push({
                    attainment_name: att_assign.attainment_name,
                    marks: att_assign.attainment_mark,
                    examId: att_assign.examId,
                    name: sub_att?.attainment_name,
                  });
                }
              } else {
                co_weightage[`key${co_weightage_count}`] = [
                  {
                    attainment_name: att_assign.attainment_name,
                    marks: att_assign.attainment_mark,
                    examId: att_assign.examId,
                    name: sub_att?.attainment_name,
                  },
                ];
              }
            }
          }
        }

        co_weightage_assignment.push(assignment_obj.attainment_mark);
        if (!co_weightage.key_count)
          co_weightage.key_count = co_weightage_count;
      }
    }
    co_weightage[`key_assignment`] = co_weightage_assignment;

    for (let tt in co_weightage) {
      if (tt === "key0" || tt === "key_count") {
      } else {
        if (co_weightage[tt]?.[0] === "ASSIGNMENT") {
          co_weightage[tt].push(co_weightage_total["ASSIGNMENT"]);
        } else {
          co_weightage[tt].push({
            attainment_name:
              co_weightage_total[co_weightage[tt]?.[0]?.examId]
                ?.attainment_name,
            marks:
              co_weightage_total[co_weightage[tt]?.[0]?.examId]
                ?.exam_wise_total,
            examId: co_weightage_total[co_weightage[tt]?.[0]?.examId]?.examId,
            name: co_weightage[tt]?.[0]?.name,
          });
        }
      }
    }

    let outer_cls_average_ia = {
      co_list: [],
      co_attainment_name_list: [],
      insertedExam: [],
    };
    if (subject_attainment?.length > 0) {
      for (let sub_avg of subject_attainment) {
        if (outer_cls_average_ia.co_list?.includes(sub_avg.attainment_name)) {
        } else {
          outer_cls_average_ia.co_list?.push(sub_avg.attainment_name);
        }

        outer_cls_average_ia[sub_avg.attainment_name] = {
          c_total: 0,
          c_avg_total: 0,
          count: 1,
          list: [],
          assingment_co: null,
        };
        if (sub_avg?.attainment_assign?.length > 0) {
          for (let co_avg of sub_avg?.attainment_assign) {
            if (co_avg?.copo_attainment_type === "INTERNAL") {
              if (co_avg?.attainment_assign_type === "ASSIGNMENT") {
              } else {
                if (
                  outer_cls_average_ia.insertedExam?.includes(
                    `${co_avg?.examId}`
                  )
                ) {
                } else {
                  outer_cls_average_ia.insertedExam.push(`${co_avg?.examId}`);
                  outer_cls_average_ia.co_attainment_name_list?.push(
                    co_avg.attainment_name
                  );
                }
              }
              outer_cls_average_ia[sub_avg.attainment_name].c_total +=
                co_avg?.cls_avg_marks;
              outer_cls_average_ia[sub_avg.attainment_name].list.push(
                co_avg?.cls_avg_marks
              );
              outer_cls_average_ia[sub_avg.attainment_name].count += 1;
            }
          }
        }

        let assingment_co = {
          marks: 0,
          count: 0,
          avg_marks: 0,
        };
        for (let assign in uni_co_assignment_wise_internal[
          sub_avg.attainment_name
        ]) {
          assingment_co.marks += +(
            uni_co_assignment_wise_internal[sub_avg.attainment_name][assign]
              ?.mark /
            uni_co_assignment_wise_internal[sub_avg.attainment_name][assign]
              ?.present_student /
            uni_co_assignment_wise_internal[sub_avg.attainment_name][assign]
              ?.attainment_mark
          )?.toFixed(3);
          assingment_co.count += 1;
        }

        assingment_co.avg_marks = +(
          assingment_co.marks / assingment_co.count
        ).toFixed(3);

        let a_total =
          +outer_cls_average_ia[sub_avg.attainment_name].c_total +
          assingment_co?.avg_marks;

        outer_cls_average_ia[sub_avg.attainment_name].c_avg_total = Math.ceil(
          (a_total / outer_cls_average_ia[sub_avg.attainment_name].count) * 100
        );
        outer_cls_average_ia[sub_avg.attainment_name].list?.push(
          assingment_co?.avg_marks
        );
        outer_cls_average_ia[sub_avg.attainment_name].assingment_co =
          assingment_co;
        if (
          outer_cls_average_ia.co_attainment_name_list?.includes("Assignment")
        ) {
        } else {
          outer_cls_average_ia.co_attainment_name_list?.push("Assignment");
        }
      }
    }

    let outer_cls_average_ea = {
      co_list: [],
      co_attainment_name_list: [],
      insertedExam: [],
    };
    if (subject_attainment?.length > 0) {
      for (let sub_avg of subject_attainment) {
        if (outer_cls_average_ea.co_list?.includes(sub_avg.attainment_name)) {
        } else {
          outer_cls_average_ea.co_list?.push(sub_avg.attainment_name);
        }

        outer_cls_average_ea[sub_avg.attainment_name] = {
          c_total: 0,
          c_avg_total: 0,
          count: 1,
          list: [],
          assingment_co: null,
        };
        if (sub_avg?.attainment_assign?.length > 0) {
          for (let co_avg of sub_avg?.attainment_assign) {
            if (co_avg?.copo_attainment_type === "EXTERNAL") {
              if (co_avg?.attainment_assign_type === "ASSIGNMENT") {
              } else {
                if (
                  outer_cls_average_ea.insertedExam?.includes(
                    `${co_avg?.examId}`
                  )
                ) {
                } else {
                  outer_cls_average_ea.insertedExam.push(`${co_avg?.examId}`);
                  outer_cls_average_ea.co_attainment_name_list?.push(
                    co_avg.attainment_name
                  );
                }
              }
              outer_cls_average_ea[sub_avg.attainment_name].c_total +=
                co_avg?.cls_avg_marks;
              outer_cls_average_ea[sub_avg.attainment_name].list.push(
                co_avg?.cls_avg_marks
              );
              outer_cls_average_ea[sub_avg.attainment_name].count += 1;
            }
          }
        }

        let assingment_co = {
          marks: 0,
          count: 0,
          avg_marks: 0,
        };
        for (let assign in uni_co_assignment_wise_external[
          sub_avg.attainment_name
        ]) {
          assingment_co.marks += +(
            uni_co_assignment_wise_external[sub_avg.attainment_name][assign]
              ?.mark /
            uni_co_assignment_wise_external[sub_avg.attainment_name][assign]
              ?.present_student /
            uni_co_assignment_wise_external[sub_avg.attainment_name][assign]
              ?.attainment_mark
          )?.toFixed(3);
          assingment_co.count += 1;
        }

        assingment_co.avg_marks = +(
          assingment_co.marks / assingment_co.count
        ).toFixed(3);

        let a_total =
          +outer_cls_average_ea[sub_avg.attainment_name].c_total +
          assingment_co?.avg_marks;

        outer_cls_average_ea[sub_avg.attainment_name].c_avg_total = Math.ceil(
          (a_total / outer_cls_average_ea[sub_avg.attainment_name].count) * 100
        );
        outer_cls_average_ea[sub_avg.attainment_name].list?.push(
          assingment_co?.avg_marks
        );
        outer_cls_average_ea[sub_avg.attainment_name].assingment_co =
          assingment_co;

        if (
          outer_cls_average_ea.co_attainment_name_list?.includes("Assignment")
        ) {
        } else {
          outer_cls_average_ea.co_attainment_name_list?.push("Assignment");
        }
      }
    }

    const classes = await Class.findById(subject.class)
      .populate({
        path: "department",
        select: "internal_assesment external_assesment",
      })
      .select("department")
      .lean()
      .exec();
    let calculation_co_attainment = {
      heading: `Calculation of CO Attainment=${classes?.department?.internal_assesment}% IA + ${classes?.department?.external_assesment}% EA`,
      direct_heading: `Direct CO Attainment ${
        classes?.department?.internal_assesment / 100
      } IA + ${classes?.department?.external_assesment / 100} EA`,
      co_list: [
        ...new Set([
          ...outer_cls_average_ia?.co_list,
          ...outer_cls_average_ea?.co_list,
        ]),
      ],
    };

    if (calculation_co_attainment?.co_list?.length > 0) {
      for (let co of calculation_co_attainment.co_list) {
        let ia_attainment =
          +(
            outer_cls_average_ia[co]?.c_avg_total *
            classes?.department?.internal_assesment
          ) / 100;
        let ea_attainment =
          +(
            outer_cls_average_ea[co]?.c_avg_total *
            classes?.department?.external_assesment
          ) / 100;
        calculation_co_attainment[co] = {
          // ia_attainment: ia_attainment,
          // ea_attainment: ea_attainment,
          ia_avg: ia_attainment.toFixed(3),
          ea_avg: ea_attainment.toFixed(3),
          direct_co: Math.ceil(ia_attainment + ea_attainment),
        };
      }
    }

    let co_quality_compliance = {
      co_list: calculation_co_attainment["co_list"],
    };
    if (subject_attainment?.length > 0) {
      for (let sub_avg of subject_attainment) {
        let gap =
          calculation_co_attainment[sub_avg?.attainment_name]?.["direct_co"] -
          sub_avg?.attainment_target;
        co_quality_compliance[sub_avg?.attainment_name] = {
          attainment_name: sub_avg?.attainment_name,
          attainment_target: sub_avg?.attainment_target,
          co_attainment_gap: gap,
          action_praposed_to_bridge_gap:
            gap > 0
              ? "Co Over Achived"
              : gap === 0
              ? "Co Achived"
              : "Do not now",
          modification_of_target_where_achived: " - ",
        };
      }
    }

    res.status(200).send({
      message: "Co attainment first table data",
      // uni_co_assignment_wise_external: uni_co_assignment_wise_external,
      // uni_co_assignment_wise_internal: uni_co_assignment_wise_internal,
      // uni_co_assignment_wise,
      // uni_co_wise,
      co_weightage_total: co_weightage_total,
      co_quality_compliance: co_quality_compliance,
      calculation_co_attainment: calculation_co_attainment,
      outer_cls_average_ia: outer_cls_average_ia,
      outer_cls_average_ea: outer_cls_average_ea,
      co_weightage: co_weightage,
      subject_attainment: subject_attainment,
      all_students: modify_student,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.getCopoMappingQuery = async (req, res) => {
  try {
    const { sid } = req.params;

    if (!sid) throw "Please send subject id to perform operations";
    const subject = await Subject.findById(sid).populate({
      path: "subject_attainment_mapping",
    });
    const master_attainment = await Attainment.find({
      subject_master: { $eq: `${subject.subjectMasterName}` },
    });
    let copo_mapping = {
      co_list: [],
      po_list: [],
      des: {},
    };
    let other_copo_mapping = {
      co_list_Id: [],
      po_list_Id: [],
    };

    for (let attain of master_attainment) {
      if (attain.attainment_type === "CO") {
        copo_mapping.co_list.push(attain.attainment_name);
        other_copo_mapping.co_list_Id.push({
          attainment_name: attain.attainment_name,
          _id: attain._id,
        });
      } else {
        copo_mapping.po_list.push(attain.attainment_name);
        copo_mapping.des[attain.attainment_name] =
          attain.attainment_description;
        other_copo_mapping.po_list_Id.push({
          attainment_name: attain.attainment_name,
          _id: attain._id,
        });
      }
    }

    for (let co of other_copo_mapping.co_list_Id) {
      for (let po of other_copo_mapping.po_list_Id) {
        let co_rel = "";
        if (subject?.subject_attainment_mapping?.length > 0) {
          for (let rel of subject?.subject_attainment_mapping[0]?.copo) {
            if (`${rel?.copoId}` === `${co?._id}${po?._id}`) {
              co_rel = rel.co_relation;
            }
          }
        }
        copo_mapping[`${co.attainment_name}${po.attainment_name}`] = {
          co_relation: co_rel,
          descriptio: copo_mapping.des[po.attainment_name] ?? "",
          coId: co?._id,
          poId: po?._id,
        };
      }
    }
    res.status(200).send({
      message: "Co-po-mapping attainment data",
      copo_mapping: copo_mapping,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.updateCopoMappingQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { copo } = req.body;

    if (!sid) throw "Please send  subject id to perform operations";
    var mapping = await SubjectAttainmentMapping.findOne({
      subject: { $eq: `${sid}` },
    });
    if (mapping) {
      for (let bcopo in copo) {
        let cos = copo[bcopo];
        if (cos?.value) {
          for (let mcopo of mapping?.copo) {
            if (`${mcopo?.copoId}` === `${cos?.key}`) {
              mcopo.co_relation = cos?.value;
            } else {
              mapping?.copo.push({
                copoId: cos?.key,
                poId: cos?.poId,
                coId: cos?.coId,
                co_relation: cos?.value,
              });
            }
          }
        }
      }
      await mapping.save();
    } else {
      const subject = await Subject.findById(sid);
      var mapping = new SubjectAttainmentMapping({
        subject: sid,
      });
      for (let bcopo in copo) {
        let cos = copo[bcopo];
        if (cos?.value) {
          mapping?.copo.push({
            copoId: cos?.key,
            poId: cos?.poId,
            coId: cos?.coId,
            co_relation: cos?.value,
          });
        }
      }
      subject.subject_attainment_mapping.push(mapping?._id);
      await Promise.all([subject.save(), mapping.save()]);
    }
    res.status(200).send({
      message: "Co-po-mapping attainment data",
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.getDepartmentPoExcelQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { excel_file } = req.body;
    if (!did) throw "Please send department id to perform operations";
    const department = await Department.findById(did);
    const one_ins = await InstituteAdmin.findById({
      _id: `${department?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      departId: department?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "PO Excel Update To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${department?.institute}`,
    });
    var key;

    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.departId}` === `${department?._id}`
      ) {
        key = ref?.excel_file;
      }
    }

    const val = await simple_object(key);
    const is_converted = await generate_excel_to_json_department_po_query(val);
    if (is_converted?.value) {
      for (let attain of is_converted?.po_list) {
        const attainment = new Attainment({
          attainment_name: attain?.attainment_name,
          attainment_type: "PO",
          attainment_description: attain?.attainment_description,
          department: department?._id,
        });
        department.po_attainment.push(attainment?._id);
        department.po_attainment_count += 1;
        await attainment.save();
      }
      await department.save();
    } else {
      console.log("false");
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.getSubjectCoExcelQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { excel_file } = req.body;
    if (!did) throw "Please send department id to perform operations";
    const department = await Department.findById(did);
    const one_ins = await InstituteAdmin.findById({
      _id: `${department?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      departId: department?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "CO Excel Update To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${department?.institute}`,
    });
    var key;

    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.departId}` === `${department?._id}`
      ) {
        key = ref?.excel_file;
      }
    }

    const val = await simple_object(key);
    const is_converted = await generate_excel_to_json_subject_master_co_query(
      val
    );
    if (is_converted?.value) {
      for (let attain of is_converted?.co_list) {
        const sub_master = await SubjectMaster.findOne({
          course_code: { $eq: `${attain?.attainment_code}` },
        });
        // console.log("sub_master", sub_master?.course_code);
        const attainment = new Attainment({
          attainment_name: attain?.attainment_name,
          attainment_type: "CO",
          attainment_description: attain?.attainment_description,
          attainment_target: attain?.attainment_target,
          attainment_code: attain?.attainment_code,
          subject_master: sub_master?._id,
        });
        sub_master.co_attainment.push(attainment?._id);
        sub_master.co_attainment_count += 1;
        await Promise.all([attainment.save(), sub_master.save()]);
      }
    } else {
      console.log("false");
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

// for subject internal evaluation
exports.subjectTeacherAllInternalEvaluationQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    var i_eva = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      i_eva = await SubjectInternalEvaluation.find({
        $and: [
          {
            subject: { $eq: `${sid}` },
          },
          {
            $or: [
              {
                name: { $regex: req.query.search, $options: "i" },
              },
              {
                out_of: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      }).select("name out_of");
    } else {
      i_eva = await SubjectInternalEvaluation.find({
        $and: [
          {
            subject: { $eq: `${sid}` },
          },
        ],
      })
        .select("name out_of")
        .sort("-1")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "Internal Evaluation All list.",
      i_eva: i_eva,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTeacherAddInternalEvaluationQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { name, out_of } = req.body;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const subject = await Subject.findById(sid);
    const i_eva = new SubjectInternalEvaluation({
      name: name,
      out_of: out_of,
      subject: sid,
      class: subject?.class,
    });
    subject.internal_evaluation.push(i_eva?._id);
    await Promise.all([i_eva.save(), subject.save()]);
    res.status(200).send({
      message: "Internal Evaluation added successfully.",
    });
    if (subject?.class) {
      let cls = await Class.findById(subject?.class);
      i_eva.department = cls?.department;
      i_eva.institute = cls?.institute;
      await i_eva.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTeacherUpdateInternalEvaluationQuery = async (req, res) => {
  try {
    const { ieid } = req.params;
    const { name, out_of } = req.body;
    if (!ieid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const i_eva = await SubjectInternalEvaluation.findById(ieid);
    if (i_eva?.internal_evaluation_test?.length > 0) {
      res.status(200).send({
        message: "Internal Evaluation edited not allowed.",
      });
    } else {
      i_eva.name = name;
      i_eva.out_of = out_of;
      await i_eva.save();
      res.status(200).send({
        message: "Internal Evaluation edited successfully.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTeacherRemoveInternalEvaluationQuery = async (req, res) => {
  try {
    const { ieid } = req.params;
    if (!ieid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const i_eva = await SubjectInternalEvaluation.findById(ieid);
    if (i_eva?.internal_evaluation_test?.length > 0) {
      res.status(200).send({
        message: "Internal Evaluation deleted not allowed.",
      });
    } else {
      const sub = await Subject.findById(i_eva?.subject);
      sub.internal_evaluation.pull(i_eva?._id);
      await sub.save();
      await SubjectInternalEvaluation.findByIdAndDelete(ieid);
      res.status(200).send({
        message: "Internal Evaluation deleted successfully.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.subjectTeacherStudentInternalEvaluationQuery = async (req, res) => {
  try {
    const { ieid } = req.params;
    if (!ieid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const i_eva = await SubjectInternalEvaluation.findById(ieid).select(
      "student_list"
    );

    const student_list = {};

    if (i_eva?.student_list?.length > 0) {
      for (let dfg of i_eva?.student_list) {
        student_list[dfg?.student] = dfg?.obtain_marks;
      }
    }

    res.status(200).send({
      message: "Internal Evaluation All list.",
      student_list: student_list,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTeacherAllInternalEvaluationTestQuery = async (req, res) => {
  try {
    const { ieid } = req.params;
    if (!ieid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    var i_eva_test = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      i_eva_test = await SubjectInternalEvaluationTest.find({
        $and: [
          {
            internal_evaluation: { $eq: `${ieid}` },
          },
          {
            $or: [
              {
                name: { $regex: req.query.search, $options: "i" },
              },
              {
                out_of: { $regex: req.query.search, $options: "i" },
              },
              {
                test_type: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "testset",
          select: "testName testTotalQuestion testTotalNumber",
        })
        .select("name test_type out_of conversion_rate");
    } else {
      i_eva_test = await SubjectInternalEvaluationTest.find({
        $and: [
          {
            internal_evaluation: { $eq: `${ieid}` },
          },
        ],
      })
        .sort({
          createdAt: "-1",
        })
        .skip(dropItem)
        .limit(itemPerPage)
        .populate({
          path: "testset",
          select: "testName testTotalQuestion testTotalNumber",
        })
        .select("name test_type out_of conversion_rate");
    }

    res.status(200).send({
      message: "Internal Evaluation Test All list.",
      i_eva_test: i_eva_test,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTeacherStudentInternalEvaluationTestQuery = async (req, res) => {
  try {
    const { ietid } = req.params;
    if (!ietid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const i_eva_test = await SubjectInternalEvaluationTest.findById(
      ietid
    ).select("student_list take_test");

    const student_list = {};

    if (i_eva_test?.student_list?.length > 0) {
      for (let dfg of i_eva_test?.student_list) {
        student_list[dfg?.student] = dfg?.obtain_marks;
      }
    }

    res.status(200).send({
      message: "Internal Evaluation All list.",
      student_list: student_list,
      i_eva_test:
        i_eva_test?.student_list?.length > 0 ? i_eva_test?.student_list : [],
      eva_detail: {
        take_test: i_eva_test.take_test,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTeacherAddInternalEvaluationTestQuery = async (req, res) => {
  try {
    const { ieid } = req.params;
    const { name, out_of, test_type, conversion_rate, mcq_testset } = req.body;
    if (!ieid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const i_eva = await SubjectInternalEvaluation.findById(ieid);
    const i_eva_test = new SubjectInternalEvaluationTest({
      name: name,
      out_of: out_of,
      test_type: test_type,
      conversion_rate: conversion_rate,
      subject: i_eva.subject,
      internal_evaluation: i_eva?._id,
    });
    if (mcq_testset) {
      i_eva_test.testset = mcq_testset;
    }
    i_eva.internal_evaluation_test.push(i_eva_test?._id);
    await Promise.all([i_eva_test.save(), i_eva.save()]);
    res.status(200).send({
      message: "Internal Evaluation Test added successfully.",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTeacherUpdateInternalEvaluationTestQuery = async (req, res) => {
  try {
    const { ietid } = req.params;
    const { name, out_of, conversion_rate } = req.body;
    if (!ietid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const i_eva_test = await SubjectInternalEvaluationTest.findById(ietid);
    if (i_eva_test?.student_list?.length > 0) {
      res.status(200).send({
        message: "Internal Evaluation Test edited not allowed.",
      });
    } else {
      i_eva_test.name = name;
      i_eva_test.out_of = out_of;
      i_eva_test.conversion_rate = conversion_rate;
      await i_eva_test.save();
      res.status(200).send({
        message: "Internal Evaluation Test edited successfully.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTeacherRemoveInternalEvaluationTestQuery = async (req, res) => {
  try {
    const { ietid } = req.params;
    if (!ietid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const i_eva_test = await SubjectInternalEvaluationTest.findById(ietid);
    if (i_eva_test?.student_list?.length > 0) {
      res.status(200).send({
        message: "Internal Evaluation Test deleted not allowed.",
      });
    } else {
      const i_eva = await SubjectInternalEvaluation.findById(
        i_eva_test?.internal_evaluation
      );
      i_eva.internal_evaluation_test.pull(i_eva_test?._id);
      await i_eva.save();
      await SubjectInternalEvaluationTest.findByIdAndDelete(ietid);
      res.status(200).send({
        message: "Internal Evaluation Test deleted successfully.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.subjectTeacherMarkUpdateInternalEvaluationTestQuery = async (
  req,
  res
) => {
  try {
    const { ietid } = req.params;
    const { student_data } = req.body;
    if (!ietid || !student_data?.length) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const i_eva_test = await SubjectInternalEvaluationTest.findById(ietid);
    i_eva_test.student_list = student_data;
    await i_eva_test.save();
    res.status(200).send({
      message: "Internal Evaluation Test marks updated successfully.",
    });
    const i_eva = await SubjectInternalEvaluation.findById(
      i_eva_test.internal_evaluation
    );
    i_eva.student_list = [];
    for (let ert of i_eva?.internal_evaluation_test) {
      const dfg = await SubjectInternalEvaluationTest.findById(ert);
      let convert_rate = (dfg?.out_of / dfg?.conversion_rate)?.toFixed(2);
      convert_rate = +convert_rate;
      // if (`${ert}` === `${ietid}`) {
      //   for (let i = 0; i < student_data?.length; i++) {
      //     let stu = student_data[i];
      //     let ob_mark = (stu?.obtain_marks / convert_rate)?.toFixed(2);
      //     ob_mark = +ob_mark;
      //     let flag = false;
      //     for (let j = 0; j < i_eva?.student_list?.length; j++) {
      //       let already_stu = i_eva?.student_list[j];
      //       if (`${already_stu?.student}` === `${stu?.student}`) {
      //         already_stu.obtain_marks += ob_mark;
      //         flag = true;
      //         break;
      //       } else {
      //         flag = false;
      //       }
      //     }
      //     if (!flag) {
      //       i_eva.student_list.push({
      //         student: stu?.student,
      //         obtain_marks: ob_mark,
      //       });
      //     }
      //   }
      // } else {
      for (let i = 0; i < dfg?.student_list?.length; i++) {
        let stu = dfg?.student_list[i];
        let ob_mark = (stu?.obtain_marks / convert_rate)?.toFixed(2);
        ob_mark = +ob_mark;

        i_eva.student_list.push({
          student: stu?.student,
          obtain_marks: ob_mark,
        });

        // let flag = false;
        // for (let j = 0; j < i_eva?.student_list?.length; j++) {
        //   let already_stu = i_eva?.student_list[j];
        //   if (`${already_stu?.student}` === `${stu?.student}`) {
        //     already_stu.obtain_marks += ob_mark;
        //     flag = true;
        //     break;
        //   } else {
        //     flag = false;
        //   }
        // }
        // if (!flag) {

        // }
        // }
      }
    }
    await i_eva.save();
  } catch (e) {
    console.log(e);
  }
};

exports.internalEvaluationStudentExcelExportQuery = async (req, res) => {
  try {
    const { ieid } = req.params;
    if (!ieid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const e_eval = await SubjectInternalEvaluation.findById(ieid)
      .populate({
        path: "internal_evaluation_test",
        select: "",
      })
      .populate({
        path: "student_list.student",
        select:
          "studentFirstName studentMiddleName studentLastName studentROLLNO studentGRNO student_prn_enroll_number",
      });

    const students = [];

    if (e_eval?.student_list?.length > 0) {
      for (let otg of e_eval?.student_list) {
        let obj = {
          "Enrollment / PRN NO ":
            otg?.student?.student_prn_enroll_number ?? "#NA",
          GRNO: otg?.student?.studentGRNO ?? "#NA",
          ROLLNO: otg?.student.studentROLLNO ?? "#NA",
          Name: `${otg?.student?.studentFirstName} ${
            otg?.student?.studentMiddleName
              ? otg?.student?.studentMiddleName
              : ""
          } ${otg?.student?.studentLastName}`,
          [`Total Obtain Marks (Out Of ${e_eval?.out_of})`]:
            otg?.obtain_marks ?? "#NA",
        };
        for (let df of e_eval?.internal_evaluation_test) {
          for (let rty of df?.student_list) {
            if (`${otg?.student?._id}` === `${rty?.student}`) {
              obj[`${df?.name} Obtain Marks (Out Of ${df?.out_of})`] =
                rty?.obtain_marks ?? "#NA";
            }
          }
        }
        students.push(obj);
      }
    }

    let excel_key = "";
    if (students?.length > 0) {
      excel_key = await subject_internal_evaluation_marks_student_json_to_excel(
        ieid,
        students,
        "Students",
        "INTERNAL_EVALUATION_MARKS",
        "internal_evaluation_marks"
      );
    }
    res.status(200).send({
      message: "One Subject student excel export",
      excel_key: excel_key,
      // e_eval,
      // students: students,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTeacherTakeTestsetInternalEvaluationTestQuery = async (
  req,
  res
) => {
  try {
    const { ietid } = req.params;
    const { mcq_test_date, mcq_test_from, mcq_test_to, mcq_test_duration } =
      req.body;
    if (!ietid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let dt_date = new Date(mcq_test_date);
    const i_eva_test = await SubjectInternalEvaluationTest.findById(ietid);
    if (i_eva_test.mcq_test_date) {
      i_eva_test.old_take_test.push({
        take_test: i_eva_test.take_test,
        mcq_test_date: i_eva_test.mcq_test_date,
        mcq_test_from: i_eva_test.mcq_test_from,
        mcq_test_to: i_eva_test.mcq_test_to,
        mcq_test_duration: i_eva_test.mcq_test_duration,
      });
    }
    i_eva_test.take_test = +i_eva_test.take_test + 1;
    i_eva_test.mcq_test_date = dt_date;
    i_eva_test.mcq_test_from = mcq_test_from;
    i_eva_test.mcq_test_to = mcq_test_to;
    i_eva_test.mcq_test_duration = mcq_test_duration;
    await i_eva_test.save();
    res.status(200).send({
      message: "Internal Evaluation Test taken successfully.",
    });
    if (i_eva_test?.subject) {
      const subject = await Subject.findById(i_eva_test?.subject)
        .populate({
          path: "selected_batch_query",
          select: "class_student_query batchName",
        })
        .populate({
          path: "class",
          populate: {
            path: "batch",
            select: "batchName",
          },
          select: "ApproveStudent classTitle batch",
        });
      let students = [];
      if (subject?.selected_batch_query?._id) {
        students = subject?.selected_batch_query?.class_student_query;
      } else {
        if (subject?.optionalStudent?.length > 0) {
          students = subject?.optionalStudent;
        } else {
          students = subject?.class?.ApproveStudent;
        }
      }

      const testSet = await SubjectMasterTestSet.findById(i_eva_test.testset);

      let current_subject_name = "";
      if (subject?.selected_batch_query?.batchName) {
        let dt = "";
        if (subject?.subject_category === "Practical") {
          dt = "P:";
        } else {
          dt = "T:";
        }
        dt = `${dt}${subject?.selected_batch_query?.batchName ?? ""} `;
        current_subject_name += dt;
      }
      current_subject_name += subject?.subjectName ?? "";
      if (subject?.class?.classTitle) {
        current_subject_name += ` ${subject?.class?.classTitle ?? ""} - ${
          subject?.class?.batch?.batchName ?? ""
        }`;
      }

      const studentTestObject = {
        subjectMaster: testSet?.subjectMaster,
        classMaster: testSet?.classMaster,
        subjectMasterTestSet: testSet._id,
        testName: testSet?.testName,
        testSubject: current_subject_name,
        testDate: dt_date,
        testStart: mcq_test_from,
        testEnd: mcq_test_to,
        testDuration: mcq_test_duration,
        testTotalQuestion: testSet?.testTotalQuestion,
        testTotalNumber: testSet?.testTotalNumber,
        subject: subject?._id,
        questions: [],
        student: "",
      };

      for (let quest of testSet?.questions) {
        // another way of selecting item in array .option options.optionNumber options.image
        const getQuestion = await SubjectQuestion.findById(quest).select(
          "questionSNO questionNumber questionDescription questionImage options correctAnswer answerDescription answerImage isUniversal -_id"
        );
        studentTestObject.questions.push(getQuestion);
      }

      for (let i = 0; i < students?.length; i++) {
        let studentId = students[i];
        const student = await Student.findById(studentId);
        studentTestObject.student = studentId;
        const user = await User.findById({ _id: `${student.user}` });
        const studentTestSet = new StudentTestSet(studentTestObject);
        studentTestSet.internal_evaluation_test = i_eva_test?._id;
        student.internal_evaluation_testset.push(studentTestSet._id);
        const notify = new StudentNotification({
          student_testset: studentTestSet?._id,
          testset: testSet?._id,
        });
        notify.notifyContent = `New Internal Evaluation ${testSet?.testName} Test is created for ${current_subject_name.testSubject}`;
        notify.notify_hi_content = `नई $${testSet?.testName} परीक्षा ${current_subject_name.testSubject} के लिए बनाया गया है`;
        notify.notify_mr_content = `नई ${current_subject_name.testSubject} साठी नवीन $${testSet?.testName} चाचणी तयार केली आहे.`;
        notify.notifySender = subject._id;
        notify.notifyReceiever = user._id;
        notify.notifyType = "Student";
        notify.notifyPublisher = student._id;
        user.activity_tab.push(notify._id);
        student.notification.push(notify._id);
        notify.notifyBySubjectPhoto.subject_id = subject?._id;
        notify.notifyBySubjectPhoto.subject_name = subject.subjectName;
        notify.notifyBySubjectPhoto.subject_cover = "subject-cover.png";
        notify.notifyBySubjectPhoto.subject_title = subject.subjectTitle;
        notify.notifyCategory = "EVALUATION_MCQ";
        notify.redirectIndex = 66;
        i_eva_test.student_notify.push(notify?._id);
        await Promise.all([
          studentTestSet.save(),
          student.save(),
          notify.save(),
          user.save(),
          i_eva_test.save(),
        ]);
        if (user.deviceToken) {
          invokeMemberTabNotification(
            "Student Activity",
            notify,
            "New Internal Evaluation MCQ Test Set",
            user._id,
            user.deviceToken,
            "Student",
            notify
          );
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const get_time_convert_start = (args) => {
  if (
    args?.includes("Am") ||
    args?.includes("am") ||
    args?.includes("AM") ||
    args?.includes("aM")
  ) {
    if (+args?.substring(0, 2) === 12) {
      return +`${"0" + args?.substring(3, 5)}`;
    } else {
      return +`${args?.substring(0, 2) + args?.substring(3, 5)}`;
    }
  } else {
    if (+args?.substring(0, 2) === 12) {
      return +`${args?.substring(0, 2) + args?.substring(3, 5)}`;
    } else {
      return +`${`${+args?.substring(0, 2) + 12}` + args?.substring(3, 5)}`;
    }
  }
};
exports.sudentInternalEvaluationStartTestValidationQuery = async (req, res) => {
  try {
    const { stid } = req.params;
    // console.log("stid", stid);
    const { date, time } = req.body;
    if (!stid || !date) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const stu_test = await StudentTestSet.findById(stid).select("-questions");
    let dft = new Date(stu_test?.testDate);
    dft = dft?.toISOString();
    let is_format = moment(dft)?.format("yyyy-MM-DD");
    // console.log("is_format", is_format, date);
    let flag = false;
    if (moment(is_format).isSame(date)) {
      let time_hit = get_time_convert_start(time);
      let time_start = get_time_convert_start(stu_test?.testStart);
      let time_end = get_time_convert_start(stu_test?.testEnd);
      // console.log(time_start, ": ", time_hit, ": ", time_end);
      if (time_hit >= time_start && time_hit <= time_end) {
        flag = true;
      }
    }
    res.status(200).send({
      message: "Internal Evaluation Test taken successfully.",
      test_access: flag,
      stu_test,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.sudentGetInternalEvaluationTestQuery = async (req, res) => {
  try {
    const { stid } = req.params;
    if (!stid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const stu_test = await StudentTestSet.findById(stid).populate({
      path: "student",
      select:
        "studentFirstName studentMiddleName studentLastName studentProfilePhoto studentROLLNO",
    });

    res.status(200).send({
      message: "Internal Evaluation Test Detail successfully.",
      stu_test,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.sudentGetInternalEvaluationSubmitTestQuery = async (req, res) => {
  try {
    const { stid } = req.params;
    const { testSetComplete, notifyId } = req.body;

    if (!stid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const stu_test = await StudentTestSet.findById(stid);
    const studentNoti = await StudentNotification.findById(notifyId);

    studentNoti.student_feedback_status = "Submitted";
    await studentNoti.save();
    if (!stu_test.testSetComplete) {
      stu_test.testSetComplete = testSetComplete;
      stu_test.testSetLeftTime = 0;
      await stu_test.save();
      res.status(200).send({
        message: "Internal Evaluation Test submit successfully",
        status: stu_test.testSetComplete,
        stu_test,
      });
    } else {
      res.status(200).send({
        message: "Internal Evaluation Test not submit successfully",
        status: stu_test.testSetComplete,
        stu_test,
      });
    }
    if (stu_test?.internal_evaluation_test) {
      const i_eva_test = await SubjectInternalEvaluationTest.findById(
        stu_test?.internal_evaluation_test
      );
      i_eva_test.student_list.push({
        student: stu_test.student,
        obtain_marks: stu_test.testObtainMarks,
        studenttestset: stu_test?._id,
      });
      const i_eva = await SubjectInternalEvaluation.findById(
        i_eva_test.internal_evaluation
      );
      let convert_rate = (
        i_eva_test?.out_of / i_eva_test?.conversion_rate
      )?.toFixed(2);
      convert_rate = +convert_rate;

      let ob_mark = (stu_test.testObtainMarks / convert_rate)?.toFixed(2);
      ob_mark = +ob_mark;

      let flag = false;

      if (i_eva?.student_list?.length > 0) {
        for (let i = 0; i < i_eva?.student_list?.length; i++) {
          let stu = i_eva?.student_list[i];
          if (`${stu?.student}` === `${stu_test.student}`) {
            stu.obtain_marks += ob_mark;
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        i_eva?.student_list.push({
          student: stu_test.student,
          obtain_marks: ob_mark,
        });
      }
      await Promise.all([i_eva_test.save(), i_eva.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTeacherSingleTakeTestsetInternalEvaluationTestQuery = async (
  req,
  res
) => {
  try {
    const { ietid } = req.params;
    const {
      mcq_test_date,
      mcq_test_from,
      mcq_test_to,
      mcq_test_duration,
      studentId,
    } = req.body;
    if (!ietid || !studentId) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let dt_date = new Date(mcq_test_date);
    const i_eva_test = await SubjectInternalEvaluationTest.findById(ietid);
    if (i_eva_test.mcq_test_date) {
      i_eva_test.old_take_test.push({
        take_test: i_eva_test.take_test,
        mcq_test_date: i_eva_test.mcq_test_date,
        mcq_test_from: i_eva_test.mcq_test_from,
        mcq_test_to: i_eva_test.mcq_test_to,
        mcq_test_duration: i_eva_test.mcq_test_duration,
        student: i_eva_test?.single_student,
      });
    }
    i_eva_test.take_test = +i_eva_test.take_test + 1;
    i_eva_test.mcq_test_date = dt_date;
    i_eva_test.mcq_test_from = mcq_test_from;
    i_eva_test.mcq_test_to = mcq_test_to;
    i_eva_test.mcq_test_duration = mcq_test_duration;
    i_eva_test.single_student = studentId;

    await i_eva_test.save();
    res.status(200).send({
      message: "Internal Evaluation Test taken successfully.",
    });

    if (i_eva_test.testset && studentId && i_eva_test?.subject) {
      const subject = await Subject.findById(i_eva_test?.subject);

      const testSet = await SubjectMasterTestSet.findById(i_eva_test.testset);
      const studentTestObject = {
        subjectMaster: testSet?.subjectMaster,
        classMaster: testSet?.classMaster,
        subjectMasterTestSet: testSet._id,
        testName: testSet?.testName,
        testSubject: testSet?.testSubject,
        testDate: dt_date,
        testStart: mcq_test_from,
        testEnd: mcq_test_to,
        testDuration: mcq_test_duration,
        testTotalQuestion: testSet?.testTotalQuestion,
        testTotalNumber: testSet?.testTotalNumber,
        questions: [],
        student: "",
      };

      for (let quest of testSet?.questions) {
        // another way of selecting item in array .option options.optionNumber options.image
        const getQuestion = await SubjectQuestion.findById(quest).select(
          "questionSNO questionNumber questionDescription questionImage options correctAnswer answerDescription answerImage isUniversal -_id"
        );
        studentTestObject.questions.push(getQuestion);
      }

      const student = await Student.findById(studentId);
      studentTestObject.student = studentId;
      const user = await User.findById({ _id: `${student.user}` });
      const studentTestSet = new StudentTestSet(studentTestObject);
      studentTestSet.internal_evaluation_test = i_eva_test?._id;
      student.internal_evaluation_testset.push(studentTestSet._id);
      const notify = new StudentNotification({
        student_testset: studentTestSet?._id,
        testset: testSet?._id,
      });
      notify.notifyContent = `New Internal Evaluation ${testSet?.testName} Test is created for ${testSet.testSubject}`;
      notify.notify_hi_content = `नई $${testSet?.testName} परीक्षा ${testSet.testSubject} के लिए बनाया गया है`;
      notify.notify_mr_content = `नई ${testSet.testSubject} साठी नवीन $${testSet?.testName} चाचणी तयार केली आहे.`;
      notify.notifySender = subject._id;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      user.activity_tab.push(notify._id);
      student.notification.push(notify._id);
      notify.notifyBySubjectPhoto.subject_id = subject?._id;
      notify.notifyBySubjectPhoto.subject_name = subject.subjectName;
      notify.notifyBySubjectPhoto.subject_cover = "subject-cover.png";
      notify.notifyBySubjectPhoto.subject_title = subject.subjectTitle;
      notify.notifyCategory = "EVALUATION_MCQ";
      notify.redirectIndex = 66;
      i_eva_test.student_notify.push(notify?._id);
      await Promise.all([
        studentTestSet.save(),
        student.save(),
        notify.save(),
        user.save(),
        i_eva_test.save(),
      ]);
      if (user.deviceToken) {
        invokeMemberTabNotification(
          "Student Activity",
          notify,
          "New Internal Evaluation MCQ Test Set",
          user._id,
          user.deviceToken,
          "Student",
          notify
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
};

// for continuous evaluation things

exports.subject_all_expriment_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    let experiments = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      experiments = await SubjectContinuousEvaluationExperiment.find({
        $and: [
          {
            subject: { $eq: `${sid}` },
          },
          {
            $or: [
              {
                name: { $regex: req.query.search, $options: "i" },
              },
              {
                experiment_type: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      }).select("name experiment_type date createdAt");
    } else {
      experiments = await SubjectContinuousEvaluationExperiment.find({
        $and: [
          {
            subject: { $eq: `${sid}` },
          },
        ],
      })
        .select("name experiment_type date createdAt")
        .sort({ created_at: -1 })
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "Continuous Evaluation All Experiment list.",
      experiments: experiments,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.subject_add_expriment_query = async (req, res) => {
  try {
    const { sid } = req.params;
    const { name, experiment_type, date } = req.body;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const subject = await Subject.findById(sid).populate({
      path: "class",
      select: "department",
    });
    let ex_qv_id = "";
    if (subject?.continuous_evaluation) {
      const ct_ev = await SubjectContinuousEvaluation.findById(
        subject?.continuous_evaluation
      );

      const ex_ev = new SubjectContinuousEvaluationExperiment({
        subject: sid,
        name,
        experiment_type,
        date,
        continuous_evaluation: ct_ev?._id,
      });
      ct_ev.evaluation_experiment.push(ex_ev?._id);
      ex_qv_id = ex_ev?._id;
      await Promise.all([ex_ev.save(), ct_ev.save()]);
    } else {
      const ct_ev = new SubjectContinuousEvaluation({
        subject: sid,
        institute: subject?.institute,
        department: subject?.class?.department,
        class: subject?.class?._id,
      });
      subject.continuous_evaluation = ct_ev?._id;
      const ex_ev = new SubjectContinuousEvaluationExperiment({
        subject: sid,
        name,
        experiment_type,
        date,
        continuous_evaluation: ct_ev?._id,
      });
      ct_ev.evaluation_experiment.push(ex_ev?._id);
      ex_qv_id = ex_ev?._id;

      await Promise.all([ex_ev.save(), ct_ev.save(), subject.save()]);
    }

    res.status(200).send({
      message: "Continuous Experiment Evaluation Created successfully.",
      access: true,
    });

    if (ex_qv_id) {
      const sub = await Subject.findById(sid)
        .populate({
          path: "selected_batch_query",
          select: "class_student_query batchName",
        })
        .populate({
          path: "class",
          select: "ApproveStudent classTitle",
        });

      let students = [];
      if (sub?.selected_batch_query?._id) {
        students = sub?.selected_batch_query?.class_student_query;
      } else {
        if (sub?.optionalStudent?.length > 0) {
          students = sub?.optionalStudent;
        } else {
          students = sub?.class?.ApproveStudent;
        }
      }

      const expriment_ev = await SubjectContinuousEvaluationExperiment.findById(
        ex_qv_id
      );

      const ct_ev = await SubjectContinuousEvaluation.findById(
        expriment_ev.continuous_evaluation
      );

      if (expriment_ev?._id && students?.length > 0) {
        for (let dt of students) {
          expriment_ev.student_list.push({
            student: dt,
          });
          if (ct_ev.student_list?.includes(dt)) {
          } else {
            ct_ev.student_list.push(dt);
          }
        }
      }

      await Promise.all([ct_ev.save(), expriment_ev.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subject_update_expriment_query = async (req, res) => {
  try {
    const { exid } = req.params;
    if (!exid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    await SubjectContinuousEvaluationExperiment.findByIdAndUpdate(
      exid,
      req.body
    );

    res.status(200).send({
      message: "Continuous Experiment Evaluation updated successfully.",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subject_remove_expriment_query = async (req, res) => {
  try {
    const { exid } = req.params;
    if (!exid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const expriment_ev = await SubjectContinuousEvaluationExperiment.findById(
      exid
    );
    if (expriment_ev?.continuous_evaluation) {
      const ct_ev = await SubjectContinuousEvaluation.findById(
        expriment_ev?.continuous_evaluation
      );
      ct_ev.evaluation_experiment.pull(exid);
      await ct_ev.save();
    }
    await SubjectContinuousEvaluationExperiment.findByIdAndDelete(exid);
    res.status(200).send({
      message: "Continuous Experiment Evaluation deleted successfully.",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subject_one_expriment_detail_query = async (req, res) => {
  try {
    const { exid } = req.params;
    if (!exid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const exev = await SubjectContinuousEvaluationExperiment.findById(exid);

    const subject = await Subject.findById(exev?.subject).populate({
      path: "attendance",
      match: {
        attendDate: { $eq: `${moment(exev?.date)?.format("DD/MM/yyyy")}` },
      },
    });
    let students = [];

    if (exev?.student_list?.length > 0) {
      for (let st of exev?.student_list) {
        const student = await Student.findById(st?.student)
          .select(
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGRNO studentProfilePhoto"
          )
          .lean()
          .exec();

        let att_marks = 0;

        if (subject?.attendance?.[0]?._id) {
          for (let dt of subject?.attendance?.[0]?.presentStudent) {
            if (`${dt?.student}` === `${student?._id}`) {
              att_marks = 3;
              break;
            }
          }
        }
        students.push({
          ...student,
          attendance_marks: att_marks,
          practical_marks: st?.practical_marks,
          journal_marks: st?.journal_marks,
          total_marks: att_marks + st?.practical_marks + st?.journal_marks,
        });
      }
    }

    res.status(200).send({
      message: "One Experiment detail list.",
      students: students,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subject_update_expriment_marks_query = async (req, res) => {
  try {
    const { exid } = req.params;
    const { marks_list } = req.body;
    if (!exid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const expriment_ev = await SubjectContinuousEvaluationExperiment.findById(
      exid
    );
    if (expriment_ev?._id && marks_list?.length > 0) {
      expriment_ev.student_list = marks_list;
    }
    await expriment_ev.save();
    res.status(200).send({
      message: "Continuous Experiment marks updated successfully.",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subject_continuous_evaluation_detail_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const ctev = await SubjectContinuousEvaluation.findOne({
      subject: sid,
    })
      .populate({
        path: "attendance_subject",
        populate: {
          path: "selected_batch_query",
          select: "batchName",
        },
        select: "subjectName subject_category",
      })
      .populate({
        path: "assignment_subject",
        populate: {
          path: "selected_batch_query",
          select: "batchName",
        },
        select: "subjectName subject_category",
      })
      .populate({
        path: "cls_test_subject",
        populate: {
          path: "selected_batch_query",
          select: "batchName",
        },
        select: "subjectName subject_category",
      })
      .select(
        "class experiment_outof attendance_outof cls_test_outof assignment_outof total_outof final_outof university_outof attendance_subject experiment_toggle attendance_toggle cls_test_toggle assignment_toggle cls_test_subject assignment_subject attendance_grade_count attendance_grade_marks"
      );
    res.status(200).send({
      message: "Continuous evaluation setting saved successfully.",
      ctev: ctev,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subject_continuous_evaluation_setting_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    await SubjectContinuousEvaluation.findByIdAndUpdate(ceid, req.body);

    res.status(200).send({
      message: "Continuous evaluation setting saved successfully.",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.continuous_evaluation_all_experiment_marks_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const ct_ev = await SubjectContinuousEvaluation.findById(ceid);
    let stu_obj = {};

    const all_exp = await SubjectContinuousEvaluationExperiment.find({
      continuous_evaluation: ct_ev,
    });

    if (all_exp?.length > 0) {
      for (let exp of all_exp) {
        if (exp?.student_list?.length > 0) {
          for (let stu of exp?.student_list) {
            if (stu_obj[stu?.student]) {
              stu_obj[stu?.student]["mark"] += stu?.total_marks;
              stu_obj[stu?.student]["outof"] += exp?.outof;
            } else {
              stu_obj[stu?.student] = {
                mark: stu?.total_marks,
                outof: exp?.outof,
              };
            }
          }
        }
      }
    }

    let students = [];
    for (let ob in stu_obj) {
      const student = await Student.findById(ob)
        .select(
          "studentFirstName studentMiddleName studentLastName studentProfilePhoto photoId studentGRNO studentROLLNO"
        )
        .lean()
        .exec();
      let ot = stu_obj[ob];
      let per = 0;
      if (ot?.mark > 0) {
        per = Math.ceil((ot?.mark / ot?.outof) * 100);
        per = +per;
        per = Math.ceil((per * ct_ev?.experiment_outof) / 100);
        per = +per;
      }

      students.push({
        ...student,
        secured_marks: per,
      });
    }

    res.status(200).send({
      message: "Continuous Experiment marks updated successfully.",
      access: true,
      students: students,
    });

    if (students?.length > 0) {
      for (let stu of students) {
        let flag = true;
        for (let std of ct_ev?.student_data) {
          if (`${stu?._id}` === `${std?.student}`) {
            flag = false;
            std.all_exp = stu?.secured_marks;
            break;
          }
        }
        if (flag) {
          ct_ev?.student_data.push({
            student: stu?._id,
            all_exp: stu?.secured_marks,
          });
        }
      }
      await ct_ev.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.cls_theory_subject_list_query = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const cls = await Class.findById(cid);
    let subjects = [];
    if (cls?.subject?.length > 0) {
      subjects = await Subject.find({
        $and: [
          {
            _id: { $in: cls.subject },
          },
          {
            subject_category: { $in: ["Full Class", "Theory"] },
          },
        ],
      })
        .populate({
          path: "selected_batch_query",
          select: "batchName",
        })
        .select("subjectName subject_category");
    }

    res.status(200).send({
      message: "Continuous evaluation class subject list.",
      subject: subjects?.length > 0 ? subjects : [],
    });
  } catch (e) {
    console.log(e);
  }
};

exports.continuous_evaluation_attendance_marks_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const ct_ev = await SubjectContinuousEvaluation.findById(ceid);
    let students = [];
    if (ct_ev?.attendance_subject) {
      const subjects = await Subject.findById(
        ct_ev?.attendance_subject
      ).populate({
        path: "attendance",
      });
      let student_list = [];

      student_list = await Student.find({
        _id: { $in: ct_ev.student_list },
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO "
        )
        .lean()
        .exec();

      for (let stu of student_list) {
        let obj = {
          ...stu,
          subjectWise: {
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
          },
          attendance_mark: 0,
        };
        for (let att of subjects?.attendance) {
          for (let pre of att?.presentStudent) {
            if (String(stu._id) === String(pre.student))
              obj.subjectWise.presentCount += 1;
          }
          obj.subjectWise.totalCount += 1;
        }
        if (obj.subjectWise.totalCount > 0) {
          obj.subjectWise.totalPercentage = Math.ceil(
            (obj.subjectWise.presentCount * 100) / obj.subjectWise.totalCount
          );

          obj.subjectWise.totalPercentage = +obj.subjectWise.totalPercentage;

          if (ct_ev?.attendance_grade_marks?.length > 0) {
            for (let dbt of ct_ev?.attendance_grade_marks) {
              if (
                obj.subjectWise.totalPercentage >= dbt?.start_range &&
                obj.subjectWise.totalPercentage <= dbt?.end_range
              ) {
                obj.attendance_mark = +dbt.grade_marks;
              }
            }
          } else {
            obj.attendance_mark = Math.ceil(
              (obj.subjectWise.totalPercentage * ct_ev.attendance_outof) / 100
            );
            obj.attendance_mark = +obj.attendance_mark;
          }
        }

        students.push(obj);
      }
    }

    res.status(200).send({
      message: "Continuous Experiment marks updated successfully.",
      access: true,
      students: students,
    });

    if (students?.length > 0) {
      for (let stu of students) {
        let flag = true;
        for (let std of ct_ev?.student_data) {
          if (`${stu?._id}` === `${std?.student}`) {
            flag = false;
            std.attendance = stu?.attendance_mark;
            break;
          }
        }
        if (flag) {
          ct_ev?.student_data.push({
            student: stu?._id,
            attendance: stu?.attendance_mark,
          });
        }
      }
      await ct_ev.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.continuous_evaluation_assignment_marks_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const ct_ev = await SubjectContinuousEvaluation.findById(ceid);
    let students = [];
    if (ct_ev?.assignment_subject) {
      const subjects = await Subject.findById(ct_ev?.assignment_subject);

      if (subjects?.assignments?.length > 0) {
        let student_list = [];
        student_list = await Student.find({
          _id: { $in: ct_ev.student_list },
        })
          .select(
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO "
          )
          .lean()
          .exec();
        for (let stu of student_list) {
          let obj = {
            ...stu,
            assignment_mark: 0,
            assignment_total_mark: 0,
          };

          const stu_assignment = await StudentAssignment.find({
            $and: [
              {
                assignment: {
                  $in: subjects?.assignments,
                },
              },
              {
                student: {
                  $eq: `${stu?._id}`,
                },
              },
            ],
          });

          if (stu_assignment?.length > 0) {
            for (let ass of stu_assignment) {
              obj.assignment_mark += ass?.assignment_obtain_mark;
              obj.assignment_total_mark += ass?.assignment_total_mark;
            }
          }
          if (obj.assignment_total_mark > 0 && obj.assignment_mark > 0) {
            obj.assignment_mark = Math.ceil(
              (obj.assignment_mark * 100) / obj.assignment_total_mark
            );
            obj.assignment_mark = +obj.assignment_mark;

            obj.assignment_mark = Math.ceil(
              (obj.assignment_mark * ct_ev.assignment_outof) / 100
            );
            obj.assignment_mark = +obj.assignment_mark;
          }

          students.push(obj);
        }
      }
    }

    res.status(200).send({
      message: "Continuous Experiment marks updated successfully.",
      access: true,
      students: students,
    });

    if (students?.length > 0) {
      for (let stu of students) {
        let flag = true;
        for (let std of ct_ev?.student_data) {
          if (`${stu?._id}` === `${std?.student}`) {
            flag = false;
            std.assingment = stu?.assignment_mark;
            break;
          }
        }
        if (flag) {
          ct_ev?.student_data.push({
            student: stu?._id,
            assingment: stu?.assignment_mark,
          });
        }
      }
      await ct_ev.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.continuous_evaluation_cls_test_marks_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const ct_ev = await SubjectContinuousEvaluation.findById(ceid);
    let students = [];
    if (ct_ev?.cls_test_subject && ct_ev?.cls_test_exam?.length > 0) {
      let student_list = [];
      let exams = [];
      for (let dt of ct_ev?.cls_test_exam) {
        exams.push(`${dt}`);
      }
      student_list = await Student.find({
        _id: { $in: ct_ev.student_list },
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO "
        )
        .lean()
        .exec();
      for (let stu of student_list) {
        let obj = {
          ...stu,
          cls_mark: 0,
          cls_total_mark: 0,
        };
        const stu_marks = await SubjectMarks.findOne({
          $and: [
            {
              student: {
                $eq: `${stu?._id}`,
              },
            },
            {
              subject: {
                $eq: `${ct_ev?.cls_test_subject}`,
              },
            },
          ],
        });

        if (stu_marks?._id && stu_marks?.marks?.length > 0) {
          for (let mt of stu_marks?.marks) {
            if (exams?.includes(`${mt?.examId}`)) {
              obj.cls_mark += mt?.obtainMarks;
              obj.cls_total_mark += mt?.totalMarks;
            }
          }
          obj.cls_mark = Math.ceil((obj.cls_mark * 100) / obj.cls_total_mark);
          obj.cls_mark = +obj.cls_mark;

          obj.cls_mark = Math.ceil((obj.cls_mark * ct_ev.cls_test_outof) / 100);
          obj.cls_mark = +obj.cls_mark;
        }
        students.push(obj);
      }
    }

    res.status(200).send({
      message: "Continuous Experiment marks updated successfully.",
      access: true,
      students: students,
    });

    if (students?.length > 0) {
      for (let stu of students) {
        let flag = true;
        for (let std of ct_ev?.student_data) {
          if (`${stu?._id}` === `${std?.student}`) {
            flag = false;
            std.cls_test = stu?.cls_mark;
            break;
          }
        }
        if (flag) {
          ct_ev?.student_data.push({
            student: stu?._id,
            cls_test: stu?.cls_mark,
          });
        }
      }
      await ct_ev.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.continuous_evaluation_total_marks_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const ct_ev = await SubjectContinuousEvaluation.findById(ceid);
    let students = [];
    if (ct_ev?.student_data?.length > 0) {
      let student_list = [];
      student_list = await Student.find({
        _id: { $in: ct_ev.student_list },
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO "
        )
        .lean()
        .exec();

      for (let stu of student_list) {
        let obj = {
          ...stu,
          total_mark: 0,
          total_mark_outof: 0,
          column: 0,
        };

        for (let odt of ct_ev?.student_data) {
          if (`${stu?._id}` === `${odt?.student}`) {
            if (ct_ev?.experiment_toggle) {
              obj.total_mark += odt?.all_exp;
              obj.total_mark_outof += ct_ev?.experiment_outof;
              obj.column += 1;
            }
            if (ct_ev?.attendance_toggle) {
              obj.total_mark += odt?.attendance;
              obj.total_mark_outof += ct_ev?.attendance_outof;

              obj.column += 1;
            }
            if (ct_ev?.cls_test_toggle) {
              obj.total_mark += odt?.cls_test;
              obj.total_mark_outof += ct_ev?.cls_test_outof;

              obj.column += 1;
            }
            if (ct_ev?.assignment_toggle) {
              obj.total_mark += odt?.assingment;
              obj.total_mark_outof += ct_ev?.assignment_outof;

              obj.column += 1;
            }
            break;
          }
        }
        // obj.total_mark = Math.ceil(obj.total_mark / obj.column);
        // obj.total_mark = +obj.total_mark;
        // console.log("total_mark =>", obj.total_mark, obj.total_mark_outof);

        obj.total_mark = Math.ceil(
          (obj.total_mark / obj.total_mark_outof) * 100
        );
        // console.log("total_mark => after manu in per", obj.total_mark);
        obj.total_mark = Math.ceil((obj.total_mark * ct_ev.total_outof) / 100);

        // obj.total_mark = Math.ceil((obj.total_mark / ct_ev.total_outof) * 100);
        // console.log("total_mark => after manu in per", obj.total_mark);
        // obj.total_mark = Math.ceil((obj.total_mark * ct_ev.total_outof) / 100);

        obj.total_mark = +obj.total_mark;
        // console.log(
        //   "total_mark => after manu",
        //   obj.total_mark,
        //   ct_ev.total_outof
        // );
        students.push(obj);
      }
    }

    res.status(200).send({
      message: "Continuous Experiment marks updated successfully.",
      access: true,
      students: students,
    });

    if (students?.length > 0) {
      ct_ev.student_overall_data = ct_ev?.student_data;
      for (let stu of students) {
        for (let std of ct_ev?.student_overall_data) {
          if (`${stu?._id}` === `${std?.student}`) {
            std.total = stu?.total_mark;
            break;
          }
        }
      }
      await ct_ev.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subject_continuous_evaluation_all_university_marks_query = async (
  req,
  res
) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const ct_ex = await SubjectContinuousEvaluation.findById(ceid);

    let students = [];

    if (ct_ex?.student_list?.length > 0) {
      for (let stu of ct_ex?.student_list) {
        const student = await Student.findById(stu)
          .select(
            "studentFirstName studentMiddleName studentLastName studentGRNO studentROLLNO studentProfilePhoto"
          )
          .lean()
          .exec();

        let marks = 0;
        if (ct_ex?.student_marks_university?.length > 0) {
          for (let dt of ct_ex?.student_marks_university) {
            if (`${dt?.student}` === `${student?._id}`) {
              marks = dt?.marks;
              break;
            }
          }
        }
        students.push({
          ...student,
          marks: marks,
        });
      }
    }
    res.status(200).send({
      message: "Continuous Evaluation university marks updated successfully.",
      students: students,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subject_continuous_evaluation_university_marks_query = async (
  req,
  res
) => {
  try {
    const { ceid } = req.params;
    const { marks_list } = req.body;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const ct_ex = await SubjectContinuousEvaluation.findById(ceid);
    if (ct_ex?._id && marks_list?.length > 0) {
      ct_ex.student_marks_university = marks_list;
    }
    await ct_ex.save();
    res.status(200).send({
      message: "Continuous Evaluation university marks updated successfully.",
      access: true,
    });

    if (marks_list?.length > 0) {
      for (let stu of marks_list) {
        for (let std of ct_ex?.student_overall_data) {
          if (`${stu?.student}` === `${std?.student}`) {
            std.by_university = stu?.marks;
            break;
          }
        }
      }
      await ct_ex.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subject_continuous_evaluation_all_university_seats_query = async (
  req,
  res
) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const ct_ex = await SubjectContinuousEvaluation.findById(ceid);

    let students = [];

    if (ct_ex?.student_list?.length > 0) {
      for (let stu of ct_ex?.student_list) {
        const student = await Student.findById(stu)
          .select(
            "studentFirstName studentMiddleName studentLastName studentGRNO studentROLLNO studentProfilePhoto"
          )
          .lean()
          .exec();

        let seat_no = "";
        if (ct_ex?.student_university_seat?.length > 0) {
          for (let dt of ct_ex?.student_university_seat) {
            if (`${dt?.student}` === `${student?._id}`) {
              seat_no = dt?.seat_no;
              break;
            }
          }
        }
        students.push({
          ...student,
          seat_no: seat_no,
        });
      }
    }
    res.status(200).send({
      message: "Continuous Evaluation university marks updated successfully.",
      students: students,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subject_continuous_evaluation_university_seats_query = async (
  req,
  res
) => {
  try {
    const { ceid } = req.params;
    const { seat_list } = req.body;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const ct_ex = await SubjectContinuousEvaluation.findById(ceid);
    if (ct_ex?._id && seat_list?.length > 0) {
      ct_ex.student_university_seat = seat_list;
    }
    await ct_ex.save();
    res.status(200).send({
      message: "Continuous Evaluation university seats updated successfully.",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.continuous_evaluation_final_marks_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const ct_ev = await SubjectContinuousEvaluation.findById(ceid);
    let students = [];
    if (ct_ev?.student_overall_data?.length > 0) {
      let student_list = [];
      student_list = await Student.find({
        _id: { $in: ct_ev.student_list },
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO "
        )
        .lean()
        .exec();

      for (let stu of student_list) {
        let obj = {
          ...stu,
          final_mark: 0,
          column: 0,
        };

        for (let odt of ct_ev?.student_overall_data) {
          if (`${stu?._id}` === `${odt?.student}`) {
            obj.final_mark += odt?.total;
            obj.column += 1;

            let ut_marks = odt?.by_university;
            ut_marks = Math.ceil((ut_marks * 100) / ct_ev.university_outof);
            ut_marks = +ut_marks;

            obj.final_mark += ut_marks;
            obj.column += 1;
            break;
          }
        }
        obj.final_mark = Math.ceil(obj.final_mark / obj.column);
        obj.final_mark = +obj.final_mark;

        obj.final_mark = Math.ceil((obj.final_mark * ct_ev.final_outof) / 100);
        obj.final_mark = +obj.final_mark;
        students.push(obj);
      }
    }

    res.status(200).send({
      message: "Continuous Experiment marks updated successfully.",
      access: true,
      students: students,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.get_subject_co_list_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const subject = await Subject.findById(sid);
    let attainment = [];
    if (subject?.subjectMasterName) {
      attainment = await Attainment.find({
        subject_master: { $eq: `${subject?.subjectMasterName}` },
        attainment_type: { $eq: `CO` },
      }).select("attainment_name attainment_type attainment_code");
    }

    res.status(200).send({
      message: "All list of copo in subjects",
      attainment: attainment,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.ct_one_experiment_export_query = async (req, res) => {
  try {
    const { exid } = req.params;
    if (!exid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const exev = await SubjectContinuousEvaluationExperiment.findById(exid);

    const subject = await Subject.findById(exev?.subject).populate({
      path: "attendance",
      match: {
        attendDate: { $eq: `${moment(exev?.date)?.format("DD/MM/yyyy")}` },
      },
    });

    let students = [];

    if (exev?.student_list?.length > 0) {
      for (let st of exev?.student_list) {
        const student = await Student.findById(st?.student)
          .select(
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGRNO student_prn_enroll_number"
          )
          .lean()
          .exec();

        let att_marks = 0;

        if (subject?.attendance?.[0]?._id) {
          for (let dt of subject?.attendance?.[0]?.presentStudent) {
            if (`${dt?.student}` === `${student?._id}`) {
              att_marks = 3;
              break;
            }
          }
        }
        students.push({
          "Enrollment / PRN NO ": student?.student_prn_enroll_number ?? "#NA",
          GRNO: student?.studentGRNO ?? "#NA",
          ROLLNO: student.studentROLLNO ?? "#NA",
          Name: `${student?.studentFirstName} ${
            student?.studentMiddleName ? student?.studentMiddleName : ""
          } ${student?.studentLastName}`,
          Attendance_Marks: att_marks ?? 0,
          Performance_Marks: st?.practical_marks ?? 0,
          Journal_Marks: st?.journal_marks ?? 0,
          Total_Marks: att_marks + st?.practical_marks + st?.journal_marks,
        });
      }
    }

    let excel_key = "";
    if (students?.length > 0) {
      excel_key = await subject_continuous_json_to_excel(
        exev?.subject,
        students,
        "Experiment Student",
        "ONE_EXPERIMENT",
        "one-experiment"
      );
    }
    res.status(200).send({
      message: "One Subject student excel export",
      excel_key: excel_key,
    });
    if (excel_key) {
      exev.export_collection.push({
        excel_type: "ONE_EXPERIMENT",
        excel_file: excel_key,
        excel_file_name: excel_key,
      });
      exev.export_collection_count += 1;
      await exev.save();
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.ct_one_experiment_import_query = async (req, res) => {
  try {
    const { exid } = req.params;
    const { excel_key } = req.body;
    if (!exid || !excel_key) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const exev = await SubjectContinuousEvaluationExperiment.findById(exid);
    exev.import_collection?.push({
      excel_type: "Mark Import",
      excel_file: excel_key,
      status: "Pending",
    });
    exev.import_collection_count += 1;
    await exev.save();
    res
      .status(200)
      .send({ message: "Student Marks import excel is in processing" });

    const subject = await Subject.findById(exev.subject)
      .populate({
        path: "subjectMasterName",
        select: "institute",
      })
      .select("subjectMasterName");
    const file = await simple_object(excel_key);
    const { data_query } = await getj_subject_one_experiment_query(file);
    let iteration_count = data_query?.length;
    let marks_list = [];
    if (iteration_count > 0) {
      for (let i = 0; i < iteration_count; i++) {
        let studt = data_query[i];
        const student = await Student.findOne({
          $and: [
            {
              studentGRNO: { $eq: `${studt?.GRNO}` },
            },
            {
              institute: { $eq: `${subject?.subjectMasterName?.institute}` },
            },
          ],
        });
        let obj = {
          student: `${student?._id}`,
          attendance_marks: studt?.attendance_marks ?? 0,
          practical_marks: studt?.practical_marks ?? 0,
          journal_marks: studt?.journal_marks ?? 0,
          total_marks: 0,
        };
        obj.total_marks =
          +obj.attendance_marks + +obj.practical_marks + +obj.journal_marks;
        marks_list.push(obj);
      }
    }

    if (marks_list?.length > 0) {
      if (exev?.student_list?.length > 0) {
        for (let mt of marks_list) {
          for (let dt of exev?.student_list) {
            if (`${dt?.student}` === `${mt?.student}`) {
              dt.attendance_marks = mt.attendance_marks;
              dt.practical_marks = mt.practical_marks;
              dt.journal_marks = mt.journal_marks;
              dt.total_marks = mt.total_marks;
              break;
            }
          }
        }
        await exev.save();
      } else {
        exev.student_list = marks_list;
        await exev.save();
      }
      for (let st of exev?.import_collection ?? []) {
        if (`${st?.excel_file}` === `${excel_key}`) {
          st.status = "Success";
          await exev.save();
          break;
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.ct_combined_experiment_export_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const ct_ev = await SubjectContinuousEvaluation.findById(ceid);
    let stu_obj = {};

    const all_exp = await SubjectContinuousEvaluationExperiment.find({
      continuous_evaluation: ct_ev,
    });

    if (all_exp?.length > 0) {
      for (let exp of all_exp) {
        if (exp?.student_list?.length > 0) {
          for (let stu of exp?.student_list) {
            if (stu_obj[stu?.student]) {
              stu_obj[stu?.student]["mark"] += stu?.total_marks;
              stu_obj[stu?.student]["outof"] += exp?.outof;
            } else {
              stu_obj[stu?.student] = {
                mark: stu?.total_marks,
                outof: exp?.outof,
              };
            }
          }
        }
      }
    }

    let students = [];
    for (let ob in stu_obj) {
      const student = await Student.findById(ob)
        .select(
          "studentFirstName studentMiddleName studentLastName studentROLLNO studentGRNO student_prn_enroll_number"
        )
        .lean()
        .exec();
      let ot = stu_obj[ob];
      let per = 0;
      if (ot?.mark > 0) {
        per = Math.ceil((ot?.mark / ot?.outof) * 100);
        per = +per;
        per = Math.ceil((per * ct_ev?.experiment_outof) / 100);
        per = +per;
      }
      students.push({
        "Enrollment / PRN NO ": student?.student_prn_enroll_number ?? "#NA",
        GRNO: student?.studentGRNO ?? "#NA",
        ROLLNO: student.studentROLLNO ?? "#NA",
        Name: `${student?.studentFirstName} ${
          student?.studentMiddleName ? student?.studentMiddleName : ""
        } ${student?.studentLastName}`,
        Total_Marks: per ?? 0,
      });
    }

    let excel_key = "";
    if (students?.length > 0) {
      excel_key = await subject_continuous_json_to_excel(
        ct_ev?.subject,
        students,
        "Experiment Student",
        "ALL_EXPERIMENT",
        "all-experiment"
      );
    }
    res.status(200).send({
      message: "One Subject student excel export",
      excel_key: excel_key,
    });
    if (excel_key) {
      ct_ev.export_collection.push({
        excel_type: "ALL_EXPERIMENT",
        excel_file: excel_key,
        excel_file_name: excel_key,
      });
      ct_ev.export_collection_count += 1;
      await ct_ev.save();
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};
exports.ct_attendance_assesment_export_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const ct_ev = await SubjectContinuousEvaluation.findById(ceid);
    let students = [];
    if (ct_ev?.attendance_subject) {
      const subjects = await Subject.findById(
        ct_ev?.attendance_subject
      ).populate({
        path: "attendance",
      });
      let student_list = [];

      student_list = await Student.find({
        _id: { $in: ct_ev.student_list },
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentROLLNO studentGRNO student_prn_enroll_number"
        )
        .lean()
        .exec();

      for (let stu of student_list) {
        let obj = {
          subjectWise: {
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
          },
          attendance_mark: 0,
        };
        for (let att of subjects?.attendance) {
          for (let pre of att?.presentStudent) {
            if (String(stu._id) === String(pre.student)) {
              obj.subjectWise.presentCount += 1;
              break;
            }
          }
          obj.subjectWise.totalCount += 1;
        }
        if (obj.subjectWise.totalCount > 0) {
          obj.subjectWise.totalPercentage = Math.ceil(
            (obj.subjectWise.presentCount * 100) / obj.subjectWise.totalCount
          );

          obj.subjectWise.totalPercentage = +obj.subjectWise.totalPercentage;

          if (ct_ev?.attendance_grade_marks?.length > 0) {
            for (let dbt of ct_ev?.attendance_grade_marks) {
              if (
                obj.subjectWise.totalPercentage >= dbt?.start_range &&
                obj.subjectWise.totalPercentage <= dbt?.end_range
              ) {
                obj.attendance_mark = +dbt.grade_marks;
              }
            }
          } else {
            obj.attendance_mark = Math.ceil(
              (obj.subjectWise.totalPercentage * ct_ev.attendance_outof) / 100
            );
            obj.attendance_mark = +obj.attendance_mark;
          }
        }
        students.push({
          "Enrollment / PRN NO ": stu?.student_prn_enroll_number ?? "#NA",
          GRNO: stu?.studentGRNO ?? "#NA",
          ROLLNO: stu?.studentROLLNO ?? "#NA",
          Name: `${stu?.studentFirstName} ${
            stu?.studentMiddleName ? stu?.studentMiddleName : ""
          } ${stu?.studentLastName}`,
          Total_Marks: obj.attendance_mark,
        });
      }
    }

    let excel_key = "";
    if (students?.length > 0) {
      excel_key = await subject_continuous_json_to_excel(
        ct_ev?.subject,
        students,
        "Attendance Student",
        "CONTINUOUS_ATTENDANCE",
        "constinuous-attendance"
      );
    }
    res.status(200).send({
      message: "One Subject student excel export",
      excel_key: excel_key,
    });
    if (excel_key) {
      ct_ev.export_collection.push({
        excel_type: "CONTINUOUS_ATTENDANCE",
        excel_file: excel_key,
        excel_file_name: excel_key,
      });
      ct_ev.export_collection_count += 1;
      await ct_ev.save();
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};
exports.ct_assignment_assesment_export_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const ct_ev = await SubjectContinuousEvaluation.findById(ceid);
    let students = [];
    if (ct_ev?.assignment_subject) {
      const subjects = await Subject.findById(ct_ev?.assignment_subject);

      if (subjects?.assignments?.length > 0) {
        let student_list = [];
        student_list = await Student.find({
          _id: { $in: ct_ev.student_list },
        })
          .select(
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGRNO student_prn_enroll_number"
          )
          .lean()
          .exec();
        for (let stu of student_list) {
          let obj = {
            assignment_mark: 0,
            assignment_total_mark: 0,
          };

          const stu_assignment = await StudentAssignment.find({
            $and: [
              {
                assignment: {
                  $in: subjects?.assignments,
                },
              },
              {
                student: {
                  $eq: `${stu?._id}`,
                },
              },
            ],
          });

          if (stu_assignment?.length > 0) {
            for (let ass of stu_assignment) {
              obj.assignment_mark += ass?.assignment_obtain_mark;
              obj.assignment_total_mark += ass?.assignment_total_mark;
            }
          }
          if (obj.assignment_total_mark > 0 && obj.assignment_mark > 0) {
            obj.assignment_mark = Math.ceil(
              (obj.assignment_mark * 100) / obj.assignment_total_mark
            );
            obj.assignment_mark = +obj.assignment_mark;

            obj.assignment_mark = Math.ceil(
              (obj.assignment_mark * ct_ev.assignment_outof) / 100
            );
            obj.assignment_mark = +obj.assignment_mark;
          }

          students.push({
            "Enrollment / PRN NO ": stu?.student_prn_enroll_number ?? "#NA",
            GRNO: stu?.studentGRNO ?? "#NA",
            ROLLNO: stu?.studentROLLNO ?? "#NA",
            Name: `${stu?.studentFirstName} ${
              stu?.studentMiddleName ? stu?.studentMiddleName : ""
            } ${stu?.studentLastName}`,
            Total_Marks: obj.assignment_mark,
          });
        }
      }
    }
    let excel_key = "";
    if (students?.length > 0) {
      excel_key = await subject_continuous_json_to_excel(
        ct_ev?.subject,
        students,
        "Assignment Student",
        "CONTINUOUS_ASSIGNMENT",
        "constinuous-assignment"
      );
    }
    res.status(200).send({
      message: "One Subject student excel export",
      excel_key: excel_key,
    });
    if (excel_key) {
      ct_ev.export_collection.push({
        excel_type: "CONTINUOUS_ASSIGNMENT",
        excel_file: excel_key,
        excel_file_name: excel_key,
      });
      ct_ev.export_collection_count += 1;
      await ct_ev.save();
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};
exports.ct_total_assesment_export_query = async (req, res) => {
  try {
    const { ceid } = req.params;
    if (!ceid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const ct_ev = await SubjectContinuousEvaluation.findById(ceid);
    let students = [];
    if (ct_ev?.student_data?.length > 0) {
      let student_list = [];
      student_list = await Student.find({
        _id: { $in: ct_ev.student_list },
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentROLLNO studentGRNO student_prn_enroll_number"
        )
        .lean()
        .exec();

      for (let stu of student_list) {
        let obj = {
          total_mark: 0,
          total_mark_outof: 0,
          column: 0,
        };

        for (let odt of ct_ev?.student_data) {
          if (`${stu?._id}` === `${odt?.student}`) {
            if (ct_ev?.experiment_toggle) {
              obj.total_mark += odt?.all_exp;
              obj.total_mark_outof += ct_ev?.experiment_outof;
              obj.column += 1;
            }
            if (ct_ev?.attendance_toggle) {
              obj.total_mark += odt?.attendance;
              obj.total_mark_outof += ct_ev?.attendance_outof;

              obj.column += 1;
            }
            if (ct_ev?.cls_test_toggle) {
              obj.total_mark += odt?.cls_test;
              obj.total_mark_outof += ct_ev?.cls_test_outof;

              obj.column += 1;
            }
            if (ct_ev?.assignment_toggle) {
              obj.total_mark += odt?.assingment;
              obj.total_mark_outof += ct_ev?.assignment_outof;

              obj.column += 1;
            }
            break;
          }
        }
        obj.total_mark = Math.ceil(
          (obj.total_mark / obj.total_mark_outof) * 100
        );
        obj.total_mark = Math.ceil((obj.total_mark * ct_ev.total_outof) / 100);
        obj.total_mark = +obj.total_mark;
        students.push({
          "Enrollment / PRN NO ": stu?.student_prn_enroll_number ?? "#NA",
          GRNO: stu?.studentGRNO ?? "#NA",
          ROLLNO: stu?.studentROLLNO ?? "#NA",
          Name: `${stu?.studentFirstName} ${
            stu?.studentMiddleName ? stu?.studentMiddleName : ""
          } ${stu?.studentLastName}`,
          Total_Marks: obj.total_mark,
        });
      }
    }
    let excel_key = "";
    if (students?.length > 0) {
      excel_key = await subject_continuous_json_to_excel(
        ct_ev?.subject,
        students,
        "Student",
        "CONTINUOUS_TOTAL",
        "constinuous-total"
      );
    }
    res.status(200).send({
      message: "One Subject student excel export",
      excel_key: excel_key,
    });
    if (excel_key) {
      ct_ev.export_collection.push({
        excel_type: "CONTINUOUS_TOTAL",
        excel_file: excel_key,
        excel_file_name: excel_key,
      });
      ct_ev.export_collection_count += 1;
      await ct_ev.save();
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};
