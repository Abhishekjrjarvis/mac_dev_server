const express = require('express')
const router = express.Router()
const Admission = require('../../controllers/Admission/admissionController')
const catchAsync = require('../../Utilities/catchAsync')
const { isLoggedIn, isApproved } = require('../../middleware')
const multer = require('multer')
const upload = multer({ dest: "uploads/" });

//Assign
router.post('/ins/:id/staff/:sid', isLoggedIn, isApproved, catchAsync(Admission.retrieveAdmissionAdminHead))

// All Detail
router.get('/:aid/dashboard/query', catchAsync(Admission.retrieveAdmissionDetailInfo))

// Ongoing App
router.get('/:aid/all/ongoing/application', catchAsync(Admission.retieveAdmissionAdminAllApplication))

// Completed App
router.get('/:aid/all/completed/application', catchAsync(Admission.retieveAdmissionAdminAllCApplication))

// One App Query
router.get('/:aid/application/query', catchAsync(Admission.retrieveOneApplicationQuery))

// Admission Info
router.patch('/:aid/info/update', catchAsync(Admission.fetchAdmissionQuery))

// Create New App
router.post('/:aid/new/application', catchAsync(Admission.retrieveAdmissionNewApplication))

// At Institute Search All New App
router.get('/:id/application/list/array', catchAsync(Admission.fetchAdmissionApplicationArray))

// Apply By Student at New App
router.post('/:uid/user/:aid/apply', upload.array('file'), catchAsync(Admission.retrieveAdmissionReceievedApplication))

router.post('/:sid/student/:aid/select', catchAsync(Admission.retrieveAdmissionSelectedApplication))

router.post('/:sid/student/:aid/pay/offline/confirm', catchAsync(Admission.payOfflineAdmissionFee))

router.post('/:sid/student/:aid/pay/refund', catchAsync(Admission.cancelAdmissionApplication))

router.get('/:aid/application/class', catchAsync(Admission.retrieveAdmissionApplicationClass))

router.post('/:sid/student/:aid/allot/class/:cid', catchAsync(Admission.retrieveClassAllotQuery))

router.patch('/:aid/application/complete', catchAsync(Admission.completeAdmissionApplication))

router.get('/application', catchAsync(Admission.retrieveAdmissionApplicationStatus))

router.post('/:aid/student/:uid/inquiry', catchAsync(Admission.retrieveUserInquiryProcess))

router.get('/:aid/student/inquiry/array', catchAsync(Admission.retrieveUserInquiryArray))

router.patch('/inquiry/reply/:qid', catchAsync(Admission.retrieveInquiryReplyQuery))

// router.post('/:aid/featured/admission/post', catchAsync(Admission.retrieveFeaturedPostAdmission))

module.exports = router