const Class = require("../../models/Class");
const InstituteAdmin = require("../../models/InstituteAdmin");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const Subject = require("../../models/Subject");
const Student = require("../../models/Student");
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
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const student = await Student.findOne({});
    const classes = await Class.findOne({ _id: `${student?.studentClass}` })
      .select("subject classTeacher")
      .populate({
        path: "classTeacher",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      });
    const all_subjects = await Subject.find({ _id: { $in: classes?.subject } })
      .select("subjectTeacherName subjectName")
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
