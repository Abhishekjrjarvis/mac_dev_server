const SubjectMaster = require("../../models/SubjectMaster");
const SubjectMasterQuestion = require("../../models/MCQ/SubjectMasterQuestion");
const SubjectMasterTestSet = require("../../models/MCQ/SubjectMasterTestSet");
const StudentTestSet = require("../../models/MCQ/StudentTestSet");
const Assignment = require("../../models/MCQ/Assignment");
const StudentAssignment = require("../../models/MCQ/StudentAssignment");
const Subject = require("../../models/Subject");
const Student = require("../../models/Student");
const Department = require("../../models/Department");
const Batch = require("../../models/Batch");
const Class = require("../../models/Class");
const ClassMaster = require("../../models/ClassMaster");
const SubjectMarks = require("../../models/Marks/SubjectMarks");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Exam = require("../../models/Exam");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const {
  dateTimeComparison,
  timeComparison,
} = require("../../Utilities/timeComparison");
const { uploadDocFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

exports.getQuestion = async (req, res) => {
  try {
    const subjectMaster = await SubjectMaster.findById(req.params.smid)
      .populate({
        path: "allQuestion",
        match: {
          subjectMaster: { $eq: req.params.smid },
          classMaster: { $eq: req.params.cmid },
        },
        select: "questions",
      })
      .select("allQuestion")
      .lean()
      .exec();

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem = (getPage - 1) * itemPerPage;
    const endItem = startItem + itemPerPage;

    const filterFunction = (questions, startItem, endItem) => {
      const limitQuestions = questions.slice(startItem, endItem);
      const quest = [];
      limitQuestions?.forEach((que) => {
        quest.push({
          questionSNO: que?.questionSNO,
          questionNumber: que?.questionNumber,
          questionDescription: que?.questionDescription,
          questionImage: que?.questionImage,
        });
      });
      return quest;
    };

    if (subjectMaster?.allQuestion) {
      const quest = filterFunction(
        subjectMaster?.allQuestion[0]?.questions,
        startItem,
        endItem
      );
      res.status(200).send({
        message: "all questions",
        questions: quest,
      });
    } else {
      res.status(200).send({
        message: "not questions",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const questions = await SubjectMasterQuestion.findOne({
      subjectMaster: req.params.smid,
      classMaster: req.params.cmid,
    });

    if (!questions) {
      const newQuestion = new SubjectMasterQuestion({
        subjectMaster: req.params.smid,
        classMaster: req.params.cmid,
      });
      const master = await SubjectMaster.findById(req.params.smid);
      master.allQuestion?.push(newQuestion._id);
      newQuestion.questions.push({ ...req.body });
      await Promise.all([newQuestion.save(), master.save()]);
      res.status(201).send({ message: "queston is created" });
    } else {
      questions.questions.push({ ...req.body });
      await questions.save();
      res.status(201).send({ message: "queston is created" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getQuestionAddTestSet = async (req, res) => {
  try {
    const subjectMaster = await SubjectMaster.findById(req.params.smid)
      .populate({
        path: "allQuestion",
        match: {
          subjectMaster: { $eq: req.params.smid },
          classMaster: { $eq: req.params.cmid },
        },
        select: "questions",
      })
      .select("allQuestion")
      .lean()
      .exec();

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem = (getPage - 1) * itemPerPage;
    const endItem = startItem + itemPerPage;

    const filterFunction = (questions, startItem, endItem) => {
      const limitQuestions = questions.slice(startItem, endItem);
      return limitQuestions;
    };

    if (subjectMaster?.allQuestion) {
      const quest = filterFunction(
        subjectMaster?.allQuestion[0]?.questions,
        startItem,
        endItem
      );
      res.status(200).send({
        message: "all questions for add to test set",
        questions: quest,
      });
    } else {
      res.status(200).send({
        message: "not questions",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.saveTestSet = async (req, res) => {
  try {
    const master = await SubjectMaster.findById(req.params.smid);
    const classmaster = await ClassMaster.findById(req.params.cmid);
    const testSet = new SubjectMasterTestSet({
      testName: req.body?.testName,
      subjectMaster: req.params.smid,
      classMaster: req.params.cmid,
      testSubject: master?.subjectName,
      testTotalQuestion: req.body?.testTotalQuestion,
      testTotalNumber: req.body?.testTotalNumber,
      questions: req.body?.questions,
    });
    master.testSet?.push(testSet._id);
    classmaster.testSet?.push(testSet._id);
    await Promise.all([testSet.save(), master.save(), classmaster.save()]);
    res.status(201).send({ message: "queston test set is created" });
  } catch (e) {
    console.log(e);
  }
};

exports.allSaveTestSet = async (req, res) => {
  try {
    const classMaster = await ClassMaster.findById(req.params.cmid)
      .populate({
        path: "testSet",
        match: { subjectMaster: { $eq: req.params.smid } },
        select: "testName testTotalQuestion testTotalNumber",
      })
      .select("testSet");

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem = (getPage - 1) * itemPerPage;
    const endItem = startItem + itemPerPage;

    const filterFunction = (testSet, startItem, endItem) => {
      const testsetList = testSet.slice(startItem, endItem);
      return testsetList;
    };
    if (classMaster?.testSet?.length) {
      const testSetList = filterFunction(
        classMaster?.testSet,
        startItem,
        endItem
      );
      res.status(200).send({ message: "All test set", testSets: testSetList });
    } else {
      res.status(200).send({ message: "No any test set" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.oneTestSetDetail = async (req, res) => {
  try {
    const subjectMasterTestSet = await SubjectMasterTestSet.findById(
      req.params.tsid
    ).select("testName testTotalQuestion testTotalNumber questions");

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem = (getPage - 1) * itemPerPage;
    const endItem = startItem + itemPerPage;

    const filterFunction = (questions, startItem, endItem) => {
      const limitQuestions = questions.slice(startItem, endItem);
      const quest = [];
      limitQuestions?.forEach((que) => {
        quest.push({
          questionSNO: que?.questionSNO,
          questionNumber: que?.questionNumber,
          questionDescription: que?.questionDescription,
          questionImage: que?.questionImage,
        });
      });
      return quest;
    };
    if (subjectMasterTestSet?.questions?.length) {
      const testSetQuestion = filterFunction(
        subjectMasterTestSet?.questions,
        startItem,
        endItem
      );
      res.status(200).send({
        message: "All test set questions",
        testSetAllQuestions: testSetQuestion,
      });
    } else {
      res.status(200).send({ message: "No any test set questions" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.takeTestSet = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid).populate({
      path: "class",
      select: "ApproveStudent",
    });
    // console.log(subject?.class.ApproveStudent);
    const testSet = await SubjectMasterTestSet.findById(req.body?.tsid);
    testSet.testExamName = req.body?.testExamName;
    testSet.testDate = req.body?.testDate;
    testSet.testStart = `${req.body?.testStart.substr(
      0,
      5
    )}:00T${req.body?.testStart.substr(6, 2)}`;
    testSet.testEnd = `${req.body?.testEnd.substr(
      0,
      5
    )}:00T${req.body?.testEnd.substr(6, 2)}`;
    testSet.testDuration = req.body?.testDuration;
    await testSet.save();
    const obj = {
      subjectMaster: testSet?.subjectMaster,
      classMaster: testSet?.classMaster,
      subjectMasterTestSet: testSet._id,
      testName: testSet?.testName,
      testSubject: testSet?.testSubject,
      testTotalQuestion: testSet?.testTotalQuestion,
      testTotalNumber: testSet?.testTotalNumber,
      testDate: testSet?.testDate,
      testDuration: testSet?.testDuration,
      testEnd: testSet?.testEnd,
      testExamName: testSet?.testExamName,
      testStart: testSet?.testStart,
      questions: testSet?.questions,
    };
    for (stId of subject?.class?.ApproveStudent) {
      const student = await Student.findById(stId);
      const studentTestSet = new StudentTestSet(obj);
      studentTestSet.student = stId;
      student.testSet.push(studentTestSet._id);
      const notify = new StudentNotification({});
      notify.notifyContent = `New ${testSet.testExamName} Test is created for ${testSet.testSubject}`;
      notify.notifySender = subject._id;
      notify.notifyReceiever = student._id;
      student.notification.push(notify._id);
      notify.notifyBySubjectPhoto = subject._id;
      invokeFirebaseNotification(
        "Student Member Activity",
        notify,
        student.studentFirstName,
        student._id,
        "token"
      );
      await Promise.all([studentTestSet.save(), student.save(), notify.save()]);
    }
    res
      .status(200)
      .send({ message: "queston test set is assigned to student" });
  } catch (e) {
    console.log(e);
  }
};

exports.studentAllTestSet = async (req, res) => {
  try {
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem = (getPage - 1) * itemPerPage;
    const student = await Student.findById(req.params.sid).populate({
      path: "testSet",
      select:
        "testExamName testSubject testDate testStart testEnd testSetComplete",
      skip: startItem,
      limit: itemPerPage,
    });

    if (student?.testSet) {
      res.status(200).send({
        message: "All questions of test set",
        testsets: student?.testSet,
      });
    } else {
      res.status(204).send({
        message: "Not show test paper",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.studentOneTestSet = async (req, res) => {
  try {
    const testset = await StudentTestSet.findById(req.params.tsid)
      .select(
        "testExamName testSubject testDate testStart testEnd testTotalNumber testDuration"
      )
      .lean()
      .exec();

    if (testset) {
      res.status(200).send({
        message: "one test set details",
        testsets: testset,
      });
    } else {
      res.status(204).send({
        message: "Not show test details",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.studentTestSet = async (req, res) => {
  try {
    const studentTestSet = await StudentTestSet.findById(req.params.tsid)
      .select(
        "testExamName testDate testStart testEnd testDuration testSetLeftTime testTotalQuestion testTotalNumber questions"
      )
      .populate({
        path: "questions",
        select:
          "questionSNO questionNumber questionDescription questionImage options",
      });
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    const examTime = `${studentTestSet?.testDate}T${studentTestSet?.testStart}`;
    const entryTime = dateTimeComparison(JSON.stringify(currentDate), examTime);
    const exitTime = timeComparison(
      JSON.stringify(currentDate),
      studentTestSet?.testEnd
    );
    if (entryTime && exitTime) {
      studentTestSet.testSetAccess = true;

      await studentTestSet.save();
      res
        .status(200)
        .send({ message: "All questions of test set", studentTestSet });
    } else {
      res.status(200).send({
        message:
          "Not show test paper because you not attend before start and after end",
        currentDate: currentDate,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.studentTestSetQuestionSave = async (req, res) => {
  try {
    const testSet = await StudentTestSet.findById(req.params.tsid);
    for (test of testSet?.questions) {
      if (test?.questionSNO === req.body?.questionSNO) {
        test.givenAnswer.push(...req.body?.givenAnswer);
        const corr = [];
        const giv = [];
        for (correct of test.correctAnswer) {
          corr.push(correct.optionNumber);
        }
        for (given of req.body?.givenAnswer) {
          giv.push(given.optionNumber);
        }
        let flag = false;

        for (opt of giv) {
          if (corr.includes(opt)) {
            flag = true;
          } else {
            flag = false;
            break;
          }
        }
        if (flag) {
          testSet.testObtainMarks += test.questionNumber;
        }
      }
    }
    testSet.testSetLeftTime = req.body?.testSetLeftTime;

    await testSet.save();
    res.status(200).send({ message: "question answer is save" });
  } catch (e) {
    console.log(e);
  }
};

exports.studentTestSetComplete = async (req, res) => {
  try {
    // const currentDate = new Date();
    const studentTestSet = await StudentTestSet.findById(
      req.params.tsid
    ).select("testSetComplete");
    // const examTime = `${studentTestSet?.testDate}T${studentTestSet?.testStart}`;
    // const entryTime = dateTimeComparison(currentDate, examTime);
    // const outTime = timeComparison(currentDate, studentTestSet?.testEnd);
    if (!studentTestSet.testSetComplete) {
      studentTestSet.testSetComplete = req.body.testSetComplete;
      studentTestSet.testSetLeftTime = 0;
      await studentTestSet.save();
      res.status(200).send({
        message: "Student test set complete",
        status: studentTestSet.testSetComplete,
      });
    } else {
      res.status(200).send({
        message: "Student test set is not complete",
        status: studentTestSet.testSetComplete,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.studentTestSetResult = async (req, res) => {
  try {
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    const studentTestSet = await StudentTestSet.findById(
      req.params.tsid
    ).select(
      "testExamName testSubject testDate testStart testEnd testDuration testTotalNumber testObtainMarks testSetComplete questions"
    );
    let formatHour;
    if (studentTestSet?.testEnd.substr(9, 10) === "Pm")
      formatHour = `${
        +studentTestSet?.testEnd?.substr(0, 2) + 12
      }${studentTestSet?.testEnd.substr(2, 9)}`;
    else formatHour = studentTestSet?.testEnd;

    const examTime = `${studentTestSet?.testDate}T${formatHour}`;
    const entryTime = dateTimeComparison(JSON.stringify(currentDate), examTime);
    if (entryTime) {
      res
        .status(200)
        .send({ message: "Student test set results", studentTestSet });
    } else {
      res.status(200).send({
        message: "Not show test results before ending the exams",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.allTestSetExamCreationWithSubjectMaster = async (req, res) => {
  try {
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem = (getPage - 1) * itemPerPage;
    const subjectMaster = await SubjectMaster.findById(req.params.smid)
      .populate({
        path: "testSet",
        match: {
          subjectMaster: { $eq: req.params.smid },
          classMaster: { $eq: req.params.cmid },
        },
        select: "testExamName testName testTotalQuestion testTotalNumber",
        skip: startItem,
        limit: itemPerPage,
      })
      .select("testSet")
      .lean()
      .exec();

    if (subjectMaster?.testSet?.length) {
      res.status(200).send({
        message:
          "All test set list with respective class Master and subject Master",
        testSets: subjectMaster?.testSet,
      });
    } else {
      res.status(204).send({ message: "Not any test set is created" });
    }
  } catch (e) {
    console.log(e);
  }
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

    const allclasses = [
      ...new Set(req.body.allclasses?.map(JSON.stringify)),
    ].map(JSON.parse);

    for (let cid of allclasses) {
      for (let sub of req.body.allsubject) {
        const testSet = await SubjectMasterTestSet.findById(sub.testSetId);
        testSet.testExamName = req.body?.examName;
        testSet.testDate = sub?.date;
        testSet.testStart = `${sub?.startTime.substr(
          0,
          5
        )}:00T${sub?.startTime.substr(6, 2)}`;
        testSet.testEnd = `${sub?.endTime.substr(
          0,
          5
        )}:00T${sub?.endTime.substr(6, 2)}`;
        testSet.testDuration = sub?.duration;
        await testSet.save();
        const obj = {
          subjectMaster: testSet?.subjectMaster,
          classMaster: testSet?.classMaster,
          subjectMasterTestSet: testSet._id,
          testName: testSet?.testName,
          testSubject: testSet?.testSubject,
          testTotalQuestion: testSet?.testTotalQuestion,
          testTotalNumber: testSet?.testTotalNumber,
          testDate: testSet?.testDate,
          testDuration: testSet?.testDuration,
          testEnd: testSet?.testEnd,
          testExamName: testSet?.testExamName,
          testStart: testSet?.testStart,
          questions: testSet?.questions,
        };
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
              const studentTestSet = new StudentTestSet(obj);
              studentTestSet.student = student._id;
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
                    duration: sub.duration,
                    testSetId: studentTestSet._id,
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
                    duration: sub.duration,
                    testSetId: studentTestSet._id,
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
                  duration: sub.duration,
                  testSetId: studentTestSet._id,
                });
                student.subjectMarks.push(subjectMarks._id);
                await subjectMarks.save();
              }
              const notify = new StudentNotification({});
              notify.notifyContent = `New ${exam.examName} Exam is created for ${sub.subjectName} , check your members tab`;
              notify.notifySender = department._id;
              notify.notifyReceiever = student._id;
              student.notification.push(notify._id);
              notify.notifyByDepartPhoto = department._id;
              // invokeFirebaseNotification(
              //   "Student Member Activity",
              //   notify,
              //   student.studentFirstName,
              //   student._id,
              //   "token"
              // );
              await Promise.all([
                studentTestSet.save(),
                student.save(),
                notify.save(),
              ]);
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
              duration: sub.duration,
              testSetId: sub.testSetId,
              subjectMasterId: sub._id,
            });
          }
        }
      }
    }
    await Promise.all([exam.save(), batch.save(), department.save()]);
    res.status(201).send({ message: "Exam is created" });
  } catch (e) {
    console.log(e);
  }
};

// ========== for the Assignment related api====================

exports.getAssignment = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid)
      .populate({
        path: "assignments",
        select: "assignmentName dueDate totalCount submittedCount",
      })
      .select("assignments")
      .lean()
      .exec();

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem = (getPage - 1) * itemPerPage;
    const endItem = startItem + itemPerPage;

    const filterFunction = (assignments, startItem, endItem) => {
      const assignment = assignments.slice(startItem, endItem);
      return assignment;
    };

    if (subject?.assignments) {
      const assignments = filterFunction(
        subject?.assignments,
        startItem,
        endItem
      );
      res.status(200).send({
        message: "all assignment",
        assignments,
      });
    } else {
      res.status(200).send({
        message: "not any assignment",
        assignments: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid);
    const assignment = new Assignment(req.body);
    assignment.subject = req.params.sid;
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
      assignment.files.push(obj);
      await unlinkFile(file.path);
    }
    subject?.assignments?.push(assignment._id);
    await Promise.all([assignment.save(), subject.save()]);
    res.status(201).send({ message: "Assignment is created" });

    for (let stud of req.body?.students) {
      const stu = await Student.findById(stud);
      stu.totalAssigment += 1;
      const studentAssignment = new StudentAssignment({
        assignmentName: assignment?.assignmentName,
        student: stu._id,
        assignment: assignment?._id,
        subject: assignment?.subject,
        dueDate: assignment?.dueDate,
        descritpion: assignment?.descritpion,
        files: assignment?.files,
      });
      for (let test of assignment?.testSet) {
        const testSet = await SubjectMasterTestSet.findById(test);
        const obj = {
          student: stu._id,
          subjectMaster: testSet?.subjectMaster,
          classMaster: testSet?.classMaster,
          subjectMasterTestSet: testSet._id,
          testName: testSet?.testName,
          testSubject: testSet?.testSubject,
          testTotalQuestion: testSet?.testTotalQuestion,
          testTotalNumber: testSet?.testTotalNumber,
          questions: testSet?.questions,
        };
        const studentTestSet = new StudentTestSet(obj);
        studentAssignment.testSet.push(studentTestSet._id);
        await studentTestSet.save();
      }

      stu.assignments.push(studentAssignment._id);
      const notify = new StudentNotification({});
      notify.notifyContent = `New ${studentAssignment.assignmentName} is created for ${sub.subjectName} , check your members tab`;
      notify.notifySender = subject._id;
      notify.notifyReceiever = stu._id;
      stu.notification.push(notify._id);
      notify.notifyBySubjectPhoto = subject._id;
      await Promise.all([studentAssignment.save(), stu.save(), notify.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getOneAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.aid)
      .populate({
        path: "submittedStudent",
        populate: {
          path: "assignments",
          match: { assignment: { $eq: `${req.params.aid}` } },
          select: "submmittedDate",
        },
        select:
          "studentFirstName studentMiddleName studentLastName studentROLLNO photoId studentProfilePhoto assignments",
      })
      .select("dueDate totalCount submittedCount submittedStudent")
      .lean()
      .exec();

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem = (getPage - 1) * itemPerPage;
    const endItem = startItem + itemPerPage;

    const filterFunction = (students, startItem, endItem) => {
      const submitStudent = students.slice(startItem, endItem);
      const stud = [];

      for (oneStudent of submitStudent) {
        const obj = {
          studentFirstName: "",
          studentMiddleName: "",
          studentLastName: "",
          studentROLLNO: "",
          photoId: "",
          studentProfilePhoto: "",
          assignmentSubmittedDate: "",
        };
        obj.studentFirstName = oneStudent.studentFirstName;
        obj.studentMiddleName = oneStudent?.studentMiddleName;
        obj.studentLastName = oneStudent.studentLastName;
        obj.studentROLLNO = oneStudent.studentROLLNO;
        obj.photoId = oneStudent.photoId;
        obj.studentProfilePhoto = oneStudent.studentProfilePhoto;
        obj.assignmentSubmittedDate =
          oneStudent?.assignments?.[0]?.submmittedDate;
        stud.push(obj);
      }
      return stud;
    };

    const oneAssignmentStudents = [];
    if (assignment?.submittedStudent) {
      oneAssignmentStudents.push(
        ...filterFunction(assignment?.submittedStudent, startItem, endItem)
      );
    }
    const submittedStudent = {
      dueDate: assignment?.dueDate,
      totalCount: assignment?.totalCount,
      submittedCount: assignment?.submittedCount,
      submittedStudent: oneAssignmentStudents,
    };
    res.status(200).send({
      message: "All Submitted Student",
      submittedStudent,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getOneAssignmentOneStudentDetail = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "assignments",
        match: { assignment: { $eq: `${req.params.aid}` } },
        populate: {
          path: "testSet",
          select: "testTotalQuestion testTotalNumber testName",
        },
        select:
          "assignmentName dueDate studentDescritpion studentFiles submmittedDate testSet assignmentSubmit",
      })
      .select(
        "studentFirstName studentMiddleName studentLastName studentROLLNO assignments"
      );
    res.status(200).send({
      message: "All Submitted Student",
      studentAssignment: student,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getOneAssignmentOneStudentCompleteAssignment = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "assignments",
        match: { assignment: { $eq: `${req.params.aid}` } },
      })
      .select("assignments");

    const assignment = await StudentAssignment.findById(
      student?.assignments[0]._id
    );
    assignment.assignmentSubmit = req.body.assignmentSubmit;
    await assignment.save();
    res.status(200).send({
      message: "Assignment complete successfully",
    });
  } catch (e) {
    console.log(e);
  }
};

//=============for the Student Side===================

exports.getStudentAssignment = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "assignments",
        populate: {
          path: "subject",
          select: "subjectName",
        },
        select:
          "assignmentName dueDate assignmentSubmitRequest assignmentSubmit",
      })
      .select("assignments totalAssigment submittedAssigment")
      .lean()
      .exec();

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem = (getPage - 1) * itemPerPage;
    const endItem = startItem + itemPerPage;

    const filterFunction = (assignments, startItem, endItem) => {
      const assignment = assignments.slice(startItem, endItem);
      return assignment;
    };

    if (student?.assignments) {
      const assignments = filterFunction(
        student?.assignments,
        startItem,
        endItem
      );
      res.status(200).send({
        message: "all assignment",
        assignmentList: {
          totalAssigment: student?.totalAssigment,
          submittedAssigment: student?.submittedAssigment,
          assignments: assignments,
        },
      });
    } else {
      res.status(200).send({
        message: "not any assignment",
        assignmentList: {
          totalAssigment: student?.totalAssigment,
          submittedAssigment: student?.submittedAssigment,
          assignments: [],
        },
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getStudentOneAssignmentDetail = async (req, res) => {
  try {
    const assignment = await StudentAssignment.findById(req.params.aid)
      .populate({
        path: "testSet",
        select: "testTotalQuestion testTotalNumber testName",
      })
      .populate({
        path: "subject",
        select: "subjectName",
      })
      .select(
        "assignmentName dueDate descritpion testSet files assignmentSubmitRequest studentDescritpion studentFiles submmittedDate"
      )
      .lean()
      .exec();
    res.status(200).send({
      message: "All Submitted Student",
      assignment,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getStudentOneAssignmentSubmit = async (req, res) => {
  try {
    const assignment = await StudentAssignment.findById(req.params.aid);
    assignment.assignmentSubmitRequest = req.body?.assignmentSubmitRequest;
    assignment.studentDescritpion = req.body?.studentDescritpion;
    assignment.submmittedDate = req.body?.submmittedDate;
    assignment.assignmentSubmitRequest = req.body?.assignmentSubmitRequest;
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
      assignment.studentFiles.push(obj);
      await unlinkFile(file.path);
    }
    const student = await Student.findById(assignment.student);
    student.submittedAssigment += 1;
    const subjectAssignment = await Assignment.findById(assignment.assignment);
    subjectAssignment.submittedStudent.push(student._id);
    if (req.body?.testSet) {
      const studentTestset = await StudentTestSet.findById(req.body?.testSet);
      studentTestset.testSetComplete = true;
      await studentTestset.save();
    }
    await Promise.all([
      assignment.save(),
      student.save(),
      subjectAssignment.save(),
    ]);
    res.status(200).send({
      message: "Assignment is submitted",
    });
  } catch (e) {
    console.log(e);
  }
};
