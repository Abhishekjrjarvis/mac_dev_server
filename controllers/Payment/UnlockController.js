require("dotenv").config();
const paytm = require("paytmchecksum");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const IdCardPayment = require("../../models/IdCardPayment");
const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Notification = require("../../models/notification");

exports.processUnlockFeaturePayment = async (req, res, next) => {
    const { amount, id, name } = req.body;
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
    ] = `https://qviple.com/api/v1/callback/ins/${id}/user/${name}`;
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
  
  
  exports.paytmUnlockFeatureResponse = (req, res, next) => {
    const { id, name } = req.params;
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
            // hostname: "securegw-stage.paytm.in",
            hostname: 'securegw.paytm.in',
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
                addUnlockPayment(body, id, name);
                unlockInstitute(id, price);
                res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
              } else {
                res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
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
  
  
  const addUnlockPayment = async (data, insId ) => {
    try {
      const unlock = new IdCardPayment(data);
      const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
      unlock.insId = insId;
      admin.exploreFeatureList.push(unlock._id);
      await unlock.save();
      await admin.save();
    } catch (error) {
      console.log("Unlock Payment Failed!");
    }
  };
  
  
  const unlockInstitute = async (insId, tx_iAmounts) => {
    try {
      const institute = await InstituteAdmin.findById({ _id: insId });
      const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
      const notify = await new Notification({});
      admin.featureAmount = admin.featureAmount + parseInt(tx_iAmounts);
      admin.activateAccount += 1
      institute.featurePaymentStatus = 'Paid'
      institute.accessFeature = 'UnLocked'
      institute.activateStatus = 'Activated'
      institute.activateDate = new Date()
      notify.notifyContent = `Feature Unlock Amount ${institute.insName}/ (Rs.${tx_iAmounts})  has been paid successfully stay tuned...`;
      notify.notifySender = institute._id
      notify.notifyReceiever = admin._id
      admin.aNotify.push(notify._id);
      notify.notifyByInsPhoto = institute._id;
      await Promise.all([ institute.save(), admin.save(), notify.save()])
    } catch {}
  };
  