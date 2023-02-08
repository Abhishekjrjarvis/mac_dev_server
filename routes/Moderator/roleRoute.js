const express = require("express")
const router = express.Router()
const Role = require("../../controllers/Moderator/roleController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router.post("/:aid/new/app/mod", catchAsync(Role.addAdmissionAppModerator))

module.exports = router