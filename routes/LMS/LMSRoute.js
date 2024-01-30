const express = require("express");
const router = express.Router();
const LMS = require("../../controllers/LMS/LMSController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");


router
    .route("/ins/lms/query")
    .post(catchAsync(LMS.render_lms_module_query));

router
    .route("/:lmid/dashboard")
    .get(catchAsync(LMS.render_lms_dashboard_master));
  
router
  .route("/manage/tab/:lmid")
    .patch(catchAsync(LMS.render_tab_manage));
  
router
    .route("/:lmid/all/mods/query")
    .get(catchAsync(LMS.render_lms_all_mods));

router
    .route("/manage/leave/:lmid")
    .get(catchAsync(LMS.render_leave_manage));
  

module.exports = router;