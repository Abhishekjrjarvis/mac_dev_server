const express = require("express");
const router = express.Router();
const Election = require("../../controllers/Election/electionController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");

// Create Election Event
router.post("/new/:did", catchAsync(Election.retrieveNewElectionQuery));

// Get All Election
router.get("/:did/all/query", catchAsync(Election.retrieveAllElectionQuery));

// Get One Election
router.get("/one/:eid", catchAsync(Election.retrieveOneElectionQuery));

// Get One Election
router.get(
  "/one/:eid/all/candidate",
  catchAsync(Election.retrieveOneElectionQueryCandidate)
);

// Create Election Event
router.post(
  "/:eid/apply/:sid",
  catchAsync(Election.retrieveApplyElectionQuery)
);

// Approve Election Apply Event
router.patch(
  "/:eid/status/:applyId/candidate/:sid",
  catchAsync(Election.retrieveStatusElectionQuery)
);

// Approve Election Apply Event
router.patch(
  "/:eid/status/:applyId/candidate/:sid/vote/:nid",
  catchAsync(Election.retrieveVoteElectionQuery)
);

// All Elections at Students Side
router.get("/all/:sid/query", catchAsync(Election.retrieveAllElectionArray));

module.exports = router;
