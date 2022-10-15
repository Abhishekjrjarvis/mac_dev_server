const express = require("express");
const router = express.Router();
const classController = require("../../controllers/Class/index");

router
  .route("/:cid")
  .get(classController.getOneClass)
  .patch(classController.classRefreshCode);
router.route("/institute/:id").get(classController.getOneInstitute);
router.route("/setting/:cid").patch(classController.classStartDate);
router.route("/setting/:cid/report").patch(classController.classReportSetting);

// router.route("/checklist/:cid").post(classController.createClassChecklist);
module.exports = router;
