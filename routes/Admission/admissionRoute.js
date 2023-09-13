const express = require("express");
const router = express.Router();
const Admission = require("../../controllers/Admission/admissionController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

//Assign
router.post(
  "/ins/:id/admission/query",
  // isLoggedIn,
  // isApproved,
  catchAsync(Admission.retrieveAdmissionAdminHead)
);

// All Detail
router.get(
  "/:aid/dashboard/query",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionDetailInfo)
);

// Ongoing App
router.get(
  "/:aid/all/ongoing/application",
  // isLoggedIn,
  catchAsync(Admission.retieveAdmissionAdminAllApplication)
);

// Completed App
router.get(
  "/:aid/all/completed/application",
  // isLoggedIn,
  catchAsync(Admission.retieveAdmissionAdminAllCApplication)
);

// Completed App for Web
router.get(
  "/:aid/all/completed/application/detail",
  // isLoggedIn,
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
  // isLoggedIn,
  catchAsync(Admission.fetchAdmissionQuery)
);

// Create New App
router.post(
  "/:aid/new/application",
  // isLoggedIn,
  // upload.single("file"),
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

router.get(
  "/:aid/confirmed/application/all/payload",
  // isLoggedIn,
  catchAsync(Admission.fetchAllConfirmApplicationPayload)
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
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionSelectedApplication)
);

router.patch(
  "/:sid/student/:aid/docs/confirm/status/:statusId",
  catchAsync(Admission.renderCollectDocsConfirmByStudentQuery)
);

// One Student Cancel at Selected
router.post(
  "/:sid/student/:aid/cancel/app",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionCancelApplication)
);

// Student Confirmation Select Pay Mode
router.post(
  "/:sid/student/pay/mode/:aid/apply/status/:statusId",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionPayMode)
);

// One Student Pay Offline Mark
router.post(
  "/:sid/student/:aid/pay/offline/confirm",
  // isLoggedIn,
  catchAsync(Admission.payOfflineAdmissionFee)
);

// Check At Last
router.post(
  "/:sid/student/:aid/pay/refund",
  // isLoggedIn,
  catchAsync(Admission.cancelAdmissionApplication)
);

// All Batch For Allotment
router.get(
  "/:aid/application/batch",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionApplicationBatch)
);

// All Class For Allotment
router.get(
  "/:aid/application/class/:bid",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionApplicationClass)
);

// One Student Class Allot
router.post(
  "/student/:aid/allot/class/:cid",
  // isLoggedIn,
  catchAsync(Admission.retrieveClassAllotQuery)
);

// Mark App Complete
router.patch(
  "/:aid/application/complete",
  // isLoggedIn,
  catchAsync(Admission.completeAdmissionApplication)
);

// Remaining Fee List
router.patch(
  "/:aid/all/remaining/array",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionRemainingArray)
);

router.get(
  "/:aid/all/remaining/applicable/array",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionApplicableRemainingArray)
);

// One Student Fee
router.get(
  "/:sid/student/view/fee",
  // isLoggedIn,
  catchAsync(Admission.oneStudentViewRemainingFee)
);

// Paid Remaining Fee By Student
router.post(
  "/:aid/paid/remaining/fee/:sid/student/:appId",
  // isLoggedIn,
  catchAsync(Admission.paidRemainingFeeStudent)
);

router.patch(
  "/:aid/paid/remaining/fee/:sid/student/:appId/refund/by",
  // isLoggedIn,
  catchAsync(Admission.paidRemainingFeeStudentRefundBy)
);

// Fetch By App status
router.get(
  "/application",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionApplicationStatus)
);

// New Inquiry
router.post(
  "/:aid/student/:uid/inquiry",
  // isLoggedIn,
  catchAsync(Admission.retrieveUserInquiryProcess)
);

// All Inquiry
router.get(
  "/:aid/student/inquiry/array",
  // isLoggedIn,
  catchAsync(Admission.retrieveUserInquiryArray)
);

// One Inquiry Reply
router.patch(
  "/inquiry/reply/:qid",
  // isLoggedIn,
  catchAsync(Admission.retrieveInquiryReplyQuery)
);

// Get All Department
router.get(
  "/:aid/all/department",
  // isLoggedIn,
  catchAsync(Admission.retrieveAllDepartmentArray)
);

