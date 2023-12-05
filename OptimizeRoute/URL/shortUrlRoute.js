const express = require("express");
const router = express.Router();
const URL = require("../../OptimizeController/URL/shortUrl");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router.patch("/login/username/query", catchAsync(URL.loginUsernameQuery));

router.patch("/member/sequencing/query", catchAsync(URL.memberSequencingQuery));

router.patch("/module/sequencing/query", catchAsync(URL.moduleSequencingQuery));

router.patch("/new/unique/query", catchAsync(URL.random_module_unique_id));


module.exports = router;
