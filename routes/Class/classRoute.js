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
// router.route("/checklist/:cid").post(isLoggedIn,catchAsync(classController.createClassChecklist));
module.exports = router;
