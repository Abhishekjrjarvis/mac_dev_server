const express = require('express')
const router = express.Router()
const Landing = require('../../controllers/LandingPage/index')
const catchAsync = require('../../Utilities/catchAsync')
const multer = require("multer");
const upload = multer({ dest: "uploads/" });


// Get Touch
router.post('/get-touch', catchAsync(Landing.uploadGetTouchDetail))

// Career
router.post('/career-detail', upload.single("file"), catchAsync(Landing.uploadUserCareerDetail))



module.exports = router