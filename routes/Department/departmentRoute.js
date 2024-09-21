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

router.get(
  "/:sid/dynamic/form/query",
  catchAsync(Depart.render_dynamic_form_query)
);

router.get(
  "/:sid/dynamic/form/query/photo",
  catchAsync(Depart.render_dynamic_form_query_photo)
);

router.get(
  "/:sid/dynamic/form/query/subject/list",
  catchAsync(Depart.render_dynamic_form_subject_list_query)
);

router.patch(
  "/edit/form/:fcid/section/query",
  catchAsync(Depart.render_edit_student_form_section_query)
);

router.patch(
  "/edit/form/:fcid/section/checklist/query",
  catchAsync(Depart.render_edit_student_form_section_checklist_query)
);

router.get(
  "/dynamic/form/details/query",
  catchAsync(Depart.render_dynamic_form_details_query)
);

router.patch(
  "/add/textarea/query",
  catchAsync(Depart.render_add_textarea_field_query)
);
router.patch(
  "/add/form/image/query",
  catchAsync(Depart.render_add_form_image_query)
);

router.patch(
  "/add/dynamic/textarea/query",
  catchAsync(Depart.render_add_dynamic_textarea_field_query)
);

router.patch(
  "/toggle/edit/allow/:id",
  catchAsync(Depart.toggle_edit_allow_query)
);

module.exports = router;
