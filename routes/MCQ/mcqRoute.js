const express = require("express");
const router = express.Router();
const mcqController = require("../../controllers/MCQ/mcqController");
const catchAsync = require("../../Utilities/catchAsync");

router
  .route("/:smid/question/:cmid")
  .get(catchAsync(mcqController.getQuestion))
  .post(catchAsync(mcqController.addQuestion));

router
  .route("/question/:smid/testset/:cmid")
  .get(catchAsync(mcqController.getQuestionAddTestSet))
  .post(catchAsync(mcqController.saveTestSet));

router
  .route("/subject/:smid/alltestset/:cmid")
  .get(catchAsync(mcqController.allSaveTestSet));

router
  .route("/testset/:tsid/detail")
  .get(catchAsync(mcqController.oneTestSetDetail));

router
  .route("/subject/:sid/take/testset")
  .post(catchAsync(mcqController.takeTestSet));

router
  .route("/student/:sid/alltestset")
  .get(catchAsync(mcqController.studentAllTestSet));

router
  .route("/student/testset/:tsid/detail")
  .get(catchAsync(mcqController.studentOneTestSet));

router
  .route("/student/testset/paper/:tsid")
  .get(catchAsync(mcqController.studentTestSet))
  .patch(catchAsync(mcqController.studentTestSetQuestionSave));

router
  .route("/student/testset/:tsid/complete")
  .get(catchAsync(mcqController.studentTestSetResult))
  .patch(catchAsync(mcqController.studentTestSetComplete));

router
  .route("/exam/class/:cmid/subject/:smid/alltestset")
  .get(catchAsync(mcqController.allTestSetExamCreationWithSubjectMaster));

router
  .route("/exam/create/batch/:bid")
  .post(catchAsync(mcqController.createExam));
module.exports = router;
