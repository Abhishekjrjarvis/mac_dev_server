const express = require("express");
const router = express.Router();
const Admission = require("../../OptimizeController/Admission/admissionController");
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

router.get(
  "/:aid/fee/collected/application",
  catchAsync(Admission.fetchAllFeeCollectedApplication)
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

router.get(
  "/:aid/review/application",
  // isLoggedIn,
  catchAsync(Admission.fetchAllReviewApplication)
);

router.get(
  "/:aid/review/application/all/payload",
  // isLoggedIn,
  catchAsync(Admission.fetchAllReviewApplicationPayload)
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
  catchAsync(Admission.completeAdmissionApplication)
);

router.patch(
  "/:aid/application/incomplete",
  catchAsync(Admission.inCompleteAdmissionApplication)
);

// Remaining Fee List
router.patch(
  "/:aid/all/remaining/array",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionRemainingArray)
);

router.get(
  "/:aid/all/remaining/applicable/array",
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

router.patch(
  "/:aid/transfer/apps/query",
  catchAsync(Admission.renderTransferAppsQuery)
);

router.patch(
  "/:rid/card/removal/query",
  catchAsync(Admission.renderRemainCardRemovalQuery)
);

// FOR BUG //

router.get("/fee/heads/:id", catchAsync(Admission.renderFeeHeadsQuery));

router.patch("/find/receipt/:id", catchAsync(Admission.renderFindReceiptQuery));

router.patch("/order/query", catchAsync(Admission.renderOrder));

router.post(
  "/:uid/user/:aid/apply/valid/query",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionReceievedValidApplicationQuery)
);

router.patch("/all/order", catchAsync(Admission.renderAllOrderQuery));

router.patch(
  "/student/payment/query",
  catchAsync(Admission.renderFindStudentReceiptQuery)
);

router.patch(
  "/student/payment/heads/query",
  catchAsync(Admission.renderStudentHeadsQuery)
);

router.patch("/excel/bug", catchAsync(Admission.renderExcelBugQuery));

router.patch(
  "/student/structure/bug",
  catchAsync(Admission.renderStudentStructureBugQuery)
);

router.patch(
  "/student/structure/bug/query",
  catchAsync(Admission.renderStudentsStructureBugQuery)
);

router.get("/student/data", catchAsync(Admission.renderStudentDataQuery));

router.get(
  "/student/data/heads",
  catchAsync(Admission.renderStudentDataHeadsQuery)
);

router.patch("/data/card", catchAsync(Admission.renderCardUpdateQuery));

router.patch(
  "/fee/heads/card/:id",
  catchAsync(Admission.renderCardFeeHeadsQuery)
);

router.patch("/remove/dup/card", catchAsync(Admission.render_remove_dup_heads));

// Fixing Old Student Data

router.patch(
  "/all/old/data/receipt",
  catchAsync(Admission.render_old_data_receipt_query)
);

router.patch("/arrange/:cid", catchAsync(Admission.renderArrangeClassQuery));

router
  .route("/manage/tab/:aid")
  .patch(catchAsync(Admission.renderManageTabQuery));

router.patch(
  "/:aid/student/review/query",
  catchAsync(Admission.renderReviewStudentQuery)
);

router.patch(
  "/:rid/shift/government/to/applicable/query",
  catchAsync(Admission.renderShiftGovernmentApplicableQuery)
);

router.patch(
  "/:rid/shift/applicable/to/government/query",
  catchAsync(Admission.renderShiftApplicableToGovernmentQuery)
);

router.patch(
  "/:aid/all/outstanding/query",
  catchAsync(Admission.renderAllOutstandingQuery)
);

router.patch(
  "/:fid/readmission/student/:sid/query",
  catchAsync(Admission.renderReAdmissionQuery)
);

router.get(
  "/one/institute/charges/:id/query",
  catchAsync(Admission.renderInstituteChargesQuery)
);

router.patch(
  "/:fid/all/fee/structures",
  catchAsync(Admission.renderAllFeeStructureListQuery)
);

router.patch("/all/student/query", catchAsync(Admission.renderAllStudentQuery));

router.patch(
  "/all/student/query/list",
  catchAsync(Admission.renderAllStudentQueryNestedRemove)
);

router.patch(
  "/all/government/card/query",
  catchAsync(Admission.government_card_removal_query)
);

// For Moving Outer Array To Inner Nested Card Array

router.patch(
  "/all/card/query",
  catchAsync(Admission.renderTransferAllCardQuery)
);

// Student Admissio Amount Status API

router.patch(
  "/all/student/status/query",
  catchAsync(Admission.renderAllStudentStatusQuery)
);

router.patch(
  "/all/student/outstanding/query",
  catchAsync(Admission.renderAllStudentArray)
);

// Remove Government Card API

router.patch(
  "/charges/add/all/query",
  catchAsync(Admission.renderChargesCardQuery)
);

