const express = require("express");
const router = express.Router();
const Question = require("../../../controllers/User/Post/QuestionController");
const catchAsync = require("../../../Utilities/catchAsync");
const { isLoggedIn } = require("../../../middleware");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/:id/text",
  isLoggedIn,
  upload.array("file"),
  catchAsync(Question.postQuestionText)
);

router.delete(
  "/:id/deleted/:pid",
  isLoggedIn,
  catchAsync(Question.postQuestionDelete)
);

router.get("/like/:aid", isLoggedIn, catchAsync(Question.answerLike));

router.get("/dislike/:aid", isLoggedIn, catchAsync(Question.answerDisLike));

router.get("/save/:pid", isLoggedIn, catchAsync(Question.postQuestionSave));

router.get("/answer/:id", isLoggedIn, catchAsync(Question.getQuestionAnswer));

router.post(
  "/answer/new/:id",
  isLoggedIn,
  upload.array("file"),
  catchAsync(Question.postQuestionAnswer)
);

router.get(
  "/answer/reply/:rid",
  isLoggedIn,
  catchAsync(Question.getAnswerReply)
);

router.post(
  "/answer/reply/new/:rid",
  isLoggedIn,
  catchAsync(Question.postAnswerReply)
);

router.get(
  "/answer/save/:aid",
  isLoggedIn,
  catchAsync(Question.questionAnswerSave)
);

router.delete(
  "/:pid/deleted/:aid/answer",
  isLoggedIn,
  catchAsync(Question.postQuestionDeleteAnswer)
);

router.post(
  "/answer/new/repost/:id",
  isLoggedIn,
  upload.array("file"),
  catchAsync(Question.rePostQuestionAnswer)
);

//
router.get(
  "/repost/:pid/like/:aid",
  isLoggedIn,
  catchAsync(Question.rePostAnswerLike)
);

router.get(
  "/help/to/other/:pid",
  isLoggedIn,
  catchAsync(Question.retrieveHelpQuestion)
);

//

router
  .route("/edit/answer/:aid")
  .patch(upload.array("file"), catchAsync(Question.answerEdit));

router
  .route("/edit/answer/reply/:aid")
  .patch(catchAsync(Question.answerReplyEdit))
  .delete(catchAsync(Question.answerReplyDelete));

router.get('/:uid/all/save/answer', catchAsync(Question.getAllSaveAnswerQuery))

router.get('/one/:qid/question', catchAsync(Question.getOneQuestionQuery))

module.exports = router;
