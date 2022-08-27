require("dotenv").config();
const PaytmChecksum = require("paytmchecksum");
const https = require("https");
const Payment = require("../../models/Payment");
const Student = require("../../models/Student");
const Fees = require("../../models/Fees");
const Checklist = require("../../models/Checklist");
const Finance = require("../../models/Finance");
const User = require("../../models/User");
const ApplyPayment = require("../../models/ApplyPayment");
const IdCardPayment = require("../../models/IdCardPayment");
const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Notification = require("../../models/notification");
const { v4: uuidv4 } = require("uuid");

exports.generateTxnToken = async(req, res) => {
  console.log('token generated')
    const { amount, fiid, uid, sid, fid } = req.body;
var paytmParams = {};

paytmParams.body = {
 "requestType"  : "Payment",
 "mid"   : process.env.PAYTM_MID,
 "websiteName"  : process.env.PAYTM_MERCHANT_KEY,
 "orderId"   : "oid" + uuidv4(),
 "callbackUrl"  : `https://qviple.com/api/v1/verify/status/${fiid}/${uid}/student/${sid}/fee/${fid}`,
 "txnAmount"  : {
 "value"  : amount,
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
  console.log('callback hit')
    const { fiid, uid, sid, fid } = req.params;
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
            let price = body.txnAmount;
            if (status === "TXN_SUCCESS") {
              console.log('txn success')
                addPayment(body, sid, fid, uid);
                studentPaymentUpdated(fiid, sid, fid, status, price);
                res.status(200).send({ message: 'Payment Successfull 🎉✨🎉✨'})
                // res.redirect(
                //   `http://localhost:3000/user/${uid}/studentdetail/${sid}`
                // );
              } else {
                res.status(402).send({ message: 'Payment Required'})
                // res.redirect(`http://localhost:3000/`);
              }
        });
    });

    post_req.write(post_data);
    post_req.end();
});

}


const addPayment = async (data, studentId, feeId, userId) => {
    try {
      const student = await Student.findById({ _id: studentId });
      const fee = await Fees.findOne({_id: feeId})
      const checklist = await Checklist.findOne({_id: feeId})
      const payment = new Payment(data);
      payment.studentId = student._id;
      payment.feeId = feeId;
      payment.userId = userId;
      student.paymentList.push(payment._id);
      if(fee){
        payment.feeType = fee.feeName
      }
      else if(checklist){
        payment.feeType = checklist.checklistName
      }
      else{}
      await Promise.all([ payment.save(), student.save()])
    } catch (error) {
      console.log("Payment Failed!");
    }
  };