router
  .route("/validate/structure/query")
  .patch(catchAsync(Admission.renderValidateAppQuery));

router
  .route("/all/remaining/card/update")
  .patch(catchAsync(Admission.renderRemainingCardQuery));

router
  .route("/all/government/card/update/query")
  .patch(catchAsync(Admission.renderGovernmentCardUpdateQuery));

router.patch(
  "/all/one/fees/card/query",
  catchAsync(Admission.one_fees_card_query)
);

router.post(
  "/:sid/allotted/student/:aid/pay/refund",
  catchAsync(Admission.cancelAllottedAdmissionApplication)
);

router
  .route("/all/fee/heads/move/query")
  .patch(catchAsync(Admission.renderFeeHeadsMoveGovernmentCardUpdateQuery));

router.route("/remove/tta/query").patch(catchAsync(Admission.removeTTOAQuery));

router
  .route("/set/receipt/tta/query")
  .patch(catchAsync(Admission.setFeeStructureToFeeReceiptAQuery));

router.patch(
  "/student/deposit/query",
  catchAsync(Admission.renderDepositQuery)
);

router.patch(
  "/student/deposit/to/zero/query",
  catchAsync(Admission.renderDepositToZeroQuery)
);
router
  .route("/:aid/all/cancel/app/query")
  .get(catchAsync(Admission.renderAllCancelAppsQuery));

//
router
  .route("/:aid/all/cancel/app/query/sequence")
  .get(catchAsync(Admission.renderAllCancelAppsSequenceQuery));

router
  .route("/:pid/multiple/installment/query")
  .patch(catchAsync(Admission.renderMultipleInstallmentQuery));

router.patch(
  "/:fsid/update/fs",
  catchAsync(Admission.renderFeeStructureUpdate)
);

router.get(
  "/:aid/all/readmission/query",
  catchAsync(Admission.renderAllReadmissionQuery)
);

router.patch(
  "/:aid/fees/student/:sid/re/admission",
  catchAsync(Admission.renderReAdmissionFeesQuery)
);

router.get(
  "/:aid/all/confirmed/readmission/query",
  catchAsync(Admission.renderAllConfirmedReadmissionQuery)
);

router.patch(
  "/:nid/delete/:rid/installment/card/query",
  catchAsync(Admission.renderDeleteInstallmentCardQuery)
);

router.get(
  "/:fid/all/delete/logs/query",
  catchAsync(Admission.renderAllDeleteLogsQuery)
);

router.post(
  "/new/form/:fcid/section/student/query",
  catchAsync(Admission.render_new_student_form_section_query)
);

router.post(
  "/new/form/:fcid/checklist/query",
  catchAsync(Admission.render_new_student_form_checklist_query)
);

router.patch(
  "/edit/form/:fcid/section/query",
  catchAsync(Admission.render_edit_student_form_section_query)
);

router.patch(
  "/edit/form/:fcid/section/checklist/query",
  catchAsync(Admission.render_edit_student_form_section_checklist_query)
);

router.patch(
  "/shuffle/form/:fcid/section/student/query",
  catchAsync(Admission.render_shuffle_student_form_section_query)
);

router.get(
  "/one/form/:fcid/section/query",
  catchAsync(Admission.render_one_student_form_section_query)
);

router.get(
  "/one/form/:id/section/enable/query",
  catchAsync(Admission.render_one_student_form_section_enable_query)
);

router.patch(
  "/one/fee/receipt/query",
  catchAsync(Admission.render_one_fee_receipt_query)
);
// Optional Subject
router.post(
  "/:aid/add/subject/query",
  catchAsync(Admission.render_add_subject_query)
);

router.delete(
  "/:aid/delete/subject/query",
  catchAsync(Admission.render_delete_subject_query)
);

router.get(
  "/:aid/all/subject/query",
  catchAsync(Admission.render_all_subject_query)
);

router.get(
  "/:osid/one/subject/query",
  catchAsync(Admission.render_one_subject_query)
);

router.post(
  "/:sgid/add/subject/group/query",
  catchAsync(Admission.render_add_subject_group_query)
);

router.delete(
  "/:sgid/delete/subject/group/query",
  catchAsync(Admission.render_delete_subject_group_query)
);

router.get(
  "/:sgid/all/subject/group/query",
  catchAsync(Admission.render_all_subject_group_query)
);

router.get(
  "/:osid/one/subject/group/query",
  catchAsync(Admission.render_one_subject_group_query)
);

router.get(
  "/:did/all/subject/list/query",
  catchAsync(Admission.render_all_subject_list_query)
);

router.post(
  "/:ssid/add/subject/group/select/query",
  catchAsync(Admission.render_add_subject_group_select_query)
);

router.get(
  "/:aid/all/subject/data/query",
  catchAsync(Admission.render_all_subject_data_query)
);

router.post(
  "/:aid/select/group/query",
  catchAsync(Admission.render_select_group_query)
);

router.patch("/new/form/:sid", catchAsync(Admission.form));

