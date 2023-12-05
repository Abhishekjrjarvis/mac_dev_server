const express = require("express");
const router = express.Router();
const Poll = require("../../../OptimizeController/User/Post/PollsController");
const catchAsync = require("../../../Utilities/catchAsync");
const { isLoggedIn } = require("../../../middleware");

router.post(
  "/question/:id",
  isLoggedIn,
  catchAsync(Poll.retrievePollQuestionText)
);

router.patch("/question/vote/:pid", isLoggedIn, catchAsync(Poll.pollLike));

router.patch("/edit/:pid", isLoggedIn, catchAsync(Poll.renderEditPollQuery));

module.exports = router;
