const Class = require("../../models/Class");
const InstituteAdmin = require("../../models/InstituteAdmin");
// const Checklist = require("../../models/Checklist");

exports.getOneInstitute = async (req, res) => {
  const classDetail = await InstituteAdmin.findById(req.params.id);
  res.status(200).send({
    message: "code is refreshed",
    classDetail: classDetail.classCodeList,
  });
};

exports.getOneClass = async (req, res) => {
  const classDetail = await Class.findById(req.params.cid);
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
      var r_class_code = `${c_1}${c_2}${c_3}${c_4}`;
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

    if (req.body?.graceMarks || req.body?.graceMarks === false)
      classes.finalReportsSettings.graceMarks = req.body?.graceMarks;
    else
      classes.finalReportsSettings.graceMarks =
        classes.finalReportsSettings.graceMarks;
    if (req.body?.gradeMarks || req.body?.gradeMarks === false)
      classes.finalReportsSettings.gradeMarks = req.body?.gradeMarks;
    else
      classes.finalReportsSettings.gradeMarks =
        classes.finalReportsSettings.gradeMarks;
    classes.finalReportsSettings.aggregatePassingPercentage =
      req.body?.aggregatePassingPercentage;
    await classes.save();

    res.status(200).send({
      message: "report settings edited",
    });
  } catch {}
};

// exports.createClassChecklist = async (req, res) => {
//   try {
//     const checklist = new Checklist(req.body);
//     res.status(201).send({ message: "checklist is created", checklist });
//   } catch {}
// };
