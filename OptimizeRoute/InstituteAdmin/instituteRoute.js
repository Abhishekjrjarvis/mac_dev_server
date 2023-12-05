const express = require("express");
const router = express.Router();
const Institute = require("../../OptimizeController/InstituteAdmin/InstituteController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/:uid/staffform/:id",
  //
  catchAsync(Institute.fillStaffForm)
);

router.post(
  "/:uid/studentform/:id",
  //
  catchAsync(Institute.fillStudentForm)
);

router.get("/:id/dash", catchAsync(Institute.getDashOneQuery));

router.get(
  "/:id/profile",

  catchAsync(Institute.getProfileOneQuery)
);

router.get(
  "/:id/setting/personal",

  catchAsync(Institute.getSettingPersonal)
);

router.get(
  "/:id/switch/account",

  catchAsync(Institute.getSwitchAccounts)
);

router.get("/:id/credit/q-coins", catchAsync(Institute.getCQCoins));

router.get(
  "/:id/announcemnt",

  catchAsync(Institute.getAnnouncementArray)
);

router.get(
  "/dashboard/:id/notify",

  catchAsync(Institute.getNotificationIns)
);

router.get(
  "/:id/activity/total/notify",

  catchAsync(Institute.getAllTotalCount)
);

router.patch(
  "/:id/mark/viewed",

  catchAsync(Institute.retrieveMarkAllView)
);

router.post(
  "/read/notify/:rid",

  catchAsync(Institute.getNotifyReadIns)
);

router.delete(
  "/:id/notify/:nid/delete",

  catchAsync(Institute.getDeleteNotifyIns)
);

router.post(
  "/:id/notify/:nid/hide",

  catchAsync(Institute.getHideNotifyIns)
);

router.post(
  "/phone/info/:id",

  catchAsync(Institute.getUpdatePhone)
);

router.patch(
  "/personal/info/:id",

  catchAsync(Institute.getUpdatePersonalIns)
);

router.post(
  "/announcement/:id",

  isApproved,
  upload.array("file"),
  catchAsync(Institute.getUpdateAnnouncement)
);

router.post(
  "/announcement/:id/apk/query",
  upload.fields([
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
    { name: "file4" },
    { name: "file5" },
    { name: "file6" },
    { name: "file7" },
    { name: "file8" },
    { name: "file9" },
    { name: "file10" },
  ]),
  catchAsync(Institute.getUpdateAnnouncementApk)
);

router.get(
  "-announcement-detail/:id",

  catchAsync(Institute.getAnnouncement)
);

router.patch("/follow", isLoggedIn, catchAsync(Institute.updateFollowIns));

router.patch("/unfollow", isLoggedIn, catchAsync(Institute.removeFollowIns));

router.post(
  "/:id/staff/approve/:sid/user/:uid",

  catchAsync(Institute.updateApproveStaff)
);

router.post(
  "/:id/staff/reject/:sid/user/:uid",

  catchAsync(Institute.updateRejectStaff)
);

router.post(
  "/:id/new-department",

  isApproved,
  catchAsync(Institute.getNewDepartment)
);

router.post(
  "/:id/staff/code",

  isApproved,
  catchAsync(Institute.getNewStaffJoinCodeIns)
);

router.post(
  "/:id/add/ins/:iid",

  isApproved,
  catchAsync(Institute.AddAccountByIns)
);

router.post(
  "/:id/add/user/:iid",

  isApproved,
  catchAsync(Institute.AddAccountByUser)
);

router.post(
  "/:id/ins-post/:uid/report",

  catchAsync(Institute.reportPostByUser)
);

router.post(
  "/:id/id-card/:bid/send/print",

  catchAsync(Institute.sendForPrintID)
);

router.post(
  "/:id/id-card/:bid/un-send/print",

  catchAsync(Institute.unSendForPrintID)
);

router.post(
  "/:id/id-card/:bid/done",

  catchAsync(Institute.printedBySuperAdmin)
);

router.get(
  "/:id/pending-staff/list",

  catchAsync(Institute.retrievePendingStaffList)
);

router.get(
  "/:id/approve-staff/list",

  catchAsync(Institute.retrieveApproveStaffList)
);

router.get(
  "/:id/approve-student/list",

  catchAsync(Institute.retrieveApproveStudentList)
);

router.patch(
  "/:id/approve-student/list/filter/query",

  catchAsync(Institute.retrieveApproveStudentListFilterQuery)
);

router.patch(
  "/:id/approve-student/finance/list/filter/query",
  catchAsync(Institute.retrieveFinanceApproveStudentListFilterQuery)
);

