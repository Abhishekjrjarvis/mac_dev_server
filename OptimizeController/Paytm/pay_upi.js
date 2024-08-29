const PaytmChecksum = require("./PaytmChecksum");
const https = require("https");
const { v4 } = require("uuid");
const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const {
  feeInstituteFunction,
  admissionInstituteFunction,
  certificateInstituteFunction,
  otherFeesFunction,
} = require("../RazorPay/paymentModule");
const { hostelInstituteFunction } = require("../RazorPay/hostelPaymentModule");
const { orderID } = require("../../Generator/OrderId");
const ErrorPayment = require("../../models/Acid/ErrorPayment");
const axios = require("axios");

const order_history_query = async (
  module_type,
  module_id,
  amount_nocharges,
  to_end_user_id,
  txn_id,
  body,
  obj_nums
) => {
  try {
    // var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var institute = await InstituteAdmin.findById({ _id: `${to_end_user_id}` });
    var order_payment = new OrderPayment({});
    order_payment.payment_module_type = module_type;
    order_payment.payment_to_end_user_id = to_end_user_id;
    order_payment.payment_flag_by = "Debit";
    order_payment.payment_flag_to = "Credit";
    order_payment.payment_module_id = module_id ?? "";
    order_payment.payment_mode = "Paytm Payment Gateway - (PG)";
    order_payment.payment_amount = amount_nocharges;
    order_payment.payment_status = "Captured";
    institute.invoice_count += 1;
    order_payment.razorpay_payment_id = `${txn_id}`;
    if (obj_nums) {
      (order_payment.paytm_obj.orderId = obj_nums?.oid ?? ""),
        (order_payment.paytm_obj.checksum = obj_nums?.checksum ?? "");
    }
    if (body) {
      order_payment.paytm_query.push(body);
    }
    order_payment.payment_invoice_number = `${
      institute?.random_institute_code
    }-${new Date().getMonth() + 1}-${new Date().getFullYear()}-${
      institute?.invoice_count
    }`;
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
      payment_remain_fees,
      charge,
      cert_type,
      cert_content,
      is_original,
    } = req.body;
    console.log(req?.body);
    let platform_charge =
      (parseInt(amount) * charge?.num_platform_percent) / 100;
    var valid_platform_charge =
      platform_charge >= 100 ? charge?.num_platform_max : platform_charge;
    let total_price = parseInt(amount) + parseInt(valid_platform_charge);
    let gatewayCharges =
      (parseInt(total_price) * charge?.num_trans_pecent) / 100;
    var valid_charge =
      gatewayCharges >= 100 ? charge?.num_trans_max : gatewayCharges;
    let gst = (+valid_charge * 18) / 100;
    if (type === "Admission") {
      var data =
        +amount +
        +valid_platform_charge +
        +valid_charge +
        +charge?.num_app_max +
        gst;
    } else {
      var data = +amount + +valid_platform_charge + +valid_charge + gst;
    }
    // let gatewayCharges = (parseInt(amount) * 2.1) / 100;
    // let gst = (+gatewayCharges * 18) / 100;
    // let withGst = gatewayCharges + gst;
    // let data = parseInt(amount);
    var order = `${orderID()}`;
    var price = `${amount}`;

    var paytmParams = {};
    const error_pay = new ErrorPayment({
      error_flow: type,
      error_student: paidBy,
      error_module: moduleId,
      error_order_id: order,
      error_message: "New Order ID Payment Initiated",
      error_payment_card: payment_card_id ?? null,
      error_amount_charges: Math.ceil(data),
      error_amount: price,
      error_paid_to: paidTo,
      error_status_id: ad_status_id ?? "",
      error_type: type,
    });
    await error_pay.save();

    paytmParams.body = {
      requestType: "Payment",
      mid: `${process.env.PAYTM_MID}`,
      websiteName: `${process.env.PAYTM_WEBSITE}`,
      orderId: order,
      callbackUrl:
        isApk === "APK"
          ? `https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=${order}`
          : type === "Fees"
          ? `${process.env.CALLBACK_URLS}/v2/paytm/callback/internal/${moduleId}/paidby/${paidBy}/redirect/${name}/paidTo/${paidTo}/device/${isApk}/price/${price}`
          : type === "Admission"
          ? `${process.env.CALLBACK_URLS}/v2/paytm/callback/admission/${moduleId}/paidby/${paidBy}/redirect/${name}/paidTo/${paidTo}/device/${isApk}/price/${price}/fees/${payment_card_id}/install/${payment_installment}/remain/${payment_remain_fees}/status/${ad_status_id}/epid/${error_pay?._id}`
          : type === "Certificate"
          ? `${process.env.CALLBACK_URLS}/v2/paytm/callback/certificate/${moduleId}/paidby/${paidBy}/redirect/${name}/paidTo/${paidTo}/device/${isApk}/price/${price}/type/${cert_type}/content/${cert_content}/original/${is_original}`
          : type === "Other"
          ? `${process.env.CALLBACK_URLS}/v2/paytm/callback/other/${moduleId}/paidby/${paidBy}/redirect/${name}/paidTo/${paidTo}/device/${isApk}/price/${price}`
          : `${process.env.CALLBACK_URLS}/v2/paytm/callback/hostel/${moduleId}/paidby/${paidBy}/redirect/${name}/paidTo/${paidTo}/device/${isApk}/price/${price}/fees/${payment_card_id}/install/${payment_installment}/remain/${payment_remain_fees}/status/${ad_status_id}`,
      txnAmount: {
        value: Math.ceil(data),
        currency: "INR",
      },
      userInfo: {
        custId: `${process.env.PAYTM_CUST_ID}`,
      },
      // enablePaymentMode:
      //   isApk === "APK"
      //     ? [
      //         {
      //           mode: "UPI",
      //           // channels: ["UPIPUSH"],
      //         },
      //       ]
      //     : [],
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
            payment_status: error_pay?._id ?? "",
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
              txn_id,
              req?.body
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
      payment_remain_fees,
      price,
      eid,
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
          var txn_id = req?.body?.TXNID;
          var obj = {
            oid: req.body?.ORDERID,
            checksum: paytmParams?.head?.checksum,
          };
          if (status === "TXN_SUCCESS") {
            var order = await order_history_query(
              "Admission",
              moduleId,
              price,
              paidTo,
              txn_id,
              req?.body,
              obj
            );
            var paytm_author = false;
            var valid_status = ad_status_id === "null" ? "" : ad_status_id;
            var valid_card =
              payment_card_type === "null" ? "" : payment_card_type;
            var pay_remain = payment_remain_fees === "false" ? false : true;
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
              pay_remain,
              valid_status,
              eid
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

exports.callbackHostel = async (req, res) => {
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
      payment_remain_fees,
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
          var txn_id = req?.body?.TXNID;
          var obj = {
            oid: req.body?.ORDERID,
            checksum: paytmParams?.head?.checksum,
          };
          if (status === "TXN_SUCCESS") {
            var order = await order_history_query(
              "Hostel",
              moduleId,
              price,
              paidTo,
              txn_id,
              req?.body,
              obj
            );
            var paytm_author = false;
            var valid_status = ad_status_id === "null" ? "" : ad_status_id;
            var valid_card =
              payment_card_type === "null" ? "" : payment_card_type;
            var pay_remain = payment_remain_fees === "false" ? false : true;
            await hostelInstituteFunction(
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
              pay_remain,
              valid_status
              // Boolean(ad_install)
            );
            if (isApk === "APK") {
              res.status(200).send({
                message: "Success with Hostel Paytm Fees 😀",
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

exports.callbackCertificate = async (req, res) => {
  try {
    const {
      moduleId,
      paidBy,
      name,
      paidTo,
      isApk,
      price,
      cert_type,
      cert_content,
      is_original,
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
          var txn_id = req?.body?.TXNID;
          if (status === "TXN_SUCCESS") {
            var order = await order_history_query(
              "Certificate",
              moduleId,
              price,
              paidTo,
              txn_id,
              req?.body
            );
            var paytm_author = false;
            await certificateInstituteFunction(
              order?._id,
              paidBy,
              price,
              price_charge,
              // moduleId,
              paytm_author,
              cert_type,
              cert_content,
              is_original
            );
            if (isApk === "APK") {
              res.status(200).send({
                message: "Success with Certificate Paytm Fees 😀",
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
    const {
      moduleId,
      paidBy,
      name,
      paidTo,
      isApk,
      price,
      TXNAMOUNT,
      STATUS,
      TXNID,
      apk_body,
    } = req.body;
    var status = STATUS;
    var price_charge = TXNAMOUNT;
    if (status === "TXN_SUCCESS") {
      var order = await order_history_query(
        "Fees",
        moduleId,
        price,
        paidTo,
        TXNID,
        apk_body
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
      payment_remain_fees,
      price,
      TXNAMOUNT,
      STATUS,
      TXNID,
      apk_body,
      eid,
    } = req.body;
    var status = STATUS;
    var price_charge = TXNAMOUNT;
    if (status === "TXN_SUCCESS") {
      var order = await order_history_query(
        "Admission",
        moduleId,
        price,
        paidTo,
        TXNID,
        apk_body
      );
      var paytm_author = false;
      var valid_status = ad_status_id === "null" ? "" : ad_status_id;
      var valid_card = payment_card_type === "null" ? "" : payment_card_type;
      var pay_remain = payment_remain_fees === "false" ? false : true;
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
        pay_remain,
        valid_status,
        eid
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

exports.callbackHostelStatus = async (req, res) => {
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
      payment_remain_fees,
      price,
      TXNAMOUNT,
      STATUS,
      TXNID,
      apk_body,
    } = req.body;
    var status = STATUS;
    var price_charge = TXNAMOUNT;
    if (status === "TXN_SUCCESS") {
      var order = await order_history_query(
        "Hostel",
        moduleId,
        price,
        paidTo,
        TXNID,
        apk_body
      );
      var paytm_author = false;
      var valid_status = ad_status_id === "null" ? "" : ad_status_id;
      var valid_card = payment_card_type === "null" ? "" : payment_card_type;
      var pay_remain = payment_remain_fees === "false" ? false : true;
      await hostelInstituteFunction(
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
        pay_remain,
        valid_status
        // Boolean(ad_install)
      );
      if (isApk === "APK") {
        res.status(200).send({
          message: "Success with Hostel Admission Paytm Fees 😀",
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

exports.callbackTransportStatus = async (req, res) => {
  try {
    const {
      name,
      paidBy,
      moduleId,
      paidTo,
      isApk,
      payment_installment,
      payment_remain_1,
      price,
      ad_status_id,
      TXNAMOUNT,
      STATUS,
      TXNID,
      apk_body,
    } = req.body;
    var status = STATUS;
    var price_charge = TXNAMOUNT;
    if (status === "TXN_SUCCESS") {
      var order = await order_history_query(
        "Transport",
        moduleId,
        price,
        paidTo,
        TXNID,
        apk_body
      );
      var paytm_author = false;
      var valid_status = ad_status_id === "null" ? "" : ad_status_id;
      await transportFunction(
        order?._id,
        paidBy,
        price,
        price_charge,
        moduleId,
        valid_status,
        paidTo,
        payment_installment,
        paytm_author,
        payment_remain_1
        // Boolean(ad_install)
      );
      if (isApk === "APK") {
        res.status(200).send({
          message: "Success with Transport Admission Paytm Fees 😀",
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

exports.callbackCertificateStatus = async (req, res) => {
  try {
    const {
      moduleId,
      paidBy,
      name,
      paidTo,
      isApk,
      price,
      TXNAMOUNT,
      STATUS,
      TXNID,
      apk_body,
      cert_type,
      cert_content,
      is_original,
    } = req.body;
    var status = STATUS;
    var price_charge = TXNAMOUNT;
    if (status === "TXN_SUCCESS") {
      var order = await order_history_query(
        "Certificate",
        moduleId,
        price,
        paidTo,
        TXNID,
        apk_body
      );
      var paytm_author = false;
      await certificateInstituteFunction(
        order?._id,
        paidBy,
        price,
        price_charge,
        // moduleId,
        paytm_author,
        cert_type,
        cert_content,
        is_original
      );
      if (isApk === "APK") {
        res.status(200).send({
          message: "Success with Certificate Paytm Fees 😀",
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

exports.callbackOtherFees = async (req, res) => {
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
              "Other",
              moduleId,
              price,
              paidTo,
              txn_id,
              req?.body
            );
            var paytm_author = false;
            await otherFeesFunction(
              order?._id,
              paidBy,
              price,
              price_charge,
              moduleId,
              paytm_author
            );
            if (isApk === "APK") {
              res.status(200).send({
                message: "Success with Other Fees Paytm Fees 😀",
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

exports.callbackOtherFeesStatus = async (req, res) => {
  try {
    const {
      moduleId,
      paidBy,
      name,
      paidTo,
      isApk,
      price,
      TXNAMOUNT,
      STATUS,
      TXNID,
      apk_body,
    } = req.body;
    var status = STATUS;
    var price_charge = TXNAMOUNT;
    if (status === "TXN_SUCCESS") {
      var order = await order_history_query(
        "Other",
        moduleId,
        price,
        paidTo,
        TXNID,
        apk_body
      );
      var paytm_author = false;
      await otherFeesFunction(
        order?._id,
        paidBy,
        price,
        price_charge,
        moduleId,
        paytm_author
      );
      if (isApk === "APK") {
        res.status(200).send({
          message: "Success with Other Fees Paytm Fees 😀",
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

exports.validatePaymentStatus = async () => {
  try {
    const all_payments = await ErrorPayment.find({ error_status: "GENERATED" })
      .populate({
        path: "error_receipt",
        select: "receipt_file",
      })
      .populate({
        path: "error_op",
        select: "payment_amount",
      });
    for (let val of all_payments) {
      if (val?.error_receipt?.receipt_file) {
      } else {
        var paytmParams = {};
        paytmParams.body = {
          mid: `${process.env.PAYTM_MID}`,
          orderId: val?.error_order_id,
        };
        PaytmChecksum.generateSignature(
          JSON.stringify(paytmParams.body),
          `${process.env.PAYTM_MERCHANT_KEY}`
        ).then(async function (checksum) {
          paytmParams.head = {
            signature: checksum,
          };
          const d_set = await axios.post(
            process.env.PAYTM_STATUS_URL,
            paytmParams
          );
          if (d_set?.data?.body?.resultInfo?.resultStatus === "TXN_SUCCESS") {
            console.log("PASS", d_set?.data?.body);
            if (val?.error_op?.payment_amount > 0) {
              console.log("1");
            } else {
              console.log("O");
              var order = await order_history_query(
                val?.error_flow,
                val?.error_module,
                val?.error_amount,
                val?.error_paid_to,
                "",
                {},
                {}
              );
              val.error_op = order?._id;
              var paytm_author = false;
              var valid_status =
                val?.error_status_id === "null" ? "" : val?.error_status_id;
              var valid_card = "";
              var pay_remain = false;
              await admissionInstituteFunction(
                order?._id,
                val?.error_student,
                val?.error_amount,
                val?.error_amount_charges,
                val?.error_module,
                val?.error_paid_to,
                val?.error_type,
                paytm_author,
                valid_card,
                val?.payment_remain_1,
                val?.error_payment_card,
                pay_remain,
                valid_status,
                val?._id
                // Boolean(ad_install)
              );
              val.error_status = "GENERATED_RESOLVED";
              await val.save();
            }
          } else {
          }
        });
      }
    }
    // res.status(200).send({ message: "Explore Valid Payment Status Check API", access: true })
  } catch (e) {
    console.error("Error validating payment status:", e);
  }
};

exports.validatePaymentStatusByAPI = async (req, res) => {
  try {
    const { error_order_id } = req?.body;
    var paytmParams = {};
    paytmParams.body = {
      mid: `${process.env.PAYTM_MID}`,
      orderId: error_order_id,
    };
    PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams.body),
      `${process.env.PAYTM_MERCHANT_KEY}`
    ).then(async function (checksum) {
      paytmParams.head = {
        signature: checksum,
      };
      const d_set = await axios.post(process.env.PAYTM_STATUS_URL, paytmParams);
      if (d_set?.data?.body?.resultInfo?.resultStatus === "TXN_SUCCESS") {
        console.log("PASS", d_set?.data?.body);
      } else {
        console.log("FAIL");
      }
    });
    res.status(200).send({
      message: "Explore Valid Payment Status Check API",
      access: true,
    });
  } catch (e) {
    console.error("Error validating payment status:", e);
  }
};
// exports.callback_payment_failed_regeneration_counter = async (req, res) => {
//   try {
//     const all_pay = await ErrorPayment.find({ error_status: "Generated"})
//     for (let ele of all_pay) {
//       var paytmParams = {};
//       paytmParams.body = {
//         mid: `${process.env.PAYTM_MID}`,
//         orderId: `${ele?.ORDERID}`,
//       };
//       PaytmChecksum.generateSignature(
//         JSON.stringify(paytmParams.body),
//         `${process.env.PAYTM_MERCHANT_KEY}`
//       ).then(function (checksum) {
//         paytmParams.head = {
//           signature: checksum,
//         };

//         var post_data = JSON.stringify(paytmParams);

//         var options = {
//           // hostname: "securegw-stage.paytm.in",
//           hostname: process.env.PAYTM_CALLBACK_URL_APK
//             ? "securegw.paytm.in"
//             : "securegw-stage.paytm.in",

//           port: 443,
//           path: "/v3/order/status",
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Content-Length": post_data.length,
//           },
//         };

//         var response = "";
//         var post_req = https.request(options, function (post_res) {
//           post_res.on("data", function (chunk) {
//             response += chunk;
//           });

//           post_res.on("end", async function () {
//             // var status = req?.body?.STATUS;
//             // var price_charge = req?.body?.TXNAMOUNT;
//             // var txn_id = req?.body?.TXNID;
//               console.log("TXN_SUCCESS")
//               var order = await order_history_query(
//                 ele?.error_flow,
//                 ele?.error_module,
//                 ele?.error_amount,
//                 ele?.error_paid_to,
//                 "",
//                 {},
//                 {}
//               );
//               var paytm_author = false;
//               var valid_status = ele?.error_status_id === "null" ? "" : ele?.error_status_id;
//               var valid_card =
//                 "";
//               var pay_remain = false
//               await admissionInstituteFunction(
//                 order?._id,
//                 ele?.error_student,
//                 ele?.error_amount,
//                 ele?.error_amount_charges,
//                 ele?.error_module,
//                 ele?.error_paid_to,
//                 ele?.error_type,
//                 paytm_author,
//                 valid_card,
//                 ele?.payment_remain_1,
//                 ele?.error_payment_card,
//                 pay_remain,
//                 valid_status,
//                 ele?._id
//                 // Boolean(ad_install)
//               );
//           });
//         });
//         post_req.write(post_data);
//         post_req.end();
//       });
//     }
// } catch (e) {
//     console.log(e);
//   }
// };
