const express = require("express");
const router = express.Router();
const User = require("../../OptimizeController/User/userController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isLimit } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/:id/profile", isLoggedIn, catchAsync(User.retrieveProfileData));

router.get(
  "/:id/ins-announcement",
  isLoggedIn,
  catchAsync(User.retrieveFIAnnouncement)
);

router.get(
  "/one-announcement/:aid",
  isLoggedIn,
  catchAsync(User.retrieveFIOneAnnouncement)
);

router.get(
  "/:id/setting/personal",
  isLoggedIn,
  catchAsync(User.getPersonalSetting)
);

router.get(
  "/:id/switch/account",
  isLoggedIn,
  catchAsync(User.getSwitchAccounts)
);

router.get("/:id/referals/q-coins", isLoggedIn, catchAsync(User.getQCoins));

router.get("/:id/dash/query", catchAsync(User.getDashDataQuery));

router.patch(
  "/follow/institute",
  isLoggedIn,
  catchAsync(User.updateUserFollowIns)
);

router.patch(
  "/unfollow/institute",
  isLoggedIn,
  catchAsync(User.removeUserFollowIns)
);

router.patch("/follow/user", isLoggedIn, catchAsync(User.updateUserFollow));

router.patch("/unfollow/user", isLoggedIn, catchAsync(User.updateUserUnFollow));

router.patch("/circle/user", isLoggedIn, catchAsync(User.updateUserCircle));

router.patch("/uncircle/user", isLoggedIn, catchAsync(User.removeUserCircle));

router.post("/phone/info/:id", isLoggedIn, catchAsync(User.updateUserPhone));

router.patch(
  "/personal/info/:id",
  isLoggedIn,
  catchAsync(User.updateUserPersonal)
);

router.post(
  "/:id/add/ins/:iid",
  isLoggedIn,
  catchAsync(User.addUserAccountInstitute)
);

router.post(
  "/:id/add/user/:iid",
  isLoggedIn,
  catchAsync(User.addUserAccountUser)
);

router.post(
  "/:id/deactivate/account",
  isLoggedIn,
  catchAsync(User.deactivateUserAccount)
);

router.post("/feedback/:id", isLoggedIn, catchAsync(User.feedbackUser));

router.post(
  "/feedback/remind/:id",
  isLoggedIn,
  catchAsync(User.feedbackRemindLater)
);

router.post(
  "/:id/credit/transfer",
  isLoggedIn,
  catchAsync(User.getCreditTransfer)
);

router.post(
  "/:id/user-post/:uid/report",
  isLoggedIn,
  catchAsync(User.getReportPostUser)
);

router.get(
  "/dashboard/:id/notify",
  isLoggedIn,
  catchAsync(User.getNotifications)
);
//
router.get("/:id/activity", isLoggedIn, catchAsync(User.getAllUserActivity));

router.get("/:id/student/message", catchAsync(User.getAllUserStudentMessage));

router.get(
  "/:id/activity/total/notify",
  // isLoggedIn,
  catchAsync(User.getAllTotalCount)
);

router.patch(
  "/:id/mark/viewed",
  // isLoggedIn,
  catchAsync(User.retrieveMarkAllView)
);

router.patch(
  "/read/notify/user/:rid",
  isLoggedIn,
  catchAsync(User.updateReadNotifications)
);

router.post(
  "/:id/notify/:nid/hide",
  isLoggedIn,
  catchAsync(User.getHideNotifications)
);

router.delete(
  "/:id/notify/:nid/delete",
  isLoggedIn,
  catchAsync(User.getDeleteNotifications)
);
//
router.get(
  "/:uid/followers-array",
  isLoggedIn,
  catchAsync(User.followersArray)
);

router.get(
  "/:uid/following-array",
  isLoggedIn,
  catchAsync(User.followingArray)
);

router.get(
  "/:uid/following/ins-array",
  isLoggedIn,
  catchAsync(User.followingInsArray)
);

router.get("/:uid/circle-array", isLoggedIn, catchAsync(User.circleArray));

router.get(
  "/:id/all/star-announcement",
  isLoggedIn,
  catchAsync(User.retrieveAllStarAnnouncementUser)
);

router.post(
  "/:id/recovery-mail",
  isLoggedIn,
  catchAsync(User.retrieveRecoveryMailUser)
);

router.get(
  "/:uid/staff-role",
  isLoggedIn,
  catchAsync(User.retrieveUserStaffArray)
);

router.get(
  "/:uid/student-role",
  isLoggedIn,
  catchAsync(User.retrieveUserStudentArray)
);

