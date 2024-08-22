const express = require("express");
const router = express.Router();
const Report = require("../../OptimizeController/Reports/reportController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router.patch(
  "/:fid/generate/daybook",
  catchAsync(Report.render_daybook_heads_wise)
);

router.get(
  "/:fid/all/daybook",
  catchAsync(Report.render_all_daybook_heads_wise)
);

module.exports = router;
