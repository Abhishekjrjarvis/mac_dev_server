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
  .get(isLoggedIn, catchAsync(timetable.getStudentSideDateWise));

module.exports = router;
