const express = require("express");
const router = express.Router();
const Payroll = require("../../../OptimizeController/Finance/Payroll/PayrollController");
const catchAsync = require("../../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/ins/:id/payroll/query",
  catchAsync(Payroll.render_new_payroll_query)
);

router.get(
  "/:pid/dashboard",
  catchAsync(Payroll.render_payroll_master_query)
);

router.patch(
    "/:pid/payroll/employer/query",
    catchAsync(Payroll.render_edit_payroll_employer_query)
);
  
router.patch(
    "/:pid/new/salary/structure/query",
    catchAsync(Payroll.render_new_salary_structure_query)
);

router.get(
    "/:pid/all/salary/structure/query",
    catchAsync(Payroll.render_all_salary_structure_query)
);
  
router.patch(
    "/:sid/mark/salary/structure/status/query",
    catchAsync(Payroll.render_mark_status_salary_structure_query)
);

module.exports = router;