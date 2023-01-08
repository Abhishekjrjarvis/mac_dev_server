const SubjectMaster = require("../../models/SubjectMaster");
const SubjectQuestion = require("../../models/MCQ/SubjectQuestion");
const SubjectMasterQuestion = require("../../models/MCQ/SubjectMasterQuestion");
const SubjectMasterTestSet = require("../../models/MCQ/SubjectMasterTestSet");
const AllotedTestSet = require("../../models/MCQ/AllotedTestSet");
const StudentTestSet = require("../../models/MCQ/StudentTestSet");
const Assignment = require("../../models/MCQ/Assignment");
const StudentAssignment = require("../../models/MCQ/StudentAssignment");
const Subject = require("../../models/Subject");
const Student = require("../../models/Student");
const Department = require("../../models/Department");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Batch = require("../../models/Batch");
const Class = require("../../models/Class");
const ClassMaster = require("../../models/ClassMaster");
const SubjectMarks = require("../../models/Marks/SubjectMarks");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Exam = require("../../models/Exam");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const {
  dateTimeComparison,
  timeComparison,
} = require("../../Utilities/timeComparison");
const { uploadDocFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const User = require("../../models/User");
const { file_to_aws } = require("../../Utilities/uploadFileAws");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

// ================================== GET  UNIVERSAL INSTITUTE ALL MCQ FOR ALL USER====================

exports.getUniversalSubjectProfile = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send subject id to perform task";
    const subject = await Subject.findById(req.params.sid)
      .populate({
        path: "universalDepartment",
        select: "dName",
      })
      .populate({
        path: "universalClass",
        select: "className classTitle masterClassName",
      })
      .populate({
        path: "universalSubject",
        select: "subjectName subjectMasterName",
      })
      .populate({
        path: "class",
        select: "masterClassName",
      })
      .select(
        "universalDepartment universalClass universalSubject subjectMasterName class"
      )
      .lean()
      .exec();
    if (!subject) {
      res
        .status(200)
        .send({ message: "This subject id is no more valid... 😎😎" });
    } else {
      // const subEncrypt = await encryptionPayload(subject);
      res
        .status(200)
        .send({ message: "All universal related detial 🧨🧨", subject });
    }
  } catch (e) {
    res.status(200).send({ message: e });
    // console.log(e);
  }
};

