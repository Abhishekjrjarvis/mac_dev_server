const express = require("express");
const router = express.Router();
const Filter = require("../../controllers/Filterization/filter");
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
  catchAsync(Filter.retrieveApproveCatalogArrayFilter)
);

router.patch(
  "/by/trigger/class/catalog/:cid",
  catchAsync(Filter.retrieveApproveCatalogArrayFilterTrigger)
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

// router.get(
//   "/heads/hostel/query",
//   catchAsync(Filter.renderHostelFeeHeadsStructureReceiptQueryStats)
// );

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
  "/by/certificate/:id/query",
  catchAsync(Filter.renderCertificateFilterQuery)
);

router.patch(
  "/:id/all/student/message/filter/query",
  catchAsync(Filter.renderAllStudentMessageQuery)
);

router.patch("/payment/data/query", catchAsync(Filter.renderPaymentDataQuery));

router.patch(
  "/bank/heads/by/:fid/receipt/query/repay",
  catchAsync(Filter.renderFeeHeadsStructureReceiptRePayQueryBank)
);

router.patch(
  "/by/certificate/logs/export/:id/query",
  catchAsync(Filter.certificate_logs_export_query)
);

module.exports = router;
