const Department = require("../../models/Department");
const ClassMaster = require("../../models/ClassMaster");
const Class = require("../../models/Class");
const SubjectMaster = require("../../models/SubjectMaster");
const Subject = require("../../models/Subject");
const Batch = require("../../models/Batch");
const Exam = require("../../models/Exam");
const Student = require("../../models/Student");
const User = require("../../models/User");
const AttendenceDate = require("../../models/AttendenceDate");
const SubjectMarks = require("../../models/Marks/SubjectMarks");
const Behaviour = require("../../models/Behaviour");
const FinalReport = require("../../models/Marks/FinalReport");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const { uploadDocFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const StudentPreviousData = require("../../models/StudentPreviousData");
const Backlog = require("../../models/BacklogStudent/backlog");
const moment = require("moment");
const Staff = require("../../models/Staff");
const Seating = require("../../models/Exam/seating");
const { handle_undefined } = require("../../Handler/customError");
const { replace_query } = require("../../helper/dayTimer");
const ExamMalicious = require("../../models/Exam/ExamMalicious");
const GradeSystem = require("../../models/Marks/GradeSystem");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

exports.getClassMaster = async (req, res) => {
  try {
    const classMaster = await ClassMaster.find({
      department: { $eq: req.params.did },
    })
      .select("className classDivision")
      .populate({
        path: "classDivision",
        match: { batch: { $eq: `${req.params.bid}` } },
        select: "_id classTitle",
      })
      .lean()
      .exec();
    // const cMasterEncrypt = await encryptionPayload(classMaster);
    res.status(200).send({ classMaster });
  } catch {}
};

exports.getSubjectMaster = async (req, res) => {
  try {
    const classMaster = await ClassMaster.findById(req.params.cmid)
      .populate({
        path: "classDivision",
        match: { batch: { $eq: `${req.params.bid}` } },
        populate: {
          path: "subject",
          populate: {
            path: "subjectMasterName",
            select: "subjectName _id",
          },
          select: "_id",
        },
        select: "_id",
      })
      .select("_id")
      .lean()
      .exec();
    const arr = [];
    classMaster.classDivision?.forEach((sub) => {
      sub.subject?.forEach((subject) => {
        arr.push(subject);
      });
    });

    const arr1 = [];
    for (let i = 0; i < arr?.length; i++) {
      const subjectObject = {
        subjectName: arr[i].subjectMasterName.subjectName,
        _id: arr[i].subjectMasterName._id,
        ids: [arr[i]._id],
      };
      for (let j = i + 1; j < arr?.length; j++) {
        if (arr[i].subjectMasterName._id === arr[j].subjectMasterName._id) {
          subjectObject.ids.push(arr[j]._id);
          arr.splice(j, 1);
        }
      }
      arr1.push(subjectObject);
    }
    // const arrEncrypt = await encryptionPayload(arr1);
    res.status(200).send({ classMaster: arr1 });
  } catch {}
};

exports.createExam = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.bid).select(
      "department _id exams"
    );
    const department = await Department.findById(batch.department).select(
      "exams _id"
    );
    const exam = new Exam(req.body);
    batch.exams.push(exam._id);
    department.exams.push(exam._id);
    exam.department = department._id;
    exam.batch = batch._id;

    res.status(201).send({ message: "Exam is created" });
    const allclasses = [
      ...new Set(req.body.allclasses?.map(JSON.stringify)),
    ].map(JSON.parse);

    for (let cid of allclasses) {
      for (let sub of req.body.allsubject) {
        for (let subId of sub.subjectIds) {
          const subject = await Subject.findById(subId).select("class exams");
          if (String(subject.class) === cid) {
            const classes = await Class.findById(cid).select(
              "ApproveStudent exams _id"
            );
            if (classes.exams.includes(exam._id)) {
            } else {
              classes.exams.push(exam._id);
              exam.class.push(cid);
              await classes.save();
            }
            for (let stu of classes.ApproveStudent) {
              const student = await Student.findById(stu);
              const user = await User.findById({ _id: `${student.user}` });
              if (student.exams.includes(exam._id)) {
              } else {
                student.exams.push(exam._id);
              }
              const subjectMarks1 = await SubjectMarks.findOne({
                subject: subject._id,
                student: student._id,
              });
              if (subjectMarks1) {
                if (exam.examType === "Final") {
                  let otherWeightage = 0;
                  for (let weihtage of subjectMarks1?.marks) {
                    if (weihtage.examType === "Other") {
                      otherWeightage += weihtage.examWeight;
                    }
                  }
                  subjectMarks1.marks.push({
                    examId: exam._id,
                    examName: exam.examName,
                    examType: exam.examType,
                    examWeight: otherWeightage,
                    totalMarks: sub.totalMarks,
                    date: sub.date,
                    startTime: sub.startTime,
                    endTime: sub.endTime,
                  });
                } else {
                  subjectMarks1.marks.push({
                    examId: exam._id,
                    examName: exam.examName,
                    examType: exam.examType,
                    examWeight: exam.examWeight,
                    totalMarks: sub.totalMarks,
                    date: sub.date,
                    startTime: sub.startTime,
                    endTime: sub.endTime,
                  });
                }
                await subjectMarks1.save();
              } else {
                let weight = 0;
                if (exam.examType === "Final") {
                  weight = 100;
                }
                const subjectMarks = new SubjectMarks({
                  subject: subject._id,
                  subjectName: sub.subjectName,
                  student: student._id,
                });
                subjectMarks.marks.push({
                  examId: exam._id,
                  examName: exam.examName,
                  examType: exam.examType,
                  examWeight: weight < 1 ? exam.examWeight : weight,
                  totalMarks: sub.totalMarks,
                  date: sub.date,
                  startTime: sub.startTime,
                  endTime: sub.endTime,
                });
                student.subjectMarks.push(subjectMarks._id);
                await subjectMarks.save();
              }
              const notify = new StudentNotification({});
              notify.notifyContent = `New ${exam.examName} Exam is created for ${sub.subjectName} , check your members tab`;
              notify.notifySender = department._id;
              notify.notifyReceiever = user._id;
              notify.examId = exam._id;
              notify.notifyType = "Student";
              notify.notifyPublisher = student._id;
              user.activity_tab.push(notify._id);
              student.notification.push(notify._id);
              notify.notifyByDepartPhoto = department._id;
              notify.notifyCategory = "Exam";
              notify.redirectIndex = 1;
              //
              invokeMemberTabNotification(
                "Student Activity",
                notify,
                "New Exam",
                user._id,
                user.deviceToken,
                "Student",
                notify
              );
              //
              await Promise.all([student.save(), notify.save(), user.save()]);
            }
            if (subject?.exams?.includes(exam._id)) {
            } else {
              subject.exams.push(exam._id);
              await subject.save();
            }
            exam.subjects.push({
              subjectId: subject._id,
              subjectName: sub.subjectName,
              totalMarks: sub.totalMarks,
              date: sub.date,
              startTime: sub.startTime,
              endTime: sub.endTime,
              subjectMasterId: sub._id,
            });
          }
        }
      }
    }
    await Promise.all([exam.save(), batch.save(), department.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.allExam = async (req, res) => {
  const exam = await Exam.find({
    department: { $eq: `${req.params.did}` },
  }).select("examName examWeight examMode createdAt examType");
  // const examEncrypt = await encryptionPayload(exam);
  res.status(200).send({ exam });
};

exports.examById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.eid).select(
      "examName examType examMode examWeight createdAt class subjects"
    );
    const masterids = [];
    for (let cid of exam.class) {
      const classes = await Class.findById(cid).select(
        "className subject masterClassName"
      );
      masterids.push(classes);
    }
    const subjectids = [];

    for (let sub of exam.subjects) {
      subjectids.push({
        subjectId: sub.subjectId,
        totalMarks: sub.totalMarks,
        date: sub.date,
        startTime: sub.startTime,
        endTime: sub.endTime,
        subjectName: sub.subjectName,
        subjectMasterId: sub.subjectMasterId,
        duration: sub?.duration,
        _id: sub?._id,
      });
    }
    const classWithSubject = [];
    masterids?.forEach((master) => {
      const obj = {
        _id: master._id,
        className: master.className,
        masterClassName: master.masterClassName,
        subject: [],
      };
      subjectids?.forEach((subject) => {
        if (master?.subject?.includes(subject?.subjectId))
          obj.subject.push(subject);
      });
      classWithSubject.push(obj);
    });

    const oneExamDetail = [];
    for (let i = 0; i < classWithSubject?.length; i++) {
      const obj = {
        _id: classWithSubject[i]._id,
        className: classWithSubject[i].className,
        masterClassName: classWithSubject[i].masterClassName,
        subject: [...classWithSubject[i].subject],
      };
      for (let j = i + 1; j < classWithSubject?.length; j++) {
        if (
          String(classWithSubject[i].masterClassName) ===
          String(classWithSubject[j].masterClassName)
        )
          obj.subject.push(...classWithSubject[j].subject);

        classWithSubject.splice(j, 1);
      }
      for (let z = 0; z < obj.subject?.length; z++) {
        for (let k = z + 1; k < obj.subject?.length; k++) {
          if (
            String(obj.subject[z].subjectMasterId) ===
            String(obj.subject[k].subjectMasterId)
          )
            obj.subject.splice(k, 1);
        }
      }
      oneExamDetail.push(obj);
    }
    // Add Another Encryption
    res.status(200).send({
      oneExamDetail,
      exam: {
        examName: exam.examName,
        examType: exam.examType,
        examMode: exam.examMode,
        examWeight: exam.examWeight,
        createdAt: exam.createdAt,
      },
    });
  } catch (e) {
    console.log(e);
  }
};

