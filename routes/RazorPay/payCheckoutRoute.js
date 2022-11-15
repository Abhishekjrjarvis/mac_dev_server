const express = require("express");
const router = express.Router();
const Razor = require("../../controllers/RazorPay/pay");

router.get("/get/keys", Razor.renderKeys);

router.post("/checkout", Razor.checkoutRazorPayment);

router.post("/verify", Razor.verifyRazorPayment);

router.get("/history", Razor.fetchPaymentHistoryQuery);

module.exports = router;
