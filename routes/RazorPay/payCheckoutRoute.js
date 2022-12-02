const express = require("express");
const router = express.Router();
const Razor = require("../../controllers/RazorPay/pay");

router.get("/get/keys", Razor.renderKeys);

router.post("/checkout", Razor.checkoutRazorPayment);

router.post("/verify", Razor.verifyRazorPayment);

router.get("/history/by", Razor.fetchPaymentHistoryQueryBy);

router.get("/history/to", Razor.fetchPaymentHistoryQueryTo);

router.get("/one/:pid", Razor.fetchPaymentOneHistory);

module.exports = router;
