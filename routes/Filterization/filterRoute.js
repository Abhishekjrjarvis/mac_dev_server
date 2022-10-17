const express = require("express");
const router = express.Router();
const Filter = require("../../controllers/Filterization/filter");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router.get('/by/learn', catchAsync(Filter.retrieveByLearnQuery))

router.get('/by/answer', catchAsync(Filter.retrieveByAnswerQuery))

router.get('/by/participate', catchAsync(Filter.retrieveByParticipateQuery))

router.get('/by/date', catchAsync(Filter.filterByDate))

router.get('/by/date/incomes', catchAsync(Filter.filterByDateIncomes))

router.get('/by/date/expenses', catchAsync(Filter.filterByDateExpenses))

router.get('/by/:id/student', catchAsync(Filter.retrieveByActiveStudent))

router.get('/by/:id/staff', catchAsync(Filter.retrieveByActiveStaff))

// router.get('/filter/by/date/funds', catchAsync(Filter.filterByDateFunds))
module.exports = router;
