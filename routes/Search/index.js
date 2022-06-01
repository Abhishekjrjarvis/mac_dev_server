const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../../middleware");
const {
  searchInstitute,
  searchInstituteUniversal,
  searchUserInstitute,
  searchUser,
  searchUserUniversal,
  searchDepartment,
  searchClass,
  searchClassMaster,
  searchSubject,
  searchStudent,
  searchStaff,
  searchStaffRequest,
  searchAllStaff,
  searchSubjectMaster,
  searchInsitiuteAnnouncement,
  searchInsitiuteComplaint,
  searchDepartmentStaff,
  searchChecklist,
  searchFees,
  searchClassStudent,
  searchSubjectStudent,
  searchLibraryBook,
  searchLibraryBookIssue,
  searchLibraryBookCollect,
  searchLibraryBookMember,
} = require("../../controllers/Search/index");

router.route("/institute").get(isLoggedIn, searchInstitute);
router
  .route("/institute/:id/allsearch")
  .get(isLoggedIn, searchInstituteUniversal);
router.route("/user/institute").get(isLoggedIn, searchUserInstitute);
router.route("/user").get(isLoggedIn, searchUser);
router.route("/user/:id/allsearch").get(isLoggedIn, searchUserUniversal);
router.route("/:id/department").get(isLoggedIn, searchDepartment);
router.route("/:did/class/:bid").get(isLoggedIn, searchClass);
router.route("/:did/classmaster").get(isLoggedIn, searchClassMaster);
router.route("/:did/subject").get(isLoggedIn, searchSubject);
router.route("/:id/student").get(isLoggedIn, searchStudent);
router.route("/:id/staff").get(isLoggedIn, searchStaff);
router.route("/:id/staffrequest").get(isLoggedIn, searchStaffRequest);
router.route("/staff").get(isLoggedIn, searchAllStaff);
router.route("/:id/subject/master").get(isLoggedIn, searchSubjectMaster);
router.route("/:id/announcement").get(isLoggedIn, searchInsitiuteAnnouncement);
router.route("/:id/complaint").get(isLoggedIn, searchInsitiuteComplaint);
router
  .route("/department/staffroom/:bid")
  .get(isLoggedIn, searchDepartmentStaff);

router.route("/:did/checklist").get(isLoggedIn, searchChecklist);
router.route("/:did/fees").get(isLoggedIn, searchFees);
router.route("/class/:cid/student").get(isLoggedIn, searchClassStudent);
router
  .route("/subjectteacher/subject/:sid")
  .get(isLoggedIn, searchSubjectStudent);

router.route("/library/:lid/book").get(isLoggedIn, searchLibraryBook);
router
  .route("/library/:lid/book/issue")
  .get(isLoggedIn, searchLibraryBookIssue);
router
  .route("/library/:lid/book/collect")
  .get(isLoggedIn, searchLibraryBookCollect);
router
  .route("/library/:lid/book/member")
  .get(isLoggedIn, searchLibraryBookMember);

module.exports = router;
