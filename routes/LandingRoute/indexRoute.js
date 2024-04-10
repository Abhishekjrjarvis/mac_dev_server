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

router.patch("/:id/one/:hid/home/opener/query", catchAsync(Landing.render_one_home_opener_query));

router.patch("/:id/one/:tid/testimonials/query", catchAsync(Landing.render_one_testimonials_query));

router.post("/:id/iso/certificate/query", catchAsync(Landing.render_new_iso_query));

router.patch("/:lcid/toggle/query", catchAsync(Landing.render_Landing_Control_query));

router.patch("/:id/all/gallery/post", catchAsync(Landing.render_all_gallery_post_query));

router.post("/:lcid/founder/desk/post", catchAsync(Landing.render_founder_desk_post_query));

router.post("/:lcid/accreditation/desk/post", catchAsync(Landing.render_accreditation_desk_post_query));

router.post("/:lcid/gallery/desk/post", catchAsync(Landing.render_gallery_desk_post_query));

router.get("/:lcid/all/gallery/desk/query", catchAsync(Landing.render_all_gallery_desk_post_query));

router.patch("/:lcid/affiliation/post", catchAsync(Landing.render_affiliation_desk_post_query));

router.patch("/:lcid/about/society/post", catchAsync(Landing.render_society_desk_post_query));

router.get("/:id/all/pinned/department/query", catchAsync(Landing.render_pinned_department_query));

router.post("/:lcid/new/academic/head/query", catchAsync(Landing.render_new_academic_head_query));

router.post("/:acid/sub/head/academic/query", catchAsync(Landing.render_new_academic_sub_head_query));

router.patch("/:anid/nested/sub/head/academic/query", catchAsync(Landing.render_edit_academic_sub_head_query));

router.patch("/enable/data", catchAsync(Landing.render_enable_data_query));


// Header Object
router.patch("/:lcid/header/object/query", catchAsync(Landing.render_home_header_object_query));

// Header Background Object
router.patch("/:lcid/header/background/object/query", catchAsync(Landing.render_home_background_object_query));

// Header About Us Institute
router.patch("/:lcid/header/home/about/object/query", catchAsync(Landing.render_home_about_object_query));

// Header Quick Links + Home Opener
router.patch("/:lcid/header/home/quick/opener/object/query", catchAsync(Landing.render_home_quick_opener_object_query));

// Header Footer Links
router.patch("/:lcid/footer/object/query", catchAsync(Landing.render_home_footer_object_query));

// Header Accreditation
router.post("/:lcid/header/accreditation/object/query", catchAsync(Landing.render_home_accreditation_object_query));

// Header Accreditation Nested
router.patch("/:lcid/header/accreditation/:acid/nested/object/query", catchAsync(Landing.render_home_accreditation_nested_object_query));

// About Us Institute
router.patch("/:lcid/about/institute/object/query", catchAsync(Landing.render_about_institute_object_query));

// About Us Institute Administration
router.patch("/:lcid/about/institute/administration/object/query", catchAsync(Landing.render_about_institute_administration_object_query));

module.exports = router;
