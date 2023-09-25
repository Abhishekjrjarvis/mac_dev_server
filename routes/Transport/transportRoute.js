const express = require("express");
const router = express.Router();
const Transport = require("../../controllers/Transport/transportController");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/ins/:id/transport/query",
  // isLoggedIn,
  // isApproved,
  catchAsync(Transport.renderNewTransportManager)
);

router.get(
  "/:tid/dashboard",
  // isLoggedIn,
  catchAsync(Transport.renderTransportManagerDashboard)
);

router.post(
  "/:tid/new/vehicle",
  // isLoggedIn,
  catchAsync(Transport.renderNewVehicleQuery)
);

router.post(
  "/vehicle/:vid/new/route",
  // isLoggedIn,
  catchAsync(Transport.renderVehicleNewRoute)
);

router.patch(
  "/vehicle/:vid/route/update",
  // isLoggedIn,
  catchAsync(Transport.renderVehicleUpdateRoute)
);

router.post(
  "/vehicle/:vid/new/passenger",
  // isLoggedIn,
  catchAsync(Transport.renderVehicleNewPassenger)
);

router.delete(
  "/vehicle/:vid/destroy/passenger/:sid",
  // isLoggedIn,
  catchAsync(Transport.renderVehicleDestroyPassenger)
);

router.get(
  "/:tid/all/vehicles",
  // isLoggedIn,
  catchAsync(Transport.renderTransportAllVehicle)
);

router.get(
  "/:tid/all/passengers",
  // isLoggedIn,
  catchAsync(Transport.renderTransportAllPassengerWithBatch)
);

router.get(
  "/:tid/all/vehicles/staff",
  // isLoggedIn,
  catchAsync(Transport.renderTransportAllVehicleStaffQuery)
);

router.get(
  "/one/vehicle/:vid/query",
  // isLoggedIn,
  catchAsync(Transport.renderTransportOneVehicleQuery)
);

router.get(
  "/one/vehicle/:vid/query/all/passengers",
  // isLoggedIn,
  catchAsync(Transport.renderVehicleAllPassengerWithBatch)
);

router.get(
  "/one/vehicle/:vid/route",
  // isLoggedIn,
  catchAsync(Transport.renderTransportOneVehicleRoute)
);

router.get(
  "/vehicle/:vid/student/:sid/route",
  // isLoggedIn,
  catchAsync(Transport.renderTransportVehicleStudentRoute)
);

router.get(
  "/staff/:sid/manage",
  // isLoggedIn,
  catchAsync(Transport.renderTransportVehicleStaffManage)
);

router.get(
  "/user/:uid/manage",
  // isLoggedIn,
  catchAsync(Transport.renderTransportVehicleUserManage)
);

router.post(
  "/:tid/students/:sid/collect/offline",
  // isLoggedIn,
  catchAsync(Transport.renderTransportStudentCollect)
);

router.post(
  "/:tid/students/:sid/exempt/query",
  catchAsync(Transport.renderTransportStudentExempt)
);

router.patch(
  "/:tid/request/finance",
  // isLoggedIn,
  catchAsync(Transport.renderTransportFundsQuery)
);

router.delete(
  "/vehicle/:vid/route/:rid/destroy",
  // isLoggedIn,
  catchAsync(Transport.destroyOneVehicleRouteQuery)
);

router.post("/:tid/new/batch/query", catchAsync(Transport.renderNewBatchQuery));

router.get("/:tid/all/batch/query", catchAsync(Transport.renderAllBatchQuery));

router.post(
  "/:tid/batch-select/:bid",
  catchAsync(Transport.renderCurrentSelectBatchQuery)
);

router.post(
  "/:tid/new/master/query",
  catchAsync(Transport.renderNewMasterQuery)
);

router.get(
  "/:tid/all/master/query",
  catchAsync(Transport.renderAllMasterQuery)
);

router.get(
  "/:tid/all/fee/structure",
  catchAsync(Transport.renderTransportAllFeeStructure)
);

router.post(
  "/:tid/paid/remaining/fee/:sid/student",
  catchAsync(Transport.paidRemainingFeeStudent)
);

router.get(
  "/:tid/all/remaining/array",
  catchAsync(Transport.retrieveTransportRemainingArray)
);

router.get(
  "/:tid/master/deposit/query",
  catchAsync(Transport.renderTransportMasterDepositQuery)
);

router.get(
  "/:tid/master/all/refund/deposit/history",
  catchAsync(Transport.renderTransportMasterAllDepositHistory)
);

router.get(
  "/all/:tid/not/linked/query",
  catchAsync(Transport.renderAllNotLinkedQuery)
);

router.patch(
  "/:tid/linked/one/:id/query",
  catchAsync(Transport.renderOneLinkedQuery)
);

module.exports = router;
