const express = require("express");
const router = express.Router();
const Post = require("../../../controllers/User/Post/PostController");
const catchAsync = require("../../../Utilities/catchAsync");
const { isLoggedIn } = require("../../../middleware");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get(
  "/:id/all/user/posts",
  isLoggedIn,
  catchAsync(Post.retrieveAllUserPosts)
);

router.get(
  "/v2/:id/all/user/posts",
  isLoggedIn,
  catchAsync(Post.retrieveAllUserPostsWeb)
);

router.get(
  "/:id/all/user/profile/posts",
  isLoggedIn,
  catchAsync(Post.retrieveAllUserProfilePosts)
);

router.post("/:id", isLoggedIn, catchAsync(Post.postWithText));

router.post(
  "/:id/image",
  isLoggedIn,
  upload.array("file"),
  catchAsync(Post.postWithImage)
);

// router.post("/:id/image/access/apk", catchAsync(Post.postWithImageAPK));

router.post(
  "/:id/video",
  isLoggedIn,
  upload.single("file"),
  catchAsync(Post.postWithVideo)
);

router.patch(
  "/update/:pid",
  isLoggedIn,
  catchAsync(Post.postWithVsibilityUpdate)
);

router.delete(
  "/:id/deleted/:pid",
  isLoggedIn,
  catchAsync(Post.postWithDeleted)
);

router.get("/tag", isLoggedIn, catchAsync(Post.circleList));

router.get("/reaction/:pid", isLoggedIn, catchAsync(Post.reactionPost));

router.get("/like/:pid", isLoggedIn, catchAsync(Post.postLike));

router.get("/save/:pid", isLoggedIn, catchAsync(Post.postSave));

router
  .route("/comment/:id")
  .get(isLoggedIn, catchAsync(Post.getComment))
  .post(isLoggedIn, catchAsync(Post.postComment));

router
  .route("/comment/child/:pcid")
  .get(isLoggedIn, catchAsync(Post.getCommentChild))
  .post(isLoggedIn, catchAsync(Post.postCommentChild));

router.get(
  "/:id/comment/child/like/:cid",
  isLoggedIn,
  catchAsync(Post.likeCommentChild)
);

router.get(
  "/:id/all/user/saved/posts",
  isLoggedIn,
  catchAsync(Post.retrieveAllUserSavedPosts)
);

router.get(
  "/:id/all/user/tag/posts",
  isLoggedIn,
  catchAsync(Post.retrieveAllUserTagPosts)
);

router.get(
  "/:id/all/user/re/posts",
  isLoggedIn,
  catchAsync(Post.retrieveAllUserReposts)
);

router.patch("/edit/comment/:cid", isLoggedIn, catchAsync(Post.commentEdit));
router.delete("/edit/comment/:cid", isLoggedIn, catchAsync(Post.commentDelete));

router.patch(
  "/edit/comment/relpy/:cid",
  isLoggedIn,
  catchAsync(Post.commentReplyEdit)
);
router.delete(
  "/edit/comment/reply/:cid",
  isLoggedIn,
  catchAsync(Post.commentReplyDelete)
);

router.patch(
  "/edit/:pid",
  isLoggedIn,
  // upload.array("file"),
  catchAsync(Post.renderEditPostQuery)
);

router.get("/:pid/query", catchAsync(Post.renderOnePostQuery));

module.exports = router;
