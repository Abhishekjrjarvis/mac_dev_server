const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const staffMember = require("../../controllers/Edit/staffMember");
const catchAsync = require("../../Utilities/catchAsync");
// const { isLoggedIn } = require("../../middleware");

router
  .route("/form/photo/:sid")
  .patch(upload.single("file"), catchAsync(staffMember.photoEditByStaff));

router
  .route("/form/detail/:sid")
  .patch(catchAsync(staffMember.formEditByInstitute));

module.exports = router;
