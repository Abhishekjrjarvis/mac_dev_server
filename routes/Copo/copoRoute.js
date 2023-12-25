const express = require("express");
const router = express.Router();
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");
const copoController = require("../../controllers/Copo/copoController");

router
  .route("/subject/master/:smid/query")
  .get(catchAsync(copoController.getAllAttainmentQuery))
  .post(isLoggedIn, catchAsync(copoController.addAttainmentQuery));

router
  .route("/attainment/:atid/action/query")
  .patch(catchAsync(copoController.editAttainmentQuery))
  .delete(isLoggedIn, catchAsync(copoController.destroyAttainmentQuery));
router
  .route("/department/:did/setting/query")
  .patch(catchAsync(copoController.editDepartmentAssesmentQuery));

router
  .route("/subject/co/attainment/:sid/query")
  .get(catchAsync(copoController.getCoAttainmentTabelQuery));

  router
  .route("/subject/copo/mapping/:sid/query")
  .get(catchAsync(copoController.getCopoMappingQuery))
  .patch(catchAsync(copoController.updateCopoMappingQuery));

  router
  .route("/department/:did/po/excel/upload")
  .patch(catchAsync(copoController.getDepartmentPoExcelQuery));
router
  .route("/subject/:did/course/co/excel/upload")
  .patch(catchAsync(copoController.getSubjectCoExcelQuery));

module.exports = router;
