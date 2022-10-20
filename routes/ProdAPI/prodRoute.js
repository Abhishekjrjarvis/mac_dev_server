const express = require("express");
const router = express.Router();
const Prod = require("../../controllers/ProdAPI/prodController");
const catchAsync = require("../../Utilities/catchAsync");

router.get('/all/postId', catchAsync(Prod.allPosts))
router.get('/all/pollId', catchAsync(Prod.allPolls))
router.get('/all/user', catchAsync(Prod.allUser))
router.get('/all/institute', catchAsync(Prod.allIns))

module.exports = router