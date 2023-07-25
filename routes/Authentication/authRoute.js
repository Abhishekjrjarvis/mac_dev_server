const express = require("express");
const router = express.Router();
const catchAsync = require("../../Utilities/catchAsync");
const Auth = require("../../controllers/Authentication/AuthController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { isLimit } = require("../../middleware");

// Send Otp At Institute Phone Number
router.post("/ins-detail", catchAsync(Auth.getOtpAtIns));

// Verify Otp Code Provided By Institute
router.post("/ins-detail-verify/:id", catchAsync(Auth.verifyOtpByIns));

// Institute Register
router.post(
  "/ins/register",
  upload.single("file"),
  catchAsync(Auth.getRegisterIns)
);

// Institute Password Creation
router.post("/ins/create-password/:id", catchAsync(Auth.getPassIns));

// Send Otp At User Phone Number
router.post("/user-detail", catchAsync(Auth.getOtpAtUser));

// Verify Otp Code Provided By User
router.post("/user-detail-verify/:id", catchAsync(Auth.verifyOtpByUser));

// Profile Creation By User
router.post(
  "/profile-creation/:id",
  upload.single("file"),
  catchAsync(Auth.profileByUser)
);

// Profile Creation By GOOGLE Auth
router.post("/profile/google", catchAsync(Auth.profileByGoogle));

// Password Creation By User
router.post("/create-user-password/:id", catchAsync(Auth.getUserPassword));

// Forgot Password Otp Send By End User (Institute Admin, User)
router.post("/user/forgot", catchAsync(Auth.forgotPasswordSendOtp));

// Forgot Password Otp Verify By End User (Institute Admin, User)
router.post("/user/forgot/:fid", catchAsync(Auth.forgotPasswordVerifyOtp));

// Create New Password While Verify Otp
router.post("/user/reset/password/:rid", catchAsync(Auth.getNewPassword));

// Login Detail (SuperAdmin, InstituteAdmin, Enduser)
router.get("/login", catchAsync(Auth.getLogin));

// Fetch Logged In by Which (End User, Institute Admin, Super Admin)
router.post("/login", isLimit, catchAsync(Auth.authentication));

// Fetch Logged In by GOOGLE
router.post("/login/google", catchAsync(Auth.authenticationGoogle));

// Logout By End User
router.get("/logout", catchAsync(Auth.getLogout));

router.get(
  "/email/check/redundant",
  catchAsync(Auth.retrieveEmailRedundantQuery)
);

router.patch("/username", catchAsync(Auth.retrieveUsernameEditQuery));

router.get("/username/search", catchAsync(Auth.searchByUsernameQuery));

router.get("/classcode/search", catchAsync(Auth.searchByClassCode));

router.post(
  "/direct/join/student/:id",
  catchAsync(Auth.retrieveDirectJoinQuery)
);

router.post(
  "/direct/join/staff/:id",
  catchAsync(Auth.retrieveDirectJoinStaffQuery)
);

router.post(
  "/direct/join/admission/:id/apply/:aid",
  catchAsync(Auth.retrieveDirectJoinAdmissionQuery)
);

router.post(
  "/direct/join/hostel/:id/apply/:aid",
  catchAsync(Auth.retrieveDirectJoinHostelQuery)
);

router.post(
  "/direct/institute/join/student/:id/class/:cid",
  catchAsync(Auth.retrieveInstituteDirectJoinQuery)
);

router.post(
  "/direct/join/staff/:id/institute/:insId",
  catchAsync(Auth.retrieveInstituteDirectJoinStaffQuery)
);

router.post(
  "/direct/confirm/join/:id/apply/:aid",
  catchAsync(Auth.renderDirectAppJoinConfirmQuery)
);

router.get("/select/account", catchAsync(Auth.renderSelectAccountQuery));

router.patch(
  "/reset/new/password/:faid",
  catchAsync(Auth.renderFinanceAdmissionNewPassQuery)
);

router.patch(
  "/enable/password/protection/:faid",
  catchAsync(Auth.renderFinanceAdmissionNewProtectionQuery)
);

router.post(
  "/login/designation",
  isLimit,
  catchAsync(Auth.renderFinanceAdmissionDesignationLoginQuery)
);

// router.post(
//   "/direct/institute/join/student/:id/class/:cid/payload",
//   catchAsync(Auth.retrieveInstituteDirectJoinQueryPayload)
// );

router.get(
  "/logout/designation",
  catchAsync(Auth.renderLogoutDesignationQuery)
);

router.delete(
  "/remove/platform/one/institute/:cid/all/student",
  catchAsync(Auth.renderOneInstituteAllStudentQuery)
);

// router.patch("/all/student/:id", catchAsync(Auth.renderAllStudentQuery));

module.exports = router;
