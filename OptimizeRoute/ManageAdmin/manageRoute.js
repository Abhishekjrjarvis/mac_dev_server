const express = require("express");
const router = express.Router();
const Manage = require("../../OptimizeController/ManageAdmin/manageController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isLimit } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/new",
  upload.single("file"),
  catchAsync(Manage.renderAdministrator)
);

router.post(
  "/new/password/:mid",
  catchAsync(Manage.renderAdministratorPassword)
);

router.post(
  "/login",
  isLimit,
  catchAsync(Manage.renderAdministratorAuthentication)
);

router.get(
  "/:mid/query",
  isLoggedIn,
  catchAsync(Manage.renderAdministratorQuery)
);
// Send Notify
router.post(
  "/:mid/add",
  isLoggedIn,
  catchAsync(Manage.renderAdministratorAddInstitute)
);

router.post(
  "/:mid/status",
  isLoggedIn,
  catchAsync(Manage.renderAdministratorStatus)
);

router.get(
  "/:mid/all/ins/query",
  isLoggedIn,
  catchAsync(Manage.renderAdministratorAllInsQuery)
);

router.get(
  "/:mid/all/request",
  isLoggedIn,
  catchAsync(Manage.renderAdministratorAllRequest)
);

router.get(
  "/:mid/finance",
  isLoggedIn,
  catchAsync(Manage.renderAdministratorAllFinance)
);

router.get(
  "/:mid/admission",
  isLoggedIn,
  catchAsync(Manage.renderAdministratorAllAdmission)
);

router.get("/all", catchAsync(Manage.renderAdministratorAllManageAdmin));

router.get("/all/user", catchAsync(Manage.renderAdministratorAllUser));

router.get(
  "/one/institute/:id",
  catchAsync(Manage.renderAdministratorOneInstituteProfile)
);

router.get(
  "/:mid/all/mentors",
  catchAsync(Manage.renderAdministratorAllMentorsArray)
);

router.get(
  "/:mid/all/students",
  catchAsync(Manage.renderAdministratorAllStudentsArray)
);

router.patch(
  "/:mid/personal/query",
  catchAsync(Manage.renderAdministratorPersonalQuery)
);

module.exports = router;
