const express = require("express");
const router = express.Router();
const Avail = require("../../controllers/Attendence/index");
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

// Class Attendence Student Data
router.get(
  "/staffclass/:cid/attend",
  isLoggedIn,
  catchAsync(Avail.getAttendStudentClass)
);

// Class Attendence Student Data By Id
router.get(
  "/staffclass/:cid/attend-id",
  isLoggedIn,
  catchAsync(Avail.getAttendStudentClassById)
);

// Class Mark Attendence
router.post(
  "/class/:cid/student/attendence",
  isLoggedIn,
  catchAsync(Avail.markAttendenceClassStudent)
);

// Class Get Attendence By Date
router.get(
  "/class/:cid/get/attendence/:date",
  isLoggedIn,
  catchAsync(Avail.retrieveAttendenceByDate)
);

// Show Student Attendence At Calendar
router.post(
  "/attendence/status/student/:sid",
  isLoggedIn,
  catchAsync(Avail.retrieveStudentAttendenceCalendar)
);

// Department Attendence Staff Data
router.get(
  "/batch-detail/:bid/attend",
  isLoggedIn,
  catchAsync(Avail.getAttendDepartmentStaff)
);

// Department Attendence Staff Data By Id
router.get(
  "/batch-detail/:bid/attend-id",
  isLoggedIn,
  catchAsync(Avail.getAttendDepartmentStaffById)
);

// Staff Mark Attendence
router.post(
  "/department/:did/staff/attendence",
  isLoggedIn,
  catchAsync(Avail.markAttendenceDepartmentStaff)
);

// Department Get Attendence By Date
router.get(
  "/department/:did/get/attendence/:date",
  isLoggedIn,
  catchAsync(Avail.retrieveAttendenceByStaffDate)
);

// Show Staff Attendence At Calendar
router.post(
  "/attendence/status/staff/:sid",
  isLoggedIn,
  catchAsync(Avail.retrieveStaffAttendenceCalendar)
);

// Department Holiday Calendar
router.post(
  "/department/holiday/:did",
  isLoggedIn,
  catchAsync(Avail.holidayCalendar)
);

// Get Holiday
router.get("/holiday/:did", isLoggedIn, catchAsync(Avail.fetchHoliday));

// Delete Holiday
router.delete("/delHoliday/:hid", isLoggedIn, catchAsync(Avail.delHoliday));

module.exports = router;
