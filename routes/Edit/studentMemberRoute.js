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

router
  .route("/subject/:sid/list/query")
  // isLoggedIn,
  .get(catchAsync(studentMember.getStudentSubjectQuery));

router
  .route("/subject/:sid/catalog/add/remove/query")
  // isLoggedIn,
  .patch(catchAsync(studentMember.subjectStudentAddCatalogQuery))
  .delete(catchAsync(studentMember.subjectStudentRemoveCatalogQuery));

router
  .route("/subject/master/:sid/allottment/profile/query")
  .patch(catchAsync(studentMember.studentSubjectMasterEditQuery));
router
  .route("/:sid/all/subject/master")
  .get(catchAsync(studentMember.studentAllSubjectMasterQuery));

router
  .route("/manually/push/in/subject")
  .patch(catchAsync(studentMember.studentSubjectMasterPushDataQuery));
router
  .route("/manually/pull/from/subject")
  .patch(catchAsync(studentMember.studentSubjectMasterPullDataQuery));
module.exports = router;
