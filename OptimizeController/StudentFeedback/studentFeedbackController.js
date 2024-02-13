const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const Class = require("../../models/Class");
const Department = require("../../models/Department");
const InstituteAdmin = require("../../models/InstituteAdmin");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const StudentFeedback = require("../../models/StudentFeedback/StudentFeedback");
const StudentGiveFeedback = require("../../models/StudentFeedback/StudentGiveFeedback");
const User = require("../../models/User");

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
    const { feedback_name, feedback_type, questions } = req.body;
    const feedback = new StudentFeedback({
      institute: id,
      feedback_name: feedback_name,
      feedback_type: feedback_type,
      questions: questions,
    });
    const institute = await InstituteAdmin.findById(id);
    institute.student_feedback?.push(feedback?._id);
    institute.student_feedback_count += 1;
    await Promise.all([feedback.save(), institute.save()]);
    res.status(201).send({
      message: "student feedback created successfully",
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
        select: "subjectTeacherName",
      })
      .select("subject ApproveStudent");

    var cls_student = {};
    for (let ct of cls) {
      cls_student[ct?._id] = {
        staff: [],
        student: [],
      };
      let staff = [];
      for (let st of ct?.subject) {
        if (staff?.includes(st?.subjectTeacherName)) {
        } else {
          if (st?.subjectTeacherName) staff.push(st?.subjectTeacherName);
        }
      }
      cls_student[ct?._id]["student"] = ct?.ApproveStudent;
      cls_student[ct?._id]["staff"] = staff;
    }

    for (let obj in cls_student) {
      let data = cls_student[obj];
      for (let st of data["staff"] ?? []) {
        const staff = await Staff.findById(st);
        for (let stu of data["student"] ?? []) {
          const student = await Student.findById(stu);
          const user = await User.findById(student?.user);
          const notify = new StudentNotification({});
          notify.notifyContent = `Give your valuable feedback to your beloved teacher ${
            staff?.staffFirstName
          } ${staff?.staffMiddleName ? `${staff?.staffMiddleName} ` : ""}${
            staff?.staffLastName ?? ""
          }`;
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

          invokeMemberTabNotification(
            "Student Activity",
            notify,
            "Staff Feedback",
            user._id,
            user.deviceToken,
            "Student",
            notify
          );
          await Promise.all([notify.save(), user.save()]);
        }
      }
    }
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
    const { feedback_name, feedback_type, questions } = req.body;

    const feedback = await StudentFeedback.findById(ifid);
    if (!feedback?.evaluation) {
      feedback.feedback_name = feedback_name;
      feedback.feedback_type = feedback_type;
      feedback.questions = questions;
      await feedback.save();
      res.status(200).send({
        message: "student feedback updated successfully",
        feedback: feedback ?? [],
      });
    } else {
      res.status(200).send({
        message:
          "student feedback not updated because student start feedback of subject teacher.",
        feedback: feedback ?? [],
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
        feedback: feedback ?? [],
      });
    } else {
      res.status(200).send({
        message:
          "student feedback not deleted because student start feedback of subject teacher.",
        feedback: feedback ?? [],
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
      "-given_feedback"
    );
    res.status(200).send({
      message: "One feedback details.",
      feedback: feedback ?? [],
    });
  } catch (e) {
    console.log(e);
  }
};
exports.giveStudentFeedbackQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { ifid, staffId, questions, notifyId } = req.body;
    if (!sid || !ifid || !staffId || !notifyId) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const give_feedback = new StudentGiveFeedback({
      student: sid,
      subject_teacher: staffId,
      institute_feedback: ifid,
    });
    const notify = await StudentNotification.findById(notifyId);
    notify.student_feedback_status = "Submitted";

    await Promise.all([give_feedback.save(), notify.save()]);
    res.status(200).send({
      message: "student feedback given successfully",
    });
    const feedback = await StudentFeedback.findById(ifid);
    feedback.given_feedback?.push(give_feedback?._id);
    await feedback.save();

    give_feedback.feedback_name = feedback?.feedback_name;
    give_feedback.feedback_type = feedback?.feedback_type;
    give_feedback.institute = feedback?.institute ?? null;
    let avg_point = 0;
    for (let que of questions) {
      let point = 0;
      for (let opt of que?.options) {
        if (opt?.selected) {
          point = +opt?.option;
          break;
        }
      }
      give_feedback.questions?.push({
        ...que,
        point: point,
      });
      avg_point += point;
    }
    give_feedback.avg_point = (avg_point / questions?.length)?.toFixed(2);
    const staff = await Staff.findById(staffId);

    staff.student_give_feedback?.push(give_feedback?._id);
    staff.student_give_feedback_count += 1;
    staff.avg_student_give_feedback += +give_feedback.avg_point;

    await Promise.all([give_feedback.save(), staff.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.getSubjectStaffListQuery = async (req, res) => {
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
        select: "subjectTeacherName",
      })
      .select("subject ApproveStudent");
    var all_staff = [];
    for (let ct of cls) {
      for (let st of ct?.subject ?? []) {
        if (all_staff?.includes(`${st?.subjectTeacherName}`)) {
        } else {
          if (st?.subjectTeacherName)
            all_staff.push(`${st?.subjectTeacherName}`);
        }
      }
    }

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      all_staff = await Staff.find({
        $and: [{ _id: { $in: all_staff } }],
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
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "staffFirstName staffLastName staffMiddleName photoId staffProfilePhoto staffROLLNO student_give_feedback_count avg_student_give_feedback staff_emp_code"
        );
    } else {
      all_staff = await Staff.find({
        _id: {
          $in: all_staff,
        },
      })
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "staffFirstName staffLastName staffMiddleName photoId staffProfilePhoto staffROLLNO student_give_feedback_count avg_student_give_feedback staff_emp_code"
        );
    }

    res.status(201).send({
      message: "staff Feedback list",
      all_staff: all_staff ?? [],
    });
  } catch (e) {
    console.log(e);
  }
};

