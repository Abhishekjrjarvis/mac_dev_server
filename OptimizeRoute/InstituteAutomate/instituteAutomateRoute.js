const express = require("express");
const router = express.Router();
const iac = require("../../OptimizeController/InstituteAutomate/instituteAutomateConroller");
const catchAsync = require("../../Utilities/catchAsync");

router
  .route("/add/:id/institute/type")
  .patch(catchAsync(iac.addInstituteTypeQuery));
router.route("/add/:id/university").patch(catchAsync(iac.addUniversityQuery));
router
  .route("/add/:id/department/type")
  .patch(catchAsync(iac.addDepartmentTypeQuery));
router.route("/add/stream/type").patch(catchAsync(iac.addStreamTypeQuery));
router.route("/add/stream/:stid/po").patch(catchAsync(iac.addStreamPoQuery));
router
  .route("/add/stream/:stid/class/master")
  .patch(catchAsync(iac.addStreamClassMasterQuery));
router
  .route("/add/stream/:stid/subject/master")
  .patch(catchAsync(iac.addStreamSubjectMasterQuery));
router
  .route("/add/stream/co/subject/master/:asmid")
  .patch(catchAsync(iac.addStreamCoSubjectMasterQuery));
router
  .route("/add/subject/:asmid/teaching/plan")
  .patch(catchAsync(iac.addStreamSubjectMasterTeachingPlanQuery));

router
  .route("/create/:id/department")
  .post(catchAsync(iac.createDepartmentInInstitiuteQuery));
router
  .route("/create/:did/class")
  .post(catchAsync(iac.createClassInDepartmentQuery));

router
  .route("/department/:did/holiday/excel/query")
  .patch(catchAsync(iac.addDepartmentHolidayByExcelQuery));
router
  .route("/department/:did/academic/start")
  .patch(catchAsync(iac.updateAcademicsStartDateOfDepartmentQuery));

router
  .route("/after/timetable/:cid/set/teaching/plan")
  .patch(catchAsync(iac.afterUpdatedClassTimetableSetTeachingPlanQuery));

router
  .route("/after/timetable/update/:cid/rearrange/teaching/plan")
  .patch(catchAsync(iac.updateOneSubjectTimetableReassignTeachingPlanQuery));

router
  .route("/after/holiday/update/:did/rearrange/teaching/plan")
  .patch(catchAsync(iac.changesHolidayInDepartmentReassignTeachingPlanQuery));

router
  .route("/nottake/attendance/:sid/rearrange/teaching/plan")
  .patch(
    catchAsync(iac.changesNotTakeAttendanceSubjectReassignTeachingPlanQuery)
  );

router
  .route("/academic/more/leacture/:sid/rearrange/teaching/plan")
  .patch(catchAsync(iac.changesAddMoreLectureSubjectReassignTeachingPlanQuery));

router
  .route("/all/type/university/stream/query")
  .get(catchAsync(iac.automateConfigAllQuery));

router.route("/all/stream/query").get(catchAsync(iac.automateAllStreamQuery));
router
  .route("/all/stream/:stid/subject/master/query")
  .get(catchAsync(iac.automateStreamAllSubjectMasterQuery));

router
  .route("/all/subject/:smid/teaching/chapter/query")
  .get(catchAsync(iac.automateSubjectMasterAllTeachingPlanQuery));

router
  .route("/all/subject/chapter/:cid/topic/query")
  .get(catchAsync(iac.automateTeachingPlanTopicListQuery));

router
  .route("/all/type/institute/:id/query")
  .get(catchAsync(iac.automateInstituteTypeListQuery));

router
  .route("/all/type/university/:id/query")
  .get(catchAsync(iac.automateUniversityListQuery));

router
  .route("/all/type/department/:id/query")
  .get(catchAsync(iac.automateDepartmentTypeListQuery));

module.exports = router;