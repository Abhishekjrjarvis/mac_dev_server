const express = require("express");
const router = express.Router();
const LMS = require("../../controllers/LMS/LMSController");
const LMSV2 = require("../../controllers/ComplaintLeaveTransfer/ComplaintController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router.route("/ins/lms/query").post(catchAsync(LMS.render_lms_module_query));

router
  .route("/:lmid/dashboard")
  .get(catchAsync(LMS.render_lms_dashboard_master));

router.route("/manage/tab/:lmid").patch(catchAsync(LMS.render_tab_manage));

router.route("/:lmid/all/mods/query").get(catchAsync(LMS.render_lms_all_mods));

router.route("/manage/leave/:lmid").patch(catchAsync(LMS.render_leave_manage));

router
  .route("/staff/:sid")
  .get(catchAsync(LMSV2.getStaffLeave))
  .post(catchAsync(LMSV2.postStaffLeave));

router
  .route("/staff/leave/:lid")
  .get(isLoggedIn, catchAsync(LMSV2.getStaffOneLeaveDetail))
  .delete(isLoggedIn, catchAsync(LMSV2.getStaffOneLeaveDelete));

router
  .route("/institute/:id")
  .get(catchAsync(LMSV2.getAllStaffLeaveInstitute))
  .patch(catchAsync(LMSV2.oneStaffLeaveProcess));

router.patch(
  "/:id/config/leave/assign/query",
  catchAsync(LMSV2.renderLeaveConfigQuery)
);

router.patch(
  "/:sid/config/staff/leave/assign/query",
  catchAsync(LMSV2.renderStaffLeaveConfigQuery)
);

router
  .route("/staff/:sid/coff/query")
  .post(isLoggedIn, catchAsync(LMSV2.postStaffCoffLeaveQuery));

router
  .route("/staff/:id/all/coff/query")
  .get(isLoggedIn, catchAsync(LMSV2.renderStaffCoffLeaveQuery));

router.patch("/manage/approve/:lid", catchAsync(LMSV2.renderManageCoffQuery));

router.patch(
  "/add/:mid/staff/to/authority",
  catchAsync(LMSV2.renderAddStaffToAuthorityQuery)
);

router.patch(
  "/remove/:mid/staff/to/authority",
  catchAsync(LMSV2.renderRemoveStaffToAuthorityQuery)
);

router.get(
  "/all/leave/request/:mid/query",
  catchAsync(LMSV2.renderAllLeaveRequestQuery)
);

router.get(
  "/all/leave/history/:mid/query",
  catchAsync(LMSV2.renderAllLeaveHistoryQuery)
);

router.get("/all/staff/:mid/query", catchAsync(LMSV2.renderAllStaffQuery));

router.get(
  "/:sid/leave/overview/query",
  catchAsync(LMSV2.renderLeaveOverviewQuery)
);

router.get(
  "/:sid/leave/overview/filter/query",
  catchAsync(LMSV2.renderLeaveFilterOverviewQuery)
);

router.patch(
  "/:lid/config/rules/query",
  catchAsync(LMSV2.renderLeaveConfigRulesQuery)
);

router.patch(
  "/:lid/config/setoff/rules/query",
  catchAsync(LMSV2.renderLeaveSetOffConfigRulesQuery)
);

router.get(
  "/:id/teaching/type/query",
  catchAsync(LMSV2.renderTeachingTypeQuery)
);

router.get(
  "/:id/leave/config/query",
  catchAsync(LMSV2.renderOneLeaveConfigQuery)
);

router.post(
  "/:lid/holiday/query",
  catchAsync(LMSV2.renderLeaveConfigHolidayQuery)
);

router.post("/teaching", catchAsync(LMSV2.renderTeachingQuery));

router.post(
  "/biometric/linking/query",
  catchAsync(LMS.render_biometric_linking_query)
);

router.get(
  "/:lmid/all/linked/staff/query",
  catchAsync(LMS.render_all_linked_staff_query)
);

router.get(
  "/:id/leave/manage/query",
  catchAsync(LMS.render_leave_manage_query)
);
router.patch(
  "/export/:lmid/staff/leave/query",
  catchAsync(LMS.all_leave_export_with_staff_list_query)
);
router.get(
  "/:lcid/one/month/holiday/query",
  catchAsync(LMS.holiday_with_monthly_wise_query)
);
router.patch(
  "/institute/:id/office/query",
  catchAsync(LMS.office_time_institute_query)
);
router.patch(
  "/department/:did/office/query",
  catchAsync(LMS.office_time_department_query)
);

router.get(
  "/staff/institute/:id/list/query",
  catchAsync(LMS.replacement_staff_list_query)
);
module.exports = router;
