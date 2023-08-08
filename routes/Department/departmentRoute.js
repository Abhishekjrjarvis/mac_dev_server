const express = require("express");
const router = express.Router();
const Depart = require("../../controllers/Department/departmentController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");

router.get("/:id/student/form", catchAsync(Depart.renderStudentFormQuery));

router.patch(
  "/:id/form/setting/update",
  catchAsync(Depart.renderFormUpdateQuery)
);

module.exports = router;
