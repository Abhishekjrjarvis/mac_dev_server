const express = require("express");
const router = express.Router();
const Finance = require("../../controllers/Finance/financeController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Assigning Finance Department To Staff
router.post(
  "/ins/:id/staff/:sid",
  isLoggedIn,
  isApproved,
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
router.patch("/bank/details/:id/update", catchAsync(Finance.updateBankDetail));

// Fetch Finance Details
router.get(
  "/:fid/dashboard",
  isLoggedIn,
  catchAsync(Finance.retrieveFinanceQuery)
);

// Get Details of Finance Head
router.get("/detail/:id", isLoggedIn, catchAsync(Finance.getFinanceDetail));

// Info of Finance Department
router.post("/info/:fid", isLoggedIn, catchAsync(Finance.getFinanceInfo));

// Added Income
router.post(
  "/:fid/income",
  upload.single("file"),
  catchAsync(Finance.getIncome)
);

// All Cash Incomes
router.post("/all/incomes", isLoggedIn, catchAsync(Finance.getAllIncomes));

// Add Expense
router.post(
  "/:fid/expense",
  //   isLoggedIn,
  upload.single("file"),
  catchAsync(Finance.getExpense)
);

// All Cash Expenses
router.post("/all/expenses", isLoggedIn, catchAsync(Finance.getAllExpense));

// All Finance Fee Online
router.post(
  "/all/fee/online/:id",
  isLoggedIn,
  catchAsync(Finance.getFinanceOnlineFee)
);

// Class Online Fee At Finance Department
router.post(
  "/class/:cid/total/online/fee",
  isLoggedIn,
  catchAsync(Finance.getClassOnlineFee)
);

// Class Offline Fee At Finance Department
router.post(
  "/class/:cid/total/offline/fee",
  isLoggedIn,
  catchAsync(Finance.getClassOfflineFee)
);

// Class Collected Fee At Finance Department
router.post(
  "/class/:cid/total/collected/fee",
  isLoggedIn,
  catchAsync(Finance.getClassCollectedFee)
);

// Class Collect Fee
router.get(
  "/:fid/class/collect",
  isLoggedIn,
  catchAsync(Finance.collectClassFee)
);

// Class Offline Fee Request
router.post(
  "/:fid/class/:cid/fee/:id/receieve",
  catchAsync(Finance.requestClassOfflineFee)
);

// Class Offline Fee Submitted
router.post(
  "/:fid/class/:cid/fee/:id/submit",
  catchAsync(Finance.submitClassOfflineFee)
);

// Class Offline Fee Incorrect
router.post(
  "/:fid/class/:cid/fee/:id/incorrect",
  catchAsync(Finance.classOfflineFeeIncorrect)
);

// Finance Online Payment Updated
router.post(
  "/:fid/online/payment/updated",
  isLoggedIn,
  catchAsync(Finance.updatePaymenFinance)
);

// Repay From Super-Admin to Institute-Admin
router.post(
  "/admin/:aid/ins/:id/repay",
  isLoggedIn,
  catchAsync(Finance.RepayBySuperAdmin)
);

// Payment Detail
router.get(
  "/:id/ins/bank/query",
  isLoggedIn,
  catchAsync(Finance.retrievePaymentDetail)
);

router.get("/:fid/dashboard/income", catchAsync(Finance.retrieveIncomeQuery));

router.get("/:fid/dashboard/expense", catchAsync(Finance.retrieveExpenseQuery));

router.get(
  "/:fid/dashboard/request/class",
  catchAsync(Finance.retrieveRequestAtFinance)
);

router.get(
  "/:fid/dashboard/submit/class",
  catchAsync(Finance.retrieveSubmitAtFinance)
);

router.get(
  "/:fid/dashboard/reject/class",
  catchAsync(Finance.retrieveRejectAtFinance)
);

router.get(
  "/:fid/dashboard/reject/class/remaining",
  catchAsync(Finance.retrieveRemainingAmount)
);

router.get(
  "/:fid/dashboard/income/balance",
  catchAsync(Finance.retrieveIncomeBalance)
);

router.get(
  "/:fid/dashboard/expense/balance",
  catchAsync(Finance.retrieveExpenseBalance)
);

router.get(
  "/:fid/dashboard/remain",
  catchAsync(Finance.retrieveRemainFeeBalance)
);

//

router.post("/:fid/add/emp/:sid", catchAsync(Finance.addEmpToFinance));

router.get("/:fid/emp/all", catchAsync(Finance.allEmpToFinance));

router.post("/:fid/add/payroll/:eid", catchAsync(Finance.addFieldToPayroll));

router.get("/:fid/sal/history", catchAsync(Finance.retrieveAllSalaryHistory));

router.get("/:eid/one/emp/detail", catchAsync(Finance.retrieveOneEmpQuery));
//

router.get(
  "/:fid/remaining/fee/list",
  catchAsync(Finance.retrieveRemainFeeList)
);

router.get("/:iid/income/detail", catchAsync(Finance.retrieveOneIncomeQuery));

router.get("/:eid/expense/detail", catchAsync(Finance.retrieveOneExpenseQuery));

router.get("/:fid/all/staff/array", catchAsync(Finance.retrieveAllStaffArray));

// router.get('/:fid/gateway/charges', catchAsync(Finance.retrievePaymentChargesQuery))

router.get(
  "/:fid/gst/income/liability",
  catchAsync(Finance.retrieveAllGSTIncome)
);

router.get("/:fid/gst/tax/credit", catchAsync(Finance.retrieveAllGSTInputTax));

router.get("/:fid/gst/b/to/c", catchAsync(Finance.retrieveAllBToCQuery));

router.get(
  "/:fid/gst/btoc/filter",
  catchAsync(Finance.retrieveAllBToCQueryArray)
);

module.exports = router;
