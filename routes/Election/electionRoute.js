const express = require("express");
const router = express.Router();
const Election = require("../../controllers/Election/electionController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");

// router.get("/detail/:id", catchAsync(Sport.retrieveSportDetail));

module.exports = router