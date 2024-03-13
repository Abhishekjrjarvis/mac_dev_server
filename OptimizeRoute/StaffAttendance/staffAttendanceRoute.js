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

router.patch(
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
// router.get("/staff/:sid", isLoggedIn, catchAsync(staffAttendanceController.viewInstituteStaff));
// router.get(
//   "/filter/calendar/:sid",
//   isLoggedIn,
//   catchAsync(staffAttendanceController.getAttendStaffByIdForMonth)
// );
module.exports = router;

