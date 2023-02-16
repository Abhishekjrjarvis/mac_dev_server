const express = require("express");
const router = express.Router();
const Event = require("../../controllers/ParticipativeEvent/participateController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

// Create Participate Event
router.post(
  "/new/:did",
  // isLoggedIn,
  catchAsync(Event.retrieveNewParticipateQuery)
);

// Get All Participate Event
router.get(
  "/all/query/:did",
  // isLoggedIn,
  catchAsync(Event.retrieveAllParticipateEventQuery)
);

// Get One Participate Event
router.get(
  "/one/:pid",
  // isLoggedIn,
  catchAsync(Event.retrieveOneParticipateEventQuery)
);

// Get One Participate Event
router.get(
  "/one/:pid/student/array",
  // isLoggedIn,
  catchAsync(Event.retrieveAllParticipateEventStudent)
);

// Assign Checklist
router.patch(
  "/one/:pid/student/:sid/checklist",
  // isLoggedIn,
  catchAsync(Event.retrieveChecklistParticipateEventStudent)
);

// Result Declaration
router.patch(
  "/one/:pid/student/:sid/result",
  // isLoggedIn,
  catchAsync(Event.retrieveResultParticipateEventStudent)
);

module.exports = router;
