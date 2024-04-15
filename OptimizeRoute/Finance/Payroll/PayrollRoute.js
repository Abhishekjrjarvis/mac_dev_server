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
    "/:pid/new/salary/heads/query",
    catchAsync(Payroll.render_new_salary_heads_query)
);

router.get(
    "/:pid/all/salary/heads/query",
    catchAsync(Payroll.render_all_salary_heads_query)
);

router.get(
    "/one/:shid/salary/heads/query",
    catchAsync(Payroll.render_one_salary_heads_query)
);

router.get(
    "/:pid/all/salary/heads/nested/query",
    catchAsync(Payroll.render_all_salary_heads_nested_query)
);

router.patch(
    "/:pid/new/salary/structure/query",
    catchAsync(Payroll.render_new_salary_structure_query)
);

router.get(
    "/:pid/all/salary/structure/query",
    catchAsync(Payroll.render_all_salary_structure_query)
);

router.get(
    "/one/:srid/salary/structure/query",
    catchAsync(Payroll.render_one_salary_structure_query)
);

router.patch(
    "/one/:sid/salary/days/query",
    catchAsync(Payroll.render_staff_salary_days)
);

router.patch(
    "/one/:sid/attendance/sheet/query",
    catchAsync(Payroll.render_attendance_sheet_query)
);

router.get(
    "/one/:sid/salary/days/query",
    catchAsync(Payroll.render_staff_salary_days)
);

router.get(
    "/one/:sid/attendance/sheet/query",
    catchAsync(Payroll.render_attendance_sheet_query)
);

router.patch(
    "/one/:sid/salary/structure/edit/query",
    catchAsync(Payroll.render_staff_salary_structure_edit_query)
);

router.patch(
    "/one/:sid/salary/compute/query",
    catchAsync(Payroll.render_staff_salary_compute)
);

router.patch(
    "/one/:sid/salary/compute/finalize/query",
    catchAsync(Payroll.render_staff_salary_compute_finalize)
);

router.get(
    "/:pid/monthly/funds/query",
    catchAsync(Payroll.render_monthly_funds_query)
);

router.get(
    "/:pid/all/salary/slip/query",
    catchAsync(Payroll.render_all_salary_slip_query)
);

router.get(
    "/:slid/one/salary/slip/query",
    catchAsync(Payroll.render_one_salary_slip_query)
);

router.get(
    "/:pid/returns/tab/query",
    catchAsync(Payroll.render_returns_tab_query)
);

router.patch(
    "/:pid/returns/tab/add/details/query",
    catchAsync(Payroll.render_returns_tab_add_details_query)
);

router.get(
    "/:pid/returns/tab/show/details/query",
    catchAsync(Payroll.render_returns_tab_show_details_query)
);

router.patch(
    "/:pid/enable/query",
    catchAsync(Payroll.render_mark_status_salary_structure_query)
);

module.exports = router;