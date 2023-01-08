const express = require("express");
const router = express.Router();
const Extra = require("../../controllers/Extra/extraController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router.patch("/age/:uid", isLoggedIn, catchAsync(Extra.validateUserAge));

router.get("/age/:uid/get", isLoggedIn, catchAsync(Extra.retrieveAgeRestrict));

router.get(
  "/random/query",
  isLoggedIn,
  catchAsync(Extra.retrieveRandomInstituteQuery)
);

router.get(
  "/:uid/referral",
  isLoggedIn,
  catchAsync(Extra.retrieveReferralQuery)
);

router.post(
  "/feedback/user",
  isLoggedIn,
  catchAsync(Extra.retrieveFeedBackUser)
);

router.post(
  "/bonafide/certificate/:gr/ins/:id",
  isLoggedIn,
  catchAsync(Extra.retrieveBonafideGRNO)
);

router.post(
  "/leaving/certificate/:gr/ins/:id",
  // isLoggedIn,
  catchAsync(Extra.retrieveLeavingGRNO)
);

router.get(
  "/:gr/status/:type",
  isLoggedIn,
  catchAsync(Extra.retrieveCertificateStatus)
);

router.patch(
  "/:uid/privacy/feature",
  isLoggedIn,
  catchAsync(Extra.retrieveUserBirthPrivacy)
);

router.patch(
  "/:id/privacy/institute/feature",
  isLoggedIn,
  catchAsync(Extra.retrieveInstituteBirthPrivacy)
);

router.patch(
  "/:uid/update/notification/user",
  isLoggedIn,
  catchAsync(Extra.retrieveUserUpdateNotification)
);

router.patch(
  "/:pid/comment/feature",
  isLoggedIn,
  catchAsync(Extra.retrieveCommentFeatureQuery)
);

// router.patch('/:uid/update/notification/ins',isLoggedIn, catchAsync(Extra.retrieveUserUpdateNotification))

router.get(
  "/:id/merge/staff/student",
  isLoggedIn,
  catchAsync(Extra.retrieveMergeStaffStudent)
);

router.patch(
  "/:pid/transcript/lang",
  isLoggedIn,
  catchAsync(Extra.fetchLangTranscriptPost)
);

router.patch(
  "/:uid/lang/mode",
  isLoggedIn,
  catchAsync(Extra.retrieveLangModeQuery)
);

router.patch(
  "/:aid/transcript/lang/answer",
  isLoggedIn,
  catchAsync(Extra.fetchLangTranscriptAnswer)
);

router.patch(
  "/:pid/transcript/lang/poll",
  isLoggedIn,
  catchAsync(Extra.fetchLangTranscriptPoll)
);

router.patch(
  "/biometric/staff/ref",
  isLoggedIn,
  catchAsync(Extra.fetchBiometricStaffQuery)
);

router.patch(
  "/biometric/student/ref",
  isLoggedIn,
  catchAsync(Extra.fetchBiometricStudentQuery)
);

router.get(
  "/export/staff/card",
  isLoggedIn,
  catchAsync(Extra.fetchExportStaffIdCardQuery)
);

router.get(
  "/export/student/card",
  isLoggedIn,
  catchAsync(Extra.fetchExportStudentIdCardQuery)
);

router.get(
  "/export/student/all",
  isLoggedIn,
  catchAsync(Extra.fetchExportStudentAllQuery)
);

router.patch(
  "/export/staff/:id/card/format",
  isLoggedIn,
  catchAsync(Extra.fetchExportStaffIdCardFormat)
);

router.patch(
  "/export/student/:id/card/format",
  isLoggedIn,
  catchAsync(Extra.fetchExportStudentIdCardFormat)
);

router.get(
  "/export/student/remain/fee",
  isLoggedIn,
  catchAsync(Extra.fetchExportStudentRemainFeeQuery)
);

router.patch(
  "/export/student/:fid/remain/fee/format",
  isLoggedIn,
  catchAsync(Extra.fetchExportStudentRemainFeeFormat)
);

router.post(
  "/:to/report/enduser/account/:by",
  isLoggedIn,
  catchAsync(Extra.reportAccountByEndUser)
);

router.get(
  "/:uid/recent/chat/count",
  isLoggedIn,
  catchAsync(Extra.retrieveRecentChatCount)
);

router.get(
  "/:uid/active/member/role",
  // isLoggedIn,
  catchAsync(Extra.retrieveActiveMemberRole)
);

module.exports = router;
