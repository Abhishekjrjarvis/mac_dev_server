const express = require("express");
const router = express.Router();
const Mentor = require("../../controllers/MentorMentee/mentormenteeController");
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

router.post("/:did/new/mentor", catchAsync(Mentor.renderNewMentorQuery));

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

router.patch("/:mid/new/query:sid", catchAsync(Mentor.renderNewMenteeQuery));

module.exports = router;
