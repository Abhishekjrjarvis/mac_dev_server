const express = require("express");
const router = express.Router();
const Mentor = require("../../controllers/MentorMentee/mentormenteeController");
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

router.post("/:did/new/mentor/:sid", catchAsync(Mentor.renderNewMentorQuery));

router.get("/:did/all/mentor", catchAsync(Mentor.renderAllMentorQuery));

router.get("/one/mentor/:mid", catchAsync(Mentor.renderOneMentorQuery));

router.get(
  "/one/mentor/:mid/all/mentees",
  catchAsync(Mentor.renderOneMentorAllMenteesQuery)
);

router.post(
  "/:did/one/mentor/:mid/new/mentees",
  catchAsync(Mentor.renderNewMentorMenteeQuery)
);

router.post(
  "/:did/one/mentor/:mid/destroy/mentees",
  catchAsync(Mentor.renderDestroyMentorMenteeQuery)
);

router.patch("/:mid/new/query/:sid", catchAsync(Mentor.renderNewMenteeQuery));

router.get("/one/query/:qid", catchAsync(Mentor.renderOneQueryDetail));

router.get("/:sid/all/query", catchAsync(Mentor.renderAllStudentQuery));

router.get(
  "/:mid/all/query/by/flow",
  catchAsync(Mentor.renderAllMentorQueryByStatus)
);

router.patch(
  "/one/query/:qid/remark/flow",
  catchAsync(Mentor.renderOneQueryRemark)
);

router.patch("/one/query/:qid/report", catchAsync(Mentor.renderOneQueryReport));

router.post("/:did/new/question", catchAsync(Mentor.renderNewQuestionQuery));

router.get("/:dmid/all/question", catchAsync(Mentor.renderAllQuestionQuery));

router.post(
  "/:did/new/feedback/query",
  catchAsync(Mentor.renderNewFeedbackQuery)
);

router.get(
  "/:did/all/feedback/query",
  catchAsync(Mentor.renderAllFeedbackQuery)
);

router.get(
  "/:did/one/:mid/feedback/:fid/detail/query",
  catchAsync(Mentor.renderOneFeedbackDetailQuery)
);

// router.patch(
//   "/:sid/give/feedback/:mid/query",
//   catchAsync(Mentor.renderOneStudentGiveFeedbackQuery)
// );

router.get(
  "/:did/all/class/query",
  catchAsync(Mentor.renderDepartAllClassQuery)
);

router.get(
  "/:cid/all/filter/student/query",
  catchAsync(Mentor.renderAllFilteredStudentQuery)
);

router.post("/new/meeting/query", catchAsync(Mentor.renderNewMeetingQuery));

router.get("/:mid/all/meeting/query", catchAsync(Mentor.renderAllMeetingQuery));

router.get("/one/meet/:meid/query", catchAsync(Mentor.renderOneMeetDetail));

module.exports = router;
