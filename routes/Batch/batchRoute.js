const express = require("express");
const router = express.Router();
const batchController = require("../../controllers/Batch/batchController");
// const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

//=========ATTENDANCE OF STUDENT=============================

router
  .route("/:bid")
  .get(catchAsync(batchController.allClasses))
  .post(catchAsync(batchController.preformedStructure));
router
  .route("/subject/:sid")
  .patch(catchAsync(batchController.subjectComplete));

router
  .route("/subject/:sid/setting")
  .patch(catchAsync(batchController.subjectUpdateSetting));

router.route("/class/:cid").get(catchAsync(batchController.allDepartment));
router.route("/promote/:cid").post(catchAsync(batchController.promoteStudent));

router
  .route("/complete/:cid")
  .get(catchAsync(batchController.getclassComplete))
  .patch(catchAsync(batchController.classComplete));
module.exports = router;
