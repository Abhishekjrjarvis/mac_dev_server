const Department = require("../../models/Department");
const Class = require("../../models/Class");
const Batch = require("../../models/Batch");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Subject = require("../../models/Subject");
const SubjectMaster = require("../../models/SubjectMaster");
const ClassMaster = require("../../models/ClassMaster");
const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const StudentPreviousData = require("../../models/StudentPreviousData");
const Notification = require("../../models/notification");
const {
  todayDate,
  classCodeFunction,
} = require("../../Utilities/timeComparison");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const User = require("../../models/User");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const { designation_alarm } = require("../../WhatsAppSMS/payload");
const Transport = require("../../models/Transport/transport");
const Vehicle = require("../../models/Transport/vehicle");
const Direction = require("../../models/Transport/direction");
const TransportBatch = require("../../models/Transport/TransportBatch");
const NewApplication = require("../../models/Admission/NewApplication");
const FeeStructure = require("../../models/Finance/FeesStructure");
const RemainingList = require("../../models/Admission/RemainingList");
const Admission = require("../../models/Admission/Admission");
const { add_all_installment_zero } = require("../../helper/Installment");
const FeeCategory = require("../../models/Finance/FeesCategory");
const Finance = require("../../models/Finance");
const { universal_random_password } = require("../../Custom/universalId");
const { render_new_fees_card } = require("../../Functions/FeesCard");
const BankAccount = require("../../models/Finance/BankAccount");
const {
  app_status,
  docs_status,
  fees_status,
} = require("../../OptimizeController/Admission/admissionController");
const InstituteApplicationForm = require("../../models/Form/InstituteApplicationForm");
const FormChecklist = require("../../models/Form/FormChecklist");
const InstituteStudentForm = require("../../models/Form/InstituteStudentForm");
const { generate_random_code_structure } = require("../../helper/functions");

