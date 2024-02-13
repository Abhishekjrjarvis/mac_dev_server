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

router.route("/subject/teacher/list/:id").get(
  // isLoggedIn,
  catchAsync(studentFeedbackController.getSubjectStaffListQuery)
);

module.exports = router;