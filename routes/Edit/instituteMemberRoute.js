const express = require("express");
const router = express.Router();
const instituteMember = require("../../controllers/Edit/instituteMember");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn } = require("../../middleware");

router
  .route("/department/:did")
  .get(isLoggedIn, catchAsync(instituteMember.departmentDetail))
  .patch(isLoggedIn, catchAsync(instituteMember.departmentEdit))
  .delete(isLoggedIn, catchAsync(instituteMember.departmentDelete));

router
  .route("/batch/:bid")
  .patch(isLoggedIn, catchAsync(instituteMember.batchEdit))
  .delete(isLoggedIn, catchAsync(instituteMember.batchDelete));

router
  .route("/classmaster/:cmid")
  .delete(isLoggedIn, catchAsync(instituteMember.classMasterDelete));

router
  .route("/class/:cid")
  .get(isLoggedIn, catchAsync(instituteMember.classDetail))
  .patch(isLoggedIn, catchAsync(instituteMember.classEdit))
  .delete(catchAsync(instituteMember.classDelete));

router
  .route("/subjectmaster/:smid")
  .delete(isLoggedIn, catchAsync(instituteMember.subjectMasterDelete));

router
  .route("/subject/:sid")
  .get(isLoggedIn, catchAsync(instituteMember.subjectDetail))
  .patch(isLoggedIn, catchAsync(instituteMember.subjectEdit))
  .delete(isLoggedIn, catchAsync(instituteMember.subjectDelete));

router
  .route("/hostel/batch/:bid")
  .delete(catchAsync(instituteMember.renderHostelbatchDelete));

module.exports = router;
