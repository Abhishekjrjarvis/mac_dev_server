const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");
const guideController = require("../../OptimizeController/Guide/guideController");

router
  .route("/check/staff/:sid")
  .get(catchAsync(guideController.check_staff_guide_tab_query));

router
  .route("/add/department/:did")
  .post(catchAsync(guideController.activate_staff_guide_tab_query));
router
  .route("/one/:gid/detail")
  .get(catchAsync(guideController.one_guide_detail_query));
router
  .route("/one/:gid/mentee/list/query")
  .get(catchAsync(guideController.one_guide_all_mentee_query));
router
  .route("/mentee/:gid/add/query")
  .patch(catchAsync(guideController.one_guide_add_mentee_query));
router
  .route("/mentee/:gid/remove/query")
  .delete(catchAsync(guideController.one_guide_remove_mentee_query));

router
  .route("/meeting/:gid/add")
  .post(catchAsync(guideController.one_guide_add_meeting_query));
router
  .route("/meeting/:gid/list/query")
  .get(catchAsync(guideController.one_guide_meeting_list_query));
router
  .route("/one/meeting/:meid/detail")
  .get(catchAsync(guideController.one_guide_meeting_detail_query));
router
  .route("/meeting/:meid/update/query")
  .patch(catchAsync(guideController.one_guide_update_meeting_query));
router
  .route("/schedlue/meeting/:gid/add")
  .post(catchAsync(guideController.one_guide_add_schedule_meeting_query));
router
  .route("/export/:gid/excel/query")
  .get(catchAsync(guideController.one_guide_excel_list_query));
router
  .route("/export/:gid/all/mentee/query")
  .patch(catchAsync(guideController.one_guide_mentee_excel_list_query));
router
  .route("/export/:gid/mentee/attendance/query")
  .patch(catchAsync(guideController.one_guide_detail_query));

module.exports = router;
