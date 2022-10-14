const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const studentMember = require("../../controllers/Edit/studentMember");
const catchAsync = require("../../Utilities/catchAsync");
// const { isLoggedIn } = require("../../middleware");

router
  .route("/form/photo/:sid")
  .patch(upload.single("file"), catchAsync(studentMember.photoEditByStudent));

router
  .route("/form/detail/:sid")
  .patch(catchAsync(studentMember.formEditByClassTeacher));

router
  .route("/remove/:sid")
  .patch(catchAsync(studentMember.removeByClassTeacher));

router
  .route("/:sid/previous")
  .get(catchAsync(studentMember.getAllPreviousYear));
router
  .route("/:pid/previous/report")
  .get(catchAsync(studentMember.previousYearReportCard));

module.exports = router;
