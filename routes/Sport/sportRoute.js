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
router.get("/detail/:id", catchAsync(Sport.retrieveSportDetail));

// One Sport All Event
router.get("/detail/:id/event", catchAsync(Sport.retrieveSportDetailEvent));

router.post("/ins/:id/sport/:sid/class", catchAsync(Sport.getSportClass));

router.post(
  "/:sid/event",
  upload.single("file"),
  catchAsync(Sport.getSportEvent)
);

router.patch("/info/:sid", catchAsync(Sport.updateSportInfo));

// One Event Detail
router.get("/event/detail/:id", catchAsync(Sport.retrieveSportEventDetail));

// All Event Match
router.get("/event/:eid/match", catchAsync(Sport.retrieveSportEventQuery));

// Add Intra Match to the Event
router.post('/event/:eid/match/intra', catchAsync(Sport.getIntraMatchEvent))

router.post('/event/:eid/match/inter', catchAsync(Sport.getInterMatchEvent))

router.get("/class/detail/:cid", catchAsync(Sport.retrieveSportClassDetail));

// Add Student
router.post('/class/:cid/student/add', catchAsync(Sport.updateStudentSportClass))

// Remove Student
router.post('/class/:cid/student/remove', catchAsync(Sport.removeStudentSportClass))

router.patch('/class/info/:cid', catchAsync(Sport.updateSportClassInfo))


// Create Class Team
router.post('/class/team', upload.single('file'), catchAsync(Sport.updateSportTeam))

// Match Detail
router.get('/match/detail/:mid', catchAsync(Sport.retrieveMatchDetail))

// Update Score of Intra Match (Individual)
router.post('/match/:mid/update/intra/individual', catchAsync(Sport.updateIntraMatchIndividual))

// Update Score of Inter Match (Individual)
router.post(
  "/match/:mid/update/inter/individual",
  isLoggedIn,
  catchAsync(Sport.updateInterMatchIndividual)
);

// Update Score of Intra Match (Team)
router.post('/match/:mid/update/intra/team', isLoggedIn, catchAsync(Sport.updateIntraMatchTeam))

// Update Score of Inter Match (Team)
router.post(
  "/match/:mid/update/inter/team",
  isLoggedIn,
  catchAsync(Sport.updateInterMatchTeam)
);

// Update Score of Intra Match (Free)
router.post('/match/:mid/update/intra/free', isLoggedIn, catchAsync(Sport.updateIntraMatchFree))

// Update Score of Inter Match (Free)
router.post('/match/:mid/update/inter/free', isLoggedIn, catchAsync(Sport.updateInterMatchFree))

// Event Update
router.patch('event/:eid/update', catchAsync(Sport.updateEvent))

// Event Match Delete
router.delete('/event/:eid/match/:mid/delete', catchAsync(Sport.removeMatchEvent))

// Event Delete
router.delete('/:sid/event/:eid/delete', catchAsync(Sport.removeEvent))

// Student Side Event Rendering
router.get('/student/event/query/:sid/all', catchAsync(Sport.renderStudentSideEvent))

// Student Side Event Match Rendering
router.get('/student/event/query/:sid/all/match/:eid', catchAsync(Sport.renderStudentSideMatch))

module.exports = router