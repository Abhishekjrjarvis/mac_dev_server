const express = require("express");
const router = express.Router();
const examController = require("../../controllers/Exam/ExamController");
const catchAsync = require("../../Utilities/catchAsync");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { isLoggedIn } = require("../../middleware");

router
  .route("/:did/classmaster/:bid")
  .get(isLoggedIn, catchAsync(examController.getClassMaster));
router
  .route("/:cmid/subjectmaster/:bid")
  .get(isLoggedIn, catchAsync(examController.getSubjectMaster));
router
  .route("/batch/:bid")
  .post(isLoggedIn, catchAsync(examController.createExam));
router.route("/all/:did").get(isLoggedIn, catchAsync(examController.allExam));
router.route("/:eid").get(isLoggedIn, catchAsync(examController.examById));
router
  .route("/subjectteacher/:sid")
  .get(isLoggedIn, catchAsync(examController.allExamSubjectTeacher));
router
  .route("/allstudents/subjectteacher/:sid/exam/:eid")
  .get(isLoggedIn, catchAsync(examController.allStudentInSubjectTeacher));

router
  .route("/allstudents/marks/subjectteacher/:sid")
  .post(isLoggedIn, catchAsync(examController.allStudentMarksBySubjectTeacher))
  .patch(
    upload.array("file"),
    isLoggedIn,
    catchAsync(examController.oneStudentMarksBySubjectTeacher)
  );
router
  .route("/student/:sid/allexam")
  .get(isLoggedIn, catchAsync(examController.allExamInStudent));

router
  .route("/student/:sid/exam/:eid")
  .get(isLoggedIn, catchAsync(examController.oneExamAllSubjectInStudent));

router
  .route("/student/:sid/exam/:eid/answersheet")
  .get(
    isLoggedIn,
    catchAsync(examController.oneExamOneSubjectAnswersheetInStudent)
  );

router
  .route("/class/student/:sid/grace")
  .patch(
    isLoggedIn,
    catchAsync(examController.oneStudentGraceMarksClassTeacher)
  );

router
  .route("/class/:cid/settings")
  .get(isLoggedIn, catchAsync(examController.oneClassSettings));

router
  .route("/class/student/:sid/behaviour")
  .get(isLoggedIn, catchAsync(examController.oneStudentBehaviourReportCard))
  .post(isLoggedIn, catchAsync(examController.oneStudentBehaviourClassTeacher));
router
  .route("/class/student/:sid/report")
  .get(isLoggedIn, catchAsync(examController.oneStudentReportCardClassTeacher));

router
  .route("/class/student/:sid/report/attendance")
  .get(isLoggedIn, catchAsync(examController.oneStudentAllYearAttendance));

router
  .route("/class/student/:sid/report/necessary")
  .get(isLoggedIn, catchAsync(examController.oneStudentReletedNecessaryData));
router
  .route("/class/student/:sid/report/finalize")
  .post(isLoggedIn, catchAsync(examController.oneStudentReportCardFinalize));

router
  .route("/class/student/:sid/report/grace/update")
  .patch(
    isLoggedIn,
    catchAsync(examController.oneStudentReportCardGraceUpdate)
  );

router
  .route("/class/student/:sid/report/finalize/grace/update")
  .patch(
    isLoggedIn,
    catchAsync(examController.oneStudentReportCardFinalizeGraceUpdate)
  );

router
  .route("/backlog/class/master/:did")
  .get(catchAsync(examController.retrieveBacklogClassMaster));

router.route("/backlog/one/master/:cmid/subjects").get(
  // isLoggedIn,
  catchAsync(examController.retrieveOneBacklogClassMasterSubjects)
);

router
  .route("/backlog/one/subject/:smid/students")
  .get(catchAsync(examController.retrieveBacklogOneSubjectStudent));

router.route("/backlog/one/subject/:smid/students/dropout").get(
  // isLoggedIn,
  catchAsync(examController.retrieveBacklogOneSubjectDropStudent)
);

router.route("/backlog/one/previous/student/:sid/subject").get(
  // isLoggedIn,
  catchAsync(examController.retrieveBacklogOneStudentSubjects)
);

router.route("/backlog/one/previous/student/:sid/mark/status").patch(
  // isLoggedIn,
  catchAsync(examController.retrieveBacklogOneStudentMarkStatus)
);

router
  .route("/seating/:eid/seating/new/query")
  .post(catchAsync(examController.renderNewSeatingArrangementQuery));

router
  .route("/seating/:eid/seating/edit/:said/query")
  .patch(catchAsync(examController.renderEditSeatingArrangementQuery));

router
  .route("/seating/:eid/seating/all/query")
  .get(catchAsync(examController.renderAllSeatingArrangementQuery));

router
  .route("/seating/:eid/all/class/query")
  .get(catchAsync(examController.renderAllClassQuery));

router
  .route("/seating/one/:said/query")
  .get(catchAsync(examController.renderOneSeatingArrangementQuery));

router
  .route("/seating/:eid/seating/destroy/:said/query")
  .delete(catchAsync(examController.renderDestroySeatingArrangementQuery));

module.exports = router;
