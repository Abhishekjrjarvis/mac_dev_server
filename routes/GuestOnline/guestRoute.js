const express = require("express");
const router = express.Router();
const Guest = require("../../controllers/GuestOnline/guestController");
const catchAsync = require("../../Utilities/catchAsync");

router.get(
  "/search/institute",
  catchAsync(Guest.renderSearchInstituteByCodeQuery)
);

router.get("/search/student", catchAsync(Guest.renderSearchStudentByGRQuery));

router.patch("/new/code", catchAsync(Guest.renderNewCodeQuery));

module.exports = router;
