const InstituteAdmin = require("../models/InstituteAdmin");
const User = require("../models/User");
const Staff = require("../models/Staff");
const Notification = require("../models/notification");
const Department = require("../models/Department");
const Admission = require("../models/Admission/Admission");
const Finance = require("../models/Finance");
const Subject = require("../models/Subject");
const Class = require("../models/Class");
const invokeFirebaseNotification = require("../Firebase/firebase");
const {
  designation_alarm,
  email_sms_designation_alarm,
} = require("../WhatsAppSMS/payload");
const { generate_hash_pass } = require("../helper/functions");
const Library = require("../models/Library/Library");
const Hostel = require("../models/Hostel/hostel");
const EventManager = require("../models/Event/eventManager");
const Alumini = require("../models/Alumini/Alumini");
const Transport = require("../models/Transport/transport");

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
          staff.recommend_authority = department?.dHead;
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
          staff.recommend_authority = department?.dHead;
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
          staff.recommend_authority = department?.dHead;
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
        var event_manager = await EventManager.findById({
          _id: `${ele?.roleId}`,
        });
        var notify = new Notification({});
        staff.eventManagerDepartment.push(event_manager._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = "Events / Seminar Administrator";
        staff.designation_array.push({
          role: "Events / Seminar Administrator",
          role_id: event_manager?._id,
        });
        event_manager.event_head = staff._id;
        notify.notifyContent = `you got the designation of as Events / Seminar Administrator`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Event Manager Designation";
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
        await Promise.all([event_manager.save(), notify.save()]);
        designation_alarm(
          user?.userPhoneNumber,
          "EVENT_MANAGER",
          institute?.sms_lang,
          "",
          "",
          ""
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "EVENT_MANAGER",
            institute?.sms_lang,
            "",
            "",
            ""
          );
        }
      }
      if (`${ele?.role}` === "ALUMNI") {
        var alumini = await Alumini.findById({ _id: `${ele?.roleId}` });
        var notify = new Notification({});
        staff.aluminiDepartment.push(alumini?._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = "Alumini Head";
        staff.designation_array.push({
          role: "Alumini Head",
          role_id: alumini?._id,
        });
        alumini.alumini_head = staff._id;
        notify.notifyContent = `you got the designation of as Alumini Head`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Alumini Designation";
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
        await Promise.all([alumini.save(), notify.save()]);
        designation_alarm(
          user?.userPhoneNumber,
          "ALUMINI",
          institute?.sms_lang,
          "",
          "",
          ""
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "ALUMINI",
            institute?.sms_lang,
            "",
            "",
            ""
          );
        }
      }
      if (`${ele?.role}` === "TRANSPORT_MANAGER") {
        var transport = await Transport.findById({ _id: `${ele?.roleId}` });
        var notify = new Notification({});
        staff.transportDepartment.push(transport._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = "Transportation Manager";
        staff.designation_array.push({
          role: "Transportation Manager",
          role_id: transport?._id,
        });
        transport.transport_manager = staff._id;
        notify.notifyContent = `you got the designation of Transportation Manager 🎉🎉`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Transport Designation";
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
        await Promise.all([transport.save(), notify.save()]);
        designation_alarm(
          user?.userPhoneNumber,
          "TRANSPORT",
          institute?.sms_lang,
          "",
          "",
          ""
        );
        if (user?.userEmail) {
          email_sms_designation_alarm(
            user?.userEmail,
            "TRANSPORT",
            institute?.sms_lang,
            "",
            "",
            ""
          );
        }
      }
    }
    await Promise.all([staff.save(), user.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.classes_shuffle_func = async (classes, student) => {
  try {
    if (classes?.sort_queue == "Alpha") {
      classes.FNameStudent.push(student?._id);
      student.studentROLLNO = classes?.FNameStudent?.length;
    } else if (classes?.sort_queue == "Alpha_Last") {
      classes.LNameStudent.push(student?._id);
      student.studentROLLNO = classes?.LNameStudent?.length;
    } else if (classes?.sort_queue == "Gender") {
      classes.GenderStudent.push(student?._id);
      student.studentROLLNO = classes?.GenderStudent?.length;
    } else if (classes?.sort_queue == "Gender_Alpha") {
      classes.GenderStudentAlpha.push(student?._id);
      student.studentROLLNO = classes?.GenderStudentAlpha?.length;
    } else if (classes?.sort_queue == "ROLL_WISE") {
      classes.roll_wise.push(student?._id);
      student.studentROLLNO = classes?.roll_wise?.length;
    }
  } catch (e) {
    console.log(e);
  }
};
