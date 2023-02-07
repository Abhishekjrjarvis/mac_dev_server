const express = require("express");
const router = express.Router();
const Election = require("../../controllers/Election/electionController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

// Create Election Event
router.post(
  "/new/:did",
  // isLoggedIn,
  catchAsync(Election.retrieveNewElectionQuery)
);

// Get All Election
router.get(
  "/:did/all/query",
  // isLoggedIn,
  catchAsync(Election.retrieveAllElectionQuery)
);

// Get One Election
router.get(
  "/one/:eid",
  // isLoggedIn,
  catchAsync(Election.retrieveOneElectionQuery)
);

// Get One Election
router.get(
  "/one/:eid/all/candidate",
  // isLoggedIn,
  catchAsync(Election.retrieveOneElectionQueryCandidate)
);

// Create Election Event
router.post(
  "/:eid/apply/:sid",
  // isLoggedIn,
  catchAsync(Election.retrieveApplyElectionQuery)
);

// Approve Election Apply Event
router.patch(
  "/:eid/status/:applyId/candidate/:sid",
  // isLoggedIn,
  catchAsync(Election.retrieveStatusElectionQuery)
);

// Approve Election Apply Event
router.patch(
  "/:eid/status/:applyId/candidate/:sid/vote/:nid",
  // isLoggedIn,
  catchAsync(Election.retrieveVoteElectionQuery)
);

// Approve Election Apply Event
router.get(
  "/:did/one/institute",
  // isLoggedIn,
  catchAsync(Election.retrieveVoteElectionDepartment)
);

// All Elections at Students Side
router.get(
  "/all/:sid/query",
  // isLoggedIn,
  catchAsync(Election.retrieveAllStudentElectionArray)
);

module.exports = router;
