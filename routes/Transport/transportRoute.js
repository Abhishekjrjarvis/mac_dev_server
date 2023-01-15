const express = require("express");
const router = express.Router();
const Transport = require("../../controllers/Transport/transportController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/ins/:id/staff/:sid",
  isLoggedIn,
  isApproved,
  catchAsync(Transport.renderNewTransportManager)
);

router.get(
  "/:tid/dashboard",
  isLoggedIn,
  catchAsync(Transport.renderTransportManagerDashboard)
);

module.exports = router;
