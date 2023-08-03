const express = require("express");
const router = express.Router();
const Academic = require("../../controllers/Academics/academicController");
const catchAsync = require("../../Utilities/catchAsync");

// router.post(
//   "/search/institute/search/student",
//   catchAsync(Guest.renderSearchInstituteByCodeQuery)
// );

// router.get(
//   "/all/topic",
//   catchAsync(Academic.renderSearchInstituteCodeQuery)
// );

// router.patch("/new/code", catchAsync(Guest.renderNewCodeQuery));

module.exports = router;
