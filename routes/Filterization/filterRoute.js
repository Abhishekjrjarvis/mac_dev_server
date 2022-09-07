const express = require("express");
const router = express.Router();
const Filter = require("../../controllers/Filterization/filter");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router.get('/by/learn', catchAsync(Filter.retrieveByLearnQuery))

router.get('/by/answer', catchAsync(Filter.retrieveByAnswerQuery))

router.get('/by/participate', catchAsync(Filter.retrieveByParticipateQuery))

module.exports = router;
