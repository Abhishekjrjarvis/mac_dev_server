const InstituteAdmin = require("../../models/InstituteAdmin");
const SubjectMaster = require("../../models/SubjectMaster");
// const ClassMaster = require("../../models/ClassMaster");
// const InstituteAdmin = require("../../models/InstituteAdmin");
const Department = require("../../models/Department");
const Batch = require("../../models/Batch");
const Class = require("../../models/Class");
const Student = require("../../models/Student");
const StudentPreviousData = require("../../models/StudentPreviousData");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const { deleteFile, uploadFile } = require("../../S3Configuration");
const { chart_category_student } = require("../../Custom/studentChart");
const FinalReport = require("../../models/Marks/FinalReport");
const StandardMarkList = require("../../models/Marks/StandardMarkList");
const Subject = require("../../models/Subject");
const FeeStructure = require("../../models/Finance/FeesStructure");
const RemainingList = require("../../models/Admission/RemainingList");
const { handle_undefined } = require("../../Handler/customError");
const User = require("../../models/User");
const {
  grade_calculate,
  grade_point,
  grade_point_with_credit,
  spi_calculate,
  grade_symbol,
} = require("../../Utilities/custom_grade");
const {
  send_email_authentication_login_query,
  send_phone_login_query,
} = require("../../helper/functions");
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
      await unlinkFile(req.file.path);
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
    const { phone, email } = req.body;
    var valid_phone = await handle_undefined(phone);
    var valid_email = await handle_undefined(email);
    const old_data = {
      gender: "",
      caste: "",
    };
    const new_data = {
      gender: "",
      caste: "",
    };
    const one_student = await Student.findById(req.params.sid);
    old_data.gender = one_student?.studentGender;
    old_data.caste = one_student?.studentCastCategory;
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
      one_student,
    });
    new_data.gender = one_student?.studentGender;
    new_data.caste = one_student?.studentCastCategory;
    await chart_category_student(
      one_student?.batches,
      "Edit_Student",
      old_data,
      new_data,
      one_student?.studentClass
    );
    var one_user = await User.findById({ _id: `${one_student?.user}` });
    if (valid_phone) {
      one_user.userPhoneNumber = valid_phone
        ? valid_phone
        : one_user?.userPhoneNumber;
      await one_user.save();
    } else if (valid_email) {
      one_user.userEmail = valid_email ? valid_email : one_user?.userEmail;
      await one_user.save();
    } else {
    }
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
    // student.admissionRemainFeeCount = 0;
    // student.admissionPaymentStatus = [];
    // student.refundAdmission = [];
    // student.remainingFeeList = [];
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
          path: "studentClass",
          populate: {
            path: "batch",
            select: "batchName batchStatus",
          },
          select: "className classTitle classStatus batch",
        })
        .populate({
          path: "batches",
          select: "batchName batchStatus",
        })
        .sort("-createdAt")
        .select("studentClass batches")
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
      // .populate({
      //   path: "finalReport",
      //   populate: {
      //     path: "student",
      //     select: "studentFirstName studentMiddleName studentLastName",
      //   },
      //   // select: "className classTitle",
      // })
      .select("finalReport studentROLLNO");
    //   .lean()
    //   .exec();
    const finalReport = await FinalReport.findById(
      // req.params.pid
      previousData.finalReport?.[0]
    )
      .populate({
        path: "student",
        select: "studentFirstName studentMiddleName studentLastName",
      })
      .populate({
        path: "classId",
        populate: {
          path: "subject",
          populate: {
            path: "subject_mark_list",
            select: "marks_list subjectMaster",
          },
          select:
            "subject_mark_list subjectMasterName setting.subjectPassingMarks",
        },
        select:
          "subject masterClassName batch department finalReportsSettings.aggregatePassingPercentage",
      });
    let classes = finalReport?.classId;
    if (classes.department) {
      var department = await Department.findById(classes.department).populate({
        path: "grade_system",
        select: "grades custom_grade grade_name grade_type grade_count",
      });
    }
    let s_with_max = [];
    for (let sub of classes.subject) {
      let arr = [];
      let m_id = "";
      for (let sub_a of sub.subject_mark_list) {
        for (let sub_b of sub_a.marks_list) {
          arr.push(sub_b.totalNumber);
        }
        m_id = sub_a.subjectMaster;
      }
      let maxValue = Math.max(...arr);
      s_with_max.push({
        subjectMaster: m_id,
        maxValue: maxValue,
        passing: sub?.setting?.subjectPassingMarks,
      });
    }

    const db_standard_mark = await StandardMarkList.findOne({
      classMaster: classes.masterClassName,
      batch: classes?.batch,
    });

    let st_arr = [];
    for (let st_mark of db_standard_mark?.marks_list) {
      st_arr.push(st_mark.totalMarks);
    }
    let standard_max = Math.max(...st_arr);
    let standard_max_value = Math.ceil(
      (standard_max * 100) / (100 * classes.subject?.length)
    );

    const subjects = [];
    const total = {
      finalTotal: finalReport.totalFinalExam,
      otherTotal: finalReport.totalOtherExam,
      graceTotal: finalReport.totalGraceExam,
      allSubjectTotal: finalReport.totalTotalExam,
      totalCutoff: finalReport.totalCutoff,
      showGradeTotal: "",
      spi: 0,
    };

    for (let sub of finalReport.subjects) {
      const obj = {
        _id: sub.subject,
        subjectName: sub.subjectName,
        finalTotalMarks: sub.finalExamTotal,
        finalObtainMarks: sub.finalExamObtain,
        otherTotalMarks: sub.otherExamTotal,
        otherObtainMarks: sub.otherExamObtain,
        graceMarks: sub.graceMarks,
        totalMarks: sub.totalMarks,
        subjectWiseTotal: sub.obtainTotalMarks,
        subjectCutoff: sub.subjectCutoff,
        subjectPassStatus: sub.subjectPassStatus,
        showGrade: "",
        course_credit: 0,
      };
      if (finalReport.is_grade) {
        const su_matser = await Subject.findById(sub.subject);
        obj.course_credit = su_matser?.course_credit;

        for (let m_val of s_with_max) {
          if (`${su_matser.subjectMasterName}` === `${m_val.subjectMaster}`) {
            obj.showGrade = grade_calculate(
              m_val.maxValue,
              department?.grade_system?.[0],
              m_val.passing,
              obj.subjectWiseTotal
            );
          }
        }
        subjects.push(obj);
      } else {
        subjects.push(obj);
      }
    }

    const totalPercentage = Math.ceil(
      (total.allSubjectTotal * 100) / (100 * subjects.length)
    );
    total.showGradeTotal = grade_calculate(
      standard_max_value,
      department?.grade_system?.[0],
      classes?.finalReportsSettings.aggregatePassingPercentage,
      totalPercentage
    );
    if (finalReport.is_grade) {
      let gpc = [];
      let credits = [];
      for (let subj of subjects) {
        gpc.push(
          grade_point_with_credit(
            grade_point(subj.showGrade),
            subj.course_credit
          )
        );
        credits.push(subj.course_credit);
      }
      let spi = spi_calculate(gpc, credits);
      total.showGradeTotal = grade_symbol(Math.ceil(spi));
      total.spi = spi;
    }
    // console.log(classes?.finalReportsSettings.aggregatePassingPercentage);
    // Add Another Encryption
    res.status(200).send({
      message: "Student previous year detail all list 👍",
      finalReport: {
        subjects,
        total,
        totalPercentage,
        is_grade: finalReport.is_grade,
        attendance: finalReport.attendance,
        attendanceTotal: finalReport.attendanceTotal,
        attendancePercentage: finalReport.attendancePercentage,
        behaviourStar: finalReport.behaviourStar,
        behaviourImprovement: finalReport.behaviourImprovement,
        behaviourLack: finalReport.behaviourLack,
      },
      student: {
        studentROLLNO: previousData?.studentROLLNO,
        studentFirstName: finalReport?.student?.studentFirstName,
        studentMiddleName: finalReport?.student?.studentMiddleName,
        studentLastName: finalReport?.student?.studentLastName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(424).send({
      message: e,
    });
  }
};
exports.instituteDepartmentOtherCount = async (req, res) => {
  try {
    if (!req.params.id) throw "Please call proper api with all details";
    const institute_data = await InstituteAdmin.findById(req.params.id).select(
      "departmentCount studentCount classRooms name insName insProfileCoverPhoto coverId alias_pronounciation"
    );
    const classCount = institute_data?.classRooms?.length;
    const modifiy_data = {
      departmentCount: institute_data?.departmentCount,
      studentCount: institute_data?.studentCount,
      classCount: classCount,
      name: institute_data?.name,
      insName: institute_data?.insName,
      insProfileCoverPhoto: institute_data?.insProfileCoverPhoto,
      coverId: institute_data?.coverId,
      _id: institute_data?._id,
      alias_pronounciation: institute_data?.alias_pronounciation,
    };
    res.status(200).send({
      message: "All count and institute some details",
      institute: modifiy_data,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
      institiute: null,
    });
    console.log(e);
  }
};

exports.getOneDepartmentOfPromote = async (req, res) => {
  try {
    const { did } = req.params;
    const { exist_batch } = req.query;
    if (!did) throw "Please call proper api with all details";
    if (exist_batch) {
      var depart = await Department.findById({ _id: did }).select("dName");

      var batches = await Batch.findById({ _id: `${exist_batch}` })
        .select("batchName batchStatus createdAt classroom")
        .populate({
          path: "classroom",
          select: "className classTitle classTeacher classStatus",
          populate: {
            path: "classTeacher",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        });

      var department = {
        _id: depart?._id,
        dName: depart?.dName,
        batches: batches,
      };
    } else {
      var department = await Department.findById({ _id: did })
        .select("dName")
        .populate({
          path: "departmentSelectBatch",
          select: "batchName batchStatus createdAt",
          populate: {
            path: "classroom",
            select: "className classTitle classTeacher classStatus",
            populate: {
              path: "classTeacher",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
            },
          },
        })
        .lean()
        .exec();
    }
    // const oneEncrypt = await encryptionPayload(department);
    res.status(200).send({ message: "Success", department });
  } catch (e) {
    res.status(200).send({ message: e, department: null });
    console.log(e);
  }
};
exports.getPromoteStudentByClass = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid) throw "Please call proper api with all *required details";
    const classes = await Class.findById(cid)
      .populate({
        path: "promoteStudent",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentClass studentGender",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .select("promoteStudent boyCount girlCount")
      .lean()
      .exec();

    var boyCount = 0;
    var girlCount = 0;
    for (var val of classes?.promoteStudent) {
      if (`${val?.studentGender?.toLowerCase()}` === "male") {
        boyCount += 1;
      } else if (`${val?.studentGender?.toLowerCase()}` === "female") {
        girlCount += 1;
      }
    }
    var count = {
      boyCount: boyCount,
      girlCount: girlCount,
      totalCount: boyCount + girlCount,
    };
    res.status(200).send({
      message: "All promoted student list",
      promoteStudent: classes.promoteStudent ?? [],
      count: count,
    });
  } catch (e) {
    res.status(200).send({ message: e, promoteStudent: [] });
    console.log(e);
  }
};

// exports.getPromoteStudentByClass = async (req, res) => {
//   try {
//     const { cid } = req.params;
//     if (!cid) throw "Please call proper api with all *required details";
//     const classes = await Class.findById(cid)
//       .populate({
//         path: "promoteStudent",
//         select:
//           "studentFirstName studentMiddleName studentLastName valid_full_name old_fee_structure",
//         populate: {
//           path: "fee_structure old_fee_structure",
//           select: "unique_structure_name total_admission_fees",
//         },
//       })
//       // .select("promoteStudent boyCount girlCount")
//       .lean()
//       .exec();

//     // var boyCount = 0;
//     // var girlCount = 0;
//     // for (var val of classes?.promoteStudent) {
//     //   if (`${val?.studentGender?.toLowerCase()}` === "male") {
//     //     boyCount += 1;
//     //   } else if (`${val?.studentGender?.toLowerCase()}` === "female") {
//     //     girlCount += 1;
//     //   }
//     // }
//     // var count = {
//     //   // boyCount: boyCount,
//     //   // girlCount: girlCount,
//     //   totalCount: boyCount + girlCount,
//     // };
//     res.status(200).send({
//       message: "All promoted student list",
//       promoteStudent: classes.promoteStudent ?? [],
//       count: classes.promoteStudent?.length,
//     });
//   } catch (e) {
//     res.status(200).send({ message: e, promoteStudent: [] });
//     console.log(e);
//   }
// };

exports.getNotPromoteStudentByClass = async (req, res) => {
  try {
    const { cid } = req.params;
    const { valid_app_fee } = req.query;
    if (!cid) throw "Please call proper api with all *required details";
    if (valid_app_fee === "Yes") {
      const classes_promote = await Class.findById(cid);
      const classes = await Class.findById(cid)
        .populate({
          path: "ApproveStudent",
          match: {
            _id: { $nin: classes_promote.promoteStudent },
          },
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto fee_structure studentROLLNO studentGRNO",
          populate: {
            path: "fee_structure remainingFeeList",
            select: "applicable_fees paid_fee",
          },
        })
        .select("ApproveStudent")
        .lean()
        .exec();
      var filtered_sorted = [];
      for (var ref of classes?.ApproveStudent) {
        const one_remain = await RemainingList.findOne({
          $and: [
            { student: ref?._id },
            { fee_structure: ref?.fee_structure?._id },
          ],
        });
        const one_structure = await FeeStructure.findById({
          _id: ref?.fee_structure?._id,
        });
        if (one_remain?.paid_fee >= one_structure?.applicable_fees) {
          filtered_sorted.push(ref);
        }
      }
      res.status(200).send({
        message: "All not promoted student list",
        notPromoteStudent: filtered_sorted ?? [],
      });
    } else {
      const classes_promote = await Class.findById(cid);
      const classes = await Class.findById(cid)
        .populate({
          path: "ApproveStudent",
          match: {
            _id: { $nin: classes_promote.promoteStudent },
          },
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto fee_structure studentROLLNO studentGRNO",
          populate: {
            path: "fee_structure remainingFeeList",
            select: "applicable_fees paid_fee",
          },
        })
        .select("ApproveStudent")
        .lean()
        .exec();
      res.status(200).send({
        message: "All not promoted student list",
        notPromoteStudent: classes?.ApproveStudent ?? [],
      });
    }
  } catch (e) {
    res.status(200).send({ message: e, notPromoteStudent: [] });
    console.log(e);
  }
};

exports.renderAllExamCountQuery = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const depart = await Department.findById({ _id: did }).select(
      "classCount departmentSelectBatch dName batches"
    );
    const s_master = await SubjectMaster.findOne({
      department: depart?._id,
    }).select("backlogStudentCount");

    res.status(200).send({
      message: "Explore All Department Inner Count Query",
      access: true,
      c_query: {
        classCount: depart?.classCount,
        backlogStudentCount: s_master?.backlogStudentCount,
        defaultBatch: depart?.departmentSelectBatch,
        batches: depart?.batches,
        name: depart?.dName,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentUserLoginQuery = async (req, res) => {
  try {
    const { phone, email, sid } = req.body;
    if (!sid && !phone && !email)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var valid_phone = await handle_undefined(phone);
    var valid_email = await handle_undefined(email);
    const one_student = await Student.findById(sid)
      .populate({
        path: "institute",
        select: "insName insEmail",
      })
      .populate({
        path: "studentClass",
        select: "className classTitle",
      });
    var name = `${one_student?.studentFirstName} ${
      one_student?.studentMiddleName ? `${one_student?.studentMiddleName}` : ""
    } ${one_student?.studentLastName}`;
    var one_user = await User.findById({ _id: `${one_student?.user}` });
    if (valid_phone) {
      one_user.userPhoneNumber = valid_phone
        ? valid_phone
        : one_user?.userPhoneNumber;
      await one_user.save();
      await send_phone_login_query(
        one_user?.userPhoneNumber,
        name,
        one_student?.institute?.insName,
        one_student?.studentClass?.classTitle
      );
    }
    if (valid_email) {
      one_user.userEmail = valid_email ? valid_email : one_user?.userEmail;
      await one_user.save();
      await send_email_authentication_login_query(
        one_user.userEmail,
        one_student?.institute?.insEmail,
        name,
        one_student?.institute?.insName,
      );
    }
    res.status(200).send({
      message: "Student User Login Credentials edited successfully👍",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveEmailReplaceQuery = async (arr) => {
  try {
    if (arr?.length > 0) {
      for (var ref of arr) {
        var one_student = await Student.findOne({
          studentGRNO: `${ref?.studentGRNO}`,
        })
          .populate({
            path: "institute",
            select: "insName insEmail",
          })
          .populate({
            path: "studentClass",
            select: "className classTitle",
          });
        var name = `${one_student?.studentFirstName} ${
          one_student?.studentMiddleName
            ? `${one_student?.studentMiddleName}`
            : ""
        } ${one_student?.studentLastName}`;
        if (one_student?.user) {
          var one_user = await User.findById({ _id: `${one_student?.user}` });
          one_user.userEmail = ref?.userEmail
            ? ref?.userEmail
            : one_user?.userEmail;
          await one_user.save();
          await send_email_authentication_login_query(
            one_user.userEmail,
            one_student?.institute?.insEmail,
            name,
            one_student?.institute?.insName,
          );
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getPromoteStudentByClassQuery = async (req, res) => {
  try {
    const { arr } = req?.body;
    const classes = await Class.find({ _id: { $in: arr } })
      .populate({
        path: "promoteStudent",
        select: "valid_full_name studentClass",
        populate: {
          path: "studentClass fee_structure",
          select: "className classTitle unique_structure_name",
        },
      })
      .select("promoteStudent")
      .lean()
      .exec();

    var all_student = [];

    for (var ref of classes) {
      all_student.push(...ref?.promoteStudent);
    }
    res.status(200).send({
      message: "All promoted student list",
      promoteStudent: all_student ?? [],
      count: all_student?.length,
    });
  } catch (e) {
    res.status(200).send({ message: e, promoteStudent: [] });
    console.log(e);
  }
};