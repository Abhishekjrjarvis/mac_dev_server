const express = require("express");
const router = express.Router();
const Institute = require("../../controllers/InstituteAdmin/InstituteController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/:uid/staffform/:id",
  isLoggedIn,
  upload.array("file"),
  catchAsync(Institute.fillStaffForm)
);

router.post(
  "/:uid/studentform/:id",
  isLoggedIn,
  upload.array("file"),
  catchAsync(Institute.fillStudentForm)
);

router.get("/:id/dash", isLoggedIn, catchAsync(Institute.getDashOneQuery));

router.get(
  "/:id/profile",
  isLoggedIn,
  catchAsync(Institute.getProfileOneQuery)
);

router.get(
  "/:id/setting/personal",
  isLoggedIn,
  catchAsync(Institute.getSettingPersonal)
);

router.get(
  "/:id/switch/account",
  isLoggedIn,
  catchAsync(Institute.getSwitchAccounts)
);

router.get("/:id/credit/q-coins", isLoggedIn, catchAsync(Institute.getCQCoins));

router.get(
  "/:id/announcemnt",
  isLoggedIn,
  catchAsync(Institute.getAnnouncementArray)
);

router.get(
  "/dashboard/:id/notify",
  isLoggedIn,
  catchAsync(Institute.getNotificationIns)
);

router.post(
  "/read/notify/:rid",
  isLoggedIn,
  catchAsync(Institute.getNotifyReadIns)
);

router.delete(
  "/:id/notify/:nid/delete",
  isLoggedIn,
  catchAsync(Institute.getDeleteNotifyIns)
);

router.post(
  "/:id/notify/:nid/hide",
  isLoggedIn,
  catchAsync(Institute.getHideNotifyIns)
);

router.post(
  "/phone/info/:id",
  isLoggedIn,
  catchAsync(Institute.getUpdatePhone)
);

router.patch(
  "/personal/info/:id",
  isLoggedIn,
  catchAsync(Institute.getUpdatePersonalIns)
);

router.post(
  "/announcement/:id",
  isLoggedIn,
  isApproved,
  upload.array("file"),
  catchAsync(Institute.getUpdateAnnouncement)
);

router.get(
  "-announcement-detail/:id",
  isLoggedIn,
  catchAsync(Institute.getAnnouncement)
);

router.patch("/follow", isLoggedIn, catchAsync(Institute.updateFollowIns));

router.patch("/unfollow", isLoggedIn, catchAsync(Institute.removeFollowIns));

router.post(
  "/:id/staff/approve/:sid/user/:uid",
  isLoggedIn,
  catchAsync(Institute.updateApproveStaff)
);

router.post(
  "/:id/staff/reject/:sid/user/:uid",
  isLoggedIn,
  catchAsync(Institute.updateRejectStaff)
);

router.post(
  "/:id/new-department",
  isLoggedIn,
  isApproved,
  catchAsync(Institute.getNewDepartment)
);

router.post(
  "/:id/staff/code",
  isLoggedIn,
  isApproved,
  catchAsync(Institute.getNewStaffJoinCodeIns)
);

router.post(
  "/:id/add/ins/:iid",
  isLoggedIn,
  isApproved,
  catchAsync(Institute.AddAccountByIns)
);

router.post(
  "/:id/add/user/:iid",
  isLoggedIn,
  isApproved,
  catchAsync(Institute.AddAccountByUser)
);

router.post(
  "/:id/ins-post/:uid/report",
  isLoggedIn,
  catchAsync(Institute.reportPostByUser)
);

router.post(
  "/:id/id-card/:bid/send/print",
  isLoggedIn,
  catchAsync(Institute.sendForPrintID)
);

router.post(
  "/:id/id-card/:bid/un-send/print",
  isLoggedIn,
  catchAsync(Institute.unSendForPrintID)
);

router.post(
  "/:id/id-card/:bid/done",
  isLoggedIn,
  catchAsync(Institute.printedBySuperAdmin)
);

router.get(
  "/:id/pending-staff/list",
  isLoggedIn,
  catchAsync(Institute.retrievePendingStaffList)
);

router.get(
  "/:id/approve-staff/list",
  isLoggedIn,
  catchAsync(Institute.retrieveApproveStaffList)
);

router.get(
  "/:id/approve-student/list",
  isLoggedIn,
  catchAsync(Institute.retrieveApproveStudentList)
);

router.get("/staff/:id", isLoggedIn, catchAsync(Institute.getFullStaffInfo));

router.get(
  "/student/:id",
  isLoggedIn,
  catchAsync(Institute.getFullStudentInfo)
);

router.get(
  "/:id/department",
  isLoggedIn,
  catchAsync(Institute.retrieveDepartmentList)
);

router.get(
  "/department-detail/:did",
  isLoggedIn,
  catchAsync(Institute.getOneDepartment)
);

router.get(
  "/:id/batchdetail/:bid",
  isLoggedIn,
  catchAsync(Institute.retrieveCurrentBatchData)
);

router.get(
  "/:id/departmentmasterclass-detail/:did",
  isLoggedIn,
  catchAsync(Institute.retrieveClassMaster)
);

router.post(
  "/:id/department/:did/batch/:bid",
  isLoggedIn,
  catchAsync(Institute.retrieveNewClass)
);

router.post(
  "/:id/department/:did/batch/:bid/class/:cid/subject",
  isLoggedIn,
  catchAsync(Institute.retrieveNewSubject)
);

