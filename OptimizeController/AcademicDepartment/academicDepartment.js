const InstituteAdmin = require("../../models/InstituteAdmin");
const User = require("../../models/User");
const Staff = require("../../models/Staff");
const Notification = require("../../models/notification");
const InsAnnouncement = require("../../models/InsAnnouncement");
const Student = require("../../models/Student");
const Department = require("../../models/Department");
const InsDocument = require("../../models/Document/InsDocument");
const Admin = require("../../models/superAdmin");
const Fees = require("../../models/Fees");
const Report = require("../../models/Report");
const Batch = require("../../models/Batch");
const Admission = require("../../models/Admission/Admission");
const Finance = require("../../models/Finance");
const FinanceModerator = require("../../models/Moderator/FinanceModerator");
const NewApplication = require("../../models/Admission/NewApplication");
const DisplayPerson = require("../../models/DisplayPerson");
const bcrypt = require("bcryptjs");
const Subject = require("../../models/Subject");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Class = require("../../models/Class");
const ClassMaster = require("../../models/ClassMaster");
const SubjectMaster = require("../../models/SubjectMaster");
const ReplyAnnouncement = require("../../models/ReplyAnnouncement");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const Status = require("../../models/Admission/status");
const Comment = require("../../models/Comment");
const ReplyComment = require("../../models/ReplyComment/ReplyComment");
const { uploadDocFile, uploadFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const { todayDate } = require("../../Utilities/timeComparison");
const { randomSixCode } = require("../../Service/close");
const unlinkFile = util.promisify(fs.unlink);
const { file_to_aws } = require("../../Utilities/uploadFileAws");
const { shuffleArray } = require("../../Utilities/Shuffle");
const {
  designation_alarm,
  email_sms_designation_alarm,
  email_sms_payload_query,
  whats_app_sms_payload,
} = require("../../WhatsAppSMS/payload");
const {
  render_institute_current_role,
} = require("../Moderator/roleController");
const { handle_undefined } = require("../../Handler/customError");
const ExamFeeStructure = require("../../models/BacklogStudent/ExamFeeStructure");
const { applicable_pending_calc } = require("../../Functions/SetOff");
const { send_phone_login_query, generateAccessToken } = require("../../helper/functions");
const { nested_document_limit } = require("../../helper/databaseFunction");
const Chapter = require("../../models/Academics/Chapter");
const Attainment = require("../../models/Marks/Attainment");
const { calc_profile_percentage } = require("../../Functions/ProfilePercentage");
const QvipleId = require("../../models/Universal/QvipleId");
const { universal_random_password } = require("../../Custom/universalId");
const invokeSpecificRegister = require("../../Firebase/specific");
const { send_global_announcement_notification_query } = require("../../Feed/socialFeed");
const FormChecklist = require("../../models/Form/FormChecklist");
const { form_params } = require("../../Constant/form");
const InstituteStudentForm = require("../../models/Form/InstituteStudentForm");
const LandingControl = require("../../models/LandingModel/LandingControl");
const DepartmentStudentForm = require("../../models/Form/DepartmentStudentForm");
const InstituteStaffForm = require("../../models/Form/InstituteStaffForm");
const { staff_form_params } = require("../../Constant/staff_form");
const InstituteApplicationForm = require("../../models/Form/InstituteApplicationForm");
const DepartmentSite = require("../../models/SiteModels/DepartmentSite");



exports.retrieveAcademicDepartmentAdminHead = async (req, res) => {
  try {
    const { id } = req.params;
    const { sid } = req.body;
    var institute = await InstituteAdmin.findById({ _id: id });
    var department = new Department({ ...req.body });
    const code = universal_random_password();
    department.member_module_unique = `${code}`;
    institute.depart.push(department._id);
    institute.departmentCount += 1;
    department.institute = institute._id;
    department.department_status = "Academic";
    if (sid) {
      var staff = await Staff.findById({ _id: sid }).populate({
        path: "user",
      });
      var user = await User.findById({ _id: `${staff.user._id}` });
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
    } else {
      department.dHead = null;
    }
    var dfs = new DepartmentStudentForm({});
    dfs.department = department?._id;
    department.student_form_setting = dfs?._id;

    const departmentSite = new DepartmentSite({
      related_department: department?._id,
      department_site_status: department?.department_status,
    });
    department.site_info.push(departmentSite?._id);

    await Promise.all(
      [institute.save(), department.save(), departmentSite.save()],
      dfs.save()
    );
    // const dEncrypt = await encryptionPayload(department._id);
    res.status(200).send({
      message: "Successfully Created Department",
      department: department._id,
    });
    var ifs = await InstituteStudentForm.findById({
      _id: `${institute?.student_form_setting}`,
    })
      .select("form_section")
      .populate({
        path: "form_section.form_checklist",
      });
    var nums = [];
    for (var val of ifs?.form_section) {
      if (val?.form_checklist?.length > 0) {
        for (var ele of val?.form_checklist) {
          var fc = new FormChecklist({
            form_checklist_name: ele?.form_checklist_name,
            form_checklist_key: ele?.form_checklist_key,
            form_checklist_visibility: ele?.form_checklist_visibility,
            form_checklist_placeholder: ele?.form_checklist_placeholder,
            form_checklist_lable: ele?.form_checklist_lable,
            form_checklist_typo: ele?.form_checklist_typo,
            form_checklist_typo_option_pl: [
              ...ele?.form_checklist_typo_option_pl,
            ],
            form_checklist_required: ele?.form_checklist_required,
            width: ele?.width,
          });
          if (
            ele?.form_checklist_typo_option_pl &&
            ele?.form_checklist_typo_option_pl?.length > 0
          ) {
            ele.form_checklist_typo_option_pl = [
              ...ele?.form_checklist_typo_option_pl,
            ];
          }
          fc.department_form = dfs?._id;
          fc.form_section = val?._id;
          nums.push(fc?._id);
          await fc.save();
        }
      }
      dfs.form_section.push({
        section_name: val?.section_name,
        section_visibilty: val?.section_visibilty,
        section_key: val?.section_key,
        section_pdf: val?.section_pdf,
        section_value: val?.section_value,
        ins_form_section_id: val?._id,
        form_checklist: [...nums],
      });
      nums = [];
    }
    await dfs.save();
    const new_exam_fee = new ExamFeeStructure({
      exam_fee_type: "Per student",
      exam_fee_status: "Static Department Linked",
    });
    new_exam_fee.department = department?._id;
    department.exam_fee_structure.push(new_exam_fee?._id);
    department.exam_fee_structure_count += 1;
    await Promise.all([department.save(), new_exam_fee.save()]);
  } catch (e) {
    console.log(e);
  }
};


exports.retrieveDepartmentList = async (req, res) => {
    try {
        const { id } = req.params;
        const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
      if (!id)
        return res.status(200).send({
          message: "Their is a bug need to fixed immediatley",
          access: false,
        });
        const institute = await InstituteAdmin.findById({ _id: id })
          
        const all_depart = await Department.find({ $and: [{ _id: { $in: institute?.depart } }, { department_status: "Academic" }] })
            .limit(limit)
        .skip(skip)    
        .select("dName photo photoId dTitle classMasterCount classCount departmentSelectBatch")
        .populate({
          path: "dHead",
          select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto user",
                populate: {
                    path: "user",
                    select: "userBio userAbout",
                  },
        })
          .populate({
            path: "active_academic_batch",
            select: "batchName batchStatus"
      })
      if (all_depart) {
        res.status(200).send({ message: "Success", all_depart });
      } else {
        res.status(404).send({ message: "Failure" });
      }
    } catch (e) {
      console.log(e);
    }
  };

exports.render_all_subject_master_query = async (req, res) => {
    try {
        const { did } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
        if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        const depart = await Department.findById({ _id: did })
        const all_subjects = await SubjectMaster.find({ _id: { $in: depart?.merged_subject_master} })
            .limit(limit)
            .skip(skip)
            .select("subjectName department link_subject_master")
            .populate({
                path: "department",
                select: "dName"
            })
            res.status(200).send({ message: "Explore All Subject Master Query", access: true, all_subjects: all_subjects})
    }
    catch (e) {
        console.log(e)
    }
}
  
exports.render_map_master_query = async (req, res) => {
    try {
        const { subId, mapId, did } = req?.body
        if (!mapId) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        
        const depart = await Department.findById({ _id: did })
        // const subjects = await SubjectMaster.findById({ _id: subId })
        const subjects_extra = await SubjectMaster.findById({ _id: mapId })

        // subjects.link_subject_master = subjects_extra?._id
        subjects_extra.link_department = depart?._id
        depart.merged_subject_master.push(subjects_extra?._id)

        await Promise.all([ subjects_extra.save(), depart.save()])
        res.status(200).send({ message: "Explore One Subject Master Map Query", access: true})

    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_universal_batch_query = async (req, res) => {
    try {
        const { did } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        const depart = await Department.findById({ _id: did })
        const all_subjects = await SubjectMaster.find({ _id: { $in: depart?.merged_subject_master} })
            .select("subjectName department link_subject_master")
        
        var nums = []
        for (let ele of all_subjects) {
            const all_batch = await Batch.find({ $and: [{ department: ele?.department }, { merged_batch: "Merged" }] })
            for (let val of all_batch) {
                if (nums?.includes(`${val?._id}`)) {
                    
                }
                else {
                    nums.push(val?._id)       
                }
            }
        }

        if (nums?.length > 0) {
            const all_batch = await Batch.find({ _id: { $in: nums } })
                .select("batchName batchStatus")
                .populate({
                    path: "u_batch",
                    select: "batchName batchStatus"
                })
            res.status(200).send({ message: "Explore All Batches Query", access: true, all_batch: all_batch})
        }
        else {
            res.status(200).send({ message: "No Batches Query", access: true, all_batch: []})            
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_classes_query = async (req, res) => {
    try {
        const { did } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        const depart = await Department.findById({ _id: did })
        const all_subjects = await SubjectMaster.find({ _id: { $in: depart?.merged_subject_master} })
            .select("subjectName department link_subject_master")
            .populate({
                path: "subjects",
                select: "class",
                populate: {
                    path: "class",
                    select: "masterClassName"
                }
        })
        
        var nums = []
        for (let ele of all_subjects) {
            for (let val of ele?.subjects) {
                if (nums?.includes(`${val?.class?.masterClassName}`)) {
                    
                }
                else {
                    nums.push(val?.class?.masterClassName)
                }
            }
        }

        if (nums?.length > 0) {
            const all_classes = await ClassMaster.find({ _id: { $in: nums } })
                .select("className")
                .populate({
                    path: "department",
                    select: "dName"
                })
            res.status(200).send({ message: "Explore All Class Master Query", access: true, all_classes: all_classes})
        }
        else {
            res.status(200).send({ message: "No Class Master Query", access: true, all_classes: []})            
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_students_query = async (req, res) => {
    try {
        const { cid } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        const { did } = req?.query
      if (!cid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
      
      const depart = await Department.findById({ _id: did })
        const all_subjects = await SubjectMaster.find({ _id: { $in: depart?.merged_subject_master} })
            .select("subjectName department link_subject_master")
            .populate({
                path: "subjects",
                select: "class",
        })
        
      var numss = []
      var nums = []
        for (let ele of all_subjects) {
            for (let val of ele?.subjects) {
                if (numss?.includes(`${val?.class}`)) {
                    
                }
                else {
                    numss.push(val?.class)
                }
            }
        }
      // console.log(numss)
        const m_class = await ClassMaster.findById({ _id: cid })
        
      for (let ele of m_class?.classDivision) {
        for (let val of numss) {
          if (`${val}` === `${ele}`) {
            nums.push(val)
          }
        }
      }
      // console.log(nums)
        if (nums?.length > 0) {
            const all_students = await Student.find({ $and: [{ studentClass: { $in: nums } }] })
                // .limit(limit)
                // .skip(skip)
                .select("studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentROLLNO studentGRNO department")
                .populate({
                    path: "studentClass",
                    select: "className"
                })
            const all_stu = await nested_document_limit(page, limit, all_students)
          res.status(200).send({ message: "Explore All Students Query", access: true, all_students: all_stu })
          for (let ele of all_students) {
            if (m_class.all_academic_student?.includes(`${ele?._id}`)) {
              
            }
            else {
              m_class.all_academic_student.push(ele?._id)
            }
          }
          await m_class.save()
        }
        else {
            res.status(200).send({ message: "No Students Query", access: true, all_students: []})            
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_all_students_tab_query = async (req, res) => {
    try {
        const { did } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        const depart = await Department.findById({ _id: did })
        const all_subjects = await SubjectMaster.find({ _id: { $in: depart?.merged_subject_master} })
            .select("subjectName department link_subject_master")
            .populate({
                path: "subjects",
                select: "class",
        })
        
        var nums = []
        for (let ele of all_subjects) {
            for (let val of ele?.subjects) {
                if (nums?.includes(`${val?.class}`)) {
                    
                }
                else {
                    nums.push(val?.class)
                }
            }
        }

        if (nums?.length > 0) {
            const all_students = await Student.find({ studentClass: { $in: nums } })
                .limit(limit)
                .skip(skip)
                .select("studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentROLLNO studentGRNO")
                .populate({
                    path: "studentClass",
                    select: "className"
                })
            res.status(200).send({ message: "Explore All Students Tab Query", access: true, all_students: all_students})
        }
        else {
            res.status(200).send({ message: "No Students Tab Query", access: true, all_students: []})            
        }
    }
    catch (e) {
        console.log(e)
    }
}
exports.render_all_staff_query = async (req, res) => {
    try {
        const { did } = req?.params
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;
        if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
        const depart = await Department.findById({ _id: did })
        const all_subjects = await SubjectMaster.find({ _id: { $in: depart?.merged_subject_master} })
            .select("subjectName department link_subject_master")
            .populate({
                path: "subjects",
                select: "subjectTeacherName",
        })
        
        var nums = []
        for (let ele of all_subjects) {
            for (let val of ele?.subjects) {
                if (nums?.includes(`${val?.subjectTeacherName}`)) {
                    
                }
                else {
                    nums.push(val?.subjectTeacherName)
                }
            }
        }

        if (nums?.length > 0) {
            const all_staff = await Staff.find({ _id: { $in: nums } })
                .limit(limit)
                .skip(skip)
                .select("staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffGender staffROLLNO current_designation teaching_type")
            res.status(200).send({ message: "Explore All Staff Tab Query", access: true, all_staff: all_staff})
        }
        else {
            res.status(200).send({ message: "No Staff Tab Query", access: true, all_staff: []})            
        }
    }
    catch (e) {
        console.log(e)
    }
}

exports.render_new_theory_classes = async (req, res) => {
  try {
    const { cid } = req?.params
    const { staff, did } = req?.body
    if (!cid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const depart = await Department.findById({ _id: did })
    .select("active_academic_batch")
    const classes = await ClassMaster.findById({ _id: cid })
    const new_subject = new Subject({ ...req?.body })
    new_subject.subjectTitle = "Subject Teacher"
    const codess = universal_random_password()
    new_subject.member_module_unique = `${codess}`
    if (staff) {
      const staffs = await Staff.findById({ _id: staff})
      new_subject.subjectTeacherName = staffs
      staffs.staffSubject.push(new_subject?._id)
      await staffs.save()
    }
    classes.theory_classes.push({
      subject: new_subject?._id,
      did: did,
      batch: depart?.active_academic_batch
    })
    classes.theory_classes_count += 1
    await Promise.all([new_subject.save(), classes.save()])
    res.status(200).send({ message: "New Subject Add Query", access: true })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_theory_classes = async (req, res) => {
  try {
    const { cid } = req?.params
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { did } = req?.query
    if (!cid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const classes = await ClassMaster.findById({ _id: cid })
      .populate({
        path: "theory_classes.subject",
        select: "subjectName theory_students optionalStudent",
        populate: {
          path: "subjectTeacherName",
          select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
        }
      })
      .populate({
        path: "theory_classes.subject",
        select: "subjectName theory_students optionalStudent",
        populate: {
          path: "subjectMasterName",
          select: "subjectName",
          populate: {
            path: "department",
            select: "dName"
          }
        }
      })
    var list = []
    for (let ele of classes?.theory_classes) {
      const depart = await Department.findById({ _id: did })
      .select("active_academic_batch")
      if (`${ele?.did}` === `${depart?._id}` && `${ele?.batch}` === `${depart?.active_academic_batch}`) {
        list.push(ele)
      }
    }
    const all_subject = await nested_document_limit(page, limit, list)
    // const all_subject = await Subject.find({ _id: { $in: classes?.theory_classes } })
    //   .limit(limit)
    //   .skip(skip)
    //   .select("subjectName theory_students")
    //   .populate({
    //     path: "subjectTeacherName",
    //     select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
    //   })
      res.status(200).send({ message: "All Subject Query", access: true, all_subject: all_subject })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_theory_classes_subject = async (req, res) => {
  try {
    const { sid } = req?.params
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const subject = await Subject.findById({ _id: sid })
    .select("subjectName theory_students optionalStudent")
    .populate({
      path: "subjectTeacherName",
      select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
    })
    .populate({
      path: "theory_students optionalStudent",
      select: "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO studentGRNO"
    })
      res.status(200).send({ message: "One Subject Query", access: true, subject: subject })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_student_add_query = async (req, res) => {
  try {
    const { sid } = req?.params
    const { students } = req?.body
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var subject = await Subject.findById({ _id: sid })
    if (students?.length > 0) {
      for (let ele of students) {
        subject.theory_students.push(ele) 
        subject.optionalStudent.push(ele)
      }
    }
    await subject.save()
    res.status(200).send({ message: "New Student Add Query", access: true })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_student_remove_query = async (req, res) => {
  try {
    const { sid } = req?.params
    const { students } = req?.body
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var subject = await Subject.findById({ _id: sid })
    if (students?.length > 0) {
      for (let ele of students) {
        subject.theory_students.pull(ele) 
        subject.optionalStudent.pull(ele)
      }
    }
    await subject.save()
    res.status(200).send({ message: "New Student Remove Query", access: true })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_theory_practical = async (req, res) => {
  try {
    const { cid } = req?.params
    const { staff, did } = req?.body
    if (!cid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const depart = await Department.findById({ _id: did })
    .select("active_academic_batch")
    const classes = await ClassMaster.findById({ _id: cid })
    const new_subject = new Subject({ ...req?.body })
    new_subject.subjectTitle = "Subject Teacher"
    const codess = universal_random_password()
    new_subject.member_module_unique = `${codess}`
    if (staff) {
      const staffs = await Staff.findById({ _id: staff})
      new_subject.subjectTeacherName = staffs
      staffs.staffSubject.push(new_subject?._id)
      await staffs.save()
    }
    classes.practical_batch.push({
      subject: new_subject?._id,
      did: did,
      batch: depart?.active_academic_batch
    })
    classes.practical_batch_count += 1
    await Promise.all([new_subject.save(), classes.save()])
    res.status(200).send({ message: "New Practical Subject Add Query", access: true })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_all_theory_practical = async (req, res) => {
  try {
    const { cid } = req?.params
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { did } = req?.query
    if (!cid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const classes = await ClassMaster.findById({ _id: cid })
    .populate({
      path: "practical_batch.subject",
      select: "subjectName theory_students optionalStudent",
      populate: {
        path: "subjectTeacherName",
        select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
      }
    })
    .populate({
      path: "practical_batch.subject",
      select: "subjectName theory_students optionalStudent",
      populate: {
        path: "subjectMasterName",
        select: "subjectName",
        populate: {
          path: "department",
          select: "dName"
        }
      }
    })
    var list = []
    for (let ele of classes?.practical_batch) {
      const depart = await Department.findById({ _id: did })
      .select("active_academic_batch")
      if (`${ele?.did}` === `${depart?._id}` && `${ele?.batch}` === `${depart?.active_academic_batch}`) {
        list.push(ele)
      }
    }
    const all_batch = await nested_document_limit(page, limit, list)
    // const all_batch = await Batch.find({ _id: { $in: classes?.practical_batch } })
    //   .limit(limit)
    //   .skip(skip)
    //   .select("batchName class_student_query")
    //   .populate({
    //     path: "batch_head",
    //     select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
    //   })
      res.status(200).send({ message: "All Batches Query", access: true, all_batch: all_batch })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_one_theory_practical_batch = async (req, res) => {
  try {
    const { bid } = req?.params
    if (!bid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const batch = await Subject.findById({ _id: bid })
    .select("subjectName theory_students optionalStudent")
    .populate({
      path: "subjectTeacherName",
      select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
    })
    .populate({
      path: "theory_students optionalStudent",
      select: "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO studentGRNO"
    })
      res.status(200).send({ message: "One Batch Query", access: true, batch: batch })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_student_add_query_batch = async (req, res) => {
  try {
    const { bid } = req?.params
    const { students } = req?.body
    if (!bid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var one_batch = await Subject.findById({ _id: bid })
    var all_student = await Student.find({ _id: { $in: students } });

    for (var ref of all_student) {
      one_batch.theory_students.push(ref?._id);
      one_batch.optionalStudent.push(ref?._id)
      // one_batch.theory_students_count += 1;
      // ref.class_selected_batch.push(one_batch?._id);
      // await ref.save();
    }
    await one_batch.save()
    res.status(200).send({ message: "New Student In Batch Add Query", access: true })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_new_student_remove_query_batch = async (req, res) => {
  try {
    const { bid } = req?.params
    const { students } = req?.body
    if (!bid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    var one_batch = await Subject.findById({ _id: bid })
    var all_student = await Student.find({ _id: { $in: students } });

    for (var ref of all_student) {
      one_batch.theory_students.pull(ref?._id);
      one_batch.optionalStudent.pull(ref?._id)
      // one_batch.class_student_query_count += 1;
      // ref.class_selected_batch.pull(one_batch?._id);
      // await ref.save();
    }
    await one_batch.save()
    res.status(200).send({ message: "New Student Remove In Batch Query", access: true })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_active_academic_batch_query = async (req, res) => {
  try {
      const { bid, did } = req?.params
      if (!bid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
      const depart = await Department.findById({ _id: did })
      const batch = await Batch.findById({ _id: bid })
      depart.active_academic_batch = batch?._id
    await depart.save()
      res.status(200).send({ message: "Active Batches Query", access: true})            
  }
  catch (e) {
      console.log(e)
  }
}

exports.render_one_class_details_query = async (req, res) => {
  try {
    const { cid, did } = req?.params
    if (!cid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    
    const classes = await ClassMaster.findById({ _id: cid })
    var list = []
    for (let ele of classes?.theory_classes) {
      if (`${ele?.did}` === `${did}`) {
        list.push(ele)
      }
    }
    var list_2 = []
    for (let ele of classes?.practical_batch) {
      if (`${ele?.did}` === `${did}`) {
        list.push(ele)
      }
    }
    let stats = {
      theory_classes: list?.length ?? 0,
      practical_batch: list_2?.length ?? 0,
      all_student: classes?.all_academic_student?.length ?? 0
    }
    res.status(200).send({ message: "Explore One Class Master Details", access: true, stats})
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_master_list_query = async (req, res) => {
  try {
    const { did } = req?.params
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
      if (!did) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
      
      const depart = await Department.findById({ _id: did })
      const subjects_extra = await SubjectMaster.find({ _id: { $in: depart?.merged_subject_master } })
      .limit(limit)
      .skip(skip)
        .select("subjectName subjectStatus")
        .populate({
          path: "department",
          select: "dName"
        })
      res.status(200).send({ message: "Explore All Subject Master Map Query", access: true, subjects_extra: subjects_extra?.length > 0 ? subjects_extra : []})

  }
  catch (e) {
      console.log(e)
  }
}

exports.render_all_dse_students_query = async (req, res) => {
  try {
      const { cid } = req?.params
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      const { did } = req?.query
    if (!cid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const depart = await Department.findById({ _id: did })
      const all_subjects = await SubjectMaster.find({ _id: { $in: depart?.merged_subject_master} })
          .select("subjectName department link_subject_master")
          .populate({
              path: "subjects",
              select: "class",
      })
      
    var numss = []
    var nums = []
      for (let ele of all_subjects) {
          for (let val of ele?.subjects) {
              if (numss?.includes(`${val?.class}`)) {
                  
              }
              else {
                  numss.push(val?.class)
              }
          }
      }
    // console.log(numss)
      const m_class = await ClassMaster.findById({ _id: cid })
      
    for (let ele of m_class?.classDivision) {
      for (let val of numss) {
        if (`${val}` === `${ele}`) {
          nums.push(val)
        }
      }
    }
    // console.log(nums)
      if (nums?.length > 0) {
          const all_students = await Student.find({ $and: [{ studentClass: { $in: nums } }] })
              // .limit(limit)
              // .skip(skip)
              .select("studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentROLLNO studentGRNO department major_subject")
              .populate({
                  path: "studentClass",
                  select: "className"
              })
        var numss = []
        for (let ele of all_subjects) {
          for (let val of all_students) {
            if (val?.major_subject?.includes(`${ele?._id}`)) {
              numss.push(val)
            }
          }
        }
        const unique = [...new Set(numss.map(item => item._id))];
        // let all_m = all_students?.filter((val) => {
        //   if(val?.major_subject?.length > 0) return val
        //   })
        const all_stu = await Student.find({ _id: { $in: unique} })
              .limit(limit)
              .skip(skip)
              .select("studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentROLLNO studentGRNO department major_subject")
              .populate({
                  path: "studentClass",
                  select: "className"
              })
        res.status(200).send({ message: "Explore All DSE Students Query", access: true, all_students: all_stu, count: all_stu?.length })
      }
      else {
          res.status(200).send({ message: "No DSE Students Query", access: true, all_students: []})            
      }
  }
  catch (e) {
      console.log(e)
  }
}
exports.render_edit_theory_classes = async (req, res) => {
  try {
    const { sid } = req?.params
    const { o_staff, n_staff } = req?.body
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    await Subject.findByIdAndUpdate(sid, req?.body)
    if (n_staff) {
      const new_subject = await Subject.findById({ _id: sid })
      const staffs = await Staff.findById({ _id: o_staff })
      const new_staff = await Staff.findById({ _id: n_staff })
      staffs.staffSubject.pull(new_subject?._id)
      new_subject.subjectTeacherName = new_staff?._id
      new_staff.staffSubject.push(new_subject?._id)
      await Promise.all([staffs.save(), new_staff.save()])
      await new_subject.save()
    }
    res.status(200).send({ message: "Edit Subject Add Query", access: true })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.render_delete_theory_classes = async (req, res) => {
  try {
    const { sid } = req?.params
    const { cid, flow } = req?.body
    if (!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    
    const classes = await ClassMaster.findById({ _id: cid })
    const new_subject = await Subject.findById({ _id: sid })
    if (new_subject?.subjectTeacherName) {
      const staffs = await Staff.findById({ _id: new_subject?.subjectTeacherName })
      new_subject.subjectTeacherName = null
      staffs.staffSubject.pull(new_subject?._id)
      await staffs.save()
    }
    if (flow === "THEORY_CLASSES") {
      for (let ele of classes?.theory_classes) {
        if (`${ele?.subject}` === `${new_subject._id}`) {
          classes?.theory_classes?.pull(ele?._id)
        }
      }
    }
    else if(flow === "PRACTICAL_BATCH") {
      for (let ele of classes?.practical_batch) {
        if (`${ele?.subject}` === `${new_subject._id}`) {
          classes?.practical_batch?.pull(ele?._id)
        }
      }
    }
    await classes.save()
    await Subject.findByIdAndDelete(new_subject?._id)
    res.status(200).send({ message: "Delete Subject Add Query", access: true })            
  }
  catch (e) {
    console.log(e)
  }
}

exports.subject_query = async (req, res) => {
  try {
      const all_subject = await Subject.find({})
        .select("theory_students optionalStudent")
    var  i =0
    for (let ele of all_subject) {
      if (ele?.theory_students?.length > 0) {
        for (let val of ele?.theory_students) {
          if (ele?.optionalStudent?.includes(`${val}`)) {
            
          }
          else {
            ele.optionalStudent.push(val)
          }
        }
      }
      await ele.save()
      console.log(i)
      i+= 1
      }
      res.status(200).send({ message: "Explore All Subjects", access: true })

  }
  catch (e) {
      console.log(e)
  }
}