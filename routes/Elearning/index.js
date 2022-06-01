const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { isLoggedIn } = require("../../middleware");
const {
  getInstituteElearning,
  postInstituteElearning,
  getInstituteElearningInfo,
  getAllPlaylist,
  getElearning,
  postElearning,
  getElearningPlaylist,
  getElearningPlaylistCreate,
  getPlaylist,
  patchPlaylist,
  putPlaylist,
  deletePlaylist,
  getPlaylistTopic,
  postPlaylistTopic,
  postTopicUpload,
  getOneVideo,
  patchOneVideo,
  putOneVideo,
  deleteOneVideo,
  getOnePlaylist,
  getUser,
  getVideoComment,
  postVideoComment,
  getVideoAllLike,
  patchVideoLike,
  patchVideoUnLike,
  getVideoAllBookmark,
  patchVideoBookmark,
  patchVideoUnBookmark,
  getVideoWatch,
  getUserSide,
} = require("../../controllers/Elearning/index");
router
  .route("/:id/ins")
  .get(isLoggedIn, getInstituteElearning)
  .post(isLoggedIn, postInstituteElearning);

router.route("/:id/ins/info").get(isLoggedIn, getInstituteElearningInfo);

router.route("/playlist").get(isLoggedIn, getAllPlaylist);
router
  .route("/:eid")
  .get(isLoggedIn, getElearning)
  .post(isLoggedIn, postElearning);

router.route("/:eid/playlist").get(isLoggedIn, getElearningPlaylist);

router
  .route("/:eid/playlist/create")
  .post(isLoggedIn, upload.single("file"), getElearningPlaylistCreate);

router
  .route("/playlist/:pid")
  .get(isLoggedIn, getPlaylist)
  .patch(isLoggedIn, patchPlaylist)
  .put(isLoggedIn, upload.single("file"), putPlaylist)
  .delete(isLoggedIn, deletePlaylist);

router
  .route("/playlist/:pid/topic")
  .get(isLoggedIn, getPlaylistTopic)
  .post(isLoggedIn, postPlaylistTopic);

router
  .route("/topic/:tid/upload")
  .post(isLoggedIn, upload.single("file"), postTopicUpload);

router
  .route("/oneVideo/:vid")
  .get(isLoggedIn, getOneVideo)
  .patch(isLoggedIn, patchOneVideo)
  .put(isLoggedIn, upload.single("file"), putOneVideo)
  .delete(isLoggedIn, deleteOneVideo);

router.route("/playlist/:pid").get(isLoggedIn, getOnePlaylist);

router.route("/user/:id").get(isLoggedIn, getUser);

router.route("/video/:vid/comment").get(isLoggedIn, getVideoComment);

router.route("/:id/video/:vid/comment").get(isLoggedIn, postVideoComment);

router.route("/video/alllike/:vid").get(isLoggedIn, getVideoAllLike);

router.route("/user/:id/video/:vid/like").patch(isLoggedIn, patchVideoLike);
router.route("/user/:id/video/:vid/unlike").patch(isLoggedIn, patchVideoUnLike);
router.route("/video/allbookmark/:vid").get(isLoggedIn, getVideoAllBookmark);
router
  .route("/user/:id/video/:vid/bookmark")
  .patch(isLoggedIn, patchVideoBookmark);
router
  .route("/user/:id/video/:vid/unbookmark")
  .patch(isLoggedIn, patchVideoUnBookmark);

router.route("/user/:id/video/:vid/watch").patch(isLoggedIn, getVideoWatch);

router.route("/user/:id/userside").get(isLoggedIn, getUserSide);

module.exports = router;
