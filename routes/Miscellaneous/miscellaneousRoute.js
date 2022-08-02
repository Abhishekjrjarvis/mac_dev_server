const express = require('express')
const router = express.Router()
const { isLoggedIn, isValidKey } = require('../../middleware')
const catchAsync = require('../../Utilities/catchAsync')
const All = require('../../controllers/Miscellaneous/miscellaneousController')


// All Staff Data
// isLoggedIn, isValidKey
router.get('/staff/list/data', isLoggedIn, catchAsync(All.getAllStaff))

// All Student Data
router.get('/student/list/data', isLoggedIn, catchAsync(All.getAllStudent))

// All User Data
router.get('/user/list/data', isLoggedIn, catchAsync(All.getAllUser))

// All Payment (Fee + Checklist) Data
router.get('/payment/day', isLoggedIn, catchAsync(All.getAllPaymentFee))

// All Playlist Payment Data
router.get('/e-content/payment/day', isLoggedIn, catchAsync(All.getAllPlaylistPayment))

// All Playlist Data
router.get('/playlist/list/data', isLoggedIn, catchAsync(All.getAllPlaylist))

// All Payment Find By User
router.get('/payment/user/:id', isLoggedIn, catchAsync(All.getAllPaymentUser))

// All Playlist Payment Find By User
router.get('/e-content/payment/user/:id', isLoggedIn, catchAsync(All.getAllPlaylistPaymentUser))

// All Fees Data
router.get('/fee/list/payment', isLoggedIn, catchAsync(All.getAllFee))

// All Checklist Data
router.get('/checklist/list/payment', isLoggedIn, catchAsync(All.getAllChecklist))

// All Institute Data
router.get('/institute/list/data', isLoggedIn, catchAsync(All.getAllInstitute))

// All Batch Data
router.get('/batch/list/data', isLoggedIn, catchAsync(All.getAllBatch))

// All IdCard Payment
router.get('/id-card/payment/day', isLoggedIn, catchAsync(All.getAllIdCardPayment))

// All Video Data
router.get('/video/list/data', isLoggedIn, catchAsync(All.getAllVideo))

// All Application Payment Find By User
router.get('/application/payment/user/:id', isLoggedIn, catchAsync(All.getAllApplyPaymentUser))

// Update Device Token At User Id
router.post('/todevice/token', catchAsync(All.fetchDeviceToken))


module.exports = router