router.get(
  "/staffdesignationdata/:sid",
  // isLoggedIn,
  catchAsync(User.retrieveStaffDesignationArray)
);

router.get(
  "/studentdesignationdata/:sid",
  // isLoggedIn,
  catchAsync(User.retrieveStudentDesignationArray)
);

router.get(
  "/:id/all-three-array",
  isLoggedIn,
  catchAsync(User.retrieveUserThreeArray)
);

router.get(
  "/:uid/know/query",
  isLoggedIn,
  catchAsync(User.retrieveUserKnowQuery)
);

router.get(
  "/:uid/circle/array/query",
  isLoggedIn,
  catchAsync(User.circleArrayQuery)
);

router.get("/circle/user", isLoggedIn, catchAsync(User.allCircleUsers));

router.get(
  "/:uid/subject/chat",
  isLoggedIn,
  catchAsync(User.retrieveUserSubjectChat)
);

router.get(
  "/:uid/class/chat",
  isLoggedIn,
  catchAsync(User.retrieveUserClassChat)
);

router.get(
  "/:uid/department/chat",
  isLoggedIn,
  catchAsync(User.retrieveUserDepartmentChat)
);

router.get(
  "/:uid/all/application/query",
  // isLoggedIn,
  catchAsync(User.retrieveUserAllApplicationQuery)
);

router.get(
  "/:uid/all/:aid/application/query",
  // isLoggedIn,
  catchAsync(User.retrieveUserOneApplicationQuery)
);

router.get(
  "/:uid/application/status",
  isLoggedIn,
  catchAsync(User.retrieveUserApplicationStatus)
);

router.get(
  "/profile/:username",
  isLoggedIn,
  catchAsync(User.retrieveProfileDataUsername)
);

router.get(
  "/staff/:sid/sal/history",
  isLoggedIn,
  catchAsync(User.retrieveStaffSalaryHistory)
);

// router.patch("/block/user", isLoggedIn, catchAsync(User.updateUserBlock));

router.patch("/unblock/user", isLoggedIn, catchAsync(User.updateUserUnBlock));

router.patch(
  "/report/block/user",
  isLoggedIn,
  catchAsync(User.retrieveUserReportBlock)
);

router.patch(
  "/unblock/institute",
  isLoggedIn,
  catchAsync(User.updateUserUnBlockInstitute)
);

router.patch(
  "/report/block/institute",
  isLoggedIn,
  catchAsync(User.retrieveUserReportBlockIns)
);

router.patch(
  "/:uid/location/permission",
  isLoggedIn,
  catchAsync(User.retrieveUserLocationPermission)
);

// User Switch Staff & Student
router.get(
  "/:uid/staff/student/role",
  // isLoggedIn,
  catchAsync(User.retrieveUserRoleQuery)
);

// User Switch Boolean
router.get(
  "/:uid/staff/student/role/query/format",
  // isLoggedIn,
  catchAsync(User.retrieveUserRoleQueryFormat)
);

router.get(
  "/:sid/staff/all/designation",
  catchAsync(User.retrieveStaffAllDesignationQuery)
);

// router.get("/:id/all/three/section/notify",isLoggedIn, catchAsync(User.getAllThreeCount));

// router.patch("/:id/mark/viewed",isLoggedIn, catchAsync(User.retrieveMarkAllThree))

router.patch("/update/mode/:id", catchAsync(User.renderMode));

router.get("/:uid/all/stats/query", catchAsync(User.retrieveUserStatsQuery));

router.get(
  "/precise/staffdesignationdata/:sid",
  // isLoggedIn,
  catchAsync(User.retrievePreciseStaffDesignationArray)
);

router.get(
  "/precise/studentdesignationdata/:sid",
  // isLoggedIn,
  catchAsync(User.retrievePreciseStudentDesignationArray)
);

router.delete(
  "/:uid/destroy/account/query",
  // isLoggedIn,
  isLimit,
  catchAsync(User.destroyUserAccountQuery)
);

router.get("/specific/mods/:uid", catchAsync(User.render_specific_mods_query));

// Dashboard Application API

router.get(
  "/:uid/dashboard/all/application/query",
  catchAsync(User.retrieveUserDashboardOneApplicationQuery)
);

router.get(
  "/:uid/mods/access/query",
  catchAsync(User.retrieveUserModsAccessQuery)
);

router.patch(
  "/one/click/follow/:sid",
  catchAsync(User.render_one_click_follow)
);

router.get(
  "/:sid/one/student/id/card/query",
  catchAsync(User.render_student_id_query)
);

router.get("/:id/chat/access/query", catchAsync(User.getChatDashDataQuery));

module.exports = router;
