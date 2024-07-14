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

  // for subject internal evaluation
router
.route("/internal/evaluation/:sid/all/list")
.get(catchAsync(copoController.subjectTeacherAllInternalEvaluationQuery));
router
.route("/internal/evaluation/:sid/add/query")
.post(catchAsync(copoController.subjectTeacherAddInternalEvaluationQuery));
router
.route("/internal/evaluation/update/:ieid/query")
.patch(
  catchAsync(copoController.subjectTeacherUpdateInternalEvaluationQuery)
);
router
.route("/internal/evaluation/remove/:ieid/query")
.delete(
  catchAsync(copoController.subjectTeacherRemoveInternalEvaluationQuery)
);

router
.route("/internal/evaluation/all/student/:ieid/list")
.get(catchAsync(copoController.subjectTeacherStudentInternalEvaluationQuery));

router
.route("/internal/evaluation/test/:ieid/all/list")
.get(catchAsync(copoController.subjectTeacherAllInternalEvaluationTestQuery));
router
.route("/internal/evaluation/test/all/student/:ietid/list")
.get(
  catchAsync(copoController.subjectTeacherStudentInternalEvaluationTestQuery)
);

router
.route("/internal/evaluation/test/:ieid/add/query")
.post(
  catchAsync(copoController.subjectTeacherAddInternalEvaluationTestQuery)
);
router
.route("/internal/evaluation/test/update/:ietid/query")
.patch(
  catchAsync(copoController.subjectTeacherUpdateInternalEvaluationTestQuery)
);
router
.route("/internal/evaluation/test/remove/:ietid/query")
.delete(
  catchAsync(copoController.subjectTeacherRemoveInternalEvaluationTestQuery)
);

router
.route("/internal/evaluation/test/mark/update/:ietid/query")
.patch(
  catchAsync(
    copoController.subjectTeacherMarkUpdateInternalEvaluationTestQuery
  )
);

router
  .route("/internal/evaluation/export/:ieid/all/student/query")
  .patch(catchAsync(copoController.internalEvaluationStudentExcelExportQuery));

module.exports = router;