router.post(
  "/:id/pinned/application/query",
  catchAsync(Admission.renderApplicationPinnedQuery)
);

router.post(
  "/:id/un/pinned/application/query",
  catchAsync(Admission.renderApplicationUnPinnedQuery)
);

// Ongoing App Pinned
router.get(
  "/:id/all/ongoing/application/pinned",
  catchAsync(Admission.retieveAdmissionAdminAllApplicationPinned)
);

router.patch("/new/db/delete", catchAsync(Admission.db_delete));

// Merged Ongoing App
router.get(
  "/:aid/all/merged/ongoing/application",
  catchAsync(Admission.retieveAdmissionAdminAllMergedApplication)
);

// All Selected Application
router.get(
  "/:aid/all/merged/ongoing/docs/application",
  catchAsync(Admission.fetchAllSelectMergedApplication)
);

// All Fee Collected Application
router.get(
  "/:aid/all/merged/ongoing/fees/collect/application",
  catchAsync(Admission.fetchAllFeeCollectedMergedApplication)
);

// All Confirmed Application
router.get(
  "/:aid/all/merged/ongoing/confirm/application",
  catchAsync(Admission.fetchAllConfirmedMergedApplication)
);

router.patch(
  "/new/db/insertion/app/:aid",
  catchAsync(Admission.retieveAdmissionAdminInsertion)
);

// All Student Revertion From DOCS TAB
router.patch(
  "/revert/data/:aid",
  catchAsync(Admission.retrieve_admission_revertion_query)
);

// All Student Reject From APPLICATION TAB
router.patch(
  "/revert/data/reject/:aid",
  catchAsync(Admission.retrieve_admission_revertion_reject_query)
);

// One Student Reject + Modify Form
router.post(
  "/:sid/student/:aid/cancel/app/form/modify",
  // isLoggedIn,
  catchAsync(Admission.retrieveAdmissionCancelApplicationModify)
);

router.get(
  "/:aid/all/subject/select",
  catchAsync(Admission.render_subject_select_query)
);

router.get(
  "/:sid/one/subject/all/:aid/student",
  catchAsync(Admission.render_one_subject_student_query)
);

router.patch(
  "/:sid/change/subject/query",
  catchAsync(Admission.render_one_subject_change_student_query)
);

router.patch(
  "/:fid/change/fee/receipt/query",
  catchAsync(Admission.render_one_fee_receipt_change_student_query)
);

router.patch(
  "/all/student/name",
  catchAsync(Admission.renderAutoStudentNameQuery)
);

router.post(
  "/reverse/student/:aid/allot/class",
  catchAsync(Admission.retrieveClassAllotQueryReverse)
);

router.patch("/all/group/name", catchAsync(Admission.subject_student_class));

router.get("/:sid/staff/name/only", catchAsync(Admission.staff_name_only));

router.patch(
  "/:aid/app/intake/query",
  catchAsync(Admission.render_admission_intake_query)
);

router.patch("/all/move/to", catchAsync(Admission.render_all_move_to_confirm));

router.patch(
  "/:aid/docs/collect/query",
  catchAsync(Admission.render_admission_docs_collect_query)
);

router.patch("/all/excess/to", catchAsync(Admission.render_excess));

router.patch(
  "/form/:aid/print/case",
  catchAsync(Admission.admission_form_print_case_query)
);

// router.get(
//   "/:aid/all/subject/query",
//   catchAsync(Admission.render_all_subject_query)
// );

router.get(
  "/:aid/one/application/subject/sequence",
  catchAsync(Admission.render_one_application_subject_sequence_query)
);

router.patch("/new/app", catchAsync(Admission.new_app));

router.patch("/check/global", catchAsync(Admission.check_global));

router.patch("/check/structure", catchAsync(Admission.check_structure));

router.patch(
  "/promote/current/year/institute/:id/student/category/list",
  catchAsync(Admission.promote_currrent_year_institute_query)
);

router.patch(
  "/:aid/all/documents/export",
  catchAsync(Admission.all_documents_export_query)
);

router.get(
  "/:aid/all/students/query",
  catchAsync(Admission.all_documents_export_students_query)
);

router.post(
  "/:aid/document/trigger/alarm",
  catchAsync(Admission.renderTriggerAlarmDocumentQuery)
);

router.get(
  "/:aid/one/documents/list",
  catchAsync(Admission.one_documents_students_query)
);

router.patch(
  "/:did/one/student/pending/documents/:sid",
  catchAsync(Admission.one_student_documents_pending_query)
);

router.patch("/duplicate/fees/:id", catchAsync(Admission.duplicate_fees_query));

router.post(
  "/new/dynamic/form/:fcid/section/student/query",
  catchAsync(Admission.render_new_student_dynamic_form_section_query)
);

router.patch(
  "/edit/dynamic/form/:fcid/section/query",
  catchAsync(Admission.render_edit_student_dynamic_form_section_query)
);

module.exports = router;