// Cancel Select Mode
router.patch(
  "/:statusId/status/cancel/app/:aid/student/:sid",
  // isLoggedIn,
  catchAsync(Admission.retrieveStudentCancelAdmissionMode)
);

router.get(
  "/:sid/fees",
  // isLoggedIn,
  catchAsync(Admission.retrieveStudentAdmissionFees)
);

router.post(
  "/:sid/student/:aid/collect/docs",
  // isLoggedIn,
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

router.patch("/edit/:appId", catchAsync(Admission.renderAppEditQuery));

router.delete(
  "/:aid/destroy/:appId",
  catchAsync(Admission.renderAppDeleteQuery)
);

router.get(
  "/:aid/all/receipts/by",
  catchAsync(Admission.renderAllReceiptsQuery)
);

router.patch(
  "/:aid/one/receipts/:rid/status",
  catchAsync(Admission.renderOneReceiptStatus)
);

router.patch(
  "/:sid/re/apply/receipts/:rid",
  catchAsync(Admission.renderOneReceiptReApply)
);

router.post(
  "/:aid/trigger/alarm",
  catchAsync(Admission.renderTriggerAlarmQuery)
);

// router.post(
//   "/:aid/select/student/mode/:sid",
//   catchAsync(Admission.renderAdminSelectMode)
// );

// router.post(
//   "/:aid/cancel/select/student/:sid",
//   catchAsync(Admission.renderAdminStudentCancelSelectQuery)
// );

router.get(
  "/:aid/all/completed/app/query",
  catchAsync(Admission.renderInstituteCompletedAppQuery)
);

router.patch(
  "/:aid/student/:sid/edit/structure",
  catchAsync(Admission.renderEditStudentFeeStructureQuery)
);

// router.patch(
//   "/:aid/student/:sid/edit/structure",
//   catchAsync(Admission.renderEditStudentFeeStructureQuery)
// );

router.post(
  "/:aid/add/document/flow",
  catchAsync(Admission.renderAddDocumentQuery)
);

router.get(
  "/:aid/all/document/array",
  catchAsync(Admission.renderAllDocumentArray)
);

router.patch(
  "/:aid/edit/document/flow",
  catchAsync(Admission.renderEditDocumentQuery)
);

router.delete(
  "/:aid/delete/document/:docId",
  catchAsync(Admission.renderDeleteExistingDocument)
);

router.get("/:aid/refund/array", catchAsync(Admission.renderRefundArrayQuery));

router.post(
  "/paid/government/grant/fee/:sid/student/:appId",
  // isLoggedIn,
  catchAsync(Admission.paidRemainingFeeStudentFinanceQuery)
);

router.patch(
  "/:rid/remark/query",
  // isLoggedIn,
  catchAsync(Admission.renderStudentRemarkQuery)
);

router.patch(
  "/:sid/go/offline/receipt/:appId",
  // isLoggedIn,
  catchAsync(Admission.renderStudentGoOfflineReceiptQuery)
);

router.get(
  "/:aid/all/export/excel/array",
  catchAsync(Admission.renderAllExportExcelArrayQuery)
);

router.patch(
  "/:aid/export/excel/:exid/edit",
  catchAsync(Admission.renderEditOneExcel)
);

router.delete(
  "/:aid/export/excel/:exid/destroy/query",
  catchAsync(Admission.renderDeleteOneExcel)
);

router.patch("/:id/update", catchAsync(Admission.renderData));

router.get(
  "/:aid/all/structures",
  catchAsync(Admission.renderAllFeeStructureQuery)
);

router.post(
  "/:aid/new/scholarship",
  catchAsync(Admission.renderNewScholarShipQuery)
);

router.get(
  "/:aid/all/scholarship",
  catchAsync(Admission.renderAllScholarShipQuery)
);

router.get(
  "/:sid/scholarship/query",
  catchAsync(Admission.renderScholarShipQuery)
);

router.post(
  "/:aid/scholarship/new/corpus/:sid",
  catchAsync(Admission.renderScholarShipNewFundCorpusQuery)
);

router.post(
  "/new/income/:fcid",
  catchAsync(Admission.renderNewFundCorpusIncomeQuery)
);

router.get(
  "/:sid/all/allotted/candidates/government",
  catchAsync(Admission.renderAllCandidatesGovernment)
);

router.get(
  "/:sid/one/fund/corpus/history",
  catchAsync(Admission.renderOneFundCorpusHistory)
);

router.patch(
  "/:sid/status/query",
  catchAsync(Admission.renderOneScholarShipStatusQuery)
);

router.patch(
  "/:aid/retro/structure/:appId/one/student/:sid/query",
  catchAsync(Admission.renderRetroOneStudentStructureQuery)
);

router.get(
  "/:aid/all/refunded/array",
  catchAsync(Admission.renderAllRefundedArray)
);

// Apply for Direct Admission Application
// router.post(
//   "/:uid/user/:aid/apply/direct/online",
//   // isLoggedIn,
//   catchAsync(Admission.retrieveAdmissionDirectOnlineApplicationQuery)
// );

// router.post(
//   "/:uid/user/:aid/apply/direct/online",
//   // isLoggedIn,
//   catchAsync(Admission.retrieveAdmissionDirectOnlineApplicationQuery)
// );

router.patch(
  "/:rcid/set/off/:sid/query",
  // isLoggedIn,
  catchAsync(Admission.renderRemainingSetOffQuery)
);

router.patch(
  "/:rcid/add/scholar/number/query",
  // isLoggedIn,
  catchAsync(Admission.renderRemainingScholarNewNumberQuery)
);

router.patch(
  "/:aid/add/auto/qrcode/query",
  catchAsync(Admission.renderApplicationAutoQRCodeQuery)
);

// router.patch(
//   "/:new_fee_struct/edit/struct",
//   catchAsync(Admission.renderRetroOneStudentStructureQuery)
// );

router.patch(
  "/:rid/drop/fees/:sid/query",
  catchAsync(Admission.renderDropFeesStudentQuery)
);

router.post(
  "/:sid/add/fees/card/query",
  catchAsync(Admission.renderAddFeesCardStudentQuery)
);

router.post(
  "/:aid/paid/already/card/remaining/fee/:sid/student/:appId",
  catchAsync(Admission.paidAlreadyCardRemainingFeeStudent)
);

router.post(
  "/paid/already/card/government/grant/fee/:sid/student/:appId",
  catchAsync(Admission.paidAlreadyCardRemainingFeeStudentFinanceQuery)
);

router.patch(
  "/pending/list/query",
  catchAsync(Admission.renderPendingListStudentQuery)
);

router.get(
  "/filter/by/:id/three/function/query",
  catchAsync(Admission.renderFilterByThreeFunctionQuery)
);

router.get(
  "/pending/custom/filter/:aid/query",
  catchAsync(Admission.renderPendingCustomFilterQuery)
);

router.patch(
  "/pending/custom/filter/master/batch/query",
  catchAsync(Admission.renderPendingCustomFilterBatchMasterQuery)
);

router.post(
  "/:sid/student/:aid/revert/back/select/query",
  catchAsync(Admission.retrieveAdmissionSelectedRevertedApplication)
);

router.post(
  "/:sid/student/:aid/collect/revert/back/docs/query",
  catchAsync(Admission.retrieveAdmissionCollectDocsRevertedQuery)
);

router.patch(
  "/:aid/one/receipts/:rid/status/decheque/query",
  catchAsync(Admission.renderDemandChequeApprovalQuery)
);

router.patch(
  "/:sid/re/apply/receipts/:rid/decheque/query",
  catchAsync(Admission.renderOneReceiptReApplyDeChequeQuery)
);

// router.patch(
//   "/:aid/transfer/apps/query",
//   catchAsync(Admission.renderTransferAppsQuery)
// );

router.patch(
  "/:rid/card/removal/query",
  catchAsync(Admission.renderRemainCardRemovalQuery)
);

// FOR BUG //

router.get("/fee/heads/:id", catchAsync(Admission.renderFeeHeadsQuery));

router.get("/find/receipt/:id", catchAsync(Admission.renderFindReceiptQuery));

router.patch("/order/query", catchAsync(Admission.renderOrder));

router.post(
  "/:uid/user/:aid/apply/valid/query",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionReceievedValidApplicationQuery)
);

module.exports = router;
