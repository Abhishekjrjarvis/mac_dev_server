const express = require("express");
const router = express.Router();
const AcademicDepartment = require("../../OptimizeController/AcademicDepartment/academicDepartment");
const catchAsync = require("../../Utilities/catchAsync");
const { isLoggedIn, isApproved } = require("../../middleware");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/ins/:id/department/query",
  catchAsync(AcademicDepartment.retrieveAcademicDepartmentAdminHead)
);


router.get(
    "/:id/department",
    catchAsync(AcademicDepartment.retrieveDepartmentList)
);
  
router.get(
    "/:did/all/subject/master/query",
    catchAsync(AcademicDepartment.render_all_subject_master_query)
  );

router.patch(
  "/map/master/query",
  catchAsync(AcademicDepartment.render_map_master_query)
);


router.get(
    "/:did/all/universal/batch/query",
    catchAsync(AcademicDepartment.render_all_universal_batch_query)
  );

  router.get(
      "/:did/all/classes/query",
      catchAsync(AcademicDepartment.render_all_classes_query)
  );
    
  router.get(
    "/:cid/all/students/query",
    catchAsync(AcademicDepartment.render_all_students_query)
  );

  router.get(
    "/:did/all/students/tab/query",
    catchAsync(AcademicDepartment.render_all_students_tab_query)
  );

  router.get(
    "/:did/all/staff/query",
    catchAsync(AcademicDepartment.render_all_staff_query)
  );

  router.post(
    "/:cid/new/theory/classes",
    catchAsync(AcademicDepartment.render_new_theory_classes)
  );
  
  router.get(
    "/:cid/all/theory/classes",
    catchAsync(AcademicDepartment.render_all_theory_classes)
  );

  router.get(
    "/:sid/one/theory/classes/subject",
    catchAsync(AcademicDepartment.render_one_theory_classes_subject)
  );

  router.patch(
    "/:sid/new/student/add",
    catchAsync(AcademicDepartment.render_new_student_add_query)
  );

  router.patch(
    "/:sid/new/student/remove",
    catchAsync(AcademicDepartment.render_new_student_remove_query)
  );

  router.post(
    "/:cid/new/theory/practical/batch",
    catchAsync(AcademicDepartment.render_new_theory_practical)
  );
  
  router.get(
    "/:cid/all/theory/practical/batch",
    catchAsync(AcademicDepartment.render_all_theory_practical)
  );

  router.get(
    "/:bid/one/theory/practical/batch",
    catchAsync(AcademicDepartment.render_one_theory_practical_batch)
  );

  router.patch(
    "/:bid/new/student/add/batch",
    catchAsync(AcademicDepartment.render_new_student_add_query)
  );
  
  router.patch(
    "/:bid/new/student/remove/batch",
    catchAsync(AcademicDepartment.render_new_student_remove_query)
  );

module.exports = router;
