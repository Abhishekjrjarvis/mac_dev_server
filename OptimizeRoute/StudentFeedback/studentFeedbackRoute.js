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
  catchAsync(studentFeedbackController.feedbackTakenByInstituteQueryMod)
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

router.route("/remove/dublicate/master/:ifid").patch(
  // isLoggedIn,
  catchAsync(studentFeedbackController.removeDublicateMasterQuery)
);

router.route("/department/analytic/:did/class/feedback/query").patch(
  // isLoggedIn,
  catchAsync(studentFeedbackController.getOneDepartmentAnalyticQuery)
);

router.route("/crash/taken/:ifid/by/query").delete(
  // isLoggedIn,
  catchAsync(studentFeedbackController.feedbackRemoveByInstituteQuery)
);
router.route("/crash/only/notification/taken/:ifid/by/query").delete(
  // isLoggedIn,
  catchAsync(
    studentFeedbackController.feedbackOnlyRemoveNotificationByInstituteQuery
  )
);
router
  .route("/crash/resend/one/subject/notification/taken/:ifid/by/query")
  .patch(
    // isLoggedIn,
    catchAsync(
      studentFeedbackController.feedbackResendNotificationOneSubjectByInstituteQuery
    )
  );

router.route("/notsend/:ifid/by/institute/:id/all/subject/query").post(
  // isLoggedIn,
  catchAsync(studentFeedbackController.feedback_not_send_subject_teacher_query)
);

router.route("/clone/:ifid/question/:nifid").patch(
  // isLoggedIn,
  catchAsync(studentFeedbackController.feedback_clone_question_query)
);

module.exports = router;
