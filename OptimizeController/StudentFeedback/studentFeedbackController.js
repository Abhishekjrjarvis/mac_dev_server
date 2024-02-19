const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const Class = require("../../models/Class");
const Department = require("../../models/Department");
const InstituteAdmin = require("../../models/InstituteAdmin");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Staff = require("../../models/Staff");
const SubjectMaster = require("../../models/SubjectMaster");
const Student = require("../../models/Student");
const StudentFeedback = require("../../models/StudentFeedback/StudentFeedback");
const StudentGiveFeedback = require("../../models/StudentFeedback/StudentGiveFeedback");
const User = require("../../models/User");
const StaffStudentFeedback = require("../../models/StudentFeedback/StaffStudentFeedback");

exports.getStudentFeedbackQuery = async (req, res) => {
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

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      const feedback = await StudentFeedback.find({
        $and: [
          {
            institute: id,
          },
          {
            $or: [
              {
                feedback_name: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .sort({
          created_at: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage);

      res.status(201).send({
        message: "Student Feedback list",
        feedback: feedback ?? [],
      });
    } else {
      const feedback = await StudentFeedback.find({
        institute: id,
      })
        .sort({
          created_at: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage);

      res.status(201).send({
        message: "Student Feedback list",
        feedback: feedback ?? [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.createStudentFeedbackQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { feedback_name, feedback_type, how_many_question_option } = req.body;
    const feedback = new StudentFeedback({
      institute: id,
      feedback_name: feedback_name,
      feedback_type: feedback_type,
      how_many_question_option: how_many_question_option
        ? +how_many_question_option
        : 5,
    });
    const institute = await InstituteAdmin.findById(id);
    institute.student_feedback?.push(feedback?._id);
    institute.student_feedback_count += 1;
    await Promise.all([feedback.save(), institute.save()]);
    res.status(201).send({
      message: "student feedback created successfully",
    });
  } catch (e) {
    console.log(e);
  }
};
exports.updateStudentFeedbackQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { feedback_name, feedback_type, how_many_question_option } = req.body;

    const feedback = await StudentFeedback.findById(ifid);
    if (!feedback?.evaluation) {
      feedback.feedback_name = feedback_name;
      feedback.feedback_type = feedback_type;
      feedback.how_many_question_option = how_many_question_option;
      await feedback.save();
      res.status(200).send({
        message: "student feedback updated successfully",
      });
    } else {
      res.status(200).send({
        message:
          "student feedback not updated because student start feedback of subject teacher.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.removeStudentFeedbackQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid);
    if (!feedback?.evaluation) {
      const institute = await InstituteAdmin.findById(feedback?.institute);
      institute.student_feedback?.pull(feedback?._id);
      if (institute.student_feedback_count > 0)
        institute.student_feedback_count -= 1;

      await institute.save();
      await StudentFeedback.findByIdAndDelete(ifid);
      res.status(200).send({
        message: "student feedback deleted successfully",
      });
    } else {
      res.status(200).send({
        message:
          "student feedback not deleted because student start feedback of subject teacher.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.studentFeedbackDetailQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid).select(
      "-given_feedback -feedback_notify -feedback_staff"
    );
    res.status(200).send({
      message: "One feedback details.",
      feedback: feedback ?? null,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.addQuestionStudentFeedbackQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { questions } = req.body;
    const feedback = await StudentFeedback.findById(ifid);
    feedback.questions?.push(questions);
    feedback.question_count += 1;
    await feedback.save();
    res.status(201).send({
      message: "student feedback  question created successfully",
    });
  } catch (e) {
    console.log(e);
  }
};
exports.updateQuestionStudentFeedbackQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    const { questionId } = req.query;
    if (!ifid || !questionId) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { questions } = req.body;
    const feedback = await StudentFeedback.findById(ifid);
    if (!feedback?.evaluation) {
      for (let que of feedback.questions) {
        if (`${que?._id}` === `${questionId}`) {
          que.question_title = questions?.question_title;
          que.options = questions?.options;
          break;
        }
      }
      await feedback.save();
      res.status(200).send({
        message: "student feedback question updated successfully",
      });
    } else {
      res.status(200).send({
        message:
          "student feedback question not updated because student start feedback of subject teacher.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.removeQuestionStudentFeedbackQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    const { questionId } = req.query;
    if (!ifid || !questionId) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid);
    if (!feedback?.evaluation) {
      let arr = [];
      let count = 0;
      for (let i = 0; i < feedback.questions?.length; i++) {
        let que = feedback.questions[i];
        if (`${que?._id}` !== `${questionId}`) {
          ++count;
          arr.push({
            ...que,
            question_sno: `${count}`,
          });
        }
      }
      feedback.questions = arr;
      if (feedback.question_count > 0) feedback.question_count -= 1;
      await feedback.save();
      res.status(200).send({
        message: "student feedback question deleted successfully",
      });
    } else {
      res.status(200).send({
        message:
          "student feedback question not deleted because student start feedback of subject teacher.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

// here add batch wise condition
exports.feedbackTakenByInstituteQuery = async (req, res) => {
  try {
    const { id, ifid } = req.params;
    const { feedback_close_at } = req.body;
    if (!id || !ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const institute = await InstituteAdmin.findById(id);
    const feedback = await StudentFeedback.findById(ifid);
    feedback.evaluation = true;
    feedback.send_notification = true;
    let dt = new Date();
    dt.setHours(dt.getHours() + 5);
    dt.setMinutes(dt.getMinutes() + 30);
    feedback.feedback_take_date = dt;
    feedback.feedback_close_at = new Date(feedback_close_at);
    await feedback.save();
    res.status(200).send({
      message: "student feedback taken by Institute Admin",
    });

    const department = await Department.find({
      institute: id,
    }).select("departmentSelectBatch");

    const all_batches = [];

    for (let dt of department) {
      all_batches.push(dt?.departmentSelectBatch);
    }
    const cls = await Class.find({
      batch: { $in: all_batches },
    })
      .populate({
        path: "subject",
        populate: {
          path: "selected_batch_query",
          select: "class_student_query",
        },
        select: "subjectTeacherName subjectMasterName selected_batch_query",
      })
      .select("subject ApproveStudent");

    var cls_student = {};
    for (let ct of cls) {
      cls_student[ct?._id] = {
        staff: [],
        student: [],
      };
      let arr = [];
      for (let st of ct?.subject) {
        let flag = true;
        for (let it of arr) {
          if (
            `${it?.staffId}` === `${st?.subjectTeacherName}` &&
            `${it?.master}` === `${st?.subjectMasterName}`
          ) {
            flag = false;
            break;
          }
        }
        if (flag) {
          if (st?.subjectTeacherName)
            arr.push({
              staffId: st?.subjectTeacherName,
              master: st?.subjectMasterName,
              is_batch: st?.selected_batch_query ? true : false,
              student: st?.selected_batch_query?.class_student_query,
            });
        }
      }
      cls_student[ct?._id]["student"] = ct?.ApproveStudent;
      cls_student[ct?._id]["staff"] = arr;
    }

    for (let obj in cls_student) {
      let data = cls_student[obj];
      for (let st of data["staff"] ?? []) {
        const staff = await Staff.findById(st?.staffId);
        const master = await SubjectMaster.findById(st?.master);
        var staff_feedbaack = await StaffStudentFeedback.findOne({
          $and: [
            {
              staff: { $eq: `${staff?._id}` },
            },
            {
              feedbackId: { $eq: `${feedback?._id}` },
            },
          ],
        });
        if (staff_feedbaack) {
          staff_feedbaack.subject_master?.push(master?._id);
        } else {
          staff_feedbaack = new StaffStudentFeedback({
            institute: id,
            feedbackId: feedback?._id,
            staff: staff?._id,
            subject_master: [master?._id],
          });
          staff.student_feedback?.push(staff_feedbaack?._id);
          feedback.feedback_staff?.push(staff_feedbaack?._id);
        }
        let all_student = st?.is_batch ? st?.student : data["student"];
        if (all_student?.length > 0) {
          for (let stu of all_student) {
            const student = await Student.findById(stu);
            const user = await User.findById(student?.user);
            const notify = new StudentNotification({});
            notify.notifyContent = `Give your valuable feedback to your beloved teacher - ${
              staff?.staffFirstName
            } ${staff?.staffMiddleName ? `${staff?.staffMiddleName} ` : ""}${
              staff?.staffLastName ?? ""
            } of - ${master?.subjectName}`;
            notify.notifySender = institute._id;
            notify.notifyReceiever = user._id;
            notify.notifyType = "Student";
            notify.notifyPublisher = student._id;
            notify.instituteId = institute._id;
            user.activity_tab.push(notify._id);
            notify.notifyByInsPhoto = institute._id;
            notify.notifyCategory = "Subject Teacher Feedback";
            notify.redirectIndex = 89;
            notify.student_feedback = feedback?._id;
            notify.staffId = staff?._id;
            notify.subjectMasterId = master?._id;
            notify.staffFeedbackId = staff_feedbaack?._id;
            notify.feedbackClassId = obj;

            feedback.feedback_notify?.push(notify?._id);
            feedback.feedback_notify_count += 1;

            // invokeMemberTabNotification(
            //   "Student Activity",
            //   notify,
            //   "Staff Feedback",
            //   user._id,
            //   user.deviceToken,
            //   "Student",
            //   notify
            // );
            await Promise.all([notify.save(), user.save()]);
          }
        }

        staff_feedbaack.classes?.push(obj);
        await Promise.all([
          feedback.save(),
          staff_feedbaack.save(),
          staff.save(),
        ]);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
exports.giveStudentFeedbackQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { ifid, staffId, questions, notifyId, feedback_rating } = req.body;
    if (!sid || !ifid || !staffId || !notifyId) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const notify = await StudentNotification.findById(notifyId);
    const give_feedback = new StudentGiveFeedback({
      student: sid,
      subject_teacher: staffId,
      institute_feedback: ifid,
      subject_master: notify?.subjectMasterId,
      student_class: notify?.feedbackClassId,
      feedback_rating: feedback_rating,
      questions: questions,
    });
    notify.student_feedback_status = "Submitted";
    await Promise.all([give_feedback.save(), notify.save()]);
    res.status(200).send({
      message: "student feedback given successfully",
    });
    const feedback = await StudentFeedback.findById(ifid);
    feedback.given_feedback?.push(give_feedback?._id);
    feedback.feedback_given_student_count += 1;
    give_feedback.feedback_name = feedback?.feedback_name;
    give_feedback.feedback_type = feedback?.feedback_type;
    give_feedback.institute = feedback?.institute ?? null;
    var staff_feedback = await StaffStudentFeedback.findById(
      notify?.staffFeedbackId
    );

    staff_feedback.student_give_feedback?.push(give_feedback?._id);
    staff_feedback.student_give_feedback_count += 1;
    await Promise.all([
      give_feedback.save(),
      staff_feedback.save(),
      feedback.save(),
    ]);
  } catch (e) {
    console.log(e);
  }
};
exports.getSubjectStaffListQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const st = await StaffStudentFeedback.find({
      feedbackId: ifid,
    }).select("staff");
    var staff = [];
    for (let ft of st) {
      staff.push(ft?.staff);
    }
    var all_staff = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      all_staff = await Staff.find({
        $and: [{ _id: { $in: staff } }],
        $or: [
          {
            staffFirstName: { $regex: req.query.search, $options: "i" },
          },
          {
            staffLastName: { $regex: req.query.search, $options: "i" },
          },
          {
            staffMiddleName: { $regex: req.query.search, $options: "i" },
          },
        ],
      })
        .populate({
          path: "student_feedback",
          match: { feedbackId: { $eq: `${ifid}` } },
          select:
            "student_give_feedback_count analytic_evaluation subject_analytic",
        })
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "staffFirstName staffLastName staffMiddleName photoId staffProfilePhoto staffROLLNO staff_emp_code"
        );
    } else {
      all_staff = await Staff.find({
        _id: {
          $in: staff,
        },
      })
        .populate({
          path: "student_feedback",
          match: { feedbackId: { $eq: `${ifid}` } },
          select:
            "student_give_feedback_count analytic_evaluation subject_analytic",
        })
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "staffFirstName staffLastName staffMiddleName photoId staffProfilePhoto staffROLLNO staff_emp_code"
        );
    }

    res.status(201).send({
      message: "staff Feedback list",
      all_staff,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.getGivenFeedbackStudentListQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const st = await StudentGiveFeedback.find({
      institute_feedback: ifid,
    }).select("student");
    var student = [];
    for (let ft of st) {
      if (student?.includes(`${ft?.student}`)) {
      } else {
        student.push(`${ft?.student}`);
      }
    }
    var all_student = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      all_student = await Student.find({
        $and: [{ _id: { $in: student } }],
        $or: [
          {
            studentFirstName: { $regex: req.query.search, $options: "i" },
          },
          {
            studentLastName: { $regex: req.query.search, $options: "i" },
          },
          {
            studentMiddleName: { $regex: req.query.search, $options: "i" },
          },
          {
            studentGRNO: { $regex: req.query.search, $options: "i" },
          },
          {
            valid_full_name: { $regex: req.query.search, $options: "i" },
          },
        ],
      })
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "studentFirstName studentLastName studentMiddleName photoId studentProfilePhoto studentROLLNO studentGRNO"
        );
    } else {
      all_student = await Student.find({
        _id: {
          $in: student,
        },
      })
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "studentFirstName studentLastName studentMiddleName photoId studentProfilePhoto studentROLLNO studentGRNO"
        );
    }

    res.status(200).send({
      message: "Student Feedback list",
      all_student,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.feedbackAnalyticsProcessInstituteQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid);
    feedback.analytic_evaluation = true;
    await feedback.save();
    res.status(200).send({
      message: "Feedback analytics in process, please wait some time.",
    });
    const staff_feedback = await StaffStudentFeedback.find({
      feedbackId: ifid,
    });

    for (let st of staff_feedback ?? []) {
      const st_feedback = await StaffStudentFeedback.findById(st?._id);
      for (let mt of st?.subject_master) {
        let question = {};
        for (let qe of feedback?.questions) {
          question[qe?.question_sno] = {};
          if (feedback?.how_many_question_option === 2) {
            question[qe?.question_sno]["excellent"] = {
              count: 0,
              multiply: 5,
              percentage: 0,
            };
            question[qe?.question_sno]["poor"] = {
              count: 0,
              multiply: 1,
              percentage: 0,
            };
          } else if (feedback?.how_many_question_option === 3) {
            question[qe?.question_sno]["excellent"] = {
              count: 0,
              multiply: 5,
              percentage: 0,
            };
            question[qe?.question_sno]["satisfaction"] = {
              count: 0,
              multiply: 3,
              percentage: 0,
            };
            question[qe?.question_sno]["poor"] = {
              count: 0,
              multiply: 1,
              percentage: 0,
            };
          } else if (feedback?.how_many_question_option === 4) {
            question[qe?.question_sno]["excellent"] = {
              count: 0,
              multiply: 5,
              percentage: 0,
            };
            question[qe?.question_sno]["good"] = {
              count: 0,
              multiply: 4,
              percentage: 0,
            };
            question[qe?.question_sno]["satisfaction"] = {
              count: 0,
              multiply: 3,
              percentage: 0,
            };
            question[qe?.question_sno]["poor"] = {
              count: 0,
              multiply: 1,
              percentage: 0,
            };
          } else {
            question[qe?.question_sno]["excellent"] = {
              count: 0,
              multiply: 5,
              percentage: 0,
            };
            question[qe?.question_sno]["good"] = {
              count: 0,
              multiply: 4,
              percentage: 0,
            };
            question[qe?.question_sno]["satisfaction"] = {
              count: 0,
              multiply: 3,
              percentage: 0,
            };
            question[qe?.question_sno]["average"] = {
              count: 0,
              multiply: 2,
              percentage: 0,
            };
            question[qe?.question_sno]["poor"] = {
              count: 0,
              multiply: 1,
              percentage: 0,
            };
          }
        }
        let ana = {
          ...question,
          staffId: st?.staff,
          subjectMaster: mt,
          excellent: {
            percentage: 0,
            multiply: 5,
            arr: [],
            factor: 0,
          },
          good: {
            percentage: 0,
            multiply: 4,
            arr: [],
            factor: 0,
          },
          satisfaction: {
            percentage: 0,
            multiply: 3,
            arr: [],
            factor: 0,
          },
          poor: {
            percentage: 0,
            multiply: 1,
            arr: [],
            factor: 0,
          },
          average: {
            percentage: 0,
            multiply: 2,
            arr: [],
            factor: 0,
          },
          avg_percentage_arr: [],
          avg_percentage: 0,
        };
        const given_feedback = await StudentGiveFeedback.find({
          $and: [
            {
              _id: { $in: st?.student_give_feedback },
            },
            {
              subject_master: { $eq: `${mt}` },
            },
          ],
        });
        for (let gf of given_feedback ?? []) {
          for (let qu of gf?.questions) {
            let which_one = "";
            for (let opt of qu?.options) {
              if (opt?.selected) which_one = opt?.option_sno;
            }
            if (feedback?.how_many_question_option === 2) {
              let rt_fy = which_one === "1" ? "excellent" : "poor";
              ana[qu.question_sno][rt_fy]["count"] += 1;
            } else if (feedback?.how_many_question_option === 3) {
              let rt_fy =
                which_one === "1"
                  ? "excellent"
                  : which_one === "2"
                  ? "satisfaction"
                  : "poor";
              ana[qu.question_sno][rt_fy]["count"] += 1;
            } else if (feedback?.how_many_question_option === 4) {
              let rt_fy =
                which_one === "1"
                  ? "excellent"
                  : which_one === "2"
                  ? "good"
                  : which_one === "3"
                  ? "satisfaction"
                  : "poor";
              ana[qu.question_sno][rt_fy]["count"] += 1;
            } else {
              let rt_fy =
                which_one === "1"
                  ? "excellent"
                  : which_one === "2"
                  ? "good"
                  : which_one === "3"
                  ? "satisfaction"
                  : which_one === "4"
                  ? "average"
                  : "poor";
              ana[qu.question_sno][rt_fy]["count"] += 1;
            }
          }
        }
        if (given_feedback?.length > 0) {
          let category = [
            "excellent",
            "good",
            "satisfaction",
            "poor",
            "average",
          ];
          for (let o in ana) {
            let obj = ana[o];
            for (let cate of category) {
              if (obj[cate]) {
                obj[cate]["percentage"] = Math.floor(
                  (obj[cate]["count"] / feedback?.question_count) * 100
                );
                ana[cate]["arr"].push(obj[cate]["percentage"]);
              }
            }
          }
          for (let cate of category) {
            if (ana[cate]) {
              let sum = ana[cate]["arr"]?.reduce((accc, cv) => accc + cv, 0);
              if (sum) {
                ana[cate]["percentage"] = Math.floor(
                  sum / ana[cate]["arr"]?.length
                );
                ana[cate]["factor"] =
                  ana[cate]["percentage"] * ana[cate]["multiply"];
                ana.avg_percentage_arr.push(ana[cate]["factor"]);
              }
            }
          }
          if (ana.avg_percentage_arr?.length > 0) {
            let sum = ana.avg_percentage_arr?.reduce(
              (accc, cv) => accc + cv,
              0
            );
            ana.avg_percentage = Math.floor(
              sum / feedback?.how_many_question_option ?? 5
            );
          }
          st_feedback.analytic?.push({
            subject_master: mt,
            feedback_analytic: [ana],
          });
        } else {
          st_feedback.analytic?.push({
            subject_master: mt,
            feedback_analytic: [ana],
          });
        }
        st_feedback.subject_analytic?.push({
          subject_master: mt,
          feedback_percentage: ana.avg_percentage,
        });
      }
      st_feedback.analytic_evaluation = true;
      await st_feedback.save();
    }
  } catch (e) {
    console.log(e);
  }
};
exports.getOneStaffAnalyticQuery = async (req, res) => {
  try {
    const { ifid, sid } = req.params;
    if (!ifid || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const staff_feedbaack = await StaffStudentFeedback.findOne({
      $and: [
        {
          feedbackId: ifid,
        },
        {
          staff: sid,
        },
      ],
    })
      .populate({
        path: "analytic",
        populate: {
          path: "subject_master",
          select: "subjectName",
        },
      })
      .select("analytic");
    res.status(200).send({
      message: "One staff analytics with all subject",
      staff_feedbaack,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.updateStudentFeedbackCloseDateQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { feedback_close_at } = req.body;
    const feedback = await StudentFeedback.findById(ifid);
    feedback.feedback_close_at = new Date(feedback_close_at);
    await feedback.save();
    res.status(200).send({
      message: "student feedback close date updated successfully",
    });
  } catch (e) {
    console.log(e);
  }
};
exports.getOneFeedbackStaffQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const staff_feedbaack = await Staff.findById(sid).select(
      "staffFirstName staffLastName staffMiddleName photoId staffProfilePhoto"
    );
    res.status(200).send({
      message: "staff Feedback info",
      staff_feedbaack: staff_feedbaack,
    });
  } catch (e) {
    console.log(e);
  }
};

