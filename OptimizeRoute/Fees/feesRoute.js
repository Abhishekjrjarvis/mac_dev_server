const express = require("express");
const router = express.Router();
const feesController = require("../../OptimizeController/Fees/FeesController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router
  .route("/department-class/fee/:did")
  .post(catchAsync(feesController.createFess));

router
  .route("/:feesId")
  .get(isLoggedIn, catchAsync(feesController.getOneFeesDetail));

router
  .route("/class/:cid/student/fee/:id/all")
  .post(isLoggedIn, catchAsync(feesController.feesPaidByStudent));

// router.route("/class/:cid/student/:sid/exempt/fee/:id").post(isLoggedIn,catchAsync(feesController.exemptFeesPaidByStudent));

// One Student Creadentials
router
  .route("/student/status")
  .post(isLoggedIn, catchAsync(feesController.retrieveStudentFeeStatus));

// All Fees In Department
router
  .route("/department/:did/query")
  .get(isLoggedIn, catchAsync(feesController.retrieveDepartmentFeeArray));

// All Fees In Class
router
  .route("/class/:cid/query")
  .get(isLoggedIn, catchAsync(feesController.retrieveClassFeeArray));

// Student Pay Online Fees and Checklists
router
  .route("/student/:sid/count")
  .get(isLoggedIn, catchAsync(feesController.retrieveStudentCountQuery));

// Student Pay Online Fees and Checklists
router
  .route("/student/:sid")
  .get(catchAsync(feesController.retrieveStudentQuery));

router
  .route("/student/:sid/internal/fees/query")
  .get(catchAsync(feesController.retrieveStudentInternalQuery));

router
  .route("/student/:sid/backlog/fees/query")
  .get(catchAsync(feesController.retrieveStudentBacklogQuery));

router
  .route("/student/one/receipt/:orid/query")
  .get(catchAsync(feesController.retrieveStudentOneFeeReceiptQuery));

router
  .route("/:fid/destroy/:did")
  .delete(catchAsync(feesController.renderFeesDeleteQuery));

router
  .route("/:fid/edit")
  .patch(catchAsync(feesController.renderFeesEditQuery));

module.exports = router;
