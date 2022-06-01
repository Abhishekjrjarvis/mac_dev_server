const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../../middleware')
const catchAsync = require('../../Utilities/catchAsync')
const update = require('../../controllers/Update/updateController')


// Get Department Data
router.get("/getDepartment/:did", isLoggedIn, catchAsync(update.getDepartment));

// Update Department
router.patch("/updateDepartment/:did", isLoggedIn, catchAsync(update.updateDepartment));

// Delete Department
router.delete("/delDepartment/:did", isLoggedIn, catchAsync(update.delDepartment));

// Update Class Master
router.patch("/updateClassMaster/:cid", isLoggedIn, catchAsync(update.updateClassMaster));

// Delete Class Master
router.delete("/delClassMaster/:cid", isLoggedIn, catchAsync(update.delClassMaster));

// Update Class
router.patch("/updateClass/:cid", isLoggedIn, catchAsync(update.updateClass));

// Delete Class
router.delete("/delClass/:cid", isLoggedIn, catchAsync(update.delClass));

// Update Subject Master
router.patch("/updateSubjectMaster/:sid", isLoggedIn, catchAsync(update.updateSubjectMaster));

// Delete Subject Master
router.delete("/delSubjectMaster/:sid", isLoggedIn, catchAsync(update.delSubjectMaster));

// Update Subject
router.patch("/updateSubject/:sid", isLoggedIn, catchAsync(update.updateSubject));

// Delete Subject
router.delete("/delSubject/:sid", isLoggedIn, catchAsync(update.delSubject));

// Update Subject Title
router.patch("/updateSubjectTitle/:sid", isLoggedIn, catchAsync(update.updateSubjectTitle));

// Delete Subject Title
router.delete("/delSubjectTitle/:sid", isLoggedIn, catchAsync(update.delSubjectTitle));

// Update Checklist
router.patch("/updateChecklist/:cid", isLoggedIn, catchAsync(update.updateChecklist));

// Delete Checklist
router.delete("/delChecklist/:cid", isLoggedIn, catchAsync(update.delChecklist));

// Update Fees
router.patch("/updateFees/:fid", isLoggedIn, catchAsync(update.updateFees));

// Update Holiday
router.patch("/updateHoliday/:hid", isLoggedIn, catchAsync(update.updateHoliday));

// Delete Holiday
router.delete("/delHoliday/:hid", isLoggedIn, catchAsync(update.delHoliday));

// Update Student Profile
router.patch("/updateStudentProfile/:sid", isLoggedIn, catchAsync(update.updateStudentProfile));

// Update Staff Profile
router.patch("/updateStaffProfile/:sid", isLoggedIn, catchAsync(update.updateStaffProfile));

// Update Batch
router.patch("/updateBatch/:bid", isLoggedIn, catchAsync(update.updateBatch));

// Delete Batch
router.delete("/delBatch/:bid", isLoggedIn, catchAsync(update.delBatch));



module.exports = router