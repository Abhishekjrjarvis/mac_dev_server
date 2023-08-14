const PaytmChecksum = require("./PaytmChecksum");
const https = require("https");
const { v4 } = require("uuid");
const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const {
  feeInstituteFunction,
  admissionInstituteFunction,
} = require("../RazorPay/paymentModule");

const order_history_query = async (
  module_type,
  module_id,
  amount_nocharges,
  to_end_user_id,
  txn_id
) => {
  try {
    // var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var institute = await InstituteAdmin.findById({ _id: `${to_end_user_id}` });
    var order_payment = new OrderPayment({});
    order_payment.payment_module_type = module_type;
    order_payment.payment_to_end_user_id = to_end_user_id;
    order_payment.payment_flag_by = "Debit";
    order_payment.payment_flag_to = "Credit";
    order_payment.payment_module_id = module_id;
    order_payment.payment_mode = "Paytm Payment Gateway - (PG)";
    order_payment.payment_amount = amount_nocharges;
    order_payment.payment_status = "Captured";
    order_payment.razorpay_payment_id = `${txn_id}`;
    institute.invoice_count += 1;
    order_payment.payment_invoice_number = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    await Promise.all([order_payment.save(), institute.save()]);
    return order_payment;
  } catch (e) {
    console.log(e);
  }
};

