const SubjectMaster = require("../../models/SubjectMaster");
const SubjectMasterQuestion = require("../../models/MCQ/SubjectMasterQuestion");
const SubjectMasterTestSet = require("../../models/MCQ/SubjectMasterTestSet");
const StudentTestSet = require("../../models/MCQ/StudentTestSet");
const Subject = require("../../models/Subject");
const Student = require("../../models/Student");
// const StudentNotification = require("../../models/StudentNotification");

const {
  dateTimeComparison,
  timeComparison,
} = require("../../Utilities/timeComparison");

exports.getQuestion = async (req, res) => {
  try {
    const subjectMaster = await SubjectMaster.findById(req.params.smid)
      .populate({
        path: "allQuestion",
        populate: {
          path: "questions",
          select:
            "questionSNO questionNumber questionDescription questionImage",
        },
        select: "questions",
      })
      .select("allQuestion")
      .lean()
      .exec();

    const questions = [];

    res.status(200).send({
      message: "all questions",
      questions: subjectMaster?.allQuestion?.questions,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.addQuestion = async (req, res) => {
  try {
    const questions = await SubjectMasterQuestion.findOne({
      subjectMaster: req.params.smid,
    });

    if (!questions) {
      const newQuestion = new SubjectMasterQuestion({
        subjectMaster: req.params.smid,
      });
      console.log("here");

      const master = await SubjectMaster.findById(req.params.smid);
      master.allQuestion = newQuestion._id;
      newQuestion.questions.push({ ...req.body });
      await Promise.all([newQuestion.save(), master.save()]);
      res.status(201).send({ message: "queston is created" });
    } else {
      questions.questions.push({ ...req.body });
      console.log("no here");

      await questions.save();
      res.status(201).send({ message: "queston is created" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.saveTestSet = async (req, res) => {
  try {
    const master = await SubjectMaster.findById(req.params.smid);
    const testSet = new SubjectMasterTestSet({
      testName: req.body?.testName,
      subjectMaster: req.params.smid,
      testSubject: master?.subjectName,
      testTotalQuestion: req.body?.testTotalQuestion,
      testTotalNumber: req.body?.testTotalNumber,
      questions: req.body?.questions,
    });
    master.testSet = testSet._id;
    await Promise.all([testSet.save(), master.save()]);
    res.status(201).send({ message: "queston test set is created" });
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
    const testSet = await SubjectMasterTestSet.findById(req.body?.smtid);
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
    for (stId of subject?.class?.ApproveStudent) {
      const student = await Student.findById(stId);
      const studentTestSet = new StudentTestSet(...testSet);
      student.testSet.push(studentTestSet._id);
      // const notify = new StudentNotification({});
      // notify.notifyContent = `New ${exam.examName} Exam is created for ${sub.subjectName} , check your members tab`;
      // notify.notifySender = department._id;
      // notify.notifyReceiever = student._id;
      // student.notification.push(notify._id);
      // notify.notifyByDepartPhoto = department._id;
      // invokeFirebaseNotification(
      //   "Student Member Activity",
      //   notify,
      //   student.studentFirstName,
      //   student._id,
      //   "token"
      // );
      await Promise.all([studentTestSet.save(), student.save()]);
    }

    res
      .status(200)
      .send({ message: "queston test set is assigned to student" });
  } catch (e) {
    console.log(e);
  }
};

exports.studentTestSet = async (req, res) => {
  try {
    const currentDate = new Date();
    const studentTestSet = await StudentTestSet(req.params.stid)
      .select(
        "testExamName testDate testStart testEnd testDuration testTotalQuestion testTotalNumber questions"
      )
      .populate({
        path: "questions",
        select:
          "questionSNO questionNumber questionDescription questionImage options",
      });
    const examTime = `${studentTestSet?.testDate}T${studentTestSet?.testStart}`;
    const entryTime = dateTimeComparison(currentDate, examTime);
    const outTime = timeComparison(currentDate, studentTestSet?.testEnd);
    if (entryTime && outTime) {
      studentTestSet.studentTestSet = true;
      await studentTestSet.save();
      res
        .status(200)
        .send({ message: "All questions of test set", studentTestSet });
    } else {
      res.status(204).send({
        message: "Not show test paper",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.studentTestSetQuestionSave = async (req, res) => {
  try {
    const testSet = await StudentTestSet.findById(req.params.stid);
    for (test of testSet?.questions) {
      if (test?.questionSNO === req.body?.questionSNO) {
        test.givenAnswer = req.body?.givenAnswer;
        if (test.correctAnswer === req.body?.givenAnswer)
          test.testObtainMarks += test.questionNumber;
        await testSet.save();
      }
    }
    res.status(200).send({ message: "question answer is save" });
  } catch (e) {
    console.log(e);
  }
};

exports.studentTestSetResult = async (req, res) => {
  try {
    const currentDate = new Date();
    const studentTestSet = await StudentTestSet(req.params.stid).select(
      "testExamName testSubject testDate testStart testEnd testDuration testTotalNumber testObtainMarks"
    );
    const examTime = `${studentTestSet?.testDate}T${studentTestSet?.testStart}`;
    const entryTime = dateTimeComparison(currentDate, examTime);
    const outTime = timeComparison(currentDate, studentTestSet?.testEnd);
    if (entryTime && outTime) {
      res
        .status(200)
        .send({ message: "Student test set results", studentTestSet });
    } else {
      res.status(204).send({
        message: "Not show test results before ending the exams",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subjectMasterAllTestSet = async (req, res) => {
  try {
    const subjectMaster = await SubjectMaster.findById(req.params.smid)
      .populate({
        path: "testSet",
        select: "testExamName testName testTotalQuestion testTotalNumber",
      })
      .select("testSet")
      .lean()
      .exec();

    if (subjectMaster?.testSet?.length) {
      res.status(200).send({
        message: "All test set list",
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
              await Promise.all([student.save(), notify.save()]);
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
    res.status(201).send({ message: "Exam is created" });
  } catch (e) {
    console.log(e);
  }
};
