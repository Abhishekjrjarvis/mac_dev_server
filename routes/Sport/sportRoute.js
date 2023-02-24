const express = require("express");
const router = express.Router();
const Sport = require("../../controllers/Sport/sportController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/ins/:id/staff/:sid",
  isLoggedIn,
  isApproved,
  catchAsync(Sport.getSportDepart)
);

// One Sport Department Detail
router.get("/detail/:id", isLoggedIn, catchAsync(Sport.retrieveSportDetail));

// One Sport All Event
router.get(
  "/detail/:id/event",
  isLoggedIn,
  catchAsync(Sport.retrieveSportDetailEvent)
);

// All Sport Classes
router.get(
  "/detail/:id/all/class",
  isLoggedIn,
  catchAsync(Sport.retrieveSportDetailClass)
);

router.post(
  "/ins/:id/sport/:sid/class",
  isLoggedIn,
  catchAsync(Sport.getSportClass)
);

router.post(
  "/:sid/event",
  isLoggedIn,
  upload.single("file"),
  catchAsync(Sport.getSportEvent)
);

router.patch("/info/:sid", isLoggedIn, catchAsync(Sport.updateSportInfo));

// One Event Detail
router.get(
  "/event/detail/:id",
  isLoggedIn,
  catchAsync(Sport.retrieveSportEventDetail)
);

// All Event Match
router.get(
  "/event/:eid/match",
  isLoggedIn,
  catchAsync(Sport.retrieveSportEventQuery)
);

// Add Student
router.post(
  "/class/:cid/student/add",
  isLoggedIn,
  catchAsync(Sport.updateStudentSportClass)
);

// All Sport Class Student
router.get(
  "/class/:cid/all/student",
  isLoggedIn,
  catchAsync(Sport.retrieveAllSportStudent)
);

// All Sport Class Team
router.get(
  "/class/:cid/all/team",
  isLoggedIn,
  catchAsync(Sport.retrieveAllSportTeam)
);

// Remove Student
router.post(
  "/class/:cid/student/remove",
  isLoggedIn,
  catchAsync(Sport.removeStudentSportClass)
);

router.get(
  "/class/detail/:cid",
  isLoggedIn,
  catchAsync(Sport.retrieveSportClassDetail)
);

router.patch(
  "/class/info/:cid",
  isLoggedIn,
  catchAsync(Sport.updateSportClassInfo)
);

// Create Class Team
router.post(
  "/class/team",
  isLoggedIn,
  upload.single("file"),
  catchAsync(Sport.updateSportTeam)
);

// Add Intra Match to the Event
router.post(
  "/event/:eid/match/intra",
  isLoggedIn,
  catchAsync(Sport.getIntraMatchEvent)
);

router.post(
  "/event/:eid/match/inter",
  isLoggedIn,
  catchAsync(Sport.getInterMatchEvent)
);

// Match Detail
router.get(
  "/match/detail/:mid",
  isLoggedIn,
  catchAsync(Sport.retrieveMatchDetail)
);

// Update Score of Intra Match (Individual)
router.post(
  "/match/:mid/update/intra/individual",
  isLoggedIn,
  catchAsync(Sport.updateIntraMatchIndividual)
);

// Update Score of Inter Match (Individual)
router.post(
  "/match/:mid/update/inter/individual",
  isLoggedIn,
  catchAsync(Sport.updateInterMatchIndividual)
);

// Update Score of Intra Match (Team)
router.post(
  "/match/:mid/update/intra/team",
  isLoggedIn,
  catchAsync(Sport.updateIntraMatchTeam)
);

// Update Score of Inter Match (Team)
router.post(
  "/match/:mid/update/inter/team",
  isLoggedIn,
  catchAsync(Sport.updateInterMatchTeam)
);

// Update Score of Intra Match (Free)
router.post(
  "/match/:mid/update/intra/free",
  isLoggedIn,
  catchAsync(Sport.updateIntraMatchFree)
);

// Update Score of Inter Match (Free)
router.post(
  "/match/:mid/update/inter/free",
  isLoggedIn,
  catchAsync(Sport.updateInterMatchFree)
);

// Event Update
router.patch("event/:eid/update", isLoggedIn, catchAsync(Sport.updateEvent));

// Event Match Delete
router.delete(
  "/event/:eid/match/:mid/delete",
  isLoggedIn,
  catchAsync(Sport.removeMatchEvent)
);

// Event Delete
router.delete(
  "/:sid/event/:eid/delete",
  isLoggedIn,
  catchAsync(Sport.removeEvent)
);

// Student Side Event Rendering
router.get(
  "/student/event/query/:sid/all",
  isLoggedIn,
  catchAsync(Sport.renderStudentSideEvent)
);

// Student Side Event Match Rendering
router.get(
  "/student/event/query/:sid/all/match/:eid",
  isLoggedIn,
  catchAsync(Sport.renderStudentSideMatch)
);

// Student Side Class Rendering
router.get(
  "/student/class/:sid/query",
  isLoggedIn,
  catchAsync(Sport.renderStudentSideClass)
);

// Student Side Team Rendering
router.get(
  "/student/team/:cid/query",
  isLoggedIn,
  catchAsync(Sport.renderStudentSideTeam)
);

// One Team Rendering
router.get(
  "/team/:tid/query",
  isLoggedIn,
  catchAsync(Sport.renderOneTeamQuery)
);

module.exports = router;
