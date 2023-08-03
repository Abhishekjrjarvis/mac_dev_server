const express = require("express");
const router = express.Router();
const Academic = require("../../controllers/Academics/academicController");
const catchAsync = require("../../Utilities/catchAsync");

// router.post(
//   "/search/institute/search/student",
//   catchAsync(Guest.renderSearchInstituteByCodeQuery)
// );

router.get(
  "/:sid/all/topic",
  catchAsync(Academic.renderOneSubjectAllTopicQuery)
);

router.patch(
  "/edit/one/:ctid/topic/query",
  catchAsync(Guest.renderEditOneChapterTopicQuery)
);

module.exports = router;
