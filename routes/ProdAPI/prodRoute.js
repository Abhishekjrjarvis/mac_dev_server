const express = require("express");
const router = express.Router();
const Prod = require("../../controllers/ProdAPI/prodController");
const catchAsync = require("../../Utilities/catchAsync");

router.get('/all/postId', catchAsync(Prod.allPosts))
router.get('/all/pollId', catchAsync(Prod.allPolls))

module.exports = router