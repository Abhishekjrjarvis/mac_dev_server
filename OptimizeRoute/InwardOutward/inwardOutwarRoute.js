const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../../middleware");
const catchAsync = require("../../Utilities/catchAsync");

const inwardOutwardController = require("../../OptimizeController/InwardOutward/inwardOutwardController");

router
  .route("/custom/institute/assign/model")
  .patch(
    catchAsync(
      inwardOutwardController.custom_institute_generate_inward_outward_query
    )
  );

router
  .route("/custom/staff/assign/model")
  .patch(
    catchAsync(
      inwardOutwardController.custom_staff_generate_inward_outward_query
    )
  );

router
  .route("/institute/:id/query")
  .get(catchAsync(inwardOutwardController.inoutward_detail_query));

router
  .route("/outward/add/:ioid/query")
  .post(catchAsync(inwardOutwardController.outward_creation_query));

router
  .route("/reveive/pending/:sid/query")
  .get(
    catchAsync(inwardOutwardController.staff_outward_recieve_pending_list_query)
  );
router
  .route("/reveive/approved/:sid/query")
  .get(
    catchAsync(
      inwardOutwardController.staff_outward_recieve_approved_list_query
    )
  );
router
  .route("/sent/pending/:sid/query")
  .get(
    catchAsync(inwardOutwardController.staff_outward_sent_pending_list_query)
  );
router
  .route("/sent/approved/:sid/query")
  .get(
    catchAsync(inwardOutwardController.staff_outward_sent_approved_list_query)
  );
router
  .route("/outward/:oid/approve/staff/:sid/query")
  .patch(catchAsync(inwardOutwardController.outward_apprve_by_staff_query));

router
  .route("/outward/:ioid/list/query")
  .get(catchAsync(inwardOutwardController.outward_list_query));
router
  .route("/inward/:ioid/list/query")
  .get(catchAsync(inwardOutwardController.inward_list_query));
router
  .route("/ready/to/publish/:ioid/query")
  .get(catchAsync(inwardOutwardController.ready_to_publish_list_query));

router
  .route("/one/inward/outward/:oid/detail/query")
  .get(catchAsync(inwardOutwardController.inward_outward_detail_query));
router
  .route("/outward/:oid/reject/staff/:sid/query")
  .patch(catchAsync(inwardOutwardController.outward_reject_by_staff_query));
router
  .route("/outward/update/:oid/query")
  .patch(catchAsync(inwardOutwardController.outward_update_query));
router
  .route("/outward/remove/:oid/query")
  .delete(catchAsync(inwardOutwardController.outward_remove_query));

router
  .route("/outward/approved/:ioid/list/query")
  .get(catchAsync(inwardOutwardController.outward_approved_list_query));
router
  .route("/inward/approved/:ioid/list/query")
  .get(catchAsync(inwardOutwardController.inward_approved_list_query));

module.exports = router;