router.patch(
  "/:id/approve-student/admission/list/filter/query",
  catchAsync(Institute.retrieveAdmissionApproveStudentListFilterQuery)
);

router.patch(
  "/:id/approve-student/section/list/filter/query/:fid",
  catchAsync(Institute.retrieveApproveStudentSectionListFilterQuery)
);

router.patch(
  "/:id/approve-student/certificate/list/filter/query/:fid",
  catchAsync(Institute.retrieveCertificateApproveStudentListFilterQuery)
);

router.patch(
  "/:id/approve-student/id/card/list/filter/query/:fid",
  catchAsync(Institute.retrieveIDCardApproveStudentListFilterQuery)
);

router.get(
  "/:id/unapprove-student/list/query",
  catchAsync(Institute.retrieveUnApproveStudentListQuery)
);

router.get("/staff/:id", catchAsync(Institute.getFullStaffInfo));

router.get(
  "/student/:id",

  catchAsync(Institute.getFullStudentInfo)
);

router.get(
  "/:id/department",
  //
  catchAsync(Institute.retrieveDepartmentList)
);

router.get(
  "/department-detail/:did",

  catchAsync(Institute.getOneDepartment)
);

router.get(
  "/:id/batchdetail/:bid",

  catchAsync(Institute.retrieveCurrentBatchData)
);

router.get(
  "/:id/departmentmasterclass-detail/:did",

  catchAsync(Institute.retrieveClassMaster)
);

router.post(
  "/:id/department/:did/batch/:bid",

  catchAsync(Institute.retrieveNewClass)
);

router.post(
  "/:id/department/:did/batch/:bid/class/:cid/subject",

  catchAsync(Institute.retrieveNewSubject)
);

router.get(
  "/:id/departmentmastersubject/:did",

  catchAsync(Institute.retrieveSubjectMaster)
);

router.get(
  "/batch/class/:bid",

  catchAsync(Institute.retrieveClassArray)
);

router.get(
  "/class/:cid",

  catchAsync(Institute.retrieveClassProfileSubject)
);

router.get(
  "/class/subject/:cid",

  catchAsync(Institute.retrieveClassSubject)
);

router.get(
  "/staffdepartment/:did",

  catchAsync(Institute.fetchOneStaffDepartmentInfo)
);

router.post(
  "/staff/department-info/:did",

  catchAsync(Institute.updateOneStaffDepartmentInfo)
);

router.post(
  "/staff/class-info/:cid",

  catchAsync(Institute.updateOneStaffClassInfo)
);

router.get(
  "/batch-detail/:bid",

  catchAsync(Institute.allStaffDepartmentClassList)
);

router.post(
  "/addbatch/:did/ins/:id",

  catchAsync(Institute.retrieveNewBatch)
);

router.post(
  "/:id/departmentmasterclass/:did",

  catchAsync(Institute.retrieveNewClassMaster)
);

router.post(
  "/:id/departmentmastersubject/:did/",

  catchAsync(Institute.retrieveNewSubjectMaster)
);

router.get("/staffclass/:cid", catchAsync(Institute.retrieveClass));

router.get(
  "/staffclass/:cid/fee/:fid/query",

  catchAsync(Institute.retrieveClassRequestArray)
);

router.post(
  "/:did/batch-select/:bid",

  catchAsync(Institute.retrieveCurrentSelectBatch)
);

router.get(
  "/subject-detail/:suid",

  catchAsync(Institute.retrieveSubject)
);

router.get(
  "/:id/staff-code",

  catchAsync(Institute.retrieveStaffCode)
);

router.get(
  "/:id/student-code",

  catchAsync(Institute.retrieveStudentCode)
);

router.post(
  "/reply-announcement/:aid",

  catchAsync(Institute.replyAnnouncement)
);

router.get(
  "/:sid/staff-status",

  catchAsync(Institute.retrieveStaffProfileStatus)
);

router.get(
  "/:sid/student-status",

  catchAsync(Institute.retrieveStudentProfileStatus)
);

router.get(
  "/:id/display/person-array",

  catchAsync(Institute.retrieveDisplayPersonArray)
);

router.post(
  "/:id/display-person",

  catchAsync(Institute.updateDisplayPersonArray)
);

router.patch(
  "/:did/display-person/update",

  catchAsync(Institute.updateDisplayPersonIns)
);

router.delete(
  "/:id/display-person/:did/delete/:uid",

  catchAsync(Institute.deleteDisplayPersonArray)
);

router.post(
  "/:aid/star-announcement",

  catchAsync(Institute.retrieveStarAnnouncementArray)
);

