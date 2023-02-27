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

router.get("/by/date", isLoggedIn, catchAsync(Filter.filterByDate));

router.get(
  "/by/date/incomes",
  isLoggedIn,
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

router.get(
  "/pending/fee/:aid",
  // isLoggedIn,
  catchAsync(Filter.retrievePendingFeeFilter)
);

// router.get('/filter/by/date/funds',isLoggedIn, catchAsync(Filter.filterByDateFunds))
module.exports = router;
