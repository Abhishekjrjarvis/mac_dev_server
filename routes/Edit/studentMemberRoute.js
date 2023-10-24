const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const studentMember = require("../../controllers/Edit/studentMember");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router
  .route("/form/photo/:sid")
  .patch(
    upload.single("file"),
    isLoggedIn,
    catchAsync(studentMember.photoEditByStudent)
  );

router
  .route("/form/detail/:sid")
  .patch(catchAsync(studentMember.formEditByClassTeacher));

router
  .route("/remove/:sid")
  .patch(isLoggedIn, catchAsync(studentMember.removeByClassTeacher));

router
  .route("/:sid/previous")
  .get(isLoggedIn, catchAsync(studentMember.getAllPreviousYear));
router.route("/:pid/previous/report").get(
  // isLoggedIn,
  catchAsync(studentMember.previousYearReportCard)
);

router
  .route("/promote/:id/institute/detail")
  .get(isLoggedIn, catchAsync(studentMember.instituteDepartmentOtherCount));

router
  .route("/promote/department/:did/detail")
  .get(isLoggedIn, catchAsync(studentMember.getOneDepartmentOfPromote));

router
  .route("/promote/class/:cid/student/list")
  .get(catchAsync(studentMember.getPromoteStudentByClass));

router
  .route("/promote/remain/class/:cid/student")
  .get(isLoggedIn, catchAsync(studentMember.getNotPromoteStudentByClass));

router
  .route("/exam/moderator/count/:did")
  .get(catchAsync(studentMember.renderAllExamCountQuery));

router
  .route("/user/login/query")
  .patch(catchAsync(studentMember.renderStudentUserLoginQuery));

  router
  .route("/list/query")
  .get(catchAsync(studentMember.getPromoteStudentByClassQuery));

module.exports = router;
