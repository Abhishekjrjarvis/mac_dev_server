const express = require("express");
const router = express.Router();
const Sport = require("../../controllers/Sport/sportController");
const catchAsync = require("../../Utilities/catchAsync");
const { isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/ins/:id/staff/:sid",
  // isApproved,
  catchAsync(Sport.getSportDepart)
);

// One Sport Department Detail
router.get("/detail/:id", catchAsync(Sport.retrieveSportDetail));

// One Sport All Event
router.get("/detail/:id/event", catchAsync(Sport.retrieveSportDetailEvent));

// All Sport Classes
router.get(
  "/detail/:id/all/class",

  catchAsync(Sport.retrieveSportDetailClass)
);

router.post(
  "/ins/:id/sport/:sid/class",

  catchAsync(Sport.getSportClass)
);

router.post(
  "/:sid/event",

  upload.single("file"),
  catchAsync(Sport.getSportEvent)
);

router.patch("/info/:sid", catchAsync(Sport.updateSportInfo));

// One Event Detail
router.get(
  "/event/detail/:id",

  catchAsync(Sport.retrieveSportEventDetail)
);

// All Event Match
router.get(
  "/event/:eid/match",

  catchAsync(Sport.retrieveSportEventQuery)
);

// Add Student
router.post(
  "/class/:cid/student/add",

  catchAsync(Sport.updateStudentSportClass)
);

// All Sport Class Student
router.get(
  "/class/:cid/all/student",

  catchAsync(Sport.retrieveAllSportStudent)
);

// All Sport Class Team
router.get(
  "/class/:cid/all/team",

  catchAsync(Sport.retrieveAllSportTeam)
);

// Remove Student
router.post(
  "/class/:cid/student/remove",

  catchAsync(Sport.removeStudentSportClass)
);

router.get(
  "/class/detail/:cid",

  catchAsync(Sport.retrieveSportClassDetail)
);

router.patch(
  "/class/info/:cid",

  catchAsync(Sport.updateSportClassInfo)
);

// Create Class Team
router.post(
  "/class/team",

  upload.single("file"),
  catchAsync(Sport.updateSportTeam)
);

// Add Intra Match to the Event
router.post(
  "/event/:eid/match/intra",

  catchAsync(Sport.getIntraMatchEvent)
);

router.post(
  "/event/:eid/match/inter",

  catchAsync(Sport.getInterMatchEvent)
);

// Match Detail
router.get(
  "/match/detail/:mid",

  catchAsync(Sport.retrieveMatchDetail)
);

// Update Score of Intra Match (Individual)
router.post(
  "/match/:mid/update/intra/individual",

  catchAsync(Sport.updateIntraMatchIndividual)
);

// Update Score of Inter Match (Individual)
router.post(
  "/match/:mid/update/inter/individual",

  catchAsync(Sport.updateInterMatchIndividual)
);

// Update Score of Intra Match (Team)
router.post(
  "/match/:mid/update/intra/team",

  catchAsync(Sport.updateIntraMatchTeam)
);

// Update Score of Inter Match (Team)
router.post(
  "/match/:mid/update/inter/team",

  catchAsync(Sport.updateInterMatchTeam)
);

// Update Score of Intra Match (Free)
router.post(
  "/match/:mid/update/intra/free",

  catchAsync(Sport.updateIntraMatchFree)
);

// Update Score of Inter Match (Free)
router.post(
  "/match/:mid/update/inter/free",

  catchAsync(Sport.updateInterMatchFree)
);

// Event Update
router.patch("event/:eid/update", catchAsync(Sport.updateEvent));

// Event Match Delete
router.delete(
  "/event/:eid/match/:mid/delete",

  catchAsync(Sport.removeMatchEvent)
);

// Event Delete
router.delete(
  "/:sid/event/:eid/delete",

  catchAsync(Sport.removeEvent)
);

// Student Side Event Rendering
router.get(
  "/student/event/query/:sid/all",

  catchAsync(Sport.renderStudentSideEvent)
);

// Student Side Event Match Rendering
router.get(
  "/student/event/query/:sid/all/match/:eid",

  catchAsync(Sport.renderStudentSideMatch)
);

// Student Side Class Rendering
router.get(
  "/student/class/:sid/query",

  catchAsync(Sport.renderStudentSideClass)
);

// Student Side Team Rendering
router.get(
  "/student/team/:cid/query",

  catchAsync(Sport.renderStudentSideTeam)
);

// One Team Rendering
router.get(
  "/team/:tid/query",

  catchAsync(Sport.renderOneTeamQuery)
);

module.exports = router;
