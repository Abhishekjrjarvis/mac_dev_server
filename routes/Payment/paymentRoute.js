const express = require('express');
const router = express.Router();

const { processPayment, paytmResponse, processEContentPayment, paytmEContentResponse, 
     getPaymentStatus, processIdCardPayment, paytmIdCardResponse
} = require('../../controllers/Payment/paymentController');

const { processVideoPayment, paytmVideoResponse } = require('../../controllers/Payment/videoPaymentController')
// const { processApplicationPayment, paytmApplicationResponse } = require('../../controllers/Payment/ApplicationController')
const { processAdmissionPayment, paytmAdmissionResponse } = require('../../controllers/Payment/admissionPaymentController')

const { processUnlockFeaturePayment, paytmUnlockFeatureResponse } = require('../../controllers/Payment/UnlockController')
const { generateTxnToken, paytmVerifyResponseStatus, generateActivateTxnToken, paytmVerifyActivateResponseStatus } = require("../../controllers/Payment/ApkPaymentController")
const { generateAdmissionTxnToken, paytmVerifyAdmissionResponseStatus } = require('../../controllers/Payment/APK/apkAdmissionPayment')

const { processParticipateEventPayment, paytmParticipateEventResponse } = require('../../controllers/Payment/ParticipativeEvent/eventPayment')
const { generateParticipateEventTxnToken, paytmVerifyParticipateEventResponseStatus } = require('../../controllers/Payment/ParticipativeEvent/apkEventPayment')

// ================= Student Fee And Checklist Payment ====================

router.route('/payment/process').post(processPayment);
router.route('/callback/pay/:fiid/:uid/student/:sid/fee/:fid/:name/:value').post(paytmResponse);
router.route('/payment/status/:id').get(getPaymentStatus);


// ================== EContent Payment Playlist =======================

// router.route('/payment/e-content/process').post(processEContentPayment);
// router.route('/e-content/callback/user/:uid/playlist/:pid/ins/:fid').post(paytmEContentResponse);


// ================== Video Payment ==========================

// router.route('/payment/e-content/video/process').post(processVideoPayment)
// router.route('/e-content/video/callback/user/:uid/playlist/:pid/video/:vid/ins/:fid').post(paytmVideoResponse)


// ================== Application Payment ========================

// router.route('/payment/application/process').post(processApplicationPayment);
// router.route('/application/callback/:uid/apply/:aid/ins/:iid/finance/:fid').post(paytmApplicationResponse);



// ================== Admission Payment ========================

router.route('/payment/admission/process').post(processAdmissionPayment);
router.route('/admission/callback/:uid/apply/:aid/student/:sid/status/:statusId/q/:name/value/:value').post(paytmAdmissionResponse);


// ================== Participate Event Payment ========================

router.route('/payment/participate/process').post(processParticipateEventPayment);
router.route('/participate/callback/:uid/event/:eid/student/:sid/status/:nid/q/:name/value/:value').post(paytmParticipateEventResponse);



// ================== Id Card Payment ========================

// router.route('/payment/id-card/process').post(processIdCardPayment);
// router.route('/callback/ins/:id/batch/:batchId').post(paytmIdCardResponse);


// ================== Unlock Feature Payment ========================

router.route('/payment/unlock/process').post(processUnlockFeaturePayment);
router.route('/callback/ins/:id/user/:name').post(paytmUnlockFeatureResponse);

// ============================= APK Token ==========================================
router.route('/generateTxnToken').post(generateTxnToken);
router.route('/verify/status/:fiid/:uid/student/:sid/fee/:fid/:value').post(paytmVerifyResponseStatus);

// ============================= Institute Unlock APK Token ==========================================
router.route('/generateActivateTxnToken').post(generateActivateTxnToken);
router.route('/verify/activate/status/:id/user/:name').post(paytmVerifyActivateResponseStatus);

// ============================= APK Admission Token ==========================================
router.route('/generateAdmissionTxnToken').post(generateAdmissionTxnToken);
router.route('/verify/admission/:uid/apply/:aid/student/:sid/status/:statusId/value/:value').post(paytmVerifyAdmissionResponseStatus);

// ============================= APK Participate Event Token ==========================================
router.route('/generateParticipateTxnToken').post(generateParticipateEventTxnToken);
router.route('/verify/participate/:uid/event/:eid/student/:sid/status/:nid/value/:value').post(paytmVerifyParticipateEventResponseStatus);


module.exports = router;