router.get(
  "/:id/departmentmastersubject/:did",
  isLoggedIn,
  catchAsync(Institute.retrieveSubjectMaster)
);

router.get(
  "/batch/class/:bid",
  isLoggedIn,
  catchAsync(Institute.retrieveClassArray)
);

router.get(
  "/class/:cid",
  isLoggedIn,
  catchAsync(Institute.retrieveClassProfileSubject)
);

router.get(
  "/class/subject/:cid",
  isLoggedIn,
  catchAsync(Institute.retrieveClassSubject)
);

router.get(
  "/staffdepartment/:did",
  isLoggedIn,
  catchAsync(Institute.fetchOneStaffDepartmentInfo)
);

router.post(
  "/staff/department-info/:did",
  isLoggedIn,
  catchAsync(Institute.updateOneStaffDepartmentInfo)
);

router.post(
  "/staff/class-info/:cid",
  isLoggedIn,
  catchAsync(Institute.updateOneStaffClassInfo)
);

router.get(
  "/batch-detail/:bid",
  isLoggedIn,
  catchAsync(Institute.allStaffDepartmentClassList)
);

router.post(
  "/addbatch/:did/ins/:id",
  isLoggedIn,
  catchAsync(Institute.retrieveNewBatch)
);

router.post(
  "/:id/departmentmasterclass/:did",
  isLoggedIn,
  catchAsync(Institute.retrieveNewClassMaster)
);

router.post(
  "/:id/departmentmastersubject/:did/",
  isLoggedIn,
  catchAsync(Institute.retrieveNewSubjectMaster)
);

router.get("/staffclass/:cid", isLoggedIn, catchAsync(Institute.retrieveClass));

router.get(
  "/staffclass/:cid/fee/:fid/query",
  catchAsync(Institute.retrieveClassRequestArray)
);

router.post(
  "/:did/batch-select/:bid",
  isLoggedIn,
  catchAsync(Institute.retrieveCurrentSelectBatch)
);

router.get(
  "/subject-detail/:suid",
  isLoggedIn,
  catchAsync(Institute.retrieveSubject)
);

router.get(
  "/:id/staff-code",
  isLoggedIn,
  catchAsync(Institute.retrieveStaffCode)
);

router.get(
  "/:id/student-code",
  isLoggedIn,
  catchAsync(Institute.retrieveStudentCode)
);

router.post(
  "/reply-announcement/:aid",
  isLoggedIn,
  catchAsync(Institute.replyAnnouncement)
);

router.get(
  "/:sid/staff-status",
  isLoggedIn,
  catchAsync(Institute.retrieveStaffProfileStatus)
);

router.get(
  "/:sid/student-status",
  isLoggedIn,
  catchAsync(Institute.retrieveStudentProfileStatus)
);

router.get(
  "/:id/display/person-array",
  isLoggedIn,
  catchAsync(Institute.retrieveDisplayPersonArray)
);

router.post(
  "/:id/display-person",
  isLoggedIn,
  catchAsync(Institute.updateDisplayPersonArray)
);

router.patch(
  "/:did/display-person/update",
  isLoggedIn,
  catchAsync(Institute.updateDisplayPersonIns)
);

router.delete(
  "/:id/display-person/:did/delete/:uid",
  isLoggedIn,
  catchAsync(Institute.deleteDisplayPersonArray)
);

router.post(
  "/:aid/star-announcement",
  isLoggedIn,
  catchAsync(Institute.retrieveStarAnnouncementArray)
);

router.get(
  "/:id/all/star-announcement",
  isLoggedIn,
  catchAsync(Institute.retrieveAllStarArray)
);

router.post(
  "/:id/recovery-mail",
  isLoggedIn,
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
  isLoggedIn,
  catchAsync(Institute.retrieveDepartmentAllBatch)
);

router.post(
  "/:id/student/:cid/approve/:sid/depart/:did/batch/:bid",
  isLoggedIn,
  catchAsync(Institute.retrieveApproveStudentRequest)
);

router.post(
  "/:id/student/:cid/reject/:sid",
  isLoggedIn,
  catchAsync(Institute.retrieveRejectStudentRequest)
);

router.get(
  "/:cid/student/request",
  isLoggedIn,
  catchAsync(Institute.retrievePendingRequestArray)
);

router.get(
  "/:cid/student/catalog",
  catchAsync(Institute.retrieveApproveCatalogArray)
);

router.get(
  "/department/:did/staff-array",
  isLoggedIn,
  catchAsync(Institute.retrieveDepartmentStaffArray)
);

router.get(
  "/:id/all-two-array",
  isLoggedIn,
  catchAsync(Institute.retrieveInstituteTwoArray)
);

router.get(
  "/one/announcement/:aid",
  isLoggedIn,
  catchAsync(Institute.retrieveOneAnnouncement)
);

router.post(
  "/:did/department/display-person",
  isLoggedIn,
  catchAsync(Institute.updateDepartmentDisplayPersonArray)
);

router.post(
  "/:cid/class/display-person",
  isLoggedIn,
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
  isLoggedIn,
  catchAsync(Institute.getProfileOneQueryUsername)
);

router.patch(
  "/:id/location/permission",
  catchAsync(Institute.retrieveLocationPermission)
);

router.post(
  "/:id/deactivate/account",
  isLoggedIn,
  catchAsync(Institute.deactivateInstituteAccount)
);

router.get('/:did/staff/merge/student', catchAsync(Institute.retrieveMergeStaffStudent))

module.exports = router;
