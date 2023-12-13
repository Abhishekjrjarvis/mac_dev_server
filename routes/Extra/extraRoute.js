const express = require("express");
const router = express.Router();
const Extra = require("../../controllers/Extra/extraController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
  "/export/staff/card/:did",
  // isLoggedIn,
  catchAsync(Extra.fetchExportStaffIdCardQuery)
);

router.post(
  "/export/student/card",
  // isLoggedIn,
  catchAsync(Extra.fetchExportStudentIdCardQuery)
);

router.post(
  "/export/one/student/card/query",
  catchAsync(Extra.fetchExportOneStudentIdCardQuery)
);

router.patch(
  "/export/student/all/:id",
  // isLoggedIn,
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
  "/export/student/remain/fee/:fid",
  isLoggedIn,
  catchAsync(Extra.fetchExportStudentRemainFeeQuery)
);

router.get(
  "/export/student/remain/fee/admission/:aid",
  // isLoggedIn,
  catchAsync(Extra.fetchExportAdmissionStudentRemainFeeQuery)
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

router.patch(
  "/:id/original/copy/query",
  // isLoggedIn,
  catchAsync(Extra.renderCertificateOriginalCopyQuery)
);

router.patch(
  "/excel/to/json/query/:cid",
  // isLoggedIn,
  catchAsync(Extra.renderExcelToJSONQuery)
);

router.patch(
  "/excel/to/json/query/fee/category/:fid",
  // isLoggedIn,
  catchAsync(Extra.renderExcelToJSONFinanceQuery)
);

router.patch(
  "/excel/to/json/query/fee/head/master/:fid",
  // isLoggedIn,
  catchAsync(Extra.renderExcelToJSONFinanceHeadMasterQuery)
);

router.patch(
  "/excel/to/json/:did/query/fee/structure/:fid",
  // isLoggedIn,
  catchAsync(Extra.renderExcelToJSONFinanceStructureQuery)
);

router.patch(
  "/excel/to/json/:id/staff/query",
  // isLoggedIn,
  catchAsync(Extra.renderExcelToJSONStaffQuery)
);

router.patch(
  "/excel/to/json/:hid/hostelities/query",
  catchAsync(Extra.renderExcelToJSONHostelitiesQuery)
);

router.patch(
  "/excel/to/json/:aid/query/scholarship",
  // isLoggedIn,
  catchAsync(Extra.renderExcelToJSONAdmissionScholarshipQuery)
);

router.patch(
  "/excel/to/json/:id/query/scholarship/gr/batch",
  // isLoggedIn,
  catchAsync(Extra.renderExcelToJSONScholarshipGRBatchQuery)
);

router.patch(
  "/excel/to/json/:lid/add/book/query",
  // isLoggedIn,
  catchAsync(Extra.renderExcelToJSONLibraryBookQuery)
);

router.patch(
  "/:sid/existing/user/phone/query",
  catchAsync(Extra.renderChangeExistingUserPhoneQuery)
);

router.patch(
  "/excel/to/json/email/replace/query",
  // isLoggedIn,
  catchAsync(Extra.renderExcelToJSONEmailReplaceQuery)
);

router.patch(
  "/access/fees/editable/query",
  catchAsync(Extra.renderAllStudentAccessFeesEditableQuery)
);

router.patch(
  "/excel/to/json/:id/un/approved/student/query",
  catchAsync(Extra.renderExcelToJSONUnApprovedStudentQuery)
);

router.patch(
  "/application/print/cdn/:sid/query",
  upload.single("file"),
  catchAsync(Extra.renderApplicationCDNQuery)
);

router.patch(
  "/:sid/active/designation/role/query",
  catchAsync(Extra.renderActiveDesignationRoleQuery)
);

router.patch(
  "/excel/to/json/query/:sid/chapter/query",
  catchAsync(Extra.renderExcelToJSONSubjectChapterQuery)
);

router.patch("/update/profile/:id", catchAsync(Extra.renderProfile));

router.get(
  "/all/classmates/:sid/query",
  catchAsync(Extra.renderAllClassMatesQuery)
);

router.patch(
  "/send/filtered/message/query",
  catchAsync(Extra.renderFilteredMessageQuery)
);

router.get(
  "/all/filtered/message/:sid/query",
  catchAsync(Extra.renderAllFilteredMessageQuery)
);

router.patch(
  "/send/birthday/content/query",
  catchAsync(Extra.renderBirthdaySurpriseQuery)
);

router.patch(
  "/edit/:sid/gr/unique/query",
  catchAsync(Extra.renderOneStudentGRNumberQuery)
);

router.patch("/status/:qid/query", catchAsync(Extra.renderOneQueryStatus));

router.get("/all/:id/query", catchAsync(Extra.renderAllInternalQuery));

router.patch(
  "/profile/upload/query",
  upload.single("file"),
  catchAsync(Extra.renderProfileUploadQuery)
);

router.get(
  "/:id/student/section/form/query",
  catchAsync(Extra.renderStudentSectionFormShowQuery)
);

router.patch(
  "/:id/student/section/form/query",
  catchAsync(Extra.renderStudentSectionFormShowEditQuery)
);

router.patch(
  "/:id/name/case/query",
  catchAsync(Extra.renderStudentNameCaseQuery)
);

router.patch(
  "/excel/to/json/:aid/fees/query",
  catchAsync(Extra.renderExcelToJSONExistFeesQuery)
);

router.patch("/:id/zip/file/query", catchAsync(Extra.renderZipFileQuery));

router.post(
  "/designation/check/:id/staff/:sid/query",
  catchAsync(Extra.renderDesignationCheckQuery)
);

router.get(
  "/designation/check/:id/all/query",
  catchAsync(Extra.renderDesignationAllQuery)
);

router.patch(
  "/excel/to/json/:id/add/department/query",
  catchAsync(Extra.renderExcelToJSONDepartmentQuery)
);

router.patch(
  "/excel/to/json/:did/add/class/master/query",
  catchAsync(Extra.renderExcelToJSONClassMasterQuery)
);

router.patch(
  "/excel/to/json/:did/add/subject/master/query",
  catchAsync(Extra.renderExcelToJSONSubjectMasterQuery)
);

router.patch(
  "/excel/to/json/:did/add/class/query",
  catchAsync(Extra.renderExcelToJSONClassQuery)
);

router.patch(
  "/excel/to/json/:cid/add/subject/query",
  catchAsync(Extra.renderExcelToJSONSubjectQuery)
);

router.patch(
  "/send/one/student/filtered/message/query",
  catchAsync(Extra.renderOneStudentFilteredMessageQuery)
);

router.get(
  "/:sid/three/designation/query",
  catchAsync(Extra.renderThreeDesignationQuery)
);

router.patch(
  "/excel/to/json/:cid/attendence/query",
  catchAsync(Extra.renderExcelToJSONAttendenceQuery)
);

router.post(
  "/add/:sid/certificate/query",
  catchAsync(Extra.renderAddCertificateQuery)
);

router.get(
  "/all/:sid/certificate/query",
  catchAsync(Extra.renderStudentAllCertificateQuery)
);

router.get(
  "/all/:id/certificate/query/status",
  catchAsync(Extra.renderStudentAllCertificateQueryStatus)
);

router.patch(
  "/mark/:cid/certificate/query",
  catchAsync(Extra.renderMarkCertificateQueryStatus)
);

router.patch(
  "/update/:id/certificate/fund/query",
  catchAsync(Extra.renderUpdateCertificateFundQuery)
);

router.get(
  "/student/section/:id/all/export/excel/array",
  catchAsync(Extra.renderAllExportExcelArrayQuery)
);

router.patch(
  "/student/section/:id/export/excel/:exid/edit",
  catchAsync(Extra.renderEditOneExcel)
);

router.delete(
  "/student/section/:id/export/excel/:exid/destroy/query",
  catchAsync(Extra.renderDeleteOneExcel)
);

router.patch(
  "/shuffled/query",
  catchAsync(Extra.renderShuffledStudentQuery)
);

router.get(
  "/all/filtered/alarm/:id/query",
  catchAsync(Extra.renderAllFilteredAlarmQuery)
);

module.exports = router;
