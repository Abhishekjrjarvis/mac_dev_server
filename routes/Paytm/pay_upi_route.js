const express = require("express");
const router = express.Router();

const {
  initiate,
  callback,
  callbackAdmission,
} = require("../../controllers/Paytm/pay_upi");

router.route("/generateTxnToken").post(initiate);
router
  .route(
    "/callback/internal/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk"
  )
  .post(callback);

router
  .route(
    "/callback/admission/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk/fees/:payment_card_id/install/:payment_installment/remain/:payment_remain_1/card/:payment_card_type/status/:ad_status_id"
  )
  .post(callbackAdmission);

module.exports = router;
