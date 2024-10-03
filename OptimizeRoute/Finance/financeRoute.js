const express = require("express");
const router = express.Router();
const Finance = require("../../OptimizeController/Finance/financeController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Assigning Finance Department To Staff
router.post(
  "/ins/:id/finance/query",
  // isLoggedIn,
  // isApproved,
  catchAsync(Finance.getFinanceDepart)
);

// Upload Bank Details By Finance Head
router.post(
  "/add/bank/details/:id",
  isLoggedIn,
  catchAsync(Finance.uploadBankDetail)
);

// Remove Bank Details By Finance Head
router.post("/ins/bank/:id", isLoggedIn, catchAsync(Finance.removeBankDetail));

// Update Bank Details By Finance Head
router.patch(
  "/bank/details/:id/update",
  isLoggedIn,
  catchAsync(Finance.updateBankDetail)
);

// Fetch Finance Details
router.get(
  "/:fid/dashboard",
  // isLoggedIn,
  catchAsync(Finance.retrieveFinanceQuery)
);

// Added Income
router.post(
  "/:fid/income",
  // isLoggedIn,
  upload.single("file"),
  catchAsync(Finance.getIncome)
);

// All Cash Incomes
router.post("/all/incomes", isLoggedIn, catchAsync(Finance.getAllIncomes));

// Add Expense
router.post(
  "/:fid/expense",
  // isLoggedIn,
  upload.single("file"),
  catchAsync(Finance.getExpense)
);

// All Cash Expenses
router.post("/all/expenses", isLoggedIn, catchAsync(Finance.getAllExpense));

// Class Offline Fee Request
router.post(
  "/:fid/class/:cid/fee/:id/receieve",
  isLoggedIn,
  catchAsync(Finance.requestClassOfflineFee)
);

// Class Offline Fee Submitted
router.post(
  "/:fid/class/:cid/fee/:id/submit",
  isLoggedIn,
  catchAsync(Finance.submitClassOfflineFee)
);

// Class Offline Fee Incorrect
router.post(
  "/:fid/class/:cid/fee/:id/incorrect",
  isLoggedIn,
  catchAsync(Finance.classOfflineFeeIncorrect)
);

// Payment Detail
router.get(
  "/:id/ins/bank/query",
  isLoggedIn,
  catchAsync(Finance.retrievePaymentDetail)
);

router.get(
  "/:fid/dashboard/income",
  isLoggedIn,
  catchAsync(Finance.retrieveIncomeQuery)
);

router.get(
  "/:fid/dashboard/expense",
  isLoggedIn,
  catchAsync(Finance.retrieveExpenseQuery)
);

router.get(
  "/:fid/dashboard/request/class",
  isLoggedIn,
  catchAsync(Finance.retrieveRequestAtFinance)
);

router.get(
  "/:fid/dashboard/submit/class",
  isLoggedIn,
  catchAsync(Finance.retrieveSubmitAtFinance)
);

router.get(
  "/:fid/dashboard/reject/class",
  isLoggedIn,
  catchAsync(Finance.retrieveRejectAtFinance)
);

router.get(
  "/:fid/dashboard/income/balance",
  isLoggedIn,
  catchAsync(Finance.retrieveIncomeBalance)
);

router.get(
  "/:fid/dashboard/expense/balance",
  isLoggedIn,
  catchAsync(Finance.retrieveExpenseBalance)
);

router.get(
  "/:fid/dashboard/remain",
  isLoggedIn,
  catchAsync(Finance.retrieveRemainFeeBalance)
);

router.post(
  "/:fid/add/emp/:sid",
  // isLoggedIn,
  catchAsync(Finance.addEmpToFinance)
);

router.get("/:fid/emp/all", catchAsync(Finance.allEmpToFinance));

router.post(
  "/:fid/add/payroll/:eid",
  // isLoggedIn,
  catchAsync(Finance.addFieldToPayroll)
);

router.get(
  "/:fid/sal/history",
  // isLoggedIn,
  catchAsync(Finance.retrieveAllSalaryHistory)
);

router.get(
  "/:eid/one/emp/detail",
  // isLoggedIn,
  catchAsync(Finance.retrieveOneEmpQuery)
);
//

router.get(
  "/:fid/remaining/fee/list",
  isLoggedIn,
  catchAsync(Finance.retrieveRemainFeeList)
);

router.get(
  "/:iid/income/detail",
  isLoggedIn,
  catchAsync(Finance.retrieveOneIncomeQuery)
);

router.get(
  "/:eid/expense/detail",
  isLoggedIn,
  catchAsync(Finance.retrieveOneExpenseQuery)
);

router.get(
  "/:fid/all/staff/array",
  isLoggedIn,
  catchAsync(Finance.retrieveAllStaffArray)
);

// router.get('/:fid/gateway/charges',isLoggedIn, catchAsync(Finance.retrievePaymentChargesQuery))

router.get(
  "/:fid/gst/income/liability",
  isLoggedIn,
  catchAsync(Finance.retrieveAllGSTIncome)
);

router.get(
  "/:fid/gst/tax/credit",
  isLoggedIn,
  catchAsync(Finance.retrieveAllGSTInputTax)
);

router.get(
  "/:fid/gst/b/to/c",
  isLoggedIn,
  catchAsync(Finance.retrieveAllBToCQuery)
);

router.get(
  "/:fid/gst/btoc/filter",
  isLoggedIn,
  catchAsync(Finance.retrieveAllBToCQueryArray)
);

router.get(
  "/:fid/dashboard/cash/flow/transport/query",
  // isLoggedIn,
  catchAsync(Finance.retrieveRequestTransAtFinance)
);

router.post(
  "/:fid/transport/:tid/submit/:rid/status",
  // isLoggedIn,
  catchAsync(Finance.submitTransportFeeQuery)
);

router.get(
  "/:fid/all/inventory/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceInventoryQuery)
);

router.get(
  "/one/inventory/:inid/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceOneInventoryQuery)
);

router.get(
  "/:fid/dashboard/cash/flow/admission/query",
  // isLoggedIn,
  catchAsync(Finance.retrieveRequestAdmissionAtFinance)
);

router.post(
  "/:aid/admission/request",
  // isLoggedIn,
  catchAsync(Finance.renderAdmissionRequestFundsQuery)
);

router.post(
  "/:fid/admission/:aid/submit/:rid/status",
  // isLoggedIn,
  catchAsync(Finance.submitAdmissionFeeQuery)
);

router.get(
  "/:fid/dashboard/cash/flow/library/query",
  // isLoggedIn,
  catchAsync(Finance.retrieveRequestLibraryAtFinance)
);

router.post(
  "/:lid/library/request",
  // isLoggedIn,
  catchAsync(Finance.renderLibraryRequestFundsQuery)
);

router.post(
  "/:fid/library/:lid/submit/:rid/status",
  // isLoggedIn,
  catchAsync(Finance.submitLibraryFeeQuery)
);

// Add Bank Details in New Flow
router.post(
  "/:fid/add/bank/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceBankAddQuery)
);

router.get(
  "/:fid/all/bank/account",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceAllBankAccountQuery)
);

