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
  callbackLibrary,
  callbackLibraryStatus,
} = require("../../OptimizeController/Paytm/pay_upi");

router.route("/generateTxnToken").post(initiate);
router
  .route(
    "/callback/internal/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price"
  )
  .post(callback);

router
  .route(
    "/callback/admission/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price/fees/:payment_card_id/install/:payment_installment/status/:ad_status_id"
  )
  .post(callbackAdmission);

router
  .route(
    "/callback/hostel/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price/fees/install/:payment_installment/remain/:payment_remain_1/status/:ad_status_id"
  )
  .post(callbackHostel);

router
  .route(
    "/callback/library/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price/book/:payment_book_id"
  )
  .post(callbackLibrary);

router.route("/status/success/internal/query").post(callbackStatus);

router.route("/status/success/admission/query").post(callbackAdmissionStatus);

router.route("/status/success/hostel/query").post(callbackHostelStatus);

router.route("/status/success/library/query").post(callbackLibraryStatus);

router.route("/status/success/transport/query").post(callbackTransportStatus);

module.exports = router;
