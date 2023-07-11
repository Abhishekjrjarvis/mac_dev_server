const PaytmChecksum = require("./PaytmChecksum");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const Admin = require("../../models/superAdmin");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const {
  feeInstituteFunction,
  admissionInstituteFunction,
  backlogFunction,
  transportFunction,
  participateEventFunction,
} = require("../RazorPay/paymentModule");
const {
  call_back_urls_redirection_query,
  call_back_urls_redirection_apk_query,
} = require("../../helper/functions");
const { hostelInstituteFunction } = require("../RazorPay/hostelPaymentModule");

const order_history_query = async (
  module_type,
  module_id,
  amount_nocharges,
  to_end_user_id
) => {
  try {
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var institute = await InstituteAdmin.findById({ _id: `${to_end_user_id}` });
    var order_payment = new OrderPayment({});
    order_payment.payment_module_type = module_type;
    order_payment.payment_to_end_user_id = to_end_user_id;
    order_payment.payment_flag_by = "Debit";
    order_payment.payment_flag_to = "Credit";
    order_payment.payment_module_id = module_id;
    order_payment.payment_amount = amount_nocharges;
    order_payment.payment_status = "Captured";
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

exports.generateApkPaytmTxnToken = async (req, res) => {
  const {
    amount,
    moduleId,
    paidBy,
    name,
    paidTo,
    amount_nocharges,
    isApk,
    payment_installment,
    payment_card_type,
    payment_remain_1,
    ad_status_id,
    type,
  } = req.body;
  var valid_url = await call_back_urls_redirection_apk_query(
    type,
    moduleId,
    paidBy,
    name,
    paidTo,
    amount_nocharges,
    isApk,
    payment_installment,
    payment_card_type,
    payment_remain_1,
    ad_status_id
  );
  const totalAmount = JSON.stringify(amount);
  var paytmParams = {};

  paytmParams.body = {
    requestType: "Payment",
    mid: process.env.PAYTM_MID,
    websiteName: process.env.PAYTM_MERCHANT_KEY,
    orderId: uuidv4(),
    callbackUrl: `${valid_url}`,
    txnAmount: {
      value: totalAmount,
      currency: "INR",
    },
    userInfo: {
      custId: process.env.PAYTM_CUST_ID,
    },
  };

  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    process.env.PAYTM_MERCHANT_KEY
  ).then(function (checksum) {
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {
      /* for Staging */
      hostname: "securegw-stage.paytm.in",

      /* for Production */
      // hostname: 'securegw.paytm.in',

      port: 443,
      path: `/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${paytmParams.body.orderId}`,
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
        res.send({
          signature: JSON.parse(response),
          oid: paytmParams.body.orderId,
          mid: paytmParams.body.mid,
        });
      });
    });

    post_req.write(post_data);
    post_req.end();
  });
};