router.get(
  "/:acid/one/bank/account",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceOneBankQuery)
);

router.patch(
  "/:acid/bank/account/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceOneBankAccountQuery)
);

router.delete(
  "/:acid/bank/account/destroy/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceOneBankAccountDestroyQuery)
);

router.get(
  "/:fid/all/fee/category/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceAllFeeCategoryQuery)
);

router.post(
  "/:fid/fee/category/new",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceAddFeeCategory)
);

router.delete(
  "/:fcid/fee/category/delete/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceFeeCategoryDeleteQuery)
);

router.patch(
  "/:fcid/mark/scholar/applicable/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceMarkScholarApplicableQuery)
);

router.post(
  "/:fid/fee/structure/new",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceAddFeeStructure)
);

// Update Retrospective Based
router.patch(
  "/fee/structure/:fsid/retro/query",
  // isLoggedIn,
  catchAsync(Finance.renderFeeStructureRetroQuery)
);

router.delete(
  "/fee/structure/:fsid/retro/delete",
  // isLoggedIn,
  catchAsync(Finance.renderFeeStructureDeleteRetroQuery)
);

router.get(
  "/depart/:did/all/fee/structure",
  // isLoggedIn,
  catchAsync(Finance.renderDepartmentAllFeeStructure)
);

router.get(
  "/one/:fsid/structure",
  // isLoggedIn,
  catchAsync(Finance.renderOneFeeStructure)
);

router.get(
  "/:fid/all/exempt/query",
  // isLoggedIn,
  catchAsync(Finance.renderAllFinanceExempt)
);

router.get(
  "/:fid/all/government/query",
  // isLoggedIn,
  catchAsync(Finance.renderAllFinanceGovernment)
);

router.get(
  "/:frid/one/receipt",
  // isLoggedIn,
  catchAsync(Finance.renderOneFeeReceipt)
);

router.get(
  "/:frid/one/transport/receipt",
  // isLoggedIn,
  catchAsync(Finance.renderOneTransportFeeReceipt)
);

router.patch(
  "/:fid/update/payment/mode",
  // isLoggedIn,
  catchAsync(Finance.renderUpdatePaymentModeQuery)
);

router.get(
  "/:fid/all/bank/details",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceAllBankDetails)
);

router.post("/add/body", catchAsync(Finance.addBody));

