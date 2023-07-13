const express = require("express");
const router = express.Router();

const { initiate, callback } = require("../../controllers/Paytm/pay_upi");

router.route("/generateTxnToken").post(initiate);
router
  .route(
    "/callback/internal/:moduleId/paidBy/:paidBy/redirect/:name/paidTo/:paidTo/device/:isApk"
  )
  .post(callback);

module.exports = router;
