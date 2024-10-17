const express = require("express");
const router = express.Router();
const Filter = require("../../OptimizeController/Filterization/filter");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router.get("/by/learn", isLoggedIn, catchAsync(Filter.retrieveByLearnQuery));

router.get("/by/answer", isLoggedIn, catchAsync(Filter.retrieveByAnswerQuery));

router.get(
  "/by/participate",
  isLoggedIn,
  catchAsync(Filter.retrieveByParticipateQuery)
);

router.get("/by/date", catchAsync(Filter.filterByDate));

router.get(
  "/by/date/incomes",
  // isLoggedIn,
  catchAsync(Filter.filterByDateIncomes)
);

router.get(
  "/by/date/expenses",
  isLoggedIn,
  catchAsync(Filter.filterByDateExpenses)
);

router.get(
  "/by/:id/student",
  // isLoggedIn,
  catchAsync(Filter.retrieveByActiveStudent)
);

router.get(
  "/by/:id/staff",
  // isLoggedIn,
  catchAsync(Filter.retrieveByActiveStaff)
);

router.get(
  "/by/class/catalog/:cid",
  isLoggedIn,
  catchAsync(Filter.retrieveApproveCatalogArrayFilter)
);

router.patch(
  "/pending/fee/:aid",
  // isLoggedIn,
  catchAsync(Filter.retrievePendingFeeFilter)
);

router.get(
  "/transaction/history/:id",
  // isLoggedIn,
  catchAsync(Filter.renderFinanceTransactionHistoryQuery)
);

router.get(
  "/heads/by/:fsid",
  // isLoggedIn,
  catchAsync(Filter.renderFeeHeadsStructureQuery)
);

router.patch(
  "/heads/by/:fid/receipt/query",
  // isLoggedIn,
  catchAsync(Filter.renderFeeHeadsStructureReceiptQuery)
);

router.patch(
  "/update",
  // isLoggedIn,
  catchAsync(Filter.renderUpdate)
);

router.get(
  "/by/date/collection/:aid/query",
  // isLoggedIn,
  catchAsync(Filter.renderApplicationFilterByDateCollectionQuery)
);

router.patch(
  "/application/export/:appId",
  catchAsync(Filter.renderApplicationListQuery)
);

router.patch(
  "/application/export/:appId/hostel",
  catchAsync(Filter.renderHostelApplicationListQuery)
);

// router.get('/filter/by/date/funds',isLoggedIn, catchAsync(Filter.filterByDateFunds))

router.get("/tally/price", catchAsync(Filter.renderTallyPriceQuery));

router.patch(
  "/pending/fee/:hid/hostel/query",
  // isLoggedIn,
  catchAsync(Filter.retrieveHostelPendingFeeFilterQuery)
);

router.get(
  "/heads/by/:fid/receipt/hostel/query",
  catchAsync(Filter.renderHostelFeeHeadsStructureReceiptQuery)
);

router.patch(
  "/heads/by/:fid/receipt/query/repay/price/calculate",
  catchAsync(Filter.renderFeeHeadsStructureReceiptRePayPriceQuery)
);

router.patch(
  "/heads/by/:fid/receipt/query/repay",
  catchAsync(Filter.renderFeeHeadsStructureReceiptRePayQuery)
);

router.patch(
  "/by/student/:cid/query",
  // isLoggedIn,
  catchAsync(Filter.renderNormalStudentQuery)
);

router.patch(
  "/by/student/statistics/:bid/query",
  // isLoggedIn,
  catchAsync(Filter.renderStudentStatisticsQuery)
);

router.patch(
  "/by/universal/student/statistics/:bid/query",
  // isLoggedIn,
  catchAsync(Filter.renderStudentStatisticsUniversalQuery)
);

router.patch(
  "/by/student/statistics/excel/export/query",
  // isLoggedIn,
  catchAsync(Filter.renderStudentStatisticsExcelQuery)
);

router.patch(
  "/by/fees/statistics/:fid/query",
  // isLoggedIn,
  catchAsync(Filter.renderStudentFeesStatisticsQuery)
);

router.get(
  "/by/overall/fees/statistics/:fid/query",
  // isLoggedIn,
  catchAsync(Filter.renderOverallStudentFeesStatisticsQuery)
);

router.get(
  "/by/overall/admission/fees/statistics/:fid/query",
  // isLoggedIn,
  catchAsync(Filter.renderOverallStudentAdmissionFeesStatisticsQuery)
);

router.patch(
  "/scholar/data/history/:id/query",
  catchAsync(Filter.renderFinanceScholarTransactionHistoryQuery)
);

router.patch("/:cid/all/student", catchAsync(Filter.renderClassStudentQuery));

router.patch(
  "/internal/heads/by/:fid/receipt/query",
  // isLoggedIn,
  catchAsync(Filter.renderInternalFeeHeadsStructureReceiptQuery)
);

router.patch(
  "/by/excess/fees/export/query",
  // isLoggedIn,
  catchAsync(Filter.renderStudentExcessFeesExcelQuery)
);

router.patch(
  "/by/refund/fees/export/query",
  // isLoggedIn,
  catchAsync(Filter.renderStudentRefundFeesExcelQuery)
);

router.patch(
  "/by/review/array/:aid",
  catchAsync(Filter.renderReviewApplicationFilter)
);