exports.paytmVerifyResponseStatus = async (req, res, next) => {
  const { name, paidBy, moduleId, paidTo, amount_nocharges, isApk } =
    req.params;
  var paytmParams = {};
  paytmParams.body = {
    mid: `${req.body.mid}`,
    orderId: `${req.body.orderId}`,
  };

  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    process.env.PAYTM_MERCHANT_KEY
  ).then(function (checksum) {
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {
      /* for Staging */
      hostname: "securegw-stage.paytm.in",

      /* for Production */
      // hostname: 'securegw.paytm.in',

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
        let { body } = JSON.parse(response);
        let status = body.resultInfo.resultStatus;
        let price = body.txnAmount;
        if (status === "TXN_SUCCESS") {
          var order = await order_history_query(
            "Fees",
            moduleId,
            price,
            paidTo
          );
          var paytm_author = false;
          await feeInstituteFunction(
            order?._id,
            paidBy,
            price,
            amount_nocharges,
            moduleId,
            paytm_author
          );
          if (isApk) {
            res.status(200).send({
              message: "Success with Paytm Fees 😀",
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
};

exports.paytmVerifyAdmissionResponseStatus = async (req, res, next) => {
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
  } = req.params;
  var paytmParams = {};
  paytmParams.body = {
    mid: `${req.body.mid}`,
    orderId: `${req.body.orderId}`,
  };

  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    process.env.PAYTM_MERCHANT_KEY
  ).then(function (checksum) {
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {
      /* for Staging */
      hostname: "securegw-stage.paytm.in",

      /* for Production */
      // hostname: 'securegw.paytm.in',

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
        let { body } = JSON.parse(response);
        let status = body.resultInfo.resultStatus;
        let price = body.txnAmount;
        if (status === "TXN_SUCCESS") {
          var order = await order_history_query(
            "Admission",
            moduleId,
            price,
            paidTo
          );
          var paytm_author = false;
          await admissionInstituteFunction(
            order?._id,
            paidBy,
            price,
            amount_nocharges,
            moduleId,
            paidTo,
            payment_installment,
            paytm_author,
            payment_card_type ?? "",
            payment_remain_1 ?? "",
            ad_status_id ?? ""
            // Boolean(ad_install)
          );
          if (isApk) {
            res.status(200).send({
              message: "Success with Paytm Admission Fees 😀",
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
};

exports.paytmVerifyHostelResponseStatus = async (req, res, next) => {
  const {
    name,
    paidBy,
    moduleId,
    paidTo,
    amount_nocharges,
    isApk,
    payment_installment,
    // payment_card_type,
    // payment_remain_1,
    ad_status_id,
  } = req.params;
  var paytmParams = {};
  paytmParams.body = {
    mid: `${req.body.mid}`,
    orderId: `${req.body.orderId}`,
  };

  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    process.env.PAYTM_MERCHANT_KEY
  ).then(function (checksum) {
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {
      /* for Staging */
      hostname: "securegw-stage.paytm.in",

      /* for Production */
      // hostname: 'securegw.paytm.in',

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
        let { body } = JSON.parse(response);
        let status = body.resultInfo.resultStatus;
        let price = body.txnAmount;
        if (status === "TXN_SUCCESS") {
          var order = await order_history_query(
            "Hostel",
            moduleId,
            price,
            paidTo
          );
          var paytm_author = false;
          await hostelInstituteFunction(
            order?._id,
            paidBy,
            price,
            amount_nocharges,
            moduleId,
            ad_status_id ?? "",
            paidTo ?? "",
            payment_installment ?? "",
            paytm_author
            // Boolean(ad_install)
          );
          if (isApk) {
            res.status(200).send({
              message: "Success with Paytm Hostel Fees 😀",
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
};

exports.paytmVerifyBacklogResponseStatus = async (req, res, next) => {
  const { name, paidBy, moduleId, paidTo, amount_nocharges, isApk } =
    req.params;
  var paytmParams = {};
  paytmParams.body = {
    mid: `${req.body.mid}`,
    orderId: `${req.body.orderId}`,
  };

  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    process.env.PAYTM_MERCHANT_KEY
  ).then(function (checksum) {
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {
      /* for Staging */
      hostname: "securegw-stage.paytm.in",

      /* for Production */
      // hostname: 'securegw.paytm.in',

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
        let { body } = JSON.parse(response);
        let status = body.resultInfo.resultStatus;
        let price = body.txnAmount;
        if (status === "TXN_SUCCESS") {
          var order = await order_history_query(
            "Backlog",
            moduleId,
            price,
            paidTo
          );
          var paytm_author = false;
          await backlogFunction(
            order?._id,
            paidBy,
            price,
            amount_nocharges,
            moduleId,
            // ad_status_id,
            paytm_author
          );
          if (isApk) {
            res.status(200).send({
              message: "Success with Paytm Backlog Fees 😀",
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
};

exports.paytmVerifyTransportResponseStatus = async (req, res, next) => {
  const { name, paidBy, moduleId, paidTo, amount_nocharges, isApk } =
    req.params;
  var paytmParams = {};
  paytmParams.body = {
    mid: `${req.body.mid}`,
    orderId: `${req.body.orderId}`,
  };

  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    process.env.PAYTM_MERCHANT_KEY
  ).then(function (checksum) {
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {
      /* for Staging */
      hostname: "securegw-stage.paytm.in",

      /* for Production */
      // hostname: 'securegw.paytm.in',

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
        let { body } = JSON.parse(response);
        let status = body.resultInfo.resultStatus;
        let price = body.txnAmount;
        if (status === "TXN_SUCCESS") {
          var order = await order_history_query(
            "Transport",
            moduleId,
            price,
            paidTo
          );
          var paytm_author = false;
          await transportFunction(
            order?._id,
            paidBy,
            price,
            amount_nocharges,
            moduleId,
            paytm_author
          );
          if (isApk) {
            res.status(200).send({
              message: "Success with Paytm Transport Fees 😀",
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
};

exports.paytmVerifyParticipateResponseStatus = async (req, res, next) => {
  const {
    name,
    paidBy,
    moduleId,
    paidTo,
    amount_nocharges,
    isApk,
    // payment_installment,
    // payment_card_type,
    // payment_remain_1,
    ad_status_id,
  } = req.params;
  var paytmParams = {};
  paytmParams.body = {
    mid: `${req.body.mid}`,
    orderId: `${req.body.orderId}`,
  };

  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    process.env.PAYTM_MERCHANT_KEY
  ).then(function (checksum) {
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {
      /* for Staging */
      hostname: "securegw-stage.paytm.in",

      /* for Production */
      // hostname: 'securegw.paytm.in',

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
        let { body } = JSON.parse(response);
        let status = body.resultInfo.resultStatus;
        let price = body.txnAmount;
        if (status === "TXN_SUCCESS") {
          var order = await order_history_query(
            "Participate",
            moduleId,
            price,
            paidTo
          );
          var paytm_author = false;
          await participateEventFunction(
            order?._id,
            paidBy,
            price,
            amount_nocharges,
            moduleId,
            ad_status_id ?? "",
            paytm_author
          );
          if (isApk) {
            res.status(200).send({
              message: "Success with Paytm Participate Fees 😀",
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
};
