const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const dailyUpdateController = require("../../controllers/DailyUpdate/dailyUpdateController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

// Fix Daily Update Create
router
  .route("/subject/:sid")
  .get(isLoggedIn, catchAsync(dailyUpdateController.getAlldailyUpdate))
  .post(
    upload.array("file"),
    isLoggedIn,
    catchAsync(dailyUpdateController.createDailyUpdate)
  )
  .patch(isLoggedIn, catchAsync(dailyUpdateController.editDailyUpdate));

router
  .route("/student/:sid")
  .get(isLoggedIn, catchAsync(dailyUpdateController.getAlldailyUpdateStudent));
module.exports = router;
