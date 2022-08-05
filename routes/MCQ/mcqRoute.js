const express = require("express");
const router = express.Router();
const mcqController = require("../../controllers/MCQ/mcqController");
const catchAsync = require("../../Utilities/catchAsync");

router.route("/addquestion/:smid").post(catchAsync(mcqController.addQuestion));
router
  .route("/question/:smid/:cmid")
  .get(catchAsync(mcqController.getQuestion));
router
  .route("/question/testset/:smid/:cmid")
  .get(catchAsync(mcqController.getQuestionAddTestSet))
  .post(catchAsync(mcqController.saveTestSet));

router
  .route("/subject/alltestset/:cmid")
  .get(catchAsync(mcqController.allSaveTestSet));
router
  .route("/testset/detail/:tsid")
  .get(catchAsync(mcqController.oneTestSetDetail));

router
  .route("/subject/:sid/take/testset")
  .post(catchAsync(mcqController.takeTestSet));
module.exports = router;
