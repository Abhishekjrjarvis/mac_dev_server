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
  .get(isLoggedIn, catchAsync(Avail.delHoliday))
  .delete(isLoggedIn, catchAsync(Avail.delHoliday));

///////////////////
router
  .route("/subject/:sid/optional/student")
  .get(catchAsync(Avail.getSubjectStudentList));
router
  .route("/subject/:sid/student/attendance")
  .get(isLoggedIn, catchAsync(Avail.getAttendSubjectStudent))
  .post(isLoggedIn, catchAsync(Avail.markAttendenceSubjectStudent));

// router
//   .route("/subject/:sid/student/attendance/extra")
//   .get(isLoggedIn, catchAsync(Avail.getAttendSubjectStudentExtraQuery))

router
  .route("/subject/:sid/student/attendance/extra/:aid")
  .get(isLoggedIn, catchAsync(Avail.getAttendSubjectStudentExtraOneQuery));

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
  catchAsync(Avail.getAllClassExportAttendanceModify)
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

router.route("/all/subject/:sid/zip").post(
  // isLoggedIn,
  catchAsync(Avail.getAllSubjectExportAttendance)
);

router
  .route("/subject/:sid/student/attendance/exist/query")
  .post(isLoggedIn, catchAsync(Avail.markAttendenceSubjectStudentExistQuery));

router
  .route("/set/subject/:sid/attendace/time/slot")
  .patch(catchAsync(Avail.subjectTodaySetAttendanceTimeQuery));

router
  .route("/set/time/slot")
  .get(catchAsync(Avail.subjectTimeSlotFormatQuery));

router
  .route("/delete/:said/today")
  .patch(catchAsync(Avail.subjectDeleteTodayAttendanceQuery));

router
  .route("/timetable/all/day/check")
  .patch(catchAsync(Avail.timetableQueryReset));

router
  .route("/subject/already/slot/mark/class/:cid")
  .get(catchAsync(Avail.subjectTimeSlotMarkListQuery));

router
  .route("/update/subject/:sid/attendace/set/time/slot")
  .patch(catchAsync(Avail.subjectTodayUpdateAttendanceTimeQuery));

router
  .route("/today/subject/:sid/added/lecture")
  .get(catchAsync(Avail.getSubjectAttednaceLectureQuery))
  .post(catchAsync(Avail.subjectAttednaceAddLectureQuery));

router
  .route("/inject/default/parameter")
  .get(catchAsync(Avail.assignAttendanceToDefaultParameterQuery));
router
  .route("/staff/mark/:id/list/excel")
  .patch(catchAsync(Avail.getInstituteStaffMarkExcelQuery));

router.route("/cls/:cid/theory/practical/zip").post(
  // isLoggedIn,
  catchAsync(Avail.cls_attendance_theory_practical_wise_export_quer)
);

module.exports = router;
