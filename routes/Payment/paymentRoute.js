const express = require('express');
const router = express.Router();

const { processPayment, paytmResponse, processEContentPayment, paytmEContentResponse, 
     getPaymentStatus, processIdCardPayment, paytmIdCardResponse
} = require('../../controllers/Payment/paymentController');

const { processVideoPayment, paytmVideoResponse } = require('../../controllers/Payment/videoPaymentController')
// const { processApplicationPayment, paytmApplicationResponse } = require('../../controllers/Payment/ApplicationController')
// const { processAdmissionPayment, paytmAdmissionResponse } = require('../../controllers/Payment/AdmissionController')

const { processUnlockFeaturePayment, paytmUnlockFeatureResponse } = require('../../controllers/Payment/UnlockController')
const { generateTxnToken } = require("../../controllers/Payment/ApkPaymentController")



// ================= Student Fee And Checklist Payment ====================

router.route('/payment/process').post(processPayment);
router.route('/callback/pay/:fiid/:uid/student/:sid/fee/:fid').post(paytmResponse);
router.route('/payment/status/:id').get(getPaymentStatus);


// ================== EContent Payment Playlist =======================

router.route('/payment/e-content/process').post(processEContentPayment);
router.route('/e-content/callback/user/:uid/playlist/:pid/ins/:fid').post(paytmEContentResponse);


// ================== Video Payment ==========================

router.route('/payment/e-content/video/process').post(processVideoPayment)
router.route('/e-content/video/callback/user/:uid/playlist/:pid/video/:vid/ins/:fid').post(paytmVideoResponse)


// ================== Application Payment ========================

// router.route('/payment/application/process').post(processApplicationPayment);
// router.route('/application/callback/:uid/apply/:aid/ins/:iid/finance/:fid').post(paytmApplicationResponse);



// ================== Admission Payment ========================

// router.route('/payment/admission/process').post(processAdmissionPayment);
// router.route('/admission/callback/:uid/apply/:aid/ins/:iid/finance/:fid').post(paytmAdmissionResponse);



// ================== Id Card Payment ========================

router.route('/payment/id-card/process').post(processIdCardPayment);
router.route('/callback/ins/:id/batch/:batchId').post(paytmIdCardResponse);


// ================== Unlock Feature Payment ========================

router.route('/payment/unlock/process').post(processUnlockFeaturePayment);
router.route('/callback/ins/:id/user/:name').post(paytmUnlockFeatureResponse);

// ============================= APK Token ==========================================
router.route('/generateTxnToken').post(generateTxnToken);

module.exports = router;
