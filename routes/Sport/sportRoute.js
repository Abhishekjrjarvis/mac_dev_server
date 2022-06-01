const express = require('express')
const router = express.Router()
const Sport = require('../../controllers/Sport/sportController')
const catchAsync = require('../../Utilities/catchAsync')
const { isLoggedIn, isApproved } = require('../../middleware')
const multer = require('multer')
const upload = multer({ dest: "uploads/" });


// Assigning Head to Sport Department
router.post('/ins/:id/staff/:sid', isLoggedIn, isApproved, catchAsync(Sport.getSportDepart))

// Get Details of Sport Department
router.get('/detail/:id', isLoggedIn, catchAsync(Sport.retrieveSportDetail))

// Assigning Head to Sport Class
router.post('/ins/:id/sport/:sid/class', isLoggedIn, catchAsync(Sport.getSportClass))

// Create Sport Event at Sport Department
router.post('/:sid/event', isLoggedIn, catchAsync(Sport.getSportEvent))

// Update Info At Sport Department
router.post('/info/:sid', isLoggedIn, catchAsync(Sport.updateSportInfo))

// Get All Details of Event At Sport
router.get('/event/detail/:id', isLoggedIn, catchAsync(Sport.retrieveSportEventDetail))

// Add Intra Match to the Event
router.post('/event/:eid/match', isLoggedIn, catchAsync(Sport.getIntraMatchEvent))

// Add Inter Match to the Event
router.post('/event/:eid/inter/match', isLoggedIn, catchAsync(Sport.getInterMatchEvent))

// Get Details of Sport Class
router.get('/class/detail/:cid', isLoggedIn, catchAsync(Sport.retrieveSportClassDetail))

// Add Student to Sport Class
router.post('/class/:cid/student/:sid', isLoggedIn, catchAsync(Sport.updateStudentSportClass))

// Update Info At Sport Class
router.post('/class/info/:sid', isLoggedIn, catchAsync(Sport.updateSportClassInfo))

// Add Student
router.post('/class/:cid/student/:id/add', isLoggedIn, catchAsync(Sport.getStudentSportClass))

// Remove Student
router.post('/class/:cid/student/:id/remove', isLoggedIn, catchAsync(Sport.removeStudentSportClass))

// Added Team At Sport Class
router.post('/class/:cid/team', isLoggedIn, catchAsync(Sport.updateSportTeam))

// Get Details of Match
router.get('/match/detail/:mid', isLoggedIn, catchAsync(Sport.retrieveMatchDetail))

// Update Score of Intra Match (Individual)
router.post('/match/:mid/update/individual', isLoggedIn, catchAsync(Sport.updateIntraMatchIndividual))

// Update Score of Inter Match (Individual)
router.post('/match/:mid/update/inter/individual', isLoggedIn, catchAsync(Sport.updateInterMatchIndividual))

// Update Score of Intra Match (Team)
router.post('/match/:mid/update/team', isLoggedIn, catchAsync(Sport.updateIntraMatchTeam))

// Update Score of Inter Match (Team)
router.post('/match/:mid/update/inter/team', isLoggedIn, catchAsync(Sport.updateInterMatchTeam))

// Update Score of Intra Match (Free)
router.post('/match/:mid/update/free', isLoggedIn, catchAsync(Sport.updateIntraMatchFree))

// Update Score of Inter Match (Free)
router.post('/match/:mid/update/inter/free', isLoggedIn, catchAsync(Sport.updateInterMatchFree))

// Update Event At Sport Department
router.patch('/:sid/event/:eid/update', isLoggedIn, catchAsync(Sport.updateEvent))

// Delete Match At Sport Event
router.delete('/event/:eid/match/:mid/delete', isLoggedIn, catchAsync(Sport.removeMatchEvent))

// Delete Event At Sport Department
router.delete('/:sid/event/:eid/delete', isLoggedIn, catchAsync(Sport.removeEvent))





module.exports = router