exports.getUniversalDepartment = async (req, res) => {
  try {
    const universalInstitute = await InstituteAdmin.find({
      isUniversal: { $nin: ["Not Assigned"] },
    })
      .populate({
        path: "depart",
        select: "dName",
      })
      .select("depart")
      .lean()
      .exec();
    if (!universalInstitute?.[0]?.depart?.length) {
      res.status(200).send({
        message: "This universal institute not assign till now... 😎😎",
        universalDepartment: [],
      });
    } else {
      // const uEncrypt = await encryptionPayload(universalInstitute[0].depart);
      res.status(200).send({
        message: "All universal institute related department 🧨🧨",
        universalDepartment: universalInstitute[0].depart,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getUniversalClass = async (req, res) => {
  try {
    if (!req.params.did) throw "Please send department id to perform task";
    const universalDepartment = await Department.findById(req.params.did)
      .populate({
        path: "class",
        select: "className classTItle masterClassName",
      })
      .select("class")
      .lean()
      .exec();
    if (!universalDepartment) {
      res.status(200).send({
        message: "This universal department not created till now... 😎😎",
        universalClass: [],
      });
    } else {
      // const cEncrypt = await encryptionPayload(universalDepartment.class);
      res.status(200).send({
        message: "All universal department related classes 🧨🧨",
        universalClass: universalDepartment.class,
      });
    }
  } catch (e) {
    res.status(200).send({ message: e });
    // console.log(e);
  }
};

exports.getUniversalSubject = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";
    const universalClass = await Class.findById(req.params.cid)
      .populate({
        path: "subject",
        select: "subjectName subjectMasterName",
      })
      .select("subject")
      .lean()
      .exec();
    if (!universalClass) {
      res.status(200).send({
        message: "This universal class not created till now... 😎😎",
        universalSubject: [],
      });
    } else {
      // const subEncrypt = await encryptionPayload(universalClass.subject);
      res.status(200).send({
        message: "All universal class related subjects 🧨🧨",
        universalSubject: universalClass.subject,
      });
    }
  } catch (e) {
    res.status(200).send({ message: e });
    // console.log(e);
  }
};

exports.updateUniversalSubjectProfile = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send subject id to perform task";
    await Subject.findByIdAndUpdate(req.params.sid, req.body);
    res.status(200).send({
      message: "Universal mcq selected option change successfully...🤗🤗🤗",
    });
  } catch (e) {
    res.status(200).send({ message: e });
    console.log(e);
  }
};

// // =============================== GET UNIVERSAL QUESTION WITH OWN =================

exports.getQuestion = async (req, res) => {
  try {
    if (req.query?.ucmid && req.query?.usmid) {
      // console.log(req.query?.usmid, req.query?.ucmid);
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const skipItem = (getPage - 1) * itemPerPage;
      if (req.query.search) {
        const uniSubjectMaster = await SubjectMasterQuestion.findOne({
          subjectMaster: { $eq: req.query.usmid },
          classMaster: { $eq: req.query.ucmid },
        });
        // console.log(uniSubjectMaster);
        const subjectMaster = await SubjectMasterQuestion.findOne({
          subjectMaster: { $eq: req.params.smid },
          classMaster: { $eq: req.params.cmid },
        });

        // const allIds = [];
        // if (uniSubjectMaster) {
        //   if (subjectMaster) {
        //     allIds = [`${uniSubjectMaster._id}`, `${subjectMaster._id}`];
        //   } else {
        //     allIds = [`${uniSubjectMaster._id}`];
        //   }
        // } else {
        //   allIds = subjectMaster.questions;
        // }

        const subjectQuestion = await SubjectQuestion.find({
          $and: [
            {
              questionDescription: { $regex: req.query.search, $options: "i" },
            },
            {
              relatedSubject: {
                $in: [`${uniSubjectMaster._id}`, `${subjectMaster._id}`],
              },
            },
          ],
        })
          .sort("-createdAt")
          .skip(skipItem)
          .limit(itemPerPage)
          .select(
            "questionSNO questionNumber questionDescription questionImage isUniversal"
          )
          .lean()
          .exec();
        if (subjectQuestion?.length) {
          // const qEncrypt = await encryptionPayload(subjectQuestion);
          res.status(200).send({
            message: "all questions",
            questions: subjectQuestion,
          });
        } else {
          res.status(200).send({
            message: "not questions",
            questions: [],
          });
        }
      } else {
        const uniSubjectMaster = await SubjectMasterQuestion.findOne({
          subjectMaster: { $eq: req.query.usmid },
          classMaster: { $eq: req.query.ucmid },
        });
        const subjectMaster = await SubjectMasterQuestion.findOne({
          subjectMaster: { $eq: req.params.smid },
          classMaster: { $eq: req.params.cmid },
        });

        let allIds = [];
        if (uniSubjectMaster) {
          if (subjectMaster) {
            allIds = [`${uniSubjectMaster._id}`, `${subjectMaster._id}`];
          } else {
            allIds = [`${uniSubjectMaster._id}`];
          }
        } else {
          allIds = subjectMaster.questions;
        }
        if (uniSubjectMaster) {
          const subjectQuestion = await SubjectQuestion.find({
            relatedSubject: {
              $in: allIds,
            },
          })
            .sort("-createdAt")
            .skip(skipItem)
            .limit(itemPerPage)
            .select(
              "questionSNO questionNumber questionDescription questionImage isUniversal"
            )
            .lean()
            .exec();
          if (subjectQuestion?.length) {
            // const qEncrypt = await encryptionPayload(subjectQuestion);
            res.status(200).send({
              message: "all questions",
              questions: subjectQuestion,
            });
          } else {
            res.status(200).send({
              message: "not questions",
              questions: [],
            });
          }
        } else {
          const subjectQuestion = await SubjectQuestion.find({
            _id: { $in: allIds },
          })
            .sort("-createdAt")
            .skip(skipItem)
            .limit(itemPerPage)
            .select(
              "questionSNO questionNumber questionDescription questionImage isUniversal"
            )
            .lean()
            .exec();

          if (subjectQuestion?.length) {
            // const qEncrypt = await encryptionPayload(subjectQuestion);
            res.status(200).send({
              message: "all questions",
              questions: subjectQuestion,
            });
          } else {
            res.status(200).send({
              message: "not questions",
              questions: [],
            });
          }
        }
      }
    } else {
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const skipItem = (getPage - 1) * itemPerPage;
      if (req.query.search) {
        const subjectMaster = await SubjectMasterQuestion.findOne({
          subjectMaster: { $eq: req.params.smid },
          classMaster: { $eq: req.params.cmid },
        });
        const subjectQuestion = await SubjectQuestion.find({
          $and: [
            {
              questionDescription: { $regex: req.query.search, $options: "i" },
            },
            {
              _id: { $in: subjectMaster?.questions },
            },
          ],
        })
          .sort("-createdAt")
          .skip(skipItem)
          .limit(itemPerPage)
          .select(
            "questionSNO questionNumber questionDescription questionImage isUniversal"
          )
          .lean()
          .exec();

        if (subjectQuestion?.length) {
          // const qEncrypt = await encryptionPayload(subjectQuestion);
          res.status(200).send({
            message: "all questions",
            questions: subjectQuestion,
          });
        } else {
          res.status(200).send({
            message: "not questions",
            questions: [],
          });
        }
      } else {
        const subjectMaster = await SubjectMasterQuestion.findOne({
          subjectMaster: { $eq: req.params.smid },
          classMaster: { $eq: req.params.cmid },
        });

        const subjectQuestion = await SubjectQuestion.find({
          _id: { $in: subjectMaster?.questions },
        })
          .sort("-createdAt")
          .skip(skipItem)
          .limit(itemPerPage)
          .select(
            "questionSNO questionNumber questionDescription questionImage isUniversal"
          )
          .lean()
          .exec();

        if (subjectQuestion?.length) {
          // const qEncrypt = await encryptionPayload(subjectQuestion);
          res.status(200).send({
            message: "all questions",
            questions: subjectQuestion,
          });
        } else {
          res.status(200).send({
            message: "not questions",
            questions: [],
          });
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getOneQuestion = async (req, res) => {
  try {
    if (!req.params.qid) throw "Please send question id to perform task";
    const question = await SubjectQuestion.findById(req.params.qid)
      .select(
        "questionSNO questionNumber questionDescription questionImage.documentKey questionImage.documentName isUniversal options correctAnswer answerDescription answerImage.documentKey answerImage.documentName"
      )
      .lean()
      .exec();
    if (question) {
      // const qEncrypt = await encryptionPayload(question);
      res.status(200).send({
        message: "all questions",
        question,
      });
    } else {
      res.status(200).send({
        message: "not questions",
        question: {},
      });
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    // console.log(e);
  }
};

exports.addQuestion = async (req, res) => {
  try {
    // console.log(req?.files);
    // console.log(req.body);
    // console.log("this is only for answer image", req?.files["answerImage"]);
    // console.log("this is only asnwer image", req.answerImage);

    const questions = await SubjectMasterQuestion.findOne({
      subjectMaster: req.params.smid,
      classMaster: req.params.cmid,
    });
    const questionImage = [];
    const answerImage = [];
    for (let fileObject in req.files) {
      for (let singleFile of req.files[fileObject]) {
        const uploadedFile = await file_to_aws(singleFile);
        // console.log(uploadedFile);
        if (fileObject === "questionImage") questionImage.push(uploadedFile);
        else answerImage.push(uploadedFile);
      }
    }

    const createQuestion = {
      questionSNO: req.body.questionSNO,
      questionNumber: +req.body.questionNumber,
      questionDescription: req.body.questionDescription,
      options: JSON.parse(req.body.options),
      correctAnswer: JSON.parse(req.body.correctAnswer),
      answerDescription: req.body.answerDescription,
      questionImage: questionImage,
      answerImage: answerImage,
      isUniversal: false,
      relatedSubject: "",
    };
    if (!questions) {
      const clsMaster = await ClassMaster.findById(req.params.cmid).populate(
        "institute"
      );
      const universal =
        clsMaster.institute.isUniversal === "Not Assigned" ? false : true;
      const newQuestion = new SubjectMasterQuestion({
        subjectMaster: req.params.smid,
        classMaster: req.params.cmid,
        institute: clsMaster.institute,
        isUniversal: universal,
      });
      createQuestion.isUniversal = universal;
      createQuestion.relatedSubject = newQuestion._id;
      const subjectQuestion = new SubjectQuestion({ ...createQuestion });
      const master = await SubjectMaster.findById(req.params.smid);
      master.allQuestion?.push(newQuestion._id);
      newQuestion.questionCount += 1;
      newQuestion.questions.push(subjectQuestion._id);
      await Promise.all([
        subjectQuestion.save(),
        newQuestion.save(),
        master.save(),
      ]);
      // Add Another Encryption
      res.status(201).send({
        message: "queston is created",
        question: {
          questionSNO: subjectQuestion.questionSNO,
          questionNumber: subjectQuestion.questionNumber,
          questionDescription: subjectQuestion.questionDescription,
          questionImage: subjectQuestion.questionImage,
          _id: subjectQuestion._id,
        },
      });
    } else {
      createQuestion.isUniversal = questions.isUniversal;
      createQuestion.relatedSubject = questions._id;
      const subjectQuestion = new SubjectQuestion({ ...createQuestion });
      questions.questions.push(subjectQuestion._id);
      questions.questionCount += 1;
      await Promise.all([subjectQuestion.save(), questions.save()]);
      // Add Another Encryption
      res.status(201).send({
        message: "queston is created",
        question: {
          questionSNO: subjectQuestion.questionSNO,
          questionNumber: subjectQuestion.questionNumber,
          questionDescription: subjectQuestion.questionDescription,
          questionImage: subjectQuestion.questionImage,
          _id: subjectQuestion._id,
        },
      });
    }
    // res.status(201).send({ message: "queston is created", createQuestion });
  } catch (e) {
    console.log(e);
  }
};

exports.getQuestionAddTestSet = async (req, res) => {
  try {
    const subjectMaster = await SubjectMasterQuestion.findOne({
      subjectMaster: { $eq: req.params.smid },
      classMaster: { $eq: req.params.cmid },
    })
      .select("questionCount")
      .lean()
      .exec();
    // const getPage = req.query.page ? parseInt(req.query.page) : 1;
    // const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    // const startItem = (getPage - 1) * itemPerPage;
    // const endItem = startItem + itemPerPage;

    // const filterFunction = (questions, startItem, endItem) => {
    //   const limitQuestions = questions?.slice(startItem, endItem);
    //   return limitQuestions;
    // };
    if (subjectMaster) {
      // const quest = filterFunction(
      //   subjectMaster?.allQuestion[0]?.questions,
      //   startItem,
      //   endItem
      // );
      // const subEncrypt = await encryptionPayload(subjectMaster);
      res.status(200).send({
        message: "all questions for add to test set",
        subjectMaster,
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
    const classmaster = await ClassMaster.findById(req.params.cmid).populate(
      "institute"
    );
    const testSet = new SubjectMasterTestSet({
      testName: req.body?.testName,
      subjectMaster: req.params.smid,
      classMaster: req.params.cmid,
      institute: classmaster.institute,
      isUniversal:
        classmaster.institute.isUniversal === "Not Assigned" ? false : true,
      testSubject: master?.subjectName,
      testTotalQuestion: req.body?.testTotalQuestion,
      testTotalNumber: req.body?.testTotalNumber,
      questions: req.body?.questions,
    });
    master.testSet?.push(testSet._id);
    classmaster.testSet?.push(testSet._id);
    await Promise.all([testSet.save(), master.save(), classmaster.save()]);
    res.status(201).send({ message: "queston test set is created" });
    if (Array.isArray(req.body?.questions)) {
      req.body?.questions.forEach(async (questId) => {
        const que = await SubjectQuestion.findById(questId);
        que.assignTestSet.push(testSet._id);
        await que.save();
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.editSaveTestSet = async (req, res) => {
  try {
    if (!req.params.tsid) throw "Please send to test set id perform task";
    const testset = await SubjectMasterTestSet.findById(req.params.tsid);
    testset.testName = req.body?.testName;
    testset.testTotalQuestion = req.body?.testTotalQuestion;
    testset.testTotalNumber = req.body?.testTotalNumber;
    for (let questId of req.body?.deletedQuestions) {
      if (testset.questions?.includes(questId)) {
        const que = await SubjectQuestion.findById(questId);
        que.assignTestSet.pull(testset._id);
        await que.save();
        testset.questions.pull(questId);
      }
    }
    for (let questId of req.body?.questions) {
      if (!testset.questions?.includes(questId)) {
        const que = await SubjectQuestion.findById(questId);
        que.assignTestSet.push(testset._id);
        await que.save();
        testset.questions.push(questId);
      }
    }
    await testset.save();
    res.status(201).send({ message: "test set is edited" });
  } catch (e) {
    res.status(200).send({ message: e });
    console.log(e);
  }
};

exports.allSaveTestSet = async (req, res) => {
  try {
    if (req.query?.ucmid && req.query?.usmid) {
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const skipItem = (getPage - 1) * itemPerPage;
      const testset = await SubjectMasterTestSet.find({
        subjectMaster: { $in: [`${req.params.smid}`, `${req.query.usmid}`] },
        classMaster: { $in: [`${req.params.cmid}`, `${req.query.ucmid}`] },
      })
        .sort("-createdAt")
        .skip(skipItem)
        .limit(itemPerPage)
        .select("testName testTotalQuestion testTotalNumber isUniversal")
        .lean()
        .exec();

      if (testset?.length) {
        // const tEncrypt = await encryptionPayload(testset);
        res.status(200).send({ message: "All test set", testSets: testset });
      } else {
        res.status(200).send({ message: "No any test set", testSets: [] });
      }
    } else {
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const skipItem = (getPage - 1) * itemPerPage;
      const testset = await SubjectMasterTestSet.find({
        subjectMaster: { $eq: req.params.smid },
        classMaster: { $eq: req.params.cmid },
      })
        .sort("-createdAt")
        .skip(skipItem)
        .limit(itemPerPage)
        .select("testName testTotalQuestion testTotalNumber isUniversal")
        .lean()
        .exec();

      if (testset?.length) {
        // const tEncrypt = await encryptionPayload(testset);
        res.status(200).send({ message: "All test set", testSets: testset });
      } else {
        res.status(200).send({ message: "No any test set", testSets: [] });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.oneTestSetDetail = async (req, res) => {
  try {
    const subjectMasterTestSet = await SubjectMasterTestSet.findById(
      req.params.tsid
    );
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const skipItem = (getPage - 1) * itemPerPage;
    const subjectQuestion = await SubjectQuestion.find({
      _id: { $in: subjectMasterTestSet.questions },
    })
      .skip(skipItem)
      .limit(itemPerPage)
      .select(
        "questionSNO questionNumber questionDescription questionImage.documentKey questionImage.documentName"
      )
      .lean()
      .exec();

    if (subjectQuestion?.length) {
      // const qEncrypt = await encryptionPayload(subjectQuestion);
      res.status(200).send({
        message: "All test set questions",
        testSetAllQuestions: subjectQuestion,
      });
    } else {
      res.status(200).send({
        message: "No any test set questions",
        testSetAllQuestions: [],
      });
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
    const testSet = await SubjectMasterTestSet.findById(req.body?.tsid);
    const allotedSet = {
      testExamName: req.body?.testExamName,
      testTotalNumber: testSet.testTotalNumber,
      testDate: req.body?.testDate,
      testStart: `${req.body?.testStart.substr(
        0,
        5
      )}:00T${req.body?.testStart.substr(6, 2)}`,
      testEnd: `${req.body?.testEnd.substr(0, 5)}:00T${req.body?.testEnd.substr(
        6,
        2
      )}`,
      testDuration: req.body?.testDuration,
      assignTestSubject: req.params.sid,
      assignStudent: subject?.class?.ApproveStudent,
      subjectMasterTestSet: testSet._id,
    };
    const alloted = new AllotedTestSet(allotedSet);
    testSet.allotedTestSet.push(alloted._id);
    testSet.assignSubject.push(subject._id);
    subject.takeTestSet.push(testSet._id);
    subject.allotedTestSet.push(alloted._id);
    await Promise.all([alloted.save(), subject.save(), testSet.save()]);
    const studentTestObject = {
      subjectMaster: testSet?.subjectMaster,
      classMaster: testSet?.classMaster,
      subjectMasterTestSet: testSet._id,
      allotedTestSet: alloted._id,
      testName: testSet?.testName,
      testExamName: allotedSet?.testExamName,
      testSubject: testSet?.testSubject,
      testDate: allotedSet?.testDate,
      testStart: allotedSet?.testStart,
      testEnd: allotedSet?.testEnd,
      testDuration: allotedSet?.testDuration,
      testTotalQuestion: testSet?.testTotalQuestion,
      testTotalNumber: testSet?.testTotalNumber,
      questions: [],
      student: "",
    };
    for (let quest of testSet?.questions) {
      // another way of selecting item in array .option options.optionNumber options.image
      const getQuestion = await SubjectQuestion.findById(quest).select(
        "questionSNO questionNumber questionDescription questionImage options correctAnswer answerDescription answerImage isUniversal -_id"
      );
      studentTestObject.questions.push(getQuestion);
    }

    for (stId of subject?.class?.ApproveStudent) {
      const student = await Student.findById(stId);
      studentTestObject.student = stId;
      const user = await User.findById({ _id: `${student.user}` });
      const studentTestSet = new StudentTestSet(studentTestObject);
      student.testSet.push(studentTestSet._id);
      const notify = new StudentNotification({});
      notify.notifyContent = `New ${allotedSet.testExamName} Test is created for ${testSet.testSubject}`;
      notify.notify_hi_content = `नई ${allotedSet.testExamName} परीक्षा ${testSet.testSubject} के लिए बनाया गया है`;
      notify.notify_mr_content = `नई ${testSet.testSubject} साठी नवीन ${allotedSet.testExamName} चाचणी तयार केली आहे.`;
      notify.notifySender = subject._id;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      user.activity_tab.push(notify._id);
      student.notification.push(notify._id);
      notify.notifyBySubjectPhoto = subject._id;
      notify.notifyCategory = "MCQ";
      notify.redirectIndex = 6;
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "New MCQ Test Set",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([
        studentTestSet.save(),
        student.save(),
        notify.save(),
        user.save(),
      ]);
    }
    // const oEncrypt = await encryptionPayload(subjectTestObject);
    res.status(200).send({
      message: "queston test set is assigned to student",
      studentTestObject,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectAllotedTestSet = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid);
    if (subject?.allotedTestSet?.length) {
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const skipItem = (getPage - 1) * itemPerPage;
      const subjectTestSet = await AllotedTestSet.find({
        _id: { $in: subject.allotedTestSet },
      })
        .sort("-createdAt")
        .select("testTotalNumber testExamName testDate testStart testEnd")
        .skip(skipItem)
        .limit(itemPerPage)
        .lean()
        .exec();
      // const aEncrypt = await encryptionPayload(subjectTestSet);
      res.status(200).send({
        message: "all alloted testset list",
        allotedTestSet: subjectTestSet,
      });
    } else {
      res
        .status(200)
        .send({ message: "all alloted testset list", allotedTestSet: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subjectGivenStudentTestSet = async (req, res) => {
  try {
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const skipItem = (getPage - 1) * itemPerPage;
    const alloted = await AllotedTestSet.findById(req.params.atsid)
      .populate({
        path: "assignStudent",
        skip: skipItem,
        limit: itemPerPage,
        populate: {
          path: "testSet",
          match: {
            allotedTestSet: { $eq: `${req.params.atsid}` },
          },
          select: "testObtainMarks testSetAccess",
        },
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO testSet",
      })
      .select("assignStudent")
      .lean()
      .exec();
    if (alloted.assignStudent?.length) {
      // const allEncrypt = await encryptionPayload(alloted.assignStudent);
      res.status(200).send({
        message: "testset student list",
        studentList: alloted.assignStudent,
      });
    } else {
      res
        .status(200)
        .send({ message: "testset student list", studentList: [] });
    }
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
      options: { sort: { createdAt: -1 } },
    });

    if (student?.testSet) {
      // const testEncrypt = await encryptionPayload(student?.testSet);
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
        "testExamName testSubject testDate testStart testEnd testTotalNumber testDuration testObtainMarks testSetComplete"
      )
      .lean()
      .exec();
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    const examTime = `${testset?.testDate}T${testset?.testStart}`;
    const entryTime = dateTimeComparison(JSON.stringify(currentDate), examTime);
    const exitTime = timeComparison(
      JSON.stringify(currentDate),
      testset?.testEnd
    );
    let startExamTime = false;
    // console.log(currentDate.substr(11));
    console.log(entryTime, "sgfsdghs === ", exitTime);
    if (entryTime && !exitTime) {
      startExamTime = true;
    } else startExamTime = false;
    if (testset) {
      // Add Another Encryption
      res.status(200).send({
        message: "one test set details",
        testsets: testset,
        startExamTime,
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
        "testExamName testDate testStart testEnd testDuration testSetLeftTime testTotalQuestion testTotalNumber questions.questionNumber questions.questionDescription questions.questionImage.documentKey questions.questionImage.documentName questions.options questions.questionSNO questions.givenAnswer questions._id"
      )
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName studentProfilePhoto studentROLLNO",
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
    if (entryTime && !exitTime) {
      // if (true) {
      studentTestSet.testSetAccess = true;

      await studentTestSet.save();
      // const testEncrypt = await encryptionPayload(studentTestSet);
      res
        .status(200)
        .send({ message: "All questions of test set", studentTestSet });
    } else {
      // const testEncrypt = await encryptionPayload(currentDate);
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
    // console.log(testSet);
    for (test of testSet?.questions) {
      if (test?.questionSNO === req.body?.questionSNO) {
        if (test.givenAnswer?.length) {
          if (
            test.givenAnswer[0].optionNumber ===
            req.body?.givenAnswer[0]?.optionNumber
          ) {
            test.givenAnswer = [];
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
              testSet.testObtainMarks -= test.questionNumber;
            }
          } else {
            test.givenAnswer = [...req.body?.givenAnswer];
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
            } else {
              testSet.testObtainMarks -= test.questionNumber;
            }
          }
        } else {
          test.givenAnswer = [...req.body?.givenAnswer];
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
    }
    testSet.testSetLeftTime = req.body?.testSetLeftTime;
    await testSet.save();
    // console.log(testSet.testObtainMarks);
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
      // const statusEncrypt = await encryptionPayload(studentTestSet.testSetComplete);
      res.status(200).send({
        message: "Student test set complete",
        status: studentTestSet.testSetComplete,
      });
    } else {
      // const statusEncrypt = await encryptionPayload(studentTestSet.testSetComplete);
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
    // remove unwanted things
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
      // const eEncrypt = await encryptionPayload(studentTestSet);
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
      // const masterEncrypt = await encryptionPayload(subjectMaster?.testSet);
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
              const user = await User.findById({ _id: `${student.user}` });
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
              notify.notify_hi_content = `नई परीक्षा ${exam.examName} ${sub.subjectName} के लिए बनाई है | अपना सदस्य टैब देखे |`;
              notify.notify_mr_content = `${sub.subjectName} साठी नवीन ${exam.examName} परीक्षा तयार केली आहे, तुमचे सदस्य टॅब तपासा.`;
              notify.notifySender = department._id;
              notify.notifyReceiever = user._id;
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
                "New Online Exam",
                user._id,
                user.deviceToken,
                "Student",
                notify
              );
              //
              await Promise.all([
                studentTestSet.save(),
                student.save(),
                notify.save(),
                user.save(),
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
      .select("assignments")
      .lean()
      .exec();

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem =
      subject.assignments?.length - itemPerPage - (getPage - 1) * itemPerPage;
    const endItem = startItem + itemPerPage;
    const assign = subject.assignments;
    const filterFunction = (assgn, startItem, endItem) => {
      if (startItem <= 0) {
        if (endItem < 1) {
          const assignment = assgn?.slice(0, 0);
          return assignment;
        } else {
          const assignment = assgn?.slice(0, endItem);
          return assignment;
        }
      } else {
        const assignment = assgn?.slice(startItem, endItem);
        return assignment;
      }
    };

    const assignments = await Assignment.find({
      _id: { $in: filterFunction(assign, startItem, endItem) },
    })
      .select("assignmentName dueDate totalCount submittedCount checkedCount")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (assignments) {
      // const assignEncrypt = await encryptionPayload(assignments);
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
    // console.log(req.body);
    assignment.subject = req.params.sid;
    const students = JSON.parse(req.body.students);
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
        assignment.files.push(obj);
        await unlinkFile(file.path);
      }
    }
    subject?.assignments?.push(assignment._id);
    assignment.totalCount = students?.length;
    assignment.student?.push(...students);
    await Promise.all([assignment.save(), subject.save()]);
    res.status(201).send({ message: "Assignment is created" });

    for (let stud of students) {
      const stu = await Student.findById(stud);
      const user = await User.findById(`${stu.user}`);
      stu.totalAssignment += 1;
      stu.incompletedAssignment += 1;
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
      notify.notifyContent = `New ${studentAssignment.assignmentName} is created for ${subject.subjectName} , check your members tab`;
      notify.notify_hi_content = `नई ${studentAssignment.assignmentName} ${subject.subjectName} के लिए बनाई है | अपना सदस्य टैब देखे |`;
      notify.notify_mr_content = `${subject.subjectName} साठी नवीन ${studentAssignment.assignmentName} तयार केले आहे, तुमचे सदस्य टॅब तपासा.`;
      notify.notifySender = subject._id;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = stu._id;
      user.activity_tab.push(notify._id);
      stu.notification.push(notify._id);
      notify.notifyBySubjectPhoto = subject._id;
      notify.notifyCategory = "Assignment";
      notify.redirectIndex = 7;
      //
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "New Assignment",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      //
      await Promise.all([
        studentAssignment.save(),
        stu.save(),
        notify.save(),
        user.save(),
      ]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getOneAssignmentCount = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.aid)
      .select("assignmentName dueDate totalCount submittedCount checkedCount")
      .lean()
      .exec();
    const submittedStudent = {
      assignmentName: assignment?.assignmentName,
      dueDate: assignment?.dueDate,
      totalCount: assignment?.totalCount,
      submittedCount: assignment?.submittedCount,
      checkedCount: assignment?.checkedCount,
    };
    // const oneEncrypt = await encryptionPayload(submittedStudent);
    res.status(200).send({
      message: "All Submitted Student count",
      submittedStudent,
    });
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
          select: "submmittedDate assignmentSubmit",
        },
        select:
          "studentFirstName studentMiddleName studentLastName studentROLLNO photoId studentProfilePhoto assignments",
      })
      .select("dueDate totalCount submittedCount submittedStudent checkedCount")
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
          assignmentSubmit: "",
          _id: "",
        };
        obj.studentFirstName = oneStudent.studentFirstName;
        obj.studentMiddleName = oneStudent?.studentMiddleName;
        obj.studentLastName = oneStudent.studentLastName;
        obj.studentROLLNO = oneStudent.studentROLLNO;
        obj.photoId = oneStudent.photoId;
        obj._id = oneStudent._id;
        obj.studentProfilePhoto = oneStudent.studentProfilePhoto;
        obj.assignmentSubmittedDate =
          oneStudent?.assignments?.[0]?.submmittedDate;
        obj.assignmentSubmit = oneStudent?.assignments?.[0]?.assignmentSubmit;
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
      checkedCount: assignment?.checkedCount,
      submittedCount: assignment?.submittedCount,
      submittedStudent: oneAssignmentStudents,
    };
    // const masterEncrypt = await encryptionPayload(submittedStudent);
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
    // const mEncrypt = await encryptionPayload(student);
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
      .select(
        "assignments completedAssignment incompletedAssignment submittedAssignment user"
      );
    const user = await User.findById({ _id: `${student.user}` });
    const assignment = await StudentAssignment.findById(
      student?.assignments[0]._id
    );
    assignment.assignmentSubmit = req.body.assignmentSubmit;
    const subjectAssignment = await Assignment.findById(assignment.assignment);
    if (req.body.assignmentSubmit === true) {
      student.completedAssignment += 1;
      subjectAssignment.checkedCount += 1;
    } else {
      student.submittedAssignment -= 1;
      student.incompletedAssignment += 1;
      assignment.assignmentSubmitRequest = false;
      subjectAssignment.submittedCount -= 1;
      subjectAssignment.submittedStudent.pull(req.params.sid);
    }
    const notify = new StudentNotification({});
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? student.studentMiddleName : ""
    } ${student.studentLastName} ${req.body.assignmentSubmit} ${
      subjectAssignment?.assignmentName
    } Assignment successfully`;
    notify.notifySender = subjectAssignment?.subject;
    notify.notifyReceiever = user._id;
    notify.subjectId = subjectAssignment?.subject;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    // notify.notifyByDepartPhoto = department._id;
    notify.notifyCategory = "Complete Assignment";
    notify.redirectIndex = 19;
    await Promise.all([
      subjectAssignment.save(),
      assignment.save(),
      student.save(),
      notify.save(),
      user.save(),
    ]);
    res.status(200).send({
      message: "Assignment complete successfully 🎁",
    });
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      "Assignment Submission",
      user._id,
      user.deviceToken,
      "Student",
      notify
    );
  } catch (e) {
    console.log(e);
  }
};

//=============for the Student Side===================

exports.getStudentAssignmentCount = async (req, res) => {
  try {
    // console.log("msvfgscgh");
    const student = await Student.findById(req.params.sid)
      .select(
        "totalAssignment submittedAssignment completedAssignment incompletedAssignment"
      )
      .lean()
      .exec();
    // console.log(student);
    // Add Another Encryption
    res.status(200).send({
      message: "assignment count",
      totalAssignment: student.totalAssignment,
      submittedAssignment: student.submittedAssignment,
      completedAssignment: student.completedAssignment,
      incompletedAssignment: student.incompletedAssignment,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.getStudentAssignment = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      // .populate({
      //   path: "assignments",
      //   populate: {
      //     path: "subject",
      //     select: "subjectName",
      //   },
      //   select:
      //     "assignmentName dueDate assignmentSubmitRequest assignmentSubmit",
      // })
      .select("assignments")
      .lean()
      .exec();

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const startItem =
      student.assignments?.length - itemPerPage - (getPage - 1) * itemPerPage;
    const endItem = startItem + itemPerPage;
    const assign = student.assignments;
    const filterFunction = (assign, startItem, endItem) => {
      if (startItem <= 0) {
        if (endItem < 1) {
          const assignment = assign.slice(0, 0);
          return assignment;
        } else {
          const assignment = assign.slice(0, endItem);
          return assignment;
        }
      } else {
        const assignment = assign.slice(startItem, endItem);
        return assignment;
      }
    };

    const assignments = await StudentAssignment.find({
      _id: { $in: filterFunction(assign, startItem, endItem) },
    })
      .populate({
        path: "subject",
        select: "subjectName",
      })
      .select("assignmentName dueDate assignmentSubmitRequest assignmentSubmit")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (assignments) {
      // const aEncrypt = await encryptionPayload(assignments);
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
    // const aEncrypt = await encryptionPayload(assignment);
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
    const assignment = await StudentAssignment.findById(
      req.params.aid
    ).populate({
      path: "subject",
      select: "subjectName",
      populate: {
        path: "subjectTeacherName",
        select: "id",
        populate: {
          path: "user",
          select: "id",
        },
      },
    });
    const user = await User.findById({
      _id: assignment?.subject?.subjectTeacherName?.user?._id,
    });
    assignment.studentDescritpion = req.body?.studentDescritpion;
    assignment.submmittedDate = req.body?.submmittedDate;
    assignment.assignmentSubmitRequest = req.body?.assignmentSubmitRequest;
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
        assignment.studentFiles.push(obj);
        await unlinkFile(file.path);
      }
    }
    const student = await Student.findById(assignment.student);
    student.submittedAssignment += 1;
    student.incompletedAssignment -= 1;
    const subjectAssignment = await Assignment.findById(assignment.assignment);
    subjectAssignment.submittedStudent.push(student._id);
    subjectAssignment.submittedCount += 1;
    if (req.body?.testSet) {
      const studentTestset = await StudentTestSet.findById(req.body?.testSet);
      studentTestset.testSetComplete = true;
      await studentTestset.save();
    }
    //
    const notify = new StudentNotification({});
    notify.notifyContent = `${student?.studentFirstName} submit ${assignment?.assignmentName} Assignment Successfully`;
    notify.notify_hi_content = `${student?.studentFirstName} ने ${assignment?.assignmentName} असाइनमेंट सफलतापूर्वक सबमिट किया है |`;
    notify.notify_mr_content = `${student?.studentFirstName} ने ${assignment?.assignmentName} असाइनमेंट यशस्वीरित्या सबमिट केली.`;
    notify.notifySender = student._id;
    notify.notifyReceiever = user._id;
    notify.assignmentId = assignment?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    student.notification.push(notify._id);
    notify.notifyByStudentPhoto = student?._id;
    notify.notifyCategory = "Submit Assignment";
    notify.redirectIndex = 7;
    //
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      "Submit Assignment",
      user._id,
      user.deviceToken,
      "Student",
      notify
    );
    //
    await Promise.all([
      assignment.save(),
      student.save(),
      subjectAssignment.save(),
      notify.save(),
      user.save(),
    ]);
    res.status(200).send({
      message: "Assignment is submitted",
    });
  } catch (e) {
    console.log(e);
  }
};
