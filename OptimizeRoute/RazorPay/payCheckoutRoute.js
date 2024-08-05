const express = require("express");
const router = express.Router();
const Razor = require("../../OptimizeController/RazorPay/pay");
const { isLoggedIn } = require("../../middleware");

router.get(
  "/merchant/author/:id",
  // isLoggedIn,
  Razor.institute_merchant_replace
);

router.get("/get/keys", Razor.renderKeys);

router.post("/checkout", Razor.checkoutRazorPayment);

router.post("/verify", Razor.verifyRazorPayment);

router.get("/history/by", Razor.fetchPaymentHistoryQueryBy);

router.get("/history/to", Razor.fetchPaymentHistoryQueryTo);

router.get("/one/:pid", Razor.fetchPaymentOneHistory);

router.get("/other/history/to", Razor.fetchPaymentOtherHistoryQueryTo);


module.exports = router;
