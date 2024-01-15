const express = require("express");
const router = express.Router();
const instituteMember = require("../../OptimizeController/Edit/instituteMember");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router
  .route("/department")
  .patch(isLoggedIn, catchAsync(instituteMember.departmentEdit))
  .delete(isLoggedIn, catchAsync(instituteMember.departmentDelete));

router
  .route("/batch")
  .patch(isLoggedIn, catchAsync(instituteMember.batchEdit))
  .delete(isLoggedIn, catchAsync(instituteMember.batchDelete));

router
  .route("/classmaster")
  .patch(isLoggedIn, catchAsync(instituteMember.classMasterEdit));

router
  .route("/class")
  .patch(isLoggedIn, catchAsync(instituteMember.classEdit))
  .delete(isLoggedIn, catchAsync(instituteMember.classDelete));

router
  .route("/subjectmaster")
  .patch(isLoggedIn, catchAsync(instituteMember.subjectMasterEdit));

router
  .route("/subject")
  .patch(isLoggedIn, catchAsync(instituteMember.subjectEdit))
  .delete(isLoggedIn, catchAsync(instituteMember.subjectDelete));

module.exports = router;
