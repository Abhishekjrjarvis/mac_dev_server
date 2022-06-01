require("dotenv").config();
const paytm = require("paytmchecksum");
const https = require("https");
const Admin = require("../models/superAdmin");
const InstituteAdmin = require("../models/InstituteAdmin");
const Notification = require("../models/notification");
const CreditPayment = require("../models/CreditPayment");
const { v4: uuidv4 } = require("uuid");

// ================================== Credit Payment Portal ====================================
// ================= Check All Controllers Regarding Credit Payment =====================

// ================ Credit Payment Initiate ====================

exports.processCreditPayment = async (req, res, next) => {
  const { amount, id } = req.body;
  var params = {};
  params["MID"] = process.env.PAYTM_MID;
  params["WEBSITE"] = process.env.PAYTM_WEBSITE;
  params["CHANNEL_ID"] = process.env.PAYTM_CHANNEL_ID;
  params["INDUSTRY_TYPE_ID"] = process.env.PAYTM_INDUSTRY_TYPE;
  params["ORDER_ID"] = "oid" + uuidv4();
  params["CUST_ID"] = process.env.PAYTM_CUST_ID;
  params["TXN_AMOUNT"] = amount;
  params[
    "CALLBACK_URL"
  ] = `http://18.205.27.165/api/api/v1/callback/ins/${id}/credit`;
  let paytmChecksum = paytm.generateSignature(
    params,
    process.env.PAYTM_MERCHANT_KEY
  );
  paytmChecksum
    .then(function (checksum) {
      let paytmParams = {
        ...params,
        CHECKSUMHASH: checksum,
      };
      res.status(200).json({
        paytmParams,
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

// =============== Credit Payment CallBack Response =================

exports.paytmCreditResponse = (req, res, next) => {
  const { id } = req.params;
  let paytmChecksum = req.body.CHECKSUMHASH;
  delete req.body.CHECKSUMHASH;
  let isVerifySignature = paytm.verifySignature(
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
    paytm
      .generateSignature(
        JSON.stringify(paytmParams.body),
        process.env.PAYTM_MERCHANT_KEY
      )
      .then(function (checksum) {
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
          post_res.on("end", function () {
            let { body } = JSON.parse(response);
            let status = body.resultInfo.resultStatus;
            // res.json(body);
            let price = body.txnAmount;
            if (status === "TXN_SUCCESS") {
              addCreditPayment(body, id);
              InstituteCreditUpdated(id, status, price);
              res.redirect(`http://18.205.27.165/inssetting/${id}`);
            } else {
              res.redirect(`http://18.205.27.165/`);
            }
          });
        });
        post_req.write(post_data);
        post_req.end();
      });
  } else {
    console.log("Checksum Mismatched");
  }
};

// ====================== Credit Payment Schema Developing =======================

const addCreditPayment = async (data, insId) => {
  try {
    const credit = await new CreditPayment(data);
    const admin = await Admin.findById({ _id: "62596c3a47690fe0d371f5b4" });
    credit.insId = insId;
    credit.adminId = admin._id;
    admin.creditPaymentList.push(credit);
    await credit.save();
    await admin.save();
  } catch (error) {
    console.log("Credit Payment Failed!");
  }
};

// ======================= Credit Pay To Super Admin Response Regarding ==========================

const InstituteCreditUpdated = async (insId, statusType, tx_iAmounts) => {
  try {
    const institute = await InstituteAdmin.findById({ _id: insId });
    const admin = await Admin.findById({ _id: "62596c3a47690fe0d371f5b4" });
    const notify = await new Notification({});
    institute.submitCreditBalance =
      institute.submitCreditBalance + parseInt(tx_iAmounts);
    admin.creditBalance = admin.creditBalance + parseInt(tx_iAmounts);
    notify.notifyContent = `credit Payment (Rs.${tx_iAmounts})  has been paid successfully to Super Admin `;
    notify.notifySender = insId;
    notify.notifyReceiever = admin._id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
    await admin.save();
    await institute.save();
    await notify.save();
  } catch {}
};
