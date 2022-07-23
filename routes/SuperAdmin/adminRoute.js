const express = require('express')
const router = express.Router()
const Admin = require('../../controllers/SuperAdmin/AdminController')
const catchAsync = require('../../Utilities/catchAsync')
const { isLoggedIn } = require('../../middleware')
const multer = require('multer')
const upload = multer({ dest: "uploads/" });

// Get Super Admin Id
router.get('/:aid', isLoggedIn, catchAsync(Admin.getAdmin))

// Get Approve Institute Array
router.get('/:aid/approve-array', isLoggedIn, catchAsync(Admin.retrieveApproveInstituteArray))

// Get Pending Institute Array
router.get('/:aid/pending-array', isLoggedIn, catchAsync(Admin.retrievePendingInstituteArray))

// Get User Array
router.get('/:aid/user-array', isLoggedIn, catchAsync(Admin.retrieveUserArray))

// Assign One Institute to be Universal Following
router.post('/:aid/ins/universal', isLoggedIn, catchAsync(Admin.retrieveUniversalInstitute))

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
  
// All Counts for Landing Page
router.get('/count/detail', catchAsync(Admin.retrieveLandingPageCount))

// Get One Institute 
router.get('/one/institute/:id', isLoggedIn, catchAsync(Admin.retrieveOneInstitute))

// Bank Detail verified by Super Admin
router.post('/:aid/bank/detail/verification/:id', isLoggedIn, catchAsync(Admin.verifyInstituteBankDetail))

// Get Approve Activate Institute Array
router.get('/:aid/approve/activate-array', isLoggedIn, catchAsync(Admin.retrieveApproveInstituteActivate))

// Get Approve Activate Volume Institute Array
router.get('/:aid/approve/activate/volume-array', isLoggedIn, catchAsync(Admin.retrieveApproveInstituteActivateVolume))

// User Referral Payment Array
router.get('/referral/user/payment', isLoggedIn, catchAsync(Admin.retrieveReferralUserArray))

// User Referral Payment Array
router.post('/:aid/referral/:uid/pay', isLoggedIn, catchAsync(Admin.retrieveReferralUserPayment))

// Get In Touch Array
router.get('/:aid/get/touch', isLoggedIn, catchAsync(Admin.retrieveGetInTouch))


module.exports = router