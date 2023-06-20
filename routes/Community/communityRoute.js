const express = require("express");
const router = express.Router();
const Community = require("../../controllers/Community/communityController");
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

router
  .route("/quote/:uid/display")
  .patch(catchAsync(Community.renderNewQuoteDisplayQuery));

router.route("/quote/new").post(catchAsync(Community.renderNewQuoteQuery));

module.exports = router;
