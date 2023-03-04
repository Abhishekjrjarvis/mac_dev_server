const express = require("express");
const router = express.Router();
const Role = require("../../controllers/Moderator/roleController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router.post("/:aid/new/app/mod", catchAsync(Role.addAdmissionAppModerator));

router.get(
  "/:aid/all/moderator",
  catchAsync(Role.renderAdmissionAllAppModeratorArray)
);

router.get(
  "/one/moderator/:mid/all/apps",
  catchAsync(Role.renderOneModeratorAllAppsQuery)
);

router.patch(
  "/update/app/mod/:mid",
  catchAsync(Role.updateAdmissionAppModeratorQuery)
);

router.delete(
  "/:aid/destroy/app/mod/:mid",
  catchAsync(Role.destroyAdmissionAppModeratorQuery)
);

module.exports = router;
