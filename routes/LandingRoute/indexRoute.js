const express = require("express");
const router = express.Router();
const Landing = require("../../controllers/LandingPage/index");
const catchAsync = require("../../Utilities/catchAsync");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Get Touch
router.post("/get-touch", catchAsync(Landing.uploadGetTouchDetail));

// Career
router.post(
  "/career-detail",
  upload.single("file"),
  catchAsync(Landing.uploadUserCareerDetail)
);

router.post(
  "/ins/:id/activate",
  catchAsync(Landing.renderActivateLandingCareerQuery)
);

router.get(
  "/one/career/:lcid",
  catchAsync(Landing.renderOneLandingCareerQuery)
);

router.post(
  "/one/career/:lcid/new/vacancy",
  catchAsync(Landing.renderCareerNewVacancyQuery)
);

router.get(
  "/one/career/:lcid/all/vacancy",
  catchAsync(Landing.renderAllLandingCareerVacancyQuery)
);

router.patch(
  "/one/vacancy/:vid/status",
  catchAsync(Landing.renderOneVacancyStatusQuery)
);

router.patch(
  "/one/vacancy/:vid/apply",
  catchAsync(Landing.renderOneVacancyApplyQuery)
);

router.get(
  "/one/vacancy/:vid/query",
  catchAsync(Landing.renderOneVacancyQuery)
);

router.get(
  "/one/vacancy/:vid/all/applications",
  catchAsync(Landing.renderOneVacancyAllApplicationsQuery)
);

router.patch(
  "/one/app/schedule/:acid",
  catchAsync(Landing.renderOneVacancyOneApplicationScheduleQuery)
);

router.delete(
  "/one/vacancy/:vid/destroy",
  catchAsync(Landing.renderOneVacancyDestroyQuery)
);

router.post(
  "/ins/:id/activate/tender",
  catchAsync(Landing.renderActivateLandingTenderQuery)
);

router.get(
  "/one/landing/tender/:ltid",
  catchAsync(Landing.renderOneLandingTenderQuery)
);

router.post("/one/:ltid/new/tender", catchAsync(Landing.renderTenderNewQuery));

router.get("/one/:ltid/all/tender", catchAsync(Landing.renderAllTenderQuery));

router.patch(
  "/one/tender/:tid/status",
  catchAsync(Landing.renderOneTenderStatusQuery)
);

router.patch(
  "/one/tender/:tid/apply/bid",
  catchAsync(Landing.renderOneTenderBidQuery)
);

router.get("/one/tender/:tid/query", catchAsync(Landing.renderOneTenderQuery));

router.get(
  "/one/tender/:tid/all/bidder",
  catchAsync(Landing.renderOneTenderAllBidderQuery)
);

router.patch(
  "/one/tender/:tid/bid/offer/:bid",
  catchAsync(Landing.renderOneTenderOneBidderOfferQuery)
);

router.delete(
  "/one/tender/:tid/destroy",
  catchAsync(Landing.renderOneTenderDestroyQuery)
);

router.patch("/:id/website/looks", catchAsync(Landing.rendeUpdateWebLooks));

router.patch(
  "/:id/website/active/tabs",
  catchAsync(Landing.rendeUpdateWebTabs)
);

router.patch(
  "/:id/website/contacts",
  catchAsync(Landing.rendeUpdateWebContacts)
);

router.get("/:id/one/web/profile", catchAsync(Landing.renderOneWebProfile));

router.get(
  "/:aid/academic/section/query",
  catchAsync(Landing.renderAcademicSectionQuery)
);

router.post(
  "/:id/new/academic/section/query",
  catchAsync(Landing.renderNewAcademicSectionQuery)
);

router.patch(
  "/:aid/exist/academic/section/query",
  catchAsync(Landing.renderExistAcademicSectionQuery)
);

router.get("/:nid/nss/query", catchAsync(Landing.renderNSSQuery));

router.post("/:id/new/nss/query", catchAsync(Landing.renderNewNSSQuery));

router.get("/:fid/facilities/query", catchAsync(Landing.renderFacilitiesQuery));

router.post("/:id/new/facilities/query", catchAsync(Landing.renderNewFacilitiesQuery));

router.patch("/:fid/edit/facilities/query", catchAsync(Landing.renderEditFacilitiesQuery));

router.post("/:id/testimonials/query", catchAsync(Landing.render_testimonials_query));

router.post("/:id/home/opener/query", catchAsync(Landing.render_home_opener_query));

router.patch("/:id/one/:tid/testimonials/query", catchAsync(Landing.render_one_testimonials_query));

module.exports = router;
