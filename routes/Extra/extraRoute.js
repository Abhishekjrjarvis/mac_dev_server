const express = require('express')
const router = express.Router()
const Extra = require('../../controllers/Extra/extraController')
const catchAsync = require('../../Utilities/catchAsync')

router.patch('/age/:uid', catchAsync(Extra.validateUserAge))

router.get('/age/:uid/get', catchAsync(Extra.retrieveAgeRestrict))

router.get('/random/query', catchAsync(Extra.retrieveRandomInstituteQuery))

router.get('/:uid/referral', catchAsync(Extra.retrieveReferralQuery))

router.post('/feedback/user', catchAsync(Extra.retrieveFeedBackUser))

router.post('/bonafide/certificate/:gr/ins/:id', catchAsync(Extra.retrieveBonafideGRNO))

router.post('/leaving/certificate/:gr/ins/:id', catchAsync(Extra.retrieveLeavingGRNO))

router.get('/:gr/status/:type', catchAsync(Extra.retrieveCertificateStatus))

router.patch('/:uid/privacy/feature', catchAsync(Extra.retrieveUserBirthPrivacy))

router.patch('/:id/privacy/institute/feature', catchAsync(Extra.retrieveInstituteBirthPrivacy))

router.patch('/:uid/update/notification/user', catchAsync(Extra.retrieveUserUpdateNotification))

router.patch('/:pid/comment/feature', catchAsync(Extra.retrieveCommentFeatureQuery))

// router.patch('/:uid/update/notification/ins', catchAsync(Extra.retrieveUserUpdateNotification))

router.get('/:id/merge/staff/student', catchAsync(Extra.retrieveMergeStaffStudent))

router.patch('/:pid/transcript/lang', catchAsync(Extra.fetchLangTranscriptPost))

router.patch('/:uid/lang/mode', catchAsync(Extra.retrieveLangModeQuery))

module.exports = router