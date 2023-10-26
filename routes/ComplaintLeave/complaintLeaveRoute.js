const express = require("express");
const router = express.Router();
const complaintController = require("../../controllers/ComplaintLeaveTransfer/ComplaintController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");
router
  .route("/student/:sid")
  .get(isLoggedIn, catchAsync(complaintController.getStudentLeave))
  .post(isLoggedIn, catchAsync(complaintController.postStudentLeave));

router
  .route("/leave/:lid")
  .get(isLoggedIn, catchAsync(complaintController.getStudentOneLeaveDetail))
  .delete(isLoggedIn, catchAsync(complaintController.getStudentOneLeaveDelete));

router
  .route("/class/:cid")
  .get(isLoggedIn, catchAsync(complaintController.getAllStudentLeaveClass))
  .patch(isLoggedIn, catchAsync(complaintController.oneStudentLeaveProcess));

router
  .route("/student/:sid/complaint")
  .get(isLoggedIn, catchAsync(complaintController.studentAllComplaint))
  .post(isLoggedIn, catchAsync(complaintController.studentComplaint));

router
  .route("/student/:sid/compdest")
  .get(isLoggedIn, catchAsync(complaintController.studentComplaintDestination));

router
  .route("/class/:cid/complaint")
  .get(isLoggedIn, catchAsync(complaintController.classAllComplaint));

router
  .route("/department/:did/complaint")
  .get(isLoggedIn, catchAsync(complaintController.departmentAllComplaint));

router
  .route("/institute/:id/complaint")
  .get(isLoggedIn, catchAsync(complaintController.instituteAllComplaint));

router
  .route("/complaint/:cid")
  .get(isLoggedIn, catchAsync(complaintController.OneComplaint))
  .put(isLoggedIn, catchAsync(complaintController.OneComplaintReportAdmin))
  .patch(isLoggedIn, catchAsync(complaintController.classComplaintSolve))
  .delete(isLoggedIn, catchAsync(complaintController.OneComplaintDelete));

router
  .route("/student/:sid/transfer")
  .post(isLoggedIn, catchAsync(complaintController.studentTransferRequested));

router
  .route("/class/:cid/transfer")
  .get(isLoggedIn, catchAsync(complaintController.classAllTransfer));
router
  .route("/class/student/:tid/transfer")
  .put(isLoggedIn, catchAsync(complaintController.studentTransferRejected))
  .patch(isLoggedIn, catchAsync(complaintController.studentTransferApproved));

//for the staff
router
  .route("/staff/:sid")
  .get(isLoggedIn, catchAsync(complaintController.getStaffLeave))
  .post(isLoggedIn, catchAsync(complaintController.postStaffLeave));

router
  .route("/staff/leave/:lid")
  .get(isLoggedIn, catchAsync(complaintController.getStaffOneLeaveDetail))
  .delete(isLoggedIn, catchAsync(complaintController.getStaffOneLeaveDelete));

router
  .route("/institute/:id")
  .get(isLoggedIn, catchAsync(complaintController.getAllStaffLeaveInstitute))
  .patch(isLoggedIn, catchAsync(complaintController.oneStaffLeaveProcess));

router
  .route("/staff/:sid/complaint")
  .get(isLoggedIn, catchAsync(complaintController.stafftAllComplaint))
  .post(isLoggedIn, catchAsync(complaintController.staffComplaint));

router
  .route("/staff/complaint/:cid")
  .get(isLoggedIn, catchAsync(complaintController.OneStaffComplaint))
  .patch(isLoggedIn, catchAsync(complaintController.staffComplaintSolve))
  .delete(isLoggedIn, catchAsync(complaintController.staffComplaintDelete));

router
  .route("/institute/:id/staff/complaint")
  .get(isLoggedIn, catchAsync(complaintController.instituteStaffAllComplaint));

router
  .route("/staff/:sid/transfer")
  .post(isLoggedIn, catchAsync(complaintController.staffTransferRequested));

router
  .route("/institute/:id/transfer")
  .get(isLoggedIn, catchAsync(complaintController.instituteStaffAllTransfer));

router
  .route("/institute/staff/:tid/transfer")
  .put(isLoggedIn, catchAsync(complaintController.staffTransferRejected))
  .patch(isLoggedIn, catchAsync(complaintController.staffTransferApproved));

router.patch("/:id/config/leave/assign/query", catchAsync(complaintController.renderLeaveConfigQuery))

router.patch("/:sid/config/staff/leave/assign/query", catchAsync(complaintController.renderStaffLeaveConfigQuery))

router
  .route("/staff/:sid/coff/query")
  .post(isLoggedIn, catchAsync(complaintController.postStaffCoffLeaveQuery));

router
  .route("/staff/:id/all/coff/query")
  .get(isLoggedIn, catchAsync(complaintController.renderStaffCoffLeaveQuery));


// router
//   .route("/student/:sid/complaint")
//   .get(isLoggedIn,catchAsync(complaintController.studentComplaint));
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
