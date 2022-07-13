const express = require("express");
const router = express.Router();
const feesController = require("../../controllers/Fees/FeesController");

router.route("/department-class/fee/:did").post(feesController.createFess);
router.route("/fees/:feesId").get(feesController.getOneFeesDetail);
router
  .route("/class/:cid/student/:sid/fee/:id")
  .post(feesController.feesPaidByStudent);
router
  .route("/class/:cid/student/:sid/exempt/fee/:id")
  .post(feesController.exemptFeesPaidByStudent);

module.exports = router;
