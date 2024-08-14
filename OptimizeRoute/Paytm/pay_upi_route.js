const express = require("express");
const router = express.Router();

const {
  initiate,
  callback,
  callbackAdmission,
  callbackStatus,
  callbackAdmissionStatus,
  callbackHostel,
  callbackHostelStatus,
  callbackTransportStatus,
  callbackCertificate,
  callbackCertificateStatus,
  callbackOtherFees,
  callbackOtherFeesStatus,
  validatePaymentStatus
  // callbackLibrary,
  // callbackLibraryStatus,
} = require("../../OptimizeController/Paytm/pay_upi");

router.route("/generateTxnToken").post(initiate);
router
  .route(
    "/callback/internal/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price"
  )
  .post(callback);

router
  .route(
    "/callback/admission/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price/fees/:payment_card_id/install/:payment_installment/remain/:payment_remain_fees/status/:ad_status_id/epid/:eid"
  )
  .post(callbackAdmission);

router
  .route(
    "/callback/hostel/:moduleId/paidby/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price/fees/:payment_card_id/install/:payment_installment/remain/:payment_remain_fees/status/:ad_status_id"
  )
  .post(callbackHostel);

router
  .route(
    "/callback/certificate/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price/type/:cert_type/content/:cert_content/original/:is_original"
  )
  .post(callbackCertificate);

  router
  .route(
    "/callback/other/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price"
  )
  .post(callbackOtherFees);

// router
//   .route(
//     "/callback/library/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price/book/:payment_book_id"
//   )
//   .post(callbackLibrary);

router.route("/status/success/internal/query").post(callbackStatus);

router.route("/status/success/admission/query").post(callbackAdmissionStatus);

router.route("/status/success/hostel/query").post(callbackHostelStatus);

router.route("/status/success/certificate/query").post(callbackCertificateStatus);

// router.route("/status/success/library/query").post(callbackLibraryStatus);

router.route("/status/success/transport/query").post(callbackTransportStatus);

router.route("/status/success/other/fees/query").post(callbackOtherFeesStatus);

router.route("/check/status").patch(validatePaymentStatus)

module.exports = router;
