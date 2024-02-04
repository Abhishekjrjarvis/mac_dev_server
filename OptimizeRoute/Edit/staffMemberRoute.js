const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const staffMember = require("../../OptimizeController/Edit/staffMember");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router
  .route("/form/photo/:sid")
  .patch(
    upload.single("file"),
    isLoggedIn,
    catchAsync(staffMember.photoEditByStaff)
  );

router
  .route("/form/detail/:sid")
  .patch(catchAsync(staffMember.formEditByInstitute));

router
  .route("/finance/staff/:osid")
  .patch(isLoggedIn, catchAsync(staffMember.renderFinanceStaffQuery));

router
  .route("/admission/staff/:osid")
  .patch(isLoggedIn, catchAsync(staffMember.renderAdmissionStaffQuery));

router
  .route("/sport/arts/staff/:osid")
  .patch(isLoggedIn, catchAsync(staffMember.renderSportStaffQuery));

router
  .route("/sport/arts/class/staff/:osid")
  .patch(isLoggedIn, catchAsync(staffMember.renderSportStaffClassQuery));

router
  .route("/library/staff/:osid")
  .patch(isLoggedIn, catchAsync(staffMember.renderLibraryStaffQuery));

router
  .route("/transport/staff/:osid")
  .patch(isLoggedIn, catchAsync(staffMember.renderTransportStaffQuery));

router
  .route("/event/manager/staff/:osid")
  .patch(isLoggedIn, catchAsync(staffMember.renderEventManagerStaffQuery));

router
  .route("/hostel/manager/staff/:osid")
  .patch(isLoggedIn, catchAsync(staffMember.renderHostelManagerStaffQuery));

router
  .route("/user/login/query")
  .patch(catchAsync(staffMember.renderStaffUserLoginQuery));

router
  .route("/alumini/staff/:osid")
  .patch(isLoggedIn, catchAsync(staffMember.renderAluminiStaffQuery));

router
  .route("/lms/staff/:osid")
  .patch(isLoggedIn, catchAsync(staffMember.renderLMSStaffQuery));

module.exports = router;
