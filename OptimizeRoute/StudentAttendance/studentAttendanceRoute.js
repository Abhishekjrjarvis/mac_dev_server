const express = require("express");
const catchAsync = require("../../Utilities/catchAsync");
const router = express.Router();
const studentAttendanceController = require("../../OptimizeController/StudentAttendance/studentAttendanceController");
router.get(
  "/stats/:id/classes/query",
  // isLoggedIn,
  catchAsync(studentAttendanceController.studentStatsClassQuery)
);
router.get(
  "/stats/class/:cid/student/query",
  // isLoggedIn,
  catchAsync(studentAttendanceController.studentStatsClassStudentListQuery)
);
router.get(
  "/stats/lecture/:cid/student/query",
  // isLoggedIn,
  catchAsync(
    studentAttendanceController.studentStatsClassLectureStudentListQuery
  )
);
router.get(
  "/stats/student/:sid/lecture/:cid/query",
  // isLoggedIn,
  catchAsync(
    studentAttendanceController.studentStatsOneStudentSubjectLectureQuery
  )
);
router.get(
  "/profile/stats/:sid/day/query",
  // isLoggedIn,
  catchAsync(studentAttendanceController.studentStatsProfileDayWiseQuery)
);
router.get(
  "/profile/stats/:sid/lecture/query",
  // isLoggedIn,
  catchAsync(studentAttendanceController.studentStatsProfileLectureWiseQuery)
);

module.exports = router;

