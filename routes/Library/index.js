const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { isLoggedIn } = require("../../middleware");
const {
  getInstituteLibrary,
  postInstituteLibrary,
  getInstituteLibraryInfo,
  getLibraryAllBook,
  getLibraryAll,
  postLibraryAbout,
  postLibraryCreateBook,
  getLibraryOneBook,
  patchLibraryOneBook,
  putLibraryOneBook,
  deleteLibraryOneBook,
  postLibraryBookIssue,
  postLibraryBookCollect,
  getLibraryUserBorrow,
  getLibraryStudentBorrow,
} = require("../../controllers/Library/index");

router
  .route("/ins/:id")
  .get(isLoggedIn, getInstituteLibrary)
  .post(isLoggedIn, postInstituteLibrary);
router.route("/ins/:id/info").get(isLoggedIn, getInstituteLibraryInfo);
router.route("/allbook").get(isLoggedIn, getLibraryAllBook);
router.route("/:lid").get(isLoggedIn, getLibraryAll);
router.route("/:lid/about").post(isLoggedIn, postLibraryAbout);
router
  .route("/:lid/create-book")
  .post(isLoggedIn, upload.single("file"), postLibraryCreateBook);
router
  .route("/onebook/:bid")
  .get(isLoggedIn, getLibraryOneBook)
  .patch(isLoggedIn, patchLibraryOneBook)
  .put(isLoggedIn, upload.single("file"), putLibraryOneBook)
  .delete(isLoggedIn, deleteLibraryOneBook);
router.route("/:lid/issue").post(isLoggedIn, postLibraryBookIssue);
router.route("/:lid/collect/:cid").post(isLoggedIn, postLibraryBookCollect);
router.route("/user/:id/borrow").get(isLoggedIn, getLibraryUserBorrow);
router.route("/student/:id/borrow").get(isLoggedIn, getLibraryStudentBorrow);

module.exports = router;
