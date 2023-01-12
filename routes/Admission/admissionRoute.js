const express = require("express");
const router = express.Router();
const Admission = require("../../controllers/Admission/admissionController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

//Assign
router.post(
  "/ins/:id/staff/:sid",
  isLoggedIn,
  isApproved,
  catchAsync(Admission.retrieveAdmissionAdminHead)
);

// All Detail
router.get(
  "/:aid/dashboard/query",
  isLoggedIn,
  catchAsync(Admission.retrieveAdmissionDetailInfo)
);

// Ongoing App
router.get(
  "/:aid/all/ongoing/application",
  isLoggedIn,
  catchAsync(Admission.retieveAdmissionAdminAllApplication)
);

// Completed App
router.get(
  "/:aid/all/completed/application",
  isLoggedIn,
  catchAsync(Admission.retieveAdmissionAdminAllCApplication)
);

// Completed App for Web
router.get(
  "/:aid/all/completed/application/detail",
  isLoggedIn,
  catchAsync(Admission.retieveAdmissionAdminAllCDetailApplication)
);

// One App Query
router.get(
  "/:aid/application/query",
  catchAsync(Admission.retrieveOneApplicationQuery)
);

// Admission Info
router.patch(
  "/:aid/info/update",
  isLoggedIn,
  catchAsync(Admission.fetchAdmissionQuery)
);

// Create New App
router.post(
  "/:aid/new/application",
  // isLoggedIn,
  upload.single("file"),
  catchAsync(Admission.retrieveAdmissionNewApplication)
);

// At Institute Search All New App
router.get(
  "/:id/application/list/array",
  catchAsync(Admission.fetchAdmissionApplicationArray)
);

// Apply By Student at New App
router.post(
  "/:uid/user/:aid/apply",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionReceievedApplication)
);

// All Received Application
router.get(
  "/:aid/request/application",
  // isLoggedIn,
  catchAsync(Admission.fetchAllRequestApplication)
);

// All Selected Application
router.get(
  "/:aid/selected/application",
  // isLoggedIn,
  catchAsync(Admission.fetchAllSelectApplication)
);

// All Confirmed Application
router.get(
  "/:aid/confirmed/application",
  // isLoggedIn,
  catchAsync(Admission.fetchAllConfirmApplication)
);

// All Allotted Application
router.get(
  "/:aid/allotted/application",
  // isLoggedIn,
  catchAsync(Admission.fetchAllAllotApplication)
);

// All Cancelled Application
router.get(
  "/:aid/cancelled/application",
  // isLoggedIn,
  catchAsync(Admission.fetchAllCancelApplication)
);

// One Student Select at Selected
router.post(
  "/:sid/student/:aid/select",
  isLoggedIn,
  catchAsync(Admission.retrieveAdmissionSelectedApplication)
);

// One Student Cancel at Selected
router.post(
  "/:sid/student/:aid/cancel/app",
  isLoggedIn,
  catchAsync(Admission.retrieveAdmissionCancelApplication)
);

// Student Confirmation Select Pay Mode
router.post(
  "/:sid/student/pay/mode/:aid/apply/status/:statusId",
  isLoggedIn,
  catchAsync(Admission.retrieveAdmissionPayMode)
);

// One Student Pay Offline Mark
router.post(
  "/:sid/student/:aid/pay/offline/confirm",
  isLoggedIn,
  catchAsync(Admission.payOfflineAdmissionFee)
);

// Check At Last
router.post(
  "/:sid/student/:aid/pay/refund",
  isLoggedIn,
  catchAsync(Admission.cancelAdmissionApplication)
);

// All Batch For Allotment
router.get(
  "/:aid/application/batch",
  isLoggedIn,
  catchAsync(Admission.retrieveAdmissionApplicationBatch)
);

// All Class For Allotment
router.get(
  "/:aid/application/class/:bid",
  isLoggedIn,
  catchAsync(Admission.retrieveAdmissionApplicationClass)
);

// One Student Class Allot
router.post(
  "/student/:aid/allot/class/:cid",
  isLoggedIn,
  catchAsync(Admission.retrieveClassAllotQuery)
);

// Mark App Complete
router.patch(
  "/:aid/application/complete",
  isLoggedIn,
  catchAsync(Admission.completeAdmissionApplication)
);

// Remaining Fee List
router.get(
  "/:aid/all/remaining/array",
  isLoggedIn,
  catchAsync(Admission.retrieveAdmissionRemainingArray)
);

// One Student Fee
router.get(
  "/:sid/student/view/fee",
  isLoggedIn,
  catchAsync(Admission.oneStudentViewRemainingFee)
);

// Paid Remaining Fee By Student
router.post(
  "/:aid/paid/remaining/fee/:sid/student/:appId",
  isLoggedIn,
  catchAsync(Admission.paidRemainingFeeStudent)
);

// Fetch By App status
router.get(
  "/application",
  isLoggedIn,
  catchAsync(Admission.retrieveAdmissionApplicationStatus)
);

// New Inquiry
router.post(
  "/:aid/student/:uid/inquiry",
  isLoggedIn,
  catchAsync(Admission.retrieveUserInquiryProcess)
);

// All Inquiry
router.get(
  "/:aid/student/inquiry/array",
  isLoggedIn,
  catchAsync(Admission.retrieveUserInquiryArray)
);

// One Inquiry Reply
router.patch(
  "/inquiry/reply/:qid",
  isLoggedIn,
  catchAsync(Admission.retrieveInquiryReplyQuery)
);

// Get All Department
router.get(
  "/:aid/all/department",
  isLoggedIn,
  catchAsync(Admission.retrieveAllDepartmentArray)
);

// Cancel Select Mode
router.patch(
  "/:statusId/status/cancel/app/:aid/student/:sid",
  isLoggedIn,
  catchAsync(Admission.retrieveStudentCancelAdmissionMode)
);

router.get(
  "/:sid/fees",
  isLoggedIn,
  catchAsync(Admission.retrieveStudentAdmissionFees)
);

router.post(
  "/:sid/student/:aid/collect/docs",
  isLoggedIn,
  catchAsync(Admission.retrieveAdmissionCollectDocs)
);

router.get(
  "/:did/all/classmaster",
  catchAsync(Admission.oneDepartmentAllClassMaster)
);

router.post(
  "/:aid/new/inquiry",
  upload.single("file"),
  catchAsync(Admission.renderNewAdminInquiry)
);

router.get("/:aid/all/inquiry", catchAsync(Admission.renderAllInquiryQuery));

router.get("/:id/one/inquiry", catchAsync(Admission.renderOneInquiryQuery));

router.patch(
  "/:id/inquiry/remark",
  catchAsync(Admission.renderRemarkInquiryQuery)
);

router.post(
  "/:aid/direct/:id/inquiry",
  upload.single("file"),
  catchAsync(Admission.renderNewDirectInquiry)
);

module.exports = router;
