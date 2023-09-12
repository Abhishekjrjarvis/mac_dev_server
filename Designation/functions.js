const InstituteAdmin = require("../models/InstituteAdmin");
const User = require("../models/User");
const Staff = require("../models/Staff");
const Notification = require("../models/notification");
const InsAnnouncement = require("../models/InsAnnouncement");
const Student = require("../models/Student");
const Department = require("../models/Department");
const InsDocument = require("../models/Document/InsDocument");
const Admin = require("../models/superAdmin");
const Fees = require("../models/Fees");
const Report = require("../models/Report");
const Batch = require("../models/Batch");
const Admission = require("../models/Admission/Admission");
const Finance = require("../models/Finance");
const FinanceModerator = require("../models/Moderator/FinanceModerator");
const NewApplication = require("../models/Admission/NewApplication");
const DisplayPerson = require("../models/DisplayPerson");
const bcrypt = require("bcryptjs");
const Subject = require("../models/Subject");
const StudentNotification = require("../models/Marks/StudentNotification");
const Class = require("../models/Class");
const ClassMaster = require("../models/ClassMaster");
const SubjectMaster = require("../models/SubjectMaster");
const ReplyAnnouncement = require("../models/ReplyAnnouncement");
const invokeFirebaseNotification = require("../Firebase/firebase");
const invokeMemberTabNotification = require("../Firebase/MemberTab");
const Status = require("../models/Admission/status");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const ReplyComment = require("../models/ReplyComment/ReplyComment");
const { uploadDocFile, uploadFile } = require("../S3Configuration");
const fs = require("fs");
const util = require("util");
const encryptionPayload = require("../Utilities/Encrypt/payload");
const { todayDate } = require("../Utilities/timeComparison");
const { randomSixCode } = require("../Service/close");
const unlinkFile = util.promisify(fs.unlink);
const { file_to_aws } = require("../Utilities/uploadFileAws");
const { shuffleArray } = require("../Utilities/Shuffle");
const {
  designation_alarm,
  email_sms_designation_alarm,
  email_sms_payload_query,
  whats_app_sms_payload,
} = require("../WhatsAppSMS/payload");
const {
  render_institute_current_role,
} = require("../controllers/Moderator/roleController");
const { announcement_feed_query } = require("../Post/announceFeed");
const { handle_undefined } = require("../Handler/customError");
const ExamFeeStructure = require("../models/BacklogStudent/ExamFeeStructure");
const { applicable_pending_calc } = require("../Functions/SetOff");
const {
  send_phone_login_query,
  generate_hash_pass,
} = require("../helper/functions");
const { nested_document_limit } = require("../helper/databaseFunction");
const Chapter = require("../models/Academics/Chapter");

