const express = require("express");
const router = express.Router();
const subjectController = require("../../controllers/Subject/subjectController");
const catchAsync = require("../../Utilities/catchAsync");

router
  .route("/tab/manage/:sid/query")
  .get(catchAsync(subjectController.getSubjectTabManageQuery))
  .patch(catchAsync(subjectController.updateSubjectTabManageQuery));

router
  .route("/:sid/catalog/student/export/query")
  .patch(catchAsync(subjectController.subject_catalog_export_query));

module.exports = router;