router.patch(
  "/by/certificate/query",
  catchAsync(Filter.renderCertificateFilterQuery)
);

router.patch(
  "/:id/all/student/message/filter/query",
  catchAsync(Filter.renderAllStudentMessageQuery)
);

router.patch(
  "/:lid/by/department/query",
  catchAsync(Filter.renderFilterByDepartmentQuery)
);

router.patch(
  "/by/fee/structure/:did/query",
  // isLoggedIn,
  catchAsync(Filter.renderFeeStructureQuery)
);

router.patch(
  "/:did/all/timetable/export/query",
  catchAsync(Filter.renderTimeTableFilterByDepartmentQuery)
);

router.patch(
  "/:frid/all/non-applicable/fees/query",
  catchAsync(Filter.renderNonApplicableFeesQuery)
);

router.patch(
  "/:fid/all/deposit/query",
  catchAsync(Filter.renderAllDepositQuery)
);

router.patch(
  "/:fid/all/refund/deposit/query",
  catchAsync(Filter.renderAllRefundDepositQuery)
);

router.patch(
  "/:fid/all/exemption/query",
  catchAsync(Filter.renderAllExemptionQuery)
);

router.patch(
  "/:aid/cancel/export/query",
  catchAsync(Filter.renderCancelExportQuery)
);

router.patch("/all/classwise/query", catchAsync(Filter.renderClassWiseQuery));

router.get("/:fid/receipt/to/daybook", Filter.renderAllDayBookReceipt);

router.get("/:fid/payment/to/daybook", Filter.renderAllDayBookPayment);

router.patch("/:pid/all/slip/query", catchAsync(Filter.renderAllSlipQuery));

router.patch(
  "/:fid/daybook/heads/wise",
  catchAsync(Filter.render_daybook_heads_wise)
);

router.get("/:baid/all/daybook", catchAsync(Filter.render_daybook_query));

router.patch(
  "/:baid/all/daybook/edit",
  catchAsync(Filter.render_daybook_edit_query)
);

router.delete(
  "/:baid/all/daybook/delete",
  catchAsync(Filter.render_daybook_delete_query)
);

router.patch("/insert/master/daybook", catchAsync(Filter.fee_master_linking));

router.patch(
  "/:sid/subject/:aid/application/export",
  catchAsync(Filter.render_subject_application_export)
);

router.patch(
  "/:aid/intake/record/query",
  catchAsync(Filter.render_app_intake_query)
);

router.get(
  "/:aid/all/admission/intake",
  catchAsync(Filter.render_admission_intake_set_query)
);

router.patch(
  "/:aid/all/admission/intake/edit",
  catchAsync(Filter.render_admission_intake_set_edit_query)
);

router.delete(
  "/:aid/all/admission/intake/delete",
  catchAsync(Filter.render_admission_intake_set_delete_query)
);

router.patch(
  "/combined/application/export/:appId",
  catchAsync(Filter.renderApplicationCombinedListQuery)
);

router.patch(
  "/:fid/daybook/other/fees/heads/wise",
  catchAsync(Filter.render_other_fees_daybook_heads_wise)
);

router.patch(
  "/allotted/application/export/:appId",
  catchAsync(Filter.renderApplicationAllottedListQuery)
);

router.patch(
  "/:fid/hostel/daybook/heads/wise",
  catchAsync(Filter.render_hostel_daybook_heads_wise)
);

router.patch(
  "/:aid/outstanding/applicable/query",
  catchAsync(Filter.renderNormalApplicableOutStandingStudentQuery)
);

router.patch(
  "/:fid/all/settlement/amount",
  catchAsync(Filter.render_admin_daybook_heads_wise)
);

router.patch(
  "/:aid/all/student/list/export",
  catchAsync(Filter.renderAllStudentApplicableOutStandingStudentQuery)
);

router.patch(
  "/:fid/all/combined/daybook",
  catchAsync(Filter.render_combined_daybook_heads_wise)
);

router.patch(
  "/allotted/dse/application/export/:appId",
  catchAsync(Filter.renderApplicationDSEAllottedListQuery)
);

router.get(
  "/:uid/all/department/query",
  catchAsync(Filter.universal_batch_all_department)
);

router.patch(
  "/:fid/admission/fees/applicable/query",
  catchAsync(Filter.renderNormalAdmissionFeesStudentQuery)
);

router.get(
  "/:id/all/cashier/query",
  catchAsync(Filter.render_all_cashier_query)
);

router.get("/all/feess", catchAsync(Filter.fees_data));

router.patch("/dob/query/:id", catchAsync(Filter.dob_query));

router.patch(
  "/:fid/all/combined/summary/bank/daybook",
  catchAsync(Filter.render_combined_summary_bank_daybook_heads_wise)
);

router.patch(
  "/:fid/all/combined/detail/bank/daybook",
  catchAsync(Filter.render_combined_detail_bank_daybook_heads_wise)
);

router.patch(
  "/by/new/admission/fees/statistics/:fid/query",
  catchAsync(Filter.render_new_admission_fees_statistics_query)
);

router.patch(
  "/by/academic/universal/student/statistics/:bid/query",
  catchAsync(Filter.renderStudentAcademicStatisticsUniversalQuery)
);

router.get(
  "/show/academic/universal/student/statistics/:aid/query",
  catchAsync(Filter.renderOverallStudentAdmissionFeesAcademicStatisticsQuery)
);

module.exports = router;
