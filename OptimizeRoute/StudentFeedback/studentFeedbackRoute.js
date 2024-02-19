const express = require("express");
const catchAsync = require("../../Utilities/catchAsync");
const studentFeedbackController = require("../../OptimizeController/StudentFeedback/studentFeedbackController");
const router = express.Router();

router
  .route("/institute/:id")
  .get(
    // isLoggedIn,
    catchAsync(studentFeedbackController.getStudentFeedbackQuery)
  )
  .post(
    // isLoggedIn,
    catchAsync(studentFeedbackController.createStudentFeedbackQuery)
  );

router
  .route("/institute/one/:ifid")
  .get(
    // isLoggedIn,
    catchAsync(studentFeedbackController.studentFeedbackDetailQuery)
  )
  .patch(
    // isLoggedIn,
    catchAsync(studentFeedbackController.updateStudentFeedbackQuery)
  )
  .delete(
    // isLoggedIn,
    catchAsync(studentFeedbackController.removeStudentFeedbackQuery)
  );

router.route("/student/give/staff/:sid").post(
  // isLoggedIn,
  catchAsync(studentFeedbackController.giveStudentFeedbackQuery)
);

router.route("/subject/teacher/list/:ifid").get(
  // isLoggedIn,
  catchAsync(studentFeedbackController.getSubjectStaffListQuery)
);

router
  .route("/question/:ifid/query")
  .post(
    // isLoggedIn,
    catchAsync(studentFeedbackController.addQuestionStudentFeedbackQuery)
  )
  .patch(
    // isLoggedIn,
    catchAsync(studentFeedbackController.updateQuestionStudentFeedbackQuery)
  )
  .delete(
    // isLoggedIn,
    catchAsync(studentFeedbackController.removeQuestionStudentFeedbackQuery)
  );

router.route("/taken/:ifid/by/institute/:id/query").post(
  // isLoggedIn,
  catchAsync(studentFeedbackController.feedbackTakenByInstituteQuery)
);

router.route("/analytic/process/:ifid/query").post(
  // isLoggedIn,
  catchAsync(studentFeedbackController.feedbackAnalyticsProcessInstituteQuery)
);
router.route("/one/:ifid/given/student/list/query").get(
  // isLoggedIn,
  catchAsync(studentFeedbackController.getGivenFeedbackStudentListQuery)
);
router.route("/one/staff/:sid/analytic/:ifid/query").get(
  // isLoggedIn,
  catchAsync(studentFeedbackController.getOneStaffAnalyticQuery)
);
router.route("/close/date/institute/one/:ifid").patch(
  // isLoggedIn,
  catchAsync(studentFeedbackController.updateStudentFeedbackCloseDateQuery)
);
router.route("/staff/one/info/:sid").get(
  // isLoggedIn,
  catchAsync(studentFeedbackController.getOneFeedbackStaffQuery)
);

module.exports = router;

