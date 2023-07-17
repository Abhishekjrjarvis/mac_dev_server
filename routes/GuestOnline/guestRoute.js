const express = require("express");
const router = express.Router();
const Guest = require("../../controllers/GuestOnline/guestController");
const catchAsync = require("../../Utilities/catchAsync");

router.post(
  "/search/institute/search/student",
  catchAsync(Guest.renderSearchInstituteByCodeQuery)
);

router.patch("/new/code", catchAsync(Guest.renderNewCodeQuery));

module.exports = router;
