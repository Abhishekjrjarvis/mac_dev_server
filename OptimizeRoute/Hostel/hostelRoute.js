const express = require("express");
const router = express.Router();
const Hostel = require("../../OptimizeController/Hostel/hostelController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/ins/:id/hostel/query",
  catchAsync(Hostel.renderActivateHostelQuery)
);

router.get("/:hid/dashboard/query", catchAsync(Hostel.renderHostelDashQuery));

router.get("/:hid/rules/query", catchAsync(Hostel.renderHostelRulesQuery));

router.get("/:hid/form/query", catchAsync(Hostel.renderHostelFormQuery));

router.post(
  "/:hid/new/hostel/unit",
  catchAsync(Hostel.renderHostelNewUnitQuery)
);

router.get(
  "/:hid/all/hostel/unit",
  catchAsync(Hostel.renderAllHostelUnitQuery)
);

router.get(
  "/:huid/one/hostel/unit/query",
  catchAsync(Hostel.renderOneHostelUnitQuery)
);

router.post(
  "/:huid/one/hostel/unit/new/room",
  catchAsync(Hostel.renderOneHostelUnitNewRoomQuery)
);

router.get(
  "/:huid/one/hostel/unit/all/room",
  catchAsync(Hostel.renderOneHostelUnitAllRoomQuery)
);

router.get(
  "/:hrid/one/hostel/room/query",
  catchAsync(Hostel.renderOneHostelRoomQuery)
);

router.get(
  "/:hrid/one/hostel/room/all/bed/query",
  catchAsync(Hostel.renderOneHostelRoomAllBedQuery)
);

router.get(
  "/:hid/all/fee/structure",
  catchAsync(Hostel.renderHostelAllFeeStructure)
);

router.get("/:hid/all/wardens", catchAsync(Hostel.renderHostelAllWardenQuery));

router.get(
  "/:hid/all/hostelities",
  catchAsync(Hostel.renderHostelAllHostalitiesQuery)
);

router.patch(
  "/:hid/new/existing/rules/regulation",
  catchAsync(Hostel.renderHostelNewExistingRulesQuery)
);

router.patch(
  "/:hid/existing/rules/regulation/:rid",
  catchAsync(Hostel.renderHostelExistingRulesQuery)
);

router.patch(
  "/:hid/new/existing/form/query",
  catchAsync(Hostel.renderHostelNewExistingFormQuery)
);

router.post(
  "/:hid/new/application",
  catchAsync(Hostel.renderNewHostelApplicationQuery)
);

router.post(
  "/:uid/user/:aid/apply",
  catchAsync(Hostel.renderHostelReceievedApplication)
);

router.get(
  "/:hid/all/ongoing/application",
  catchAsync(Hostel.renderHostelAllApplication)
);

router.get(
  "/:hid/all/completed/application",
  catchAsync(Hostel.renderHostelAllCompletedApplication)
);

router.get(
  "/:id/application/list/array",
  catchAsync(Hostel.renderSearchHostelApplicationQuery)
);

router.get(
  "/:aid/application/query",
  catchAsync(Hostel.renderOneHostelApplicationQuery)
);

router.post(
  "/:sid/student/:aid/cancel/app",
  catchAsync(Hostel.renderHostelCancelApplication)
);

router.post(
  "/:sid/student/:aid/select",
  catchAsync(Hostel.renderHostelSelectedQuery)
);

// Select Mode Direct By Admission Admin
router.post(
  "/:aid/select/student/mode/:sid",
  catchAsync(Hostel.renderAdminSelectMode)
);

// Cancel Mode Direct By Admission Admin
router.post(
  "/:aid/cancel/select/student/:sid",
  catchAsync(Hostel.renderAdminStudentCancelSelectQuery)
);

// Select Mode Direct By Student
router.post(
  "/:sid/student/pay/mode/:aid/apply/status/:statusId",
  catchAsync(Hostel.renderHostelPayMode)
);

// Cancel Mode Direct By Student
router.patch(
  "/:statusId/status/cancel/app/:aid/student/:sid",
  catchAsync(Hostel.renderStudentCancelHostelAdmissionMode)
);

router.post(
  "/:sid/student/:aid/pay/offline/confirm",
  catchAsync(Hostel.renderPayOfflineHostelFee)
);

router.post(
  "/:sid/student/:aid/pay/refund",
  catchAsync(Hostel.renderCancelHostelRefundApplicationQuery)
);

router.patch(
  "/:aid/application/complete",
  catchAsync(Hostel.renderCompleteHostelApplication)
);

