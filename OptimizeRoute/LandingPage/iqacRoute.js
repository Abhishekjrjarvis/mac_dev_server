const express = require("express");
const router = express.Router();
const IQAC = require("../../OptimizeController/LandingPage/iqacController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/ins/:id/iqac/query",
  catchAsync(IQAC.render_new_iqac_query)
);

router.get(
  "/:qid/dashboard",
  catchAsync(IQAC.render_master_query)
);

router.post(
  "/:qid/add/authority/query",
  catchAsync(IQAC.render_add_authority_query)
);

router.get(
  "/:qid/all/custom/authority",
  catchAsync(IQAC.render_all_authority_query)
);

router.get(
  "/:qcid/custom/dashboard",
  catchAsync(IQAC.render_master_custom_query)
);

router.post(
  "/:qcid/add/composition/query",
  catchAsync(IQAC.render_add_composition_query)
);

router.get(
  "/:qcid/all/composition/query",
  catchAsync(IQAC.render_all_composition_query)
);

router.post("/:qcid/syllabus/feedback/object/query", catchAsync(IQAC.render_syllabus_feedback_object_query));

router.patch("/:qcid/syllabus/feedback/:acid/nested/object/query", catchAsync(IQAC.render_syllabus_feedback_nested_object_query));

router.post("/:qcid/add/documents/all/section/query", catchAsync(IQAC.render_add_documents_all_section_query));

router.post("/:qcid/add/documents/section/query", catchAsync(IQAC.render_add_documents_section_query));

router.post("/:qcid/add/heads/query", catchAsync(IQAC.render_add_head_query));

router.post("/:hid/add/mou/query", catchAsync(IQAC.render_add_mou_query));

router.post("/:hid/add/activities/query", catchAsync(IQAC.render_add_activities_query));

router.post("/:hid/add/projects/query", catchAsync(IQAC.render_add_projects_query));

router.post("/:hid/add/rnd/paper/query", catchAsync(IQAC.render_add_rnd_paper_query));


module.exports = router;
