const express = require("express");
const router = express.Router();
const feesController = require("../../controllers/Fees/FeesController");

router.route("/department-class/fee/:did").post(feesController.createFess);

router.route("/:feesId").get(feesController.getOneFeesDetail);

router.route("/class/:cid/student/:sid/fee/:id/all").post(feesController.feesPaidByStudent);

// router.route("/class/:cid/student/:sid/exempt/fee/:id").post(feesController.exemptFeesPaidByStudent);

// One Student Creadentials
router.route('/student/status').post(feesController.retrieveStudentFeeStatus)

// All Fees In Department
router.route('/department/:did/query').get(feesController.retrieveDepartmentFeeArray)

// All Fees In Class
router.route('/class/:cid/query').get(feesController.retrieveClassFeeArray)

// Student Pay Online Fees and Checklists 
router.route('/student/:sid/count').get(feesController.retrieveStudentCountQuery)

// Student Pay Online Fees and Checklists 
router.route('/student/:sid').get(feesController.retrieveStudentQuery)

module.exports = router;
