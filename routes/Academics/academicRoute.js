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

// router.post(
//   "/edit/:sid/new/lecture/:subId/query",
//   catchAsync(Academic.renderAddNewLectureQuery)
// );

router.post(
  "/edit/:sid/new/lecture/:subId/query",
  catchAsync(Academic.renderAddNewLectureQuery)
);

router.patch("/:tid/status/query", catchAsync(Academic.renderTopicStatusQuery));

router.get(
  "/:tid/one/topic/query",
  catchAsync(Academic.renderOneTopicProfileQuery)
);

router.delete(
  "/:tid/one/topic/destroy/:sid/query",
  catchAsync(Academic.renderOneTopicDestroyQuery)
);

router.post(
  "/:sid/add/chapter/query",
  catchAsync(Academic.renderNewChapterQuery)
);

router.post(
  "/:cid/add/chapter/topic/query",
  catchAsync(Academic.renderNewChapterTopicQuery)
);

router.patch(
  "/filter/by/date/lecture/query",
  catchAsync(Academic.renderFilteredLectureQuery)
);

router.delete(
  "/:cid/delete/chapter",
  catchAsync(Academic.renderOneChapterDestroyQuery)
);

router.patch(
  "/insert/subject/chapter",
  catchAsync(Academic.insertAcademicSubjectQuery)
);

router.patch(
  "/teaching/plan/subject/:sid/other/setting",
  catchAsync(Academic.one_subject_teaching_plan_setting_query)
);

router.post(
  "/export/subject/:sid/teaching/plan/query/zip",
  catchAsync(Academic.teaching_plan_export_report_query)
);
module.exports = router;
