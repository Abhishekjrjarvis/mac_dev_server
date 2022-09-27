const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const dailyUpdateController = require("../../controllers/DailyUpdate/dailyUpdateController");
const catchAsync = require("../../Utilities/catchAsync");
// const { isLoggedIn } = require("../../middleware");

router
  .route("/subject/:sid")
  .get(catchAsync(dailyUpdateController.getAlldailyUpdate))
  .post(
    upload.array("file"),
    catchAsync(dailyUpdateController.createDailyUpdate)
  )
  .patch(catchAsync(dailyUpdateController.editDailyUpdate));

module.exports = router;