exports.all_new_designation_query = async (d_array, sid, id) => {
  try {
    var staff = await Staff.findById({ _id: sid }).populate({
      path: "user",
    });
    var user = await User.findById({ _id: `${staff.user._id}` });
    var institute = await InstituteAdmin.findById({
      _id: id,
    });
    for (var ele of d_array) {
      if (`${ele?.role}` === "DEPARTMENT_HEAD") {
        var department = await Department.findById({ _id: `${ele?.roleId}` });
        var notify = new Notification({});
        department.dHead = staff._id;
        department.staffCount += 1;
        staff.staffDepartment.push(department._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = department?.dTitle;
        staff.designation_array.push({
          role: "Department Head",
          role_id: department?._id,
        });
        user.departmentChat.push({
          isDepartmentHead: "Yes",
          department: department._id,
        });
        if (
          department.departmentChatGroup.length >= 1 &&
          department.departmentChatGroup.includes(`${staff._id}`)
        ) {
        } else {
          department.departmentChatGroup.push(staff._id);
        }
        notify.notifyContent = `you got the designation of ${department.dName} as ${department.dTitle}`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByInsPhoto = institute._id;
        notify.notifyCategory = "Department Designation";
        await invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        await Promise.all([department.save(), notify.save()]);
        designation_alarm(
          user?.userPhoneNumber,
          "DHEAD",
          institute?.sms_lang,
          department?.dName,
          department?.dTitle,
          ""
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "DHEAD",
            institute?.sms_lang,
            department?.dName,
            department?.dTitle,
            ""
          );
        }
      }
      if (`${ele?.role}` === "CLASS_TEACHER") {
        var classRoom = await Class.findById({ _id: `${ele?.roleId}` });
        var depart = await Department.findById({
          _id: `${classRoom?.department}`,
        });
        var notify = new Notification({});
        if (
          depart.departmentChatGroup.length >= 1 &&
          depart.departmentChatGroup.includes(`${staff._id}`)
        ) {
        } else {
          depart.departmentChatGroup.push(staff._id);
          depart.staffCount += 1;
        }
        staff.staffClass.push(classRoom._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = classRoom?.classHeadTitle;
        staff.designation_array.push({
          role: "Class Teacher",
          role_id: classRoom?._id,
        });
        classRoom.classTeacher = staff._id;
        user.classChat.push({
          isClassTeacher: "Yes",
          classes: classRoom._id,
        });
        notify.notifyContent = `you got the designation of ${classRoom.className} as ${classRoom.classHeadTitle}`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Class Designation";
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByInsPhoto = institute._id;
        await invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        await Promise.all([classRoom.save(), notify.save()]);
        designation_alarm(
          user?.userPhoneNumber,
          "CLASS",
          institute?.sms_lang,
          classRoom?.className,
          classRoom?.classTitle,
          ""
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "CLASS",
            institute?.sms_lang,
            classRoom?.className,
            classRoom?.classTitle,
            ""
          );
        }
      }
      if (`${ele?.role}` === "SUBJECT_TEACHER") {
        var subject = await Subject.findById({ _id: `${ele?.roleId}` });
        var classes = await Class.findById({ _id: `${subject?.class}` });
        var depart = await Department.findById({
          _id: `${classes?.department}`,
        });
        var notify = new Notification({});
        if (
          depart.departmentChatGroup.length >= 1 &&
          depart.departmentChatGroup.includes(`${staff._id}`)
        ) {
        } else {
          depart.departmentChatGroup.push(staff._id);
          depart.staffCount += 1;
          await depart.save();
        }
        staff.staffSubject.push(subject._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = subject?.subjectTitle;
        staff.designation_array.push({
          role: "Subject Teacher",
          role_id: subject?._id,
        });
        user.subjectChat.push({
          isSubjectTeacher: "Yes",
          subjects: subject._id,
        });
        subject.subjectTeacherName = staff._id;
        notify.notifyContent = `you got the designation of ${subject.subjectName} of ${classes.className} as ${subject.subjectTitle}`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Subject Designation";
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByInsPhoto = institute._id;
        if (ele?.batch_arr?.length > 0) {
          for (var ref of ele?.batch_arr) {
            staff.staffBatch.push(ref);
            subject.selected_batch_query = ref;
          }
        }
        await invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          subject.subjectName,
          user._id,
          user.deviceToken
        );
        await Promise.all([subject.save(), notify.save()]);
        designation_alarm(
          user?.userPhoneNumber,
          "SUBJECT",
          institute?.sms_lang,
          subject?.subjectName,
          subject?.subjectTitle,
          classes?.className
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "SUBJECT",
            institute?.sms_lang,
            subject?.subjectName,
            subject?.subjectTitle,
            classes?.className
          );
        }
      }
      if (`${ele?.role}` === "FINANCE_MANAGER") {
        var finance = await Finance.findById({ _id: `${ele?.roleId}` });
        var notify = new Notification({});
        staff.financeDepartment.push(finance._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = "Finance Manager";
        staff.designation_array.push({
          role: "Finance Manager",
          role_id: finance?._id,
        });
        finance.financeHead = staff._id;
        let password = await generate_hash_pass();
        finance.designation_password = password?.pass;
        notify.notifyContent = `you got the designation of as Finance Manager A/c Access Pin - ${password?.pin}`;
        notify.notify_hi_content = `आपको वित्त व्यवस्थापक के रूप में पदनाम मिला है |`;
        notify.notify_mr_content = `तुम्हाला वित्त व्यवस्थापक म्हणून पद मिळाले आहे`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Finance Designation";
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByInsPhoto = institute._id;
        await invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        await Promise.all([finance.save(), notify.save()]);
        designation_alarm(
          user?.userPhoneNumber,
          "FINANCE",
          institute?.sms_lang,
          "",
          "",
          ""
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "FINANCE",
            institute?.sms_lang,
            "",
            "",
            ""
          );
        }
      }
      if (`${ele?.role}` === "ADMISSION_ADMIN") {
        var admission = await Admission.findById({ _id: `${ele?.roleId}` });
        var notify = new Notification({});
        staff.admissionDepartment.push(admission._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = "Admission Admin";
        staff.designation_array.push({
          role: "Admission Admin",
          role_id: admission?._id,
        });
        admission.admissionAdminHead = staff._id;
        let password = await generate_hash_pass();
        admission.designation_password = password?.pass;
        notify.notifyContent = `you got the designation of Admission Admin A/c Access Pin - ${password?.pin}`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Admission Designation";
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyPid = "1";
        notify.notifyByInsPhoto = institute._id;
        await invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        await Promise.all([admission.save(), notify.save()]);
        designation_alarm(
          user?.userPhoneNumber,
          "ADMISSION",
          institute?.sms_lang,
          "",
          "",
          ""
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "ADMISSION",
            institute?.sms_lang,
            "",
            "",
            ""
          );
        }
      }
      if (`${ele?.role}` === "LIBRARIAN") {
        var library = await Library.findById({ _id: `${ele?.roleId}` });
        var notify = new Notification({});
        staff.library.push(library._id);
        staff.recentDesignation = "Library Head";
        staff.staffDesignationCount += 1;
        staff.designation_array.push({
          role: "Library Head",
          role_id: library?._id,
        });
        library.libraryHead = staff?._id;
        notify.notifyContent = `you got the designation of as Library Head`;
        notify.notifySender = institute._id;
        notify.notifyReceiever = user._id;
        user.uNotify.push(notify._id);
        notify.notifyCategory = "Library Designation";
        notify.user = user._id;
        notify.notifyByInsPhoto = institute._id;
        await invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        await Promise.all([notify.save(), library.save()]);
        designation_alarm(
          user?.userPhoneNumber,
          "LIBRARY",
          institute?.sms_lang,
          "",
          "",
          ""
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "LIBRARY",
            institute?.sms_lang,
            "",
            "",
            ""
          );
        }
      }
      if (`${ele?.role}` === "HOSTEL_MANAGER") {
        var hostel = await Hostel.findById({ _id: `${ele?.roleId}` });
        var notify = new Notification({});
        staff.hostelDepartment.push(hostel?._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = "Hostel Manager";
        staff.designation_array.push({
          role: "Hostel Manager",
          role_id: hostel?._id,
        });
        hostel.hostel_manager = staff._id;
        notify.notifyContent = `you got the designation of as Hostel Manager`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Hostel Designation";
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByInsPhoto = institute._id;
        await invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        await Promise.all([notify.save(), hostel.save()]);
        designation_alarm(
          user?.userPhoneNumber,
          "HOSTEL",
          institute?.sms_lang,
          "",
          "",
          ""
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "HOSTEL",
            institute?.sms_lang,
            "",
            "",
            ""
          );
        }
      }
      if (`${ele?.role}` === "EVENT_MANAGER") {
      }
      if (`${ele?.role}` === "ALUMNI") {
      }
      if (`${ele?.role}` === "TRANSPORT_MANAGER") {
      }
    }
    await Promise.all([staff.save(), user.save()]);
  } catch (e) {
    console.log(e);
  }
};