router.post(
  "/:fid/fee/master/new",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceAddFeeMaster)
);

router.get(
  "/:fid/all/master/head/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceAllMasterHeadQuery)
);

router.patch(
  "/fee/master/:fmid/edit/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceEditFeeMasterQuery)
);

router.delete(
  "/:fid/fee/master/:fmid/destroy/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceDeleteFeeMasterQuery)
);

router.get(
  "/:fid/all/master/head/other/query",
  // isLoggedIn,
  catchAsync(Finance.renderFinanceAllMasterHeadOtherQuery)
);

router.get(
  "/:id/all/export/excel/array",
  catchAsync(Finance.renderAllExportExcelArrayQuery)
);

router.patch(
  "/:id/export/excel/:exid/edit",
  catchAsync(Finance.renderEditOneExcel)
);

router.delete(
  "/:id/export/excel/:exid/destroy/query",
  catchAsync(Finance.renderDeleteOneExcel)
);

router.get(
  "/:fid/master/deposit/query",
  catchAsync(Finance.renderFinanceMasterDepositQuery)
);

router.get(
  "/:fmid/master/all/deposit/array",
  catchAsync(Finance.renderFinanceMasterAllDepositArray)
);

router.patch(
  "/:fmid/refund/deposit/:sid/query",
  catchAsync(Finance.renderFinanceMasterDepositRefundQuery)
);

router.get(
  "/:fid/master/all/refund/deposit/history",
  catchAsync(Finance.renderFinanceMasterAllDepositHistory)
);

router.post(
  "/:fid/add/payroll/master/query",
  catchAsync(Finance.renderFinanceNewPayrollMasterQuery)
);

router.get(
  "/:fid/all/payroll/master",
  catchAsync(Finance.renderFinanceAllPayrollMasterQuery)
);

router.get(
  "/one/payroll/master/:pmid/all/monthwise",
  catchAsync(Finance.renderFinanceOnePayrollMasterAllMonthQuery)
);

router.get(
  "/one/payroll/master/one/monthwise/:mwid/all/emp",
  catchAsync(Finance.renderFinanceOnePayrollMasterOneMonthAllEmpQuery)
);

router.patch(
  "/:fid/one/payroll/master/:mwid/mark/pay/expense",
  catchAsync(Finance.renderFinanceOnePayrollMasterMarkPayExpenseQuery)
);

router.get(
  "/:fid/dashboard/cash/flow/hostel/query",
  catchAsync(Finance.retrieveRequestHostelAtFinance)
);

router.post(
  "/:hid/hostel/request",
  catchAsync(Finance.renderHostelRequestFundsQuery)
);

router.post(
  "/:fid/hostel/:hid/submit/:rid/status",
  catchAsync(Finance.submitHostelFeeQuery)
);

router.patch(
  "/:fsid/existing/retro/update/structure",
  catchAsync(Finance.renderExistRetroStructureQuery)
);

router.patch(
  "/select/:fid/secondary/structure/query",
  catchAsync(Finance.renderSecondaryStructureQuery)
);

router.delete("/:did/delete/structure", catchAsync(Finance.delete_structure));

// router.patch("/:did/edit/structure", catchAsync(Finance.edit_structure));

// router.get("/:id/all/student", catchAsync(Finance.all_student));

// router.get("/edit/remaining/fees", catchAsync(Finance.RemainingFeesQuery));

// router.patch("/update/trans", catchAsync(Finance.addOrder));

// router.patch("/remain/add", catchAsync(Finance.remainAdd));

// router.patch("/update/alias", catchAsync(Finance.updateAlias));

router.patch(
  "/:fid/valid/bank/query/:aid",
  catchAsync(Finance.renderValidBankQuery)
);

router
  .route("/internal/fee/:fid")
  .post(catchAsync(Finance.renderNewInternalFeesQuery));

router
  .route("/all/internal/fee/:fid")
  .get(catchAsync(Finance.renderAllInternalFeesQuery));

router
  .route("/manage/tab/:fid")
  .patch(catchAsync(Finance.renderManageTabQuery));

router
  .route("/validate/structure/query")
  .patch(catchAsync(Finance.renderValidateStructureQuery));

router
  .route("/:fid/all/department/query")
  .get(catchAsync(Finance.renderFinanceDepartmentQuery));

router
  .route("/:fid/all/upload/excel/query")
  .patch(catchAsync(Finance.renderFinanceUploadAllExcelQuery));

router
  .route("/valid/scholar/query")
  .patch(catchAsync(Finance.renderValidScholarQuery));

router
  .route("/:fid/one/internal/fees/query")
  .get(catchAsync(Finance.renderOneInternalFeesQuery));

router
  .route("/:fid/all/mismatch/excel/query")
  .get(catchAsync(Finance.renderAllMismatchQuery));