exports.allExamSubjectTeacher = async (req, res) => {
  try {
    var options = { sort: { createdAt: "-1" } };
    const subjectTeacher = await Subject.findById(req.params.sid)
      .select("exams _id")
      .populate({
        path: "exams",
        select: "examName examType examWeight subjects",
        options,
      });
    const subject = [];

    subjectTeacher?.exams.forEach((exam) => {
      exam.subjects.forEach((sub) => {
        if (String(sub.subjectId) === req.params.sid) {
          subject.push({
            _id: exam._id,
            examName: exam.examName,
            examType: exam.examType,
            examWeight: exam.examWeight,
            totalMarks: sub.totalMarks,
          });
        }
      });
    });
    // const sEncrypt = await encryptionPayload(subject);
    res.status(200).send({ subject });
  } catch (e) {
    console.log(e);
  }
};

exports.allStudentInSubjectTeacher = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid)
      .populate({
        path: "class",
        populate: {
          path: "ApproveStudent",
          select: "_id",
        },
        select: "_id",
      })
      .select("_id")
      .lean()
      .exec();
    // const exams=await Exam.findById(req.params.eid)
    const students = [];
    for (let studentId of subject?.class?.ApproveStudent) {
      const student = await Student.findById(studentId)
        .populate({
          path: "subjectMarks",
          match: { subject: { $eq: req.params.sid } },
        })
        .select(
          "studentFirstName studentMiddleName studentLastName studentROLLNO studentProfilePhoto subjectMarks studentClass"
        )
        .lean()
        .exec();

      if (student?.subjectMarks?.length) {
        for (let onemarks of student?.subjectMarks[0]?.marks) {
          if (onemarks.examId === req.params.eid) {
            const attend = await AttendenceDate.find({
              $and: [
                { attendDate: { $eq: `${onemarks.date}` } },
                { className: { $eq: `${student.studentClass}` } },
              ],
            });
            let flag = null;
            if (attend?.length) {
              attend[0]?.presentStudent?.forEach((ids) => {
                if (String(ids?.student) === req.params.sid)
                  return (flag = true);
              });
              attend[0]?.absentStudent?.forEach((ids) => {
                if (String(ids?.student) === req.params.sid)
                  return (flag = false);
              });
            }
            // let weightage = 100;
            // if (onemarks.examType === "Final") {
            //   for (let weight of student?.subjectMarks[0]?.marks) {
            //     if (weight.examType === "Other") weightage += weight.examWeight;
            //   }
            // }
            students.push({
              _id: student._id,
              studentFirstName: student.studentFirstName,
              studentMiddleName: student?.studentMiddleName,
              studentLastName: student?.studentLastName,
              studentProfilePhoto: student.studentProfilePhoto,
              studentROLLNO: student.studentROLLNO,
              obtainMarks: onemarks.obtainMarks,
              answerSheet: onemarks?.answerSheet,
              present: flag,
              // finalWeight: weightage,
            });
          }
        }
      }
    }
    students.sort((st1, st2) => {
      return parseInt(st1.studentROLLNO) - parseInt(st2.studentROLLNO);
    });
    // const studentsEncrypt = await encryptionPayload(students);
    res.status(200).send({ students });
  } catch (e) {
    console.log(e);
  }
};

