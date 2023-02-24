const express = require("express");
const router = express.Router();
const HashTag = require("../../controllers/HashTag/hashtagController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/:hid/query", isLoggedIn, catchAsync(HashTag.renderHashtag));

router.get(
  "/:hid/query/post",
  isLoggedIn,
  catchAsync(HashTag.renderHashtagPost)
);

router.patch("/follow", isLoggedIn, catchAsync(HashTag.followHashtag));

router.get("/all/array", isLoggedIn, catchAsync(HashTag.arrayHashtag));

router.patch(
  "/:hid/update",
  isLoggedIn,
  upload.single("file"),
  catchAsync(HashTag.updateHashtag)
);

module.exports = router;
