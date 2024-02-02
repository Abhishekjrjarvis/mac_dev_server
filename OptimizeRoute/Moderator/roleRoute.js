const express = require("express");
const router = express.Router();
const Role = require("../../OptimizeController/Moderator/roleController");
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

router.post(
  "/:fid/finance/moderator",
  catchAsync(Role.addFinanceModeratorQuery)
);

router.get(
  "/:fid/all/finance/moderator",
  catchAsync(Role.renderFinanceAllAppModeratorArray)
);

router.patch(
  "/update/finance/mod/:mid",
  catchAsync(Role.updateFinanceAppModeratorQuery)
);

router.delete(
  "/:fid/destroy/finance/mod/:mid",
  catchAsync(Role.destroyFinanceModeratorQuery)
);

router.post("/:id/ins/moderator", catchAsync(Role.addInstituteModeratorQuery));

router.get(
  "/:id/all/ins/moderator",
  catchAsync(Role.renderInstituteAllAppModeratorArray)
);

router.get(
  "/:id/all/ins/moderator/review/query",
  catchAsync(Role.renderInstituteAllAppReviewModeratorArray)
);

router.patch(
  "/update/ins/mod/:mid",
  catchAsync(Role.updateInstituteAppModeratorQuery)
);

router.delete(
  "/:id/destroy/ins/mod/:mid",
  catchAsync(Role.destroyInstituteModeratorQuery)
);

router.post("/:hid/new/hostel/app/mod", catchAsync(Role.addHostelAppModerator));

router.get(
  "/:hid/all/hostel/moderator",
  catchAsync(Role.renderHostelAllAppModeratorArray)
);

router.patch(
  "/update/app/hostel/mod/:mid",
  catchAsync(Role.updateHostelAppModeratorQuery)
);

router.delete(
  "/:hid/destroy/app/hostel/mod/:mid",
  catchAsync(Role.destroyHostelAppModeratorQuery)
);

module.exports = router;
