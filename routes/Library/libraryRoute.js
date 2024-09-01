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

router
  .route("/in/out/:lid/history/query")
  .get(catchAsync(libraryController.getInOutLibraryHistoryQuery));

router
  .route("/moderator/:lid/query")
  .get(catchAsync(libraryController.getLibraryModeratorList))
  .post(catchAsync(libraryController.getLibraryCreateModerator))
  .patch(catchAsync(libraryController.getLibraryUpdateModerator))
  .delete(catchAsync(libraryController.getLibraryRemoveModerator));

router
  .route("/stocktake/:lid/list/query")
  .get(catchAsync(libraryController.getStocktakeLibraryHistoryQuery));

router
  .route("/stocktake/:stid/card/query")
  .get(catchAsync(libraryController.getStocktakeBookHistoryQuery));

router
  .route("/stocktake/:lid/record/query")
  .patch(catchAsync(libraryController.getStocktakeLibraryUpdateRecordQuery));

router
  .route("/remark/book/:bid/query")
  .get(catchAsync(libraryController.getLibraryBookRemarkListQuery))
  .patch(catchAsync(libraryController.getLibraryUpdateBookRemarkQuery))
  .delete(catchAsync(libraryController.getLibraryRemoveBookRemarkQuery));

router
  .route("/moderator/department/books/:mid")
  .get(catchAsync(libraryController.allBookByModetatorStaffSide));
router
  .route("/timing/update/:lid/query")
  .patch(catchAsync(libraryController.getLibraryUpdateTimeQuery));

router
  .route("/stocktake/:stid/missing/book/status/query")
  .patch(
    catchAsync(libraryController.getStocktakeLibraryMissingBookUpdateQuery)
  );

router
  .route("/student/total/library/:sid/time")
  .get(catchAsync(libraryController.getStudentTotalLibraryTimeQuery));

router
  .route("/staff/qr/list/:lid")
  .patch(catchAsync(libraryController.getAllStaffQrCodeQuery));
router
  .route("/student/qr/list/:lid")
  .patch(catchAsync(libraryController.getAllStudentQrCodeQuery));

router
  .route("/export/:lid/entry/logs/query")
  .patch(catchAsync(libraryController.getAllEntryLogsExport));

router
  .route("/export/:lid/review/book/query")
  .patch(catchAsync(libraryController.getAllBookReviewExport));

router
  .route("/own/staff/:sid/issued")
  .get(catchAsync(libraryController.own_staff_borrow_query));
router
  .route("/own/staff/:sid/history")
  .get(catchAsync(libraryController.own_staff_history_query));

module.exports = router;
