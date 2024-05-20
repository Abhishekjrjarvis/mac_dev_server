const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../../middleware");
const siteController = require("../../controllers/Site/siteController");
const catchAsync = require("../../Utilities/catchAsync");
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
  .patch(isLoggedIn, siteController.updateInstituteSiteOpeners)
  .delete(isLoggedIn, siteController.trashInstituteSiteOpeners);

router
  .route("/info/transport/:tid")
  .get(siteController.getTransportInfo)
  .patch(isLoggedIn, siteController.updateTransportInfo);

router.patch("/:dsid/one/department/site/extra/docs/query", catchAsync(siteController.render_one_department_extra_docs_query));

router.patch("/:dsid/one/department/site/syllabus/projects/query", catchAsync(siteController.render_one_department_syllabus_projects_query));

router.patch("/:dsid/one/department/site/pso/query", catchAsync(siteController.render_one_department_pso_query));

router.patch("/:dsid/edit/one/department/site/extra/docs/query", catchAsync(siteController.render_one_department_edit_extra_docs_query));

router.patch("/:dsid/edit/one/department/site/syllabus/projects/query", catchAsync(siteController.render_one_department_edit_syllabus_projects_query));

router.patch("/:dsid/edit/one/department/site/pso/query", catchAsync(siteController.render_one_department_edit_pso_query));

router.delete("/:dsid/delete/one/department/site/extra/docs/query", catchAsync(siteController.render_one_department_delete_extra_docs_query));

router.delete("/:dsid/delete/one/department/site/syllabus/projects/query", catchAsync(siteController.render_one_department_delete_syllabus_projects_query));

router.delete("/:dsid/delete/one/department/site/pso/query", catchAsync(siteController.render_one_department_delete_pso_query));

router.patch("/:dsid/about/one/department/site/query", catchAsync(siteController.render_edit_academic_sub_head_query));


// MOU / Collab
router.patch("/:did/add/mou/collab/query", catchAsync(siteController.render_add_mou_collab_query));

router.patch("/:did/edit/mou/collab/query", catchAsync(siteController.render_edit_mou_collab_query));

router.delete("/:did/delete/mou/collab/query", catchAsync(siteController.render_delete_mou_collab_query));

router.get("/:did/all/mou/collab/query", catchAsync(siteController.render_all_mou_query));

router.get("/:did/all/universal/batch/query", catchAsync(siteController.render_all_universal_batch_query));

// Activity
router.patch("/:did/add/activity/query", catchAsync(siteController.render_add_activity_query));

router.patch("/:did/edit/activity/query", catchAsync(siteController.render_edit_activity_query));

router.delete("/:did/delete/activity/query", catchAsync(siteController.render_delete_activity_query));

router.get("/:did/all/activity/query", catchAsync(siteController.render_all_activity_query));



module.exports = router;