exports.preformedStructure = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.bid).populate({
      path: "classroom",
      populate: {
        path: "subject multiple_batches",
      },
    });
    var valid_structure = await FeeStructure.find({
      $and: [{ batch_master: batch?._id }, { document_update: false }],
    })
      .populate({
        path: "category_master",
        select: "category_name",
      })
      .populate({
        path: "class_master",
        select: "className",
      });
    var department = await Department.findById(batch?.department);
    const institute = await InstituteAdmin.findById(batch?.institute);
    var admission = await Admission.findById({
      _id: institute?.admissionDepart[0],
    });
    var identicalBatch = new Batch({
      batchName: req.body?.batchName,
      institute: batch?.institute,
      department: batch?.department,
      batchStaff: batch?.batchStaff,
      classCount: batch?.classCount,
      batch_type: "Identical",
      identical_batch: batch?._id,
      designation_send: req?.body?.with_designation === "Yes" ? "No" : "Yes",
    });
    department?.batches.push(identicalBatch._id);
    institute?.batches.push(identicalBatch._id);
    department.batchCount += 1;
    for (var one_struct of valid_structure) {
      var new_struct = new FeeStructure({
        category_master: one_struct?.category_master,
        class_master: one_struct?.class_master,
        structure_name: one_struct?.structure_name,
        unique_structure_name: `${one_struct?.category_master?.category_name} - ${department?.dName} - ${identicalBatch?.batchName} - ${one_struct?.class_master?.className} / ${one_struct?.structure_name}`,
        applicable_fees: one_struct?.applicable_fees,
        one_installments: one_struct?.one_installments,
        two_installments: one_struct?.two_installments,
        three_installments: one_struct?.three_installments,
        four_installments: one_struct?.four_installments,
        five_installments: one_struct?.five_installments,
        six_installments: one_struct?.six_installments,
        seven_installments: one_struct?.seven_installments,
        eight_installments: one_struct?.eight_installments,
        nine_installments: one_struct?.nine_installments,
        ten_installments: one_struct?.ten_installments,
        eleven_installments: one_struct?.eleven_installments,
        tweleve_installments: one_struct?.tweleve_installments,
        total_installments: one_struct?.total_installments,
        total_admission_fees: one_struct?.total_admission_fees,
        due_date: one_struct?.due_date,
        finance: one_struct?.finance,
        department: department?._id,
        batch_master: identicalBatch?._id,
      });
      const new_code = generate_random_code_structure();
      new_struct.fee_structure_code = `${new_code}`;
      department.fees_structures.push(new_struct?._id);
      department.fees_structures_count += 1;
      for (var one_head of one_struct?.applicable_fees_heads) {
        new_struct.applicable_fees_heads.push({
          head_name: one_head?.head_name,
          head_amount: one_head?.head_amount,
          master: one_head?.master,
          is_society: one_head?.is_society,
        });
        new_struct.applicable_fees_heads_count += 1;
      }
      for (var one_head of one_struct?.government_fees_heads) {
        new_struct.government_fees_heads.push({
          head_name: one_head?.head_name,
          head_amount: one_head?.head_amount,
          master: one_head?.master,
          is_society: one_head?.is_society,
        });
        new_struct.government_fees_heads_count += 1;
      }
      await new_struct.save();
    }
    var valid_apply = await NewApplication.find({
      $and: [
        { applicationTypeStatus: "Promote Application" },
        { admissionAdmin: admission?._id },
        { applicationDepartment: department?._id },
        { applicationBatch: batch?._id },
      ],
    });
    // console.log(valid_apply?.length);
    for (let oneClass of batch?.classroom) {
      // console.log("this is class", oneClass);
      const code = await classCodeFunction();
      const date = await todayDate();

      // console.log("this is staff", staff);

      const classMaster = await ClassMaster.findById(oneClass?.masterClassName);
      var identicalClass = new Class({
        classCode: code,
        className: oneClass?.className,
        classTitle: oneClass?.classTitle,
        subjectCount: oneClass?.subjectCount,
        masterClassName: oneClass?.masterClassName,
        classHeadTitle: oneClass?.classHeadTitle,
        institute: oneClass?.institute,
        batch: identicalBatch?._id,
        department: oneClass?.department,
        classStartDate: date,
        multiple_batches: oneClass?.multiple_batches,
        // classTeacher: oneClass?.classTeacher,
        finalReportsSettings: oneClass?.finalReportsSettings,
      });
      const codes = universal_random_password();
      identicalClass.member_module_unique = `${codes}`;
      identicalClass.multiple_batches_count =
        oneClass?.multiple_batches?.length;
      if (oneClass?.classTeacher) {
        identicalClass.classTeacher = oneClass?.classTeacher;
      }
      classMaster?.classDivision.push(identicalClass._id);
      classMaster.classCount += 1;
      institute?.classRooms.push(identicalClass._id);
      institute?.classCodeList.push(code);
      department?.class.push(identicalClass._id);
      department.classCount += 1;
      identicalBatch?.classroom.push(identicalClass._id);
      for (let ele of oneClass?.multiple_batches) {
        var new_id_batch = new Batch({
          batchName: ele?.batchName,
          class_batch_select: identicalClass?._id,
        });
        identicalClass.multiple_batches.push(new_id_batch?._id);
        identicalClass.multiple_batches_count += 1;
        await new_id_batch.save();
      }
      if (req?.body?.with_designation === "No") {
        if (oneClass?.classTeacher) {
          const staff = await Staff.findById(oneClass?.classTeacher);
          const class_user = await User.findById({ _id: `${staff?.user}` });
          staff?.staffClass.push(identicalClass._id);
          staff.staffDesignationCount += 1;
          staff.recentDesignation = identicalClass?.classHeadTitle;
          staff.designation_array.push({
            role: "Class Teacher",
            role_id: identicalClass?._id,
          });
          const notify = new Notification({});
          notify.notifyContent = `you got the designation of ${identicalClass.className} as ${identicalClass.classHeadTitle}`;
          notify.notifySender = oneClass?.institute;
          notify.notifyReceiever = class_user._id;
          notify.notifyCategory = "Class Designation";
          class_user.uNotify.push(notify._id);
          notify.user = class_user._id;
          notify.notifyByInsPhoto = institute._id;
          // await invokeFirebaseNotification(
          //   "Designation Allocation",
          //   notify,
          //   institute.insName,
          //   class_user._id,
          //   class_user.deviceToken
          // );
          await Promise.all([notify.save(), class_user.save(), staff.save()]);
        }
      }

      for (let oneSubject of oneClass?.subject) {
        const subjectMaster = await SubjectMaster.findById(
          oneSubject?.subjectMasterName
        );

        var identicalSubject = new Subject({
          subjectName: oneSubject?.subjectName,
          subjectTitle: oneSubject?.subjectTitle,
          // subjectTeacherName: oneSubject?.subjectTeacherName,
          subjectMasterName: oneSubject?.subjectMasterName,
          class: identicalClass._id,
          institute: batch?.institute,
          setting: oneSubject?.setting,
          lecture_analytic: oneSubject?.lecture_analytic,
          practical_analytic: oneSubject?.practical_analytic,
          tutorial_analytic: oneSubject?.tutorial_analytic,
          subject_category: oneSubject?.subject_category,
          selected_batch_query: oneSubject?.selected_batch_query,
          batch: identicalClass?.batch,
        });
        const code = universal_random_password();
        identicalSubject.member_module_unique = `${code}`;
        if (oneSubject?.subjectTeacherName) {
          identicalSubject.subjectTeacherName = oneSubject?.subjectTeacherName;
        }
        subjectMaster?.subjects.push(identicalSubject._id);
        subjectMaster.subjectCount += 1;
        identicalClass?.subject.push(identicalSubject?._id);
        if (req?.body?.with_designation === "No") {
          if (oneSubject?.subjectTeacherName) {
            const sujectStaff = await Staff.findById(
              oneSubject?.subjectTeacherName
            );
            const subject_user = await User.findById({
              _id: `${sujectStaff?.user}`,
            });
            sujectStaff?.staffSubject.push(identicalSubject._id);
            sujectStaff.staffDesignationCount += 1;
            sujectStaff.recentDesignation = identicalSubject?.subjectTitle;
            sujectStaff.designation_array.push({
              role: "Subject Teacher",
              role_id: identicalSubject?._id,
            });
            const notify_subject = new Notification({});
            notify_subject.notifyContent = `you got the designation of ${identicalSubject.subjectName} as ${identicalSubject.subjectTitle}`;
            notify_subject.notifySender = batch?.institute;
            notify_subject.notifyReceiever = subject_user._id;
            notify_subject.notifyCategory = "Subject Designation";
            subject_user.uNotify.push(notify_subject._id);
            notify_subject.user = subject_user._id;
            notify_subject.notifyByInsPhoto = institute._id;
            // await invokeFirebaseNotification(
            //   "Designation Allocation",
            //   notify_subject,
            //   institute.insName,
            //   subject_user._id,
            //   subject_user.deviceToken
            // );
            await Promise.all([
              notify_subject.save(),
              sujectStaff.save(),
              subject_user.save(),
            ]);
          }
        }

        await Promise.all([identicalSubject.save(), subjectMaster.save()]);
      }
      await Promise.all([identicalClass.save(), classMaster.save()]);
    }

    await Promise.all([
      identicalBatch.save(),
      department.save(),
      institute.save(),
    ]);
    // const batchEncrypt = await encryptionPayload(identicalBatch?._id);
    res.status(200).send({
      message: "Identical Batch Created Successfully",
      batchId: identicalBatch?._id,
    });
    if (valid_apply?.length > 0) {
      for (var ref of valid_apply) {
        const new_app = new NewApplication({
          applicationName: "Promote Student",
          applicationDepartment: ref?.applicationDepartment,
          applicationBatch: identicalBatch?._id,
          applicationMaster: ref?.applicationMaster,
          applicationTypeStatus: "Promote Application",
        });
        var iaf = new InstituteApplicationForm({});
        iaf.application = new_app?._id;
        new_app.student_form_setting = iaf?._id;
        admission.newApplication.push(new_app._id);
        admission.newAppCount += 1;
        new_app.admissionAdmin = admission._id;
        institute.admissionCount += 1;
        await Promise.all([
          new_app.save(),
          admission.save(),
          institute.save(),
          iaf.save(),
        ]);
        var ifs = await InstituteStudentForm.findById({
          _id: `${institute?.student_form_setting}`,
        })
          .select("form_section")
          .populate({
            path: "form_section",
            populate: {
              path: "form_checklist",
              populate: {
                path: "nested_form_checklist",
                populate: {
                  path: "nested_form_checklist_nested",
                },
              },
            },
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
                form_checklist_key_status: ele?.form_checklist_key_status,
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
              if (ele?.form_checklist_sample) {
                fc.form_checklist_sample = ele?.form_checklist_sample;
              }
              if (ele?.form_checklist_pdf) {
                fc.form_checklist_pdf = ele?.form_checklist_pdf;
              }
              if (ele?.form_checklist_view) {
                fc.form_checklist_view = ele?.form_checklist_view;
              }
              if (ele?.form_common_key) {
                fc.form_common_key = ele?.form_common_key;
              }
              if (ele?.form_checklist_enable) {
                fc.form_checklist_enable = ele?.form_checklist_enable;
              }
              fc.application_form = iaf?._id;
              fc.form_section = val?._id;
              for (var stu of ele?.nested_form_checklist) {
                var fcc = new FormChecklist({
                  form_checklist_name: stu?.form_checklist_name,
                  form_checklist_key: stu?.form_checklist_key,
                  form_checklist_visibility: stu?.form_checklist_visibility,
                  form_checklist_placeholder: stu?.form_checklist_placeholder,
                  form_checklist_lable: stu?.form_checklist_lable,
                  form_checklist_typo: stu?.form_checklist_typo,
                  form_checklist_required: stu?.form_checklist_required,
                  form_checklist_key_status: stu?.form_checklist_key_status,
                  width: stu?.width,
                });
                if (
                  stu?.form_checklist_typo_option_pl &&
                  stu?.form_checklist_typo_option_pl?.length > 0
                ) {
                  fcc.form_checklist_typo_option_pl = [
                    ...stu?.form_checklist_typo_option_pl,
                  ];
                }
                if (stu?.form_checklist_sample) {
                  fcc.form_checklist_sample = stu?.form_checklist_sample;
                }
                if (stu?.form_checklist_pdf) {
                  fcc.form_checklist_pdf = stu?.form_checklist_pdf;
                }
                if (stu?.form_checklist_view) {
                  fcc.form_checklist_view = stu?.form_checklist_view;
                }
                fcc.application_form = iaf?._id;
                fcc.form_section = val?._id;
                if (stu?.nested_form_checklist_nested) {
                  for (var qwe of stu?.nested_form_checklist_nested) {
                    var fcca = new FormChecklist({
                      form_checklist_name: qwe?.form_checklist_name,
                      form_checklist_key: qwe?.form_checklist_key,
                      form_checklist_visibility: qwe?.form_checklist_visibility,
                      form_checklist_placeholder:
                        qwe?.form_checklist_placeholder,
                      form_checklist_lable: qwe?.form_checklist_lable,
                      form_checklist_typo: qwe?.form_checklist_typo,
                      form_checklist_required: qwe?.form_checklist_required,
                      form_checklist_key_status: qwe?.form_checklist_key_status,
                      width: qwe?.width,
                    });
                    if (
                      qwe?.form_checklist_typo_option_pl &&
                      qwe?.form_checklist_typo_option_pl?.length > 0
                    ) {
                      fcca.form_checklist_typo_option_pl = [
                        ...qwe?.form_checklist_typo_option_pl,
                      ];
                    }
                    if (qwe?.form_checklist_sample) {
                      fcca.form_checklist_sample = qwe?.form_checklist_sample;
                    }
                    if (qwe?.form_checklist_pdf) {
                      fcca.form_checklist_pdf = qwe?.form_checklist_pdf;
                    }
                    if (qwe?.form_checklist_view) {
                      fcca.form_checklist_view = qwe?.form_checklist_view;
                    }
                    fcca.application_form = iaf?._id;
                    fcca.form_section = val?._id;
                    fcc.nested_form_checklist_nested.push(fcca?._id);
                    await fcca.save();
                  }
                }
                await fcc.save();
                fc.nested_form_checklist.push(fcc?._id);
              }
              nums.push(fc?._id);
              await fc.save();
            }
          }
          iaf.form_section.push({
            section_name: val?.section_name,
            section_visibilty: val?.section_visibilty,
            section_key: val?.section_key,
            section_pdf: val?.section_pdf,
            section_value: val?.section_value,
            ins_form_section_id: val?._id,
            form_checklist: [...nums],
          });
        }
        await iaf.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subjectUpdateSetting = async (req, res) => {
  try {
    await Subject.findByIdAndUpdate(req.params.sid, req.body);
    res
      .status(200)
      .send({ message: "Subject setting is changed successfully 👏🤞" });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectSetting = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid)
      .select("setting subjectStatus")
      .lean()
      .exec();
    // const subjectEncrypt = await encryptionPayload(subject);
    res.status(200).send({ message: "get subject setting", subject });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectComplete = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid);
    if (subject.subjectStatus !== "Completed") {
      subject.subjectStatus = req.body?.subjectStatus;
      const staff = await Staff.findById(subject?.subjectTeacherName).select(
        "staffSubject previousStaffSubject staffDesignationCount"
      );
      staff.staffDesignationCount -= 1;
      staff.previousStaffSubject?.push(req.params.sid);
      staff.staffSubject.pull(req.params.sid);
      await Promise.all([staff.save(), subject.save()]);
      res.status(200).send({ message: "Subject is Completed" });
    } else res.status(200).send({ message: "Subject is already Completed" });
  } catch (e) {
    console.log(e);
  }
};

