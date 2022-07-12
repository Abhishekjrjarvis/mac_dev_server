const express = require("express");
const router = express.Router();
const User = require("../../controllers/User/userController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// ========= ADDED TO SWAGGER =======================

// Get User Profile Data
router.get("/:id/profile", isLoggedIn, catchAsync(User.retrieveProfileData));

// ========= ADDED TO SWAGGER =======================

// Get Announcement Detail When Follow Institute
router.get(
  "/:id/ins-announcement",
  isLoggedIn,
  catchAsync(User.retrieveFIAnnouncement)
);

// ========= ADDED TO SWAGGER =======================

// Limit Setting Data
router.get(
  "/:id/setting/personal",
  isLoggedIn,
  catchAsync(User.getPersonalSetting)
);

// ========= ADDED TO SWAGGER =======================

// Limit Switch Data
router.get(
  "/:id/switch/account",
  isLoggedIn,
  catchAsync(User.getSwitchAccounts)
);

// ========= ADDED TO SWAGGER =======================

// Limit Q-Coins Data
router.get("/:id/referals/q-coins", isLoggedIn, catchAsync(User.getQCoins));

// ========= ADDED TO SWAGGER =======================

// Limit UserDashBoard Data
router.get("/:id/dash/query", isLoggedIn, catchAsync(User.getDashDataQuery));

// User DashBoard Limited Data
router.get("/:uid/dash", catchAsync(User.getUserData));

// Add User Post At User
router.post(
  "dashboard/:id/user-post",
  isLoggedIn,
  catchAsync(User.addPostUserData)
);

// Upload Image At User Post
router.post(
  "dashboard/:id/user-post/image",
  isLoggedIn,
  upload.single("file"),
  catchAsync(User.uploadPostImage)
);

// Retrieve Image From AWS
router.get(
  "dashboard/user-post/images/:key",
  isLoggedIn,
  catchAsync(User.retrievePostImage)
);

// Upload Video At User Post
router.post(
  "dashboard/:id/user-post/video",
  isLoggedIn,
  upload.single("file"),
  catchAsync(User.uploadPostVideo)
);

// Retrieve Video From AWS
router.get(
  "dashboard/user-post/video/:key",
  isLoggedIn,
  catchAsync(User.retrievePostVideo)
);

// Update Visibility of User Post
router.put(
  "dashboard/:id/user-post/:uid/update",
  isLoggedIn,
  catchAsync(User.userPostVisibiltyChange)
);

// Delete User Post
router.delete(
  "dashboard/:id/user-post/:uid",
  isLoggedIn,
  catchAsync(User.getDeletedUserPost)
);

// Update Info At User
router.post("profileabout/:id", isLoggedIn, catchAsync(User.updateUserInfo));

// User Follow Institute
router.patch(
  "/follow/institute",
  isLoggedIn,
  catchAsync(User.updateUserFollowIns)
);

// User Unfollow Institute
router.patch(
  "/unfollow/institute",
  isLoggedIn,
  catchAsync(User.removeUserFollowIns)
);

// User Search Profile By User
router.post("-search-profile", isLoggedIn, catchAsync(User.querySearchUser));

// User Follow User
router.patch("/follow/user", isLoggedIn, catchAsync(User.updateUserFollow));

// User UnFollow User
router.patch("/unfollow/user", isLoggedIn, catchAsync(User.updateUserUnFollow));

// Add User To Circle
router.patch("/circle/user", isLoggedIn, catchAsync(User.updateUserCircle));

// Remove User From Circle
router.patch("/uncircle/user", isLoggedIn, catchAsync(User.removeUserCircle));

// Update Phone Number By User
router.post("/phone/info/:id", isLoggedIn, catchAsync(User.updateUserPhone));

// Update Personal Info By User
router.patch(
  "/personal/info/:id",
  isLoggedIn,
  catchAsync(User.updateUserPersonal)
);

// Add Account At User As Institute
router.post(
  "/:id/add/ins/:iid",
  isLoggedIn,
  catchAsync(User.addUserAccountInstitute)
);

// Add Account At User As User
router.post(
  "/:id/add/user/:iid",
  isLoggedIn,
  catchAsync(User.addUserAccountUser)
);
// Account Deactivated By User
router.post(
  "/:id/deactivate/account",
  isLoggedIn,
  catchAsync(User.deactivateUserAccount)
);

// Feedback By User
router.post("/feedback/:id", isLoggedIn, catchAsync(User.feedbackUser));

// Feedback Remind By User
router.post(
  "/feedback/remind/:id",
  isLoggedIn,
  catchAsync(User.feedbackRemindLater)
);

// Credit Transfer By User
router.post(
  "/:id/credit/transfer",
  isLoggedIn,
  catchAsync(User.getCreditTransfer)
);

// User Support Request At Super Admin
router.post("/:id/support", isLoggedIn, catchAsync(User.getSupportByUser));

// User Support Reply By Super Admin
router.post(
  "/:id/support/:sid/reply",
  isLoggedIn,
  catchAsync(User.getSupportReply)
);

// Report User Post By User
router.post(
  "/:id/user-post/:uid/report",
  isLoggedIn,
  catchAsync(User.getReportPostUser)
);

// All Notification For User
router.get(
  "/dashboard/:id/notify",
  isLoggedIn,
  catchAsync(User.getNotifications)
);

// Mark As Read By User
router.post(
  "/read/notify/user/:rid",
  isLoggedIn,
  catchAsync(User.updateReadNotifications)
);

// Hide Notifications From User
router.post(
  "/:id/notify/:nid/hide",
  isLoggedIn,
  catchAsync(User.getHideNotifications)
);

// Delete Notifications
router.delete(
  "/:id/notify/:nid/delete",
  isLoggedIn,
  catchAsync(User.getDeleteNotifications)
);

// Followers List
router.get(
  "/:uid/followers-array",
  isLoggedIn,
  catchAsync(User.followersArray)
);

// Following List
router.get(
  "/:uid/following-array",
  isLoggedIn,
  catchAsync(User.followingArray)
);

// Following List Institute
router.get(
  "/:uid/following/ins-array",
  isLoggedIn,
  catchAsync(User.followingInsArray)
);

// Circle List
router.get("/:uid/circle-array", isLoggedIn, catchAsync(User.circleArray));

// Get Star Announcement User
router.get('/:id/all/star-announcement', isLoggedIn, catchAsync(User.retrieveAllStarAnnouncementUser))

// Recovery Mail 
router.post('/:id/recovery-mail', isLoggedIn, catchAsync(User.retrieveRecoveryMailUser))

// User Staff Array
router.get('/:uid/staff-role', isLoggedIn, catchAsync(User.retrieveUserStaffArray))

// User Staff Array
router.get('/:uid/student-role', isLoggedIn, catchAsync(User.retrieveUserStudentArray))

// Staff Designation Data
router.get('/staffdesignationdata/:sid', isLoggedIn, catchAsync(User.retrieveStaffDesignationArray))

// Student Designation Data
router.get('/studentdesignationdata/:sid', isLoggedIn, catchAsync(User.retrieveStudentDesignationArray))

// User 3-Follow System Array
router.get('/:id/all-three-array', isLoggedIn, catchAsync(User.retrieveUserThreeArray))

router.get("/:uid/circle/array/query", catchAsync(User.circleArrayQuery));

router.get('/circle/user', isLoggedIn, catchAsync(User.allCircleUsers));

module.exports = router;
