const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../../middleware");
const siteController = require("../../controllers/Site/siteController");
router
  .route("/info/department/:did")
  .get(siteController.getDepartmentInfo)
  .patch(isLoggedIn, siteController.updateDepartmentInfo);
router
  .route("/info/admission/:aid")
  .get(siteController.getAdmissionInfo)
  .patch(isLoggedIn, siteController.updateAdmissonInfo);
router
  .route("/info/library/:lid")
  .get(siteController.getLibraryInfo)
  .patch(isLoggedIn, siteController.updateLibraryInfo);

router
  .route("/info/hostel/:hid")
  .get(siteController.getHostelInfo)
  .patch(isLoggedIn, siteController.updateHostelInfo);

router
  .route("/institute/:id/opener")
  .get(siteController.getInstituteSiteOpeners)
  .patch(isLoggedIn, siteController.updateInstituteSiteOpeners);

module.exports = router;