exports.allStudentMarksBySubjectTeacher = async (req, res) => {
  try {
    const { examId, marks } = req.body;
    const subjectData = await Subject.findById({ _id: req.params.sid });
    const exam_data = await Exam.findById({ _id: examId });
    for (let studt of marks) {
      const student = await Student.findById(studt.studentId)
        .populate({
          path: "subjectMarks",
          match: {
            subject: { $eq: req.params.sid },
          },
        })
        .select("subjectMarks _id user");
      const user = await User.findById({ _id: `${student.user}` });
      const subjectMarks1 = await SubjectMarks.findById(
        student?.subjectMarks[0]?._id
      );
      for (let marks of subjectMarks1.marks) {
        if (marks.examId === examId) {
          marks.obtainMarks = studt.obtainMarks;
          await subjectMarks1.save();
        }
      }
      var notify = new StudentNotification({});
      notify.notifyContent = `${subjectData?.subjectName} marks updated.`;
      notify.notifySender = subjectData._id;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      notify.subjectId = subjectData._id;
      user.activity_tab.push(notify._id);
      notify.notifyBySubjectPhoto.subject_id = subjectData?._id;
      notify.notifyBySubjectPhoto.subject_name = subjectData.subjectName;
      notify.notifyBySubjectPhoto.subject_cover = "subject-cover.png";
      notify.notifyBySubjectPhoto.subject_title = subjectData.subjectTitle;
      notifyByExamPhoto = {
        exam_id: exam_data?._id,
        exam_name: exam_data?.examName,
      };
      notify.notifyCategory = "Marks";
      notify.redirectIndex = 21;
      //
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        `${subjectData.subjectName} Marks`,
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([student.save(), user.save(), notify.save()]);
    }
    res.status(200).send({ message: "updated" });
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentMarksBySubjectTeacher = async (req, res) => {
  try {
    const { examId, studentId, obtainMarks } = req.body;
    const student = await Student.findById(studentId)
      .populate({
        path: "subjectMarks",
        match: {
          subject: { $eq: req.params.sid },
        },
      })
      .select("subjectMarks _id")
      .lean()
      .exec();
    const subjectMarks1 = await SubjectMarks.findById(
      student?.subjectMarks[0]?._id
    );
    for (let marks of subjectMarks1.marks) {
      if (marks.examId === examId) {
        marks.obtainMarks = obtainMarks;
        if (req?.files) {
          for (let file of req?.files) {
            const obj = {
              documentType: "",
              documentName: "",
              documentSize: "",
              documentKey: "",
              documentEncoding: "",
            };
            obj.documentType = file.mimetype;
            obj.documentName = file.originalname;
            obj.documentEncoding = file.encoding;
            obj.documentSize = file.size;
            const results = await uploadDocFile(file);
            obj.documentKey = results.Key;
            marks.answerSheet.push(obj);
            await unlinkFile(file.path);
          }
        }
        await subjectMarks1.save();
      }
    }

    res.status(200).send({ message: "updated" });
  } catch (e) {
    console.log(e);
  }
};

exports.allExamInStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "studentClass",
        populate: {
          path: "exams",
          // populate: {
          //   path: "subjects",
          //   // select: "subjectId",
          //   // match: { subjectId: { $in: student1.studentClass.subject } },
          // },
          select: "examName examType examWeight subjects",
        },
        select: "exams subject",
      })
      .select("studentClass exams");

    // if (student.studentClass === null && req.query.previousClass) {
    //   var classes = await Class.findById(req.query.previousClass)
    //     .populate({
    //       path: "exams",
    //       select: "examName examType examWeight subjects",
    //     })
    //     .select("exams subject")
    //     .lean()
    //     .exec();
    // }
    //   const detailExam =
    //   student?.studentClass !== null ? student?.studentClass : classes;
    // const detailSubject =
    //   student?.studentClass !== null ? student?.studentClass : classes;
    const exams = [];
    for (let exam of student?.studentClass?.exams) {
      if (student.exams?.includes(exam?._id)) {
        const examObj = {
          _id: exam._id,
          examName: exam.examName,
          examType: exam.examType,
          examWeight: exam.examWeight,
          subject: 0,
        };
        exam.subjects?.forEach((sub) => {
          if (student?.studentClass?.subject.includes(String(sub.subjectId))) {
            examObj.subject = examObj.subject + 1;
          }
        });
        exams.push(examObj);
      }
    }
    // const eEncrypt = await encryptionPayload(exams);
    res.status(200).send({ exams });
  } catch (e) {
    console.log(e);
  }
};

exports.oneExamAllSubjectInStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "subjectMarks",
      })
      .select("_id");

    var one_exam = await Exam.findById({ _id: req.params.eid });
    // console.log(student)/;
    // if (student.subjectMarks?.length <= 0 && req.query.previousYearId)
    //   var previousYear = await StudentPreviousData.findById(
    //     req.query.previousYearId
    //   )
    //     .populate({
    //       path: "subjectMarks",
    //     })
    //     .select("_id")
    //     .lean()
    //     .exec();
    // console.log(previousYear);
    // const subjectDeiatl =
    // !req.query.previousYearId && student.subjectMarks?.length >= 0
    //   ? student
    //   : previousYear;
    const subjects = [];

    for (var submarks of student?.subjectMarks) {
      for (var exammarks of submarks?.marks) {
        if (`${exammarks.examId}` === `${one_exam?._id}`) {
          var all_seats = await Seating.find({
            _id: { $in: one_exam?.seating_sequence },
          })
            .select("seat_block_class seat_block_name")
            .populate({
              path: "seat_block_class",
              select: "className classTitle classStatus",
            });
          subjects.push({
            _id: submarks.subject,
            subjectName: submarks.subjectName,
            obtainMarks: exammarks.obtainMarks,
            totalMarks: exammarks.totalMarks,
            date: exammarks.date,
            startTime: exammarks.startTime,
            endTime: exammarks.endTime,
            seating: [...all_seats],
          });
        }
      }
    }
    // const subEncrypt = await encryptionPayload(subjects);
    res.status(200).send({ subjects });
  } catch (e) {
    console.log(e);
  }
};

exports.oneExamOneSubjectAnswersheetInStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "subjectMarks",
      })
      .select("_id studentClass");
    let subjects = "";

    for (let submarks of student?.subjectMarks) {
      for (let exammarks of submarks?.marks) {
        if (
          exammarks.examId === req.params.eid &&
          String(submarks.subject) === req.query?.subjectId
        ) {
          const attend = await AttendenceDate.find({
            $and: [
              { attendDate: { $eq: `${exammarks.date}` } },
              { className: { $eq: `${student.studentClass}` } },
            ],
          });
          let flag = null;
          if (attend?.length) {
            attend[0]?.presentStudent?.forEach((ids) => {
              if (String(ids?.student) === req.params.sid) return (flag = true);
            });
            attend[0]?.absentStudent?.forEach((ids) => {
              if (String(ids?.student) === req.params.sid)
                return (flag = false);
            });
          }
          subjects = {
            _id: submarks.subject,
            obtainMarks: exammarks.obtainMarks,
            totalMarks: exammarks.totalMarks,
            answersheet: exammarks.answerSheet,
            present: flag,
            weightage: exammarks.examWeight,
          };
        }
      }
    }
    // const submarksEncrypt = await encryptionPayload(subjects);
    res.status(200).send({ subjects });
  } catch (e) {
    console.log(e);
  }
};
exports.oneClassSettings = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid).select(
      "finalReportsSettings"
    );
    // const fEncrypt = await encryptionPayload(classes.finalReportsSettings);
    res
      .status(200)
      .send({ finalReportsSettings: classes.finalReportsSettings });
  } catch (e) {
    console.log(e);
  }
};
exports.oneStudentBehaviourClassTeacher = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "studentClass",
        select: "_id",
      })
      .select("_id studentBehaviour studentClass");

    const classes = await Class.findById(student.studentClass._id).select(
      "studentBehaviour _id"
    );
    const behaviour = new Behaviour({ ...req.body });
    behaviour.studentName = student._id;
    classes.studentBehaviour.push(behaviour._id);
    student.studentBehaviour = behaviour._id;
    behaviour.className = classes._id;
    await Promise.all([classes.save(), student.save(), behaviour.save()]);
    res.status(201).send({
      message: "behaviour is done",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentGraceMarksClassTeacher = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "subjectMarks",
        select: "_id subject",
      })
      .select("_id");

    for (let subject of req.body.allsubjects) {
      for (let subjectmarks of student.subjectMarks) {
        if (String(subjectmarks.subject) === subject._id) {
          const subjectMarks = await SubjectMarks.findById(subjectmarks._id);
          subjectMarks.graceMarks = subject.graceMarks;
          await subjectMarks.save();
        }
      }
    }
    res.status(200).send({ message: "updated grace marks" });
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentReportCardClassTeacher = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "subjectMarks",
      })
      .populate({
        path: "studentClass",
        populate: {
          path: "subject",
          select: "setting.subjectPassingMarks",
        },
        select: "subject finalReportsSettings.aggregatePassingPercentage -_id",
      })
      .select("_id subjectMarks studentClass");

    const subjects = [];
    const total = {
      finalTotal: 0,
      otherTotal: 0,
      graceTotal: 0,
      allSubjectTotal: 0,
      totalCutoff: student?.studentClass?.finalReportsSettings
        ?.aggregatePassingPercentage
        ? student?.studentClass?.finalReportsSettings
            ?.aggregatePassingPercentage
        : 0,
    };
    student?.subjectMarks.forEach((submarks) => {
      const obj = {
        _id: submarks.subject,
        subjectName: submarks.subjectName,
        finalTotalMarks: 0,
        finalObtainMarks: 0,
        otherTotalMarks: 0,
        otherObtainMarks: 0,
        subjectWiseTotal: submarks.graceMarks,
        graceMarks: submarks.graceMarks,
        subjectCutoff: 0,
      };
      for (let cut of student?.studentClass?.subject) {
        if (String(submarks.subject) === String(cut?._id))
          obj.subjectCutoff = cut.setting.subjectPassingMarks;
      }
      let totalOtherAllWeight = 0;
      submarks?.marks.forEach((eachmarks) => {
        if (eachmarks.examType === "Other") {
          totalOtherAllWeight = totalOtherAllWeight + eachmarks.examWeight;
        }
      });
      // console.log("this is weight", totalOtherAllWeight);
      submarks?.marks.forEach((eachmarks) => {
        if (eachmarks.examType === "Other") {
          obj.otherTotalMarks = obj.otherTotalMarks + eachmarks.totalMarks;
          obj.otherObtainMarks = obj.otherObtainMarks + eachmarks.obtainMarks;

          obj.subjectWiseTotal =
            obj.subjectWiseTotal +
            (eachmarks.obtainMarks * eachmarks.examWeight) /
              eachmarks.totalMarks;
        } else {
          obj.finalTotalMarks = eachmarks.totalMarks;
          obj.finalObtainMarks = eachmarks.obtainMarks;
          obj.subjectWiseTotal =
            obj.subjectWiseTotal +
            (eachmarks.obtainMarks * (100 - totalOtherAllWeight)) /
              eachmarks.totalMarks;
        }
      });
      total.finalTotal = total.finalTotal + obj.finalObtainMarks;
      total.otherTotal = total.otherTotal + obj.otherObtainMarks;
      total.graceTotal = total.graceTotal + submarks.graceMarks;
      total.allSubjectTotal = total.allSubjectTotal + obj.subjectWiseTotal;
      subjects.push(obj);
    });
    const totalPercantage =
      (total.allSubjectTotal * 100) / (100 * subjects.length);
    // Add Another Encryption
    res.status(200).send({
      subjects,
      total,
      totalPercantage,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentAllYearAttendance = async (req, res) => {
  try {
    const student1 = await Student.findById(req.params.sid).populate({
      path: "studentClass",
      select: "classStartDate",
    });
    // console.log(student1.studentClass);
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "attendDate",
        match: {
          attendDate: {
            $gte: `${student1.studentClass.classStartDate}`,
            $lte: `${req.query.date}`,
          },
        },
        select: "_id presentStudent attendDate",
      })
      .populate({
        path: "institute",
        select:
          "_id insName insDistrict insPincode insPhoneNumber insEmail insProfilePhoto",
      })
      .select("_id attendDate institute");
    const attendance = {
      totalPresent: 0,
      totalAttendance: student?.attendDate?.length,
      attendancePercentage: 0,
      institute: student.institute,
    };
    student?.attendDate?.forEach((attend) => {
      for (let pre of attend?.presentStudent) {
        if (String(pre.student) === req.params.sid) {
          attendance.totalPresent += 1;
        }
      }
    });
    attendance.attendancePercentage = (
      (attendance.totalPresent * 100) /
      attendance.totalAttendance
    ).toFixed(2);
    // const aEncrypt = await encryptionPayload(attendence);
    res.status(200).send({ attendance });
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentReletedNecessaryData = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .select("_id studentClass institute batches studentGRNO")
      .populate({
        path: "institute",
        select:
          "_id insName insDistrict insPincode insPhoneNumber insEmail insProfilePhoto insAddress",
      })
      .populate({
        path: "studentClass",
        populate: {
          path: "classTeacher",
          select: "staffFirstName staffLastName staffMiddleName",
        },
        select: "_id className classTitle classTeacher ",
      })
      .populate({
        path: "batches",
        select: "_id batchName",
      });
    // const studentEncrypt = await encryptionPayload(student);
    res.status(200).send({ student });
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentBehaviourReportCard = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "studentBehaviour",
        select: "improvements ratings lackIn",
      })
      .select("_id studentBehaviour");
    // const bEncrypt = await encryptionPayload(student.studentBehaviour);
    res.status(200).send({ student: student.studentBehaviour });
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentReportCardFinalize = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid).select(
      "_id finalReport finalReportStatus studentClass backlog"
    );
    if (student.finalReportStatus === "Yes") {
      throw "Report card is already finalize";
    }
    const finalize = new FinalReport({
      student: student._id,
      classId: student.studentClass,
      totalFinalExam: req.body.totalFinalExam,
      totalOtherExam: req.body.totalOtherExam,
      totalGraceExam: req.body.totalGraceExam,
      totalTotalExam: req.body.totalTotalExam,
      totalPercentage: req.body.totalPercentage,
      attendance: req.body.attendance,
      attendanceTotal: req.body.attendanceTotal,
      attendancePercentage: req.body.attendancePercentage,
      behaviourStar: req.body.behaviourStar,
      behaviourImprovement: req.body.behaviourImprovement,
      behaviourLack: req.body.behaviourLack,
      totalCutoff: req.body.totalCutoff,
      passStatus:
        req.body.totalCutoff > Math.round(req.body.totalPercentage)
          ? "FAIL"
          : "PASS",
    });
    student.finalReport.push(finalize._id);
    student.finalReportStatus = "Yes";
    for (let subject of req.body?.subjects) {
      if (!subject.finalExamObtain || !subject.finalExamTotal) {
        throw "All Final Exam Marks is not updated";
      }
      if (!subject.otherExamObtain || !subject.otherExamTotal) {
        throw "All Other Exam Marks is not updated";
      }
      finalize.subjects.push({
        subject: subject._id,
        subjectName: subject.subjectName,
        finalExamTotal: subject.finalExamTotal,
        finalExamObtain: subject.finalExamObtain,
        otherExamTotal: subject.otherExamTotal,
        otherExamObtain: subject.otherExamObtain,
        graceMarks: subject.graceMarks,
        totalMarks: subject.totalMarks,
        obtainTotalMarks: subject.obtainTotalMarks,
        subjectCutoff: subject.subjectCutoff,
        subjectPassStatus:
          subject.subjectCutoff > Math.round(subject.obtainTotalMarks)
            ? "FAIL"
            : "PASS",
      });
      const backlogSub = await Subject.findById(subject._id);
      const backlogSubMaster = await SubjectMaster.findById({
        _id: backlogSub?.subjectMasterName,
      });
      if (subject.subjectCutoff > Math.round(subject.obtainTotalMarks)) {
        const new_backlog = new Backlog({});
        new_backlog.backlog_subject = backlogSub?._id;
        new_backlog.backlog_class = student?.studentClass;
        new_backlog.backlog_batch = student?.batches;
        backlogSubMaster.backlog.push(new_backlog?._id);
        backlogSubMaster.backlogStudentCount += 1;
        new_backlog.backlog_students = req.params.sid;
        student.backlog.push(new_backlog._id);
        await Promise.all([backlogSubMaster.save(), new_backlog.save()]);
      } else {
        backlogSub.pass.push(req.params.sid);
      }
      await backlogSub.save();
    }
    const classes = await Class.findById(student?.studentClass);
    if (req.body.totalCutoff > Math.round(req.body.totalPercentage))
      classes.fail.push(req.params.sid);
    else classes.pass.push(req.params.sid);
    await Promise.all([finalize.save(), student.save(), classes.save()]);
    res.status(201).send({ message: "Finalize successfully" });
  } catch (e) {
    // console.log(e);
    res.status(200).send({ message: e });
  }
};

