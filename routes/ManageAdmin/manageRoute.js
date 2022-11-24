const express = require("express");
const router = express.Router();
const Manage = require("../../controllers/ManageAdmin/manageController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/new",
  upload.single("file"),
  catchAsync(Manage.renderAdministrator)
);

router.get("/:mid/query", catchAsync(Manage.renderAdministratorQuery));

// router.patch("/follow", isLoggedIn, catchAsync(HashTag.followHashtag));

// router.get("/all/array", catchAsync(HashTag.arrayHashtag));

// router.patch(
//   "/:hid/update",
//   upload.single("file"),
//   catchAsync(HashTag.updateHashtag)
// );

module.exports = router;