exports.allDepartment = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid);
    const options = {
      sort: {
        createdAt: -1,
      },
    };
    const institute = await InstituteAdmin.findById(classes.institute)
      .populate({
        path: "depart",
        populate: {
          path: "batches",
          options,
          // match: { _id: { $ne: classes?.batch } },
          select: "batchName createdAt",
        },
        select: "dName dTitle photo dHead batches",
      })
      .populate({
        path: "depart",
        populate: {
          path: "dHead",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
        select: "dName dTitle photo dHead batches",
      })
      .select("_id depart")
      .lean()
      .exec();

    // const departEncrypt = await encryptionPayload(institute?.depart);
    res
      .status(200)
      .send({ message: "All departments list", departmets: institute?.depart });
  } catch (e) {
    console.log(e);
  }
};

exports.allClasses = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.bid)
      .populate({
        path: "classroom",
        select: "classTitle",
      })
      .select("classroom")
      .lean()
      .exec();

    // const classesEncrypt = await encryptionPayload(batch?.classroom);
    res
      .status(200)
      .send({ message: "All classes list", classes: batch?.classroom });
  } catch (e) {
    console.log(e);
  }
};

exports.promoteStudent = async (req, res) => {
  try {
    const { departmentId, batchId, classId } = req.body;
    const { flow, re_ads } = req.query;
    if (`${req.params.cid}` === `${classId}`)
      return res
        .status(200)
        .send({ message: "Same Class Promotion Not Possible", access: false });
    const previousclasses = await Class.findById(req.params.cid);
    const classes = await Class.findById(classId);
    const batch = await Batch.findById(batchId);
    // console.log(batch?._id);
    const department = await Department.findById(departmentId).populate({
      path: "fees_structures",
      populate: {
        path: "category_master",
      },
    });
    var institute = await InstituteAdmin.findById({
      _id: `${department?.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart?.[0]}`,
    });
    var admission = await Admission.findById({
      _id: `${institute?.admissionDepart?.[0]}`,
    });
    var valid_app = await NewApplication.find({
      $and: [
        { applicationTypeStatus: "Promote Application" },
        { admissionAdmin: admission?._id },
        { applicationDepartment: department?._id },
        { applicationBatch: batch?._id },
      ],
    });
    var apply = valid_app ? valid_app?.[0] : "";
    // console.log("Enter in this code");
    if (apply) {
      // console.log("Application Find");
      let roll = classes.ApproveStudent?.length + 1;
      if (flow === "WITH_STRUCTURE") {
        // console.log("with Fee Structure");
        for (let stu of req.body?.students) {
          const student = await Student.findById(stu).populate({
            path: "fee_structure",
            populate: {
              path: "category_master",
            },
          });
          // var user = await User.findById(student?.user)
          var same_batch_promotion =
            `${student?.batches}` === `${batch?._id}` ? true : false;
          // const sec_category = await FeeCategory.findOne({
          //   current_status: "Secondary Category",
          // });
          // console.log(same_batch_promotion)
          if (!same_batch_promotion) {
            // if (finance?.secondary_category?.status === "Assigned") {
            //   var cate = finance?.secondary_category?.category;
            // }
            var structure = department?.fees_structures?.filter((ref) => {
              if (
                `${ref?.class_master}` === `${classes?.masterClassName}` &&
                `${ref?.category_master?._id}` ===
                  `${student?.fee_structure?.category_master?._id}` &&
                `${ref?.batch_master}` === `${batch?._id}` &&
                ref?.document_update == false
              )
                return ref;
            });
            // console.log(structure)
            if (structure?.length > 0) {
              // console.log("structure Assign BUG");
            } else {
              // console.log("structure Assign");
              var structure = department?.fees_structures?.filter((ref) => {
                if (
                  `${ref?.class_master}` === `${classes?.masterClassName}` &&
                  `${ref?.category_master?._id}` ===
                    `${student?.fee_structure?.category_master?.secondary_category}` &&
                  `${ref?.batch_master}` === `${batch?._id}` &&
                  ref?.document_update == false
                )
                  return ref;
              });
            }
          } else {
            var structure = department?.fees_structures?.filter((ref) => {
              if (
                `${ref?.class_master}` === `${classes?.masterClassName}` &&
                `${ref?.category_master?._id}` ===
                  `${student?.fee_structure?.category_master?._id}` &&
                `${ref?.batch_master}` === `${batch?._id}` &&
                ref?.document_update == false
              )
                return ref;
            });
            // console.log(structure);
          }
          // structure = structure?.filter((val) => {
          //   if (
          //     val?.unique_structure_name?.includes(`SY 2022-23`) ||
          //     val?.unique_structure_name?.includes(`SYD 2022-23`)
          //   ) {
          //   } else {
          //     return val;
          //   }
          // });
          // numIndex = structure
          //   ?.findIndex((val) => {
          //   if (val?.unique_structure_name?.includes("SY")) return val;
          // });
          // if(numIndex < 0){
          numIndex = 0;
          // }
          const user = await User.findById({ _id: `${student.user}` });
          const previousData = new StudentPreviousData({
            studentCode: student.studentCode,
            studentClass: student.studentClass,
            student: student._id,
            batches: student.batches,
            studentROLLNO: student.studentROLLNO,
            studentBehaviour: student.studentBehaviour,
            department: student.department,
            institute: student.institute,

            //here some also doubt
            notification: student.notification,

            subjectMarks: student.subjectMarks,
            exams: student.exams,
            finalReportStatus: student.finalReportStatus,
            finalReport: student.finalReport,
            testSet: student.testSet,
            assignments: student.assignments,
            totalAssignment: student.totalAssignment,
            submittedAssignment: student.submittedAssignment,
            incompletedAssignment: student.incompletedAssignment,
            completedAssignment: student.completedAssignment,
            studentFee: student.studentFee,
            attendDate: student.attendDate,
            allottedChecklist: student.allottedChecklist,
            onlineFeeList: student.onlineFeeList,
            onlineCheckList: student.onlineCheckList,
            offlineFeeList: student.offlineFeeList,
            sportClass: student.sportClass,
            sportTeam: student.sportTeam,
            extraPoints: student.extraPoints,
            sportEvent: student.sportEvent,
            studentSportsEventMatch: student.studentSportsEventMatch,
            complaints: student?.complaints,
            leave: student?.leave,
            studentExemptFee: student?.studentExemptFee,
            exemptFeeList: student?.exemptFeeList,
            studentRemainingFeeCount: student?.studentRemainingFeeCount,
            studentPaidFeeCount: student?.studentPaidFeeCount,
            studentAdmissionDate: student?.studentAdmissionDate,
            borrow: student?.borrow,
            deposite: student?.deposite,
            sportEventCount: student?.sportEventCount,
            admissionRemainFeeCount: student?.admissionRemainFeeCount,
            admissionPaidFeeCount: student?.admissionPaidFeeCount,
            paidFeeList: student?.paidFeeList,
            refundAdmission: student?.refundAdmission,
            remainingFeeList: student?.remainingFeeList,
            remainingFeeList_count: student?.remainingFeeList_count,
            fee_structure: student?.fee_structure,
            active_fee_heads: student?.active_fee_heads,
            certificateBonaFideCopy: student?.certificateBonaFideCopy,
            certificateLeavingCopy: student?.certificateLeavingCopy,
            dailyUpdate: student?.dailyUpdate,
            student_biometric_id: student?.student_biometric_id,
            election_candidate: student?.election_candidate,
            participate_event: student?.participate_event,
            checkList_participate_event: student?.checkList_participate_event,
            participate_result: student?.participate_result,
            backlog: student?.backlog,
            vehicle: student?.vehicle,
            vehicleRemainFeeCount: student?.vehicleRemainFeeCount,
            vehiclePaidFeeCount: student?.vehiclePaidFeeCount,
            vehicle_payment_status: student?.vehicle_payment_status,
            active_routes: student?.active_routes,
            query_count: student?.query_count,
            mentor: student?.mentor,
            queries: student?.queries,
            total_query: student?.total_query,
            feed_back_count: student?.feed_back_count,
            deposit_pending_amount: student?.deposit_pending_amount,
            deposit_refund_amount: student?.deposit_refund_amount,
            refund_deposit: student?.refund_deposit,
            form_status: student?.form_status,
            fee_receipt: student?.fee_receipt,
          });
          // const notify = new StudentNotification({});
          // notify.notifyContent = `${student.studentFirstName} ${
          //   student.studentMiddleName ? student.studentMiddleName : ""
          // } ${student.studentLastName} Your Report Card is Ready `;
          // notify.notifySender = classes._id;
          // notify.notifyReceiever = user._id;
          // notify.classId = classes._id;
          // notify.notifyType = "Student";
          // notify.notifyPublisher = student._id;
          // user.activity_tab.push(notify._id);
          // notify.notifyByClassPhoto = classes._id;
          // notify.notifyCategory = "Report Card";
          // notify.redirectIndex = 20;
          // if (user?.deviceToken) {
          //   invokeMemberTabNotification(
          //     "Student Activity",
          //     notify,
          //     "View Report Card",
          //     user._id,
          //     user.deviceToken,
          //     "Student",
          //     notify
          //   );
          // }
          await Promise.all([
            student.save(),
            // notify.save(),
            user.save(),
            previousData.save(),
          ]);
          student?.previousYearData?.push(previousData._id);
          student.studentClass = classId;
          student.studentCode = classes.classCode;
          student.department = departmentId;
          student.batches = batchId;
          //here how to give the null in objectID
          student.studentBehaviour = null;
          student.studentROLLNO =
            `${re_ads}` === "WITH_RE_ADMISSION" ? "" : roll;
          student.subjectMarks = [];
          student.exams = [];
          student.finalReportStatus = "No";
          student.finalReport = [];
          student.testSet = [];
          student.assignments = [];
          student.totalAssignment = 0;
          student.submittedAssignment = 0;
          student.incompletedAssignment = 0;
          student.completedAssignment = 0;
          student.attendDate = [];
          student.sportClass = [];
          student.sportTeam = [];
          student.extraPoints = 0;
          student.sportEvent = [];
          student.studentSportsEventMatch = [];
          student.complaints = [];
          student.leave = [];
          student.studentAdmissionDate = "";
          student.borrow = [];
          student.deposite = [];
          student.sportEventCount = 0;

          // here assign new fee st
          if (!same_batch_promotion) {
            student.fee_structure = structure ? structure[numIndex]?._id : null;
          }
          // student.active_fee_heads = [];
          /////
          student.certificateBonaFideCopy = {
            trueCopy: false,
            secondCopy: false,
            thirdCopy: false,
          };
          student.certificateLeavingCopy = {
            trueCopy: false,
            secondCopy: false,
            thirdCopy: false,
          };
          student.dailyUpdate = [];

          //============== here some confusion for biometric id -> Ok we will resolve it...
          student.student_biometric_id = "";
          student.election_candidate = [];
          student.participate_event = [];
          student.participate_result = [];
          student.vehicle = null;
          student.routes = [];
          student.active_routes = null;
          student.query_count = 0;
          student.mentor = null;
          student.queries = [];
          student.total_query = 0;
          student.feed_back_count = 0;
          student.deposit_pending_amount = 0;
          student.deposit_refund_amount = 0;
          student.refund_deposit = [];
          student.form_status = "Not Filled";
          // student.fee_receipt = [];
          if (!same_batch_promotion) {
            var c = await render_new_fees_card(
              student?._id,
              apply?._id,
              structure[numIndex]?._id,
              "BATCH_PROMOTE",
              re_ads,
              classes,
              ""
            );
          } else {
            var c = await render_new_fees_card(
              student?._id,
              apply?._id,
              structure[numIndex]?._id,
              "BATCH_PROMOTE",
              re_ads,
              classes,
              ""
            );
          }
          roll += 1;
          if (`${re_ads}` === "WITH_RE_ADMISSION") {
            var filtered_account = await BankAccount.findOne({
              departments: { $in: apply?.applicationDepartment },
            });
            await app_status(apply, institute, student, filtered_account, user);
            await docs_status(
              apply,
              institute,
              student,
              user,
              structure[numIndex]?._id
            );
            await fees_status(
              apply,
              institute,
              student,
              user,
              structure[numIndex]?._id,
              c
            );
          }
          if (`${re_ads}` === "WITH_RE_ADMISSION") {
            if (classes?.UnApproveStudent?.includes(student._id)) {
            } else {
              classes?.UnApproveStudent.push(student._id);
            }
            if (batch?.UnApproveStudent?.includes(student._id)) {
            } else {
              batch?.UnApproveStudent.push(student._id);
            }
            if (department?.UnApproveStudent?.includes(student._id)) {
            } else {
              department?.UnApproveStudent.push(student._id);
            }
          } else {
            if (classes?.ApproveStudent?.includes(student._id)) {
            } else {
              classes?.ApproveStudent.push(student._id);
            }
            if (batch?.ApproveStudent?.includes(student._id)) {
            } else {
              batch?.ApproveStudent.push(student._id);
            }
            if (department?.ApproveStudent?.includes(student._id)) {
            } else {
              department?.ApproveStudent.push(student._id);
            }
          }
          previousclasses?.promoteStudent?.push(stu);
          // previousclasses?.ApproveStudent?.pull(stu);
          if (`${re_ads}` === "WITH_RE_ADMISSION") {
          } else {
            classes.studentCount += 1;
          }
          await student.save();

          if (student.studentGender === "Male") {
            if (`${re_ads}` === "WITH_RE_ADMISSION") {
            } else {
              classes.boyCount += 1;
            }
            if (!same_batch_promotion) {
              batch.student_category.boyCount += 1;
            }
          } else if (student.studentGender === "Female") {
            if (`${re_ads}` === "WITH_RE_ADMISSION") {
            } else {
              classes.girlCount += 1;
            }
            if (!same_batch_promotion) {
              batch.student_category.girlCount += 1;
            }
          } else if (student.studentGender === "Other") {
            if (`${re_ads}` === "WITH_RE_ADMISSION") {
            } else {
              classes.otherCount += 1;
            }
            if (!same_batch_promotion) {
              batch.student_category.otherCount += 1;
            }
          } else {
          }
          if (!same_batch_promotion) {
            if (student.studentCastCategory === "General") {
              batch.student_category.generalCount += 1;
            } else if (student.studentCastCategory === "OBC") {
              batch.student_category.obcCount += 1;
            } else if (student.studentCastCategory === "SC") {
              batch.student_category.scCount += 1;
            } else if (student.studentCastCategory === "ST") {
              batch.student_category.stCount += 1;
            } else if (student.studentCastCategory === "NT-A") {
              batch.student_category.ntaCount += 1;
            } else if (student.studentCastCategory === "NT-B") {
              batch.student_category.ntbCount += 1;
            } else if (student.studentCastCategory === "NT-C") {
              batch.student_category.ntcCount += 1;
            } else if (student.studentCastCategory === "NT-D") {
              batch.student_category.ntdCount += 1;
            } else if (student.studentCastCategory === "VJ") {
              batch.student_category.vjCount += 1;
            } else {
            }
          }
          await Promise.all([classes.save(), batch.save()]);
        }

        await Promise.all([
          classes.save(),
          previousclasses.save(),
          batch.save(),
          department.save(),
        ]);
        res.status(200).send({
          message:
            "All students promoted to next selected class with fee structure",
        });
      } else {
        for (let stu of req.body?.students) {
          const student = await Student.findById(stu);
          const user = await User.findById({ _id: `${student.user}` });
          const previousData = new StudentPreviousData({
            studentCode: student.studentCode,
            studentClass: student.studentClass,
            student: student._id,
            batches: student.batches,
            studentROLLNO: student.studentROLLNO,
            studentBehaviour: student.studentBehaviour,
            department: student.department,
            institute: student.institute,

            //here some also doubt
            notification: student.notification,

            subjectMarks: student.subjectMarks,
            exams: student.exams,
            finalReportStatus: student.finalReportStatus,
            finalReport: student.finalReport,
            testSet: student.testSet,
            assignments: student.assignments,
            totalAssignment: student.totalAssignment,
            submittedAssignment: student.submittedAssignment,
            incompletedAssignment: student.incompletedAssignment,
            completedAssignment: student.completedAssignment,
            studentFee: student.studentFee,
            attendDate: student.attendDate,
            allottedChecklist: student.allottedChecklist,
            onlineFeeList: student.onlineFeeList,
            onlineCheckList: student.onlineCheckList,
            offlineFeeList: student.offlineFeeList,
            sportClass: student.sportClass,
            sportTeam: student.sportTeam,
            extraPoints: student.extraPoints,
            sportEvent: student.sportEvent,
            studentSportsEventMatch: student.studentSportsEventMatch,
            complaints: student?.complaints,
            leave: student?.leave,
            studentExemptFee: student?.studentExemptFee,
            exemptFeeList: student?.exemptFeeList,
            studentRemainingFeeCount: student?.studentRemainingFeeCount,
            studentPaidFeeCount: student?.studentPaidFeeCount,
            studentAdmissionDate: student?.studentAdmissionDate,
            borrow: student?.borrow,
            deposite: student?.deposite,
            sportEventCount: student?.sportEventCount,
            admissionRemainFeeCount: student?.admissionRemainFeeCount,
            admissionPaidFeeCount: student?.admissionPaidFeeCount,
            paidFeeList: student?.paidFeeList,
            refundAdmission: student?.refundAdmission,
            remainingFeeList: student?.remainingFeeList,
            remainingFeeList_count: student?.remainingFeeList_count,
            fee_structure: student?.fee_structure,
            active_fee_heads: student?.active_fee_heads,
            certificateBonaFideCopy: student?.certificateBonaFideCopy,
            certificateLeavingCopy: student?.certificateLeavingCopy,
            dailyUpdate: student?.dailyUpdate,
            student_biometric_id: student?.student_biometric_id,
            election_candidate: student?.election_candidate,
            participate_event: student?.participate_event,
            checkList_participate_event: student?.checkList_participate_event,
            participate_result: student?.participate_result,
            backlog: student?.backlog,
            vehicle: student?.vehicle,
            vehicleRemainFeeCount: student?.vehicleRemainFeeCount,
            vehiclePaidFeeCount: student?.vehiclePaidFeeCount,
            vehicle_payment_status: student?.vehicle_payment_status,
            active_routes: student?.active_routes,
            query_count: student?.query_count,
            mentor: student?.mentor,
            queries: student?.queries,
            total_query: student?.total_query,
            feed_back_count: student?.feed_back_count,
            deposit_pending_amount: student?.deposit_pending_amount,
            deposit_refund_amount: student?.deposit_refund_amount,
            refund_deposit: student?.refund_deposit,
            form_status: student?.form_status,
            fee_receipt: student?.fee_receipt,
          });
          // console.log(previousData);
          // const notify = new StudentNotification({});
          // notify.notifyContent = `${student.studentFirstName} ${
          //   student.studentMiddleName ? student.studentMiddleName : ""
          // } ${student.studentLastName} Your Report Card is Ready `;
          // notify.notifySender = classes._id;
          // notify.notifyReceiever = user._id;
          // notify.classId = classes._id;
          // notify.notifyType = "Student";
          // notify.notifyPublisher = student._id;
          // user.activity_tab.push(notify._id);
          // notify.notifyByClassPhoto = classes._id;
          // notify.notifyCategory = "Report Card";
          // notify.redirectIndex = 20;
          // invokeMemberTabNotification(
          //   "Student Activity",
          //   notify,
          //   "View Report Card",
          //   user._id,
          //   user.deviceToken,
          //   "Student",
          //   notify
          // );
          await Promise.all([
            student.save(),
            // notify.save(),
            user.save(),
            previousData.save(),
          ]);
          student?.previousYearData?.push(previousData._id);
          student.studentClass = classId;
          student.studentCode = classes.classCode;
          student.department = departmentId;
          student.batches = batchId;
          //here how to give the null in objectID
          student.studentBehaviour = null;
          student.studentROLLNO = roll;
          student.subjectMarks = [];
          student.exams = [];
          student.finalReportStatus = "No";
          student.finalReport = [];
          student.testSet = [];
          student.assignments = [];
          student.totalAssignment = 0;
          student.submittedAssignment = 0;
          student.incompletedAssignment = 0;
          student.completedAssignment = 0;
          student.attendDate = [];
          student.sportClass = [];
          student.sportTeam = [];
          student.extraPoints = 0;
          student.sportEvent = [];
          student.studentSportsEventMatch = [];
          student.complaints = [];
          student.leave = [];
          student.studentAdmissionDate = "";
          student.borrow = [];
          student.deposite = [];
          student.sportEventCount = 0;

          // here assign new fee st
          student.fee_structure = null;
          // student.active_fee_heads = [];
          /////
          student.certificateBonaFideCopy = {
            trueCopy: false,
            secondCopy: false,
            thirdCopy: false,
          };
          student.certificateLeavingCopy = {
            trueCopy: false,
            secondCopy: false,
            thirdCopy: false,
          };
          student.dailyUpdate = [];

          //============== here some confusion for biometric id -> Ok we will resolve it...
          student.student_biometric_id = "";
          student.election_candidate = [];
          student.participate_event = [];
          student.participate_result = [];
          student.vehicle = null;
          student.routes = [];
          student.active_routes = null;
          student.query_count = 0;
          student.mentor = null;
          student.queries = [];
          student.total_query = 0;
          student.feed_back_count = 0;
          student.deposit_pending_amount = 0;
          student.deposit_refund_amount = 0;
          student.refund_deposit = [];
          student.form_status = "Not Filled";
          // student.fee_receipt = [];
          roll += 1;
          if (classes?.ApproveStudent?.includes(student._id)) {
          } else {
            classes?.ApproveStudent.push(student._id);
          }
          if (batch?.ApproveStudent?.includes(student._id)) {
          } else {
            batch?.ApproveStudent.push(student._id);
          }
          if (department?.ApproveStudent?.includes(student._id)) {
          } else {
            department?.ApproveStudent.push(student._id);
          }

          previousclasses?.promoteStudent?.push(stu);
          // previousclasses?.ApproveStudent?.pull(stu);
          classes.studentCount += 1;
          await student.save();

          if (student.studentGender === "Male") {
            classes.boyCount += 1;
            batch.student_category.boyCount += 1;
          } else if (student.studentGender === "Female") {
            classes.girlCount += 1;
            batch.student_category.girlCount += 1;
          } else if (student.studentGender === "Other") {
            classes.otherCount += 1;
            batch.student_category.otherCount += 1;
          } else {
          }
          if (student.studentCastCategory === "General") {
            batch.student_category.generalCount += 1;
          } else if (student.studentCastCategory === "OBC") {
            batch.student_category.obcCount += 1;
          } else if (student.studentCastCategory === "SC") {
            batch.student_category.scCount += 1;
          } else if (student.studentCastCategory === "ST") {
            batch.student_category.stCount += 1;
          } else if (student.studentCastCategory === "NT-A") {
            batch.student_category.ntaCount += 1;
          } else if (student.studentCastCategory === "NT-B") {
            batch.student_category.ntbCount += 1;
          } else if (student.studentCastCategory === "NT-C") {
            batch.student_category.ntcCount += 1;
          } else if (student.studentCastCategory === "NT-D") {
            batch.student_category.ntdCount += 1;
          } else if (student.studentCastCategory === "VJ") {
            batch.student_category.vjCount += 1;
          } else {
          }
          await Promise.all([classes.save(), batch.save()]);
        }

        await Promise.all([
          classes.save(),
          previousclasses.save(),
          batch.save(),
          department.save(),
        ]);
        res
          .status(200)
          .send({ message: "All students promoted to next selected class" });
      }
    } else {
      res.status(200).send({
        message: "Must Select Promote Application for Promotion",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getclassComplete = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid)
      .select("classStatus")
      .lean()
      .exec();
    // const classStatusEncrypt = await encryptionPayload(classes?.classStatus);
    res.status(200).send({
      message: "All subject is completed",
      classStatus: classes?.classStatus,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.classComplete = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid);
    if (classes.classStatus !== "Completed") {
      for (let subId of classes?.subject) {
        const subject = await Subject.findById(subId);
        if (subject.subjectStatus !== "Completed") {
          subject.subjectStatus = "Completed";
          const subStaff = await Staff.findById(
            subject?.subjectTeacherName
          ).select("staffSubject previousStaffSubject staffDesignationCount");
          if (subStaff.staffDesignationCount >= 1) {
            subStaff.staffDesignationCount -= 1;
          }
          subStaff.previousStaffSubject?.push(subject._id);
          subStaff.staffSubject.pull(subject._id);
          await Promise.all([subStaff.save(), subject.save()]);
        }
      }
      classes.classStatus = req.body.classStatus;
      const staff = await Staff.findById(classes?.classTeacher).select(
        "staffClass previousStaffClass"
      );
      if (staff.staffDesignationCount >= 1) {
        staff.staffDesignationCount -= 1;
      }
      staff.previousStaffClass?.push(req.params.cid);
      staff.staffClass.pull(req.params.cid);
      await Promise.all([staff.save(), classes.save()]);
      res.status(200).send({
        message: "Class is completed",
      });
    } else {
      res.status(200).send({ message: "already class is completed" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.classUncomplete = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid) throw "Please call api with proper knowledge.....";
    const classes = await Class.findById(req.params.cid);
    classes.classStatus = "UnCompleted";
    const class_teacher = await Staff.findById(classes?.classTeacher);
    class_teacher.staffDesignationCount += 1;
    class_teacher.previousStaffClass.pull(classes._id);
    class_teacher.staffClass.push(classes._id);
    await Promise.all([class_teacher.save(), classes.save()]);
    res.status(200).send({
      message: "Class unlock successfully...",
      classStatus: class_teacher.classStatus,
    });
    if (classes?.subject?.length > 0) {
      for (let subId of classes?.subject) {
        const subject = await Subject.findById(subId);
        if (subject.subjectStatus === "Completed") {
          subject.subjectStatus = "UnCompleted";
          if (subject?.subjectTeacherName) {
            const subStaff = await Staff.findById(
              subject?.subjectTeacherName
            ).select("staffSubject previousStaffSubject staffDesignationCount");
            subStaff.staffDesignationCount += 1;
            subStaff.previousStaffSubject?.pull(subject._id);
            subStaff.staffSubject.push(subject._id);
            await subStaff.save();
          }
          await subject.save();
        }
      }
    }
  } catch (e) {
    res.status(200).send({
      message: e,
      classStatus: null,
    });
    console.log(e);
  }
};

exports.assignDesignationToStaffByBatch = async (req, res) => {
  try {
    const { bid } = req.params;
    if (!bid)
      return res.status(200).send({
        message:
          "Their is a bug to call api of batch related! need to fix it soon.",
        access: true,
      });

    const batch = await Batch.findById(bid);
    const institute = await InstituteAdmin.findById(batch?.institute);

    for (let clsId of batch?.classroom) {
      const current_cls = await Class.findById(clsId);
      if (current_cls && current_cls?.classStatus === "UnCompleted") {
        const staff = await Staff.findById(current_cls?.classTeacher);
        const class_user = await User.findById({ _id: `${staff?.user}` });
        staff?.staffClass.push(current_cls._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = current_cls?.classHeadTitle;
        staff.designation_array.push({
          role: "Class Teacher",
          role_id: current_cls?._id,
        });
        const notify = new Notification({});
        notify.notifyContent = `you got the designation of ${current_cls.className} as ${current_cls.classHeadTitle}`;
        notify.notifySender = current_cls?.institute;
        notify.notifyReceiever = class_user._id;
        notify.notifyCategory = "Class Designation";
        class_user.uNotify.push(notify._id);
        notify.user = class_user._id;
        notify.notifyByInsPhoto = institute._id;
        // await invokeFirebaseNotification(
        //   "Designation Allocation",
        //   notify,
        //   institute.insName,
        //   class_user._id,
        //   class_user.deviceToken
        // );
        await Promise.all([notify.save(), class_user.save(), staff.save()]);

        for (let subId of current_cls?.subject) {
          const current_sub = await Subject.findById(subId);
          if (current_sub && current_sub?.subjectStatus === "UnCompleted") {
            const sujectStaff = await Staff.findById(
              current_sub?.subjectTeacherName
            );
            const subject_user = await User.findById({
              _id: `${sujectStaff?.user}`,
            });
            sujectStaff?.staffSubject.push(current_sub._id);
            sujectStaff.staffDesignationCount += 1;
            sujectStaff.recentDesignation = current_sub?.subjectTitle;
            sujectStaff.designation_array.push({
              role: "Subject Teacher",
              role_id: current_sub?._id,
            });
            const notify_subject = new Notification({});
            notify_subject.notifyContent = `you got the designation of ${current_sub.subjectName} as ${current_sub.subjectTitle}`;
            notify_subject.notifySender = batch?.institute;
            notify_subject.notifyReceiever = subject_user._id;
            notify.notifyCategory = "Subject Designation";
            subject_user.uNotify.push(notify_subject._id);
            notify_subject.user = subject_user._id;
            notify_subject.notifyByInsPhoto = institute._id;
            // await invokeFirebaseNotification(
            //   "Designation Allocation",
            //   notify_subject,
            //   institute.insName,
            //   subject_user._id,
            //   subject_user.deviceToken
            // );
            await Promise.all([
              notify_subject.save(),
              sujectStaff.save(),
              subject_user.save(),
            ]);
          }
        }
      }
    }
    batch.designation_send = "Yes";
    await batch.save();
    res.status(200).send({
      message: "Assign all designation to respective staff 😋😊",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.batchCompleteAndUncomplete = async (req, res) => {
  try {
    const { bid } = req.params;
    if (!bid)
      return res.status(200).send({
        message:
          "Their is a bug to call api of batch related! need to fix it soon.",
        access: true,
      });
    const batch = await Batch.findById(bid);
    if (batch?.batchStatus === "UnLocked") {
      for (let clsId of batch?.classroom) {
        const classes = await Class.findById(clsId);
        if (classes.classStatus !== "Completed") {
          for (let subId of classes?.subject) {
            const subject = await Subject.findById(subId);
            if (subject) {
              if (subject?.subjectStatus !== "Completed") {
                subject.subjectStatus = "Completed";
                if (subject?.subjectTeacherName) {
                  const subStaff = await Staff.findById(
                    subject?.subjectTeacherName
                  );
                  if (subStaff.staffDesignationCount > 0) {
                    subStaff.staffDesignationCount -= 1;
                  }
                  subStaff.previousStaffSubject?.push(subject._id);
                  subStaff.staffSubject.pull(subject._id);
                  await subStaff.save();
                }
                await subject.save();
              }
            }
          }
          if (classes?.classTeacher) {
            const staff = await Staff.findById(classes?.classTeacher);
            if (staff.staffDesignationCount > 0) {
              staff.staffDesignationCount -= 1;
            }
            staff.previousStaffClass?.push(clsId);
            staff.staffClass.pull(clsId);
            classes.classStatus = "Completed";
            await Promise.all([staff.save(), classes.save()]);
          }
        }
      }
      batch.batchStatus = "Locked";
      await batch.save();
    } else {
      for (let clsId of batch?.classroom) {
        const classes = await Class.findById(clsId);
        if (classes.classStatus === "Completed") {
          for (let subId of classes?.subject) {
            const subject = await Subject.findById(subId);
            if (subject) {
              if (subject?.subjectStatus === "Completed") {
                subject.subjectStatus = "UnCompleted";
                if (subject?.subjectTeacherName) {
                  const subStaff = await Staff.findById(
                    subject?.subjectTeacherName
                  );
                  subStaff.staffDesignationCount += 1;
                  subStaff.previousStaffSubject?.pull(subject._id);
                  subStaff.staffSubject.push(subject._id);
                  await subStaff.save();
                }
                await subject.save();
              }
            }
          }
          if (classes?.classTeacher) {
            const staff = await Staff.findById(classes?.classTeacher);
            staff.staffDesignationCount += 1;
            staff.previousStaffClass?.pull(clsId);
            staff.staffClass.push(clsId);
            await staff.save();
          }
          classes.classStatus = "UnCompleted";
          await classes.save();
        }
      }
      batch.batchStatus = "UnLocked";
      await batch.save();
    }
    res.status(200).send({ message: "Btach Action is completed." });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectCreditUpdate = async (req, res) => {
  try {
    const { smid } = req.params;
    if (!smid)
      return res.status(200).send({
        message:
          "Their is a bug to call api of batch related! need to fix it soon.",
        access: true,
      });
    const sub_master = await SubjectMaster.findById(smid);
    sub_master.course_credit = req.body?.course_credit;
    for (let subId of sub_master?.subjects) {
      const subject = await Subject.findById(subId);
      subject.course_credit = req.body?.course_credit ?? 0;
      await subject.save();
    }
    await sub_master.save();
    res.status(200).send({ message: "Subject credit is updated" });
  } catch (e) {
    console.log(e);
  }
};

exports.undo = async (req, res) => {
  try {
    const { cid, flow } = req.query;
    const { arr } = req?.body;
    const classes = await Class.findById(cid);
    // var arr = ["6480892ebff5c201991e3297"];
    if (flow === "FULL_CLASS") {
      for (var stu of classes?.promoteStudent) {
        // for (var stu of arr) {
        var student = await Student.findById(stu);
        if (`${cid}` !== `${student?.studentClass}`) {
          var cls = await Class.findById(student?.studentClass);
          cls.ApproveStudent.pull(student?._id);
          if (student?.studentGender?.toLowerCase() === "male") {
            if (cls?.boyCount > 0) {
              cls.boyCount -= 1;
            }
            if (cls?.studentCount > 0) {
              cls.studentCount -= 1;
            }
            if (cls?.strength > 0) {
              cls.strength -= 1;
            }
          }
          if (student?.studentGender?.toLowerCase() === "female") {
            if (cls?.girlCount > 0) {
              cls.girlCount -= 1;
            }
            if (cls?.studentCount > 0) {
              cls.studentCount -= 1;
            }
            if (cls?.strength > 0) {
              cls.strength -= 1;
            }
          }
          if (student?.studentGender?.toLowerCase() === "other") {
            if (cls?.otherCount > 0) {
              cls.otherCount -= 1;
            }
            if (cls?.studentCount > 0) {
              cls.studentCount -= 1;
            }
            if (cls?.strength > 0) {
              cls.strength -= 1;
            }
          }
          await cls.save();
          var prevL = student?.previousYearData?.length - 1;
          var preStudent = await StudentPreviousData.findById(
            student.previousYearData[prevL]
          );

          student.studentCode = preStudent.studentCode;
          student.studentClass = preStudent.studentClass;
          student.batches = preStudent.batches;
          student.studentROLLNO = preStudent.studentROLLNO;
          student.studentBehaviour = preStudent.studentBehaviour;
          student.department = preStudent.department;
          student.institute = preStudent.institute;
          if (student?.fee_structure) {
            var remain_card = await RemainingList.findOne({
              $and: [
                { fee_structure: `${student?.fee_structure}` },
                { student: student?._id },
              ],
            });
            if (remain_card?._id) {
              student.remainingFeeList.pull(remain_card?._id);
            }
            if (student?.remainingFeeList_count > 0) {
              student.remainingFeeList_count -= 1;
            }
            if (
              student?.admissionRemainFeeCount >= remain_card?.remaining_fee
            ) {
              student.admissionRemainFeeCount -= remain_card.remaining_fee;
            }
            if (remain_card?._id) {
              await RemainingList.findByIdAndDelete(remain_card?._id);
            }
          }
          student.fee_structure = preStudent?.fee_structure;
          await student.save();
          var clsPrev = await Class.findById(student?.studentClass);
          clsPrev.promoteStudent.pull(student?._id);
          await clsPrev.save();
        }
      }
      res.status(200).send({ message: "UNDO", access: true });
    } else if (flow === "PARTICULAR_STUDENT") {
      for (var stu of arr) {
        var student = await Student.findById(stu);
        if (`${cid}` !== `${student?.studentClass}`) {
          var cls = await Class.findById(student?.studentClass);
          cls.ApproveStudent.pull(student?._id);
          if (student?.studentGender?.toLowerCase() === "male") {
            if (cls?.boyCount > 0) {
              cls.boyCount -= 1;
            }
            if (cls?.studentCount > 0) {
              cls.studentCount -= 1;
            }
            if (cls?.strength > 0) {
              cls.strength -= 1;
            }
          }
          if (student?.studentGender?.toLowerCase() === "female") {
            if (cls?.girlCount > 0) {
              cls.girlCount -= 1;
            }
            if (cls?.studentCount > 0) {
              cls.studentCount -= 1;
            }
            if (cls?.strength > 0) {
              cls.strength -= 1;
            }
          }
          if (student?.studentGender?.toLowerCase() === "other") {
            if (cls?.otherCount > 0) {
              cls.otherCount -= 1;
            }
            if (cls?.studentCount > 0) {
              cls.studentCount -= 1;
            }
            if (cls?.strength > 0) {
              cls.strength -= 1;
            }
          }
          await cls.save();
          var prevL = student?.previousYearData?.length - 1;
          var preStudent = await StudentPreviousData.findById(
            student.previousYearData[prevL]
          );

          student.studentCode = preStudent.studentCode;
          student.studentClass = preStudent.studentClass;
          student.batches = preStudent.batches;
          student.studentROLLNO = preStudent.studentROLLNO;
          student.studentBehaviour = preStudent.studentBehaviour;
          student.department = preStudent.department;
          student.institute = preStudent.institute;
          if (student?.fee_structure) {
            var remain_card = await RemainingList.findOne({
              $and: [
                { fee_structure: `${student?.fee_structure}` },
                { student: student?._id },
              ],
            });
            if (remain_card?._id) {
              student.remainingFeeList.pull(remain_card?._id);
            }
            if (student?.remainingFeeList_count > 0) {
              student.remainingFeeList_count -= 1;
            }
            if (
              student?.admissionRemainFeeCount >= remain_card?.remaining_fee
            ) {
              student.admissionRemainFeeCount -= remain_card.remaining_fee;
            }
            if (remain_card?._id) {
              await RemainingList.findByIdAndDelete(remain_card?._id);
            }
          }
          student.fee_structure = preStudent?.fee_structure;
          await student.save();
          var clsPrev = await Class.findById(student?.studentClass);
          clsPrev.promoteStudent.pull(student?._id);
          await clsPrev.save();
        }
      }
      res.status(200).send({ message: "UNDO", access: true });
    } else {
      res.status(200).send({ message: "INVALID FLOW", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.subjectPassingCreditUpdate = async (req, res) => {
  try {
    const { did } = req.params;
    let passing = req.body?.course_passing_credit ?? 0;
    if (!did)
      return res.status(200).send({
        message:
          "Their is a bug to call api of batch related! need to fix it soon.",
        access: true,
      });
    const department = await Department.findById(did);
    department.course_passing_credit = req.body?.course_passing_credit;
    await department.save();
    res.status(200).send({ message: "Subject passing credit is updated" });

    // console.log("department", department.departmentSubjectMasters);
    for (let smid of department?.departmentSubjectMasters) {
      const sub_master = await SubjectMaster.findById(smid);
      sub_master.course_passing_credit = passing;
      for (let subId of sub_master?.subjects) {
        const subject = await Subject.findById(subId);
        subject.course_passing_credit = passing;
        await subject.save();
      }
      await sub_master.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.departmentProgrammeNameQuery = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message:
          "Their is a bug to call api of batch related! need to fix it soon.",
        access: true,
      });
    const department = await Department.findById(did);
    department.department_programme_name = req.body?.department_programme_name;
    await department.save();
    res.status(200).send({ message: "Programme name is updated" });
  } catch (e) {
    console.log(e);
  }
};

exports.batchStaffRemoveDesignationQuery = async (req, res) => {
  try {
    const { bid } = req.params;
    if (!bid)
      return res.status(200).send({
        message:
          "Their is a bug to call api of batch related! need to fix it soon.",
        access: true,
      });
    const batch = await Batch.findById(bid);

    for (let clsId of batch?.classroom) {
      const classes = await Class.findById(clsId);
      for (let subId of classes?.subject) {
        const subject = await Subject.findById(subId);
        if (subject?.subjectTeacherName) {
          const subStaff = await Staff.findById(subject?.subjectTeacherName);
          if (subStaff.staffDesignationCount > 0) {
            subStaff.staffDesignationCount -= 1;
          }
          subStaff.previousStaffSubject?.push(subject._id);
          subStaff.staffSubject.pull(subject._id);
          await subStaff.save();
        }
      }
      if (classes?.classTeacher) {
        const staff = await Staff.findById(classes?.classTeacher);
        if (staff.staffDesignationCount > 0) {
          staff.staffDesignationCount -= 1;
        }
        staff.previousStaffClass?.push(clsId);
        staff.staffClass.pull(clsId);
        await staff.save();
      }
    }
    batch.batchStatus = "UnLocked";
    await batch.save();
    res.status(200).send({ message: "Remove designation from staff side." });
  } catch (e) {
    console.log(e);
  }
};
