// const InstituteAdmin = require("../../models/InstituteAdmin");
// const Subject = require("../../models/Subject");
// const SubjectMaster = require("../../models/SubjectMaster");
// const ClassMaster = require("../../models/ClassMaster");
// const InstituteAdmin = require("../../models/InstituteAdmin");
// const Department = require("../../models/Department");
// const Batch = require("../../models/Batch");
const Class = require("../../models/Class");
const Student = require("../../models/Student");
const StudentPreviousData = require("../../models/StudentPreviousData");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const { deleteFile, uploadFile } = require("../../S3Configuration");

exports.photoEditByStudent = async (req, res) => {
  try {
    if (!req.params.sid || !req.file)
      throw "Please send student id to perform task or upload photo";
    const student = await Student.findById(req.params.sid);
    await deleteFile(student.studentProfilePhoto);
    const results = await uploadFile(req.file);
    student.studentProfilePhoto = results.Key;
    await student.save();
    res.status(200).send({
      message: "Photo edited successfully👍",
    });
    await unlinkFile(file.path);
  } catch (e) {
    console.log(e);
  }
};

exports.formEditByClassTeacher = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send student id to perform task";
    await Student.findByIdAndUpdate(req.params.sid, req.body);
    res.status(200).send({
      message: "Student form edited successfully👍",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.removeByClassTeacher = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send student id to perform task";
    const student = await Student.findById(req.params.sid);
    const studentCurrentRollNumber = +student.studentROLLNO - 1;
    const classes = await Class.findById(student.studentClass)
      .populate({
        path: "batch",
      })
      .populate({
        path: "department",
      });
    classes?.ApproveStudent?.pull(student._id);
    classes.studentCount -= 1;
    classes.batch?.ApproveStudent?.pull(student._id);
    classes.department?.ApproveStudent?.pull(student._id);
    classes.department.studentCount -= 1;
    await Promise.all([
      classes.batch.save(),
      classes.department.save(),
      classes.save(),
    ]);

    const previousData = new StudentPreviousData({
      studentCode: student.studentCode,
      class: student?.studentClass,
      student: student?._id,
      batch: student?.batches,
      studentROLLNO: student.studentROLLNO,
      behaviour: student?.studentBehaviour,
      department: student?.department,
      institute: student?.institute,
      notification: student?.notification,
      subjectMarks: student?.subjectMarks,
      exams: student?.exams,
      finalReportStatus: student?.finalReportStatus,
      finalReport: student?.finalReport,
      testSet: student?.testSet,
      assignments: student?.assignments,
      totalAssigment: student?.totalAssigment,
      submittedAssigment: student?.submittedAssigment,
      studentFee: student?.studentFee,
      attendDate: student?.attendDate,
      checklist: student?.checklist,
      onlineFeeList: student?.onlineFeeList,
      onlineCheckList: student?.onlineCheckList,
      offlineFeeList: student?.offlineFeeList,
      offlineCheckList: student?.offlineCheckList,
      complaints: student?.complaints,
      studentChecklist: student?.studentChecklist,
      leave: student?.leave,
      transfer: student?.transfer,
      paymentList: student?.paymentList,
      applyList: student?.applyList,
      studentExemptFee: student?.studentExemptFee,
      exemptFeeList: student?.exemptFeeList,
      studentRemainingFeeCount: student?.studentRemainingFeeCount,
      studentPaidFeeCount: student?.studentPaidFeeCount,
      library: student?.library,
      studentAdmissionDate: student?.studentAdmissionDate,
    });
    student?.previousYearData?.push(previousData._id);
    student.studentClass = null;
    student.studentCode = "";
    student.department = null;
    student.batches = null;
    //here how to give the null in objectID
    student.studentBehaviour = null;
    student.studentROLLNO = "";
    student.notification = [];
    student.subjectMarks = [];
    student.exams = [];
    student.finalReportStatus = "No";
    student.finalReport = [];
    student.testSet = [];
    student.assignments = [];
    student.totalAssigment = 0;
    student.submittedAssigment = 0;
    student.studentFee = [];
    student.attendDate = [];
    student.checklist = [];
    student.onlineFeeList = [];
    student.onlineCheckList = [];
    student.offlineFeeList = [];
    student.offlineCheckList = [];
    student.complaints = [];
    student.studentChecklist = [];
    student.leave = [];
    student.transfer = [];
    student.paymentList = [];
    student.applyList = [];
    student.studentExemptFee = [];
    student.exemptFeeList = [];
    student.studentRemainingFeeCount = 0;
    student.studentPaidFeeCount = 0;
    student.library = null;
    student.studentAdmissionDate = "";
    await Promise.all([previousData.save(), student.save()]);
    // console.log("hi", studentCurrentRollNumber);
    // console.log("hi", classes?.ApproveStudent?.slice(studentCurrentRollNumber));

    classes?.ApproveStudent?.slice(studentCurrentRollNumber).forEach(
      async (stu) => {
        const changeStudent = await Student.findById(stu);
        changeStudent.studentROLLNO = +changeStudent.studentROLLNO - 1;
        // console.log(changeStudent.studentROLLNO);
        await changeStudent.save();
      }
    );
    res.status(200).send({
      message: "student removed form class successfully👍",
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.getAllPreviousYear = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send student id to perform task";
    const student = await Student.findById(req.params.sid)
      .select("previousYearData")
      .lean()
      .exec();
    if (student?.previousYearData?.length > 0) {
      const previousData = await StudentPreviousData.find({
        _id: { $in: student?.previousYearData },
      })
        .populate({
          path: "class",
          populate: {
            path: "batch",
            select: "batchName batchStatus",
          },
          select: "className classTitle classStatus batch",
        })
        .populate({
          path: "batch",
          select: "batchName batchStatus",
        })
        .sort("-createdAt")
        .select("class batch")
        .lean()
        .exec();
      res.status(200).send({
        message: "Student previous year detail all list 👍",
        previousData,
      });
    } else {
      res.status(200).send({
        message: "Student previous year detail all list 👍",
        previousData: [],
      });
    }
  } catch (e) {
    console.log(e);
    res.status(424).send({
      message: e,
    });
  }
};

exports.previousYearReportCard = async (req, res) => {
  try {
    if (!req.params.pid) throw "Please send previous year id to perform task";
    const previousData = await StudentPreviousData.findById(req.params.pid)
      .populate({
        path: "finalReport",
        populate: {
          path: "student",
          select: "studentFirstName studentMiddleName studentLastName",
        },
        // select: "className classTitle",
      })
      .select("finalReport studentROLLNO")
      .lean()
      .exec();
    res.status(200).send({
      message: "Student previous year detail all list 👍",
      finalReport: previousData?.finalReport,
      studentROLLNO: previousData?.studentROLLNO,
    });
  } catch (e) {
    console.log(e);
    res.status(424).send({
      message: e,
    });
  }
};
