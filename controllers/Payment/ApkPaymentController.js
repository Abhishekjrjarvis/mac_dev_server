require("dotenv").config();
const PaytmChecksum = require("paytmchecksum");
const https = require("https");
const { v4: uuidv4 } = require("uuid");

exports.generateTxnToken = async(req, res) => {

var paytmParams = {};

paytmParams.body = {
 "requestType"  : "Payment",
 "mid"   : process.env.PAYTM_MID,
 "websiteName"  : process.env.PAYTM_MERCHANT_KEY,
 "orderId"   : "oid" + uuidv4(),
 "callbackUrl"  : "https://localhost:8080/api/v1/payment/verify/status",
 "txnAmount"  : {
 "value"  : req.body.amount,
 "currency" : "INR",
 },
 "userInfo"  : {
 "custId"  : process.env.PAYTM_CUST_ID,
 },
};


PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function(checksum){

 paytmParams.head = {
  "signature" : checksum
 };

 var post_data = JSON.stringify(paytmParams);

 var options = {

 /* for Staging */
 hostname: 'securegw-stage.paytm.in',

 /* for Production */
 // hostname: 'securegw.paytm.in',

 port: 443,
 path: `/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${paytmParams.body.orderId}`,
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Content-Length': post_data.length
 }
 };

 var response = ""; 
 var post_req = https.request(options, function(post_res) {
 post_res.on('data', function (chunk) {
  response += chunk;
 });
        
 post_res.on('end', function(){
        res.send({signature: JSON.parse(response), oid: paytmParams.body.orderId, mid: paytmParams.body.mid})
 });
 });

 post_req.write(post_data);
 post_req.end();
});
}


exports.paytmVerifyResponseStatus = async(req, res) =>{

var paytmParams = {};
paytmParams.body = {
    "mid" : `${req.body.mid}`,
    "orderId" : `${req.body.orderId}`,
};

PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MERCHANT_KEY).then(function(checksum){
    paytmParams.head = {
        "signature"	: checksum
    };

    var post_data = JSON.stringify(paytmParams);

    var options = {

        /* for Staging */
        hostname: 'securegw-stage.paytm.in',

        /* for Production */
        // hostname: 'securegw.paytm.in',

        port: 443,
        path: '/v3/order/status',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };

    var response = "";
    var post_req = https.request(options, function(post_res) {
        post_res.on('data', function (chunk) {
            response += chunk;
        });

        post_res.on('end', function(){
            let { body } = JSON.parse(response);
            let status = body.resultInfo.resultStatus;
            let message = body.resultInfo.resultMsg
            let txnId = body.txnId;
            res.send({ callbackStatus: 'Payment Status:', status: status, txnId: txnId, message: message});
        });
    });

    post_req.write(post_data);
    post_req.end();
});

}

