const Razorpay = require("Razorpay");
var crypto = require("crypto");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const axios = require("axios");
const {
  unlockInstituteFunction,
  feeInstituteFunction,
  admissionInstituteFunction,
} = require("./paymentModule");

var instance = new Razorpay({
  key_id: process.env.RAZOR_KEY_ID,
  key_secret: process.env.RAZOR_KEY_SECRET,
});

exports.renderKeys = async (req, res) => {
  try {
    res.status(200).send({
      message: "Key Id 😀",
      Key: process.env.RAZOR_KEY_ID,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.checkoutRazorPayment = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount),
      currency: "INR",
    };
    const order = await instance.orders.create(options);
    res
      .status(200)
      .send({ message: "Success order id 😀", success: true, order: order });
  } catch (e) {
    console.log(e);
  }
};

exports.verifyRazorPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const {
      payment_module_type,
      payment_by_end_user_id,
      payment_to_end_user_id,
      payment_module_id,
      payment_amount,
      ad_status_id,
    } = req.query;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    var expectedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    const is_authenticated = expectedSignature === razorpay_signature;

    if (is_authenticated) {
      var order_payment = new OrderPayment({ ...req.body });
      order_payment.payment_module_type = payment_module_type;
      order_payment.payment_by_end_user_id = payment_by_end_user_id;
      order_payment.payment_to_end_user_id = payment_to_end_user_id;
      order_payment.payment_module_id = payment_module_id;
      order_payment.payment_amount = payment_amount;
      order_payment.payment_status = "Captured";
      await order_payment.save();
      if (payment_module_type === "Unlock") {
        const unlock_status = await unlockInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          payment_amount
        );
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${unlock_status}/feed`
        );
      } else if (payment_module_type === "Fees") {
        const fee_status = await feeInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          payment_amount,
          payment_module_id
        );
        res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${fee_status}/feed`);
      } else if (payment_module_type === "Admission") {
        const admission_status = await admissionInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          payment_amount,
          payment_module_id,
          ad_status_id
        );
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${admission_status}/feed`
        );
      } else {
      }
    } else {
      console.log(false);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchPaymentHistoryQuery = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.query;
    const skip = (page - 1) * limit;
    const order = await OrderPayment.find({ payment_by_end_user_id: uid })
      .sort("-created_at")
      .limit(limit)
      .skip(skip)
      .select(
        "razorpay_order_id payment_module_type payment_amount payment_status created_at"
      );

    if (order?.length > 0) {
      res.status(200).send({ message: "User Pay History", history: order });
    }
  } catch (e) {
    console.log(e);
  }
};
