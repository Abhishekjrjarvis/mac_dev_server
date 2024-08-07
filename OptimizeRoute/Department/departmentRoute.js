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
  "/:aid/application/:did/tab/query",
  catchAsync(Depart.render_application_tab_query)
);

router.get(
  "/:aid/selected/:did/tab/query",
  catchAsync(Depart.render_selected_tab_query)
);

router.get(
  "/:aid/fees/:did/tab/query",
  catchAsync(Depart.render_fees_tab_query)
);

router.get(
  "/:aid/confirm/:did/tab/query",
  catchAsync(Depart.render_confirm_tab_query)
);

router.get(
  "/:aid/review/:did/tab/query",
  catchAsync(Depart.render_review_tab_query)
);

router.get(
  "/:aid/allotted/:did/tab/query",
  catchAsync(Depart.render_allotted_tab_query)
);

router.get(
  "/:aid/cancelled/:did/tab/query",
  catchAsync(Depart.render_cancelled_tab_query)
);
module.exports = router;
