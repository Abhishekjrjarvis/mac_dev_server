const express = require("express");
const router = express.Router();
const Alumini = require("../../controllers/Alumini/aluminiController");
const catchAsync = require("../../Utilities/catchAsync");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/ins/:id/staff/:sid", catchAsync(Alumini.renderNewAluminiQuery));

router.get(
  "/:aid/dashboard/query",
  catchAsync(Alumini.renderAluminiDashboardQuery)
);

router.post(
  "/:aid/new/register",
  catchAsync(Alumini.renderAluminiNewRegisterFormQuery)
);

router.get(
  "/:aid/all/registration/array",
  catchAsync(Alumini.renderAluminiAllRegistrationArray)
);

router.patch(
  "/:rid/give/certificate",
  catchAsync(Alumini.renderGiveAluminiCertificateQuery)
);

router.get(
  "/:aid/all/prominent/array",
  catchAsync(Alumini.renderAluminiAllProminentArray)
);

router.post(
  "/:aid/new/prominent/query",
  catchAsync(Alumini.renderAluminiNewProminentQuery)
);

module.exports = router;
