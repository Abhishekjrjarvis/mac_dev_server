const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const Department = require("../../models/Department");
const Mentor = require("../../models/MentorMentee/mentor");
const Meeting = require("../../models/MentorMentee/meetings");
const Queries = require("../../models/MentorMentee/queries");
const Notification = require("../../models/notification");
const User = require("../../models/User");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const StudentNotification = require("../../models/Marks/StudentNotification");
const FeedQuestion = require("../../models/Feedbacks/FeedQuestion");
const { generate_date, custom_date_time } = require("../../helper/dayTimer");
const { nested_document_limit } = require("../../helper/databaseFunction");
const moment = require("moment");
const { handle_undefined } = require("../../Handler/customError");
const Class = require("../../models/Class");

exports.renderNewMentorQuery = async (req, res) => {
  try {
    const { did, sid } = req.params;
    if (!did && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: staff?.user });
    const mentor_query = new Mentor({});
    const notify = new Notification({});
    mentor_query.mentor_head = staff?._id;
    depart.mentor.push(mentor_query?._id);
    depart.mentor_count += 1;
    mentor_query.department = depart?._id;
    staff.mentorDepartment.push(mentor_query?._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = "Mentor";
    notify.notifyContent = `you got the designation of as Mentor`;
    notify.notifySender = depart?._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Mentor Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByDepartPhoto = depart?._id;
    await invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      depart?.dName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      depart.save(),
      user.save(),
      notify.save(),
      staff.save(),
      mentor_query.save(),
    ]);
    res.status(200).send({ message: "Explore new designation", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllMentorQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did }).select("mentor");

    const all_mentor = await Mentor.find({ _id: { $in: depart?.mentor } })
      .limit(limit)
      .skip(skip)
      .select("pending_query_count mentees_count total_feedback_count rating")
      .populate({
        path: "mentor_head",
        select:
          "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
      });

    if (all_mentor?.length > 0) {
      res.status(200).send({
        message: "Explore all mentors by your preference",
        access: true,
        all_mentor: all_mentor,
      });
    } else {
      res
        .status(200)
        .send({ message: "You lost in space", access: false, all_mentor: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneMentorQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const mentor = await Mentor.findById({ _id: mid })
      .select("mentees_count total_query_count pending_query_count rating")
      .populate({
        path: "mentor_head",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO user",
        populate: {
          path: "user",
          select: "userPhoneNumber userEmail",
        },
      });

    res
      .status(200)
      .send({ message: "Explore your details", access: true, mentor });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneMentorAllMenteesQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const mentor = await Mentor.findById({ _id: mid });

    if (search) {
      var all_mentees = await Student.find({
        $and: [
          {
            _id: { $in: mentor?.mentees },
          },
        ],
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
      }).select(
        "query_count total_query studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO"
      );
    } else {
      var all_mentees = await Student.find({ _id: { $in: mentor?.mentees } })
        .limit(limit)
        .skip(skip)
        .select(
          "query_count total_query studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO"
        );
    }

    if (all_mentees?.length > 0) {
      res.status(200).send({
        message: "Explore all Mentees by your preference",
        access: true,
        all_mentees: all_mentees,
      });
    } else {
      res
        .status(200)
        .send({ message: "You lost in space", access: false, all_mentees: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewMentorMenteeQuery = async (req, res) => {
  try {
    const { did, mid } = req.params;
    const { student_array } = req.body;
    if (!did && !student_array && !mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var depart = await Department.findById({ _id: did });
    var mentor_query = await Mentor.findById({ _id: mid }).populate({
      path: "mentor_head",
      select: "staffFirstName staffLastName",
    });
    depart.mentees_count += 1;
    for (var ref of student_array) {
      const student = await Student.findById({ _id: `${ref}` });
      const user = await User.findById({ _id: student?.user });
      student.mentor = mentor_query?._id;
      student.mentor_assign_query.push({
        classId: student?.studentClass,
        status: "Assigned",
      });
      const notify = new StudentNotification({});
      notify.notifyContent = `${mentor_query?.mentor_head?.staffFirstName} ${mentor_query?.mentor_head?.staffLastName} is assigned as your Mentor`;
      notify.notifySender = depart._id;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      notify.mentorId = mentor_query._id;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = depart._id;
      notify.notifyCategory = "Assigned Mentor";
      notify.redirectIndex = 29;
      mentor_query.mentees_count += 1;
      mentor_query.mentees.push(student?._id);
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "Assigned Mentor",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([student.save(), user.save(), notify.save()]);
    }
    await Promise.all([depart.save(), mentor_query.save()]);
    res.status(200).send({ message: "Congrats for new mentees", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDestroyMentorMenteeQuery = async (req, res) => {
  try {
    const { did, mid } = req.params;
    const { sid } = req.body;
    if (!did && !sid && !mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    const student = await Student.findById({ _id: sid });
    const mentor_query = await Mentor.findById({ _id: mid });
    if (depart.mentees_count > 0) {
      depart.mentees_count -= 1;
    }
    student.mentor = null;
    if (mentor_query.mentees_count > 0) {
      mentor_query.mentees_count -= 1;
    }
    mentor_query.mentees.pull(student?._id);
    if (student?.mentor_assign_query?.length > 0) {
      for (var ref of student?.mentor_assign_query) {
        if (
          `${ref?.classId}` === `${student?.studentClass}` &&
          ref?.status === "Assigned"
        ) {
          student.mentor_assign_query.pull(ref?._id);
        }
      }
    }
    await Promise.all([depart.save(), student.save(), mentor_query.save()]);
    res.status(200).send({ message: "Removal of mentees", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewMenteeQuery = async (req, res) => {
  try {
    const { mid, sid } = req.params;
    if (!mid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const student = await Student.findById({ _id: sid });
    const mentor = await Mentor.findById({ _id: mid }).populate({
      path: "mentor_head",
      select: "user",
    });
    const user = await User.findById({ _id: mentor?.mentor_head?.user });
    const new_query = new Queries({ ...req.body });
    const notify = new StudentNotification({});
    new_query.raised_on = new Date().toISOString();
    new_query.student = student?._id;
    mentor.queries.push(new_query?._id);
    mentor.total_query_count += 1;
    mentor.pending_query_count += 1;
    student.queries.push(new_query?._id);
    student.total_query += 1;
    new_query.mentor = mentor?._id;

    notify.notifyContent = `${student?.studentFirstName} ${
      student?.studentMiddleName ? student?.studentMiddleName : ""
    } ${student?.studentLastName} raised a query`;
    notify.notifySender = student._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Staff";
    notify.notifyPublisher = mentor.mentor_head?._id;
    notify.mentorId = mentor._id;
    user.activity_tab.push(notify._id);
    notify.notifyByStudentPhoto = student._id;
    notify.notifyCategory = "Raise Query";
    notify.redirectIndex = 30;

    await Promise.all([
      student.save(),
      mentor.save(),
      new_query.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(200).send({ message: "New Query Raised 😁", access: true });

    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      "Query Raised",
      user._id,
      user.deviceToken,
      "Staff",
      notify
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneQueryDetail = async (req, res) => {
  try {
    const { qid } = req.params;
    if (!qid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const query = await Queries.findById({ _id: qid })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto user",
        populate: {
          path: "user",
          select: "userPhoneNumber userEmail",
        },
      })
      .populate({
        path: "forward_to",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      })
      .populate({
        path: "mentor",
        select: "mentor_head",
        populate: {
          path: "mentor_head",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        },
      });

    res.status(200).send({ message: "Explore Query", access: true, query });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllStudentQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const student = await Student.findById({ _id: sid }).select("queries");

    const all_query = await Queries.find({
      _id: { $in: student?.queries },
    })
      .limit(limit)
      .skip(skip)
      .select("created_at query_status");

    if (all_query?.length > 0) {
      res.status(200).send({
        message: "Lot's of Query Asked",
        access: true,
        all_query: all_query,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Query Asked", access: false, all_query: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllMentorQueryByStatus = async (req, res) => {
  try {
    const { mid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { status, flow } = req.query;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (flow === "By_Mentor") {
      var mentor = await Mentor.findById({ _id: mid }).select("queries");

      var all_query = await Queries.find({
        $and: [{ _id: { $in: mentor?.queries } }, { query_status: status }],
      })
        .limit(limit)
        .skip(skip)
        .select("created_at query_status")
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
        });
    } else if (flow === "By_Department_Head") {
      var depart = await Department.findById({ _id: mid }).select("query");

      var all_query = await Queries.find({
        $and: [{ _id: { $in: depart?.query } }, { query_status: status }],
      })
        .limit(limit)
        .skip(skip)
        .select("created_at query_status")
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
        });
    } else {
      var all_query = [];
    }

    if (all_query?.length > 0) {
      res.status(200).send({
        message: "Lot's of Pending Query",
        access: true,
        all_query: all_query,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Pending Query", access: false, all_query: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneQueryRemark = async (req, res) => {
  try {
    const { qid } = req.params;
    const { flow } = req.query;
    const { remark, forward } = req.body;
    var valid_forward = await handle_undefined(forward);
    if (!qid && !flow)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (flow === "By_Mentor") {
      const one_query = await Queries.findById({
        _id: qid,
      });
      var valid_student = await Student.findById({
        _id: `${one_query?.student}`,
      });
      var valid_mentor = await Mentor.findById({
        _id: `${one_query?.mentor}`,
      }).populate({
        path: "mentor_head",
        select:
          "staffFirsName staffMiddleName staffLastName photoId staffProfilePhoto",
      });
      one_query.remark = remark;
      one_query.remark_by_mentor = true;
      one_query.query_status = "Solved";
      if (valid_forward) {
        const valid_staff = await Staff.findById({ _id: `${valid_forward}` });
        const valid_user = await User.findById({ _id: `${valid_staff?.user}` });
        var valid_student = await Student.findById({
          _id: `${one_query?.student}`,
        });
        const notify = new StudentNotification({});
        notify.notifyContent = `Following query of ${
          valid_student?.studentFirstName
        } ${valid_student?.studentMiddleName ?? ""} ${
          valid_student?.studentLastName
        }, is forwarded to you for further directions and solution by ${
          valid_mentor?.mentor_head?.staffFirstName
        } ${valid_mentor?.mentor_head?.staffMiddleName ?? ""} ${
          valid_mentor?.mentor_head?.staffLastName
        }.
        Update your remarks after the query is being solved.`;
        notify.notifySender = valid_mentor?._id;
        notify.queryId = one_query?._id;
        notify.notifyReceiever = valid_user?._id;
        notify.notifyType = "Student";
        notify.notifyPublisher = valid_student?._id;
        valid_user.activity_tab.push(notify._id);
        notify.notifyByStudentPhoto = valid_student?._id;
        notify.notifyCategory = "Query Forwarding";
        notify.redirectIndex = 41;
        invokeMemberTabNotification(
          "Student Activity",
          notify,
          "Query Forwarding",
          valid_user._id,
          valid_user.deviceToken,
          "Student",
          notify
        );
        one_query.forward_to = valid_staff?._id;
        await Promise.all([notify.save(), valid_user.save()]);
      }
      await one_query.save();
      res
        .status(200)
        .send({ message: "Your query was resolved by Mentor", access: true });
    } else if (flow === "By_Department_Head") {
      const one_query = await Queries.findById({
        _id: qid,
      });
      var valid_student = await Student.findById({
        _id: `${one_query?.student}`,
      });
      var valid_mentor = await Mentor.findById({
        _id: `${one_query?.mentor}`,
      }).populate({
        path: "mentor_head",
        select:
          "staffFirsName staffMiddleName staffLastName photoId staffProfilePhoto",
      });
      one_query.remark_by_depart = remark;
      one_query.remark_by_department = true;
      one_query.query_status = "Solved";
      one_query.query_report_by = "Query Solved";
      if (valid_forward) {
        const valid_staff = await Staff.findById({ _id: `${valid_forward}` });
        const valid_user = await User.findById({ _id: `${valid_staff?.user}` });
        var valid_student = await Student.findById({
          _id: `${one_query?.student}`,
        });
        const notify = new StudentNotification({});
        notify.notifyContent = `Following query of ${
          valid_student?.studentFirstName
        } ${valid_student?.studentMiddleName ?? ""} ${
          valid_student?.studentLastName
        }, is forwarded to you for further directions and solution by ${
          valid_mentor?.mentor_head?.staffFirstName
        } ${valid_mentor?.mentor_head?.staffMiddleName ?? ""} ${
          valid_mentor?.mentor_head?.staffLastName
        }.
        Update your remarks after the query is being solved.`;
        notify.notifySender = valid_mentor?._id;
        notify.queryId = one_query?._id;
        notify.notifyReceiever = valid_user?._id;
        notify.notifyType = "Student";
        notify.notifyPublisher = valid_student?._id;
        valid_user.activity_tab.push(notify._id);
        notify.notifyByStudentPhoto = valid_student?._id;
        notify.notifyCategory = "Query Forwarding";
        notify.redirectIndex = 41;
        invokeMemberTabNotification(
          "Student Activity",
          notify,
          "Query Forwarding",
          valid_user._id,
          valid_user.deviceToken,
          "Student",
          notify
        );
        one_query.forward_to = valid_staff?._id;
        await Promise.all([notify.save(), valid_user.save()]);
      }
      await one_query.save();
      res.status(200).send({
        message: "Your query was resolved by Department Head",
        access: true,
      });
    } else {
      res
        .status(200)
        .send({ message: "I think you are lying...", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneQueryReport = async (req, res) => {
  try {
    const { qid } = req.params;
    if (!qid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_query = await Queries.findById({
      _id: qid,
    });

    const mentor = await Mentor.findById({ _id: `${one_query?.mentor}` });
    const depart = await Department.findById({
      _id: `${mentor?.department}`,
    }).populate({
      path: "dHead",
      select: "user",
    });
    const user = await User.findById({ _id: `${depart?.dHead?.user}` });
    const student = await Student.findById({ _id: `${one_query?.student}` });
    const notify = new StudentNotification({});
    one_query.report_by = "Reported";
    one_query.query_status = "UnSolved";
    one_query.report_on = new Date().toISOString();
    depart.query.push(one_query?._id);
    depart.query_count += 1;
    one_query.department = depart?._id;
    notify.notifyContent = `${student?.studentFirstName} ${
      student?.studentMiddleName ? student?.studentMiddleName : ""
    } ${
      student?.studentLastName
    } query was not resolved by mentor. Take a look`;
    notify.notifySender = student?._id;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Staff";
    notify.notifyPublisher = depart?.dHead?._id;
    notify.mentorId = mentor._id;
    user.activity_tab.push(notify._id);
    notify.notifyByStudentPhoto = student?._id;
    notify.notifyCategory = "Reported Query";
    notify.redirectIndex = 31;
    await Promise.all([
      one_query.save(),
      depart.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(200).send({
      message:
        "Your query was send to department head wait for further Resolving",
      access: true,
    });
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      "Report Query",
      user._id,
      user.deviceToken,
      "Staff",
      notify
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewQuestionQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { answer_array } = req.body;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: true,
      });

    const depart = await Department.findById({ _id: did });
    const question = new FeedQuestion({ ...req.body });
    for (var ans of answer_array) {
      question.feed_answer.push({
        content: ans?.content,
      });
    }
    depart.feed_question.push(question?._id);
    depart.feed_question_count += 1;
    question.department = depart?._id;
    await Promise.all([question.save(), depart.save()]);
    res
      .status(200)
      .send({ message: "Explore New Feed Question", access: true });
    const all_mentor = await Mentor.find({
      _id: { $in: depart?.mentor },
    }).select("feed_question feed_question_count");

    for (var all of all_mentor) {
      all.feed_question.push(question?._id);
      all.feed_question_count += 1;
      await all.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllQuestionQuery = async (req, res) => {
  try {
    const { dmid } = req.params;
    const { flow } = req.query;
    if (!dmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (flow === "By_Mentor") {
      const mentor = await Mentor.findById({ _id: dmid }).select(
        "feed_question"
      );

      var all_question = await FeedQuestion.find({
        _id: { $in: mentor?.feed_question },
      });
    } else if (flow === "By_Department_Head") {
      const depart = await Department.findById({ _id: dmid }).select(
        "feed_question"
      );

      var all_question = await FeedQuestion.find({
        _id: { $in: depart?.feed_question },
      });
    } else {
      var all_question = [];
    }
    if (all_question?.length > 0) {
      res.status(200).send({
        message: "Lot's of Question Available",
        access: true,
        all_question: all_question,
      });
    } else {
      res.status(200).send({
        message: "No Question Available",
        access: false,
        all_question: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewFeedbackQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { date } = req.body;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: true,
      });
    const date_query = generate_date(date);
    const next_query = custom_date_time(90);
    const next_date_query = generate_date(next_query);
    const depart = await Department.findById({ _id: did });
    depart.take_feedback.push({
      create_on: date_query,
      total_feed: depart?.studentCount,
    });
    depart.take_feedback_count += 1;
    depart.next_feed_back = next_date_query;
    await depart.save();
    res
      .status(200)
      .send({ message: "Explore New FeedBack Upcoming Set", access: true });

    const all_student = await Student.find({
      mentor: { $in: depart?.mentor },
    }).select("user mentor");
    for (var ref of all_student) {
      const notify = new StudentNotification({});
      const user = await User.findById({ _id: `${ref?.user}` });
      notify.notifyContent = `From ${moment(date_query).format(
        "LL"
      )} to ${moment(next_date_query).format("LL")}`;
      notify.notifySender = depart?._id;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = ref?._id;
      notify.mentorId = ref?.mentor;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = depart?._id;
      notify.notifyCategory = "Give FeedBack";
      notify.redirectIndex = 32;
      await Promise.all([user.save(), notify.save()]);
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "Give FeedBack",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllFeedbackQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const depart = await Department.findById({ _id: did }).select(
      "take_feedback"
    );

    var all_feedback_set = await nested_document_limit(
      page,
      limit,
      depart?.take_feedback
    );
    if (all_feedback_set?.length > 0) {
      res.status(200).send({
        message: "Lot's of FeedBack Available",
        access: true,
        all_feedback_set: all_feedback_set,
      });
    } else {
      res.status(200).send({
        message: "No FeedBack Available",
        access: false,
        all_feedback_set: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneFeedbackDetailQuery = async (req, res) => {
  try {
    const { did, mid, fid } = req.params;
    if (!did && !mid && !fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const depart = await Department.findById({ _id: did }).select(
      "take_feedback"
    );
    var valid_feed;
    var valid_mentor;
    depart?.take_feedback?.filter((ref) => {
      if (`${ref?._id}` === `${fid}`) {
        valid_feed = { ...ref };
        return valid_feed;
      } else {
        valid_feed = "";
        return valid_feed;
      }
    });
    if (valid_feed) {
      for (var val of valid_feed?.mentors) {
        if (`${val}` === `${mid}`) {
          valid_mentor = val;
          return valid_mentor;
        } else {
          valid_mentor = "";
          return valid_mentor;
        }
      }
    }
    if (valid_mentor) {
      const mentor = await Mentor.findById({ _id: `${valid_mentor}` })
        .select("total_feedback_count rating mentees_count")
        .populate({
          path: "mentor_head",
          select:
            "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
        })
        .populate({
          path: "feed_question",
        });
      res
        .status(200)
        .send({ message: "Explore All Ratings", access: true, mentor: mentor });
    } else {
      res.status(200).send({ message: "You Lost in Space", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDepartAllClassQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_depart = await Department.findById({ _id: did }).select("class");

    var all_classes = await Class.find({ _id: { $in: one_depart?.class } })
      .limit(limit)
      .skip(skip)
      .select("className classTitle boyCount girlCount studentCount")
      .populate({
        path: "batch",
        select: "batchName batchStatus",
      });

    if (all_classes?.length > 0) {
      res.status(200).send({
        message: "Explore All Classes Query",
        access: true,
        all_classes: all_classes,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Classes Query", access: true, all_classes: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllFilteredStudentQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { search } = req.query;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var assigned_mentee = [];
    var one_class = await Class.findById({ _id: cid }).select("ApproveStudent");
    if (search) {
      var all_student = await Student.find({
        $and: [{ _id: { $in: one_class?.ApproveStudent } }],
        $or: [
          {
            studentFirstName: { $regex: search, $options: "i" },
          },
          {
            studentMiddleName: { $regex: search, $options: "i" },
          },
          {
            studentLastName: { $regex: search, $options: "i" },
          },
          {
            studentGRNO: { $regex: search, $options: "i" },
          },
        ],
      })
        .select(
          "mentor_assign_query studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO studentROLLNO"
        )
        .populate({
          path: "studentClass",
          select: "className classTitle classStatus",
        });
    } else {
      var all_student = await Student.find({
        _id: { $in: one_class?.ApproveStudent },
      })
        .select(
          "mentor_assign_query studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO studentROLLNO"
        )
        .populate({
          path: "studentClass",
          select: "className classTitle classStatus",
        });
    }
    for (var ref of all_student) {
      if (ref?.mentor_assign_query?.length <= 0) {
        assigned_mentee.push(ref);
      } else {
        for (var ele of ref?.mentor_assign_query) {
          if (
            `${ele?.classId}` === `${one_class?._id}` &&
            ele?.status === "Not Assigned"
          ) {
            assigned_mentee.push(ref);
          }
        }
      }
    }

    if (assigned_mentee?.length > 0) {
      res.status(200).send({
        message: "Explore All Not Assigned Mentee Array",
        access: true,
        assigned_mentee: assigned_mentee,
      });
    } else {
      res.status(200).send({
        message: "No Not Assigned Mentee Array",
        access: true,
        assigned_mentee: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewMeetingQuery = async (req, res) => {
  try {
    const { mid, p_array, a_array } = req.body;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var valid_mentor = await Mentor.findById({ _id: mid });
    var new_meet = new Meeting({ ...req.body });
    new_meet.mentor = valid_mentor?._id;
    new_meet.department = valid_mentor?.department;
    valid_mentor.meetings.push(new_meet?._id);
    valid_mentor.meetings_count += 1;
    if (p_array?.length > 0) {
      new_meet.present_mentees.push(...p_array);
      new_meet.mentees_present_count = p_array?.length;
    }
    if (a_array?.length > 0) {
      new_meet.absent_mentees.push(...a_array);
      new_meet.mentees_absent_count = a_array?.length;
    }

    await Promise.all([new_meet.save(), valid_mentor.save()]);
    res
      .status(200)
      .send({ message: "Explore New Meetings Query", access: true });

    if (new_meet?.meeting_alert) {
      var all_mentees = await Student.find({
        _id: { $in: valid_mentor?.mentees },
      });
      for (var ref of all_mentees) {
        var user = await User.findById({ _id: `${ref?.user}` });
        var notify = new StudentNotification({});
        notify.notifyContent = `Today Meetings Agenda - ${new_meet?.agenda}. click here to read more...`;
        notify.notifySender = valid_mentor?._id;
        notify.notifyReceiever = user?._id;
        notify.notifyType = "Student";
        notify.notifyPublisher = ref?._id;
        user.activity_tab.push(notify?._id);
        notify.notifyByDepartPhoto = valid_mentor?.department;
        notify.notifyCategory = "Meeting Alert";
        notify.redirectIndex = 57;
        await Promise.all([user.save(), notify.save()]);
        invokeMemberTabNotification(
          "Meeting Alert",
          notify.notifyContent,
          "New Agenda",
          user._id,
          user.deviceToken
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllMeetingQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const valid_mentor = await Mentor.findById({ _id: mid }).select("meetings");

    if (search) {
      var all_meet = await Meeting.find({
        $and: [{ _id: { $in: valid_mentor?.meetings } }],
        $or: [
          {
            agenda: { $regex: `${search}`, $options: "i" },
          },
        ],
      }).select(
        "agenda summary discussion created_at mentees_present_count mentees_absent_count meeting_alert department mentor"
      );
    } else {
      var all_meet = await Meeting.find({
        _id: { $in: valid_mentor?.meetings },
      })
        .sort({ created_at: "-1" })
        .limit(limit)
        .skip(skip)
        .select(
          "agenda summary discussion created_at mentees_present_count mentees_absent_count meeting_alert department mentor"
        );
    }

    if (all_meet?.length > 0) {
      res.status(200).send({
        message: "Explore All Meet Query",
        access: true,
        all_meet: all_meet,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Meet Query", access: true, all_meet: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneMeetDetail = async (req, res) => {
  try {
    const { meid } = req.params;
    if (!meid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var all_meet = await Meeting.findById({ _id: meid })
      .populate({
        path: "present_mentees",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO",
      })
      .populate({
        path: "absent_mentees",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO",
      });
    res.status(200).send({
      message: "Explore One Meet Query",
      access: true,
      all_meet: all_meet,
    });
  } catch (e) {
    console.log(e);
  }
};

// Rating By Student IS Pending & Display Rating Query

// exports.renderOneStudentGiveFeedbackQuery = async (req, res) => {
//   try {
//     const { sid, mid } = req.params;
//     const { feed_array } = req.body;
//     if (!sid && !mid)
//       return res.status(200).send({
//         message: "Their is a bug need to fixed immediately",
//         access: false,
//       });

//     const student = await Student.findById({ _id: sid });
//     const mentor = await Mentor.findById({ _id: mid });
//     const depart = await Department.findById({ _id: `${mentor?.department}` });
//     student.feed_back_count += 1;
//     mentor.total_feedback_count += 1;
//     depart.take_feedback_count += 1;
//     mentor.rating += 1;
//     await Promise.all([student.save(), mentor.save(), depart.save()]);
//     res.status(200).send({ message: "Thanks for Feed Back ✔", access: true });
//     for (var i = 0; i < feed_array?.length?.length; i++) {
//       var rating_query = await FeedQuestion.findById({
//         _id: `${feed_array[i]?.questionId}`,
//       });
//       var content_array = { ...feed_array[i]?.answer_array }
//       for (var j = 0; j < rating_query?.feed_answer?.length; j++) {
//         if(rating_query?.feed_answer[j]?._id === content_array[`${j}`])
//       }
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };

// const func = () => {
//   const data = [
//     {
//       questionId: "1",
//       content_array: [
//         {
//           answerId: "1.1",
//           rating: "3",
//         },
//         {
//           answerId: "1.2",
//           rating: "4",
//         },
//       ],
//     },
//     {
//       questionId: "2",
//       content_array: [
//         {
//           answerId: "2.1",
//           rating: "3",
//         },
//         {
//           answerId: "2.2",
//           rating: "4",
//         },
//       ],
//     },
//   ];
//   var obj = { ...data };
//   console.log(obj);
// };

// func();
