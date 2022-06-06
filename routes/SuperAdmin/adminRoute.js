const express = require('express')
const router = express.Router()
const Admin = require('../../controllers/SuperAdmin/AdminController')
const catchAsync = require('../../Utilities/catchAsync')
const { isLoggedIn } = require('../../middleware')
const multer = require('multer')
const upload = multer({ dest: "uploads/" });


// Get Super Admin Id
router.get('/', catchAsync(Admin.getAdmin))

// Get Super Admin Form
router.get('/new', catchAsync(Admin.getSuperAdmin))

// Send OTP 
router.post('/send-otp', catchAsync(Admin.sendOtpToAdmin))

// Verify OTP
router.post('/verify-otp', catchAsync(Admin.getVerifySuperAdmin))

// Post Super Admin Details
router.post('/register', upload.single('file'), catchAsync(Admin.updateSuperAdmin))

// Get Recovery Phrase
router.get('/phrase', catchAsync(Admin.retrieveRecoveryPhrase))

// Get Admin Data
router.get('dashboard/:id',isLoggedIn, catchAsync(Admin.getAll))

// Approve Institute By Super Admin
router.post('/:aid/approve/ins/:id',isLoggedIn, catchAsync(Admin.getApproveIns))

// Reject Institute By Super Admin
router.post('/:aid/reject/ins/:id',isLoggedIn, catchAsync(Admin.getRejectIns))
  
// All Referral By Ins
router.get('/referral/ins',isLoggedIn, catchAsync(Admin.getReferralIns))
    
// All Referral By User
router.get('/referral/user',isLoggedIn, catchAsync(Admin.getReferralUser))
  

module.exports = router