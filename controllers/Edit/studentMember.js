// const InstituteAdmin = require("../../models/InstituteAdmin");
// const Subject = require("../../models/Subject");
// const SubjectMaster = require("../../models/SubjectMaster");
// const ClassMaster = require("../../models/ClassMaster");
// const InstituteAdmin = require("../../models/InstituteAdmin");
// const Department = require("../../models/Department");
const Batch = require("../../models/Batch");
const Class = require("../../models/Class");
const Student = require("../../models/Student");
const StudentPreviousData = require("../../models/StudentPreviousData");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const { deleteFile, uploadFile } = require("../../S3Configuration");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

exports.photoEditByStudent = async (req, res) => {
  try {
    if (!req.params.sid || !req.file)
      throw "Please send student id to perform task or upload photo";
    const { sample_pic } = req.body;
    const student = await Student.findById(req.params.sid);
    if (!sample_pic) {
      // await deleteFile(student.studentProfilePhoto);
      const results = await uploadFile(req.file);
      student.studentProfilePhoto = results.Key;
      await student.save();
      res.status(200).send({
        message: "Photo edited successfully👍",
      });
      await unlinkFile(file.path);
    } else {
      student.studentProfilePhoto = sample_pic;
      await student.save();
      res.status(200).send({
        message: "Photo edited successfully👍",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.formEditByClassTeacher = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send student id to perform task";
    const one_student = await Student.findById(req.params.sid);
    for (let file of req.body?.fileArray) {
      if (file.name === "addharFrontCard")
        one_student.studentAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        one_student.studentAadharBackCard = file.key;
      else if (file.name === "bankPassbook")
        one_student.studentBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        one_student.studentCasteCertificatePhoto = file.key;
      else {
        const filterDocument = one_student.studentDocuments?.filter(
          (val) => val.documentName !== file.name
        );
        one_student.studentDocuments = [
          ...filterDocument,
          {
            documentName: file.name,
            documentKey: file.key,
            documentType: file.type,
          },
        ];
      }
    }
    for (let studentObj in req.body?.student) {
      one_student[`${studentObj}`] = req.body?.student[studentObj];
    }
    await one_student.save();
    res.status(200).send({
      message: "Student form edited successfully👍",
      // one_student
    });
    const classes = await Class.findById({ _id: one_student?.studentClass });
    const batch = await Batch.findById({ _id: one_student?.batches });
    if (one_student.studentGender === "Male") {
      classes.boyCount += 1;
      batch.student_category.boyCount += 1;
    } else if (one_student.studentGender === "Female") {
      classes.girlCount += 1;
      batch.student_category.girlCount += 1;
    } else {
      classes.otherCount += 1;
      batch.student_category.otherCount += 1;
    }
    if (one_student.studentCastCategory === "General") {
      batch.student_category.generalCount += 1;
    } else if (one_student.studentCastCategory === "OBC") {
      batch.student_category.obcCount += 1;
    } else if (one_student.studentCastCategory === "SC") {
      batch.student_category.scCount += 1;
    } else if (one_student.studentCastCategory === "ST") {
      batch.student_category.stCount += 1;
    } else if (one_student.studentCastCategory === "NT-A") {
      batch.student_category.ntaCount += 1;
    } else if (one_student.studentCastCategory === "NT-B") {
      batch.student_category.ntbCount += 1;
    } else if (one_student.studentCastCategory === "NT-C") {
      batch.student_category.ntcCount += 1;
    } else if (one_student.studentCastCategory === "NT-D") {
      batch.student_category.ntdCount += 1;
    } else if (one_student.studentCastCategory === "VJ") {
      batch.student_category.vjCount += 1;
    } else {
    }
    await Promise.all([classes.save(), batch.save()]);
  } catch (e) {
    console.log(e);
  }
};
// Batch Removal Is still pending
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
    if (student?.studentGender === "Male") {
      classes.boyCount -= 1;
      classes.strength -= 1;
    } else if (student?.studentGender === "Female") {
      classes.girlCount -= 1;
      classes.strength -= 1;
    } else {
      classes.otherCount -= 1;
      classes.strength -= 1;
    }
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
      totalAssignment: student?.totalAssignment,
      submittedAssignment: student?.submittedAssignment,
      incompletedAssignment: student?.incompletedAssignment,
      completedAssignment: student?.completedAssignment,
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
      studentExemptFee: student?.studentExemptFee,
      exemptFeeList: student?.exemptFeeList,
      studentRemainingFeeCount: student?.studentRemainingFeeCount,
      studentPaidFeeCount: student?.studentPaidFeeCount,
      library: student?.library,
      studentAdmissionDate: student?.studentAdmissionDate,
      borrow: student?.borrow,
      deposite: student?.deposite,
      sportEventCount: student?.sportEventCount,
      admissionRemainFeeCount: student?.admissionRemainFeeCount,
      admissionPaymentStatus: student?.admissionPaymentStatus,
      refundAdmission: student?.refundAdmission,
      remainingFeeList: student?.remainingFeeList,
      certificateBonaFideCopy: student?.certificateBonaFideCopy,
      certificateLeavingCopy: student?.certificateLeavingCopy,
      dailyUpdate: student?.dailyUpdate,
      student_biometric_id: student?.student_biometric_id,
      election_candidate: student?.election_candidate,
      participate_event: student?.participate_event,
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
    student.totalAssignment = 0;
    student.submittedAssignment = 0;
    student.incompletedAssignment = 0;
    student.completedAssignment = 0;
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
    student.borrow = [];
    student.deposite = [];
    student.sportEventCount = 0;
    student.admissionRemainFeeCount = 0;
    student.admissionPaymentStatus = [];
    student.refundAdmission = [];
    student.remainingFeeList = [];
    student.certificateBonaFideCopy = {
      trueCopy: false,
      secondCopy: false,
      thirdCopy: false,
    };
    student.certificateLeavingCopy = {
      trueCopy: false,
      secondCopy: false,
      thirdCopy: false,
    };
    student.dailyUpdate = [];
    student.student_biometric_id = "";
    student.election_candidate = [];
    student.participate_event = [];
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
    // console.log(e);
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
      // const preEncrypt = await encryptionPayload(previousData);
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
    // console.log(e);
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
    // Add Another Encryption
    res.status(200).send({
      message: "Student previous year detail all list 👍",
      finalReport: previousData?.finalReport,
      studentROLLNO: previousData?.studentROLLNO,
    });
  } catch (e) {
    // console.log(e);
    res.status(424).send({
      message: e,
    });
  }
};
