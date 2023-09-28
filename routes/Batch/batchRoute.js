const express = require("express");
const router = express.Router();
const batchController = require("../../controllers/Batch/batchController");
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

//=========ATTENDANCE OF STUDENT=============================

router
  .route("/:bid")
  .get(isLoggedIn, batchController.allClasses)
  .post(isLoggedIn, batchController.preformedStructure);
router
  .route("/subject/:sid")
  .patch(isLoggedIn, batchController.subjectComplete);

router
  .route("/subject/:sid/setting")
  .get(isLoggedIn, batchController.subjectSetting)
  .patch(isLoggedIn, batchController.subjectUpdateSetting);

router.route("/class/:cid").get(batchController.allDepartment);
router.route("/promote/:cid").post(batchController.promoteStudent);

router
  .route("/complete/:cid")
  .get(isLoggedIn, catchAsync(batchController.getclassComplete))
  .patch(isLoggedIn, catchAsync(batchController.classComplete));

router
  .route("/class/uncomplete/:cid")
  .patch(isLoggedIn, catchAsync(batchController.classUncomplete));
router
  .route("/:bid/assign/staff/desigantion")
  .patch(
    isLoggedIn,
    catchAsync(batchController.assignDesignationToStaffByBatch)
  );

router
  .route("/:bid/assign/staff/desigantion")
  .patch(
    isLoggedIn,
    catchAsync(batchController.assignDesignationToStaffByBatch)
  );

router
  .route("/batch/:bid/complete/uncomplete/action")
  .patch(isLoggedIn, catchAsync(batchController.batchCompleteAndUncomplete));

router
  .route("/subject/:smid/update/course/credit")
  .patch(isLoggedIn, catchAsync(batchController.subjectCreditUpdate));

router.route("/undo").patch(catchAsync(batchController.undo));

module.exports = router;
