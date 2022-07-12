const express = require("express");
const router = express.Router();
const checklist = require("../../controllers/Checklist/index");

router
  .route("/:cid")
  .get(checklist.getOneChecklist)
  .patch(checklist.updateChecklist);
router.route("/department/:did").post(checklist.createChecklist);
router.route("/:cid/assign-student/:sid").get(checklist.studentAssignChecklist);
router.route("/checklist-all/new").get(checklist.getAllChecklist);
router.route("/view/:did").get(checklist.viewDepartment);
module.exports = router;
