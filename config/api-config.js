const express = require("express");
const router = express.Router();

const uploadRoute = require("../routes/UploadContent/index");
const elearningRoute = require("../routes/Elearning/index");
const libraryRoute = require("../routes/Library/libraryRoute");
const searchRoute = require("../routes/Search/index");
const adminNew = require("../routes/SuperAdmin/adminRoute");
const instituteNew = require("../routes/InstituteAdmin/instituteRoute");
const authNew = require("../routes/Authentication/authRoute");
const financeNew = require("../routes/Finance/financeRoute");
const sportNew = require("../routes/Sport/sportRoute");
const miscellaneousNew = require("../routes/Miscellaneous/miscellaneousRoute");
const userNew = require("../routes/User/userRoute");
const availNew = require("../routes/Attendence/indexRoute");
const landingNew = require("../routes/LandingRoute/indexRoute");
const feesNew = require("../routes/Fees/feesRoute");
const extraNew = require("../routes/Extra/extraRoute");
const institutePostRoute = require("../routes/InstituteAdmin/Post/PostRoute");
const userPostRoute = require("../routes/User/Post/PostRoute");
const superAdminPostRoute = require("../routes/SuperAdmin/Post/PostRoute");
const classRoute = require("../routes/Class/classRoute");
const checklistRoute = require("../routes/Checklist/checklistRoute");
const examRoute = require("../routes/Exam/examRoute");
const mcqRoute = require("../routes/MCQ/mcqRoute");
const batchRoute = require("../routes/Batch/batchRoute");
const complaintLeaveRoute = require("../routes/ComplaintLeave/complaintLeaveRoute");
const questionNew = require("../routes/User/Post/QuestionRoute");
const admissionNew = require("../routes/Admission/admissionRoute");
const pollNew = require("../routes/User/Post/PollsRoute");
const iQuestionNew = require("../routes/InstituteAdmin/Post/QuestionRoute");
const instituteMemberRoute = require("../routes/Edit/instituteMemberRoute");
const staffMemberRoute = require("../routes/Edit/staffMemberRoute");
const studentMemberRoute = require("../routes/Edit/studentMemberRoute");
const userMemberRoute = require("../routes/Edit/userMemberRoute");
const filterNew = require("../routes/Filterization/filterRoute");
const dailyUpdateRoute = require("../routes/dailyUpdate/dailyUpdateRoute");
const timetableRoute = require("../routes/Timetable/timetableRoute");
const prod = require("../routes/ProdAPI/prodRoute");
const election = require("../routes/Election/electionRoute");
const participate = require("../routes/ParticipativeEvent/participateRoute");
const checkout = require("../routes/RazorPay/payCheckoutRoute");
const hashtag = require("../routes/HashTag/hashtagRoute");
const manage = require("../routes/ManageAdmin/manageRoute");
const transport = require("../routes/Transport/transportRoute");
const permission = require("../routes/Moderator/roleRoute");
const mentor_mentee = require("../routes/MentorMentee/mentormenteeRoute");
const event_manager = require("../routes/Event/eventRoutes");
const alumini = require("../routes/Alumini/aluminiRoute");
const siteRoute = require("../routes/Site/siteRoute");
const hostel = require("../routes/Hostel/hostelRoute");
const paytm = require("../routes/Paytm/pay_upi_route");
const community = require("../routes/Community/communityRoute");
const apkPaytm = require("../routes/Paytm/apk_pay_upi_route");
const guest = require("../routes/GuestOnline/guestRoute");
const academics = require("../routes/Academics/academicRoute");
const department = require("../routes/Department/departmentRoute");
const copoRoute = require("../routes/Copo/copoRoute");
const lmsRoute = require("../routes/LMS/LMSRoute");


// V2 

const authNewV2 = require("../OptimizeRoute/Authentication/authRoute");
const financeNewV2 = require("../OptimizeRoute/Finance/financeRoute");
const admissionNewV2 = require("../OptimizeRoute/Admission/admissionRoute");
const guestV2 = require("../OptimizeRoute/GuestOnline/guestRoute");
const userNewV2 = require("../OptimizeRoute/User/userRoute");
const extraNewV2 = require("../OptimizeRoute/Extra/extraRoute");
const uploadRouteV2 = require("../OptimizeRoute/UploadContent/index");
const departmentV2 = require("../OptimizeRoute/Department/departmentRoute");
const filterNewV2 = require("../OptimizeRoute/Filterization/filterRoute");
const instituteNewV2 = require("../OptimizeRoute/InstituteAdmin/instituteRoute");
const manageV2 = require("../OptimizeRoute/ManageAdmin/manageRoute");
const examRouteV2 = require("../OptimizeRoute/Exam/examRoute");
const searchRouteV2 = require("../OptimizeRoute/Search/index");
const permissionV2 = require("../OptimizeRoute/Moderator/roleRoute");
const adminNewV2 = require("../OptimizeRoute/SuperAdmin/adminRoute");
const checkoutV2 = require("../OptimizeRoute/RazorPay/payCheckoutRoute");
const urlV2 = require("../OptimizeRoute/URL/shortUrlRoute");
const availNewV2 = require("../OptimizeRoute/Attendence/indexRoute");
const feesNewV2 = require("../OptimizeRoute/Fees/feesRoute");
const institutePostRouteV2 = require("../OptimizeRoute/InstituteAdmin/Post/PostRoute");
const userPostRouteV2 = require("../OptimizeRoute/User/Post/PostRoute");
const paytmV2 = require("../OptimizeRoute/Paytm/pay_upi_route");
const instituteMemberRouteV2 = require("../OptimizeRoute/Edit/instituteMemberRoute");
const staffMemberRouteV2 = require("../OptimizeRoute/Edit/staffMemberRoute");
const studentMemberRouteV2 = require("../OptimizeRoute/Edit/studentMemberRoute");
const userMemberRouteV2 = require("../OptimizeRoute/Edit/userMemberRoute");
const staffAttendanceRouteV2 = require("../OptimizeRoute/StaffAttendance/staffAttendanceRoute");
const studentFeedbackRouteV2 = require("../OptimizeRoute/StudentFeedback/studentFeedbackRoute");
const storeV2 = require("../OptimizeRoute/Stores/storeRoute");

