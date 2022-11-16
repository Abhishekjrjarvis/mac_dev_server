const express = require("express");
const router = express.Router();
const Event = require("../../controllers/ParticipativeEvent/participateController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");

// Create Participate Event
router.post("/new/:did", catchAsync(Event.retrieveNewParticipateQuery));

// Get All Participate Event
router.get("/all/query", catchAsync(Event.retrieveAllParticipateEventQuery));

// Get One Participate Event
router.get("/one/:pid", catchAsync(Event.retrieveOneParticipateEventQuery));

// Get One Participate Event
router.get(
  "/one/:pid/student/array",
  catchAsync(Event.retrieveAllParticipateEventStudent)
);

// Assign Checklist
router.patch(
  "/one/:pid/student/:sid/checklist",
  catchAsync(Event.retrieveChecklistParticipateEventStudent)
);

// Result Declaration
router.patch(
  "/one/:pid/student/:sid/result",
  catchAsync(Event.retrieveResultParticipateEventStudent)
);

module.exports = router;
