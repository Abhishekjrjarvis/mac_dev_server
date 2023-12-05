const express = require("express");
const router = express.Router();
const Depart = require("../../OptimizeController/Department/departmentController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");

router.get("/:did/student/form", catchAsync(Depart.renderStudentFormQuery));

router.patch(
  "/:did/form/setting/update",
  catchAsync(Depart.renderFormUpdateQuery)
);

module.exports = router;
