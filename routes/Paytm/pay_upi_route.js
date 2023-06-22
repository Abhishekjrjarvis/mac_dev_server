const express = require("express");
const router = express.Router();

// getPaymentStatus,
const {
  generatePaytmTxnToken,
  paytmVerifyResponseStatus,
} = require("../../controllers/Paytm/pay_upi");

// router.route("/payment/status/:id").get(getPaymentStatus);

router.route("/generateTxnToken").post(generatePaytmTxnToken);
router
  .route("/verify/internal/fee/:moduleId/paid/:paidBy/query/:name")
  .post(paytmVerifyResponseStatus);

module.exports = router;
