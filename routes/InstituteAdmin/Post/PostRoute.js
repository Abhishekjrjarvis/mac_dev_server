const express = require("express");
const router = express.Router();
const Post = require("../../../controllers/InstituteAdmin/Post/PostController");
const catchAsync = require("../../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/:id/all/posts", isLoggedIn, catchAsync(Post.retrieveAllPosts));
router.get(
  "/:id/all/profile/posts",
  isLoggedIn,
  catchAsync(Post.retreiveAllProfilePosts)
);

router.post("/:id", isLoggedIn, isApproved, catchAsync(Post.postWithText));

router.post(
  "/:id/image",
  isLoggedIn,
  isApproved,
  upload.array("file"),
  catchAsync(Post.postWithImage)
);

router.post(
  "/:id/image/access/apk",
  upload.fields([
    { name: "file1" },
    { name: "file2" },
    { name: "file3" },
    { name: "file4" },
    { name: "file5" },
    { name: "file6" },
    { name: "file7" },
    { name: "file8" },
    { name: "file9" },
    { name: "file10" },
  ]),
  catchAsync(Post.postWithImageAPK)
);

router.post(
  "/:id/video",
  isLoggedIn,
  isApproved,
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

router.get("/comment/:id", isLoggedIn, catchAsync(Post.getComment));

router.post("/comment/:id", isLoggedIn, catchAsync(Post.postComment));

router.get(
  "/comment/child/:pcid",
  isLoggedIn,
  catchAsync(Post.getCommentChild)
);

router.post(
  "/comment/child/:pcid",
  isLoggedIn,
  catchAsync(Post.postCommentChild)
);

router.get(
  "/:id/comment/child/like/:cid",
  isLoggedIn,
  catchAsync(Post.likeCommentChild)
);

router.get(
  "/:id/saved/all/posts",
  isLoggedIn,
  catchAsync(Post.retrieveSavedAllPosts)
);

router.get(
  "/:id/tag/all/posts",
  isLoggedIn,
  catchAsync(Post.retrieveTagAllPosts)
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
module.exports = router;
