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
const { send_phone_login_query } = require("../helper/functions");
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
        staff.recentDesignation = req.body.dTitle;
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
        await Promise.all([staff.save(), user.save(), notify.save()]);
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
        staff.recentDesignation = classHeadTitle;
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
        await Promise.all([staff.save(), user.save(), notify.save()]);
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
        staff.recentDesignation = subjectTitle;
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
      }
      if (`${ele?.role}` === "ADMISSION_ADMIN") {
      }
      if (`${ele?.role}` === "LIBRARIAN") {
      }
      if (`${ele?.role}` === "HOSTEL_MANAGER") {
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
