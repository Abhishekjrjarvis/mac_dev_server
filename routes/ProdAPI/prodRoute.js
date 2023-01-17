const express = require("express");
const router = express.Router();
const Prod = require("../../controllers/ProdAPI/prodController");
const catchAsync = require("../../Utilities/catchAsync");
const Recommend = require("../../Service/AutoRefreshBackend");
const { isLoggedIn, isValidKey } = require("../../middleware");

// router.get("/all/user/data", catchAsync(Prod.allUsers));
// router.get("/all/ins/data", catchAsync(Prod.allInstitutes));
router.get("/all/postId", catchAsync(Prod.allPosts));
router.get("/all/pollId", catchAsync(Prod.allPolls));
router.get("/all/post/id", catchAsync(Prod.allPostById));
router.get("/all/answer", catchAsync(Prod.allAnswer));
router.get("/all/repost", catchAsync(Prod.allRepost));
router.get("/all/user", catchAsync(Prod.allUser));
router.get("/all/institute", catchAsync(Prod.allIns));
router.get(
  "/all/recommendation/ins/user/by/:uid",
  isLoggedIn,
  catchAsync(Recommend.recommendedAllIns)
);
router.get(
  "/all/profile/:uid/reward/ads",
  isLoggedIn,
  catchAsync(Prod.rewardProfileAdsQuery)
);
router.get(
  "/all/recommendation/post/app/:id",
  isLoggedIn,
  catchAsync(Recommend.recommendedAllAdmissionPost)
);

router.get("/data/ins/:id", catchAsync(Prod.oneInstitute));

router.get("/:id/data/user", catchAsync(Prod.oneUser));

router.delete("/user/:id/delete", catchAsync(Prod.deleteUser));

router.delete("/ins/:id/delete", catchAsync(Prod.deleteIns));

router.get("/all/log", catchAsync(Prod.allLogs));

module.exports = router;
