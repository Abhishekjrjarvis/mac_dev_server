const express = require("express");
const router = express.Router();
const examController = require("../../controllers/Exam/ExamController");
const catchAsync = require("../../Utilities/catchAsync");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router
  .route("/:did/classmaster/:bid")
  .get(catchAsync(examController.getClassMaster));
router
  .route("/:cmid/subjectmaster/:bid")
  .get(catchAsync(examController.getSubjectMaster));
router.route("/batch/:bid").post(catchAsync(examController.createExam));
router.route("/all/:did").get(catchAsync(examController.allExam));
router.route("/:eid").get(catchAsync(examController.examById));
router
  .route("/subjectteacher/:sid")
  .get(catchAsync(examController.allExamSubjectTeacher));
router
  .route("/allstudents/subjectteacher/:sid/exam/:eid")
  .get(catchAsync(examController.allStudentInSubjectTeacher));

router
  .route("/allstudents/marks/subjectteacher/:sid")
  .post(catchAsync(examController.allStudentMarksBySubjectTeacher))
  .patch(
    upload.array("file"),
    catchAsync(examController.oneStudentMarksBySubjectTeacher)
  );
router
  .route("/student/:sid/allexam")
  .get(catchAsync(examController.allExamInStudent));

router
  .route("/student/:sid/exam/:eid")
  .get(catchAsync(examController.oneExamAllSubjectInStudent));

router
  .route("/class/student/:sid/grace")
  .patch(catchAsync(examController.oneStudentGraceMarksClassTeacher));

router
  .route("/class/:cid/settings")
  .get(catchAsync(examController.oneClassSettings));

router
  .route("/class/student/:sid/behaviour")
  .get(examController.oneStudentBehaviourReportCard)
  .post(examController.oneStudentBehaviourClassTeacher);
router
  .route("/class/student/:sid/report")
  .get(catchAsync(examController.oneStudentReportCardClassTeacher));

router
  .route("/class/student/:sid/report/attendance")
  .get(catchAsync(examController.oneStudentAllYearAttendance));

router
  .route("/class/student/:sid/report/necessary")
  .get(catchAsync(examController.oneStudentReletedNecessaryData));
router
  .route("/class/student/:sid/report/finalize")
  .post(catchAsync(examController.oneStudentReportCardFinalize));

router
  .route("/class/student/:sid/report/finalize/grace/update")
  .patch(catchAsync(examController.oneStudentReportCardFinalizeGraceUpdate));

module.exports = router;
