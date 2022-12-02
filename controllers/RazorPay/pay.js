const Razorpay = require("razorpay");
var crypto = require("crypto");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const axios = require("axios");
const Admin = require("../../models/superAdmin");
const {
  unlockInstituteFunction,
  feeInstituteFunction,
  admissionInstituteFunction,
  participateEventFunction,
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
      amount: Number(req.body.amount * 100),
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
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const {
      payment_module_type,
      payment_by_end_user_id,
      payment_to_end_user_id,
      payment_module_id,
      payment_amount,
      ad_status_id,
      isApk,
    } = req.query;
    var refactor_amount = parseInt(payment_amount) / 100;
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
      order_payment.payment_flag_by = "Debit";
      order_payment.payment_flag_to = "Credit";
      order_payment.payment_module_id = payment_module_id;
      order_payment.payment_amount = refactor_amount;
      order_payment.payment_status = "Captured";
      s_admin.invoice_count += 1;
      order_payment.payment_invoice_number = s_admin.invoice_count;
      await Promise.all([order_payment.save(), s_admin.save()]);
      if (payment_module_type === "Unlock") {
        const unlock_status = await unlockInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount
        );
        if (isApk) {
          res
            .status(200)
            .send({ message: "Success with Razorpay unlock 😀", check: true });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${unlock_status}/feed`
        );
      } else if (payment_module_type === "Fees") {
        const fee_status = await feeInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount,
          payment_module_id
        );
        if (isApk) {
          res
            .status(200)
            .send({ message: "Success with Razorpay Fees 😀", check: true });
        }
        res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${fee_status}/feed`);
      } else if (payment_module_type === "Admission") {
        const admission_status = await admissionInstituteFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount,
          payment_module_id,
          ad_status_id
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Admission 😀",
            check: true,
          });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${admission_status}/feed`
        );
      } else if (payment_module_type === "Participate") {
        const participate_status = await participateEventFunction(
          order_payment?._id,
          payment_by_end_user_id,
          refactor_amount,
          payment_module_id,
          ad_status_id
        );
        if (isApk) {
          res.status(200).send({
            message: "Success with Razorpay Participate 😀",
            check: true,
          });
        }
        res.redirect(
          `${process.env.FRONT_REDIRECT_URL}/q/${participate_status}/feed`
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

exports.fetchPaymentHistoryQueryBy = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.query;
    const skip = (page - 1) * limit;
    const { filter } = req.query;
    if (filter) {
      const order = await OrderPayment.find({
        $and: [{ payment_by_end_user_id: uid }, { payment_module_id: filter }],
      })
        .sort("-created_at")
        .limit(limit)
        .skip(skip)
        .select(
          "razorpay_order_id payment_module_type payment_module_id payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
        )
        .populate({
          path: "payment_fee",
          select: "feeName",
        })
        .populate({
          path: "payment_admission",
          select: "applicationName",
        })
        .populate({
          path: "payment_checklist",
          select: "checklistName",
        })
        .populate({
          path: "payment_income",
          select: "incomeDesc",
        })
        .populate({
          path: "payment_expense",
          select: "expenseDesc",
        })
        .populate({
          path: "payment_by_end_user_id",
          select: "userLegalName photoId profilePhoto",
        })
        .populate({
          path: "payment_to_end_user_id",
          select: "insName photoId insProfilePhoto",
        });
    } else {
      const order = await OrderPayment.find({ payment_by_end_user_id: uid })
        .sort("-created_at")
        .limit(limit)
        .skip(skip)
        .select(
          "razorpay_order_id payment_module_type payment_module_id payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
        )
        .populate({
          path: "payment_fee",
          select: "feeName",
        })
        .populate({
          path: "payment_admission",
          select: "applicationName",
        })
        .populate({
          path: "payment_checklist",
          select: "checklistName",
        })
        .populate({
          path: "payment_income",
          select: "incomeDesc",
        })
        .populate({
          path: "payment_expense",
          select: "expenseDesc",
        })
        .populate({
          path: "payment_by_end_user_id",
          select: "userLegalName photoId profilePhoto",
        })
        .populate({
          path: "payment_to_end_user_id",
          select: "insName photoId insProfilePhoto",
        });
    }
    if (order?.length > 0) {
      res.status(200).send({ message: "User Pay History", history: order });
    } else {
      res.status(200).send({ message: "No User Pay History", history: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchPaymentHistoryQueryTo = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.query;
    const skip = (page - 1) * limit;
    const { filter } = req.query;
    if (filter) {
      var order = await OrderPayment.find({
        $and: [{ payment_to_end_user_id: uid }, { payment_module_id: filter }],
      })
        .sort("-created_at")
        .limit(limit)
        .skip(skip)
        .select(
          "razorpay_order_id payment_module_type payment_module_id payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
        )
        .populate({
          path: "payment_fee",
          select: "feeName",
        })
        .populate({
          path: "payment_admission",
          select: "applicationName",
        })
        .populate({
          path: "payment_checklist",
          select: "checklistName",
        })
        .populate({
          path: "payment_income",
          select: "incomeDesc",
        })
        .populate({
          path: "payment_expense",
          select: "expenseDesc",
        })
        .populate({
          path: "payment_by_end_user_id",
          select: "userLegalName photoId profilePhoto",
        })
        .populate({
          path: "payment_to_end_user_id",
          select: "insName photoId insProfilePhoto",
        });
    } else {
      var order = await OrderPayment.find({ payment_to_end_user_id: uid })
        .sort("-created_at")
        .limit(limit)
        .skip(skip)
        .select(
          "razorpay_order_id payment_module_type payment_module_id payment_flag_by payment_flag_to payment_amount payment_status created_at payment_mode payment_invoice_number"
        )
        .populate({
          path: "payment_fee",
          select: "feeName",
        })
        .populate({
          path: "payment_admission",
          select: "applicationName",
        })
        .populate({
          path: "payment_checklist",
          select: "checklistName",
        })
        .populate({
          path: "payment_income",
          select: "incomeDesc",
        })
        .populate({
          path: "payment_expense",
          select: "expenseDesc",
        })
        .populate({
          path: "payment_by_end_user_id",
          select: "userLegalName photoId profilePhoto",
        })
        .populate({
          path: "payment_to_end_user_id",
          select: "insName photoId insProfilePhoto",
        });
    }
    if (order?.length > 0) {
      res.status(200).send({ message: "User Pay History", history: order });
    } else {
      res.status(200).send({ message: "No User Pay History", history: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchPaymentOneHistory = async (req, res) => {
  try {
    const { pid } = req.params;
    if (!pid)
      return res
        .status(200)
        .send({ message: "Their is a bug need to fix it 😀", deny: true });
    const one_pay = await OrderPayment.findById({ _id: pid })
      .populate({
        path: "payment_fee",
        select: "feeName",
      })
      .populate({
        path: "payment_admission",
        select: "applicationName",
      })
      .populate({
        path: "payment_checklist",
        select: "checklistName",
      })
      .populate({
        path: "payment_income",
        select: "incomeDesc",
      })
      .populate({
        path: "payment_expense",
        select: "expenseDesc",
      })
      .populate({
        path: "payment_by_end_user_id",
        select: "userLegalName photoId profilePhoto",
      })
      .populate({
        path: "payment_to_end_user_id",
        select: "insName photoId insProfilePhoto",
      });
    res
      .status(200)
      .send({ message: "One Payment Detail", deny: false, one_pay });
  } catch {}
};
