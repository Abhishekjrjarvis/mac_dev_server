const express = require("express");
const router = express.Router();
const Avail = require("../../controllers/Attendence/index");
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

//=========ATTENDANCE OF STUDENT=============================
router
  .route("/class/:cid/daywise")
  .get(isLoggedIn, catchAsync(Avail.getClassWeeklyTime))
  .patch(isLoggedIn, catchAsync(Avail.addClassWeeklyTime));
router
  .route("/class/:cid/datewise")
  .get(isLoggedIn, catchAsync(Avail.getClassDateWiseTime))
  .patch(isLoggedIn, catchAsync(Avail.addClassDateWiseTime));
router
  .route("/class/:cid/student/attendance")
  .get(isLoggedIn, catchAsync(Avail.getAttendClassStudent))
  .post(isLoggedIn, catchAsync(Avail.markAttendenceClassStudent));

router
  .route("/student/update/:said")
  .patch(isLoggedIn, catchAsync(Avail.markAttendenceClassStudentUpdate));

router.get(
  "/student-calender/:sid",
  isLoggedIn,
  catchAsync(Avail.getAttendStudentById)
);

router.get("/student/:sid", isLoggedIn, catchAsync(Avail.viewClassStudent));

//=========ATTENDANCE OF STAFF================================
router
  .route("/department/:did/daywise")
  .get(isLoggedIn, catchAsync(Avail.getDepartmentWeeklyTime))
  .patch(isLoggedIn, catchAsync(Avail.addDepartmentWeeklyTime));
router
  .route("/department/:did/datewise")
  .get(isLoggedIn, catchAsync(Avail.getDepartmentDateWiseTime))
  .patch(isLoggedIn, catchAsync(Avail.addDepartmentDateWiseTime));
router
  .route("/institute/:id/staff/attendance")
  .get(isLoggedIn, catchAsync(Avail.getAttendInstituteStaff))
  .post(isLoggedIn, catchAsync(Avail.markAttendenceDepartmentStaff));

router
  .route("/staff/update/:said")
  .patch(isLoggedIn, catchAsync(Avail.markAttendenceDepartmentStaffUpdate));
router.get(
  "/staff-calender/:sid",
  isLoggedIn,
  catchAsync(Avail.getAttendStaffById)
);

router.get("/institute/:id", isLoggedIn, catchAsync(Avail.viewInstitute));
router.get("/staff/:sid", isLoggedIn, catchAsync(Avail.viewInstituteStaff));
router.get(
  "/staff/onemonth/:sid",
  isLoggedIn,
  catchAsync(Avail.getAttendStaffByIdForMonth)
);

//=========HOLIDAY OF DEPARTMENT CREATED================================

router.post(
  "/department/:did/holiday",
  isLoggedIn,
  catchAsync(Avail.holidayCalendar)
);
router.get(
  "/class/:cid/holiday",
  isLoggedIn,
  catchAsync(Avail.holidayInClassSide)
);
router.route("/holiday/:did").get(isLoggedIn, catchAsync(Avail.fetchHoliday));

router
  .route("/holiday/:hid/delete")
  .get(isLoggedIn, catchAsync(Avail.delHoliday));

///////////////////
router
  .route("/subject/:sid/optional/student")
  .get(isLoggedIn, catchAsync(Avail.getSubjectStudentList));
router
  .route("/subject/:sid/student/attendance")
  .get(isLoggedIn, catchAsync(Avail.getAttendSubjectStudent))
  .post(isLoggedIn, catchAsync(Avail.markAttendenceSubjectStudent));

router
  .route("/student/subject/update/:said")
  .patch(isLoggedIn, catchAsync(Avail.markAttendenceSubjectStudentUpdate));
router.get(
  "/subject/student-calender/:sid",
  isLoggedIn,
  catchAsync(Avail.getSubjectAttendStudentById)
);

router
  .route("/student/:sid/subject/list")
  .get(isLoggedIn, catchAsync(Avail.getAllSubjectOfStudent));

router.route("/all/class/:cid/zip").post(
  // isLoggedIn,
  catchAsync(Avail.getAllClassExportAttendance)
);

router.route("/hall/exam/:eid/seating/:seid/student/list").get(
  // isLoggedIn,
  catchAsync(Avail.getAllExamAttedance)
);

router
  .route("/exam/:eid/seating/:seid/attendance")
  .get(catchAsync(Avail.getTodayExamAttedance))
  .post(
    // isLoggedIn,
    catchAsync(Avail.markAttendenceExamStudent)
  );

router
  .route("/exam/update/student/attendance/:said")
  .patch(isLoggedIn, catchAsync(Avail.markAttendenceExamStudentUpdate));

router
  .route("/notification/seating/:seid")
  .get(catchAsync(Avail.sendNotificationOfAttendance));

module.exports = router;
