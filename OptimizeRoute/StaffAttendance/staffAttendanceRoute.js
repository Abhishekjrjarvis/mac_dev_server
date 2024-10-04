const express = require("express");
const catchAsync = require("../../Utilities/catchAsync");
const router = express.Router();
const staffAttendanceController = require("../../OptimizeController/StaffAttendance/staffAttendanceController");
router
  .route("/institute/:id")
  .get(
    // isLoggedIn,
    catchAsync(staffAttendanceController.getStaffAttendanceQuery)
  )
  .post(
    // isLoggedIn,
    catchAsync(staffAttendanceController.staffAttendanceMarkQuery)
  );
router.route("/update/:said").patch(
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffAttendanceUpdateQuery)
);
router.get(
  "/calendar/:sid",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffAttendanceCalendarQuery)
);

router.get(
  "/today/:id/stats/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffTodayAttendanceStatsQuery)
);
router.get(
  "/today/one/:aid/stats/list/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffTodayAttendanceListStatsQuery)
);

router.get(
  "/timetable/:id/stats/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffTimetableStatsQuery)
);
router.get(
  "/timetable/class/:cid/stats/subject/list/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffTimetableStatsSubjectListQuery)
);

router.get(
  "/teaching/plan/:id/stats/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffTeachingPlanStatsQuery)
);
router.get(
  "/teaching/plan/:id/staff/:sid/stats/subject/list/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffTeachingPlanStatsSubjectListQuery)
);

router.get(
  "/profile/stats/:sid/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffAttendanceInProfileWithRangeQuery)
);
router.patch(
  "/custom/insert/class/subject/query",
  // isLoggedIn,
  catchAsync(
    staffAttendanceController.insertClassTimetableCountAndBatchToSubjectQuery
  )
);
router.patch(
  "/remove/class/type/slot/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.removeTimeSlotObjectInClassModelQuery)
);
router.patch(
  "/additional/custom/date/field",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffAttendanceAdditionalFieldQuery)
);
router.patch(
  "/timetable/criteria/custom/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffTimetableCustomCriteriaQuery)
);
router.patch(
  "/teaching/plan/criteria/custom/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staffTeachingPlanCustomCriteriaQuery)
);

router.patch(
  "/self/in/institute/:id/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staff_self_in_attendance_query)
);

router.patch(
  "/self/out/institute/:id/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staff_self_out_attendance_query)
);
router.get(
  "/self/logs/date/:id/query",
  // isLoggedIn,
  catchAsync(staffAttendanceController.staff_self_attendance_date_logs_query)
);
module.exports = router;
