const express = require("express");
const router = express.Router();
const timetable = require("../../controllers/Timetable/timetableController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");
router
  .route("/:cid/day/timetable")
  .get(isLoggedIn, catchAsync(timetable.getDayWiseSchedule))
  .patch(isLoggedIn, catchAsync(timetable.addDayWiseSchedule));

router
  .route("/:cid/date/timetable")
  .get(isLoggedIn, catchAsync(timetable.getDateWiseSchedule))
  .patch(isLoggedIn, catchAsync(timetable.addDateWiseSchedule));

router
  .route("/staff/:sid/schedule")
  .get(isLoggedIn, catchAsync(timetable.getOneStaffAllSchedule))
  .patch(isLoggedIn, catchAsync(timetable.replaceOneStaffSchedule));

router
  .route("/institute/:id/allot/staff")
  .get(isLoggedIn, catchAsync(timetable.getInstituteAllotStaff));

router
  .route("/staff/:sid/schedule/list")
  .get(isLoggedIn, catchAsync(timetable.getStaffSideDateWise));

router
  .route("/student/:cid/schedule/list")
  .get(catchAsync(timetable.getStudentSideDateWise));

router
  .route("/sync/student/:cid/schedule")
  .get(catchAsync(timetable.getSyncWiseStudentQuery));

router
  .route("/sync/staff/:sid/schedule")
  .get(catchAsync(timetable.getSyncWiseStaffQuery));

router.delete(
  "/:tid/destroy/query",
  catchAsync(timetable.renderDestroyScheduleQuery)
);

//Get Timetable By Subject
router
  .route("/subject/:sid/date/schedule/list")
  .get(catchAsync(timetable.getSubjectDateWiseScheduleQuery));

router
  .route("/subject/:sid/date/schedule/list/update/timetable")
  .patch(catchAsync(timetable.getSubjectDateWiseScheduleUpdateTimeTableQuery));

router
  .route("/subject/:sid/date/schedule/list/update/attendence")
  .patch(catchAsync(timetable.getSubjectDateWiseScheduleAttendenceQuery));

  router
  .route("/insert/default/field/timetable")
  .patch(catchAsync(timetable.insertTimetableDefaultFieldQuery));

module.exports = router;
