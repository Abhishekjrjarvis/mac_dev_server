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
} = require("../../controllers/Paytm/pay_upi");

router.route("/generateTxnToken").post(initiate);
router
  .route(
    "/callback/internal/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price"
  )
  .post(callback);

router
  .route(
    "/callback/admission/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price/fees/:payment_card_id/install/:payment_installment/remain/:payment_remain_1/card/:payment_card_type/status/:ad_status_id"
  )
  .post(callbackAdmission);

router
  .route(
    "/callback/hostel/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/price/:price/fees/install/:payment_installment/remain/:payment_remain_1/status/:ad_status_id"
  )
  .post(callbackHostel);

router.route("/status/success/internal/query").post(callbackStatus);

router.route("/status/success/admission/query").post(callbackAdmissionStatus);

router.route("/status/success/hostel/query").post(callbackHostelStatus);

module.exports = router;
