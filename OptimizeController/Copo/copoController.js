const Attainment = require("../../models/Marks/Attainment");
const SubjectAttainment = require("../../models/Marks/SubjectAttainment");
const SubjectAttainmentMapping = require("../../models/Marks/SubjectAttainmentMapping");
const SubjectMaster = require("../../models/SubjectMaster");
const Subject = require("../../models/Subject");
const Class = require("../../models/Class");
const Student = require("../../models/Student");
const Department = require("../../models/Department");
const Batch = require("../../models/Batch");

exports.getAllAttainmentQuery = async (req, res) => {
  try {
    const { smid } = req.params;
    const { flow } = req.query;
    if (!smid) throw "Please send subject master id to perform operations";
    if (flow === "MARKING_COPO") {
      var attainment = await Attainment.find({
        subject_master: { $eq: `${smid}` },
        attainment_type: { $eq: `CO` },
      });
    } else {
      var attainment = await Attainment.find({
        subject_master: { $eq: `${smid}` },
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
    attainment.subject_master = smid;
    attainment.attainment_type = req.body?.attainment_type;
    const subject_master = await SubjectMaster.findById(smid);
    if (req.body?.attainment_type === "CO") {
      subject_master.co_attainment.push(attainment?._id);
      subject_master.co_attainment_count += 1;
    } else {
      subject_master.po_attainment.push(attainment?._id);
      subject_master.po_attainment_count += 1;
    }

    await Promise.all([attainment.save(), subject_master.save()]);
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

    for (let satid of attainment?.subject_attainment) {
      const sub_attainment = await SubjectAttainment.findById(satid);
      attainment.attainment_name = req.body?.attainment_name;
      await sub_attainment.save();
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
      const sub_master = await SubjectMaster.findById(
        attainment?.subject_master
      );
      if (attainment.attainment_type === "CO") {
        sub_master.co_attainment.pull(attainment?._id);
        sub_master.co_attainment_count -= 1;
      } else {
        sub_master.po_attainment.pull(attainment?._id);
        sub_master.po_attainment_count -= 1;
      }
      await sub_master.save();
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
      for (let sub_marks of stu?.subjectMarks?.[0]?.marks) {
        for (let sub_att of sub_attainment) {
          for (let assign_att of sub_att?.attainment_assign) {
            if (String(assign_att?.examId) === String(sub_marks?.examId)) {
              let mark = +(
                (sub_marks?.obtainMarks * assign_att?.attainment_mark_weight) /
                100
              ).toFixed(2);

              co_wise[sub_att.attainment_name] =
                co_wise[sub_att.attainment_name]?.length > 0
                  ? [...co_wise[sub_att.attainment_name], mark]
                  : [mark];
              if (uni_co_wise[sub_att.attainment_name]) {
                if (
                  String(
                    uni_co_wise[sub_att.attainment_name][assign_att?.examId]
                      ?.examId
                  ) === String(assign_att?.examId)
                ) {
                  uni_co_wise[sub_att.attainment_name][
                    assign_att?.examId
                  ].mark =
                    uni_co_wise[sub_att.attainment_name][assign_att?.examId]
                      .mark + mark;
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

              co_assignment_wise[sub_att.attainment_name] = co_assignment_wise[
                sub_att.attainment_name
              ]
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

                if (uni_co_assignment_wise_internal[sub_att.attainment_name]) {
                  if (
                    String(
                      uni_co_assignment_wise_internal[sub_att.attainment_name][
                        assign_att?.assignmentId
                      ]?.assignmentId
                    ) === String(assign_att?.assignmentId)
                  ) {
                    uni_co_assignment_wise_internal[sub_att.attainment_name][
                      assign_att?.assignmentId
                    ].mark =
                      uni_co_assignment_wise_internal[sub_att.attainment_name][
                        assign_att?.assignmentId
                      ].mark + mark;
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
                } else {
                  uni_co_assignment_wise_internal[sub_att.attainment_name] = {
                    ...uni_co_assignment_wise_internal[sub_att.attainment_name],
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

                if (uni_co_assignment_wise_external[sub_att.attainment_name]) {
                  if (
                    String(
                      uni_co_assignment_wise_external[sub_att.attainment_name][
                        assign_att?.assignmentId
                      ]?.assignmentId
                    ) === String(assign_att?.assignmentId)
                  ) {
                    uni_co_assignment_wise_external[sub_att.attainment_name][
                      assign_att?.assignmentId
                    ].mark =
                      uni_co_assignment_wise_external[sub_att.attainment_name][
                        assign_att?.assignmentId
                      ].mark + mark;
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
                } else {
                  uni_co_assignment_wise_external[sub_att.attainment_name] = {
                    ...uni_co_assignment_wise_external[sub_att.attainment_name],
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

    const subject_attainment = [];
    let co_weightage_total = {};

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
            assignment_obj.total_marks.mark / att_assign?.present_student_count
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
            uni_co_wise[sub_att?.attainment_name]?.[att_assign?.examId]?.mark /
            att_assign?.present_student_count
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
            cls_avg_marks: +(t_avg / att_assign?.attainment_mark).toFixed(3),
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
      if (assignment_obj?.assignment_count) {
        sub_obj.attainment_assign.push(assignment_obj);
      }

      subject_attainment.push(sub_obj);
    }

    let co_weightage = {
      key0: ["CO"],
      key_count: 0,
    };
    let co_weightage_assignment = ["ASSIGNMENT"];
    for (let sub_att of sub_attainment) {
      let co_weightage_count = 0;
      co_weightage["key0"].push(sub_att?.attainment_name);

      let assignment_obj = {
        attainment_mark: 0,
      };
      for (let att_assign of sub_att?.attainment_assign) {
        if (att_assign?.attainment_assign_type === "ASSIGNMENT") {
          assignment_obj.attainment_mark += att_assign?.attainment_mark;
        } else {
          co_weightage_count += 1;
          for (let tt in co_weightage) {
            if (tt === "key0" || tt === "key_count") {
            } else {
              if (
                `${co_weightage[tt]?.[0]?.examId}` === `${att_assign.examId}`
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
      co_weightage_assignment.push(assignment_obj.attainment_mark);
      if (!co_weightage.key_count) co_weightage.key_count = co_weightage_count;
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
      for (let co_avg of sub_avg?.attainment_assign) {
        if (co_avg?.copo_attainment_type === "INTERNAL") {
          if (co_avg?.attainment_assign_type === "ASSIGNMENT") {
          } else {
            if (
              outer_cls_average_ia.insertedExam?.includes(`${co_avg?.examId}`)
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

    let outer_cls_average_ea = {
      co_list: [],
      co_attainment_name_list: [],
      insertedExam: [],
    };
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

      for (let co_avg of sub_avg?.attainment_assign) {
        if (co_avg?.copo_attainment_type === "EXTERNAL") {
          if (co_avg?.attainment_assign_type === "ASSIGNMENT") {
          } else {
            if (
              outer_cls_average_ea.insertedExam?.includes(`${co_avg?.examId}`)
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

    let co_quality_compliance = {
      co_list: calculation_co_attainment["co_list"],
    };

    for (let sub_avg of subject_attainment) {
      let gap =
        calculation_co_attainment[sub_avg?.attainment_name]?.["direct_co"] -
        sub_avg?.attainment_target;
      co_quality_compliance[sub_avg?.attainment_name] = {
        attainment_name: sub_avg?.attainment_name,
        attainment_target: sub_avg?.attainment_target,
        co_attainment_gap: gap,
        action_praposed_to_bridge_gap:
          gap > 0 ? "Co Over Achived" : gap === 0 ? "Co Achived" : "Do not now",
        modification_of_target_where_achived: " - ",
      };
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

// exports.getAllAttainmentQuery = async (req, res) => {
//   try {
//   } catch (e) {
//     res.status(200).send({
//       message: e,
//     });
//     console.log(e);
//   }
// };

// exports.getAllAttainmentQuery = async (req, res) => {
//   try {
//   } catch (e) {
//     res.status(200).send({
//       message: e,
//     });
//     console.log(e);
//   }
// };