router.get(
  "/:hid/all/remaining/array",
  catchAsync(Hostel.renderHostelRemainingArray)
);

router.post(
  "/student/:aid/allot/bed",
  catchAsync(Hostel.renderAllotHostedBedQuery)
);

router.post(
  "/:aid/paid/remaining/fee/:sid/student/:appId",
  catchAsync(Hostel.renderPaidRemainingFeeStudentQuery)
);

router.patch(
  "/:hid/paid/remaining/fee/:sid/student/:appId/refund/by",
  catchAsync(Hostel.renderPaidRemainingFeeStudentRefundBy)
);

router.get("/:hid/all/receipts/by", catchAsync(Hostel.renderAllReceiptsQuery));

router.patch(
  "/:hid/one/receipts/:rid/status",
  catchAsync(Hostel.renderOneReceiptStatus)
);

router.patch(
  "/:sid/re/apply/receipts/:rid",
  catchAsync(Hostel.renderOneHostelReceiptReApply)
);

router.patch(
  "/:sid/go/offline/receipt/:appId",
  catchAsync(Hostel.renderStudentGoOfflineHostelReceiptQuery)
);

router.get(
  "/:huid/request/application",
  catchAsync(Hostel.renderHostelUnitAllReceievedApplication)
);

router.get(
  "/:huid/selected/application",
  catchAsync(Hostel.renderHostelUnitAllSelectedApplication)
);

router.get(
  "/:huid/confirmed/application",
  catchAsync(Hostel.renderHostelUnitAllConfirmedApplication)
);

router.get(
  "/:huid/allotted/application",
  catchAsync(Hostel.renderHostelUnitAllAllottedApplication)
);

router.get(
  "/:huid/cancelled/application",
  catchAsync(Hostel.renderHostelUnitAllCancelledApplication)
);

router.post(
  "/:sid/student/:huid/cancel/app/renewal",
  catchAsync(Hostel.renderHostelCancelApplicationRenewal)
);

router.post(
  "/:sid/student/:huid/select/renewal",
  catchAsync(Hostel.renderHostelSelectedRenewalQuery)
);

router.post(
  "/:sid/student/pay/mode/:rid/apply/renewal",
  catchAsync(Hostel.renderHostelPayModeRenewal)
);

router.post(
  "/:sid/student/cancel/pay/mode/:rid/apply/renewal",
  catchAsync(Hostel.renderHostelCancelPayModeRenewal)
);

router.post(
  "/:sid/student/:huid/pay/offline/confirm/renewal/:aid",
  catchAsync(Hostel.renderPayOfflineHostelFeeRenewal)
);

router.post(
  "/student/:aid/allot/bed/:huid/renewal",
  catchAsync(Hostel.renderAllotHostedBedRenewalQuery)
);

router.post(
  "/:sid/student/:aid/pay/refund/:huid/renewal",
  catchAsync(Hostel.renderCancelHostelRefundRenewalApplicationQuery)
);

router.get(
  "/:sid/all/renewals",
  catchAsync(Hostel.renderHostelAllStudentRenewalQuery)
);

router.get(
  "/:sid/all/roommates/query",
  catchAsync(Hostel.renderHostelAllStudentRoommatesQuery)
);

router.get(
  "/:id/all/classmaster/query",
  catchAsync(Hostel.renderHostelAllClassMasterQuery)
);

router.post(
  "/:hid/new/announcement",
  upload.fields([
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
    { name: "file4" },
    { name: "file5" },
  ]),
  catchAsync(Hostel.renderNewHostelAnnouncementQuery)
);

router.get(
  "/:hid/all/announcement",
  catchAsync(Hostel.renderAllHostelAnnouncementQuery)
);

router.post(
  "/:id/add/direct/hostel/confirm/:aid/query",
  catchAsync(Hostel.renderDirectHostelJoinConfirmQuery)
);

router.get(
  "/:hid/master/deposit/query",
  catchAsync(Hostel.renderHostelMasterDepositQuery)
);

router.get(
  "/:hid/master/all/refund/deposit/history",
  catchAsync(Hostel.renderHostelMasterAllDepositHistory)
);

router.patch(
  "/:hid/add/auto/qrcode/query",
  catchAsync(Hostel.renderApplicationAutoQRCodeQuery)
);

router.get(
  "/:hid/all/export/excel/array",
  catchAsync(Hostel.renderAllExportExcelArrayQuery)
);

router.patch(
  "/:hid/export/excel/:exid/edit",
  catchAsync(Hostel.renderEditOneExcel)
);

