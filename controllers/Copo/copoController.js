const Attainment = require("../../models/Marks/Attainment");
const SubjectAttainment = require("../../models/Marks/SubjectAttainment");
const SubjectMaster = require("../../models/SubjectMaster");
const Subject = require("../../models/Subject");
const Class = require("../../models/Class");
const Student = require("../../models/Student");
const Department = require("../../models/Department");
const Batch = require("../../models/Batch");

exports.getAllAttainmentQuery = async (req, res) => {
  try {
    const { smid } = req.params;
    if (!smid) throw "Please send subject master id to perform operations";

    const attainment = await Attainment.find({
      subject_master: { $eq: `${smid}` },
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

    var uni_co_wise_internal = {};
    var uni_co_assignment_wise_internale = {};
    var uni_co_wise_external = {};
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
          }
        }
      }
      stu_obj.co_wise = co_wise;
      stu_obj.co_assignment_wise = co_assignment_wise;
      modify_student.push(stu_obj);
    }
    const subject_attainment = [];
    let co_weightage = {};

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
      };
      for (let att_assign of sub_att?.attainment_assign) {
        if (att_assign?.attainment_assign_type === "ASSIGNMENT") {
          assignment_obj.attainment_mark = att_assign?.attainment_mark;
          assignment_obj.attainment_mark_weight =
            att_assign?.attainment_mark_weight;
          assignment_obj.assignment_count += 1;
          assignment_obj.assignmentId.push(att_assign?.assignmentId);
        } else {
          let t_avg = +(
            uni_co_wise[sub_att?.attainment_name]?.[att_assign?.examId]?.mark /
            2
          )
            // att_assign?.present_student_count ?? 2
            .toFixed(3);
          sub_obj.attainment_assign.push({
            ...att_assign,
            total_marks: {
              ...uni_co_wise[sub_att?.attainment_name]?.[att_assign?.examId],
            },
            avg_marks: t_avg,
            cls_avg_marks: +(t_avg / att_assign?.attainment_mark).toFixed(3),
          });
          if (co_weightage[att_assign.examId]) {
            if (
              String(co_weightage[att_assign.examId]?.examId) ===
              String(att_assign?.examId)
            ) {
              co_weightage[att_assign.examId].exam_wise_total =
                co_weightage[att_assign.examId].exam_wise_total +
                att_assign.attainment_mark;
            } else {
              co_weightage[att_assign.examId] = {
                attainment_name: att_assign?.attainment_name,
                examId: att_assign?.examId,
                exam_wise_total: att_assign.attainment_mark,
              };
            }
          } else {
            co_weightage[att_assign.examId] = {
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

    let outer_cls_average_ia = {
      co_list: [],
      co_attainment_name_list: [],
    };

    for (let sub_avg of subject_attainment) {
      if (outer_cls_average_ia.co_list?.includes(sub_avg.attainment_name)) {
      } else {
        outer_cls_average_ia.co_list?.push(sub_avg.attainment_name);
      }

      outer_cls_average_ia[sub_avg.attainment_name] = {
        c_total: 0,
        c_avg_total: 0,
        count: 0,
        list: [],
      };
      for (let co_avg of sub_avg?.attainment_assign) {
        outer_cls_average_ia.co_attainment_name_list?.push(
          co_avg.attainment_name
        );

        outer_cls_average_ia[sub_avg.attainment_name].c_total +=
          co_avg?.cls_avg_marks;
        outer_cls_average_ia[sub_avg.attainment_name].list.push(
          co_avg?.cls_avg_marks
        );
        outer_cls_average_ia[sub_avg.attainment_name].count += 1;
      }
      outer_cls_average_ia[sub_avg.attainment_name].c_avg_total = Math.ceil(
        (outer_cls_average_ia[sub_avg.attainment_name].c_total /
          outer_cls_average_ia[sub_avg.attainment_name].count) *
          100
      );
    }

    let outer_cls_average_ea = {
      co_list: [],
      co_attainment_name_list: [],
    };

    for (let sub_avg of subject_attainment) {
      if (outer_cls_average_ea.co_list?.includes(sub_avg.attainment_name)) {
      } else {
        outer_cls_average_ea.co_list?.push(sub_avg.attainment_name);
      }

      outer_cls_average_ea[sub_avg.attainment_name] = {
        c_total: 0,
        c_avg_total: 0,
        count: 0,
        list: [],
      };
      for (let co_avg of sub_avg?.attainment_assign) {
        outer_cls_average_ea.co_attainment_name_list?.push(
          co_avg.attainment_name
        );

        outer_cls_average_ea[sub_avg.attainment_name].c_total +=
          co_avg?.cls_avg_marks;
        outer_cls_average_ea[sub_avg.attainment_name].list.push(
          co_avg?.cls_avg_marks
        );
        outer_cls_average_ea[sub_avg.attainment_name].count += 1;
      }
      outer_cls_average_ea[sub_avg.attainment_name].c_avg_total = Math.ceil(
        (outer_cls_average_ea[sub_avg.attainment_name].c_total /
          outer_cls_average_ea[sub_avg.attainment_name].count) *
          100
      );
    }

    const classes = await Class.findById(subject.class)
      .populate({
        path: "department",
        select: "internal_assesment external_assesment",
      })
      .select("department")
      .lean()
      .exec();
    let calculation_co_attainment = {};
    for (let ia in outer_cls_average_ia) {
      let ia_attainment =
        +(
          outer_cls_average_ia[ia]?.c_avg_total *
          classes?.department?.internal_assesment
        ) / 100;
      let ea_attainment =
        +(
          outer_cls_average_ea[ia]?.c_avg_total *
          classes?.department?.external_assesment
        ) / 100;
      calculation_co_attainment[ia] = Math.ceil(ia_attainment + ea_attainment);
    }
    let co_quality_compliance = [];

    for (let sub_avg of subject_attainment) {
      let gap =
        calculation_co_attainment[sub_avg?.attainment_name] -
        sub_avg?.attainment_target;
      let target_obj = {
        attainment_name: sub_avg?.attainment_name,
        attainment_target: sub_avg?.attainment_target,
        co_attainment_gap: gap,
        action_praposed_to_bridge_gap:
          gap > 0 ? "Co Over Achived" : gap === 0 ? "Co Achived" : "Do not now",
        modification_of_target_where_achived: "",
      };
      co_quality_compliance.push(target_obj);
    }
    res.status(200).send({
      message: "Co attainment first table data",
      // modify_student: modify_student?.[0],
      // uni_co_assignment_wise,
      // uni_co_wise,
      // all_students: modify_student,
      co_quality_compliance: co_quality_compliance,
      calculation_co_attainment: calculation_co_attainment,
      // outer_cls_average_ia: outer_cls_average_ia,
      // outer_cls_average_ea: outer_cls_average_ea,
      // co_weightage: co_weightage,
      subject_attainment: subject_attainment,
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
