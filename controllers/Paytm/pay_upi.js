const PaytmChecksum = require("./PaytmChecksum");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const Admin = require("../../models/superAdmin");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const {
  feeInstituteFunction,
  admissionInstituteFunction,
  hostelInstituteFunction,
  backlogFunction,
  transportFunction,
  participateEventFunction,
} = require("../RazorPay/paymentModule");
const { call_back_urls_redirection_query } = require("../../helper/functions");

const order_history_query = async (
  module_type,
  module_id,
  amount_nocharges,
  to_end_user_id
) => {
  try {
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var order_payment = new OrderPayment({});
    order_payment.payment_module_type = module_type;
    order_payment.payment_to_end_user_id = to_end_user_id;
    order_payment.payment_flag_by = "Debit";
    order_payment.payment_flag_to = "Credit";
    order_payment.payment_module_id = module_id;
    order_payment.payment_amount = amount_nocharges;
    order_payment.payment_status = "Captured";
    s_admin.invoice_count += 1;
    order_payment.payment_invoice_number = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${s_admin.invoice_count}`;
    await Promise.all([order_payment.save(), s_admin.save()]);
    return order_payment;
  } catch (e) {
    console.log(e);
  }
};

exports.generatePaytmTxnToken = async (req, res, next) => {
  try {
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
    var valid_url = await call_back_urls_redirection_query(
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
    // console.log(valid_url);
    const totalAmount = JSON.stringify(amount);
    var params = {};

    (params["MID"] = process.env.PAYTM_MID),
      (params["WEBSITE"] = process.env.PAYTM_WEBSITE),
      (params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID),
      (params["INDUSTRY_TYPE"] = process.env.PAYTM_INDUSTRY_TYPE),
      (params["ORDER_ID"] = uuidv4()),
      (params["CUST_ID"] = process.env.PAYTM_CUST_ID),
      (params["TXN_AMOUNT"] = totalAmount),
      (params["CALLBACK_URL"] = `${valid_url}`);

    var paytmChecksum = PaytmChecksum.generateSignature(
      params,
      process.env.PAYTM_MERCHANT_KEY
    );
    paytmChecksum
      .then(function (checksum) {
        let paytmParams = {
          ...params,
          CHECKSUMHASH: checksum,
        };
        // console.log(paytmParams);
        res.json(paytmParams);
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (e) {
    console.log(e);
  }
};

exports.paytmVerifyResponseStatus = (req, res, next) => {
  const { name, paidBy, moduleId, paidTo, amount_nocharges, isApk } =
    req.params;
  let paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;
  let isVerifySignature = PaytmChecksum.verifySignature(
    req.body,
    process.env.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );
  if (isVerifySignature) {
    var paytmParams = {};
    paytmParams.body = {
      mid: req.body.MID,
      orderId: req.body.ORDERID,
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
        hostname: "securegw-stage.paytm.in",
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
          let status = body?.resultInfo?.resultStatus;
          let price = body?.txnAmount;
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
  } else {
    console.log("Checksum Mismatched In Internal Fees Error Query 😒");
  }
};

exports.paytmVerifyAdmissionResponseStatus = (req, res, next) => {
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
  let paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;
  let isVerifySignature = PaytmChecksum.verifySignature(
    req.body,
    process.env.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );
  if (isVerifySignature) {
    var paytmParams = {};
    paytmParams.body = {
      mid: req.body.MID,
      orderId: req.body.ORDERID,
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
        hostname: "securegw-stage.paytm.in",
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
          let status = body?.resultInfo?.resultStatus;
          let price = body?.txnAmount;
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
  } else {
    console.log("Checksum Mismatched In Admission Fees Error Query 😒");
  }
};

exports.paytmVerifyHostelResponseStatus = (req, res, next) => {
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
  let paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;
  let isVerifySignature = PaytmChecksum.verifySignature(
    req.body,
    process.env.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );
  if (isVerifySignature) {
    var paytmParams = {};
    paytmParams.body = {
      mid: req.body.MID,
      orderId: req.body.ORDERID,
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
        hostname: "securegw-stage.paytm.in",
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
          let status = body?.resultInfo?.resultStatus;
          let price = body?.txnAmount;
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
  } else {
    console.log("Checksum Mismatched In Hostel Fees Error Query 😒");
  }
};

exports.paytmVerifyBacklogResponseStatus = (req, res, next) => {
  const { name, paidBy, moduleId, paidTo, amount_nocharges, isApk } =
    req.params;
  let paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;
  let isVerifySignature = PaytmChecksum.verifySignature(
    req.body,
    process.env.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );
  if (isVerifySignature) {
    var paytmParams = {};
    paytmParams.body = {
      mid: req.body.MID,
      orderId: req.body.ORDERID,
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
        hostname: "securegw-stage.paytm.in",
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
          let status = body?.resultInfo?.resultStatus;
          let price = body?.txnAmount;
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
  } else {
    console.log("Checksum Mismatched In Backlog Fees Error Query 😒");
  }
};

exports.paytmVerifyTransportResponseStatus = (req, res, next) => {
  const { name, paidBy, moduleId, paidTo, amount_nocharges, isApk } =
    req.params;
  let paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;
  let isVerifySignature = PaytmChecksum.verifySignature(
    req.body,
    process.env.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );
  if (isVerifySignature) {
    var paytmParams = {};
    paytmParams.body = {
      mid: req.body.MID,
      orderId: req.body.ORDERID,
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
        hostname: "securegw-stage.paytm.in",
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
          let status = body?.resultInfo?.resultStatus;
          let price = body?.txnAmount;
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
  } else {
    console.log("Checksum Mismatched In Transport Fees Error Query 😒");
  }
};

exports.paytmVerifyParticipateResponseStatus = (req, res, next) => {
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
  let paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;
  let isVerifySignature = PaytmChecksum.verifySignature(
    req.body,
    process.env.PAYTM_MERCHANT_KEY,
    paytmChecksum
  );
  if (isVerifySignature) {
    var paytmParams = {};
    paytmParams.body = {
      mid: req.body.MID,
      orderId: req.body.ORDERID,
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
        hostname: "securegw-stage.paytm.in",
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
          let status = body?.resultInfo?.resultStatus;
          let price = body?.txnAmount;
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
  } else {
    console.log("Checksum Mismatched In Participate Fees Error Query 😒");
  }
};
