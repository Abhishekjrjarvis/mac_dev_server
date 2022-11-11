const express = require("express");
const router = express.Router();
const User = require("../../controllers/User/userController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");
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

router.get("/:id/dash/query", isLoggedIn, catchAsync(User.getDashDataQuery));

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
  catchAsync(User.getNotifications)
);
//
router.get(
  "/:id/activity",
  catchAsync(User.getAllUserActivity)
);

router.get(
  "/:id/activity/total/notify",
  catchAsync(User.getAllTotalCount)
);

router.patch(
  "/:id/mark/viewed",
  catchAsync(User.retrieveMarkAllView)
);

router.patch(
  "/read/notify/user/:rid",
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
  catchAsync(User.retrieveStaffDesignationArray)
);

router.get(
  "/studentdesignationdata/:sid",
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

router.get("/:uid/circle/array/query", catchAsync(User.circleArrayQuery));

router.get("/circle/user", isLoggedIn, catchAsync(User.allCircleUsers));


router.get("/:uid/subject/chat", catchAsync(User.retrieveUserSubjectChat))

router.get("/:uid/class/chat", catchAsync(User.retrieveUserClassChat))

router.get("/:uid/department/chat", catchAsync(User.retrieveUserDepartmentChat))

router.get("/:uid/application/status", catchAsync(User.retrieveUserApplicationStatus))

router.get(
  "/profile/:username",
  isLoggedIn,
  catchAsync(User.retrieveProfileDataUsername)
);

router.get('/staff/:sid/sal/history', catchAsync(User.retrieveStaffSalaryHistory))

// router.patch("/block/user", isLoggedIn, catchAsync(User.updateUserBlock));

router.patch("/unblock/user", isLoggedIn, catchAsync(User.updateUserUnBlock));

router.patch('/report/block/user', isLoggedIn, catchAsync(User.retrieveUserReportBlock))

router.patch("/unblock/institute", isLoggedIn, catchAsync(User.updateUserUnBlockInstitute));

router.patch('/report/block/institute', isLoggedIn, catchAsync(User.retrieveUserReportBlock))

router.patch(
  "/:uid/location/permission",
  catchAsync(User.retrieveUserLocationPermission)
);

// User Switch Staff & Student
router.get('/:uid/staff/student/role', catchAsync(User.retrieveUserRoleQuery))

module.exports = router;
