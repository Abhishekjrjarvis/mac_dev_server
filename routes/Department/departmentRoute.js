const express = require("express");
const router = express.Router();
const Depart = require("../../controllers/Department/departmentController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");

router.get("/:did/student/form", catchAsync(Depart.renderStudentFormQuery));

router.patch(
  "/:did/form/setting/update",
  catchAsync(Depart.renderFormUpdateQuery)
);

router
  .route("/tab/manage/:did/query")
  .get(catchAsync(Depart.getDepartmentTabManageQuery))
  .patch(catchAsync(Depart.updateDepartmentTabManageQuery));


router.patch(
    "/shuffle/form/:fcid/section/student/query",
    catchAsync(Depart.render_shuffle_student_form_section_query)
);
  
router.get(
  "/one/form/:fcid/section/query",
  catchAsync(Depart.render_one_student_form_section_query)
);

router.get(
  "/one/form/:did/section/enable/query",
  catchAsync(Depart.render_one_student_form_section_enable_query)
);

router.post(
  "/new/form/:fcid/section/student/query",
  catchAsync(Depart.render_new_student_form_section_query)
);

router.post(
  "/new/form/:fcid/checklist/query",
  catchAsync(Depart.render_new_student_form_checklist_query)
);

router.get("/:sid/dynamic/form/query", catchAsync(Depart.render_dynamic_form_query))

module.exports = router;
