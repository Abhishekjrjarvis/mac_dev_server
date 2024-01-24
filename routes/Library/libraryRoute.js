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

router
  .route("/fine/charges/:lid/query")
  .get(catchAsync(libraryController.renderFineChargesQuery));

router
  .route("/fine/:lid/query/collect/:sid/offline/:bid")
  .patch(catchAsync(libraryController.renderFineChargesCollectOfflineQuery));

router
  .route("/:lid/delete/all/book/query")
  .delete(catchAsync(libraryController.renderDeleteAllBookQuery));

router
  .route("/all/book/query")
  .patch(catchAsync(libraryController.renderAllBookQuery));

router
  .route("/export/:lid/excel/query")
  .get(catchAsync(libraryController.getAllExcelLibraryQuery));
router
  .route("/export/:lid/book/query")
  .patch(catchAsync(libraryController.getAllBookExport));

router
  .route("/export/:lid/issue/query")
  .patch(catchAsync(libraryController.getAllIssueExport));

router
  .route("/export/:lid/collect/query")
  .patch(catchAsync(libraryController.getAllCollectExport));

router
  .route("/export/:lid/member/query")
  .patch(catchAsync(libraryController.getAllMemberExport));

router
  .route("/staff/issued/:lid")
  .patch(catchAsync(libraryController.bookIssueByStaffSideQuery));


  router
  .route("/staff/collect/:lid")
  .patch(catchAsync(libraryController.bookColletedByStaffSideQuery));

router
  .route("/generate/member/qr/:lid")
  .patch(catchAsync(libraryController.generateAllMemberQrCodeQuery));

router
  .route("/generate/book/qr/:lid")
  .patch(catchAsync(libraryController.generateAllBookQrCodeQuery));

router
  .route("/book/qr/list/:lid")
  .patch(catchAsync(libraryController.getAllBookQrCodeQuery));

router
  .route("/student/in/out/:sid/query")
  .patch(catchAsync(libraryController.getInOutStudentQuery));

router
  .route("/student/in/out/:sid/history/query")
  .get(catchAsync(libraryController.getInOutStudentHistoryQuery));

router
  .route("/staff/in/out/:sid/query")
  .patch(catchAsync(libraryController.getInOutStaffQuery));

router
  .route("/staff/in/out/:sid/history/query")
  .get(catchAsync(libraryController.getInOutStaffHistoryQuery));

router.route("/qr").get(catchAsync(libraryController.getLibraryQrCode));

module.exports = router;
