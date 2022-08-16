const express = require("express");
const router = express.Router();
const Question = require("../../../controllers/InstituteAdmin/Post/QuestionController");
const catchAsync = require("../../../Utilities/catchAsync");
const { isLoggedIn } = require("../../../middleware");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/:id/text", isLoggedIn, upload.array("file"), catchAsync(Question.postQuestionText));

router.delete("/:id/deleted/:pid", isLoggedIn, catchAsync(Question.postQuestionDelete));

router.post("/poll/:id", isLoggedIn, catchAsync(Question.retrievePollQuestionText));

module.exports = router;