router.delete(
  "/:hid/export/excel/:exid/destroy/query",
  catchAsync(Hostel.renderDeleteOneExcel)
);

router.post("/:hid/new/batch/query", catchAsync(Hostel.renderNewBatchQuery));

router.get("/:hid/all/batch/query", catchAsync(Hostel.renderAllBatchQuery));

router.post(
  "/:hid/batch-select/:bid",
  catchAsync(Hostel.renderCurrentSelectBatchQuery)
);

router.post("/:hid/new/master/query", catchAsync(Hostel.renderNewMasterQuery));

router.get("/:hid/all/master/query", catchAsync(Hostel.renderAllMasterQuery));

router.patch(
  "/:hid/one/receipts/:rid/status/decheque/query",
  catchAsync(Hostel.renderDemandChequeApprovalQuery)
);

router.patch(
  "/:sid/re/apply/receipts/:rid/decheque/query",
  catchAsync(Hostel.renderOneReceiptReApplyDeChequeQuery)
);

router.get("/:hid/all/apps", catchAsync(Hostel.renderAllAppsQuery));

// router.patch(
//   "/:hid/all/apps/query",
//   catchAsync(Hostel.renderHostelAllAppsQuery)
// );

router.delete("/:hid/destroy/:appId", catchAsync(Hostel.renderAppDeleteQuery));

router.get(
  "/all/:hid/not/linked/query",
  catchAsync(Hostel.renderAllNotLinkedQuery)
);

router.patch(
  "/:hid/linked/one/:id/query",
  catchAsync(Hostel.renderOneLinkedQuery)
);

router.patch("/pass", catchAsync(Hostel.renderHostelCardQuery));

// One Student Reject + Modify Form
router.post(
  "/:sid/student/:aid/cancel/app/form/modify",
  // isLoggedIn,
  catchAsync(Hostel.retrieveHostelCancelApplicationModify)
);

router.patch(
  "/:aid/student/:sid/edit/structure",
  catchAsync(Hostel.renderEditStudentFeeStructureQuery)
);

router.post(
  "/:sid/student/:aid/collect/docs",
  // isLoggedIn,
  catchAsync(Hostel.retrieveHostelCollectDocs)
);

router.post(
  "/:sid/student/:aid/revert/back/select/query",
  catchAsync(Hostel.retrieveHostelSelectedRevertedApplication)
);

router.post(
  "/:sid/student/:aid/collect/revert/back/docs/query",
  catchAsync(Hostel.retrieveHostelCollectDocsRevertedQuery)
);

router.patch(
  "/:aid/student/review/query",
  catchAsync(Hostel.renderReviewStudentQuery)
);

router.get("/:sid/staff/name/only", catchAsync(Hostel.staff_name_only));

router.get(
  "/:aid/all/merged/ongoing/application",
  catchAsync(Hostel.retieveHostelAdminAllMergedApplication)
);

// All Selected Application
router.get(
  "/:aid/all/merged/ongoing/docs/application",
  catchAsync(Hostel.fetchAllSelectMergedApplication)
);

// All Fee Collected Application
router.get(
  "/:aid/all/merged/ongoing/fees/collect/application",
  catchAsync(Hostel.fetchAllFeeCollectedMergedApplication)
);

// All Confirmed Application
router.get(
  "/:aid/all/merged/ongoing/confirm/application",
  catchAsync(Hostel.fetchAllConfirmedMergedApplication)
);

router.post(
  "/:id/pinned/application/query",
  catchAsync(Hostel.renderApplicationPinnedQuery)
);

router.post(
  "/:id/un/pinned/application/query",
  catchAsync(Hostel.renderApplicationUnPinnedQuery)
);

// Ongoing App Pinned
router.get(
  "/:id/all/ongoing/application/pinned",
  catchAsync(Hostel.retieveHostelAdminAllApplicationPinned)
);

// Mark App Complete
router.patch(
  "/:aid/application/complete",
  catchAsync(Hostel.completeHostelApplication)
);

router.patch(
  "/:aid/application/incomplete",
  catchAsync(Hostel.inCompleteHostelApplication)
);


router.get(
  "/:hid/finance/all/fee/structure",
  catchAsync(Hostel.hosteInFinanceAllStructureQuery)

router.patch(
  "/all/student/bed/query",
  catchAsync(Hostel.all_student_bed_query)
);

router.post(
  "/:sid/allotted/student/:aid/pay/refund",
  catchAsync(Hostel.cancelAllottedHostelApplication)
);

module.exports = router;