router.get(
  "/:id/all/star-announcement",

  catchAsync(Institute.retrieveAllStarArray)
);

router.post(
  "/:id/recovery-mail",

  catchAsync(Institute.retrieveRecoveryMailIns)
);

router.get(
  "/:id/followers-array",
  isLoggedIn,
  catchAsync(Institute.retrieveInsFollowersArray)
);

router.get(
  "/:id/following-array",
  isLoggedIn,
  catchAsync(Institute.retrieveInsFollowingArray)
);

router.get(
  "/:did/one-batch",

  catchAsync(Institute.retrieveDepartmentAllBatch)
);

router.post(
  "/:id/student/:cid/approve/:sid/depart/:did/batch/:bid",

  catchAsync(Institute.retrieveApproveStudentRequest)
);

router.post(
  "/:id/student/:cid/reject/:sid",

  catchAsync(Institute.retrieveRejectStudentRequest)
);

router.get(
  "/:cid/student/request",

  catchAsync(Institute.retrievePendingRequestArray)
);

router.get(
  "/:cid/student/catalog",

  catchAsync(Institute.retrieveApproveCatalogArray)
);

router.get(
  "/:cid/student/un/approve/catalog",
  catchAsync(Institute.retrieveUnApproveCatalogArray)
);

router.get(
  "/department/:did/staff-array",

  catchAsync(Institute.retrieveDepartmentStaffArray)
);

router.get(
  "/:id/all-two-array",

  catchAsync(Institute.retrieveInstituteTwoArray)
);

router.get(
  "/one/announcement/:aid",

  catchAsync(Institute.retrieveOneAnnouncement)
);

router.post(
  "/:did/department/display-person",

  catchAsync(Institute.updateDepartmentDisplayPersonArray)
);

router.post(
  "/:cid/class/display-person",

  catchAsync(Institute.updateClassDisplayPersonArray)
);

router.patch(
  "/:id/leaving/editable",

  catchAsync(Institute.updateLeavingCertificateQuery)
);

router.get(
  "/:id/following-idlist",
  isLoggedIn,
  catchAsync(Institute.retrieveInsFollowingArrayWithId)
);

router.get(
  "/:id/followers-idlist",
  isLoggedIn,
  catchAsync(Institute.retrieveInsFollowersArrayWithId)
);
router.get(
  "/profile/:username",

  catchAsync(Institute.getProfileOneQueryUsername)
);

router.patch(
  "/:id/location/permission",

  catchAsync(Institute.retrieveLocationPermission)
);

router.post(
  "/:id/deactivate/account",

  catchAsync(Institute.deactivateInstituteAccount)
);

router.get(
  "/:did/staff/merge/student",

  catchAsync(Institute.retrieveMergeStaffStudent)
);

router.get(
  "/:id/certificate/editable/detail",

  catchAsync(Institute.retrieveCertificateEditableDetailQuery)
);

router.patch(
  "/:id/certificate/editable",

  catchAsync(Institute.retrieveCertificateEditableQuery)
);
router.get(
  "/:id/student/form",
  //
  catchAsync(Institute.getStudentFormQuery)
);
router.get(
  "/:id/staff/form",
  //
  catchAsync(Institute.getStaffFormQuery)
);
router.patch(
  "/:id/form/setting/update",

  catchAsync(Institute.settingFormUpdate)
);

router.patch(
  "/unblock/institute",

  catchAsync(Institute.updateInstituteUnBlock)
);

router.patch(
  "/report/block/institute",

  catchAsync(Institute.retrieveInstituteReportBlock)
);

router.get("/:id/stats", catchAsync(Institute.renderStats));

router.post(
  "/:cid/approve/student/query",
  catchAsync(Institute.retrieveUnApproveStudentRequestQuery)
);

router.get(
  "/:sid/one/subject/query",
  catchAsync(Institute.retrieveOneSubjectQuery)
);

router.patch(
  "/:sid/one/subject/edit/query",
  catchAsync(Institute.retrieveOneSubjectEditQuery)
);

router.patch(
  "/:id/select/merchant/query",
  catchAsync(Institute.renderSelectMerchantQuery)
);

router.patch(
  "/classmaster/edit/:cmid/query",
  catchAsync(Institute.renderEditClassMasterQuery)
);

router.patch(
  "/subjectmaster/edit/:smid/query",
  catchAsync(Institute.renderEditSubjectMasterQuery)
);

router.patch("/master/query", catchAsync(Institute.renderExistMasterQuery));

module.exports = router;