const studentPaymentUpdated = async (
    financeId,
    studentId,
    feeId,
    statusType,
    tx_amount
  ) => {
    try {
      const student = await Student.findById({ _id: studentId });
      const finance = await Finance.findById({ _id: financeId })
        .populate({
          path: "institute",
        })
        .populate({
          path: "financeHead",
          populate: {
            path: "user",
          },
        });
      const user = await User.findById({
        _id: `${finance.financeHead.user._id}`,
      });
      const classes = await Class.findById({_id: `${student.studentClass}`})
      const fData = await Fees.findById({ _id: feeId });
      const checklistData = await Checklist.findById({ _id: feeId });
      const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
      const notify = await new Notification({});
      if (fData) {
        if (
          fData.studentsList.length >= 1 &&
          fData.studentsList.includes(String(student._id))
        ) {
          res.status(200).send({
            message: `${student.studentFirstName} paid the ${fData.feeName}`,
          });
        } else {
          try {
            student.studentFee.push(fData._id);
            fData.onlineList.push(student._id);
            student.onlineFeeList.push(fData._id);
            student.studentPaidFeeCount += fData.feeAmount
            student.studentRemainingFeeCount -= fData.feeAmount
            finance.financeBankBalance =
              finance.financeBankBalance + parseInt(tx_amount);
            finance.institute.insBankBalance =
              finance.institute.insBankBalance + parseInt(tx_amount);
            notify.notifyContent = `${student.studentFirstName}${
              student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
            } ${student.studentLastName} paid the ${
              fData.feeName
            }/ (Rs.${tx_amount}) successfully`;
            admin.returnAmount += parseInt(tx_amount)
            notify.notifySender = student._id;
            notify.notifyReceiever = user._id;
            finance.institute.iNotify.push(notify._id);
            notify.institute = finance.institute;
            user.uNotify.push(notify._id);
            notify.user = user._id;
            notify.notifyByStudentPhoto = student._id;
            classes.onlineFeeCollection.push({
              fee: parseInt(tx_amount),
              feeId: fData._id
            })
            await Promise.all([
              student.save(),
              fData.save(),
              finance.save(),
              finance.institute.save(),
              user.save(),
              notify.save(),
              admin.save(),
              classes.save()
            ])
          } catch {}
        }
      } else if (checklistData) {
        if (
          checklistData.studentsList.length >= 1 &&
          checklistData.studentsList.includes(String(student._id))
        ) {
          res.status(200).send({
            message: `${student.studentFirstName} paid the ${checklistData.checklistName}`,
          });
        } else {
          try {
            student.studentChecklist.push(checklistData._id);
            student.studentPaidFeeCount += fData.feeAmount
            student.studentRemainingFeeCount -= fData.feeAmount
            checklistData.checklistFeeStatus = statusType;
            checklistData.studentsList.push(student._id);
            checklistData.checklistStudent = student._id;
            student.onlineCheckList.push(checklistData._id);
            finance.financeBankBalance =
              finance.financeBankBalance + parseInt(tx_amount);
            finance.institute.insBankBalance =
              finance.institute.insBankBalance + parseInt(tx_amount);
            notify.notifyContent = `${student.studentFirstName}${
              student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
            } ${student.studentLastName} paid the ${
              checklistData.checklistName
            }/ (Rs.${tx_amount}) successfully`;
            admin.returnAmount += parseInt(tx_amount)
            notify.notifySender = student._id;
            notify.notifyReceiever = user._id;
            finance.institute.iNotify.push(notify._id);
            notify.institute = finance.institute;
            user.uNotify.push(notify._id);
            notify.user = user._id;
            notify.notifyByStudentPhoto = student._id;
            await Promise.all([
              student.save(),
              checklistData.save(),
              finance.save(),
              finance.institute.save(),
              user.save(),
              notify.save(),
              admin.save()
            ])
          } catch {}
        }
      }
    } catch {}
  };












// ============================================ Activate Institute APK ======================================

exports.generateActivateTxnToken = async(req, res) => {
    const { amount, id, name } = req.body;
var paytmParams = {};

paytmParams.body = {
 "requestType"  : "Payment",
 "mid"   : process.env.PAYTM_MID,
 "websiteName"  : process.env.PAYTM_MERCHANT_KEY,
 "orderId"   : "oid" + uuidv4(),
 "callbackUrl"  : `https://qviple.com/api/v1/verify/activate/status/${id}/user/${name}`,
 "txnAmount"  : {
 "value"  : amount,
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


exports.paytmVerifyActivateResponseStatus = async(req, res) =>{
    const { id, name } = req.params;
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
            let price = body.txnAmount;
            if (status === "TXN_SUCCESS") {
                addUnlockPayment(body, id, name);
                unlockInstitute(id, price);
                res.status(200).send({ message: 'Payment Successfull 🎉✨🎉✨'})
                // res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
              } else {
                res.status(402).send({ message: 'Payment Required'})
                // res.redirect(`${process.env.FRONT_REDIRECT_URL}/q/${name}/feed`);
              }
        });
    });

    post_req.write(post_data);
    post_req.end();
});

}


const addUnlockPayment = async (data, insId ) => {
    try {
      const unlock = await new IdCardPayment(data);
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
