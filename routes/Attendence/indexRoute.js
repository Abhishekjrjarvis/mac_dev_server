const express = require("express");
const router = express.Router();
const Avail = require("../../controllers/Attendence/index");
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

//=========ATTENDANCE OF STUDENT=============================

router
  .route("/class/:cid/student/attendance")
  .get(catchAsync(Avail.getAttendClassStudent))
  .post(catchAsync(Avail.markAttendenceClassStudent));

router
  .route("/student/update/:said")
  .patch(catchAsync(Avail.markAttendenceClassStudentUpdate));

router.get("/student-calender/:sid", catchAsync(Avail.getAttendStudentById));

router.get("/student/:sid", catchAsync(Avail.viewClassStudent));

//=========ATTENDANCE OF STAFF================================

router
  .route("/institute/:id/staff/attendance")
  .get(catchAsync(Avail.getAttendInstituteStaff))
  .post(catchAsync(Avail.markAttendenceDepartmentStaff));

router
  .route("/staff/update/:said")
  .patch(catchAsync(Avail.markAttendenceDepartmentStaffUpdate));
router.get("/staff-calender/:sid", catchAsync(Avail.getAttendStaffById));

router.get("/institute/:id", catchAsync(Avail.viewInstitute));
router.get("/staff/:sid", catchAsync(Avail.viewInstituteStaff));
router.get(
  "/staff/onemonth/:sid",
  catchAsync(Avail.getAttendStaffByIdForMonth)
);

//=========HOLIDAY OF DEPARTMENT CREATED================================

router.post("/department/:did/holiday", catchAsync(Avail.holidayCalendar));
router.get("/class/:cid/holiday", catchAsync(Avail.holidayInClassSide));
router.route("/holiday/:did").get(catchAsync(Avail.fetchHoliday));

router.route("/holiday/:hid/delete").get(catchAsync(Avail.delHoliday));
//==============================================================

// // Class Attendence Student Data
// router.get(
//   "/staffclass/:cid/attend",
//   isLoggedIn,
//   catchAsync(Avail.getAttendStudentClass)
// );

// // Class Attendence Student Data By Id
// router.get(
//   "/staffclass/:cid/attend-id",
//   isLoggedIn,
//   catchAsync(Avail.getAttendStudentClassById)
// );
// // ==============================================================
// // Class Mark Attendence

// // =====================================================
// // Class Get Attendence By Date
// router.get(
//   "/class/:cid/get/attendence/:date",
//   isLoggedIn,
//   catchAsync(Avail.retrieveAttendenceByDate)
// );

// // Show Student Attendence At Calendar
// router.post(
//   "/attendence/status/student/:sid",
//   isLoggedIn,
//   catchAsync(Avail.retrieveStudentAttendenceCalendar)
// );

// // Department Attendence Staff Data
// router.get(
//   "/batch-detail/:bid/attend",
//   isLoggedIn,
//   catchAsync(Avail.getAttendDepartmentStaff)
// );

// // // Department Attendence Staff Data By Id
// // router.get(
// //   "/batch-detail/:bid/attend-id",
// //   isLoggedIn,
// //   catchAsync(Avail.getAttendInstituteStaff)
// // );

// // Staff Mark Attendence

// // router.post(
// //   "/institute/:id/staff/attendence",
// //   catchAsync(Avail.markAttendenceDepartmentStaff)
// // );

// // Department Get Attendence By Date
// router.get(
//   "/department/:did/get/attendence/:date",
//   catchAsync(Avail.retrieveAttendenceByStaffDate)
// );

// // Show Staff Attendence At Calendar
// router.post(
//   "/attendence/status/staff/:sid",
//   isLoggedIn,
//   catchAsync(Avail.retrieveStaffAttendenceCalendar)
// );

// // Delete Holiday
// // router.delete("/delHoliday/:hid", catchAsync(Avail.delHoliday));

module.exports = router;
