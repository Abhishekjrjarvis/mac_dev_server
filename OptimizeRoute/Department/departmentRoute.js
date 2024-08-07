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

router.patch(
  "/:did/add/application",
  catchAsync(Depart.renderAddApplicationQuery)
);

router.get(
  "/:did/all/application",
  catchAsync(Depart.retieveDepartmentAllApplication)
);

router.get(
  "/:aid/application/:sid/tab/query",
  catchAsync(Depart.render_application_tab_query)
);
module.exports = router;
