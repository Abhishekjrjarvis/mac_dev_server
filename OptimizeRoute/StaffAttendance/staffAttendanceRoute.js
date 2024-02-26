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

// router.get("/institute/:id", isLoggedIn, catchAsync(staffAttendanceController.viewInstitute));
// router.get("/staff/:sid", isLoggedIn, catchAsync(staffAttendanceController.viewInstituteStaff));
// router.get(
//   "/filter/calendar/:sid",
//   isLoggedIn,
//   catchAsync(staffAttendanceController.getAttendStaffByIdForMonth)
// );
module.exports = router;