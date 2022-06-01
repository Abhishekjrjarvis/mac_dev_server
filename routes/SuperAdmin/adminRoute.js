const express = require('express')
const router = express.Router()
const Admin = require('../../controllers/SuperAdmin/AdminController')
const catchAsync = require('../../Utilities/catchAsync')
const { isLoggedIn } = require('../../middleware')


// Get Super Admin Id
router.get('/', catchAsync(Admin.getAdmin))

// Get Super Admin Form
router.get('/new', catchAsync(Admin.getSuperAdmin))

// Post Super Admin Details
router.post('/', catchAsync(Admin.updateSuperAdmin))

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