const express = require("express");
const router = express.Router();
const instituteMember = require("../../controllers/Edit/instituteMember");
const catchAsync = require("../../Utilities/catchAsync");
// const { isLoggedIn } = require("../../middleware");

router
  .route("/department/:did")
  .get(catchAsync(instituteMember.departmentDetail))
  .patch(catchAsync(instituteMember.departmentEdit))
  .delete(catchAsync(instituteMember.departmentDelete));

router
  .route("/batch/:bid")
  .patch(catchAsync(instituteMember.batchEdit))
  .delete(catchAsync(instituteMember.batchDelete));

router
  .route("/classmaster/:cmid")
  .delete(catchAsync(instituteMember.classMasterDelete));

router
  .route("/class/:cid")
  .get(catchAsync(instituteMember.classDetail))
  .patch(catchAsync(instituteMember.classEdit))
  .delete(catchAsync(instituteMember.classDelete));

router
  .route("/subjectmaster/:smid")
  .delete(catchAsync(instituteMember.subjectMasterDelete));

router
  .route("/subject/:sid")
  .get(catchAsync(instituteMember.subjectDetail))
  .patch(catchAsync(instituteMember.subjectEdit))
  .delete(catchAsync(instituteMember.subjectDelete));

module.exports = router;
