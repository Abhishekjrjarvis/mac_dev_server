const express = require("express");
const router = express.Router();
const Prod = require("../../controllers/ProdAPI/prodController");
const catchAsync = require("../../Utilities/catchAsync");
const Recommend = require("../../Service/AutoRefreshBackend");
const { isValidKey } = require("../../middleware");

router.get('/all/postId', isValidKey, catchAsync(Prod.allPosts))
router.get('/all/pollId', isValidKey, catchAsync(Prod.allPolls))
router.get('/all/user', isValidKey, catchAsync(Prod.allUser))
router.get('/all/institute', isValidKey, catchAsync(Prod.allIns))
router.get('/all/recommendation/ins/user/by/:uid', catchAsync(Recommend.recommendedAllIns))
router.get('/all/profile/:uid/reward/ads', catchAsync(Prod.rewardProfileAdsQuery))
router.get('/all/recommendation/post/app/:id', catchAsync(Recommend.recommendedAllAdmissionPost))

module.exports = router