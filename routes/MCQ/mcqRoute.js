const express = require("express");
const router = express.Router();
const mcqController = require("../../controllers/MCQ/mcqController");
const catchAsync = require("../../Utilities/catchAsync");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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

//=========for the assignment related ================
router
  .route("/subject/:sid/assignment")
  .get(catchAsync(mcqController.getAssignment))
  .post(upload.array("file"), catchAsync(mcqController.createAssignment));

router
  .route("/subject/count/assignment/:aid")
  .get(catchAsync(mcqController.getOneAssignmentCount));
router
  .route("/subject/assignment/:aid")
  .get(catchAsync(mcqController.getOneAssignment));

router
  .route("/subject/assignment/:aid/student/:sid")
  .get(catchAsync(mcqController.getOneAssignmentOneStudentDetail))
  .patch(
    catchAsync(mcqController.getOneAssignmentOneStudentCompleteAssignment)
  );

router
  .route("/student/:sid/count/assignment")
  .get(catchAsync(mcqController.getStudentAssignmentCount));

router
  .route("/student/:sid/assignment")
  .get(catchAsync(mcqController.getStudentAssignment));

router
  .route("/student/assignment/:aid")
  .get(catchAsync(mcqController.getStudentOneAssignmentDetail))
  .patch(
    upload.array("file"),
    catchAsync(mcqController.getStudentOneAssignmentSubmit)
  );

module.exports = router;
