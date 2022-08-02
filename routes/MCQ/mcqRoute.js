const express = require("express");
const router = express.Router();
const mcqController = require("../../controllers/MCQ/mcqController");
const catchAsync = require("../../Utilities/catchAsync");

router
  .route("/addquestion/:smid")
  .get(catchAsync(mcqController.getQuestion))
  .post(catchAsync(mcqController.addQuestion));

module.exports = router;
