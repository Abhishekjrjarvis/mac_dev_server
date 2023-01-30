const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { isLoggedIn } = require("../../middleware");
const libraryController = require("../../controllers/Library/libraryController");
const catchAsync = require("../../Utilities/catchAsync");

router
  .route("/activate/:id") 
  .post(isLoggedIn, catchAsync(libraryController.activateLibrary));

router
  .route("/info/:lid")
  .get(isLoggedIn, catchAsync(libraryController.libraryByStaffSide))
  .patch(isLoggedIn, catchAsync(libraryController.libraryAbout));

router
  .route("/books/:lid")
  .get(isLoggedIn, catchAsync(libraryController.allBookByStaffSide))
  .post(
    upload.array("file"),
    isLoggedIn,
    catchAsync(libraryController.createBookByStaffSide)
  );

router
  .route("/book/:bid")
  .get(isLoggedIn, catchAsync(libraryController.getStaffOneBookDetail))
  .patch(
    upload.array("file"),
    isLoggedIn,
    catchAsync(libraryController.editBookByStaffSide)
  );

router
  .route("/issued/:lid")
  .get(isLoggedIn, catchAsync(libraryController.allBookIssueByStaffSide))
  .patch(isLoggedIn, catchAsync(libraryController.bookIssueByStaffSide));

//here tow ids one library and other is isssued id
router
  .route("/collected/:lid")
  .get(
    isLoggedIn,
    catchAsync(libraryController.allBookCollectedLogsByStaffSide)
  )
  .patch(isLoggedIn, catchAsync(libraryController.bookColletedByStaffSide));

router
  .route("/onecollected/:cid")
  .get(
    isLoggedIn,
    catchAsync(libraryController.oneBookCollectedLogsByStaffSide)
  );

router
  .route("/members/:lid")
  .get(isLoggedIn, catchAsync(libraryController.allMembersByStaffSide));

router
  .route("/member/:sid/issued")
  .get(isLoggedIn, catchAsync(libraryController.oneMemberIssuedByStaffSide));
router
  .route("/member/:sid/history")
  .get(isLoggedIn, catchAsync(libraryController.oneMemberHistoryByStaffSide));

module.exports = router;
