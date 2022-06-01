const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../../middleware')
const catchAsync = require('../../Utilities/catchAsync')
const newCode = require('../../controllers/NewApi/newController')

// Search Ins Api
router.get("/searchIns", isLoggedIn, catchAsync(newCode.searchIns));

// Search User Api
router.get("/searchUser", isLoggedIn, catchAsync(newCode.searchUser));

// Get User Api
router.get("/getUser/:id", isLoggedIn, catchAsync(newCode.getUser));

// Get User Post Api
router.get("/getUserPost/:uid", isLoggedIn, catchAsync(newCode.getUserPost));

// All Institute Dashboard Post With Infinite Scrolling
router.get("/getInstitutePostInLimit/:id/:page/:limit", isLoggedIn, catchAsync(newCode.getInstitutePostInLimit));
  
// All Staff List With Infinite Scrolling
router.get("/getAllInsStaffInLimit/:id/:page/:limit", isLoggedIn, catchAsync(newCode.getAllInsStaffInLimit));

// All Student List With Infinite Scrolling
router.get("/getAllInsStudentInLimit/:id/:page/:limit", isLoggedIn, catchAsync(newCode.getAllInsStudentInLimit));
 
// All Saved Post of Institute With Infinite Scrolling
router.get("/getInstituteSavePostInLimit/:id/:page/:limit", isLoggedIn, catchAsync(newCode.getInstituteSavePostInLimit));
  
// All Institute Profile Post With Infinite Scrolling
router.get("/getInstituteSelfPostInLimit/:id/:page/:limit", isLoggedIn, catchAsync(newCode.getInstituteSelfPostInLimit));
  
// All User Profile Post With Infinite Scrolling
router.get("/getUserSelfPostInLimit/:id/:page/:limit", isLoggedIn, catchAsync(newCode.getUserSelfPostInLimit));

// All Saved Post of User With Infinite Scrolling
router.get("/getUserSavePostInLimit/:id/:page/:limit", isLoggedIn, catchAsync(newCode.getUserSavePostInLimit));
  
// All User Dashboard Post With Infinite Scrolling
router.get("/getUserPostDashboard/:id/:page/:limit", isLoggedIn, catchAsync(newCode.getUserPostDashboard));
  

module.exports = router