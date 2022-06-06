const express = require("express");
const router = express.Router();
const Institute = require("../../controllers/InstituteAdmin/InstituteController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// All Institute Data
router.get("dashboard", isLoggedIn, catchAsync(Institute.getAllIns));

// for the staff joining form=============
router.post(
  "/:uid/staffform/:id",
  isLoggedIn,
  upload.array("file"),
  catchAsync(Institute.fillStaffForm)
);

// for the staff joining form=============
router.post(
  "/:uid/studentform/:id",
  isLoggedIn,
  upload.array("file"),
  catchAsync(Institute.fillStudentForm)
);

// ========= ADDED TO SWAGGER =======================

// Single Institute Data
router.get("/:id/dash", isLoggedIn, catchAsync(Institute.getDashOneQuery));

// ========= ADDED TO SWAGGER =======================

// Institute Profile Data
router.get(
  "/:id/profile",
  isLoggedIn,
  catchAsync(Institute.getProfileOneQuery)
);

// ========= ADDED TO SWAGGER =======================

// Institute Setting Personal
router.get(
  "/:id/setting/personal",
  isLoggedIn,
  catchAsync(Institute.getSettingPersonal)
);

// ========= ADDED TO SWAGGER =======================

// Institute Setting Account
router.get(
  "/:id/switch/account",
  isLoggedIn,
  catchAsync(Institute.getSwitchAccounts)
);

// ========= ADDED TO SWAGGER =======================

// Institute Setting Credit
router.get("/:id/credit/q-coins", isLoggedIn, catchAsync(Institute.getCQCoins));

// ========= ADDED TO SWAGGER =======================

// Institute Announcement
router.get(
  "/:id/announcemnt",
  isLoggedIn,
  catchAsync(Institute.getAnnouncementArray)
);

// Institute All Post By Pagination
router.get(
  "dashboard/:id/ins-post",
  isLoggedIn,
  catchAsync(Institute.getAllPostIns)
);

// Institute All Notification
router.get(
  "/dashboard/:id/notify",
  isLoggedIn,
  catchAsync(Institute.getNotificationIns)
);

// Notification Read By Institute
router.post(
  "/read/notify/:rid",
  isLoggedIn,
  catchAsync(Institute.getNotifyReadIns)
);

// Notification Deleted By Institute
router.delete(
  "/:id/notify/:nid/delete",
  isLoggedIn,
  catchAsync(Institute.getDeleteNotifyIns)
);

// Notification Hide By Institute
router.post(
  "/:id/notify/:nid/hide",
  isLoggedIn,
  catchAsync(Institute.getHideNotifyIns)
);

// Post Created By Institute
router.post(
  "dashboard/:id/ins-post",
  isLoggedIn,
  isApproved,
  catchAsync(Institute.getCreatePost)
);

// Post Image Uploaded by Institute
router.post(
  "dashboard/:id/ins-post/image",
  isLoggedIn,
  isApproved,
  upload.single("file"),
  catchAsync(Institute.getUploadPostImage)
);

// Retrieve Post Image By AWS
router.get(
  "dashboard/ins-post/images/:key",
  isLoggedIn,
  catchAsync(Institute.getRetreivePostImage)
);

// Post Video Uploaded By Institute
router.post(
  "dashboard/:id/ins-post/video",
  isLoggedIn,
  isApproved,
  upload.single("file"),
  catchAsync(Institute.getUploadVideoIns)
);

// Update Post Visibility By Institute
router.put(
  "dashboard/:id/ins-post/:uid/update",
  isLoggedIn,
  catchAsync(Institute.getUpdateVisibilityPostIns)
);

// Delete Post By Institute
router.delete(
  "dashboard/:id/ins-post/:uid",
  isLoggedIn,
  catchAsync(Institute.getDeletePostIns)
);

// Update Phone By Institute
router.post(
  "/phone/info/:id",
  isLoggedIn,
  catchAsync(Institute.getUpdatePhone)
);

// Update Personal Info By Institute
router.patch(
  "/personal/info/:id",
  isLoggedIn,
  catchAsync(Institute.getUpdatePersonalIns)
);

// Update Display Person By Institute
router.post(
  "profiledisplay/:id",
  isLoggedIn,
  catchAsync(Institute.getUpdateDisplayIns)
);

// Update Profile About By Institute
router.post(
  "profileabout/:id",
  isLoggedIn,
  catchAsync(Institute.getUpdateProfileAboutIns)
);

// Retrieve Profile About By Institute
router.get(
  "profileabout/photo/:key",
  isLoggedIn,
  catchAsync(Institute.getUpdateProfileAboutImageIns)
);

// Upload Profile About Image By Institute
router.post(
  "profileabout/photo/:id",
  isLoggedIn,
  upload.single("file"),
  catchAsync(Institute.getUploadProfileAboutIns)
);

// Add Institute Announcement
router.post(
  "-announcement/:id",
  isLoggedIn,
  isApproved,
  catchAsync(Institute.getUpdateAnnouncement)
);

// Get Announcement Data
router.get(
  "-announcement-detail/:id",
  isLoggedIn,
  catchAsync(Institute.getAnnouncement)
);

// Get Bonafide Certificate
router.post(
  "/:id/student/certificate",
  isLoggedIn,
  catchAsync(Institute.getBonafideCertificate)
);

// Get School Leaving Certificate
router.post(
  "/:id/student/leaving/certificate",
  isLoggedIn,
  catchAsync(Institute.getSchoolLeavingCertificate)
);

// Staff Joining At Institute
router.post(
  "/search/:uid/insdashboard/data/:id",
  isLoggedIn,
  catchAsync(Institute.staffJoiningIns)
);

// Staff Joining Form By User
router.post(
  "/search/insdashboard/:iid/staffdata/:sid",
  isLoggedIn,
  catchAsync(Institute.fillStaffJoinFormIns)
);

// Add Like To Post
router.post("/post/like", isLoggedIn, catchAsync(Institute.updatePostLikeIns));

// Remove Like To Post
router.post(
  "/post/unlike",
  isLoggedIn,
  catchAsync(Institute.removePostLikeIns)
);

// Add Post To Save
router.post("/save/post", isLoggedIn, catchAsync(Institute.updatePostSaveIns));

// Remove Post To Save
router.post(
  "/unsave/post",
  isLoggedIn,
  catchAsync(Institute.removePostSaveIns)
);

// Add Comment To Post
router.post(
  "/post/comments/:id",
  isLoggedIn,
  catchAsync(Institute.updatePostComment)
);

// Follow Institute
router.put("/follow", isLoggedIn, catchAsync(Institute.updateFollowIns));

// Unfollow Institute
router.put("/unfollow", isLoggedIn, catchAsync(Institute.removeFollowIns));

// Staff Approve By Institute
router.post(
  "/:id/staff/approve/:sid/user/:uid",
  isLoggedIn,
  catchAsync(Institute.updateApproveStaff)
);

// Staff Reject By Institute
router.post(
  "/:id/staff/reject/:sid/user/:uid",
  isLoggedIn,
  catchAsync(Institute.updateRejectStaff)
);

// Add Department To Institute
router.post(
  "/:id/new-department",
  isLoggedIn,
  isApproved,
  catchAsync(Institute.getNewDepartment)
);

// Update Staff Joining Code By Institute Admin
router.post(
  "/staff/code",
  isLoggedIn,
  isApproved,
  catchAsync(Institute.getNewStaffJoinCodeIns)
);

// Add Account As a Institute
router.post(
  "/:id/add/ins/:iid",
  isLoggedIn,
  isApproved,
  catchAsync(Institute.AddAccountByIns)
);

// Add Account As a User
router.post(
  "/:id/add/user/:iid",
  isLoggedIn,
  isApproved,
  catchAsync(Institute.AddAccountByUser)
);

// Institute Post Report By User
router.post(
  "/:id/ins-post/:uid/report",
  isLoggedIn,
  catchAsync(Institute.reportPostByUser)
);

// Id Card Send For Printing By Super Admin
router.post(
  "/:id/id-card/:bid/send/print",
  isLoggedIn,
  catchAsync(Institute.sendForPrintID)
);

// Id Card Unsend For Printing By Super Admin
router.post(
  "/:id/id-card/:bid/un-send/print",
  isLoggedIn,
  catchAsync(Institute.unSendForPrintID)
);

// Id Card Printed By Super Admin
router.post(
  "/:id/id-card/:bid/done",
  isLoggedIn,
  catchAsync(Institute.printedBySuperAdmin)
);

// Institute Support Request At Super Admin
router.post(
  "/:id/support",
  isLoggedIn,
  catchAsync(Institute.requestForSupportIns)
);

// Support Reply By Super Admin To Institute
router.post(
  "/:id/support/:sid/reply",
  isLoggedIn,
  catchAsync(Institute.replyBySuperAdmin)
);

// Complaint Reported By Student To Institute Admin (After Not Resolved By Department / Class Teacher)
router.post(
  "/student/complaint/:id/institute/:iid",
  isLoggedIn,
  catchAsync(Institute.complaintReportAtIns)
);

// Staff Request For Transfer
router.post(
  "/staff/:sid/transfer/:id",
  isLoggedIn,
  catchAsync(Institute.transferRequestByStaff)
);

// Transfer Granted By Institute Admin
router.post(
  "/:id/staff/:sid/transfer/:ssid/grant/:eid",
  isLoggedIn,
  catchAsync(Institute.grantedTransferByIns)
);

// Transfer Not Granted By Institute Admin
router.post(
  "/:id/staff/:sid/transfer/reject/:eid",
  isLoggedIn,
  catchAsync(Institute.RejectTransferByIns)
);

// Staff Request For Leave
router.post(
  "/staff/:sid/leave/:id",
  isLoggedIn,
  catchAsync(Institute.leaveRequestByStaff)
);

// Leave Granted By Institute Admin
router.post(
  "/:id/staff/:sid/leave/grant/:eid",
  isLoggedIn,
  catchAsync(Institute.grantedLeaveByIns)
);

// Leave Not Granted By Institute Admin
router.post(
  "/:id/staff/:sid/leave/reject/:eid",
  isLoggedIn,
  catchAsync(Institute)
);

// Pending Staff Data for Institute Sub-Module
router.get(
  "/:id/pending-staff/list",
  isLoggedIn,
  catchAsync(Institute.retrievePendingStaffList)
);

// Approve Staff Data for Institute Sub-Module
router.get(
  "/:id/approve-staff/list",
  isLoggedIn,
  catchAsync(Institute.retrieveApproveStaffList)
);

// Staff Full Details Before Approval
router.get("/staff/:id", isLoggedIn, catchAsync(Institute.getFullStaffInfo));

// Department List Data at Department Tab
router.get(
  "/:id/department",
  isLoggedIn,
  catchAsync(Institute.retrieveDepartmentList)
);

// Get Data of One Department at Department List
router.get(
  "/department/:did",
  isLoggedIn,
  catchAsync(Institute.getOneDepartment)
);

// Get Batch Data in Department at Current Batch
router.get(
  "/:id/batchdetail/:bid",
  isLoggedIn,
  catchAsync(Institute.retrieveCurrentBatchData)
);

// Class Master All at Master Tab
router.get(
  "/:id/departmentmasterclass/:did",
  isLoggedIn,
  catchAsync(Institute.retrieveClassMaster)
);

// Subject Master All at Master Tab
router.get(
  "/:id/departmentmastersubject/:did",
  isLoggedIn,
  catchAsync(Institute.retrieveSubjectMaster)
);

// All Classes at Department Class Tab
router.get(
  "/batch/class/:bid",
  isLoggedIn,
  catchAsync(Institute.retrieveClass)
);

// Subject In Class at ClassSubject Tab
router.get(
  "/class/:cid",
  isLoggedIn,
  catchAsync(Institute.retrieveClassSubject)
);

// Staff Department Info
router.get(
  "/staffdepartment/:did",
  isLoggedIn,
  catchAsync(Institute.fetchOneStaffDepartmentInfo)
);

// Staff Department Info Updates
router.post(
  "/staff/department-info/:did",
  isLoggedIn,
  catchAsync(Institute.updateOneStaffDepartmentInfo)
);

// Class DataList at StaffDepartmentClass
router.get(
  "/batch-detail/:bid",
  isLoggedIn,
  catchAsync(Institute.allStaffDepartmentClassList)
);

// Class Restrict Data
router.get("/staffclass/:cid", isLoggedIn, catchAsync(Institute.retrieveClass));

// Subject Teacher Catalog
router.get(
  "/subject-detail/:suid",
  isLoggedIn,
  catchAsync(Institute.retrieveSubject)
);

// Get Staff Code
router.get(
  "/:id/staff-code",
  isLoggedIn,
  catchAsync(Institute.retrieveStaffCode)
);

// Get Student Code
router.get(
  "/:id/student-code",
  isLoggedIn,
  catchAsync(Institute.retrieveStudentCode)
);

// Update Reply Announcement By Ins
router.post(
  "/:id/reply-announcement/:aid",
  isLoggedIn,
  catchAsync(Institute.replyAnnouncement)
);

// coming Status of Staff Profile In Institute
router.get('/:sid/staff-status', isLoggedIn, catchAsync(Institute.retrieveStaffProfileStatus))

// coming Status of Student Profile In Institute
router.get('/:sid/student-status', isLoggedIn, catchAsync(Institute.retrieveStudentProfileStatus))

// Get Display Person
router.get('/:id/display/person-array', isLoggedIn, catchAsync(Institute.retrieveDisplayPersonArray))

// Display Person 
router.post('/:id/display-person', isLoggedIn, catchAsync(Institute.updateDisplayPersonArray))

// Delete Display Person 
router.delete('/:id/display-person/:did/delete/:uid', isLoggedIn, catchAsync(Institute.deleteDisplayPersonArray))

module.exports = router;
