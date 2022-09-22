const express = require('express')
const router = express.Router()
const catchAsync = require('../../Utilities/catchAsync')
const Auth = require('../../controllers/Authentication/AuthController')
const multer = require('multer')
const upload = multer({ dest: "uploads/" });
const { isLimit } = require('../../middleware')


// Send Otp At Institute Phone Number
router.post('/ins-detail', catchAsync(Auth.getOtpAtIns))

// Verify Otp Code Provided By Institute
router.post('/ins-detail-verify/:id', catchAsync(Auth.verifyOtpByIns))

// Institute Register
router.post('/ins/register', upload.single("file"), catchAsync(Auth.getRegisterIns))

// Institute Password Creation
router.post('/ins/create-password/:id', catchAsync(Auth.getPassIns))

// Send Otp At User Phone Number
router.post('/user-detail', catchAsync(Auth.getOtpAtUser))

// Verify Otp Code Provided By User
router.post('/user-detail-verify/:id', catchAsync(Auth.verifyOtpByUser))

// Profile Creation By User
router.post('/profile-creation/:id', upload.single('file'), catchAsync(Auth.profileByUser))

// Profile Creation By GOOGLE Auth
router.post('/profile/google', catchAsync(Auth.profileByGoogle))

// Password Creation By User
router.post('/create-user-password/:id', catchAsync(Auth.getUserPassword))

// Forgot Password Otp Send By End User (Institute Admin, User)
router.post('/user/forgot', catchAsync(Auth.forgotPasswordSendOtp))

// Forgot Password Otp Verify By End User (Institute Admin, User)
router.post('/user/forgot/:fid', catchAsync(Auth.forgotPasswordVerifyOtp))

// Create New Password While Verify Otp
router.post('/user/reset/password/:rid', catchAsync(Auth.getNewPassword))  

// Login Detail (SuperAdmin, InstituteAdmin, Enduser)
router.get('/login', catchAsync(Auth.getLogin))

// Fetch Logged In by Which (End User, Institute Admin, Super Admin)
router.post('/login', isLimit, catchAsync(Auth.authentication))

// Fetch Logged In by GOOGLE
router.post('/login/google', catchAsync(Auth.authenticationGoogle))

// Logout By End User
router.get('/logout', catchAsync(Auth.getLogout))
    
router.post('/email/check/redundant', catchAsync(Auth.retrieveEmailRedundantQuery))


module.exports = router