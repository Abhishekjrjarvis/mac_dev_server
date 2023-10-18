const express = require("express");
const router = express.Router();
const mcqController = require("../../controllers/MCQ/mcqController");
const catchAsync = require("../../Utilities/catchAsync");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { isLoggedIn } = require("../../middleware");
router
  .route("/subject/profile/:sid")
  .get(isLoggedIn, catchAsync(mcqController.getUniversalSubjectProfile))
  .patch(isLoggedIn, catchAsync(mcqController.updateUniversalSubjectProfile));

router
  .route("/universal/department")
  .get(isLoggedIn, catchAsync(mcqController.getUniversalDepartment));
router
  .route("/universal/class/:did")
  .get(isLoggedIn, catchAsync(mcqController.getUniversalClass));
router
  .route("/universal/subject/:cid")
  .get(isLoggedIn, catchAsync(mcqController.getUniversalSubject));

router
  .route("/:smid/question/:cmid")
  .get(isLoggedIn, catchAsync(mcqController.getQuestion))
  .post(
    upload.fields([
      {
        name: "questionImage",
      },
      {
        name: "answerImage",
      },
    ]),
    isLoggedIn,
    catchAsync(mcqController.addQuestion)
  );

router
  .route("/question/:qid/one")
  .get(isLoggedIn, catchAsync(mcqController.getOneQuestion));
// depricated -> changed
router
  .route("/:smid/question/count/:cmid")
  .get(isLoggedIn, catchAsync(mcqController.getQuestionAddTestSet));

router
  .route("/question/:smid/testset/:cmid")
  .get(isLoggedIn, catchAsync(mcqController.allSaveTestSet))
  .post(isLoggedIn, catchAsync(mcqController.saveTestSet));
router
  .route("/testset/:tsid/detail")
  .get(isLoggedIn, catchAsync(mcqController.oneTestSetDetail))
  .patch(isLoggedIn, catchAsync(mcqController.editSaveTestSet));

router
  .route("/subject/:sid/take/testset")
  .post(isLoggedIn, catchAsync(mcqController.takeTestSet));

router
  .route("/subject/:sid/taken/alltestset")
  .get(isLoggedIn, catchAsync(mcqController.subjectAllotedTestSet));

router
  .route("/subject/alloted/:atsid/testset/student")
  .get(isLoggedIn, catchAsync(mcqController.subjectGivenStudentTestSet));

router
  .route("/student/:sid/alltestset")
  .get(isLoggedIn, catchAsync(mcqController.studentAllTestSet));

router
  .route("/student/testset/:tsid/detail")
  .get(isLoggedIn, catchAsync(mcqController.studentOneTestSet));

router
  .route("/student/testset/paper/:tsid")
  .get(isLoggedIn, catchAsync(mcqController.studentTestSet))
  .patch(isLoggedIn, catchAsync(mcqController.studentTestSetQuestionSave));

router
  .route("/student/testset/:tsid/complete")
  .get(isLoggedIn, catchAsync(mcqController.studentTestSetResult))
  .patch(isLoggedIn, catchAsync(mcqController.studentTestSetComplete));

router
  .route("/exam/class/:cmid/subject/:smid/alltestset")
  .get(
    isLoggedIn,
    catchAsync(mcqController.allTestSetExamCreationWithSubjectMaster)
  );

router
  .route("/exam/create/batch/:bid")
  .post(isLoggedIn, catchAsync(mcqController.createExam));

//=========for the assignment related ================
router
  .route("/subject/:sid/assignment")
  .get(isLoggedIn, catchAsync(mcqController.getAssignment))
  .post(
    upload.array("file"),
    isLoggedIn,
    catchAsync(mcqController.createAssignment)
  );

router
  .route("/subject/count/assignment/:aid")
  .get(isLoggedIn, catchAsync(mcqController.getOneAssignmentCount));
router
  .route("/subject/assignment/:aid")
  .get(isLoggedIn, catchAsync(mcqController.getOneAssignment));

router
  .route("/subject/assignment/:aid/student/:sid")
  .get(isLoggedIn, catchAsync(mcqController.getOneAssignmentOneStudentDetail))
  .patch(
    isLoggedIn,
    catchAsync(mcqController.getOneAssignmentOneStudentCompleteAssignment)
  );

router
  .route("/student/:sid/count/assignment")
  .get(isLoggedIn, catchAsync(mcqController.getStudentAssignmentCount));

router
  .route("/student/:sid/assignment")
  .get(isLoggedIn, catchAsync(mcqController.getStudentAssignment));

router
  .route("/student/assignment/:aid")
  .get(isLoggedIn, catchAsync(mcqController.getStudentOneAssignmentDetail))
  .patch(
    upload.array("file"),
    isLoggedIn,
    catchAsync(mcqController.getStudentOneAssignmentSubmit)
  );

router.get(
  "/one/:aid/assignment",
  catchAsync(mcqController.renderOneAssignmentQuery)
);

router.patch(
  "/one/:aid/assignment/edit/query",
  catchAsync(mcqController.renderOneAssignmentEditQuery)
);

router.delete(
  "/one/:aid/assignment/destroy/query",
  catchAsync(mcqController.renderOneAssignmentDestroyQuery)
);

module.exports = router;
