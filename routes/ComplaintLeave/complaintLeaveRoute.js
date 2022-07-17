const express = require("express");
const router = express.Router();
const complaintController = require("../../controllers/ComplaintLeaveTransfer/complaintController");
const catchAsync = require("../../Utilities/catchAsync");

router
  .route("/student/:sid")
  .get(catchAsync(complaintController.getStudentLeave))
  .post(catchAsync(complaintController.postStudentLeave));

router
  .route("/leave/:lid")
  .get(catchAsync(complaintController.getStudentOneLeaveDetail))
  .delete(catchAsync(complaintController.getStudentOneLeaveDelete));

router
  .route("/class/:cid")
  .get(catchAsync(complaintController.getAllStudentLeaveClass))
  .patch(catchAsync(complaintController.oneStudentLeaveProcess));

router
  .route("/student/:sid/complaint")
  .get(catchAsync(complaintController.studentAllComplaint))
  .post(catchAsync(complaintController.studentComplaint));

router
  .route("/student/:sid/compdest")
  .get(catchAsync(complaintController.studentComplaintDestination));

router
  .route("/class/:cid/complaint")
  .get(catchAsync(complaintController.classAllComplaint));

router
  .route("/department/:did/complaint")
  .get(catchAsync(complaintController.departmentAllComplaint));

router
  .route("/institute/:id/complaint")
  .get(catchAsync(complaintController.instituteAllComplaint));

router
  .route("/complaint/:cid")
  .get(catchAsync(complaintController.OneComplaint))
  .put(catchAsync(complaintController.OneComplaintReportAdmin))
  .patch(catchAsync(complaintController.classComplaintSolve))
  .delete(catchAsync(complaintController.OneComplaintDelete));

//for the staff
router
  .route("/staff/:sid")
  .get(catchAsync(complaintController.getStaffLeave))
  .post(catchAsync(complaintController.postStaffLeave));

router
  .route("/staff/leave/:lid")
  .get(catchAsync(complaintController.getStaffOneLeaveDetail))
  .delete(catchAsync(complaintController.getStaffOneLeaveDelete));

router
  .route("/institute/:id")
  .get(catchAsync(complaintController.getAllStaffLeaveInstitute))
  .patch(catchAsync(complaintController.oneStaffLeaveProcess));
// router
//   .route("/student/:sid/complaint")
//   .get(catchAsync(complaintController.studentComplaint));
// router
//   .route("/student/complaint/reply/:id")
//   .get(catchAsync(complaintController.studentComplaintReply));
// router
//   .route("/student/complaint/:id/institute/:iid")
//   .get(catchAsync(complaintController.studentComplaintInstitute));
// router
//   .route("/subjectteacher/:sid")
//   .get(catchAsync(examController.allExamSubjectTeacher));
// router
//   .route("/allstudents/subjectteacher/:sid/exam/:eid")
//   .get(catchAsync(examController.allStudentInSubjectTeacher));

// router
//   .route("/allstudents/marks/subjectteacher/:sid")
//   .post(catchAsync(examController.allStudentMarksBySubjectTeacher));

// router
//   .route("/student/:sid/allexam")
//   .get(catchAsync(examController.allExamInStudent));

// router
//   .route("/student/:sid/exam/:eid")
//   .get(catchAsync(examController.oneExamAllSubjectInStudent));

// router
//   .route("/class/student/:sid/grace")
//   .patch(catchAsync(examController.oneStudentGraceMarksClassTeacher));

// router
//   .route("/class/:cid/settings")
//   .get(catchAsync(examController.oneClassSettings));

// router
//   .route("/class/student/:sid/behaviour")
//   .get(examController.oneStudentBehaviourReportCard)
//   .post(examController.oneStudentBehaviourClassTeacher);
// router
//   .route("/class/student/:sid/report")
//   .get(catchAsync(examController.oneStudentReportCardClassTeacher));

// router
//   .route("/class/student/:sid/report/attendance")
//   .get(catchAsync(examController.oneStudentAllYearAttendance));

// router
//   .route("/class/student/:sid/report/finalize")
//   .post(catchAsync(examController.oneStudentReportCardFinalize));

// router
//   .route("/class/student/:sid/report/finalize/grace/update")
//   .patch(catchAsync(examController.oneStudentReportCardFinalizeGraceUpdate));

module.exports = router;
