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

router
  .route("/internal/evaluation/take/test/:ietid/to/student/query")
  .patch(
    catchAsync(
      copoController.subjectTeacherTakeTestsetInternalEvaluationTestQuery
    )
  );
router
  .route("/internal/evaluation/student/:stid/start/query")
  .patch(
    catchAsync(copoController.sudentInternalEvaluationStartTestValidationQuery)
  );
router
  .route("/internal/evaluation/student/:stid/submit/query")
  .patch(catchAsync(copoController.sudentGetInternalEvaluationSubmitTestQuery));
router
  .route("/internal/evaluation/student/:stid/detail/query")
  .get(catchAsync(copoController.sudentGetInternalEvaluationTestQuery));

router
  .route("/internal/evaluation/single/take/test/:ietid/to/student/query")
  .patch(
    catchAsync(
      copoController.subjectTeacherSingleTakeTestsetInternalEvaluationTestQuery
    )
  );

// for continuous evaluation

router
  .route("/continuous/evaluation/:sid/experiment/list/query")
  .get(catchAsync(copoController.subject_all_expriment_query));
router
  .route("/continuous/evaluation/:sid/add/experiment/query")
  .post(catchAsync(copoController.subject_add_expriment_query));
router
  .route("/continuous/evaluation/experiment/:exid/update/query")
  .patch(catchAsync(copoController.subject_update_expriment_query));
router
  .route("/continuous/evaluation/experiment/:exid/remove/query")
  .delete(catchAsync(copoController.subject_remove_expriment_query));

router
  .route("/continuous/evaluation/one/experiment/:exid/detail/query")
  .get(catchAsync(copoController.subject_one_expriment_detail_query));

router
  .route("/continuous/evaluation/one/experiment/:exid/update/mark/query")
  .patch(catchAsync(copoController.subject_update_expriment_marks_query));

router
  .route("/continuous/evaluation/:sid/detail/query")
  .get(catchAsync(copoController.subject_continuous_evaluation_detail_query));

router
  .route("/continuous/evaluation/setting/:ceid/update/query")
  .patch(
    catchAsync(copoController.subject_continuous_evaluation_setting_query)
  );

router
  .route("/continuous/evaluation/all/experiment/:ceid/mark/query")
  .get(
    catchAsync(copoController.continuous_evaluation_all_experiment_marks_query)
  );

router
  .route("/continuous/evaluation/cls/subject/:cid/list/query")
  .get(catchAsync(copoController.cls_theory_subject_list_query));

router
  .route("/continuous/evaluation/attendance/:ceid/mark/query")
  .get(catchAsync(copoController.continuous_evaluation_attendance_marks_query));
router
  .route("/continuous/evaluation/assignment/:ceid/mark/query")
  .get(catchAsync(copoController.continuous_evaluation_assignment_marks_query));

router
  .route("/continuous/evaluation/clstest/:ceid/mark/query")
  .get(catchAsync(copoController.continuous_evaluation_cls_test_marks_query));
router
  .route("/continuous/evaluation/total/:ceid/mark/query")
  .get(catchAsync(copoController.continuous_evaluation_total_marks_query));

router
  .route("/continuous/evaluation/university/:ceid/mark/query")
  .get(
    catchAsync(
      copoController.subject_continuous_evaluation_all_university_marks_query
    )
  );

router
  .route("/continuous/evaluation/marks/by/university/:ceid/query")
  .patch(
    catchAsync(
      copoController.subject_continuous_evaluation_university_marks_query
    )
  );

router
  .route("/continuous/evaluation/seat/:ceid/list/query")
  .get(
    catchAsync(
      copoController.subject_continuous_evaluation_all_university_seats_query
    )
  );

router
  .route("/continuous/evaluation/seat/update/:ceid/query")
  .patch(
    catchAsync(
      copoController.subject_continuous_evaluation_university_seats_query
    )
  );

router
  .route("/continuous/evaluation/final/:ceid/mark/query")
  .get(catchAsync(copoController.continuous_evaluation_final_marks_query));

module.exports = router;
