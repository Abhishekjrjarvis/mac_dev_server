const express = require("express");
const router = express.Router();
const Alumini = require("../../controllers/Alumini/aluminiController");
const catchAsync = require("../../Utilities/catchAsync");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { isLoggedIn } = require("../../middleware");

router.post("/ins/:id/staff/:sid", catchAsync(Alumini.renderNewAluminiQuery));

router.get(
  "/:aid/dashboard/query",
  catchAsync(Alumini.renderAluminiDashboardQuery)
);

router.post(
  "/:aid/new/register",
  catchAsync(Alumini.renderAluminiNewRegisterFormQuery)
);

router.get(
  "/:aid/all/registration/array",
  catchAsync(Alumini.renderAluminiAllRegistrationArray)
);

router.patch(
  "/:rid/give/certificate",
  catchAsync(Alumini.renderGiveAluminiCertificateQuery)
);

router.get(
  "/:aid/all/prominent/array",
  catchAsync(Alumini.renderAluminiAllProminentArray)
);

router.post(
  "/:aid/new/prominent/query",
  catchAsync(Alumini.renderAluminiNewProminentQuery)
);

router.post(
  "/question/:aid",
  catchAsync(Alumini.renderAluminiNewFeedbackPollQuery)
);

router.patch(
  "/question/vote/:pid",
  isLoggedIn,
  catchAsync(Alumini.renderAluminiPollVoteQuery)
);

router.patch(
  "/question/vote/:aid/feedback/query",
  catchAsync(Alumini.renderAluminiPollVoteFeedbackQuery)
);

router.get(
  "/:aid/all/feed/question/array",
  catchAsync(Alumini.renderAluminiAllFeedQuestionArray)
);

module.exports = router;
