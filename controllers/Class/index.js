const Class = require("../../models/Class");
const InstituteAdmin = require("../../models/InstituteAdmin");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const Subject = require("../../models/Subject");
const Student = require("../../models/Student");
const { handle_undefined } = require("../../Handler/customError");
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
      .select("subjectTeacherName subjectName subjectTitle")
      .populate({
        path: "subjectTeacherName",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      });

    if (all_subjects?.length > 0 || classes) {
      res.status(200).send({
        message: "All Active Mentors ClassTeacher / Subject Teacher",
        access: true,
        classes: classes?.classTeacher,
        all_subjects: all_subjects,
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
      ref.class_selected_batch = one_batch?._id;
      await ref.save();
    }
    await one_batch.save();
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

    const valid_batch = await Batch.findById({ _id: bid }).select(
      "class_student_query"
    );

    if (search) {
      const all_students = await Student.find({
        $and: [{ _id: { $in: valid_batch?.class_student_query } }],
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
      })
        .select(
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO studentROLLNO"
        )
        .populate({
          path: "class_selected_batch",
          select: "batchName batchStatus",
        });
    } else {
      const all_students = await Student.find({
        _id: { $in: valid_batch?.class_student_query },
      })
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO studentROLLNO"
        )
        .populate({
          path: "class_selected_batch",
          select: "batchName batchStatus",
        });
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
