const express = require("express");
const router = express.Router();
const timetable = require("../../controllers/Timetable/timetableController");
const catchAsync = require("../../Utilities/catchAsync");

router
  .route("/:cid/day/timetable")
  .get(catchAsync(timetable.getDayWiseSchedule))
  .patch(catchAsync(timetable.addDayWiseSchedule));

router
  .route("/:cid/date/timetable")
  .get(catchAsync(timetable.getDateWiseSchedule))
  .patch(catchAsync(timetable.addDateWiseSchedule));

router
  .route("/staff/:sid/schedule")
  .get(catchAsync(timetable.getOneStaffAllSchedule))
  .patch(catchAsync(timetable.replaceOneStaffSchedule));

router
  .route("/institute/:id/allot/staff")
  .get(catchAsync(timetable.getInstituteAllotStaff));

router
  .route("/staff/:sid/schedule/list")
  .get(catchAsync(timetable.getStaffSideDateWise));

router
  .route("/student/:cid/schedule/list")
  .get(catchAsync(timetable.getStudentSideDateWise));

module.exports = router;
