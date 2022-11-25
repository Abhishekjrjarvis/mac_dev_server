const express = require("express");
const router = express.Router();
const Manage = require("../../controllers/ManageAdmin/manageController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isLimit } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/new",
  upload.single("file"),
  catchAsync(Manage.renderAdministrator)
);

router.post("/new/password", catchAsync(Manage.renderAdministratorPassword));

router.post(
  "/login",
  isLimit,
  catchAsync(Manage.renderAdministratorAuthentication)
);

router.get("/:mid/query", catchAsync(Manage.renderAdministratorQuery));
// Send Notify
router.post("/:mid/add", catchAsync(Manage.renderAdministratorAddInstitute));

router.post("/:mid/status", catchAsync(Manage.renderAdministratorStatus));

router.get(
  "/:mid/all/ins/query",
  catchAsync(Manage.renderAdministratorAllInsQuery)
);

module.exports = router;