exports.initiate = async (req, res) => {
  try {
    const {
      moduleId,
      paidBy,
      amount,
      name,
      paidTo,
      isApk,
      type,
      payment_installment,
      payment_card_type,
      payment_remain_1,
      ad_status_id,
      payment_card_id,
    } = req.body;
    let gatewayCharges = (parseInt(amount) * 1) / 100;
    var valid_charge = gatewayCharges >= 100 ? 100 : gatewayCharges;
    let gst = (+valid_charge * 18) / 100;
    let data = parseInt(amount) + parseInt(valid_charge) + gst;
    // let gatewayCharges = (parseInt(amount) * 2.1) / 100;
    // let gst = (+gatewayCharges * 18) / 100;
    // let withGst = gatewayCharges + gst;
    // let data = parseInt(amount);
    var order = `ORDERID${v4()}`;
    var price = `${amount}`;

    var paytmParams = {};

    paytmParams.body = {
      requestType: "Payment",
      mid: `${process.env.PAYTM_MID}`,
      websiteName: `${process.env.PAYTM_WEBSITE}`,
      orderId: order,
      callbackUrl:
        isApk === "APK"
          ? `https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=${order}`
          : type === "Fees"
          ? `${process.env.CALLBACK_URLS}/v1/paytm/callback/internal/${moduleId}/paidby/${paidBy}/redirect/${name}/paidTo/${paidTo}/device/${isApk}/price/${price}`
          : `${process.env.CALLBACK_URLS}/v1/paytm/callback/admission/${moduleId}/paidby/${paidBy}/redirect/${name}/paidTo/${paidTo}/device/${isApk}/price/${price}/fees/${payment_card_id}/install/${payment_installment}/remain/${payment_remain_1}/card/${payment_card_type}/status/${ad_status_id}`,
      txnAmount: {
        value: Math.ceil(data),
        currency: "INR",
      },
      userInfo: {
        custId: `${process.env.PAYTM_CUST_ID}`,
      },
      enablePaymentMode:
        isApk === "APK"
          ? [
              {
                mode: "UPI",
                channels: ["UPIPUSH"],
              },
            ]
          : [],
    };
    PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      `${process.env.PAYTM_MERCHANT_KEY}`
    ).then(function (checksum) {
      paytmParams.head = {
        signature: checksum,
      };

      var post_data = JSON.stringify(paytmParams);

      var options = {
        // hostname: "securegw-stage.paytm.in",
        hostname: process.env.PAYTM_CALLBACK_URL_APK
          ? "securegw.paytm.in"
          : "securegw-stage.paytm.in",
        port: 443,
        path: `/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${order}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": post_data.length,
        },
      };

      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on("data", function (chunk) {
          response += chunk;
        });

        post_res.on("end", function () {
          res.status(200).send({
            message: "Explore New Paytm Token",
            response: JSON.parse(response),
            amount: amount,
            order: order,
            isStaging: process.env.PAYTM_CALLBACK_URL_APK ? false : true,
            callback_apk_url: process.env.PAYTM_CALLBACK_URL_APK
              ? "https://securegw.paytm.in/theia/paytmCallback?ORDER_ID="
              : "https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=",
          });
        });
      });

      post_req.write(post_data);
      post_req.end();
    });
  } catch (e) {
    console.log(e);
  }
};

exports.callback = async (req, res) => {
  try {
    const { moduleId, paidBy, name, paidTo, isApk, price } = req.params;
    var paytmParams = {};
    paytmParams.body = {
      mid: `${process.env.PAYTM_MID}`,
      orderId: `${req.body?.ORDERID}`,
    };
    PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      `${process.env.PAYTM_MERCHANT_KEY}`
    ).then(function (checksum) {
      paytmParams.head = {
        signature: checksum,
      };

      var post_data = JSON.stringify(paytmParams);

      var options = {
        // hostname: "securegw-stage.paytm.in",
        hostname: process.env.PAYTM_CALLBACK_URL_APK
          ? "securegw.paytm.in"
          : "securegw-stage.paytm.in",

        port: 443,
        path: "/v3/order/status",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": post_data.length,
        },
      };

      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on("data", function (chunk) {
          response += chunk;
        });

        post_res.on("end", async function () {
          var status = req?.body?.STATUS;
          var price_charge = req?.body?.TXNAMOUNT;
          var txn_id = req?.body?.TXNID;
          if (status === "TXN_SUCCESS") {
            var order = await order_history_query(
              "Fees",
              moduleId,
              price,
              paidTo,
              txn_id
            );
            var paytm_author = false;
            await feeInstituteFunction(
              order?._id,
              paidBy,
              price,
              price_charge,
              moduleId,
              paytm_author
            );
            if (isApk === "APK") {
              res.status(200).send({
                message: "Success with Internal Paytm Fees 😀",
                check: true,
              });
            } else {
              res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
            }
          } else {
            res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
          }
        });
      });
      post_req.write(post_data);
      post_req.end();
    });
  } catch (e) {
    console.log(e);
  }
};

exports.callbackAdmission = async (req, res) => {
  try {
    const {
      name,
      paidBy,
      moduleId,
      paidTo,
      amount_nocharges,
      isApk,
      payment_installment,
      payment_card_type,
      payment_remain_1,
      ad_status_id,
      payment_card_id,
      price,
    } = req.params;
    var paytmParams = {};
    paytmParams.body = {
      mid: `${process.env.PAYTM_MID}`,
      orderId: `${req.body?.ORDERID}`,
    };
    PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      `${process.env.PAYTM_MERCHANT_KEY}`
    ).then(function (checksum) {
      paytmParams.head = {
        signature: checksum,
      };

      var post_data = JSON.stringify(paytmParams);

      var options = {
        // hostname: "securegw-stage.paytm.in",
        hostname: process.env.PAYTM_CALLBACK_URL_APK
          ? "securegw.paytm.in"
          : "securegw-stage.paytm.in",

        port: 443,
        path: "/v3/order/status",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": post_data.length,
        },
      };

      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on("data", function (chunk) {
          response += chunk;
        });

        post_res.on("end", async function () {
          var status = req?.body?.STATUS;
          var price_charge = req?.body?.TXNAMOUNT;
          if (status === "TXN_SUCCESS") {
            var order = await order_history_query(
              "Admission",
              moduleId,
              price,
              paidTo,
              txn_id
            );
            var paytm_author = false;
            var valid_status = ad_status_id === "null" ? "" : ad_status_id;
            var valid_card =
              payment_card_type === "null" ? "" : payment_card_type;
            await admissionInstituteFunction(
              order?._id,
              paidBy,
              price,
              price_charge,
              moduleId,
              paidTo,
              payment_installment,
              paytm_author,
              valid_card,
              payment_remain_1,
              payment_card_id,
              valid_status
              // Boolean(ad_install)
            );
            if (isApk === "APK") {
              res.status(200).send({
                message: "Success with Internal Paytm Fees 😀",
                check: true,
              });
            } else {
              res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
            }
          } else {
            res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
          }
        });
      });
      post_req.write(post_data);
      post_req.end();
    });
  } catch (e) {
    console.log(e);
  }
};

exports.callbackStatus = async (req, res) => {
  try {
    const { moduleId, paidBy, name, paidTo, isApk, price, TXNAMOUNT, STATUS } =
      req.body;
    var status = STATUS;
    var price_charge = TXNAMOUNT;
    if (status === "TXN_SUCCESS") {
      var order = await order_history_query(
        "Fees",
        moduleId,
        price,
        paidTo,
        txn_id
      );
      var paytm_author = false;
      await feeInstituteFunction(
        order?._id,
        paidBy,
        price,
        price_charge,
        moduleId,
        paytm_author
      );
      if (isApk === "APK") {
        res.status(200).send({
          message: "Success with Internal Paytm Fees 😀",
          check: true,
        });
      } else {
        res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
      }
    } else {
      res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.callbackAdmissionStatus = async (req, res) => {
  try {
    const {
      name,
      paidBy,
      moduleId,
      paidTo,
      isApk,
      payment_installment,
      payment_card_type,
      payment_remain_1,
      ad_status_id,
      payment_card_id,
      price,
      TXNAMOUNT,
      STATUS,
    } = req.body;
    var status = STATUS;
    var price_charge = TXNAMOUNT;
    if (status === "TXN_SUCCESS") {
      var order = await order_history_query(
        "Admission",
        moduleId,
        price,
        paidTo,
        txn_id
      );
      var paytm_author = false;
      var valid_status = ad_status_id === "null" ? "" : ad_status_id;
      var valid_card = payment_card_type === "null" ? "" : payment_card_type;
      await admissionInstituteFunction(
        order?._id,
        paidBy,
        price,
        price_charge,
        moduleId,
        paidTo,
        payment_installment,
        paytm_author,
        valid_card,
        payment_remain_1,
        payment_card_id,
        valid_status
        // Boolean(ad_install)
      );
      if (isApk === "APK") {
        res.status(200).send({
          message: "Success with Admission Paytm Fees 😀",
          check: true,
        });
      } else {
        res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
      }
    } else {
      res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
    }
  } catch (e) {
    console.log(e);
  }
};
