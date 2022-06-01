const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../../middleware");
const {
  postCommentInstitute,
  getCommentInstitute,
  getCommentUser,
  postCommentUser
} = require("../../controllers/ReplyComment/index");

router.route("/institute/:pcid").get(isLoggedIn, getCommentInstitute).post(isLoggedIn, postCommentInstitute);
router.route("/user/:pcid").get(isLoggedIn, getCommentUser).post(isLoggedIn, postCommentUser);

module.exports = router;
