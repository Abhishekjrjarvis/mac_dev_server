const express = require("express");
const router = express.Router();
const classController = require("../../controllers/Class/index");
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

router
  .route("/:cid")
  .get(isLoggedIn, catchAsync(classController.getOneClass))
  .patch(isLoggedIn, catchAsync(classController.classRefreshCode));
router
  .route("/institute/:id")
  .get(isLoggedIn, catchAsync(classController.getOneInstitute));
router
  .route("/setting/:cid")
  .patch(isLoggedIn, catchAsync(classController.classStartDate));
router
  .route("/setting/:cid/report")
  .patch(isLoggedIn, catchAsync(classController.classReportSetting));

router
  .route("/:sid/all/active/mentors")
  .get(catchAsync(classController.renderAllStudentMentors));

//// New Batch ////

router
  .route("/:cid/new/batch/query")
  .post(catchAsync(classController.renderNewBatchQuery));

router
  .route("/:bid/new/student/query")
  .post(catchAsync(classController.renderNewStudentQuery));

router
  .route("/:cid/all/batch/query")
  .get(catchAsync(classController.renderAllClassBatchQuery));

router
  .route("/:bid/all/student/query")
  .get(catchAsync(classController.renderAllBatchStudentQuery));
// router.route("/checklist/:cid").post(isLoggedIn,catchAsync(classController.createClassChecklist));
module.exports = router;
