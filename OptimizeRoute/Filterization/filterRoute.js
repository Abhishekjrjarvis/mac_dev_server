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

router.patch("/:cid/all/student", catchAsync(Filter.renderClassStudentQuery))

module.exports = router;
