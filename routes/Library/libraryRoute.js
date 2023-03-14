const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../../middleware");
const libraryController = require("../../controllers/Library/libraryController");
const catchAsync = require("../../Utilities/catchAsync");

router
  .route("/activate/:id")
  .post(catchAsync(libraryController.activateLibrary));

router
  .route("/info/:lid")
  .get(catchAsync(libraryController.libraryByStaffSide));
// .patch(
//
//   catchAsync(libraryController.libraryAbout)
// );

router
  .route("/books/:lid")
  .get(catchAsync(libraryController.allBookByStaffSide))
  .post(
    // upload.array("file"),
    catchAsync(libraryController.createBookByStaffSide)
  );

router
  .route("/book/detail/:bid")
  .get(catchAsync(libraryController.getStaffOneBookDetail))
  .patch(
    // upload.array("file"),

    catchAsync(libraryController.editBookByStaffSide)
  );

router
  .route("/issued/:lid")
  .get(catchAsync(libraryController.allBookIssueByStaffSide))
  .patch(catchAsync(libraryController.bookIssueByStaffSide));

//here tow ids one library and other is isssued id
router
  .route("/collected/:lid")
  .get(catchAsync(libraryController.allBookCollectedLogsByStaffSide))
  .patch(catchAsync(libraryController.bookColletedByStaffSide));

router
  .route("/onecollected/:cid")
  .get(catchAsync(libraryController.oneBookCollectedLogsByStaffSide));

router
  .route("/members/:lid")
  .get(catchAsync(libraryController.allMembersByStaffSide));

router
  .route("/member/:sid/issued")
  .get(catchAsync(libraryController.oneMemberIssuedByStaffSide));
router
  .route("/member/:sid/history")
  .get(catchAsync(libraryController.oneMemberHistoryByStaffSide));

router
  .route("/all/fine/history/:lid")
  .get(catchAsync(libraryController.allHistoryOfCollectByStaffSide));
router
  .route("/site/books/:lid")
  .get(catchAsync(libraryController.allOnlineBookLandingPage));

module.exports = router;
