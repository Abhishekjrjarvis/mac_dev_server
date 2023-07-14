const express = require("express");
const router = express.Router();
const Admin = require("../../controllers/SuperAdmin/AdminController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Render Admin
router.get("/super", catchAsync(Admin.getRenderAdmin));

router.post("/super", catchAsync(Admin.retrieveAdminQuery));

// Get Super Admin Dashboard
router.get("/:aid", isLoggedIn, catchAsync(Admin.getAdmin));

// Get Approve Institute Array
router.get(
  "/approve/array",
  isLoggedIn,
  catchAsync(Admin.retrieveApproveInstituteArray)
);

// Get Pending Institute Array
router.get(
  "/:aid/pending-array",
  isLoggedIn,
  catchAsync(Admin.retrievePendingInstituteArray)
);

// Get User Array
router.get("/user/array", isLoggedIn, catchAsync(Admin.retrieveUserArray));

// Assign One Institute to be Universal Following
router.post(
  "/:aid/ins/universal",
  isLoggedIn,
  catchAsync(Admin.retrieveUniversalInstitute)
);

// Get Super Admin Form
router.get("/new", catchAsync(Admin.getSuperAdmin));

// Send OTP
router.post("/send-otp", catchAsync(Admin.sendOtpToAdmin));

// Verify OTP
router.post("/verify-otp", catchAsync(Admin.getVerifySuperAdmin));

// Post Super Admin Details
router.post(
  "/register",
  upload.single("file"),
  catchAsync(Admin.updateSuperAdmin)
);

// Get Recovery Phrase
router.get("/phrase", catchAsync(Admin.retrieveRecoveryPhrase));

// Approve Institute By Super Admin
router.post(
  "/:aid/approve/ins/:id",
  isLoggedIn,
  catchAsync(Admin.getApproveIns)
);

// Reject Institute By Super Admin
router.post("/:aid/reject/ins/:id", isLoggedIn, catchAsync(Admin.getRejectIns));

// All Referral By Ins
router.get("/referral/ins", isLoggedIn, catchAsync(Admin.getReferralIns));

// All Referral By User
router.get("/referral/user", isLoggedIn, catchAsync(Admin.getReferralUser));

// All Counts for Landing Page
router.get("/count/detail", catchAsync(Admin.retrieveLandingPageCount));

// Get One Institute
router.get(
  "/one/institute/:id",
  isLoggedIn,
  catchAsync(Admin.retrieveOneInstitute)
);

// Bank Detail verified by Super Admin
router.post(
  "/:aid/bank/detail/verification/:id",
  isLoggedIn,
  catchAsync(Admin.verifyInstituteBankDetail)
);

// Get Approve Activate Institute Array
router.get(
  "/:aid/approve/activate-array",
  isLoggedIn,
  catchAsync(Admin.retrieveApproveInstituteActivate)
);

// Get Approve Activate Volume Institute Array
router.get(
  "/:aid/approve/activate/volume-array",
  isLoggedIn,
  catchAsync(Admin.retrieveApproveInstituteActivateVolume)
);

// User Referral Payment Array
router.get(
  "/referral/user/payment",
  isLoggedIn,
  catchAsync(Admin.retrieveReferralUserArray)
);

// User Referral Payment Array
router.post(
  "/:aid/referral/:uid/pay",
  isLoggedIn,
  catchAsync(Admin.retrieveReferralUserPayment)
);

// Get In Touch Array
router.get("/get/touch", isLoggedIn, catchAsync(Admin.retrieveGetInTouch));

router.get(
  "/carrier/query",
  isLoggedIn,
  catchAsync(Admin.retrieveCarrierQuery)
);

router.get("/report/query", isLoggedIn, catchAsync(Admin.retrieveReportQuery));

router.get(
  "/notification/query",
  isLoggedIn,
  catchAsync(Admin.retrieveNotificationQuery)
);

router.get(
  "/dashboard/notify/count",
  isLoggedIn,
  catchAsync(Admin.retrieveNotificationCountQuery)
);

router.get(
  "/getrecentchat/user",
  isLoggedIn,
  catchAsync(Admin.getRecentChatUser)
);

router.get(
  "/getrecentchat/institute",
  isLoggedIn,
  catchAsync(Admin.getRecentChatInstitute)
);

router.post(
  "/:aid/repay/:uid/institute",
  isLoggedIn,
  catchAsync(Admin.retrieveRepayInstituteAmount)
);

router.get(
  "/repay/query/institute/:id",
  // isLoggedIn,
  catchAsync(Admin.retrieveInstituteRepayQuery)
);
//
router.get(
  "/social/post/count",
  isLoggedIn,
  catchAsync(Admin.retrieveSocialPostCount)
);

router.get(
  "/social/like/count",
  isLoggedIn,
  catchAsync(Admin.retrieveSocialLikeCount)
);

router.get(
  "/social/platform/all/posts",
  isLoggedIn,
  catchAsync(Admin.retrievePlatformAllPosts)
);

router.get(
  "/one/user/:uid",
  isLoggedIn,
  catchAsync(Admin.retrieveOneUserQuery)
);

router.get(
  "/one/institute/:id/profile",
  isLoggedIn,
  catchAsync(Admin.retrieveOneInstituteQuery)
);

router.patch(
  "/one/institute/:id/profile/charges",
  catchAsync(Admin.uploadAdmissionApplicationCharges)
);

router.patch(
  "/post/:pid/block",
  isLoggedIn,
  catchAsync(Admin.retrieveOnePostBlock)
);

router.patch(
  "/institute/:id/block",
  isLoggedIn,
  catchAsync(Admin.retrieveOneInstituteBlock)
);

router.patch(
  "/user/:uid/block",
  isLoggedIn,
  catchAsync(Admin.retrieveOneUserBlock)
);

// router.get("/payout/:pid", isLoggedIn, catchAsync(Admin.renderPayouts));

router.patch("/add/sub/domain", catchAsync(Admin.renderAddSubDomainQuery));

router.get("/all/sub/domain/array", catchAsync(Admin.renderAllSubDomainArray));

router.get("/sub/domain/by/host", catchAsync(Admin.renderSubDomainHostQuery));

router.patch(
  "/link/sub/domain/:sdid",
  catchAsync(Admin.renderLinkSubDomainQuery)
);

// router.post(
//   "/payout/:pid/done",
//   isLoggedIn,
//   catchAsync(Admin.renderPayoutsPaid)
// );

// router.get('/filter/user/data',isLoggedIn, catchAsync(Admin.filterByYear))

router.get(
  "/all/:id/bank/accounts/query",
  catchAsync(Admin.renderAllBankAccountQuery)
);

module.exports = router;