exports.oneStudentReportCardGraceUpdate = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid).populate({
      path: "subjectMarks",
    });

    for (let subMarks of student?.subjectMarks) {
      for (let bodysubject of req.body?.subjects) {
        if (String(subMarks.subject) === bodysubject._id) {
          subMarks.graceMarks = bodysubject.graceMarks;
        }
      }
      await subMarks.save();
    }
    // const graceEncrypt = await encryptionPayload(student);
    res.status(200).send({
      message: "grace marks updated successfully...😋😊😊😋😋",
      student,
    });
  } catch (e) {
    // console.log(e);
    res.status(424).send({ message: e });
  }
};

exports.oneStudentReportCardFinalizeGraceUpdate = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "subjectMarks",
        select: "subject _id",
      })
      .select("_id subjectMarks finalReport finalReportStatus");
    if (student.finalReportStatus !== "Yes") {
      throw "Grace marks is not updated because final report is not done";
    }
    const finalize = await FinalReport.findById(student.finalReport[0]);
    for (bodysubject of req.body?.subjects) {
      for (submark of student?.subjectMarks) {
        if (String(submark.subject) === bodysubject._id) {
          const subjectMarks = await SubjectMarks.findById(submark._id).select(
            "graceMarks"
          );
          const prevGrace = subjectMarks.graceMarks;
          subjectMarks.graceMarks = bodysubject.graceMarks;
          for (finalSubject of finalize.subjects) {
            if (bodysubject._id === String(finalSubject.subject)) {
              finalSubject.graceMarks = bodysubject.graceMarks;
              if (prevGrace >= bodysubject.graceMarks) {
                finalSubject.obtainTotalMarks -=
                  prevGrace - bodysubject.graceMarks;
                finalize.totalGraceExam -= prevGrace - bodysubject.graceMarks;
                finalize.totalTotalExam -= prevGrace - bodysubject.graceMarks;
              } else {
                finalSubject.obtainTotalMarks +=
                  bodysubject.graceMarks - prevGrace;
                finalize.totalGraceExam += bodysubject.graceMarks - prevGrace;
                finalize.totalTotalExam += bodysubject.graceMarks - prevGrace;
              }
              finalSubject.subjectPassStatus =
                finalSubject.subjectCutoff >
                Math.round(finalSubject.obtainTotalMarks)
                  ? "FAIL"
                  : "PASS";
            }
          }
          await subjectMarks.save();
        }
      }
    }
    finalize.totalPercentage =
      (finalize.totalTotalExam * 100) /
      (100 * finalize.subjects?.length).toFixed(2);
    finalize.passStatus =
      finalize.totalCutoff > Math.round(finalize.totalPercentage)
        ? "FAIL"
        : "PASS";
    await Promise.all([finalize.save()]);
    // const finalizeEncrypt = await encryptionPayload(finalize);
    res.status(200).send({ finalize });
  } catch (e) {
    console.log(e);
    res.status(424).send({ message: e });
  }
};

