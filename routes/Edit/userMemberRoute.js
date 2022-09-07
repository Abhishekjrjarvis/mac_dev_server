const express = require("express");
const router = express.Router();
const instituteMember = require("../../controllers/Edit/instituteMember");
const catchAsync = require("../../Utilities/catchAsync");
// const { isLoggedIn } = require("../../middleware");

router
  .route("/department")
  .patch(catchAsync(instituteMember.departmentEdit))
  .delete(catchAsync(instituteMember.departmentDelete));

router
  .route("/batch")
  .patch(catchAsync(instituteMember.batchEdit))
  .delete(catchAsync(instituteMember.batchDelete));

router.route("/classmaster").patch(catchAsync(instituteMember.classMasterEdit));

router
  .route("/class")
  .patch(catchAsync(instituteMember.classEdit))
  .delete(catchAsync(instituteMember.classDelete));

router
  .route("/subjectmaster")
  .patch(catchAsync(instituteMember.subjectMasterEdit));

router
  .route("/subject")
  .patch(catchAsync(instituteMember.subjectEdit))
  .delete(catchAsync(instituteMember.subjectDelete));

module.exports = router;
