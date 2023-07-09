const express = require("express");
const router = express.Router();

const {
  generatePaytmTxnToken,
  paytmVerifyResponseStatus,
  // paytmVerifyAdmissionResponseStatus,
  // paytmVerifyHostelResponseStatus,
  // paytmVerifyBacklogResponseStatus,
  // paytmVerifyTransportResponseStatus,
  // paytmVerifyParticipateResponseStatus,
  // paytmVerifyDirectAdmissionResponseStatus,
} = require("../../controllers/Paytm/pay_upi");
const {
  generateApkPaytmTxnToken,
} = require("../../controllers/Paytm/apk_pay_upi");

// Internal Fees Payment
router.route("/generateTxnToken").post(generatePaytmTxnToken);
// router.route("/apk/generateTxnToken").post(generateApkPaytmTxnToken);
router
  .route(
    "/verify/internal/fee/:moduleId/paid/:paidBy/to/:paidTo/price/:amount_nocharges/device/:isApk/query/:name"
  )
  .post(paytmVerifyResponseStatus);

// Admission Fees Payment
// router
//   .route(
//     "/verify/admission/fee/:moduleId/paid/:paidBy/to/:paidTo/price/:amount_nocharges/device/:isApk/install/:payment_installment/remain/:payment_remain_1/query/:name/card/:payment_card_type/status/:ad_status_id"
//   )
//   .post(paytmVerifyAdmissionResponseStatus);

// // Hostel Fees Payment
// router
//   .route(
//     "/verify/hostel/fee/:moduleId/paid/:paidBy/to/:paidTo/price/:amount_nocharges/device/:isApk/install/:payment_installment/status/:ad_status_id/query/:name"
//   )
//   .post(paytmVerifyHostelResponseStatus);

// // Backlog Fees Payment
// router
//   .route(
//     "/verify/backlog/fee/:moduleId/paid/:paidBy/to/:paidTo/price/:amount_nocharges/device/:isApk/query/:name"
//   )
//   .post(paytmVerifyBacklogResponseStatus);

// // Transport Fees Payment
// router
//   .route(
//     "/verify/transport/fee/:moduleId/paid/:paidBy/to/:paidTo/price/:amount_nocharges/device/:isApk/query/:name"
//   )
//   .post(paytmVerifyTransportResponseStatus);

// // Participate Fees Payment
// router
//   .route(
//     "/verify/participate/fee/:moduleId/paid/:paidBy/to/:paidTo/price/:amount_nocharges/device/:isApk/status/:ad_status_id/query/:name"
//   )
//   .post(paytmVerifyParticipateResponseStatus);

// Direct Hostel Fees Payment
// router
//   .route("/verify/direct/hostel/fee/:moduleId/paid/:paidBy/query/:name")
//   .post(paytmVerifyDirectHostelResponseStatus);

// // Direct Admission Fees Payment
// router
//   .route("/verify/direct/admission/fee/:moduleId/paid/:paidBy/query/:name")
//   .post(paytmVerifyDirectAdmissionResponseStatus);

module.exports = router;
