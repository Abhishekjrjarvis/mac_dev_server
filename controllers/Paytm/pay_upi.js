require("dotenv").config();
const paytm = require("paytmchecksum");
const https = require("https");
const { v4: uuidv4 } = require("uuid");
const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const Notification = require("../../models/notification");
const Student = require("../../models/Student");
const Fees = require("../../models/Fees");
const Checklist = require("../../models/Checklist");
const Finance = require("../../models/Finance");
const User = require("../../models/User");
const Class = require("../../models/Class");
const Status = require("../../models/Admission/status");
const NewApplication = require("../../models/Admission/NewApplication");
const Admission = require("../../models/Admission/Admission");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const Department = require("../../models/Department");
const Participate = require("../../models/ParticipativeEvent/participate");
const BusinessTC = require("../../models/Finance/BToC");
const FeeStructure = require("../../models/Finance/FeesStructure");
const Transport = require("../../models/Transport/transport");
const Vehicle = require("../../models/Transport/vehicle");
const RemainingList = require("../../models/Admission/RemainingList");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const InternalFees = require("../../models/RazorPay/internalFees");
const Exam = require("../../models/Exam");
const ExamFeeStructure = require("../../models/BacklogStudent/ExamFeeStructure");

exports.generatePaytmTxnToken = async (req, res, next) => {
  const { amount, moduleId, paidBy, name } = req.body;
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
  ] = `http://54.224.4.209/api/api/v1/paytm/verify/internal/fee/${moduleId}/paid/${paidBy}/query/${name}`;
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

exports.paytmVerifyResponseStatus = (req, res, next) => {
  const { name, paidBy, moduleId } = req.params;
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
          post_res.on("end", async function () {
            let { body } = JSON.parse(response);
            let status = body?.resultInfo?.resultStatus;
            let price = body?.txnAmount;
            if (status === "TXN_SUCCESS") {
              await internal_fee_query(moduleId, paidBy, status, price);
              res.redirect(`http://54.224.4.209/q/${name}/feed`);
            } else {
              res.redirect(`http://54.224.4.209/q/${name}/feed`);
            }
          });
        });
        post_req.write(post_data);
        post_req.end();
      });
  } else {
    console.log("Checksum Mismatched Error Query 😒");
  }
};

const internal_fee_query = async (moduleId, paidBy, status, tx_amount) => {
  try {
    const student = await Student.findById({ _id: paidBy });
    const studentUser = await User.findById({ _id: `${student?.user}` });
    const institute = await InstituteAdmin.findById({
      _id: `${student?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    const user = await User.findById({
      _id: `${finance.financeHead.user}`,
    });
    const orderPay = await OrderPayment.findById({ _id: order });
    const classes = await Class.findById({ _id: `${student.studentClass}` });
    var new_internal = await InternalFees.findById({ _id: moduleId });
    var fData = await Fees.findOne({ _id: `${new_internal?.fees}` });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var notify = new Notification({});
    var new_receipt = new FeeReceipt({});
    new_receipt.fee_payment_amount = new_internal?.internal_fee_amount;
    new_receipt.fee_payment_mode = "Payment Gateway - PG";
    new_receipt.student = student?._id;
    new_receipt.fee_transaction_date = new Date();
    new_receipt.finance = finance?._id;
    new_receipt.invoice_count = orderPay?.payment_invoice_number;
    new_receipt.order_history = orderPay?._id;
    new_internal.fee_receipt = new_receipt?._id;
    new_receipt.internal_fees = new_internal?._id;
    if (fData) {
      if (
        fData.studentsList.length >= 1 &&
        fData.studentsList.includes(String(student._id))
      ) {
        //
      } else {
        student.studentFee.push(fData._id);
        fData.onlineList.push(student._id);
        student.onlineFeeList.push(fData._id);
        new_internal.internal_fee_status = "Paid";
        student.studentPaidFeeCount += fData.feeAmount;
        if (student.studentRemainingFeeCount >= fData.feeAmount) {
          student.studentRemainingFeeCount -= fData.feeAmount;
        }
        // if (is_author) {
        //   finance.financeBankBalance =
        //     finance.financeBankBalance + parseInt(tx_amount);
        //   finance.financeTotalBalance =
        //     finance.financeTotalBalance + parseInt(tx_amount);
        //   institute.insBankBalance =
        //     institute.insBankBalance + parseInt(tx_amount);
        // } else {
        institute.adminRepayAmount =
          institute.adminRepayAmount + parseInt(tx_amount);
        admin.returnAmount += parseInt(tx_amount);
        // }
        // finance.financeCollectedBankBalance = finance.financeCollectedBankBalance + parseInt(tx_amount);
        notify.notifyContent = `${student.studentFirstName} ${
          student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
        } ${student.studentLastName} paid the ${fData.feeName}/ (Rs.${parseInt(
          tx_amount
        )}) successfully`;
        notify.notify_hi_content = `${student.studentFirstName} ${
          student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
        } ${student.studentLastName} ने ${fData.feeName}/ (Rs.${parseInt(
          tx_amount
        )}) का सफलतापूर्वक पेमेंट किया |`;
        notify.notify_mr_content = `${student.studentFirstName} ${
          student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
        } ${student.studentLastName} ने ${fData.feeName}/ (रु.${parseInt(
          tx_amount
        )}) यशस्वीरित्या भरले`;
        notify.notifySender = student._id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Online Fee";
        // institute.iNotify.push(notify._id);
        // notify.institute = institute._id;
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByStudentPhoto = student._id;
        classes.onlineFeeCollection.push({
          fee: parseInt(tx_amount),
          feeId: fData._id,
        });
        studentUser.payment_history.push(order);
        institute.payment_history.push(order);
        orderPay.payment_fee = fData._id;
        orderPay.payment_by_end_user_id = studentUser._id;
        if (fData.gstSlab > 0) {
          var business_data = new BusinessTC({});
          business_data.b_to_c_month = new Date().toISOString();
          business_data.b_to_c_i_slab = parseInt(fData?.gstSlab) / 2;
          business_data.b_to_c_s_slab = parseInt(fData?.gstSlab) / 2;
          business_data.finance = finance._id;
          finance.gst_format.b_to_c.push(business_data?._id);
          business_data.b_to_c_total_amount = parseInt(tx_amount);
          await business_data.save();
        }
        await Promise.all([
          student.save(),
          fData.save(),
          finance.save(),
          institute.save(),
          user.save(),
          notify.save(),
          admin.save(),
          classes.save(),
          studentUser.save(),
          orderPay.save(),
          new_internal.save(),
          new_receipt.save(),
        ]);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