exports.retrieveBacklogClassMaster = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const depart = await Department.findById({ _id: did }).select(
      "departmentClassMasters"
    );

    const class_masters = await ClassMaster.find({
      _id: { $in: depart?.departmentClassMasters },
    })
      .limit(limit)
      .skip(skip)
      .select("className classCount");

    if (class_masters?.length > 0) {
      // const cMasterEncrypt = await encryptionPayload(class_masters)
      res.status(200).send({
        message: "Bulk of Class Masters Heavy Load 😀",
        access: true,
        masters: class_masters,
      });
    } else {
      res.status(200).send({
        message: "No Class Masters Avaliable 😡",
        access: false,
        masters: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveOneBacklogClassMasterSubjects = async (req, res) => {
  try {
    const { cmid } = req.params;
    var subject_array = [];
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!cmid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const classes = await Class.find({ masterClassName: cmid }).populate({
      path: "subject",
    });
    for (var cli of classes) {
      for (var sli of cli?.subject) {
        subject_array.push(sli?.subjectMasterName);
      }
    }

    const subjects = await SubjectMaster.find({
      _id: { $in: subject_array },
    })
      .limit(limit)
      .skip(skip)
      .select("subjectName backlogStudentCount");

    if (subjects?.length > 0) {
      // const sMasterEncrypt = await encryptionPayload(subjects)
      res.status(200).send({
        message: "Lot's of work due to many subjects 😀",
        access: true,
        subjects: subjects,
      });
    } else {
      res.status(200).send({
        message: "No Available Subjects 😡",
        access: false,
        subjects: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveBacklogOneSubjectStudent = async (req, res) => {
  try {
    var back_list = [];
    const { smid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!smid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });

    const subject_master = await SubjectMaster.findById({ _id: smid }).select(
      "backlog"
    );

    const all_backlogs = await Backlog.find({
      _id: { $in: subject_master?.backlog },
    }).select("backlog_students");

    for (var back of all_backlogs) {
      if (back?.backlog_students != null) {
        back_list.push(back?.backlog_students);
      }
    }

    const student_array = await Student.find({
      _id: { $in: back_list },
    })
      .limit(limit)
      .skip(skip)
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto"
      )
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      });

    if (student_array?.length > 0) {
      // const sEncrypt = await encryptionPayload(student_array)
      res.status(200).send({
        message: "Lot's of work due to many backlog students 😀",
        access: true,
        student_array: student_array,
      });
    } else {
      res.status(200).send({
        message: "No Available backlog students 😡",
        access: false,
        student_array: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveBacklogOneSubjectDropStudent = async (req, res) => {
  try {
    var back_drop = [];
    const { smid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!smid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });

    const subject_master = await SubjectMaster.findById({ _id: smid }).select(
      "backlog"
    );

    const all_backlogs = await Backlog.find({
      _id: { $in: subject_master?.backlog },
    }).select("backlog_dropout");

    for (var back of all_backlogs) {
      if (back?.backlog_dropout?.length > 0) {
        back_drop.push(...back?.backlog_dropout);
      }
    }

    const student_array = await Student.find({
      _id: { $in: back_drop },
    })
      .limit(limit)
      .skip(skip)
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto"
      )
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      });

    if (student_array?.length > 0) {
      // const sEncrypt = await encryptionPayload(student_array)
      res.status(200).send({
        message: "Lot's of work due to many backlog Drop students 😀",
        access: true,
        student_array: student_array,
      });
    } else {
      res.status(200).send({
        message: "No Available backlog drop students 😡",
        access: false,
        student_array: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveBacklogOneStudentSubjects = async (req, res) => {
  try {
    const { sid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });

    const one_student = await Student.findById({
      _id: sid,
    }).select("backlog");

    const all_back = await Backlog.find({
      $and: [{ _id: { $in: one_student?.backlog } }],
    })
      .limit(limit)
      .skip(skip)
      .select("createdAt backlog_symbol")
      .populate({
        path: "backlog_subject",
        select: "subjectName",
      })
      .populate({
        path: "backlog_class",
        select: "className classTitle",
      })
      .populate({
        path: "backlog_batch",
        select: "batchName",
      });

    if (all_back?.length > 0) {
      // const finalEncrypt = await encryptionPayload(all_back)
      res.status(200).send({
        message: "Get Ready for Preparation once again 😀",
        access: true,
        subjects: all_back,
      });
    } else {
      res.status(200).send({
        message: "Yeah enjoy party 😡",
        access: false,
        subjects: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveBacklogOneStudentMarkStatus = async (req, res) => {
  try {
    const { sid } = req.params;
    const { smid, status } = req.query;
    if (!sid && !smid && !status)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });

    const subject_master = await SubjectMaster.findById({ _id: smid }).select(
      "backlog"
    );

    const backlogs = await Backlog.findOne({
      $and: [
        { _id: { $in: subject_master?.backlog } },
        { backlog_students: sid },
        { backlog_status: "Not Mark" },
      ],
    });
    // const previous_data = await StudentPreviousData.findOne({
    //   student: sid,
    // }).select("finalReport");

    // const final_data = await FinalReport.findById({
    //   _id: previous_data?.finalReport[0],
    // });

    // for (let match_subject of final_data?.subjects) {
    //   if (match_subject?.subject === backlogs?.backlog_subject) {
    //     if (status === "Clear") {
    //       match_subject.clearBacklog = status;
    //       backlogs.backlog_clear.push(sid);
    //       backlogs.backlog_students = null;
    //     } else if (status === "Dropout") {
    //       match_subject.dropoutBacklog = status;
    //       backlogs.backlog_dropout.push(sid);
    //       backlogs.backlog_students = null;
    //     }
    //   }
    // }
    if (status === "Clear") {
      backlogs.backlog_clear.push(sid);
      backlogs.backlog_students = null;
      backlogs.backlog_symbol = "Clear";
    } else if (status === "Dropout") {
      backlogs.backlog_dropout.push(sid);
      backlogs.backlog_students = null;
      backlogs.backlog_symbol = "Dropout";
    } else {
    }
    backlogs.backlog_status = "Mark";
    await backlogs.save();
    res
      .status(200)
      .send({ message: `Backlog ${status} 😥`, access: true, backlogs });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewSeatingArrangementQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    const { papers } = req.body;
    var valid_staff = handle_undefined(req?.body?.seat_block_staff);
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_exam = await Exam.findById({ _id: eid });
    const new_seat = await Seating({ ...req.body });
    new_seat.seat_block_staff = valid_staff ? valid_staff : null;
    if (valid_staff) {
      var staff = await Staff.findById({
        _id: `${req?.body?.seat_block_staff}`,
      });
    }
    one_exam.seating_sequence.push(new_seat?._id);
    one_exam.seating_sequence_count += 1;
    new_seat.exam = one_exam?._id;
    var new_date;
    var new_start;
    var new_end;
    if (papers?.length > 0) {
      for (var ref of papers) {
        for (var ele of one_exam?.subjects) {
          if (`${ele?._id}` === `${ref?.paperId}`) {
            var one_subject = await Subject.findById({
              _id: `${ref?.subjectId}`,
            });
            var one_class = await Class.findById({
              _id: `${one_subject?.class}`,
            });
            new_seat.seat_exam_paper_array.push({
              subjectId: ref?.subjectId,
              subjectName: ref?.subjectName,
              totalMarks: ref?.totalMarks,
              date: ref?.date,
              startTime: ref?.startTime,
              endTime: ref?.endTime,
              duration: ref?.duration,
              subjectMasterId: ref?.subjectMasterId,
              from: ref?.from,
              to: ref?.to,
              count: parseInt(ref?.to) + 1 - parseInt(ref?.from),
            });
            new_date = ref?.date;
            new_start = ref?.startTime;
            new_end = ref?.endTime;
            ele.seating_sequence.push(new_seat?._id);
            one_class.exam_seating.push({
              subject_id: one_subject?._id,
              seating_id: new_seat?._id,
              from: ref?.from,
              to: ref?.to,
              count: parseInt(ref?.to) + 1 - parseInt(ref?.from),
            });
            one_class.exam_start = true;
            one_class.lastupto += ref?.to;
            await one_class.save();
          }
        }
      }
    }
    var exist_date = replace_query(`${new_date}`);
    if (valid_staff) {
      const notify = await StudentNotification({});
      const user = await User.findById({ _id: `${staff?.user}` });
      notify.notifyContent = `You have a supervision on ${moment(
        exist_date
      ).format("LL")} ${new_start} To ${new_end}`;
      notify.notifySender = one_exam?.department;
      notify.notifyReceiever = user?._id;
      notify.examId = one_exam?._id;
      notify.seatingId = new_seat?._id;
      notify.notifyType = "Staff";
      notify.notifyPublisher = staff?._id;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = one_exam?.department;
      notify.notifyCategory = "Exam Seating Arrangement";
      notify.redirectIndex = 31;
      invokeMemberTabNotification(
        "Staff Activity",
        notify,
        "Seating Arrangement",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([notify.save(), user.save()]);
    }
    await Promise.all([one_exam.save(), new_seat.save()]);
    res.status(200).send({ message: "Explore New Block", access: true });
    var all_students = await Student.find({
      $and: [
        { studentClass: { $in: one_exam?.class } },
        { studentStatus: "Approved" },
      ],
    });
    for (var ref of all_students) {
      var users = await User.findById({ _id: `${ref?.user}` });
      const notify = await StudentNotification({});
      notify.notifyContent = `You have a supervision on ${moment(
        exist_date
      ).format("LL")} ${new_start} To ${new_end}`;
      notify.notifySender = one_exam?.department;
      notify.notifyReceiever = users?._id;
      notify.examId = one_exam?._id;
      notify.seatingId = new_seat?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = ref?._id;
      users.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = one_exam?.department;
      notify.notifyCategory = "Exam Seating Arrangement";
      notify.redirectIndex = 31;
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "Seating Arrangement",
        users._id,
        users.deviceToken,
        "Student",
        notify
      );
      await Promise.all([notify.save(), users.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEditSeatingArrangementQuery = async (req, res) => {
  try {
    const { eid, said } = req.params;
    const { papers } = req.body;
    if (!eid && !said)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_exam = await Exam.findById({ _id: eid });
    const new_seat = await Seating.findByIdAndUpdate(said, req.body);
    if (papers?.length > 0) {
      for (var ref of papers) {
        var one_subject = await Subject.findById({
          _id: `${ref?.subjectId}`,
        });
        var one_class = await Class.findById({
          _id: `${one_subject?.class}`,
        });
        new_seat.seat_exam_paper_array.push({
          subjectId: ref?.subjectId,
          subjectName: ref?.subjectName,
          totalMarks: ref?.totalMarks,
          date: ref?.date,
          startTime: ref?.startTime,
          endTime: ref?.endTime,
          duration: ref?.duration,
          subjectMasterId: ref?.subjectMasterId,
          from: ref?.from,
          to: ref?.to,
          count: parseInt(ref?.to) + 1 - parseInt(ref?.from),
        });
        one_class.exam_seating.push({
          subject_id: one_subject?._id,
          seating_id: new_seat?._id,
          from: ref?.from,
          to: ref?.to,
          count: parseInt(ref?.to) + 1 - parseInt(ref?.from),
        });
        one_class.exam_start = true;
        one_class.lastupto += ref?.to;
        await one_class.save();
      }
      await new_seat.save();
    }
    res
      .status(200)
      .send({ message: "Explore Edited Seating Sequence", access: true });

    for (var ref of papers) {
      for (var ele of one_exam?.subjects) {
        if (`${ele?._id}` === `${ref?.paperId}`)
          ele.seating_sequence.push(new_seat?._id);
      }
    }
    await one_exam.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllSeatingArrangementQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_exam = await Exam.findById({ _id: eid }).select(
      "seating_sequence"
    );

    if (search) {
      var all_seating = await Seating.find({
        $and: [{ _id: { $in: one_exam?.seating_sequence } }],
        $or: [{ seat_block_name: { $regex: `${search}`, $options: "i" } }],
      })
        .populate({
          path: "seat_block_class",
          select: "className classTitle classStatus classTeacher",
          populate: {
            path: "classTeacher",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
          },
        })
        .populate({
          path: "seat_block_staff",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        });
    } else {
      var all_seating = await Seating.find({
        _id: { $in: one_exam?.seating_sequence },
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "seat_block_class",
          select: "className classTitle classStatus classTeacher",
          populate: {
            path: "classTeacher",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
          },
        })
        .populate({
          path: "seat_block_staff",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        });
    }

    if (all_seating?.length > 0) {
      res.status(200).send({
        message: "Explore All Upcoming Seating Arrangement",
        access: true,
        all_seating: all_seating,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Seating Arrangement",
        access: true,
        all_seating: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllClassQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_exam = await Exam.findById({ _id: eid }).select("class");

    if (search) {
      var all_classes = await Class.find({
        $and: [{ _id: { $in: one_exam?.class } }],
        $or: [{ className: { $regex: `${search}`, $options: "i" } }],
      })
        .select(
          "className classTitle classStatus exam_start lastupto exam_seating classTeacher studentCount"
        )
        .populate({
          path: "classTeacher",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        });
    } else {
      var all_classes = await Class.find({
        _id: { $in: one_exam?.class },
      })
        .limit(limit)
        .skip(skip)
        .select(
          "className classTitle classStatus exam_start lastupto exam_seating classTeacher studentCount"
        )
        .populate({
          path: "classTeacher",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        });
    }

    if (all_classes?.length > 0) {
      res.status(200).send({
        message: "Explore All Upcoming Classes",
        access: true,
        all_classes: all_classes,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Classes",
        access: true,
        all_classes: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneSeatingArrangementQuery = async (req, res) => {
  try {
    const { said } = req.params;
    if (!said)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_seat = await Seating.findById({ _id: said })
      .populate({
        path: "seat_block_class",
        select: "className classTitle classStatus",
      })
      .populate({
        path: "seat_block_staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      });

    res.status(200).send({
      message: "Explore One Seating Query",
      access: true,
      one_seat: one_seat,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDestroySeatingArrangementQuery = async (req, res) => {
  try {
    const { eid, said } = req.params;
    if (!eid && !said)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: true,
      });

    const one_exam = await Exam.findById({ _id: eid });
    const one_seat = await Seating.findById({ _id: said });
    one_exam.seating_sequence.pull(one_seat?._id);
    if (one_exam?.seating_sequence_count > 0) {
      one_exam.seating_sequence_count -= 1;
    }
    for (var ref of one_exam?.subjects) {
      if (ref?.seating_sequence) {
        ref.seating_sequence = null;
      }
    }
    await one_exam.save();
    await Seating.findByIdAndDelete(said);
    res
      .status(200)
      .send({ message: "Seating Deletion Operation Completed", access: true });
    const all_notify = await StudentNotification.find({ seatingId: said });
    for (var ref of all_notify) {
      var user = await User.findById({ _id: `${ref?.notifyReceiever}` });
      user.activity_tab.pull(ref?._id);
      await user.save();
    }
    await StudentNotification.deleteMany({ seatingId: said });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewSeatingArrangementAutomateQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    const { staff_list, class_list, hall_limit, sequence } = req.body;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    // const one_exam = await Exam.findById({ _id: eid })
    // const new_seat = await Seating({ ...req.body });
    res
      .status(200)
      .send({ message: "Explore Automated Seating Sequence", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllClassExportReport = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug regarding to call api",
        access: false,
      });
    const classes = await Class.findById(cid)
      .select(
        "batch ApproveStudent className classTitle finalReportsSettings.gradeMarks finalReportsSettings.aggregatePassingPercentage"
      )
      .populate({
        path: "institute",
        select:
          "insName insProfilePhoto phtotId insAddress insPhoneNumber insEmail",
      })
      .populate({
        path: "classTeacher",
        select: "staffFirstName staffMiddleName staffLastName",
      })
      .populate({
        path: "batch",
        select: "batchName",
      });

    const current_stuents = await Student.find({
      _id: { $in: classes.ApproveStudent ?? [] },
      finalReportStatus: { $eq: "Yes" },
    })
      .select(
        "studentFirstName studentMiddleName studentLastName studentROLLNO studentGRNO studentGender finalReport"
      )
      .populate({
        path: "finalReport",
      })
      .lean()
      .exec();
    const previous_students = await StudentPreviousData.find({
      finalReportStatus: { $eq: "Yes" },
      studentClass: { $in: `${classes._id}` },
      batches: { $eq: `${classes.batch?._id}` },
      student: { $in: classes.ApproveStudent ?? [] },
    })
      .select("studentROLLNO finalReport")
      .populate({
        path: "finalReport",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGRNO studentGender",
        },
      })
      .lean()
      .exec();
    let prev_stu = [];
    for (let stud of previous_students) {
      let obj = {
        _id: stud.finalReport?.[0].student._id,
        studentROLLNO: stud.studentROLLNO,
        studentFirstName: stud.finalReport?.[0].student.studentFirstName,
        studentMiddleName: stud.finalReport?.[0].student.studentMiddleName,
        studentLastName: stud.finalReport?.[0].student.studentLastName,
        studentGender: stud.finalReport?.[0].student.studentGender,
        studentGRNO: stud.finalReport?.[0].student.studentGRNO,
        finalReport: [
          {
            _id: stud.finalReport?.[0]._id,
            student: stud.finalReport?.[0].student._id,
            classId: stud.finalReport?.[0].classId,
            totalFinalExam: stud.finalReport?.[0].totalFinalExam,
            totalOtherExam: stud.finalReport?.[0].totalOtherExam,
            totalGraceExam: stud.finalReport?.[0].totalGraceExam,
            totalTotalExam: stud.finalReport?.[0].totalTotalExam,
            totalPercentage: stud.finalReport?.[0].totalPercentage,
            attendance: stud.finalReport?.[0].attendance,
            attendanceTotal: stud.finalReport?.[0].attendanceTotal,
            attendancePercentage: stud.finalReport?.[0].attendancePercentage,
            passStatus: stud.finalReport?.[0].passStatus,
            behaviourStar: stud.finalReport?.[0].behaviourStar,
            behaviourImprovement: stud.finalReport?.[0].behaviourImprovement,
            behaviourLack: stud.finalReport?.[0].behaviourLack,
            totalCutoff: stud.finalReport?.[0].totalCutoff,
            createdAt: stud.finalReport?.[0].createdAt,
            subjects: stud.finalReport?.[0].subjects,
          },
        ],
      };
      prev_stu.push(obj);
    }
    let students = [...current_stuents, ...prev_stu];
    students.sort(function (st1, st2) {
      return parseInt(st1.studentROLLNO) - parseInt(st2.studentROLLNO);
    });
    return res.status(200).send({
      message: "All student zip report card",
      report_zip: students,
      necessary_data: {
        institute: classes?.institute,
        classTeacher: classes?.classTeacher,
        batchName: classes?.batch?.batchName,
        className: classes?.className,
        classTitle: classes?.classTitle,
        gradeToggle: classes?.finalReportsSettings?.gradeMarks,
        aggregate_passing_percentage:
          classes?.finalReportsSettings?.aggregatePassingPercentage,
      },
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

//for malicious activit of student exam time
exports.createExamMaliciousActivity = async (req, res) => {
  try {
    const { sid } = req.params;
    const { reason, seid, subId } = req.body;
    const seating_sequence = await Seating.findById(seid).populate({
      path: "exam",
      select: "department _id",
    });
    const malicious = new ExamMalicious({
      reason,
      student: sid,
      seating: seid,
      subject: subId,
      exam: seating_sequence?.exam?._id,
      department: seating_sequence?.exam?.department,
    });
    seating_sequence.malicicous.push(malicious?._id);
    await Promise.all([malicious.save(), seating_sequence.save()]);
    res
      .status(201)
      .send({ message: "Mark malicious activity of student", access: true });
    const exam = await Exam.findById(seating_sequence?.exam?._id);
    exam.malicicous.push(malicious?._id);
    const subject = await Subject.findById(subId);
    subject.malicicous.push(malicious?._id);
    const department = await Department.findById(
      seating_sequence?.exam?.department
    );
    department.malicicous.push(malicious?._id);
    await Promise.all([exam.save(), subject.save(), department.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.getExamMaliciousActivity = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug to call api! need to fix it soon.",
        access: true,
      });
    const malicious = await ExamMalicious.find({
      department: { $eq: `${did}` },
    })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO",
      })
      .select("student reason created_at")
      .sort("-created_at")
      .lean()
      .exec();
    res.status(200).send({
      message: "All malicious activity of student",
      malicious,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

//for grading system from examination section
exports.createGradeSystem = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug to call api! need to fix it soon.",
        access: true,
      });
    const department = await Department.findById(did);
    const n_grades = new GradeSystem({
      grade_type: req.body.grade_type,
      grade_count: req.body.grade_count,
      department: did,
    });
    n_grades.grades = req.body.grades;
    department.grade_system.push(n_grades._id);

    await Promise.all([n_grades.save(), department.save()]);
    res.status(201).send({
      message: "Add new grade type in department 😋😊",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getCustomGradeSystem = async (req, res) => {
  try {
    const custom_grades = await GradeSystem.find({
      grade_insert: {
        $ne: "CUSTOM",
      },
    });
    res.status(201).send({
      message: "All custom grades list 😋😊",
      custom_grades,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

