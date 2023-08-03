const express = require("express");
const router = express.Router();
const Academic = require("../../controllers/Academics/academicController");
const catchAsync = require("../../Utilities/catchAsync");

router.get(
  "/:sid/all/chapter",
  catchAsync(Academic.renderOneSubjectAllChapterQuery)
);

router.get(
  "/:cid/all/topic",
  catchAsync(Academic.renderOneSubjectAllTopicQuery)
);

router.patch(
  "/edit/one/:ctid/topic/query",
  catchAsync(Academic.renderEditOneChapterTopicQuery)
);

router.post(
  "/add/:sid/new/lecture/query",
  catchAsync(Academic.renderAddNewLectureQuery)
);

router.patch("/:tid/status/query", catchAsync(Academic.renderTopicStatusQuery));

module.exports = router;