router
  .route("/refresh/scholarship/funds/query")
  .patch(catchAsync(Finance.renderRefreshScholarshipFundsQuery));

router
  .route("/scholarship/funds/query")
  .get(catchAsync(Finance.renderScholarshipFundsQuery));

router.patch(
  "/fee/structure/code/query",
  catchAsync(Finance.renderFeeStructureCodeQuery)
);

router.get(
  "/:fid/funds/tab/segregation/query",
  catchAsync(Finance.renderFundsTabSegregationQuery)
);

router.patch(
  "/:fsid/mark/society/query",
  catchAsync(Finance.render_mark_society_head_query)
);

router.patch(
  "/:fid/control/receipt/query",
  catchAsync(Finance.render_control_receipt_query)
);

router
  .route("/other/fee/:fid")
  .post(catchAsync(Finance.renderNewOtherFeesQuery));

router
  .route("/non/existing/other/fee/:fid")
  .post(catchAsync(Finance.renderNewOtherFeesNonExistingQuery));

router
  .route("/all/other/fee/:fid")
  .get(catchAsync(Finance.renderAllOtherFeesQuery));

router
  .route("/one/other/fee/:ofid/student/list")
  .get(catchAsync(Finance.renderOneOtherFeesStudentListQuery));

router
  .route("/one/edit/other/fee/:ofid")
  .patch(catchAsync(Finance.render_one_other_fees_edit_query));

router
  .route("/one/student/all/fees/:sid")
  .get(catchAsync(Finance.render_one_student_all_fees));

router
  .route("/fee/struct/:fid/existed")
  .patch(catchAsync(Finance.render_mark_society_head_existed));

router.get(
  "/:fid/all/exist/fee/structure",
  catchAsync(Finance.renderFinanceAllFeeStructure)
);

router.get(
  "/:frid/one/receipt/other/fees",
  catchAsync(Finance.renderOneOtherFeeReceipt)
);

router
  .route("/collect/other/fee/:fid")
  .post(catchAsync(Finance.renderOtherFeesCollectQuery));

router.patch(
  "/email/student/query",
  catchAsync(Finance.all_email_student_query)
);

router.patch("/delete/fees", catchAsync(Finance.deleteFeesQuery));

router
  .route("/add/student/other/fee/:fid")
  .post(catchAsync(Finance.renderNewOtherFeesAddStudentQuery));

router
  .route("/remove/student/other/fee/:ofid")
  .post(catchAsync(Finance.renderNewOtherFeesRemoveStudentQuery));

router
  .route("/add/non/existing/other/fees/:fid")
  .post(catchAsync(Finance.renderExistNonOtherFeesAddStudentQuery));

router
  .route("/add/one/student/other/fee/:fid")
  .post(catchAsync(Finance.renderNewOneOtherFeesAddStudentQuery));

router
  .route("/one/non/existing/other/fee/:ofid/student/list")
  .get(catchAsync(Finance.renderOneNonExistingOtherFeesStudentListQuery));

router
  .route("/all/other/exam/fee/:fid")
  .get(catchAsync(Finance.renderAllExamOtherFeesQuery));

router
  .route("/one/other/fee/:ofid/student/list/export")
  .patch(catchAsync(Finance.renderOneOtherFeesStudentListExportQuery));

router
  .route("/control/:fid/invoice/pattern")
  .patch(catchAsync(Finance.render_control_invoice_pattern));

router
  .route("/:fid/all/account/query")
  .get(catchAsync(Finance.render_all_account_query));

router
  .route("/one/non/existing/other/fee/:ofid/student/list/export")
  .patch(
    catchAsync(Finance.renderOneNonExistingOtherFeesStudentListExportQuery)
  );

router
  .route("/fees/insertion/query")
  .patch(catchAsync(Finance.render_fees_insertion_query));

router
  .route("/one/combined/other/fee/:ofid/student/list/export")
  .patch(catchAsync(Finance.renderOneCombinedOtherFeesStudentListExportQuery));

router.delete(
  "/one/fee/:fid/delete/other/:ofid",
  catchAsync(Finance.delete_other_fees_receipt_query)
);

router.patch(
  "/dublicate/receipt/:fid/query",
  catchAsync(Finance.finance_receipt_dublicate_query)
);

router
  .route("/one/duplicate/combined/other/fee/:ofid/student/list/export")
  .patch(
    catchAsync(
      Finance.renderOneDuplicateCombinedOtherFeesStudentListExportQuery
    )
  );

router.patch(
  "/add/:fid/miscellenous/fee/message",
  catchAsync(Finance.add_miscellenous_fee_message)
);

router.patch(
  "/regenerate/admission/fee/receipt/:frid/query",
  catchAsync(Finance.finance_admission_fee_receipt_generate_query)
);

module.exports = router;