// Api Middleware Func

router.use("/api/v1/search", searchRoute);
router.use("/api/v1/all-images", uploadRoute);
router.use("/api/v1/elearning", elearningRoute);
router.use("/api/v1/library", libraryRoute);
router.use("/api/v1/class", classRoute);
router.use("/api/v1/checklist", checklistRoute);
router.use("/api/v1/exam", examRoute);
router.use("/api/v1/mcq", mcqRoute);
router.use("/api/v1/batch", batchRoute);
router.use("/api/v1/compleave", complaintLeaveRoute);
router.use("/api/v1/admin", adminNew);
router.use("/api/v1/ins", instituteNew);
router.use("/api/v1/ins/post", institutePostRoute);
router.use("/api/v1/admin/post", superAdminPostRoute);
router.use("/api/v1/auth", authNew);
router.use("/api/v1/finance", financeNew);
router.use("/api/v1/sport/arts", sportNew);
router.use("/api/v1/all", miscellaneousNew);
router.use("/api/v1/user", userNew);
router.use("/api/v1/user/post", userPostRoute);
router.use("/api/v1/attendance", availNew);
router.use("/api/v1/landing", landingNew);
router.use("/api/v1/fees", feesNew);
router.use("/api/v1/extra", extraNew);
router.use("/api/v1/post/question", questionNew);
router.use("/api/v1/poll", pollNew);
router.use("/api/v1/ins/post/question", iQuestionNew);
router.use("/api/v1/feed/filter", filterNew);
router.use("/api/v1/edit/institute", instituteMemberRoute);
router.use("/api/v1/edit/staff", staffMemberRoute);
router.use("/api/v1/edit/student", studentMemberRoute);
router.use("/api/v1/edit/user", userMemberRoute);
router.use("/api/v1/admission", admissionNew);
router.use("/api/v1/dailyupdate", dailyUpdateRoute);
router.use("/api/v1/timetable", timetableRoute);
router.use("/api/v1/election/event", election);
router.use("/api/v1/participate/event", participate);
router.use("/api/v1/pay", checkout);
router.use("/api/v1/hashtag", hashtag);
router.use("/api/v1/manage/admin", manage);
router.use("/api/v1/transport", transport);
router.use("/api/v1/role/permission", permission);
router.use("/api/v1/mentor/mentee", mentor_mentee);
router.use("/api/v1/event/process", event_manager);
router.use("/api/v1/alumini", alumini);
router.use("/api/v1/site", siteRoute);
router.use("/api/v1/hostel", hostel);
router.use("/api/v1/paytm", paytm);
router.use("/api/v1/community", community);
router.use("/api/v1/apk/paytm", apkPaytm);
router.use("/api/v1/guest/pay/online", guest);
router.use("/api/v1/academic/analytics", academics);
router.use("/api/v1/department", department);
router.use("/api/v1/copo", copoRoute);
router.use("/api/v2/lms", lmsRoute);

router.use("/api/v1/prod/access", prod);


router.use("/api/v2/auth", authNewV2);
router.use("/api/v2/finance", financeNewV2);
router.use("/api/v2/admission", admissionNewV2);
router.use("/api/v2/guest/pay/online", guestV2);
router.use("/api/v2/user", userNewV2);
router.use("/api/v2/extra", extraNewV2);
router.use("/api/v2/all-images", uploadRouteV2);
router.use("/api/v2/department", departmentV2);
router.use("/api/v2/feed/filter", filterNewV2);
router.use("/api/v2/ins", instituteNewV2);
router.use("/api/v2/manage/admin", manageV2);
router.use("/api/v2/search", searchRouteV2);
router.use("/api/v2/exam", examRouteV2);
router.use("/api/v2/role/permission", permissionV2);
router.use("/api/v2/admin", adminNewV2);
router.use("/api/v2/pay", checkoutV2);
router.use("/api/v2/url", urlV2);
router.use("/api/v2/attendance", availNewV2);
router.use("/api/v2/fees", feesNewV2);
router.use("/api/v2/ins/post", institutePostRouteV2);
router.use("/api/v2/user/post", userPostRouteV2);
router.use("/api/v2/paytm", paytmV2);
router.use("/api/v2/pay", checkoutV2);
router.use("/api/v2/edit/institute", instituteMemberRouteV2);
router.use("/api/v2/edit/staff", staffMemberRouteV2);
router.use("/api/v2/edit/student", studentMemberRouteV2);
router.use("/api/v2/edit/user", userMemberRouteV2);
router.use("/api/v2/attendance/staff", staffAttendanceRouteV2);
router.use("/api/v2/feedback", studentFeedbackRouteV2);
router.use("/api/v2/store", storeV2);


module.exports = router;
