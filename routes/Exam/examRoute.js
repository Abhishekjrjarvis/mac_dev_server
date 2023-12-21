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
  .get(catchAsync(examController.oneExamAllSubjectInStudent));

router
  .route("/student/:sid/exam/:eid/answersheet")
  .get(
    isLoggedIn,
    catchAsync(examController.oneExamOneSubjectAnswersheetInStudent)
  );

// router
//   .route("/class/student/:sid/grace")
//   .patch(
//     isLoggedIn,
//     catchAsync(examController.oneStudentGraceMarksClassTeacher)
//   );

router
  .route("/class/:cid/settings")
  .get(isLoggedIn, catchAsync(examController.oneClassSettings));

router
  .route("/class/student/:sid/behaviour")
  .get(isLoggedIn, catchAsync(examController.oneStudentBehaviourReportCard))
  .post(isLoggedIn, catchAsync(examController.oneStudentBehaviourClassTeacher));
router.route("/class/student/:sid/report").get(
  // isLoggedIn,
  catchAsync(examController.oneStudentReportCardClassTeacher)
);

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

router
  .route("/seating/:eid/seating/new/query/automate")
  .post(catchAsync(examController.renderNewSeatingArrangementAutomateQuery));

router
  .route("/class/:cid/final/report/zip")
  .post(catchAsync(examController.getAllClassExportReport));

router
  .route("/malicious/student/:sid/create")
  .post(catchAsync(examController.createExamMaliciousActivity));

router
  .route("/malicious/examination/department/:did")
  .get(catchAsync(examController.getExamMaliciousActivity));

router
  .route("/exam/grade/department/:did/create")
  .get(catchAsync(examController.getGradeSystem))
  .post(catchAsync(examController.createGradeSystem));

router
  .route("/exam/grade/custom/list")
  .get(catchAsync(examController.getCustomGradeSystem));

router
  .route("/fee/structure/:efid/edit")
  .patch(catchAsync(examController.renderEditExamFeeStructureQuery));

router
  .route("/fee/structure/:did/all/query")
  .get(catchAsync(examController.renderNewExamFeeStructureAllQuery));

router
  .route("/fee/structure/one/:efid/all/query")
  .get(catchAsync(examController.renderOneExamFeeStructureQuery));

router
  .route("/backlog/:did/new/exam")
  .post(catchAsync(examController.renderNewBacklogExamQuery));

router
  .route("/backlog/:did/all/exam")
  .get(catchAsync(examController.renderFilteredDepartExamQuery));

router
  .route("/backlog/:did/classmaster")
  .get(isLoggedIn, catchAsync(examController.getBacklogClassMaster));

router
  .route("/backlog/:cmid/subjectmaster")
  .get(isLoggedIn, catchAsync(examController.getBacklogSubjectMaster));

// router
//   .route("/backlog/:did/new/exam/auto")
//   .post(catchAsync(examController.renderNewBacklogExamAutoQuery));

router
  .route("/grade/custom/create")
  .post(catchAsync(examController.createCustomGradeSystem));

router
  .route("/all/student/report/card/finalize/class/:cid")
  .post(catchAsync(examController.finalizeAllStudentInOneClass));

router
  .route("/send/student/update/exam/:eid/notify")
  .get(catchAsync(examController.sendBacklogExamMarkUpdate));
router
  .route("/one/subject/:sid/exam/:eid/student/list")
  .get(catchAsync(examController.getBacklogOneSubjectStudent));
router
  .route("/one/subject/:sid/student/mark/update")
  .post(catchAsync(examController.backlogAllStudentMarksBySubjectTeacher));

router
  .route("/seating/:eid/seating/new/backlog/query")
  .post(catchAsync(examController.renderNewBacklogSeatingArrangementQuery));

router
  .route("/exam/grade/:gid/update")
  .patch(catchAsync(examController.updateGradeSystem));

router
  .route("/create/subject/:sid/query")
  .post(catchAsync(examController.createSubjectExam));

router
  .route("/edit/one/:eid/subject/:smid/query")
  .patch(catchAsync(examController.examEditOneSubjectMasterQuery))
  .delete(catchAsync(examController.examRemoveOneSubjectMasterQuery));

  router
  .route("/edit/one/:eid/subject/:smid/query")
  .patch(catchAsync(examController.examEditOneSubjectMasterQuery))
  .delete(catchAsync(examController.examRemoveOneSubjectMasterQuery));

router
  .route("/add/subject/master/direct/co/mapping")
  .patch(catchAsync(examController.examDirectCoMappingQuery));

module.exports = router;
