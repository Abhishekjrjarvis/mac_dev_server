const InstituteAdmin = require("../../models/InstituteAdmin");
const Staff = require("../../models/Staff");
const Admission = require("../../models/Admission/Admission");
const ScholarShip = require("../../models/Admission/Scholarship");
const FundCorpus = require("../../models/Admission/FundCorpus");
const Inquiry = require("../../models/Admission/Inquiry");
const User = require("../../models/User");
const Notification = require("../../models/notification");
const NewApplication = require("../../models/Admission/NewApplication");
const BankAccount = require("../../models/Finance/BankAccount");
const Student = require("../../models/Student");
const Status = require("../../models/Admission/status");
const Income = require("../../models/Income");
const Finance = require("../../models/Finance");
const Batch = require("../../models/Batch");
const ClassMaster = require("../../models/ClassMaster");
const Department = require("../../models/Department");
const Class = require("../../models/Class");
const FinanceModerator = require("../../models/Moderator/FinanceModerator");
const Admin = require("../../models/superAdmin");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const {
  designation_alarm,
  email_sms_payload_query,
  email_sms_designation_alarm,
  email_sms_designation_application,
  email_sms_designation_application_apply,
} = require("../../WhatsAppSMS/payload");
const Hostel = require("../../models/Hostel/hostel");
const {
  uploadDocFile,
  uploadFile,
  uploadPostImageFile,
  deleteFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../Firebase/firebase");
const Post = require("../../models/Post");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const bcrypt = require("bcryptjs");
const {
  new_admission_recommend_post,
} = require("../../Service/AutoRefreshBackend");
const BusinessTC = require("../../models/Finance/BToC");
const StudentNotification = require("../../models/Marks/StudentNotification");
const { file_to_aws } = require("../../Utilities/uploadFileAws");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");
const {
  filter_unique_username,
  generateAccessToken,
  generate_hash_pass,
  new_chat_username_unique,
} = require("../../helper/functions");
const {
  custom_date_time,
  user_date_of_birth,
  age_calc,
} = require("../../helper/dayTimer");
const {
  add_all_installment,
  render_installment,
  add_total_installment,
  exempt_installment,
  set_fee_head_query,
  remain_one_time_query,
  remain_one_time_query_government,
  remain_government_installment,
  update_fee_head_query,
  set_fee_head_query_retro,
  set_retro_installment,
  lookup_applicable_grant,
  add_all_installment_zero,
  set_fee_head_query_redesign,
  receipt_set_fee_head_query_redesign,
  set_fee_head_redesign,
  update_fee_head_query_redesign,
  render_government_installment_query,
  all_installment_paid,
  set_fee_head_query2,
  update_fee_head_query2,
  update_fee_head_query_deposit,
  set_fee_head_query_deposit,
  set_fee_head_query_redesign_split,
  update_fee_head_query_redesign_split,
} = require("../../helper/Installment");
const { whats_app_sms_payload } = require("../../WhatsAppSMS/payload");
const {
  render_admission_current_role,
} = require("../Moderator/roleController");
const FeeStructure = require("../../models/Finance/FeesStructure");
const { nested_document_limit } = require("../../helper/databaseFunction");
const RemainingList = require("../../models/Admission/RemainingList");
const { dueDateAlarm, document_alarm } = require("../../Service/alarm");
const { handle_undefined } = require("../../Handler/customError");
const { set_off_amount } = require("../../Functions/SetOff");
const {
  set_fee_head_query_redesign_hostel,
} = require("../../Functions/hostelInstallment");
const { universal_random_password } = require("../../Custom/universalId");
const QvipleId = require("../../models/Universal/QvipleId");
const {
  mismatch_scholar_transaction_json_to_excel_query,
  json_to_excel_admission_application_query,
} = require("../../Custom/JSONToExcel");
const NestedCard = require("../../models/Admission/NestedCard");
const {
  render_new_fees_card,
  render_new_fees_card_install,
} = require("../../Functions/FeesCard");
const Charges = require("../../models/SuperAdmin/Charges");
const {
  fee_receipt_count_query,
  fee_receipt_count_query_new,
  form_no_query,
} = require("../../Functions/AdmissionCustomFunctions.js/Reusable");
const {
  renderAllStudentToUnApprovedAutoCatalogQuery,
} = require("../Authentication/AuthController");
const FeeMaster = require("../../models/Finance/FeeMaster");
const DeleteLogs = require("../../models/RazorPay/DeleteLogs");
const InstituteApplicationForm = require("../../models/Form/InstituteApplicationForm");
const InstituteStudentForm = require("../../models/Form/InstituteStudentForm");
const FormChecklist = require("../../models/Form/FormChecklist");
const generateFeeReceipt = require("../../scripts/feeReceipt");
const SubjectGroup = require("../../models/Admission/Optional/SubjectGroup");
const SubjectGroupSelect = require("../../models/Admission/Optional/SubjectGroupSelect");
const SubjectMaster = require("../../models/SubjectMaster");
const Subject = require("../../models/Subject");
const generateStudentAdmissionForm = require("../../scripts/studentAdmissionForm");
const {
  universal_random_password_student_code,
} = require("../../Generator/RandomPass");
const RequiredDocument = require("../../models/Admission/RequiredDocument");
const societyAdmissionFeeReceipt = require("../../scripts/societyAdmissionFeeReceipt");
const FeesCategory = require("../../models/Finance/FeesCategory");

exports.retrieveAdmissionAdminHead = async (req, res) => {
  try {
    const { id } = req.params;
    const { sid } = req.body;
    if (!sid && !id)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    var institute = await InstituteAdmin.findById({ _id: id });
    var admission = new Admission({});
    const codess = universal_random_password();
    admission.member_module_unique = `${codess}`;
    if (sid) {
      var staff = await Staff.findById({ _id: sid });
      var user = await User.findById({ _id: `${staff.user}` });
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
      await Promise.all([
        staff.save(),
        admission.save(),
        user.save(),
        notify.save(),
      ]);
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
    } else {
      admission.admissionAdminHead = null;
    }
    institute.admissionDepart.push(admission._id);
    institute.admissionStatus = "Enable";
    admission.institute = institute._id;
    await Promise.all([institute.save(), admission.save()]);
    // const adsEncrypt = await encryptionPayload(admission._id);
    res.status(200).send({
      message: "Successfully Assigned Staff",
      admission: admission._id,
      status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionDetailInfo = async (req, res) => {
  try {
    const { aid } = req.params;
    const { mod_id } = req.query;
    // const is_cache = await connect_redis_hit(`Admission-Detail-${aid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Detail Admission Admin from Cache 🙌",
    //     answer: is_cache.admission,
    //   });
    const admission = await Admission.findById({ _id: aid })
      .select(
        "admissionAdminEmail admissionAdminPhoneNumber enable_protection tab_manage online_amount_edit_access fee_receipt_request_count fee_receipt_approve_count fee_receipt_reject_count moderator_role moderator_role_count completedCount exemptAmount requested_status collected_fee remainingFee admissionAdminAbout photoId coverId photo queryCount newAppCount cover offlineFee onlineFee remainingFeeCount refundCount export_collection_count designation_status active_tab_index alarm_enable alarm_enable_status refundedCount app_qr_code code_url app_hindi_qr_code app_marathi_qr_code admission_form_print_case"
      )
      .populate({
        path: "admissionAdminHead",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto user",
        populate: {
          path: "user",
          select: "userBio userAbout",
        },
      })
      .populate({
        path: "institute",
        select:
          "_id insName insProfilePhoto status financeDepart hostelDepart random_institute_code alias_pronounciation profileQRCode",
      });
    // const cached = await connect_redis_miss(
    //   `Admission-Detail-${aid}`,
    //   admission
    // );
    if (req?.query?.mod_id) {
      var value = await render_admission_current_role(
        admission?.moderator_role,
        mod_id
      );
      if (value?.valid_role) {
      } else {
        admission.enable_protection = false;
      }
    }
    const ads_obj = {
      message: "All Detail Admission Admin from DB 🙌",
      // admission: cached.admission,
      admission: admission,
      roles: req?.query?.mod_id ? value?.permission : null,
    };
    const adsEncrypt = await encryptionPayload(ads_obj);
    res.status(200).send({
      encrypt: adsEncrypt,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retieveAdmissionAdminAllApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(
    //   `Admission-Ongoing-${aid}-${page}`
    // );
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Ongoing Application from Cache 🙌",
    //     ongoing: is_cache.ongoing,
    //     ongoingCount: is_cache.ongoingCount,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await Admission.findById({ _id: aid }).select(
      "newApplication"
    );
    const ongoing = await NewApplication.find({
      $and: [
        { _id: { $in: apply.newApplication } },
        { applicationStatus: "Ongoing" },
        { applicationTypeStatus: "Normal Application" },
      ],
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "applicationName applicationEndDate applicationTypeStatus receievedApplication selectedApplication confirmedApplication admissionAdmin selectCount confirmCount receievedCount allottedApplication allotCount applicationStatus applicationSeats applicationMaster applicationAbout admissionProcess application_flow applicationBatch gr_initials cancelApplication cancelCount reviewApplication review_count FeeCollectionApplication fee_collect_count student_form_setting pin"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName photoId photo",
      })
      .populate({
        path: "admissionAdmin",
        select: "institute",
        populate: {
          path: "institute",
          select: "insName",
        },
      });

    if (ongoing?.length > 0) {
      // Add Another Encryption
      // const bind_ongoing = {
      //   ongoing: ongoing,
      //   ongoingCount: ongoing?.length,
      // };
      // const cached = await connect_redis_miss(
      //   `Admission-Ongoing-${aid}-${page}`,
      //   bind_ongoing
      // );
      for (var ref of ongoing) {
        ref.selectCount = ref?.selectedApplication?.length;
        ref.confirmCount = ref?.confirmedApplication?.length;
        ref.receievedCount = ref?.receievedApplication?.length;
        ref.allotCount = ref?.allottedApplication?.length;
        ref.cancelCount = ref?.cancelApplication?.length;
        ref.review_count = ref?.reviewApplication?.length;
        ref.fee_collect_count = ref?.FeeCollectionApplication?.length;
      }
      const ads_obj = {
        message: "All Ongoing Application from DB 🙌",
        // ongoing: cached.ongoing,
        // ongoingCount: cached.ongoingCount,
        ongoing: ongoing,
        ongoingCount: ongoing?.length,
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({
        encrypt: adsEncrypt,
        ads_obj,
      });
    } else {
      const ads_obj = {
        message: "Dark side in depth nothing to find",
        ongoing: [],
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({ encrypt: adsEncrypt });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retieveAdmissionAdminAllCApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(
    //   `Admission-Completed-${aid}-${page}`
    // );
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Completed Application from Cache 🙌",
    //     completed: is_cache.completed,
    //     completedCount: is_cache.completedCount,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await Admission.findById({ _id: aid }).select(
      "newApplication"
    );
    const completed = await NewApplication.find({
      $and: [
        { _id: { $in: apply.newApplication } },
        { applicationStatus: "Completed" },
        { applicationTypeStatus: "Normal Application" },
      ],
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "applicationName applicationEndDate applicationTypeStatus applicationStatus applicationSeats allotCount pin"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName photoId photo",
      });

    if (completed?.length > 0) {
      // Add Another Encryption
      // const bind_complete = {
      //   completed: completed,
      //   completedCount: completed?.length,
      // };
      // const cached = await connect_redis_miss(
      //   `Admission-Completed-${aid}-${page}`,
      //   bind_complete
      // );
      const ads_obj = {
        message: "All Completed Applicationd from DB 🙌",
        // completed: cached.completed,
        // completedCount: cached.completedCount,
        completed: completed,
        completedCount: completed?.length,
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({
        encrypt: adsEncrypt,
      });
    } else {
      const ads_obj = {
        message: "Dark side in depth nothing to find",
        completed: [],
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({ encrypt: adsEncrypt });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retieveAdmissionAdminAllCDetailApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(
    //   `Admission-Completed-${aid}-${page}`
    // );
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Completed Application from Cache 🙌",
    //     completed: is_cache.completed,
    //     completedCount: is_cache.completedCount,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await Admission.findById({ _id: aid }).select(
      "newApplication"
    );
    const completed = await NewApplication.find({
      $and: [
        { _id: { $in: apply.newApplication } },
        { applicationStatus: "Completed" },
      ],
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "applicationName applicationStartDate admissionFee applicationSeats receievedCount selectCount confirmCount cancelCount allotCount onlineFee offlineFee remainingFee collectedFeeCount applicationStatus applicationEndDate"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName",
      })
      .populate({
        path: "applicationBatch",
        select: "batchName",
      });

    if (completed?.length > 0) {
      // Add Another Encryption
      // const bind_complete = {
      //   completed: completed,
      //   completedCount: completed?.length,
      // };
      // const cached = await connect_redis_miss(
      //   `Admission-Completed-${aid}-${page}`,
      //   bind_complete
      // );
      const ads_obj = {
        message: "All Completed Applicationd from DB 🙌",
        // completed: cached.completed,
        // completedCount: cached.completedCount,
        completed: completed,
        completedCount: completed?.length,
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({
        encrypt: adsEncrypt,
      });
    } else {
      const ads_obj = {
        message: "Dark side in depth nothing to find",
        completed: [],
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({ encrypt: adsEncrypt });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAdmissionQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    await Admission.findByIdAndUpdate(aid, req.body);
    res.status(200).send({ message: "Admission Info Updated" });
  } catch {}
};

exports.retrieveAdmissionNewApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const { flow } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const { expand } = req.query;
    req.body.applicationSeats = req.body?.applicationSeats
      ? parseInt(req.body?.applicationSeats)
      : 0;
    if (flow === "HOSTEL") {
      var one_hostel = await Hostel.findById({ _id: aid });
      var institute = await InstituteAdmin.findById({
        _id: `${one_hostel.institute}`,
      });
      var newApply = new NewApplication({ ...req.body });
      var iaf = new InstituteApplicationForm({});
      iaf.application = newApply?._id;
      newApply.student_form_setting = iaf?._id;
      one_hostel.newApplication.push(newApply._id);
      one_hostel.newAppCount += 1;
      newApply.hostelAdmin = one_hostel?._id;
      newApply.applicationHostel = aid;
      newApply.application_flow = "Hostel Application";
      newApply.applicationTypeStatus = "Normal Application";
      institute.hostelCount += 1;
      await Promise.all([
        one_hostel.save(),
        newApply.save(),
        institute.save(),
        iaf.save(),
      ]);
    } else {
      var admission = await Admission.findById({ _id: aid });
      var institute = await InstituteAdmin.findById({
        _id: `${admission.institute}`,
      });
      var newApply = new NewApplication({ ...req.body });
      // const child = JSON?.parse(req.body.applicationChildTypes);
      // if (child) {
      //   for (var i = 0; i < child.length; i++) {
      //     newApply.applicationChildType.push(child[i]);
      //   }
      // }
      var iaf = new InstituteApplicationForm({});
      iaf.application = newApply?._id;
      newApply.student_form_setting = iaf?._id;
      admission.newApplication.push(newApply._id);
      admission.newAppCount += 1;
      newApply.admissionAdmin = admission._id;
      institute.admissionCount += 1;
      newApply.applicationTypeStatus = "Normal Application";
      await Promise.all([
        admission.save(),
        newApply.save(),
        institute.save(),
        iaf.save(),
      ]);
    }
    res
      .status(200)
      .send({ message: "New Application is ongoing 👍", status: true });
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
          if (ele?.nested_form_checklist?.length > 0) {
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
                for (var qwes of stu?.nested_form_checklist_nested) {
                  var fcca = new FormChecklist({
                    form_checklist_name: qwes?.form_checklist_name,
                    form_checklist_key: qwes?.form_checklist_key,
                    form_checklist_visibility: qwes?.form_checklist_visibility,
                    form_checklist_placeholder:
                      qwes?.form_checklist_placeholder,
                    form_checklist_lable: qwes?.form_checklist_lable,
                    form_checklist_typo: qwes?.form_checklist_typo,
                    form_checklist_required: qwes?.form_checklist_required,
                    form_checklist_key_status: qwes?.form_checklist_key_status,
                    width: qwes?.width,
                  });
                  if (
                    qwes?.form_checklist_typo_option_pl &&
                    qwes?.form_checklist_typo_option_pl?.length > 0
                  ) {
                    fcca.form_checklist_typo_option_pl = [
                      ...qwes?.form_checklist_typo_option_pl,
                    ];
                  }
                  if (qwes?.form_checklist_sample) {
                    fcca.form_checklist_sample = qwes?.form_checklist_sample;
                  }
                  if (qwes?.form_checklist_pdf) {
                    fcca.form_checklist_pdf = qwes?.form_checklist_pdf;
                  }
                  if (qwes?.form_checklist_view) {
                    fcca.form_checklist_view = qwes?.form_checklist_view;
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
      nums = [];
    }
    await iaf.save();
    // const post = new Post({});
    // post.imageId = "1";
    // institute.posts.push(post._id);
    // institute.postCount += 1;
    // post.author = institute._id;
    // post.authorName = institute.insName;
    // post.authorUserName = institute.name;
    // post.authorPhotoId = institute.photoId;
    // post.authorProfilePhoto = institute.insProfilePhoto;
    // post.authorOneLine = institute.one_line_about;
    // post.authorFollowersCount = institute.followersCount;
    // post.isInstitute = "institute";
    // post.postType = "Application";
    // post.new_application = newApply._id;
    // post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    // await Promise.all([post.save(),
    await institute.save();
    if (flow === "HOSTEL") {
    } else {
      var valid_promote = await NewApplication.find({
        $and: [
          { applicationTypeStatus: "Promote Application" },
          { admissionAdmin: admission?._id },
          { applicationDepartment: newApply?.applicationDepartment },
          { applicationBatch: newApply?.applicationBatch },
        ],
      });
      if (valid_promote?.length > 0) {
        // console.log("valid");
      } else {
        // console.log("no valid");
        const new_app = new NewApplication({
          applicationName: "Promote Student",
          applicationDepartment: newApply?.applicationDepartment,
          applicationBatch: newApply?.applicationBatch,
          applicationMaster: newApply?.applicationMaster,
          applicationTypeStatus: "Promote Application",
        });
        var iaff = new InstituteApplicationForm({});
        iaff.application = new_app?._id;
        new_app.student_form_setting = iaff?._id;
        admission.newApplication.push(new_app._id);
        admission.newAppCount += 1;
        new_app.admissionAdmin = admission._id;
        institute.admissionCount += 1;
        await Promise.all([
          new_app.save(),
          admission.save(),
          institute.save(),
          iaff.save(),
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
        var numss = [];
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
              fc.application_form = iaff?._id;
              fc.form_section = val?._id;
              if (ele?.nested_form_checklist?.length > 0) {
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
                    for (var qwes of stu?.nested_form_checklist_nested) {
                      var fcca = new FormChecklist({
                        form_checklist_name: qwes?.form_checklist_name,
                        form_checklist_key: qwes?.form_checklist_key,
                        form_checklist_visibility:
                          qwes?.form_checklist_visibility,
                        form_checklist_placeholder:
                          qwes?.form_checklist_placeholder,
                        form_checklist_lable: qwes?.form_checklist_lable,
                        form_checklist_typo: qwes?.form_checklist_typo,
                        form_checklist_required: qwes?.form_checklist_required,
                        form_checklist_key_status:
                          qwes?.form_checklist_key_status,
                        width: qwes?.width,
                      });
                      if (
                        qwes?.form_checklist_typo_option_pl &&
                        qwes?.form_checklist_typo_option_pl?.length > 0
                      ) {
                        fcca.form_checklist_typo_option_pl = [
                          ...qwes?.form_checklist_typo_option_pl,
                        ];
                      }
                      if (qwes?.form_checklist_sample) {
                        fcca.form_checklist_sample =
                          qwes?.form_checklist_sample;
                      }
                      if (qwes?.form_checklist_pdf) {
                        fcca.form_checklist_pdf = qwes?.form_checklist_pdf;
                      }
                      if (qwes?.form_checklist_view) {
                        fcca.form_checklist_view = qwes?.form_checklist_view;
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
              }
              numss.push(fc?._id);
              await fc.save();
            }
          }
          iaff.form_section.push({
            section_name: val?.section_name,
            section_visibilty: val?.section_visibilty,
            section_key: val?.section_key,
            ins_form_section_id: val?._id,
            form_checklist: [...numss],
          });
          numss = [];
        }
        await iaff.save();
      }
    }
    // await new_admission_recommend_post(institute?._id, post?._id, expand);
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAdmissionApplicationArray = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`Institute-All-App-${id}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Institute Application Feed from Cache 🙌",
    //     allApp: is_cache.newApp,
    //     allAppCount: is_cache.allAppCount,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    const ins_apply = await InstituteAdmin.findById({ _id: id });
    if (ins_apply?.admissionDepart?.length > 0) {
      if (search) {
        const apply = await Admission.findById({
          _id: `${ins_apply?.admissionDepart[0]}`,
        });
        var newApp = await NewApplication.find({
          $and: [
            { _id: { $in: apply?.newApplication } },
            { applicationStatus: "Ongoing" },
            { applicationTypeStatus: "Normal Application" },
          ],
          $or: [
            { applicationParentType: { $regex: search, $options: "i" } },
            {
              applicationChildType: { $in: search },
            },
          ],
        })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "applicationName applicationEndDate applicationTypeStatus application_type"
          )
          .populate({
            path: "applicationDepartment",
            select: "dName studentFormSetting",
          })
          .populate({
            path: "applicationBatch",
            select: "batchName",
          });
      } else {
        const apply = await Admission.findById({
          _id: `${ins_apply?.admissionDepart[0]}`,
        });
        var newApp = await NewApplication.find({
          $and: [
            { _id: { $in: apply?.newApplication } },
            { applicationStatus: "Ongoing" },
            { applicationTypeStatus: "Normal Application" },
          ],
        })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "applicationName applicationEndDate applicationTypeStatus application_type"
          )
          .populate({
            path: "applicationDepartment",
            select: "dName studentFormSetting",
          })
          .populate({
            path: "applicationBatch",
            select: "batchName",
          });
      }
      // if(newApp?.length > 0){
      // Add Another Encryption
      // const bind_ins_app = {
      //   allApp: newApp,
      //   allAppCount: newApp?.length,
      // };
      // const cached = await connect_redis_miss(
      //   `Institute-All-App-${id}-${page}`,
      //   bind_ins_app
      // );
      const ads_obj = {
        message: "Lets begin new year journey from DB 🙌",
        // allApp: cached.newApp,
        // allAppCount: cached.allAppCount,
        allApp: newApp,
        allAppCount: newApp?.length,
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({
        encrypt: adsEncrypt,
      });
      // }
    } else {
      const ads_obj = {
        message: "get a better lens to find what you need 🔍",
        allApp: [],
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({
        encrypt: adsEncrypt,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports.app_status = async (
  apply,
  institute,
  student,
  filtered_account,
  user
) => {
  const status = new Status({});
  status.content = `Your application for ${apply?.applicationName} have been filled successfully.

Below is the admission process:
1. You will get notified here after your selection or rejection from the institute. ( In case there is no notification within 3 working days, visit or contact the admission department)

2.After selection, confirm from your side and start the admission process.

3.After confirmation from your side, visit the institute with the required documents and applicable fees. (You will get Required documents and application fees information on your selection from the institute side. (Till then check our standard required documents and fee structures)

4.Payment modes available for fee payment: 
Online: UPI, Debit Card, Credit Card, Net banking & other payment apps (Phonepe, Google pay, Paytm)

5.After submission and verification of documents, you are required to pay application admission fees.

6. Pay application admission fees and your admission will be confirmed and complete.

7. For cancellation and refund, contact the admission department.

Note: Stay tuned for further updates.`;
  status.applicationId = apply._id;
  status.document_visible = true;
  status.instituteId = institute._id;
  status.finance = institute?.financeDepart?.[0];
  status.student = student?._id;
  status.group_by = "Admission_Application_Applied";
  status.bank_account = filtered_account?._id;
  user.applicationStatus.push(status._id);
  user.applyApplication.push(apply._id);
  await Promise.all([status.save(), user.save()]);
};

module.exports.docs_status = async (
  apply,
  institute,
  student,
  user,
  structure
) => {
  const status = new Status({});
  status.content = `You have been selected for ${apply.applicationName}. 
Your fee structure will be ${structure?.structure_name}. And required documents are 'click here for details'.   
Start your admission process by confirming below.`;
  status.applicationId = apply._id;
  status.for_docs = "Yes";
  status.studentId = student._id;
  status.group_by = "Admission_Document_Verification";
  status.student = student._id;
  status.admissionFee = structure.total_admission_fees;
  status.instituteId = institute?._id;
  status.feeStructure = structure?._id;
  status.document_visible = true;
  status.finance = institute?.financeDepart?.[0];
  user.applicationStatus.push(status._id);
  status.structure_edited = "Edited";
  await Promise.all([status.save(), user.save()]);
};

module.exports.fees_status = async (
  apply,
  institute,
  student,
  user,
  structure,
  c_num
) => {
  const status = new Status({});
  status.content = `Your documents are submitted and verified successfully.Complete your admission by paying application admission fees from below: Application Admission Fees: Rs.${structure?.applicable_fees}`;
  status.applicationId = apply._id;
  user.applicationStatus.push(status._id);
  status.group_by = "Admission_Fees_Payment";
  status.remaining_list = c_num?.card;
  status.payment_status = "Not Paid";
  status.finance = institute?.financeDepart?.[0];
  status.feeStructure = structure?._id;
  status.for_selection = "Yes";
  status.structure_edited = "Edited";
  status.studentId = student?._id;
  status.student = student?._id;
  status.instituteId = institute._id;
  await Promise.all([status.save(), user.save()]);
};

const class_status = async (apply, institute, depart, user, classes) => {
  const status = new Status({});
  status.content = `Welcome to ${depart.dName} ${classes.classTitle} Enjoy your Learning.`;
  status.group_by = "Admission_Class_Allotment";
  status.classes = classes?._id;
  status.applicationId = apply._id;
  user.applicationStatus.push(status._id);
  status.instituteId = institute._id;
  await Promise.all([status.save(), user.save()]);
};

module.exports.classes_status = async (
  apply,
  institute,
  depart,
  user,
  classes
) => {
  const status = new Status({});
  status.content = `Welcome to ${depart.dName} ${classes.classTitle} Enjoy your Learning.`;
  status.group_by = "Admission_Class_Allotment";
  status.classes = classes?._id;
  status.applicationId = apply._id;
  user.applicationStatus.push(status._id);
  status.instituteId = institute._id;
  await Promise.all([status.save(), user.save()]);
};

exports.retrieveAdmissionReceievedApplication = async (req, res) => {
  try {
    const { uid, aid } = req.params;
    if (!uid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    console.log(req?.body);
    const user = await User.findById({ _id: uid });
    // if (user?.applyApplication?.includes(`${aid}`)) {
    //   res.status(200).send({
    //     message: "You have already applied for this application",
    //     status: false,
    //     denied: true,
    //   });
    // } else {
    const student = new Student({ ...req.body });
    if (req.body?.studentFatherName) {
      student.studentMiddleName = req.body?.studentFatherName;
    }
    student.valid_full_name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    const codess = universal_random_password();
    student.member_module_unique = `${codess}`;
    student.student_join_mode = "ADMISSION_PROCESS";
    const apply = await NewApplication.findById({ _id: aid });
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    })
      .select("institute admissionAdminHead student")
      .populate({
        path: "admissionAdminHead",
        select: "user",
      });
    const institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const status = new Status({});
    const notify = new StudentNotification({});
    var filtered_account = await BankAccount.findOne({
      departments: { $in: apply?.applicationDepartment },
    });
    const studentOptionalSubject = req.body?.optionalSubject
      ? req.body?.optionalSubject
      : [];
    for (var file of req.body?.fileArray) {
      if (file.name === "file") {
        student.photoId = "0";
        student.studentProfilePhoto = file.key;
      } else if (file.name === "addharFrontCard")
        student.studentAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        student.studentAadharBackCard = file.key;
      else if (file.name === "bankPassbook")
        student.studentBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        student.studentCasteCertificatePhoto = file.key;
      else {
        student.studentDocuments.push({
          documentName: file.name,
          documentKey: file.key,
          documentType: file.type,
        });
      }
    }
    if (studentOptionalSubject?.length > 0) {
      student.studentOptionalSubject?.push(...studentOptionalSubject);
    }
    user.profilePhoto = student?.studentProfilePhoto;
    admission.student.push(student?._id);
    status.content = `Your application for ${apply?.applicationName} have been filled successfully.

Below is the admission process:
1. You will get notified here after your selection or rejection from the institute. ( In case there is no notification within 3 working days, visit or contact the admission department)

2.After selection, confirm from your side and start the admission process.

3.After confirmation from your side, visit the institute with the required documents and applicable fees. (You will get Required documents and application fees information on your selection from the institute side. (Till then check our standard required documents and fee structures)

4.Payment modes available for fee payment: 
Online: UPI, Debit Card, Credit Card, Net banking & other payment apps (Phonepe, Google pay, Paytm)

5.After submission and verification of documents, you are required to pay application admission fees.

6. Pay application admission fees and your admission will be confirmed and complete.

7. For cancellation and refund, contact the admission department.

Note: Stay tuned for further updates.`;
    status.applicationId = apply._id;
    student.student_form_flow.flow = "APPLICATION";
    student.student_form_flow.did = apply._id;
    form_no_query(institute, student);
    status.document_visible = true;
    status.instituteId = institute._id;
    status.finance = institute?.financeDepart?.[0];
    status.student = student?._id;
    status.group_by = "Admission_Application_Applied";
    user.student.push(student._id);
    status.bank_account = filtered_account?._id;
    user.applyApplication.push(apply._id);
    student.user = user._id;
    user.applicationStatus.push(status._id);
    if (apply?.receieved_array?.includes(`${student?._id}`)) {
    } else {
      apply.receievedApplication.push({
        student: student._id,
        fee_remain: 0,
      });
      apply.receievedCount += 1;
      apply.receieved_array.push(student?._id);
    }
    notify.notifyContent = `Your application for ${apply?.applicationName} have been filled successfully.

Below is the admission process:
1. You will get notified here after your selection or rejection from the institute. ( In case there is no notification within 3 working days, visit or contact the admission department)

2.After selection, confirm from your side and start the admission process.

3.After confirmation from your side, visit the institute with the required documents and applicable fees. (You will get Required documents and application fees information on your selection from the institute side. (Till then check our standard required documents and fee structures)

4.Payment modes available for fee payment: 
Online: UPI, Debit Card, Credit Card, Net banking & other payment apps (Phonepe, Google pay, Paytm)

5.After submission and verification of documents, you are required to pay application admission fees.

6. Pay application admission fees and your admission will be confirmed and complete.

7. For cancellation and refund, contact the admission department.

Note: Stay tuned for further updates.`;
    notify.notifySender = admission?.admissionAdminHead?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByAdmissionPhoto = admission?._id;
    notify.notifyCategory = "Status Alert";
    notify.redirectIndex = 29;
    if (institute.userFollowersList.includes(uid)) {
    } else {
      user.userInstituteFollowing.push(institute._id);
      user.followingUICount += 1;
      institute.userFollowersList.push(uid);
      institute.followersCount += 1;
    }
    let nums = universal_random_password_student_code();
    student.qviple_student_pay_id = nums;
    await Promise.all([
      student.save(),
      user.save(),
      status.save(),
      apply.save(),
      institute.save(),
      notify.save(),
      admission.save(),
    ]);
    res.status(201).send({
      message: "Taste a bite of sweets till your application is selected",
      student: student._id,
      status: true,
    });
    let name = `${student?.studentFirstName} ${
      student?.studentMiddleName
        ? student?.studentMiddleName
        : student?.studentFatherName ?? ""
    } ${student?.studentLastName}`;
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
    await generateStudentAdmissionForm(
      student?._id,
      institute?._id,
      `${student?.studentFirstName} ${
        student?.studentMiddleName
          ? student?.studentMiddleName
          : student?.studentFatherName
          ? student?.studentFatherName
          : ""
      } ${student?.studentLastName}`,
      `${apply?.applicationName}`
    );
    // if (student?.studentEmail && student?.application_print?.length > 0) {
    //   let login = user?.userPhoneNumber ? user?.userPhoneNumber : user?.userEmail ?? ""
    //   email_sms_designation_application_apply(student?.studentEmail, name, apply?.applicationName, login, student?.application_print?.[0]?.value)
    // }
    // }
  } catch (e) {
    res.status(201).send({
      message: "Test And Send Back To Server",
      student: null,
      status: true,
      error: e,
    });
  }
};

exports.fetchAllRequestApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_request = [];
      var apply = await NewApplication.findById({ _id: aid })
        .select("receievedCount receievedApplication")
        .populate({
          path: "receievedApplication",
          populate: {
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user valid_full_name form_no",
            populate: {
              path: "user",
              select: "userPhoneNumber userEmail",
            },
          },
        });
      for (let data of apply.receievedApplication) {
        if (data.student !== null) {
          filter_request.push(data);
        }
      }
      if (filter_request?.length > 0) {
        // const requestEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message: "find difficulties with easy search ",
          request: filter_request?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          request: [],
        });
      }
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("receievedCount receievedApplication")
        .populate({
          path: "receievedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user form_no",
            populate: {
              path: "user",
              select: "userPhoneNumber userEmail",
            },
          },
        });
      var all_request_query = nested_document_limit(
        page,
        limit,
        apply?.receievedApplication?.reverse()
      );
      if (all_request_query?.length > 0) {
        // const requestEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Request arrived make sure you come up with Tea and Snack from DB 🙌",
          request: all_request_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          request: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllSelectApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_select = [];
      const apply = await NewApplication.findById({ _id: aid })
        .select("selectCount")
        .populate({
          path: "selectedApplication",
          populate: {
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber valid_full_name form_no intake_type",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          },
        });
      for (let data of apply.selectedApplication) {
        if (data.student !== null) {
          filter_select.push(data);
        }
      }
      if (filter_select?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Selection required make sure you come up with Tea and Snack from DB 🙌",
          select: filter_select?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          select: [],
        });
      }
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("selectCount")
        .populate({
          path: "selectedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber form_no intake_type",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          },
        });
      var all_select_query = nested_document_limit(
        page,
        limit,
        apply?.selectedApplication?.reverse()
      );
      if (all_select_query?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Selection required make sure you come up with Tea and Snack from DB 🙌",
          select: all_select_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          select: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllFeeCollectedApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_select = [];
      const apply = await NewApplication.findById({ _id: aid })
        .select("fee_collect_count")
        .populate({
          path: "FeeCollectionApplication",
          populate: {
            path: "student payment_flow app_card gov_card fee_struct",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            // select:
            //   "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber valid_full_name",
            // populate: {
            //   path: "fee_structure",
            //   select:
            //     "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
            //   populate: {
            //     path: "category_master",
            //     select: "category_name",
            //   },
            // },
          },
        });
      for (let data of apply.FeeCollectionApplication) {
        if (data.student !== null) {
          filter_select.push(data);
        }
      }
      if (filter_select?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Fees Collection required make sure you come up with Tea and Snack from DB 🙌",
          fees: filter_select?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          fees: [],
        });
      }
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("fee_collect_count")
        .populate({
          path: "FeeCollectionApplication",
          populate: {
            path: "student payment_flow app_card gov_card fee_struct",
            // select:
            //   "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber",
            // populate: {
            //   path: "fee_structure",
            //   select:
            //     "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
            //   populate: {
            //     path: "category_master",
            //     select: "category_name",
            //   },
            // },
          },
        });
      var all_select_query = nested_document_limit(
        page,
        limit,
        apply?.FeeCollectionApplication?.reverse()
      );
      if (all_select_query?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Fees Collection Selection required make sure you come up with Tea and Snack from DB 🙌",
          fees: all_select_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          fees: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllConfirmApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_confirm = [];
      const apply = await NewApplication.findById({ _id: aid })
        .select("confirmCount")
        .populate({
          path: "confirmedApplication",
          populate: {
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt valid_full_name institute form_no intake_type",
            populate: {
              path: "fee_structure hostel_fee_structure fee_receipt",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
              // populate: {
              //   path: "category_master",
              //   select: "category_name",
              // },
            },
          },
        });
      for (let data of apply.confirmedApplication) {
        if (data.student !== null) {
          filter_confirm.push(data);
        }
      }
      if (filter_confirm?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: filter_confirm?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    } else {
      const apply = await NewApplication.findById({ _id: aid })
        .select("confirmCount")
        .populate({
          path: "confirmedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt institute form_no intake_type",
            populate: {
              path: "fee_structure hostel_fee_structure fee_receipt",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
              // populate: {
              //   path: "category_master",
              //   select: "category_name",
              // },
            },
          },
        });
      var all_confirm_query = nested_document_limit(
        page,
        limit,
        apply?.confirmedApplication?.reverse()
      );
      if (all_confirm_query?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: all_confirm_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllConfirmApplicationPayload = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_confirm = [];
      const apply = await NewApplication.findById({ _id: aid })
        .select("confirmCount")
        .populate({
          path: "confirmedApplication",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
              studentMiddleName: { $regex: `${search}`, $options: "i" },
              studentLastName: { $regex: `${search}`, $options: "i" },
              valid_full_name: { $regex: `${search}`, $options: "i" },
              form_no: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user fee_receipt valid_full_name form_no intake_type",
            populate: {
              path: "user fee_receipt",
              select: "userPhoneNumber userEmail receipt_file",
            },
          },
        });
      for (let data of apply.confirmedApplication) {
        if (data.student !== null) {
          filter_confirm.push(data);
        }
      }
      if (filter_confirm?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: filter_confirm?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    } else {
      const apply = await NewApplication.findById({ _id: aid })
        .select("confirmCount")
        .populate({
          path: "confirmedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user fee_receipt form_no intake_type",
            populate: {
              path: "user fee_receipt",
              select: "userPhoneNumber userEmail receipt_file",
            },
          },
        });
      if (apply?.confirmedApplication?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: apply.confirmedApplication?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllReviewApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      var apply = await NewApplication.findById({ _id: aid })
        .select("review_count")
        .populate({
          path: "reviewApplication",
          match: {
            $or: [
              {
                studentFirstName: { $regex: `${search}`, $options: "i" },
              },
              {
                studentMiddleName: { $regex: `${search}`, $options: "i" },
              },
              {
                studentLastName: { $regex: `${search}`, $options: "i" },
              },
              {
                valid_full_name: { $regex: `${search}`, $options: "i" },
              },
              {
                form_no: { $regex: `${search}`, $options: "i" },
              },
            ],
          },
          select:
            "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt valid_full_name institute form_no intake_type",
          populate: {
            path: "fee_structure hostel_fee_structure fee_receipt",
            select:
              "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
            // populate: {
            //   path: "category_master",
            //   select: "category_name",
            // },
          },
        });
      if (apply?.reviewApplication?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Reviewing and class allot required make sure you come up with Tea and Snack from DB 🙌",
          review: apply?.reviewApplication,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          review: [],
        });
      }
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("review_count")
        .populate({
          path: "reviewApplication",
          select:
            "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt valid_full_name institute form_no intake_type",
          populate: {
            path: "fee_structure hostel_fee_structure fee_receipt",
            select:
              "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
            // populate: {
            //   path: "category_master",
            //   select: "category_name",
            // },
          },
        });
      var all_student = await nested_document_limit(
        page,
        limit,
        apply?.reviewApplication
      );
      if (all_student?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Reviewing OPT and class allot required make sure you come up with Tea and Snack from DB 🙌",
          review: all_student,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          review: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllReviewApplicationPayload = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      var apply = await NewApplication.findById({ _id: aid })
        .select("review_count")
        .populate({
          path: "reviewApplication",
          match: {
            $or: [
              {
                studentFirstName: { $regex: `${search}`, $options: "i" },
              },
              {
                studentMiddleName: { $regex: `${search}`, $options: "i" },
              },
              {
                studentLastName: { $regex: `${search}`, $options: "i" },
              },
              {
                valid_full_name: { $regex: `${search}`, $options: "i" },
              },
              {
                form_no: { $regex: `${search}`, $options: "i" },
              },
            ],
          },
          select:
            "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt valid_full_name institute form_no intake_type",
          populate: {
            path: "fee_structure hostel_fee_structure fee_receipt",
            select:
              "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
            // populate: {
            //   path: "category_master",
            //   select: "category_name",
            // },
          },
        });
      if (apply?.reviewApplication?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Reviewing and class allot required make sure you come up with Tea and Snack from DB 🙌",
          review: apply?.reviewApplication,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          review: [],
        });
      }
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("review_count")
        .populate({
          path: "reviewApplication",
          select:
            "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt valid_full_name institute form_no intake_type",
          populate: {
            path: "fee_structure hostel_fee_structure fee_receipt",
            select:
              "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
            // populate: {
            //   path: "category_master",
            //   select: "category_name",
            // },
          },
        });
      if (apply?.reviewApplication?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Reviewing OPT and class allot required make sure you come up with Tea and Snack from DB 🙌",
          review: apply?.reviewApplication,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          review: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllAllotApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`All-Allot-App-${aid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Allotted Application Feed from Cache 🙌",
    //     allot: is_cache.apply,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      var filter_allot = [];
      var apply = await NewApplication.findById({ _id: aid })
        .select("allotCount")
        .populate({
          path: "allottedApplication",
          populate: {
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentGRNO: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentGRNO studentParentsPhoneNumber fee_receipt valid_full_name form_no intake_type",
            populate: {
              path: "fee_structure hostel_fee_structure fee_receipt",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
              // populate: {
              //   path: "category_master",
              //   select: "category_name",
              // },
            },
          },
        });
      for (let data of apply.allottedApplication) {
        if (data.student !== null) {
          filter_allot.push(data);
        }
      }
      if (filter_allot?.length > 0) {
        res.status(200).send({
          message: "Lots of Allotted Application from DB 😥",
          allot: filter_allot?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          allot: [],
        });
      }
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("allotCount")
        .populate({
          path: "allottedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt form_no intake_type",
            populate: {
              path: "fee_structure hostel_fee_structure fee_receipt",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
              // populate: {
              //   path: "category_master",
              //   select: "category_name",
              // },
            },
          },
        });
      var all_allot_query = nested_document_limit(
        page,
        limit,
        apply?.allottedApplication?.reverse()
      );
      if (all_allot_query?.length > 0) {
        // const allotEncrypt = await encryptionPayload(apply);
        // const cached = await connect_redis_miss(
        //   `All-Allot-App-${aid}-${page}`,
        //   apply
        // );
        res.status(200).send({
          message: "Lots of Allotted Application from DB 😥",
          // allot: cached.apply,
          allot: all_allot_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          allot: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllCancelApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`All-Cancel-App-${aid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Cancelled Application Feed from Cache 🙌",
    //     cancel: is_cache.apply,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      var filter_cancel = [];
      var apply = await NewApplication.findById({ _id: aid })
        .select("cancelCount")
        .populate({
          path: "cancelApplication",
          populate: {
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentGRNO: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName studentGRNO paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user fee_receipt valid_full_name form_no intake_type",
            populate: {
              path: "user fee_receipt",
              select: "userPhoneNumber userEmail receipt_file",
            },
          },
        });
      for (let data of apply?.cancelApplication) {
        if (data.student !== null) {
          filter_cancel.push(data);
        }
      }
      if (filter_cancel?.length > 0) {
        res.status(200).send({
          message: "Lots of Cancel Application from DB 😂😂",
          cancel: filter_cancel?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          cancel: [],
        });
      }
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .select("cancelCount")
        .populate({
          path: "cancelApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user fee_receipt form_no intake_type",
            populate: {
              path: "user fee_receipt",
              select: "userPhoneNumber userEmail receipt_file",
            },
          },
        });
      var all_cancel_query = nested_document_limit(
        page,
        limit,
        apply?.cancelApplication?.reverse()
      );
      if (all_cancel_query?.length > 0) {
        // const cancelEncrypt = await encryptionPayload(apply);
        // const cached = await connect_redis_miss(
        //   `All-Cancel-App-${aid}-${page}`,
        //   apply
        // );
        res.status(200).send({
          message: "Lots of Cancel Application from DB 😂😂",
          // cancel: cached.apply,
          cancel: all_cancel_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          cancel: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionSelectedApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { fee_struct, staffId, intake_type } = req.body;
    if (!sid && !aid && !fee_struct)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        select_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    })
      .select("institute admissionAdminHead selectedApplication")
      .populate({
        path: "admissionAdminHead",
        select: "user",
      });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const structure = await FeeStructure.findById({ _id: fee_struct });
    const institute = await InstituteAdmin.findById({
      _id: `${admission_admin?.institute}`,
    });
    const finance = await Finance.findOne({
      institute: admission_admin?.institute,
    });
    const status = new Status({});
    const notify = new StudentNotification({});
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.receievedApplication.pull(app._id);
        apply.receieved_array.pull(student?._id);
      } else {
      }
    }
    apply.selectedApplication.push({
      student: student._id,
      fee_remain: structure.total_admission_fees,
      revert_request_status: status?._id,
    });
    admission_admin.selectedApplication.push({
      student: student._id,
      fee_remain: structure.total_admission_fees,
      revert_request_status: status?._id,
      application: apply?._id,
    });
    student.student_application_obj.push({
      app: apply?._id,
      staff: staffId,
      flow: "select_by",
    });
    apply.selectCount += 1;
    status.content = `You have been selected for ${apply.applicationName}. 
Your fee structure will be ${structure?.structure_name}. And required documents are 'click here for details'.   
Start your admission process by confirming below.`;
    status.applicationId = apply._id;
    status.for_docs = "Yes";
    status.studentId = student._id;
    status.group_by = "Admission_Document_Verification";
    status.student = student._id;
    status.admissionFee = structure.total_admission_fees;
    status.instituteId = admission_admin?.institute;
    status.feeStructure = structure?._id;
    student.fee_structure = structure?._id;
    status.document_visible = true;
    status.finance = finance?._id;
    user.applicationStatus.push(status._id);
    student.active_status.push(status?._id);
    status.structure_edited = "Edited";
    notify.notifyContent = `You have been selected for ${apply.applicationName}. 
Your fee structure will be ${structure?.structure_name}. And required documents are 'click here for details'. 
Start your admission process by confirming below.`;
    notify.notifySender = admission_admin?.admissionAdminHead?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByAdmissionPhoto = admission_admin?._id;
    notify.notifyCategory = "Status Alert";
    notify.redirectIndex = 29;
    student.intake_type = intake_type ?? "";
    await Promise.all([
      apply.save(),
      student.save(),
      user.save(),
      status.save(),
      notify.save(),
      admission_admin.save(),
    ]);
    res.status(200).send({
      message: `congrats ${student.studentFirstName} `,
      select_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderCollectDocsConfirmByStudentQuery = async (req, res) => {
  try {
    const { sid, aid, statusId } = req.params;
    const { flow } = req.query;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });
    var user = await User.findById({ _id: `${student.user}` });
    var apply = await NewApplication.findById({ _id: aid });
    var admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    })
      .select("institute admissionAdminHead")
      .populate({
        path: "admissionAdminHead",
        select: "user",
      });
    var prev_status = await Status.findById({ _id: statusId });
    const institute = await InstituteAdmin.findById({
      _id: `${admission_admin?.institute}`,
    });
    const finance = await Finance.findOne({
      institute: admission_admin?.institute,
    });
    const status = new Status({});
    const notify = new StudentNotification({});
    if (flow === "CONFIRM_QUERY") {
      if (apply?.selectedApplication?.length > 0) {
        apply?.selectedApplication?.forEach((ele) => {
          if (`${ele.student}` === `${student._id}`) {
            ele.payment_status = "pending";
          }
        });
        await apply.save();
      }
      status.content = `Your admission process has been started. 

Visit ${institute?.insName} with required documents (Click to view Documents) and applicable fees Rs.${student?.fee_structure?.applicable_fees} (Click to view in detail).
      
Payment modes available:`;
      status.applicationId = apply._id;
      // status.for_selection = "Yes";
      status.admission_process = "Yes";
      status.studentId = student._id;
      status.student = student._id;
      status.admissionFee = student?.fee_structure.total_admission_fees;
      status.instituteId = admission_admin?.institute;
      status.feeStructure = student?.fee_structure?._id;
      student.fee_structure = student?.fee_structure?._id;
      status.document_visible = true;
      status.finance = finance?._id;
      user.applicationStatus.push(status._id);
      student.active_status.push(status?._id);
      notify.notifyContent = `Your admission process has been started. 

Visit ${institute?.insName} with required documents (Click to view Documents) and applicable fees Rs.${student?.fee_structure?.applicable_fees} (Click to view in detail).
          
Payment modes available:`;
      notify.notifySender = admission_admin?.admissionAdminHead?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission_admin?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 30;
      prev_status.docs_status = "Confirmed";
      await Promise.all([
        apply.save(),
        student.save(),
        user.save(),
        status.save(),
        notify.save(),
        prev_status.save(),
      ]);
      res.status(200).send({
        message: "Thanks for Confirmation for Docs Verification.",
        access: true,
      });
    } else {
      prev_status.docs_status = "Cancelled";
      await prev_status.save();
      res.status(200).send({
        message:
          "Docs Verification Pending Contact with Admission Admin for further query",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionCancelApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { reason, staffId } = req?.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    })
      .populate({
        path: "admissionAdminHead",
        select: "user",
      })
      .populate({
        path: "institute",
        select: "insName",
      });
    const student = await Student.findById({ _id: sid });
    var user = await User.findById({ _id: `${student?.user}` });
    const status = new Status({});
    const notify = new StudentNotification({});
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.receievedApplication.pull(app._id);
        user.applyApplication.pull(apply?._id);
        apply.receieved_array.pull(student._id);
      } else {
      }
    }
    if (apply.receievedCount > 0) {
      apply.receievedCount -= 1;
    }
    status.content = `You have been rejected for ${apply.applicationName}. Best of luck for next time `;
    status.applicationId = apply._id;
    status.studentId = student._id;
    status.student = student._id;
    user.applicationStatus.push(status._id);
    if (user?.applyApplication?.includes(`${apply?._id}`)) {
      user.applyApplication.pull(apply?._id);
    }
    status.instituteId = admission_admin?.institute;
    notify.notifyContent = `You have been rejected for ${apply.applicationName}. Best of luck for next time `;
    notify.notifySender = admission_admin?.admissionAdminHead?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByAdmissionPhoto = admission_admin?._id;
    notify.notifyCategory = "Status Alert";
    notify.redirectIndex = 29;
    student.student_application_obj.push({
      app: apply?._id,
      staff: staffId,
      flow: "reject_by",
    });
    await Promise.all([
      apply.save(),
      student.save(),
      user.save(),
      status.save(),
      notify.save(),
    ]);
    res.status(200).send({
      message: `Best of luck for next time 😥`,
      cancel_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
    let name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    if (student?.studentEmail) {
      email_sms_designation_application(
        student?.studentEmail,
        name,
        apply?.applicationName,
        reason,
        admission_admin?.institute?.insName
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionPayMode = async (req, res) => {
  try {
    const { sid, aid, statusId } = req.params;
    const { fee_payment_mode } = req.body;
    if (!sid && !aid && !statusId && !fee_payment_mode)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley 😒",
        access: false,
      });
    const student = await Student.findById({ _id: sid });
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const user = await User.findById({ _id: `${student.user}` });
    const status = await Status.findById({ _id: statusId });
    const apply = await NewApplication.findById({ _id: aid }).select(
      "selectedApplication admissionAdmin"
    );
    const notify = new StudentNotification({});
    const admin_ins = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    });
    if (apply?.selectedApplication?.length > 0) {
      apply?.selectedApplication?.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.payment_status =
            fee_payment_mode === "By Cash" ? "offline" : "Receipt Requested";
        }
      });
      await apply.save();
    }
    if (fee_payment_mode === "By Cash") {
      const aStatus = new Status({});
      status.payMode = "offline";
      status.sub_payment_mode = "By Cash";
      status.isPaid = "Not Paid";
      status.for_selection = "No";
      aStatus.content = `Your admission is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees. or contact institute if neccessory`;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      notify.notifyContent = `Your admission is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees. or contact institute if neccessory`;
      notify.notifySender = admin_ins?.admissionAdminHead?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admin_ins?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      await Promise.all([aStatus.save(), notify.save()]);
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
    } else {
      status.sub_payment_mode = fee_payment_mode;
      status.payMode = "online";
      var receipt = new FeeReceipt({ ...req.body });
      receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
      receipt.student = student?._id;
      receipt.application = apply?._id;
      receipt.receipt_generated_from = "BY_ADMISSION";
      receipt.app_status = status?._id;
      status.receipt = receipt?._id;
      receipt.finance = institute?.financeDepart[0];
      if (admin_ins?.request_array?.includes(`${receipt?._id}`)) {
      } else {
        admin_ins.request_array.push(receipt?._id);
        admin_ins.fee_receipt_request.push({
          receipt: receipt?._id,
          status: "Requested",
        });
        admin_ins.fee_receipt_request_count += 1;
        status.receipt_status = "Requested";
      }
      institute.invoice_count += 1;
      receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${institute.invoice_count}`;
      await Promise.all([receipt.save(), institute.save()]);
    }
    await Promise.all([status.save(), user.save(), admin_ins.save()]);
    res.status(200).send({
      message: "Lets do some excercise visit institute",
      status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.payOfflineAdmissionFee = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { receipt_status } = req.query;
    const { amount, mode, card_id, rid, type, pay_remain, nsid, staffId } =
      req.body;
    if (!sid && !aid && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        confirm_status: false,
      });
    var price = parseInt(amount);
    var apply = await NewApplication.findById({ _id: aid });
    var student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });
    var admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    if (student?.fee_receipt?.length > 0) {
      for (let ele of apply?.FeeCollectionApplication) {
        if (`${ele?.student}` === `${student?._id}`) {
          apply?.FeeCollectionApplication.pull(ele?._id);
        }
      }
      for (let ele of admission?.FeeCollectionApplication) {
        if (`${ele?.student}` === `${student?._id}`) {
          admission?.FeeCollectionApplication.pull(ele?._id);
        }
      }
      let exist = apply?.confirmedApplication?.filter((val) => {
        if (`${val?.student}` === `${student?._id}`) return val;
      });
      if (exist?.length > 0) {
      } else {
        apply.confirmedApplication.push({
          student: student._id,
          payment_status: mode,
          install_type: "First Installment Paid",
          fee_remain: 0,
        });
        admission.confirmedApplication_query.push({
          student: student._id,
          payment_status: mode,
          install_type: "First Installment Paid",
          fee_remain: 0,
          application: apply?._id,
        });
      }
      // for (let ele of apply?.confirmedApplication) {
      //   if (`${ele?.student}` === `${student?._id}`) {

      //   }
      //   else {
      //     if (`${ele?.student}` === `${student?._id}`) {
      //       // apply.confirmedApplication.push({
      //       //   student: student._id,
      //       //   payment_status: mode,
      //       //   install_type: "First Installment Paid",
      //       //   fee_remain: 0,
      //       // });
      //     }
      //   }
      // }
      await Promise.all([apply.save(), admission.save()]);
      res.status(200).send({
        message: "Already Fee Collected ",
        confirm_status: false,
      });
    } else {
      var institute = await InstituteAdmin.findById({
        _id: `${admission.institute}`,
      });
      var finance = await Finance.findById({
        _id: `${institute.financeDepart[0]}`,
      });
      var all_status = await Status.find({
        $and: [
          { applicationId: apply?._id },
          { student: student?._id },
          { payment_status: "Not Paid" },
        ],
      });
      var new_remainFee = await RemainingList.findById({ _id: rid })
        .populate({
          path: "applicable_card",
        })
        .populate({
          path: "government_card",
        });
      const user = await User.findById({ _id: `${student.user}` });
      const status = new Status({});
      const order = new OrderPayment({});
      const notify = new StudentNotification({});
      const new_receipt = new FeeReceipt({ ...req.body });
      new_receipt.student = student?._id;
      new_receipt.fee_structure = new_remainFee?.fee_structure;
      new_receipt.fee_transaction_date = new Date(
        `${req.body.transaction_date}`
      );
      new_receipt.application = apply?._id;
      new_receipt.receipt_generated_from = "BY_ADMISSION";
      new_receipt.finance = finance?._id;
      new_receipt.receipt_status = receipt_status
        ? receipt_status
        : "Already Generated";
      order.payment_module_type = "Admission Fees";
      order.payment_to_end_user_id = institute?._id;
      order.payment_by_end_user_id = user._id;
      order.payment_module_id = apply._id;
      order.payment_amount = price;
      order.payment_status = "Captured";
      order.payment_flag_to = "Credit";
      order.payment_flag_by = "Debit";
      order.payment_mode = mode;
      order.payment_admission = apply._id;
      order.payment_from = student._id;
      order.payment_student = student?._id;
      order.payment_student_name = student?.valid_full_name;
      order.payment_student_gr = student?.studentGRNO;
      order.fee_receipt = new_receipt?._id;
      fee_receipt_count_query(institute, new_receipt, order);
      // institute.invoice_count += 1;
      // new_receipt.invoice_count = `${
      //   new Date().getMonth() + 1
      // }${new Date().getFullYear()}${institute.invoice_count}`;
      // order.payment_invoice_number = new_receipt?.invoice_count;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "fee_collect_by",
      });
      if (`${new_remainFee?.applicable_card?._id}` === `${card_id}`) {
        var nest_card = await NestedCard.findById({ _id: `${card_id}` });
        new_remainFee.active_payment_type = `${type}`;
        nest_card.active_payment_type = `${type}`;
        new_remainFee.paid_fee += price;
        nest_card.paid_fee += price;
        if (new_remainFee?.remaining_fee >= price) {
          new_remainFee.remaining_fee -= price;
        }
        if (nest_card?.remaining_fee >= price) {
          nest_card.remaining_fee -= price;
        } else {
          nest_card.remaining_fee = 0;
        }
        if (student.admissionRemainFeeCount >= price) {
          student.admissionRemainFeeCount -= price;
        }
        if (apply.remainingFee >= price) {
          apply.remainingFee -= price;
        }
        if (admission.remainingFeeCount >= price) {
          admission.remainingFeeCount -= price;
        }
        var valid_one_time_fees =
          student?.fee_structure?.applicable_fees - price == 0 ? true : false;
        if (valid_one_time_fees) {
          admission.remainingFee.pull(student._id);
        } else {
        }
        if (pay_remain) {
          await all_installment_paid(
            new_remainFee,
            student?.fee_structure,
            mode,
            price,
            admission,
            student,
            new_receipt,
            apply,
            institute,
            nest_card,
            type
          );
        } else {
          await render_installment(
            type,
            student,
            mode,
            price,
            admission,
            student?.fee_structure,
            new_remainFee,
            new_receipt,
            apply,
            institute,
            nest_card
          );
        }
        await nest_card.save();
        if (req.body?.fee_payment_mode === "Government/Scholarship") {
          // New Logic
        } else {
          if (
            new_remainFee?.is_splited &&
            new_remainFee?.is_splited === "Yes"
          ) {
            console.log("Enter Split");
            await set_fee_head_query_redesign_split(
              student,
              new_receipt?.fee_payment_amount,
              apply?._id,
              new_receipt,
              nest_card,
              nsid
            );
            console.log("Exit Split");
          } else {
            console.log("Enter");
            await set_fee_head_query_redesign(
              student,
              new_receipt?.fee_payment_amount,
              apply?._id,
              new_receipt
            );
            // await set_fee_head_query(student, price, apply, new_receipt);
            console.log("Exit");
          }
        }
        apply.confirmedApplication.push({
          student: student._id,
          payment_status: mode,
          install_type: "First Installment Paid",
          fee_remain: nest_card.remaining_fee ?? 0,
        });
        admission.confirmedApplication_query.push({
          student: student._id,
          payment_status: mode,
          install_type: "First Installment Paid",
          fee_remain: nest_card.remaining_fee ?? 0,
          application: apply?._id,
        });
      }
      new_remainFee.fee_receipts.push(new_receipt?._id);
      if (mode === "Offline") {
        admission.offlineFee += price;
        apply.collectedFeeCount += price;
        apply.offlineFee += price;
        admission.collected_fee += price;
        finance.financeAdmissionBalance += price;
        finance.financeTotalBalance += price;
        finance.financeSubmitBalance += price;
      } else if (mode === "Online") {
        admission.onlineFee += price;
        apply.collectedFeeCount += price;
        apply.onlineFee += price;
        finance.financeAdmissionBalance += price;
        finance.financeTotalBalance += price;
        finance.financeBankBalance += price;
      } else {
      }
      if (new_remainFee?.remaining_fee > 0) {
      } else {
        new_remainFee.status = "Paid";
      }
      await lookup_applicable_grant(
        req.body?.fee_payment_mode,
        price,
        new_remainFee,
        new_receipt
      );
      apply.confirmCount += 1;
      for (let app of apply.FeeCollectionApplication) {
        if (`${app.student}` === `${student._id}`) {
          if (app?.status_id) {
            const valid_status = await Status.findById({
              _id: `${app?.status_id}`,
            });
            valid_status.isPaid = "Paid";
            await valid_status.save();
          }
          apply.FeeCollectionApplication.pull(app?._id);
        } else {
        }
      }
      for (let app of admission?.FeeCollectionApplication) {
        if (`${app.student}` === `${student._id}`) {
          if (app?.status_id) {
            const valid_status = await Status.findById({
              _id: `${app?.status_id}`,
            });
            valid_status.isPaid = "Paid";
            await valid_status.save();
          }
          admission.FeeCollectionApplication.pull(app?._id);
        } else {
        }
      }
      for (var val of all_status) {
        val.payment_status = "Paid";
        val.fee_receipt = new_receipt?._id;
        await val.save();
      }
      student.admissionPaidFeeCount += price;
      student.paidFeeList.push({
        paidAmount: price,
        appId: apply._id,
      });
      status.content = `Your seat has been confirmed, You will be alloted your class shortly, Stay Updated!`;
      status.group_by = "Admission_Confirmation";
      status.applicationId = apply._id;
      user.applicationStatus.push(status._id);
      status.instituteId = institute._id;
      status.fee_receipt = new_receipt?._id;
      notify.notifyContent = `Your seat has been confirmed, You will be alloted your class shortly, Stay Updated!`;
      notify.notifySender = admission?.admissionAdminHead?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      notify.fee_receipt = new_receipt?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      if (
        `${new_receipt?.fee_payment_mode}` === "Demand Draft" ||
        `${new_receipt?.fee_payment_mode}` === "Cheque"
      ) {
        status.receipt_status = "Requested";
        status.receipt = new_receipt?._id;
        if (admission?.request_array?.includes(`${new_receipt?._id}`)) {
        } else {
          admission.request_array.push(new_receipt?._id);
          admission.fee_receipt_request.push({
            receipt: new_receipt?._id,
            demand_cheque_status: "Requested",
          });
          admission.fee_receipt_request_count += 1;
        }
      }
      await Promise.all([
        admission.save(),
        apply.save(),
        student.save(),
        finance.save(),
        user.save(),
        order.save(),
        institute.save(),
        // s_admin.save(),
        new_remainFee.save(),
        new_receipt.save(),
        status.save(),
        notify.save(),
      ]);
      res.status(200).send({
        message: "Look like a party mood",
        confirm_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        status.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      for (let ele of nest_card?.remaining_array) {
        if (ele?.remainAmount <= 0) {
          nest_card?.remaining_array?.pull(ele?._id);
        }
      }
      await nest_card.save();
      // // console.log(test_data)
      // if (new_receipt?.receipt_file) {
      //   res.status(200).send({
      //     message: "Look like a party mood",
      //     confirm_status: true,
      //     reciept_file: new_receipt?.receipt_file
      //   });
      // }
      // else {
      //   res.status(200).send({
      //     message: "Look like a light mood",
      //     confirm_status: false,
      //     reciept_file: test_data ?? null
      //   });
      // }
    }
  } catch (e) {
    console.log(e);
  }
};
// Same Params in body + remain params exist
exports.cancelAdmissionApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { amount, mode, remainAmount, struct, staffId } = req.body;
    if (!sid && !aid && !amount && !remainAmount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        refund_status: false,
      });
    var price = parseInt(amount);
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const apply = await NewApplication.findById({ _id: aid }).populate({
      path: "applicationDepartment",
      select: "dName",
    });
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const aStatus = new Status({});
    const notify = new StudentNotification({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.refund_status = "Refunded";
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.receipt_generated_from = "BY_ADMISSION";
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date();
    if (
      price &&
      mode === "Offline" &&
      price > finance.financeTotalBalance &&
      price > admission.offlineFee &&
      price > finance.financeSubmitBalance
    ) {
      res.status(200).send({
        message:
          "insufficient Cash Balance in Finance Department to make refund",
      });
    } else if (
      price &&
      mode === "Online" &&
      price > finance.financeTotalBalance &&
      price > admission.onlineFee &&
      price > finance.financeBankBalance
    ) {
      res.status(200).send({
        message:
          "insufficient Bank Balance in Finance Department to make refund",
      });
    } else {
      const order = new OrderPayment({});
      apply.cancelCount += 1;
      if (apply.remainingFee >= parseInt(remainAmount)) {
        apply.remainingFee -= parseInt(remainAmount);
      }
      if (mode === "Offline") {
        if (finance.financeAdmissionBalance >= price) {
          finance.financeAdmissionBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeSubmitBalance >= price) {
          finance.financeSubmitBalance -= price;
        }
        if (admission.offlineFee >= price) {
          admission.offlineFee -= price;
        }
        if (admission.collected_fee >= price) {
          admission.collected_fee -= price;
        }
        if (apply.offlineFee >= price) {
          apply.offlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
      } else if (mode === "Online") {
        if (admission.onlineFee >= price) {
          admission.onlineFee -= price;
        }
        if (apply.onlineFee >= price) {
          apply.onlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
        if (finance.financeAdmissionBalance >= price) {
          finance.financeAdmissionBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeBankBalance >= price) {
          finance.financeBankBalance -= price;
        }
      }
      if (admission.remainingFeeCount >= parseInt(remainAmount)) {
        admission.remainingFeeCount -= parseInt(remainAmount);
      }
      aStatus.content = `your admission has been cancelled successfully with refund of Rs. ${price}`;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      notify.notifyContent = `your admission has been cancelled successfully with refund of Rs. ${price}`;
      notify.notifySender = admission?.admissionAdminHead?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      student.admissionRemainFeeCount = 0;
      student.refundAdmission.push({
        refund_status: "Refund",
        refund_reason: "Cancellation of Admission",
        refund_amount: price,
        refund_from: apply?._id,
      });
      const all_remain_fee_list = await RemainingList.findOne({
        $and: [{ fee_structure: struct }, { student: student?._id }],
      });
      new_receipt.fee_structure = all_remain_fee_list?.fee_structure;
      const nest_app_card = await NestedCard.findById({
        _id: `${all_remain_fee_list?.applicable_card}`,
      });
      const filter_student_install = nest_app_card?.remaining_array?.filter(
        (stu) => {
          if (`${stu.appId}` === `${apply._id}` && stu.status === "Not Paid")
            return stu;
        }
      );
      for (var can = 0; can < filter_student_install?.length; can++) {
        nest_app_card?.remaining_array.pull(filter_student_install[can]);
      }
      all_remain_fee_list.fee_receipts.push(new_receipt?._id);
      all_remain_fee_list.refund_fee += price;
      if (all_remain_fee_list.paid_fee >= price) {
        all_remain_fee_list.paid_fee -= price;
      }
      if (nest_app_card.paid_fee >= price) {
        nest_app_card.paid_fee -= price;
      }
      all_remain_fee_list.remaining_fee = 0;
      nest_app_card.remaining_fee = 0;
      for (var ele of student?.active_fee_heads) {
        if (`${ele?.appId}` === `${apply?._id}`) {
          ele.paid_fee = 0;
          ele.remain_fee = 0;
        }
      }
      nest_app_card.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "Cancellation & Refunded",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
        refund_status: "Refunded",
      });
      all_remain_fee_list.status = "Cancel";
      order.payment_module_type = "Expense";
      order.payment_to_end_user_id = institute._id;
      order.payment_by_end_user_id = user._id;
      order.payment_module_id = apply._id;
      order.payment_amount = price;
      order.payment_status = "Captured";
      order.payment_flag_to = "Debit";
      order.payment_flag_by = "Credit";
      order.payment_mode = mode;
      order.payment_admission = apply._id;
      order.payment_from = student._id;
      order.payment_student = student?._id;
      order.payment_student_name = student?.valid_full_name;
      order.payment_student_gr = student?.studentGRNO;
      fee_receipt_count_query(institute, new_receipt, order);
      order.fee_receipt = new_receipt?._id;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "cancel_by",
      });
      await Promise.all([
        apply.save(),
        student.save(),
        finance.save(),
        admission.save(),
        aStatus.save(),
        user.save(),
        order.save(),
        institute.save(),
        s_admin.save(),
        all_remain_fee_list.save(),
        new_receipt.save(),
        notify.save(),
        nest_app_card.save(),
      ]);
      res.status(200).send({
        message: "Refund & Cancellation of Admission",
        refund_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      if (apply.reviewApplication?.length > 0) {
        if (apply?.reviewApplication?.includes(`${student?._id}`)) {
          apply.reviewApplication?.pull(student?._id);
        }
        // for (var val of apply.reviewApplication) {
        //   if (`${val?.student}` === `${student?._id}`) {
        //     apply.reviewApplication.pull(val?._id);
        //   }
        // }
        apply.cancelApplication.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
          from: "Cancel_Tab",
        });
        admission.cancel_admission.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
          from: "Cancel_Tab",
        });
        admission.cancel_admission_count += price;
        await Promise.all([apply.save(), admission.save()]);
      }
      if (admission?.remainingFee?.length > 0) {
        if (admission.remainingFee?.includes(`${student._id}`)) {
          admission.remainingFee.pull(student._id);
        }
        await admission.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionApplicationBatch = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`All-Batch-App-${aid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Application Batches Feed from Cache 🙌",
    //     batch: is_cache.batch,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({ _id: aid });
    const depart = await Department.findById({
      _id: `${apply.applicationDepartment}`,
    });
    var batch = await Batch.find({
      _id: { $in: depart?.batches },
    })
      .sort("createdAt")
      .limit(limit)
      .skip(skip)
      .select("batchName batchStatus createdAt");
    if (batch?.length > 0) {
      // const batchEncrypt = await encryptionPayload(batch);
      // const cached = await connect_redis_miss(
      //   `All-Batch-App-${aid}-${page}`,
      //   batch
      // );
      res.status(200).send({
        message: "Front & Back Benchers at one place from DB 🙌",
        // batch: cached.batch,
        batch: batch,
      });
    } else {
      res.status(200).send({ message: "Renovation at Batches", batch: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionApplicationClass = async (req, res) => {
  try {
    const { aid, bid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`All-Classes-App-${aid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Application Classes of One Batch Feed from Cache 🙌",
    //     classes: is_cache.classes,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({ _id: aid });
    const batch = await Batch.findById({ _id: bid });
    const { search } = req.query;
    if (search) {
      var classes = await Class.find({
        $and: [
          { _id: { $in: batch?.classroom } },
          { classStatus: "UnCompleted" },
        ],
        $or: [
          { className: { $regex: search, $options: "i" } },
          {
            classTitle: { $regex: search, $options: "i" },
          },
        ],
      }).select("className classTitle boyCount girlCount photoId photo");
    } else {
      var classes = await Class.find({
        $and: [
          { _id: { $in: batch?.classroom } },
          { classStatus: "UnCompleted" },
        ],
      })
        .sort("-strength")
        .limit(limit)
        .skip(skip)
        .select("className classTitle boyCount girlCount photoId photo");
    }
    if (classes?.length > 0) {
      // const classesEncrypt = await encryptionPayload(classes);
      // const cached = await connect_redis_miss(
      //   `All-Classes-App-${aid}-${page}`,
      //   classes
      // );
      res.status(200).send({
        message: "Front & Back Benchers at one place from DB 🙌",
        // classes: cached.classes,
        classes: classes,
      });
    } else {
      res.status(200).send({ message: "Renovation at classes", classes: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveClassAllotQuery = async (req, res) => {
  try {
    const { aid, cid } = req.params;
    const { staffId } = req?.body;
    if (!aid && !cid && !req.body.dataList)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        allot_status: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    }).select("institute");
    var institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    var depart = await Department.findById({
      _id: `${apply.applicationDepartment}`,
    });
    var batch = await Batch.findById({ _id: `${apply.applicationBatch}` });
    var classes = await Class.findById({ _id: cid });
    var array = req.body.dataList;
    if (array?.length > 0) {
      for (var sid of array) {
        if (apply?.allot_array?.includes(`${sid}`)) {
          apply.reviewApplication.pull(sid);
          if (apply?.review_count > 0) {
            apply.review_count -= 1;
          }
          await apply.save();
        } else {
          const student = await Student.findById({ _id: sid });
          const user = await User.findById({ _id: `${student.user}` });
          const all_subjects = await Subject.find({
            $and: [
              { class: classes?._id },
              { subjectMasterName: { $in: student?.student_optional_subject } },
            ],
          });
          const notify = new Notification({});
          const aStatus = new Status({});
          apply.reviewApplication.pull(student._id);
          apply.allot_array.push(student?._id);
          apply.allottedApplication.push({
            student: student._id,
            payment_status: "offline",
            alloted_class: `${classes.className} - ${classes.classTitle}`,
            alloted_status: "Alloted",
            fee_remain: student.admissionRemainFeeCount,
            paid_status:
              student.admissionRemainFeeCount == 0 ? "Paid" : "Not Paid",
          });
          student.student_application_obj.push({
            app: apply?._id,
            staff: staffId,
            flow: "allot_by",
          });
          apply.allotCount += 1;
          // student.confirmApplication.pull(apply._id)
          student.studentStatus = "Approved";
          institute.ApproveStudent.push(student._id);
          student.institute = institute._id;
          admins.studentArray.push(student._id);
          admins.studentCount += 1;
          institute.studentCount += 1;
          classes.strength += 1;
          classes.ApproveStudent.push(student._id);
          classes.studentCount += 1;
          if (apply?.gr_initials) {
            student.studentGRNO = `${
              institute?.gr_initials ? institute?.gr_initials : ""
            }${depart?.gr_initials ?? ""}${apply?.gr_initials ?? ""}${
              apply?.allotCount
            }`;
          } else {
            student.studentGRNO = `${
              institute?.gr_initials ? institute?.gr_initials : ""
            }${depart?.gr_initials ?? ""}${apply?.gr_initials ?? ""}${
              institute.ApproveStudent.length
            }`;
          }
          student.studentROLLNO = classes.ApproveStudent.length;
          student.studentClass = classes._id;
          student.studentAdmissionDate = new Date().toISOString();
          depart.ApproveStudent.push(student._id);
          depart.studentCount += 1;
          student.department = depart._id;
          batch.ApproveStudent.push(student._id);
          student.batches = batch._id;
          notify.notifyContent = `${student.studentFirstName}${
            student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
          } ${student.studentLastName} joined as a Student of Class ${
            classes.className
          } of ${batch.batchName}`;
          notify.notifySender = classes._id;
          notify.notifyReceiever = user._id;
          institute.iNotify.push(notify._id);
          notify.institute = institute._id;
          user.uNotify.push(notify._id);
          notify.user = user._id;
          notify.notifyByStudentPhoto = student._id;
          notify.notifyCategory = "Approve Student";
          aStatus.content = `Welcome to ${depart.dName} ${classes.classTitle} Enjoy your Learning.`;
          aStatus.group_by = "Admission_Class_Allotment";
          aStatus.classes = classes?._id;
          aStatus.applicationId = apply._id;
          user.applicationStatus.push(aStatus._id);
          aStatus.instituteId = institute._id;
          if (all_subjects?.length > 0) {
            student.student_optional_subject_access = "Yes";
            for (let ele of all_subjects) {
              ele.optionalStudent.push(student?._id);
              await ele.save();
            }
          }
          await Promise.all([
            apply.save(),
            student.save(),
            user.save(),
            aStatus.save(),
            admins.save(),
            institute.save(),
            classes.save(),
            depart.save(),
            batch.save(),
            notify.save(),
          ]);
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
          // invokeMemberTabNotification(
          //   "Admission Status",
          //   aStatus.content,
          //   "Application Status",
          //   user._id,
          //   user.deviceToken
          // );
        }
      }
      res.status(200).send({
        message: `Distribute sweets to all family members`,
        allot_status: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.completeAdmissionApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        complete_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    // if (
    //   apply?.selectedApplication?.length > 0 ||
    //   apply?.confirmedApplication?.length > 0
    // ) {
    //   res.status(200).send({
    //     message:
    //       "Application not to be completed student is in Select  || Confirm ",
    //     complete_status: false,
    //   });
    // } else {
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    const admission_ins = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    apply.applicationStatus = "Completed";
    if (admission_ins?.admissionCount > 0) {
      admission_ins.admissionCount -= 1;
    }
    if (admission?.newAppCount > 0) {
      admission.newAppCount -= 1;
    }
    admission.completedCount += 1;
    await Promise.all([apply.save(), admission.save(), admission_ins.save()]);
    res.status(200).send({
      message: "Enjoy your work load is empty go for party",
      complete_status: true,
    });
    // }
  } catch (e) {
    console.log(e);
  }
};

exports.inCompleteAdmissionApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        complete_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    const admission_ins = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    apply.applicationStatus = "Ongoing";
    admission_ins.admissionCount += 1;
    admission.newAppCount += 1;
    if (admission?.completedCount > 0) {
      admission.completedCount -= 1;
    }
    await Promise.all([apply.save(), admission.save(), admission_ins.save()]);
    res.status(200).send({
      message: "Enjoy your work load.",
      complete_status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionRemainingArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`All-Remain-App-${aid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Remaining Array Feed from Cache 🙌",
    //     remain: is_cache.student,
    //     remainCount: is_cache.remainCount,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search, flow } = req.query;
    const {
      depart_arr,
      batch_arr,
      master_arr,
      gender,
      cast_category,
      filter_by,
    } = req.body;
    const admin_ins = await Admission.findById({ _id: aid }).select(
      "remainingFee active_tab_index pending_fee_custom_filter"
    );
    if (flow === "All_Pending_Fees_Query") {
      if (search) {
        // var depart = await Department.findOne({
        //   $and: [{ institute: admin_ins?.institute }],
        //   $or: [
        //     {
        //       dName: { $regex: search, $options: "i" },
        //     },
        //   ],
        // });
        // var batch = await Batch.findOne({
        //   $and: [{ institute: admin_ins?.institute }],
        //   $or: [{ batchName: { $regex: search, $options: "i" }}]
        // });
        var student = await Student.find({
          $and: [{ _id: { $in: admin_ins?.remainingFee } }],
          $or: [
            { studentFirstName: { $regex: search, $options: "i" } },
            { studentMiddleName: { $regex: search, $options: "i" } },
            { studentLastName: { $regex: search, $options: "i" } },
            { studentGRNO: { $regex: search, $options: "i" } },
            { studentCast: { $regex: search, $options: "i" } },
            { studentCastCategory: { $regex: search, $options: "i" } },
            { studentGender: { $regex: search, $options: "i" } },
          ],
        })
          .sort("-admissionRemainFeeCount")
          .select(
            "studentFirstName studentMiddleName batches studentGender studentCast studentCastCategory studentLastName photoId studentGRNO studentProfilePhoto admissionRemainFeeCount"
          )
          .populate({
            path: "department",
            select: "dName",
          })
          .populate({
            path: "studentClass",
            select: "masterClassName",
          });
        // if (depart) {
        //   student = student?.filter((val) => {
        //     if (`${val?.department?._id}` === `${depart?._id}`) return val;
        //   });
        // }
        // if (batch) {
        //   student = student?.filter((val) => {
        //     if (`${val?.batches}` === `${batch?._id}`) return val;
        //   });
        // }
        // if (student?.length > 0) {
        var remain_fee = student?.filter((ref) => {
          if (ref?.admissionRemainFeeCount > 0) return ref;
        });
        res.status(200).send({
          message: "Its a party time from DB 🙌",
          remain: remain_fee,
          remainCount: remain_fee?.length,
        });
        // }
      } else {
        var student = await Student.find({
          _id: { $in: admin_ins?.remainingFee },
        })
          .sort("-admissionRemainFeeCount")
          // .limit(limit)
          // .skip(skip)
          .select(
            "studentFirstName studentMiddleName studentLastName batches photoId studentGRNO studentProfilePhoto admissionRemainFeeCount"
          )
          .populate({
            path: "department",
            select: "dName",
          })
          .populate({
            path: "studentClass",
            select: "masterClassName",
          });
        if (depart_arr?.length > 0) {
          student = student?.filter((ref) => {
            if (
              depart_arr?.includes(`${ref?.department?._id}`) ||
              admin_ins.pending_fee_custom_filter.department?.includes(
                `${ref?.department?._id}`
              )
            )
              return ref;
          });
        }
        if (batch_arr?.length > 0) {
          student = student?.filter((ref) => {
            if (
              batch_arr?.includes(`${ref?.batches}`) ||
              admin_ins.pending_fee_custom_filter.batch?.includes(
                `${ref?.batches}`
              )
            )
              return ref;
          });
        }
        if (master_arr?.length > 0) {
          student = student?.filter((ref) => {
            if (
              master_arr?.includes(`${ref?.studentClass?.masterClassName}`) ||
              admin_ins.pending_fee_custom_filter.master?.includes(
                `${ref?.studentClass?.masterClassName}`
              )
            )
              return ref;
          });
        }
        if (gender) {
          student = student?.filter((ref) => {
            if (
              `${ref?.studentGender}` === `${gender}` ||
              `${admin_ins.pending_fee_custom_filter.gender}` === `${gender}`
            )
              return ref;
          });
        }
        if (cast_category) {
          student = student?.filter((ref) => {
            if (
              `${ref?.studentCastCategory}` === `${cast_category}` ||
              `${admin_ins.pending_fee_custom_filter.cast_category}` ===
                `${cast_category}`
            )
              return ref;
          });
        }
        admin_ins.pending_fee_custom_filter.cast_category = cast_category
          ? cast_category
          : admin_ins.pending_fee_custom_filter.cast_category;
        admin_ins.pending_fee_custom_filter.gender = gender
          ? gender
          : admin_ins.pending_fee_custom_filter.gender;
        if (master_arr?.length > 0) {
          for (var val of master_arr) {
            if (
              admin_ins.pending_fee_custom_filter.master?.includes(`${val}`)
            ) {
            } else {
              admin_ins.pending_fee_custom_filter.master.push(val);
            }
          }
        }
        if (batch_arr?.length > 0) {
          for (var val of batch_arr) {
            if (admin_ins.pending_fee_custom_filter.batch?.includes(`${val}`)) {
            } else {
              admin_ins.pending_fee_custom_filter.batch.push(val);
            }
          }
        }
        if (depart_arr?.length > 0) {
          for (var val of depart_arr) {
            if (
              admin_ins.pending_fee_custom_filter.department?.includes(`${val}`)
            ) {
            } else {
              admin_ins.pending_fee_custom_filter.department.push(val);
            }
          }
        }
        if (`${filter_by}` === "Clear_All") {
          admin_ins.pending_fee_custom_filter.cast_category = null;
          admin_ins.pending_fee_custom_filter.gender = null;
          admin_ins.pending_fee_custom_filter.master = [];
          admin_ins.pending_fee_custom_filter.batch = [];
          admin_ins.pending_fee_custom_filter.department = [];
        }
      }
      admin_ins.active_tab_index = "Pending_Fees_Query";
      await admin_ins.save();
      // if (student?.length > 0) {
      student = await nested_document_limit(page, limit, student);
      var remain_fee = student?.filter((ref) => {
        if (ref?.admissionRemainFeeCount > 0) return ref;
      });
      res.status(200).send({
        message: "Its a party time from DB 🙌",
        remain: remain_fee,
        remainCount: remain_fee?.length,
      });
      // }
    } else if (flow === "Applicable_Fees_Query") {
      if (search) {
        var student = [];
        var depart = await Department.findOne({
          dName: { $regex: search, $options: "i" },
        });
        var batch = await Batch.findOne({
          batchName: { $regex: search, $options: "i" },
        });
        var all_remain = await RemainingList.find({
          student: { $in: admin_ins?.remainingFee },
        })
          .select("applicable_fee paid_fee student")
          .populate({
            path: "fee_structure",
            select: "applicable_fees",
          })
          .populate({
            path: "applicable_card",
          })
          .populate({
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: search, $options: "i" } },
                { studentMiddleName: { $regex: search, $options: "i" } },
                { studentLastName: { $regex: search, $options: "i" } },
                { valid_full_name: { $regex: search, $options: "i" } },
                { studentGRNO: { $regex: search, $options: "i" } },
                { studentCast: { $regex: search, $options: "i" } },
                { studentCastCategory: { $regex: search, $options: "i" } },
                { studentGender: { $regex: search, $options: "i" } },
                { department: depart?._id },
                { batches: batch?._id },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name applicable_fees_pending studentCast studentGender studentCastCategory photoId studentGRNO studentProfilePhoto admissionRemainFeeCount",
            populate: {
              path: "department",
              select: "dName",
            },
          });
        // console.log(all_remain);
        for (var ele of all_remain) {
          if (ele?.student != null) {
            ele.student.applicable_fees_pending +=
              ele?.fee_structure?.applicable_fees -
                ele?.applicable_card?.paid_fee >
              0
                ? ele?.fee_structure?.applicable_fees -
                  ele?.applicable_card?.paid_fee
                : 0;
            if (student?.includes(ele?.student)) {
            } else {
              student.push(ele?.student);
            }
          }
        }
        student = student?.filter((ref) => {
          if (ref?.applicable_fees_pending > 0) return ref;
        });
      } else {
        var student = [];
        var all_remain = await RemainingList.find({
          student: { $in: admin_ins?.remainingFee },
        })
          .select("applicable_fee paid_fee student")
          .populate({
            path: "fee_structure",
            select: "applicable_fees",
          })
          .populate({
            path: "applicable_card",
          })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName applicable_fees_pending photoId studentGRNO studentProfilePhoto admissionRemainFeeCount",
            populate: {
              path: "department",
              select: "dName",
            },
          });
        for (var ele of all_remain) {
          ele.student.applicable_fees_pending +=
            ele?.fee_structure?.applicable_fees -
              ele?.applicable_card?.paid_fee >
            0
              ? ele?.fee_structure?.applicable_fees -
                ele?.applicable_card?.paid_fee
              : 0;
          if (student?.includes(ele?.student)) {
          } else {
            student.push(ele?.student);
          }
        }
        student = student?.filter((ref) => {
          if (ref?.applicable_fees_pending > 0) return ref;
        });
        student = await nested_document_limit(page, limit, student);
      }
      admin_ins.active_tab_index = "Applicable_Fees_Query";
      await admin_ins.save();
      // if (student?.length > 0) {
      res.status(200).send({
        message: "Its a party time from DB 🙌",
        remain: student,
        remainCount: student?.length,
      });
      // }
    } else {
      res
        .status(200)
        .send({ message: "Account Running out of balance", remain: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionApplicableRemainingArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    const admin_ins = await Admission.findById({ _id: aid }).select(
      "remainingFee active_tab_index"
    );
    if (search) {
      var student = [];
      var all_remain = await RemainingList.find({
        student: { $in: admin_ins?.remainingFee },
      })
        .select("applicable_fee paid_fee student")
        .populate({
          path: "fee_structure",
          select: "applicable_fees",
        })
        .populate({
          path: "applicable_card",
        })
        .populate({
          path: "student",
          match: {
            $or: [
              { studentFirstName: { $regex: search, $options: "i" } },
              { studentMiddleName: { $regex: search, $options: "i" } },
              { studentLastName: { $regex: search, $options: "i" } },
              { valid_full_name: { $regex: search, $options: "i" } },
              { studentGRNO: { $regex: search, $options: "i" } },
              { studentCast: { $regex: search, $options: "i" } },
              { studentCastCategory: { $regex: search, $options: "i" } },
              { studentGender: { $regex: search, $options: "i" } },
              // { department: depart?._id },
              // { batches: batch?._id },
            ],
          },
          select:
            "studentFirstName studentMiddleName studentLastName valid_full_name applicable_fees_pending studentCast studentGender studentCastCategory photoId studentGRNO studentProfilePhoto admissionRemainFeeCount",
          populate: {
            path: "department",
            select: "dName",
          },
        });
      // console.log(all_remain);
      for (var ele of all_remain) {
        if (ele?.student != null) {
          ele.student.applicable_fees_pending +=
            ele?.fee_structure?.applicable_fees -
              ele?.applicable_card?.paid_fee >
            0
              ? ele?.fee_structure?.applicable_fees -
                ele?.applicable_card?.paid_fee
              : 0;
          if (student?.includes(ele?.student)) {
          } else {
            student.push(ele?.student);
          }
        }
      }
      student = student?.filter((ref) => {
        if (ref?.applicable_fees_pending > 0) return ref;
      });
    } else {
      var student = [];
      var all_remain = await RemainingList.find({
        student: { $in: admin_ins?.remainingFee },
      })
        .select("applicable_fee paid_fee student")
        .populate({
          path: "fee_structure",
          select: "applicable_fees",
        })
        .populate({
          path: "applicable_card",
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName applicable_fees_pending photoId studentGRNO studentProfilePhoto admissionRemainFeeCount",
          populate: {
            path: "department",
            select: "dName",
          },
        });
      for (var ele of all_remain) {
        ele.student.applicable_fees_pending +=
          ele?.fee_structure?.applicable_fees - ele?.applicable_card?.paid_fee >
          0
            ? ele?.fee_structure?.applicable_fees -
              ele?.applicable_card?.paid_fee
            : 0;
        if (student?.includes(ele?.student)) {
        } else {
          student.push(ele?.student);
        }
      }
      student = student?.filter((ref) => {
        if (ref?.applicable_fees_pending > 0) return ref;
      });
      student = await nested_document_limit(page, limit, student);
    }
    admin_ins.active_tab_index = "Applicable_Fees_Query";
    await admin_ins.save();
    // if (student?.length > 0) {
    res.status(200).send({
      message: "Its a party time from DB 🙌",
      remain: student,
      remainCount: student?.length,
    });
    // }
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentViewRemainingFee = async (req, res) => {
  try {
    const { sid } = req.params;
    const student = await Student.findById({ _id: sid }).select(
      "admissionPaymentStatus"
    );
    // const remainEncrypt = await encryptionPayload(student.admissionPaymentStatus);
    const ads_obj = {
      message: "Remaining fee view",
      remain_fee: student.admissionPaymentStatus,
    };
    const adsEncrypt = await encryptionPayload(ads_obj);
    res.status(200).send({
      encrypt: adsEncrypt,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.paidRemainingFeeStudent = async (req, res) => {
  try {
    const { aid, sid, appId } = req.params;
    const {
      amount,
      mode,
      type,
      card_id,
      rid,
      raid,
      pay_remain,
      nsid,
      staffId,
    } = req.body;
    const { receipt_status } = req.query;
    if (!sid && !aid && !appId && !amount && !mode && !type)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    var extra_price = 0;
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var admin_ins = await Admission.findById({ _id: aid }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var apply = await NewApplication.findById({ _id: appId });
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.receipt_generated_from = "BY_ADMISSION";
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    new_receipt.receipt_status = receipt_status
      ? receipt_status
      : "Already Generated";
    const notify = new StudentNotification({});
    var all_status = await Status.find({
      $and: [
        { applicationId: apply?._id },
        { student: student?._id },
        { payment_status: "Not Paid" },
      ],
    });
    var remaining_fee_lists = await RemainingList.findById({ _id: rid })
      .populate({
        path: "applicable_card",
      })
      .populate({
        path: "government_card",
      });
    new_receipt.fee_structure = remaining_fee_lists?.fee_structure;
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    var order = new OrderPayment({});
    order.payment_module_type = "Admission Fees";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = extra_price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    fee_receipt_count_query(institute, new_receipt, order);
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    if (`${remaining_fee_lists?.applicable_card?._id}` === `${card_id}`) {
      var nest_card = await NestedCard.findById({ _id: `${card_id}` });
      remaining_fee_lists.active_payment_type = `${type}`;
      nest_card.active_payment_type = `${type}`;
      remaining_fee_lists.paid_fee += price;
      nest_card.paid_fee += price;

      if (remaining_fee_lists?.remaining_fee >= price) {
        remaining_fee_lists.remaining_fee -= price;
      } else {
        remaining_fee_lists.remaining_fee = 0;
      }
      if (nest_card?.remaining_fee >= price) {
        nest_card.remaining_fee -= price;
      } else {
        nest_card.remaining_fee = 0;
      }
      if (student.admissionRemainFeeCount >= price) {
        student.admissionRemainFeeCount -= price;
      }
      if (apply.remainingFee >= price) {
        apply.remainingFee -= price;
      }
      if (admin_ins.remainingFeeCount >= price) {
        admin_ins.remainingFeeCount -= price;
      }
      var valid_one_time_fees =
        student?.fee_structure?.applicable_fees - price == 0 ? true : false;
      if (valid_one_time_fees) {
        admin_ins.remainingFee.pull(student._id);
      } else {
        // nest_card.remaining_array.push({
        //   remainAmount: student?.fee_structure?.applicable_fees - price,
        //   appId: apply._id,
        //   status: "Not Paid",
        //   instituteId: institute._id,
        //   installmentValue: "One Time Fees Remain",
        //   isEnable: true,
        // });
      }
      var extra_price = 0;
      await nest_card.save();
      if (type === "First Installment") {
        if (
          remaining_fee_lists?.is_splited &&
          remaining_fee_lists?.is_splited === "Yes"
        ) {
          console.log("Enter Split");
          await set_fee_head_query_redesign_split(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt,
            nest_card,
            nsid
          );
          console.log("Exit Split");
        } else {
          await set_fee_head_query_redesign(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt
          );
        }
      } else {
        if (
          remaining_fee_lists?.is_splited &&
          remaining_fee_lists?.is_splited === "Yes"
        ) {
          console.log("Update Split");
          await update_fee_head_query_redesign_split(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt,
            nest_card,
            nsid
          );
          console.log("Update Split");
        } else {
          await update_fee_head_query_redesign(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt
          );
        }
        // await update_fee_head_query(student, price, apply, new_receipt);
      }
      if (req?.body?.fee_payment_mode === "Exempted/Unrecovered") {
        await exempt_installment(
          req?.body?.fee_payment_mode,
          remaining_fee_lists,
          student,
          admin_ins,
          apply,
          finance,
          price,
          new_receipt,
          nest_card
        );
      } else {
        console.log("Enter");
        if (pay_remain) {
          await all_installment_paid(
            remaining_fee_lists,
            student?.fee_structure,
            mode,
            price,
            admin_ins,
            student,
            new_receipt,
            apply,
            institute,
            nest_card,
            type
          );
        } else {
          await render_installment(
            type,
            student,
            mode,
            price,
            admin_ins,
            student?.fee_structure,
            remaining_fee_lists,
            new_receipt,
            apply,
            institute,
            nest_card
          );
        }
        console.log("Exit");
        if (
          `${new_receipt?.fee_payment_mode}` === "Demand Draft" ||
          `${new_receipt?.fee_payment_mode}` === "Cheque"
        ) {
          if (admin_ins?.request_array?.includes(`${new_receipt?._id}`)) {
          } else {
            admin_ins.request_array.push(new_receipt?._id);
            admin_ins.fee_receipt_request.push({
              receipt: new_receipt?._id,
              demand_cheque_status: "Requested",
              nested_card: nest_card?._id,
              nest_remain: raid,
            });
            admin_ins.fee_receipt_request_count += 1;
          }
        }
      }
      if (type === "First Installment") {
        console.log("Enter");
        for (var val of apply?.FeeCollectionApplication) {
          if (`${val?.student}` === `${student?._id}`) {
            apply.confirmedApplication.push({
              student: student._id,
              payment_status: mode,
              install_type: "First Installment Paid",
              fee_remain: nest_card.remaining_fee ?? 0,
            });
            apply.confirmCount += 1;
            apply.FeeCollectionApplication.pull(val?._id);
            if (apply?.fee_collect_count > 0) {
              apply.fee_collect_count -= 1;
            }
          }
        }
        for (var val of admin_ins?.FeeCollectionApplication) {
          if (`${val?.student}` === `${student?._id}`) {
            admin_ins.confirmedApplication_query.push({
              student: student._id,
              payment_status: mode,
              install_type: "First Installment Paid",
              fee_remain: nest_card.remaining_fee ?? 0,
              application: apply?._id,
            });
            admin_ins.FeeCollectionApplication.pull(val?._id);
          }
        }
      }
    }
    if (staffId) {
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "fee_collect_by",
      });
    }
    student.admissionPaidFeeCount += price;
    if (mode === "Online") {
      admin_ins.onlineFee += price + extra_price;
      apply.onlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeBankBalance += price + extra_price;
    } else if (mode === "Offline") {
      admin_ins.offlineFee += price + extra_price;
      apply.offlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      admin_ins.collected_fee += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeSubmitBalance += price + extra_price;
    } else {
    }
    // await set_fee_head_query(student, price, apply);
    await lookup_applicable_grant(
      req?.body?.fee_payment_mode,
      price,
      remaining_fee_lists,
      new_receipt
    );
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price;
      }
    }
    for (var val of all_status) {
      val.payment_status = "Paid";
      val.fee_receipt = new_receipt?._id;
      await val.save();
    }
    await Promise.all([
      admin_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      remaining_fee_lists.save(),
      new_receipt.save(),
    ]);
    res.status(200).send({
      message: "Balance Pool increasing with price Operation complete",
      paid: true,
    });
    var is_refund =
      remaining_fee_lists?.paid_fee - remaining_fee_lists?.applicable_fee;
    if (is_refund > 0) {
      const filter_student_refund = admin_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          admin_ins.refundCount += is_refund;
        }
      } else {
        admin_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        admin_ins.refundCount += is_refund;
      }
    }
    await admin_ins.save();
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = admin_ins?.admissionAdminHead?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByAdmissionPhoto = admin_ins._id;
    notify.notifyCategory = "Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Application Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
    if (apply?.allottedApplication?.length > 0) {
      apply?.allottedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          // ele.fee_remain = ele.fee_remain >= price ? ele.fee_remain - price : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await apply.save();
    }
    if (apply?.confirmedApplication?.length > 0) {
      apply?.confirmedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.fee_remain =
            req?.body?.fee_payment_mode === "Exempted/Unrecovered"
              ? 0
              : ele.fee_remain >= price
              ? ele.fee_remain - price
              : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await apply.save();
    }
    for (let ele of nest_card?.remaining_array) {
      if (ele?.remainAmount <= 0) {
        nest_card?.remaining_array?.pull(ele?._id);
      }
    }
    await nest_card.save();
  } catch (e) {
    console.log(e);
  }
};

exports.paidRemainingFeeStudentRefundBy = async (req, res) => {
  try {
    const { aid, sid, appId } = req.params;
    const { amount, mode, rid } = req.body;
    if (!sid && !aid && !appId && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var admin_ins = await Admission.findById({ _id: aid }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var student = await Student.findById({ _id: sid });
    var institute = await InstituteAdmin.findById({
      _id: `${admin_ins?.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var apply = await NewApplication.findById({ _id: appId });
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.refund_status = "Refunded";
    new_receipt.application = apply?._id;
    new_receipt.receipt_generated_from = "BY_ADMISSION";
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    const notify = new StudentNotification({});
    const remaining_fee_lists = await RemainingList.findById({
      _id: rid,
    });
    new_receipt.fee_structure = remaining_fee_lists?.fee_structure;
    if (remaining_fee_lists?.government_card) {
      var nest_gov = await NestedCard.findById({
        _id: `${remaining_fee_lists?.government_card}`,
      });
    }
    if (remaining_fee_lists?.applicable_card) {
      var nest_card = await NestedCard.findById({
        _id: `${remaining_fee_lists?.applicable_card}`,
      });
    }
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    var order = new OrderPayment({});
    order.payment_module_type = "Expense";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    fee_receipt_count_query(institute, new_receipt, order);
    order.fee_receipt = new_receipt?._id;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    student.refundAdmission.push({
      refund_status: "Refund",
      refund_reason: "Extra Amount Paid Or Grant Some Scholarships",
      refund_amount: price,
      refund_from: apply?._id,
    });
    if (remaining_fee_lists?.paid_fee >= price) {
      remaining_fee_lists.paid_fee -= price;
    }
    remaining_fee_lists.refund_fee += price;
    if (student?.admissionPaidFeeCount >= price) {
      student.admissionPaidFeeCount -= price;
    }
    if (mode === "Online") {
      if (admin_ins.onlineFee >= price) {
        admin_ins.onlineFee -= price;
      }
      if (apply.onlineFee >= price) {
        apply.onlineFee -= price;
      }
      if (apply.collectedFeeCount >= price) {
        apply.collectedFeeCount -= price;
      }
      if (finance.financeTotalBalance >= price) {
        finance.financeTotalBalance -= price;
      }
      if (finance.financeAdmissionBalance >= price) {
        finance.financeAdmissionBalance -= price;
      }
      if (finance.financeBankBalance >= price) {
        finance.financeBankBalance -= price;
      }
    } else if (mode === "Offline") {
      if (admin_ins.offlineFee >= price) {
        admin_ins.offlineFee -= price;
      }
      if (apply.offlineFee >= price) {
        apply.offlineFee -= price;
      }
      if (apply.collectedFeeCount >= price) {
        apply.collectedFeeCount -= price;
      }
      if (admin_ins.collected_fee >= price) {
        admin_ins.collected_fee -= price;
      }
      if (finance.financeTotalBalance >= price) {
        finance.financeTotalBalance -= price;
      }
      if (finance.financeAdmissionBalance >= price) {
        finance.financeAdmissionBalance -= price;
      }
      if (finance.financeSubmitBalance >= price) {
        finance.financeSubmitBalance -= price;
      }
    } else {
    }
    // for (var stu of student.paidFeeList) {
    //   if (`${stu.appId}` === `${apply._id}`) {
    //     if (stu.paidAmount >= price) {
    //       stu.paidAmount -= price;
    //     }
    //   }
    // }
    if (nest_card) {
      var app_count =
        nest_card?.paid_fee >= nest_card?.applicable_fee
          ? nest_card?.paid_fee - nest_card?.applicable_fee
          : 0;
      if (nest_card?.paid_fee >= app_count) {
        nest_card.paid_fee -= app_count;
      }
      if (app_count > 0) {
        nest_card.remaining_array.push({
          appId: apply?._id,
          remainAmount: price,
          status: "Paid",
          instituteId: institute?._id,
          installmentValue: "Refund From Admission Admin",
          isEnable: true,
          refund_status: "Refunded",
          fee_receipt: new_receipt?._id,
        });
      }
      await nest_card.save();
    }

    if (nest_gov) {
      var gov_count =
        nest_gov?.paid_fee >= nest_gov?.applicable_fee
          ? nest_gov?.paid_fee - nest_gov?.applicable_fee
          : 0;
      if (nest_gov?.paid_fee >= gov_count) {
        nest_gov.paid_fee -= gov_count;
      }
      if (gov_count > 0) {
        nest_gov.remaining_array.push({
          remainAmount: 0 - gov_count,
          appId: apply?._id,
          status: "Paid",
          instituteId: institute?._id,
          installmentValue: "All Installment Paid",
          refund_status: "Refunded",
          cover_status:
            "Excess Government/Scholarship Transfer To Applicable Fees",
          isEnable: true,
        });
      }
      await nest_gov.save();
    }
    const filter_student_refund = admin_ins?.refundFeeList?.filter((stu) => {
      if (`${stu.student}` === `${student?._id}`) return stu;
    });
    if (filter_student_refund?.length > 0) {
      for (var data of filter_student_refund) {
        if (data.refund >= price) {
          data.refund -= price;
        }
        if (admin_ins.refundCount >= price) {
          admin_ins.refundCount -= price;
        }
        admin_ins.refundedFeeList.push({
          student: student?._id,
          refund: price,
          fee_receipt: new_receipt?._id,
        });
        admin_ins.refundedCount += price;
      }
      for (var ref of admin_ins.refundFeeList) {
        if (`${ref?.student}` === `${student?._id}`) {
          admin_ins.refundFeeList.pull(ref?._id);
        }
      }
    }
    await Promise.all([
      admin_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      remaining_fee_lists.save(),
      new_receipt.save(),
    ]);
    res.status(200).send({
      message: "Balance Pool increasing with price Operation complete",
      paid: true,
    });
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = admin_ins?.admissionAdminHead?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByAdmissionPhoto = admin_ins._id;
    notify.notifyCategory = "Refund By Admission Admin";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Refund`,
      "Application Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
  } catch (e) {
    console.log(e);
  }
};

const request_mode_query_by_student = async (
  aid,
  sid,
  appId,
  amount,
  mode,
  type,
  receipt
) => {
  try {
    var price = parseInt(amount);
    var extra_price = 0;
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var admin_ins = await Admission.findById({ _id: aid }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var apply = await NewApplication.findById({ _id: appId });
    var new_receipt = await FeeReceipt.findById({ _id: receipt });
    const notify = new StudentNotification({});
    const remaining_fee_lists = await RemainingList.findOne({
      $and: [{ student: student?._id }, { appId: apply?._id }],
    });
    if (remaining_fee_lists) {
      remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    }
    if (new_receipt?.fee_payment_mode === "Government/Scholarship") {
      finance.government_receipt.push(new_receipt?._id);
      finance.financeGovernmentScholarBalance += price;
      finance.government_receipt_count += 1;
      if (price >= remaining_fee_lists?.remaining_fee) {
        extra_price += price - remaining_fee_lists?.remaining_fee;
        price = remaining_fee_lists?.remaining_fee;
        if (remaining_fee_lists) {
          remaining_fee_lists.paid_fee += extra_price;
        }
        student.admissionPaidFeeCount += extra_price;
        for (var stu of student.paidFeeList) {
          if (`${stu.appId}` === `${apply._id}`) {
            stu.paidAmount += extra_price;
          }
        }
        await remain_one_time_query_government(
          admin_ins,
          remaining_fee_lists,
          apply,
          institute,
          student,
          price + extra_price,
          new_receipt
        );
      } else {
        if (type === "One Time Fees Remain") {
        } else {
          await remain_government_installment(
            admin_ins,
            remaining_fee_lists,
            apply,
            institute,
            student,
            price,
            new_receipt,
            type
          );
        }
      }
    }
    var order = new OrderPayment({});
    order.payment_module_type = "Admission Fees";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = extra_price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    order.payment_invoice_number = new_receipt?.invoice_count;
    order.fee_receipt = new_receipt?._id;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    if (new_receipt?.fee_payment_mode === "Exempted/Unrecovered") {
      await exempt_installment(
        new_receipt?.fee_payment_mode,
        remaining_fee_lists,
        student,
        admin_ins,
        apply,
        finance,
        price,
        new_receipt
      );
    } else {
      if (new_receipt?.fee_payment_mode === "Government/Scholarship") {
        if (remaining_fee_lists) {
          remaining_fee_lists.paid_fee += price;
        }
        if (remaining_fee_lists?.remaining_fee >= price) {
          remaining_fee_lists.remaining_fee -= price;
        }
      } else {
        if (remaining_fee_lists) {
          remaining_fee_lists.paid_fee += price;
        }
        if (remaining_fee_lists?.remaining_fee >= price) {
          remaining_fee_lists.remaining_fee -= price;
        }
        await render_installment(
          type,
          student,
          mode,
          price,
          admin_ins,
          student?.fee_structure,
          remaining_fee_lists,
          new_receipt,
          apply,
          institute
        );
      }
    }
    if (admin_ins?.remainingFeeCount >= price) {
      admin_ins.remainingFeeCount -= price;
    }
    if (apply?.remainingFee >= price) {
      apply.remainingFee -= price;
    }
    if (student?.admissionRemainFeeCount >= price) {
      student.admissionRemainFeeCount -= price;
    }
    student.admissionPaidFeeCount += price;
    if (mode === "Online") {
      admin_ins.onlineFee += price + extra_price;
      apply.onlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeBankBalance += price + extra_price;
    } else if (mode === "Offline") {
      admin_ins.offlineFee += price + extra_price;
      apply.offlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      admin_ins.collected_fee += price + extra_price;
      finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeSubmitBalance += price + extra_price;
    } else {
    }
    // await set_fee_head_query(student, price, apply);
    if (new_receipt?.fee_payment_mode === "Government/Scholarship") {
    } else {
      await update_fee_head_query_redesign(
        student,
        new_receipt?.fee_payment_amount,
        apply?._id,
        new_receipt
      );
      // await update_fee_head_query(student, price, apply, new_receipt);
    }
    if (remaining_fee_lists) {
      await lookup_applicable_grant(
        new_receipt?.fee_payment_mode,
        price,
        remaining_fee_lists,
        new_receipt
      );
    }
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price;
      }
    }
    if (type === "One Time Fees Remain") {
      await remain_one_time_query(
        admin_ins,
        remaining_fee_lists,
        apply,
        institute,
        student,
        price,
        new_receipt
      );
    }
    if (remaining_fee_lists) {
      await remaining_fee_lists.save();
    }
    await Promise.all([
      admin_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      new_receipt.save(),
    ]);
    var is_refund =
      remaining_fee_lists?.paid_fee - remaining_fee_lists?.applicable_fee;
    if (is_refund > 0) {
      const filter_student_refund = admin_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          admin_ins.refundCount += is_refund;
        }
      } else {
        admin_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        admin_ins.refundCount += is_refund;
      }
    }
    await admin_ins.save();
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = admin_ins?.admissionAdminHead?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByAdmissionPhoto = admin_ins._id;
    notify.notifyCategory = "Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Application Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
    if (apply?.allottedApplication?.length > 0) {
      apply?.allottedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          // ele.fee_remain = ele.fee_remain >= price ? ele.fee_remain - price : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await apply.save();
    }
    if (apply?.confirmedApplication?.length > 0) {
      apply?.confirmedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.fee_remain =
            new_receipt?.fee_payment_mode === "Exempted/Unrecovered"
              ? 0
              : ele.fee_remain >= price
              ? ele.fee_remain - price
              : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await apply.save();
    }
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.finance = finance._id;
      business_data.b_to_c_name = "Admission Fees";
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = price + extra_price;
      await Promise.all([finance.save(), business_data.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionApplicationStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const apply = await NewApplication.find({ applicationStatus: `${status}` })
      .select(
        "applicationName applicationSeats applicationStatus applicationEndDate"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName",
      });
    // const adsEncrypt = await encryptionPayload(apply);

    res.status(200).send({ message: "All Application", apply });
  } catch {}
};

exports.retrieveOneApplicationQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    // const is_cache = await connect_redis_hit(`One-Application-Detail-${aid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "One Application Query from Cache 🙌",
    //     answer: is_cache.oneApply,
    //   });
    const oneApply = await NewApplication.findById({ _id: aid })
      .select(
        "applicationName applicationType applicationAbout admissionProcess gr_initials applicationEndDate applicationStartDate admissionFee applicationPhoto photoId applicationSeats receievedCount selectCount confirmCount applicationStatus cancelCount allotCount onlineFee offlineFee remainingFee collectedFeeCount applicationMaster application_type app_qr_code student_form_setting app_hindi_qr_code app_marathi_qr_code pin admission_intake collect_docs review_count fee_collect_count"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName studentFormSetting",
      })
      .populate({
        path: "applicationBatch",
        select: "batchName",
      })
      .populate({
        path: "applicationMaster",
        select: "className",
      })
      .populate({
        path: "admissionAdmin",
        select: "_id",
        populate: {
          path: "institute",
          select: "id",
        },
      })
      .populate({
        path: "hostelAdmin",
        select: "_id",
        populate: {
          path: "institute",
          select: "id",
        },
      })
      .populate({
        path: "direct_linked_structure",
        select:
          "unique_structure_name structure_name total_admission_fees applicable_fees one_installments",
      })
      .populate({
        path: "direct_attach_class",
        select: "className classTitle classStatus",
      })
      .populate({
        path: "applicationHostel",
        select: "photoId hostel_photo",
      })
      .populate({
        path: "applicationUnit",
        select: "hostel_unit_name",
      })
      .populate({
        path: "subject_selected_group",
        populate: {
          path: "subject_group_select",
          populate: {
            path: "compulsory_subject",
            select: "subjectName",
          },
        },
      })
      .populate({
        path: "subject_selected_group",
        populate: {
          path: "subject_group_select",
          populate: {
            path: "optional_subject",
            populate: {
              path: "optional_subject_options optional_subject_options_or.options",
              select: "subjectName",
            },
          },
        },
      })
      .populate({
        path: "subject_selected_group",
        populate: {
          path: "subject_group_select",
          populate: {
            path: "fixed_subject",
            populate: {
              path: "fixed_subject_options",
              select: "subjectName",
            },
          },
        },
      })
      .lean()
      .exec();
    // const oneEncrypt = await encryptionPayload(oneApply);
    // const cached = await connect_redis_miss(
    //   `One-Application-Detail-${aid}`,
    //   oneApply
    // );
    const ads_obj = {
      message:
        "Sit with a paper and pen to note down all details carefully from DB 🙌",
      // oneApply: cached.oneApply,
      oneApply: oneApply,
    };
    const adsEncrypt = await encryptionPayload(ads_obj);
    res.status(200).send({
      encrypt: adsEncrypt,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserInquiryProcess = async (req, res) => {
  try {
    const { aid, uid } = req.params;
    const app = await Admission.findById({ _id: aid });
    const user = await User.findById({ _id: uid });
    const ask = new Inquiry({ ...req.body });
    ask.user = user._id;
    ask.reasonExplanation.push({
      content: req.body?.content,
      replyBy: req.body?.replyBy,
    });
    app.inquiryList.push(ask._id);
    app.queryCount += 1;
    user.inquiryList.push(ask._id);
    await Promise.all([app.save(), user.save(), ask.save()]);
    res.status(200).send({ message: "Raised an inquiry " });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserInquiryArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params;
    const skip = (page - 1) * limit;
    const app = await Admission.findById({ _id: aid }).select("id inquiryList");

    const ask = await Inquiry.find({ _id: { $in: app.inquiryList } })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip);

    if (ask?.length >= 1) {
      // const iEncrypt = await encryptionPayload(ask);
      res.status(200).send({ message: "Get List of Inquiry", i_list: ask });
    } else {
      res
        .status(200)
        .send({ message: "Looking for a inquiry List", i_list: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveInquiryReplyQuery = async (req, res) => {
  try {
    const { qid } = req.params;
    const { author } = req.query;
    const ask_query = await Inquiry.findById({ _id: qid });
    if (`${author}` === "User") {
      ask_query.reasonExplanation.push({
        content: req.body?.content,
        replyBy: `${author}`,
      });
      await ask_query.save();
      res.status(200).send({ message: `Ask By ${author}` });
    } else if (`${author}` === "Admin") {
      ask_query.reasonExplanation.push({
        content: req.body?.content,
        replyBy: `${author}`,
      });
      await ask_query.save();
      res.status(200).send({ message: `Reply By ${author}` });
    } else {
      res.status(200).send({ message: "Lost in space" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllDepartmentArray = async (req, res) => {
  try {
    const { aid } = req.params;
    // const is_cache = await connect_redis_hit(`All-Department-App-${aid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Application Department from Cache 🙌",
    //     allDB: is_cache.ins_depart?.depart,
    //   });
    const admin_ins = await Admission.findById({ _id: aid }).select(
      "institute"
    );
    const ins_depart = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    })
      .select("insName")
      .populate({
        path: "depart",
        select: "dName batches",
        populate: {
          path: "departmentSelectBatch batches",
          select: "batchName createdAt batchStatus",
        },
      });

    if (ins_depart?.depart?.length > 0) {
      // const departEncrypt = await encryptionPayload(ins_depart?.depart);
      // const cached = await connect_redis_miss(
      //   `All-Department-App-${aid}`,
      //   ins_depart?.depart
      // );
      res.status(200).send({
        message: "All Department with batch from DB 🙌",
        // allDB: cached.ins_depart?.depart,
        allDB: ins_depart?.depart,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Department with No batch", allDB: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStudentCancelAdmissionMode = async (req, res) => {
  try {
    const { statusId, aid, sid } = req.params;
    if (!sid && !aid && !statusId)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const status = await Status.findById({ _id: statusId });
    const apply = await NewApplication.findById({ _id: aid });
    const student = await Student.findById({ _id: sid });
    if (apply?.selectedApplication?.length > 0) {
      apply?.selectedApplication?.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.payment_status = "Cancelled";
        }
      });
      await apply.save();
    }
    status.for_selection = "No";
    if (
      student.admissionRemainFeeCount >=
      student?.fee_structure?.total_admission_fees
    ) {
      student.admissionRemainFeeCount -=
        student?.fee_structure?.total_admission_fees;
    }
    await Promise.all([status.save(), student.save()]);
    res
      .status(200)
      .send({ message: "Cancel Admission Selection", cancel_status: true });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStudentAdmissionFees = async (req, res) => {
  try {
    const { sid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    // const is_cache = await connect_redis_hit(`One-Student-AppFees-${sid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Admission Fees of One Student from Cache 🙌",
    //     allDB: is_cache.ins_depart?.depart,
    //   });
    const student = await Student.findById({ _id: sid }).select(
      "remainingFeeList"
    );
    var all_remain_promote = await RemainingList.find({
      $and: [
        { _id: { $in: student?.remainingFeeList } },
        { card_type: "Promote" },
      ],
    })
      .sort({ created_at: -1 })
      .select(
        "applicable_fee scholar_ship_number card_type applicable_fees_pending excess_fee remaining_fee exempted_fee paid_by_student paid_by_government paid_fee refund_fee status created_at remark remaining_flow renewal_start renewal_end drop_status already_made button_status"
      )
      .populate({
        path: "appId",
        select:
          "applicationName applicationDepartment applicationMaster admissionAdmin hostelAdmin applicationBatch",
        populate: {
          path: "admissionAdmin hostelAdmin",
          select: "institute",
          populate: {
            path: "institute",
            select: "financeDepart",
          },
        },
      })
      .populate({
        path: "vehicleId",
        select: "vehicle_type vehicle_number vehicle_name",
        populate: {
          path: "transport",
          select: "institute",
          populate: {
            path: "institute",
            select: "financeDepart",
          },
        },
      })
      // .populate({
      //   path: "remaining_array",
      //   populate: {
      //     path: "fee_receipt",
      //   },
      // })
      .populate({
        path: "student",
        select: "studentFirstName studentMiddleName studentLastName",
        populate: {
          path: "hostel_fee_structure",
          select:
            "total_admission_fees structure_name department unique_structure_name total_installments applicable_fees one_installments category_master structure_month batch_master",
          populate: {
            path: "category_master class_master",
            select: "category_name scholarship_applicable className",
          },
        },
      })
      .populate({
        path: "batchId",
        select: "batchName",
      })
      .populate({
        path: "fee_structure",
        select:
          "total_admission_fees structure_name department unique_structure_name total_installments applicable_fees one_installments structure_month category_master batch_master",
        populate: {
          path: "category_master class_master",
          select: "category_name scholarship_applicable className",
        },
      })
      .populate({
        path: "applicable_card government_card",
        populate: {
          path: "remaining_array",
          populate: {
            path: "fee_receipt",
          },
        },
      })
      .populate({
        path: "student",
        select: "studentFirstName studentMiddleName studentLastName",
        populate: {
          path: "studentClass",
          select: "className classTitle classStatus batch",
          populate: {
            path: "batch",
            select: "batchName batchStatus",
          },
        },
      });
    var all_remain_normal = await RemainingList.find({
      $and: [
        { _id: { $in: student?.remainingFeeList } },
        { card_type: "Normal" },
      ],
    })
      .sort({ created_at: -1 })
      .select(
        "applicable_fee scholar_ship_number card_type applicable_fees_pending excess_fee remaining_fee exempted_fee paid_by_student paid_by_government paid_fee refund_fee status created_at remark remaining_flow renewal_start renewal_end drop_status already_made button_status"
      )
      .populate({
        path: "appId",
        select:
          "applicationName applicationDepartment applicationMaster admissionAdmin hostelAdmin applicationBatch",
        populate: {
          path: "admissionAdmin hostelAdmin",
          select: "institute",
          populate: {
            path: "institute",
            select: "financeDepart",
          },
        },
      })
      .populate({
        path: "vehicleId",
        select: "vehicle_type vehicle_number vehicle_name",
        populate: {
          path: "transport",
          select: "institute",
          populate: {
            path: "institute",
            select: "financeDepart",
          },
        },
      })
      // .populate({
      //   path: "remaining_array",
      //   populate: {
      //     path: "fee_receipt",
      //   },
      // })
      .populate({
        path: "student",
        select: "studentFirstName studentMiddleName studentLastName",
        populate: {
          path: "hostel_fee_structure",
          select:
            "total_admission_fees structure_name department unique_structure_name total_installments applicable_fees one_installments category_master structure_month batch_master",
          populate: {
            path: "category_master class_master",
            select: "category_name scholarship_applicable className",
          },
        },
      })
      .populate({
        path: "batchId",
        select: "batchName",
      })
      .populate({
        path: "fee_structure",
        select:
          "total_admission_fees structure_name department unique_structure_name total_installments applicable_fees one_installments structure_month category_master batch_master",
        populate: {
          path: "category_master class_master",
          select: "category_name scholarship_applicable className",
        },
      })
      .populate({
        path: "applicable_card government_card",
        populate: {
          path: "remaining_array",
          populate: {
            path: "fee_receipt",
          },
        },
      })
      .populate({
        path: "student",
        select: "studentFirstName studentMiddleName studentLastName",
        populate: {
          path: "studentClass",
          select: "className classTitle classStatus batch",
          populate: {
            path: "batch",
            select: "batchName batchStatus",
          },
        },
      });
    var valid_arr = [...all_remain_promote, ...all_remain_normal];
    var valid_remain = await nested_document_limit(page, limit, valid_arr);
    var count = 0;
    for (var ref of valid_remain) {
      count +=
        ref?.applicable_card?.paid_fee >= ref?.applicable_card?.applicable_fee
          ? ref?.applicable_card?.paid_fee -
            ref?.applicable_card?.applicable_fee
          : 0;
      count +=
        ref?.government_card?.paid_fee >= ref?.government_card?.applicable_fee
          ? ref?.government_card?.paid_fee -
            ref?.government_card?.applicable_fee
          : 0;
      if (ref?.applicable_fee === ref?.remaining_fee) {
        ref.drop_status = "Enable";
      } else {
      }
      if (ref?.paid_fee >= ref?.fee_structure?.applicable_fees) {
        ref.button_status = "Collect As Scholarship";
      } else {
      }
      ref.applicable_fees_pending +=
        ref?.fee_structure?.applicable_fees - ref?.applicable_card?.paid_fee > 0
          ? ref?.fee_structure?.applicable_fees - ref?.applicable_card?.paid_fee
          : 0;
      ref.excess_fee =
        (ref?.applicable_card?.paid_fee > ref?.applicable_card?.applicable_fee
          ? ref?.applicable_card?.paid_fee -
            ref?.applicable_card?.applicable_fee
          : 0) +
        (ref?.government_card?.paid_fee > ref?.government_card?.applicable_fee
          ? ref?.government_card?.paid_fee -
            ref?.government_card?.applicable_fee
          : 0);
    }
    for (var ref of valid_remain) {
      ref.setOffPrice = count;
    }

    if (valid_remain?.length > 0) {
      // const arrayEncrypt = await encryptionPayload(valid_remain);
      // const cached = await connect_redis_miss(
      //   `One-Student-AppFees-${sid}`,
      //   valid_remain
      // );
      const ads_obj = {
        message: "All Admission Fees",
        get: true,
        // array: cached.valid_remain,
        array: valid_remain,
        // student: student,
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({
        encrypt: adsEncrypt,
        // ads_obj,
        array: valid_remain,
      });
    } else {
      const ads_obj = {
        message: "No Admission Fees",
        get: false,
        array: [],
        // student: student,
      };
      const adsEncrypt = await encryptionPayload(ads_obj);
      res.status(200).send({
        encrypt: adsEncrypt,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionCollectDocs = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { mode, type, amount, nest, revert_status, staffId, collect_docs } =
      req.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        docs_status: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var admission = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    // console.log(admission?._id)
    // console.log(admission?.admissionAdminHead?.user)
    var institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    var student = await Student.findById({ _id: sid });
    if (student?.remainingFeeList?.length > 0) {
      for (let ele of apply?.selectedApplication) {
        if (`${ele?.student}` === `${student?._id}`) {
          apply.selectedApplication.pull(ele?._id);
          if (apply?.selectCount > 0) {
            apply.selectCount -= 1;
          }
        }
      }
      for (let val of admission?.selectedApplication) {
        if (`${val?.student}` === `${student?._id}`) {
          admission.selectedApplication.pull(val?._id);
        }
      }
      await Promise.all([apply.save(), admission.save()]);
      res
        .status(200)
        .send({ message: "Fees Card Already Exists", access: true });
    } else {
      const structure = await FeeStructure.findById({
        _id: `${student?.fee_structure}`,
      });
      var user = await User.findById({ _id: `${student?.user}` });
      var status = new Status({});
      var notify = new StudentNotification({});
      let obj = {
        status_id: status?._id,
        revert_request_status: revert_status,
      };
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "docs_by",
      });
      var c_num = await render_new_fees_card(
        student?._id,
        apply?._id,
        structure?._id,
        "By_Admission_Admin_After_Docs_Collect",
        "",
        "",
        obj
      );
      if (structure?.applicable_fees <= 0) {
        apply.confirmedApplication.push({
          student: student._id,
          payment_status: "Zero Applicable Fees",
          install_type: "No Installment Required For Payment",
          fee_remain: structure?.applicable_fees,
          status_id: status?._id,
          revert_request_status: revert_status,
        });
        apply.confirmCount += 1;
      } else {
        apply.FeeCollectionApplication.push({
          student: student?._id,
          fee_remain: structure?.applicable_fees,
          payment_flow: c_num?.card,
          app_card: c_num?.app_card,
          gov_card: c_num?.gov_card,
          status_id: status?._id,
          revert_request_status: revert_status,
          fee_struct: c_num?.fee_struct,
        });
        apply.fee_collect_count += 1;
      }
      apply.selectedApplication.pull(nest);
      if (apply?.selectCount > 0) {
        apply.selectCount -= 1;
      }
      // for (let app of apply.selectedApplication) {
      //   if (`${app.student}` === `${student._id}`) {
      //     app.docs_collect = "Collected";
      //     app.status_id = status?._id;
      //     app.edited_struct = false;
      //   } else {
      //   }
      // }
      status.content = `Your documents are submitted and verified successfully.Complete your admission by paying application admission fees from below: Application Admission Fees: Rs.${structure?.applicable_fees}`;
      status.applicationId = apply._id;
      user.applicationStatus.push(status._id);
      status.group_by = "Admission_Fees_Payment";
      status.remaining_list = c_num?.card;
      status.payment_status = "Not Paid";
      status.finance = institute?.financeDepart?.[0];
      status.feeStructure = structure?._id;
      status.for_selection = "Yes";
      status.structure_edited = "Edited";
      status.studentId = student?._id;
      status.student = student?._id;
      status.instituteId = institute._id;
      notify.notifyContent = `Your documents are submitted and verified successfully.Complete your admission by paying application admission fees from below: Application Admission Fees: Rs.${structure?.applicable_fees}`;
      // console.log(
      //   admission?.admissionAdminHead?.user
      // );
      notify.notifySender = `${admission?.admissionAdminHead?.user}`;
      notify.notifyReceiever = `${user?._id}`;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      if (collect_docs?.length > 0) {
        for (let ele of collect_docs) {
          student.collect_docs.push({
            docs: ele?.docs,
            not_filled: ele?.not_filled,
          });
        }
      }
      await Promise.all([
        apply.save(),
        user.save(),
        status.save(),
        notify.save(),
        student.save(),
      ]);
      res.status(200).send({
        message: "Look like a party mood",
        docs_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        status.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      const studentName = `${student?.studentFirstName} ${
        student?.studentMiddleName ? student?.studentMiddleName : ""
      } ${student?.studentLastName}`;
      await whats_app_sms_payload(
        user?.userPhoneNumber,
        studentName,
        institute?.insName,
        null,
        "ASCAS",
        institute?.insType,
        student.admissionPaidFeeCount,
        student.admissionRemainFeeCount,
        institute?.sms_lang
      );
      if (user?.userEmail) {
        await email_sms_payload_query(
          user?.userEmail,
          studentName,
          institute,
          "ASCAS",
          institute?.insType,
          student.admissionPaidFeeCount,
          student.admissionRemainFeeCount,
          institute?.sms_lang
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.oneDepartmentAllClassMaster = async (req, res) => {
  try {
    if (!req.params.did)
      throw new "Please send to department id to perform task"();
    const department = await Department.findById(req.params.did)
      .populate({
        path: "departmentClassMasters",
        select: "className",
      })
      .select("departmentClassMasters")
      .lean()
      .exec();

    if (department.departmentClassMasters?.length) {
      res.status(200).send({
        message: "All list of class master of one department",
        classMasters: department.departmentClassMasters,
      });
    } else {
      res.status(200).send({
        message: "All list of class master of one department is empty",
        classMasters: [],
      });
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.renderNewAdminInquiry = async (req, res) => {
  try {
    const { aid } = req.params;
    const file = req.file;
    const { flow_status, uid } = req.query;
    var { sample_pic } = req.body;
    if (!aid && !flow_status)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately",
        access: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    });
    if (flow_status === "By Admission Admin") {
      const inquiry = new Inquiry({ ...req.body });
      if (sample_pic) {
        inquiry.inquiry_student_photo = sample_pic;
      }
      inquiry.inquiry_application = apply._id;
      inquiry.admissionAdmin = admission_admin._id;
      admission_admin.inquiryList.push(inquiry._id);
      admission_admin.queryCount += 1;
      await Promise.all([admission_admin.save(), inquiry.save()]);
      res.status(200).send({
        message: "New Inquiry By Admission Admin is Coming Ready to Handle",
        access: true,
      });
    } else if (flow_status === "By Existing User") {
      const user = await User.findById({ _id: uid });
      const inquiry = new Inquiry({ ...req.body });
      if (file) {
        var width = 200;
        var height = 200;
        var results = await uploadFile(file, width, height);
        inquiry.inquiry_student_photo = results.key;
      }
      inquiry.inquiry_application = apply._id;
      inquiry.admissionAdmin = admission_admin._id;
      admission_admin.inquiryList.push(inquiry._id);
      admission_admin.queryCount += 1;
      user.inquiryList.push(inquiry._id);
      await Promise.all([admission_admin.save(), inquiry.save(), user.save()]);
      res.status(200).send({
        message: "New Inquiry By Existing User is Coming Ready to Handle",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "You're lost in space contact to ISRO",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllInquiryQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { status, search, appId } = req.query;
    if (!aid && !status)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately",
        access: false,
      });
    const admission_admin = await Admission.findById({ _id: aid }).select(
      "inquiryList"
    );
    if (search) {
      var all_inquiry = await Inquiry.find({
        $and: [
          { _id: { $in: admission_admin?.inquiryList } },
          { inquiry_status: status },
          { inquiry_application: appId },
        ],
        $or: [{ inquiry_student_name: { $regex: search, $options: "i" } }],
      })
        .select(
          "inquiry_student_name inquiry_status inquiry_student_photo inquiry_student_city inquiry_student_message inquiry_student_email inquiry_student_mobileNo createdAt reviewAt"
        )
        .populate({
          path: "inquiry_application",
          select: "applicationName",
        });
    } else {
      var all_inquiry = await Inquiry.find({
        $and: [
          { _id: { $in: admission_admin?.inquiryList } },
          { inquiry_status: status },
          { inquiry_application: appId },
        ],
      })
        .limit(limit)
        .skip(skip)
        .select(
          "inquiry_student_name inquiry_status inquiry_student_photo inquiry_student_city inquiry_student_message inquiry_student_email inquiry_student_mobileNo createdAt reviewAt"
        )
        .populate({
          path: "inquiry_application",
          select: "applicationName",
        });
    }
    if (all_inquiry?.length > 0) {
      res.status(200).send({
        message:
          "Lot's of Inquiry Get Ready for Heavy Load Come up with Refreshment 😥",
        access: true,
        all_inquiry: all_inquiry,
      });
    } else {
      res.status(200).send({
        message: "No Heavy Load Enjoy 😀",
        access: false,
        all_inquiry: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneInquiryQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately",
        access: false,
      });
    const one_inquiry = await Inquiry.findById({
      _id: id,
    })
      .select(
        "inquiry_student_name inquiry_student_gender inquiry_student_dob inquiry_student_address inquiry_student_mobileNo inquiry_student_previous inquiry_student_remark reviewAt createdAt inquiry_student_photo createdAt"
      )
      .populate({
        path: "inquiry_application",
        select: "applicationName",
      });
    const custom_dob = age_calc(one_inquiry.inquiry_student_dob);
    const embed_inquiry = {
      one_inquiry: one_inquiry,
      custom_dob: `${custom_dob?.years} yrs, ${custom_dob?.months} m, ${custom_dob?.days} days`,
    };
    res.status(200).send({
      message: "One Inquiry All Details Read Carefully 😥",
      access: true,
      one_inquiry: embed_inquiry,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderRemarkInquiryQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    if (!id && !remark)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately",
        access: false,
      });
    const query = await Inquiry.findById({
      _id: id,
    });
    query.inquiry_student_remark = remark;
    query.inquiry_status = "Reviewed";
    query.reviewAt = new Date();
    await query.save();
    res.status(200).send({
      message: "Inquiry Reviewed Successfully 😂",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewDirectInquiry = async (req, res) => {
  try {
    const { id, aid } = req.params;
    const { sample_pic } = req.body;
    const file = req.file;
    if (
      !id &&
      !aid &&
      !req.body.inquiry_student_name &&
      !req.body.inquiry_student_gender &&
      !req.body.inquiry_student_dob &&
      !req.body.inquiry_student_address
    )
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const valid = await filter_unique_username(
      req.body.inquiry_student_name,
      req.body.inquiry_student_dob
    );
    if (!valid?.exist) {
      const genUserPass = bcrypt.genSaltSync(12);
      const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
      const uqid = universal_random_password();
      var user = new User({
        userLegalName: req.body.inquiry_student_name,
        userGender: req.body.inquiry_student_gender,
        userDateOfBirth: req.body.inquiry_student_dob,
        username: valid?.username,
        userStatus: "Approved",
        userPhoneNumber: id,
        userPassword: hashUserPass,
        photoId: "0",
        coverId: "2",
        remindLater: custom_date_time(21),
        next_date: custom_date_time(0),
      });
      const code = "qviple@161028520";
      const new_user_pass = bcrypt.genSaltSync(12);
      const hash_user_pass = bcrypt.hashSync(code, new_user_pass);
      user.user_normal_password = `${code}`;
      user.user_universal_password = `${hash_user_pass}`;
      var qvipleId = new QvipleId({});
      qvipleId.user = user?._id;
      qvipleId.qviple_id = `${uqid}`;
      admins.users.push(user);
      admins.userCount += 1;
      user.username_chat = await new_chat_username_unique(user?.userLegalName);
      await Promise.all([admins.save(), user.save(), qvipleId.save()]);
      var uInstitute = await InstituteAdmin.findOne({
        isUniversal: "Universal",
      })
        .select("id userFollowersList followersCount")
        .populate({ path: "posts" });
      if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
        const post = await Post.find({
          _id: { $in: uInstitute.posts },
          postStatus: "Anyone",
        });
        post.forEach(async (ele) => {
          user.userPosts.push(ele);
        });
        await user.save();
      }
      //
      await user_date_of_birth();
      //
      if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
      } else {
        uInstitute.userFollowersList.push(user._id);
        uInstitute.followersCount += 1;
        user.userInstituteFollowing.push(uInstitute._id);
        user.followingUICount += 1;
        await Promise.all([uInstitute.save(), user.save()]);
        const posts = await Post.find({ author: `${uInstitute._id}` });
        posts.forEach(async (ele) => {
          ele.authorFollowersCount = uInstitute.followersCount;
          await ele.save();
        });
      }
      const apply = await NewApplication.findById({ _id: aid });
      const admission_admin = await Admission.findById({
        _id: `${apply?.admissionAdmin}`,
      });
      const inquiry = new Inquiry({ ...req.body });
      if (file) {
        var width = 200;
        var height = 200;
        var results = await uploadFile(file, width, height);
        inquiry.inquiry_student_photo = results.key;
        user.profilePhoto = results.key;
      }
      if (sample_pic) {
        user.profilePhoto = sample_pic;
        inquiry.inquiry_student_photo = sample_pic;
      }
      inquiry.inquiry_application = apply._id;
      inquiry.admissionAdmin = admission_admin._id;
      admission_admin.inquiryList.push(inquiry._id);
      admission_admin.queryCount += 1;
      user.inquiryList.push(inquiry._id);
      await Promise.all([admission_admin.save(), inquiry.save(), user.save()]);
      const token = generateAccessToken(
        user?.username,
        user?._id,
        user?.userPassword
      );
      res.status(200).send({
        message:
          "Account Creation Process Completed New Inquiry is Coming Ready to Handle 😀✨",
        user,
        token: `Bearer ${token}`,
        login: true,
      });
    } else {
      res.status(200).send({
        message: "Bug in the direct joining process 😡",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAppEditQuery = async (req, res) => {
  try {
    const { appId } = req.params;
    if (!appId)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😡",
        access: false,
      });
    await NewApplication.findByIdAndUpdate(appId, req.body);
    res
      .status(200)
      .send({ message: "You fixed your mistake 😁", access: true });
  } catch (e) {
    console.log(e);
  }
};

const nested_function_app = async (arg) => {
  var flag = false;
  if (arg?.receievedApplication?.length > 0) {
    flag = true;
  } else if (arg?.selectedApplication?.length > 0) {
    flag = true;
  } else if (arg?.confirmedApplication?.length > 0) {
    flag = true;
  } else if (arg?.allottedApplication?.length > 0) {
    flag = true;
  } else if (arg?.cancelApplication?.length > 0) {
    flag = true;
  } else {
    flag = false;
  }
  return flag;
};

exports.renderAppDeleteQuery = async (req, res) => {
  try {
    const { aid, appId } = req.params;
    if (!appId && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately 😡",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid });
    const ads_app = await NewApplication.findById({ _id: appId });
    const institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    const post = await Post.findOne({ new_application: ads_app?._id });
    const flag_status = await nested_function_app(ads_app);
    if (flag_status) {
      res.status(200).send({
        message:
          "Deletion Operation Denied Some Student Already Applied for this Application 😥",
        access: false,
      });
    } else {
      ads_admin.newApplication.pull(ads_app?._id);
      if (ads_admin?.newAppCount > 0) {
        ads_admin.newAppCount -= 1;
      }
      if (institute?.postCount > 0) {
        institute.postCount -= 1;
      }
      if (institute.admissionCount > 0) {
        institute.admissionCount -= 1;
      }
      institute.posts.pull(post?._id);
      await Promise.all([institute.save(), ads_admin.save()]);
      if (ads_app?.applicationPhoto) {
        await deleteFile(ads_app?.applicationPhoto);
      }
      if (post) {
        await Post.findByIdAndDelete(post?._id);
      }
      await NewApplication.findByIdAndDelete(ads_app?._id);
      res
        .status(200)
        .send({ message: "Deletion Operation Completed 😁", access: true });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllReceiptsQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { filter_by, over_filter, search } = req.query;
    if (!aid && !filter_by)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    if (over_filter) {
      var filter_depart = await Department.findById({
        _id: over_filter,
      })
        .select("_id dName bank_account")
        .populate({
          path: "bank_account",
          select: "finance_bank_name",
        });
      if (filter_by === "ALL_REQUEST") {
        if (search) {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_request")
            .populate({
              path: "fee_receipt_request",
              populate: {
                path: "receipt",
                match: {
                  fee_utr_reference: { $regex: search, $options: "i" },
                },
                populate: {
                  path: "student application",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationDepartment",
                },
              },
            });
        } else {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_request")
            .populate({
              path: "fee_receipt_request",
              populate: {
                path: "receipt",
                populate: {
                  path: "student application",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationDepartment",
                },
              },
            });
        }
        var receipt_request = ads_admin?.fee_receipt_request?.filter((ref) => {
          if (
            `${ref?.receipt?.application?.applicationDepartment}` ===
            `${filter_depart?._id}`
          )
            return ref;
        });

        var all_requests = await nested_document_limit(
          page,
          limit,
          receipt_request
        );
      } else if (filter_by === "ALL_APPROVE") {
        if (search) {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_approve")
            .populate({
              path: "fee_receipt_approve",
              populate: {
                path: "receipt",
                match: {
                  fee_utr_reference: { $regex: search, $options: "i" },
                },
                populate: {
                  path: "student application",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationDepartment",
                },
              },
            });
        } else {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_approve")
            .populate({
              path: "fee_receipt_approve",
              populate: {
                path: "receipt",
                populate: {
                  path: "student application",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationDepartment",
                },
              },
            });
        }

        var receipt_approve = ads_admin?.fee_receipt_approve?.filter((ref) => {
          if (
            `${ref?.receipt?.application?.applicationDepartment}` ===
            `${filter_depart?._id}`
          )
            return ref;
        });

        var all_requests = await nested_document_limit(
          page,
          limit,
          receipt_approve
        );
      } else if (filter_by === "ALL_REJECT") {
        if (search) {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_reject")
            .populate({
              path: "fee_receipt_reject",
              populate: {
                path: "receipt",
                match: {
                  fee_utr_reference: { $regex: search, $options: "i" },
                },
                populate: {
                  path: "student application",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationDepartment",
                },
              },
            });
        } else {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_reject")
            .populate({
              path: "fee_receipt_reject",
              populate: {
                path: "receipt",
                populate: {
                  path: "student application",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto applicationDepartment",
                },
              },
            });
        }

        var receipt_reject = ads_admin?.fee_receipt_reject?.filter((ref) => {
          if (
            `${ref?.receipt?.application?.applicationDepartment}` ===
            `${filter_depart?._id}`
          )
            return ref;
        });

        var all_requests = await nested_document_limit(
          page,
          limit,
          receipt_reject
        );
      } else {
        var all_requests = [];
      }
    } else {
      if (filter_by === "ALL_REQUEST") {
        if (search) {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_request")
            .populate({
              path: "fee_receipt_request",
              populate: {
                path: "receipt",
                match: {
                  fee_utr_reference: { $regex: search, $options: "i" },
                },
                populate: {
                  path: "student",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
                },
              },
            });
        } else {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_request")
            .populate({
              path: "fee_receipt_request",
              populate: {
                path: "receipt",
                populate: {
                  path: "student",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
                },
              },
            });
        }
        var receipt_request = ads_admin?.fee_receipt_request?.filter((ref) => {
          if (ref?.receipt !== null) return ref;
        });
        var all_requests = await nested_document_limit(
          page,
          limit,
          receipt_request
        );
      } else if (filter_by === "ALL_APPROVE") {
        if (search) {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_approve")
            .populate({
              path: "fee_receipt_approve",
              populate: {
                path: "receipt",
                match: {
                  fee_utr_reference: { $regex: search, $options: "i" },
                },
                populate: {
                  path: "student",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
                },
              },
            });
        } else {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_approve")
            .populate({
              path: "fee_receipt_approve",
              populate: {
                path: "receipt",
                populate: {
                  path: "student",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
                },
              },
            });
        }
        var receipt_approve = ads_admin?.fee_receipt_approve?.filter((ref) => {
          if (ref?.receipt !== null) return ref;
        });
        var all_requests = await nested_document_limit(
          page,
          limit,
          receipt_approve
        );
      } else if (filter_by === "ALL_REJECT") {
        if (search) {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_reject")
            .populate({
              path: "fee_receipt_reject",
              populate: {
                path: "receipt",
                match: {
                  fee_utr_reference: { $regex: search, $options: "i" },
                },
                populate: {
                  path: "student",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
                },
              },
            });
        } else {
          var ads_admin = await Admission.findById({ _id: aid })
            .select("fee_receipt_reject")
            .populate({
              path: "fee_receipt_reject",
              populate: {
                path: "receipt",
                populate: {
                  path: "student",
                  select:
                    "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
                },
              },
            });
        }
        var receipt_reject = ads_admin?.fee_receipt_reject?.filter((ref) => {
          if (ref?.receipt !== null) return ref;
        });
        var all_requests = await nested_document_limit(
          page,
          limit,
          receipt_reject
        );
      } else {
        var all_requests = [];
      }
    }
    if (all_requests?.length > 0) {
      res.status(200).send({
        message: "Lot's of Receipts Available",
        access: true,
        all_requests: all_requests,
        count: all_requests?.length,
        department_account: filter_depart ? filter_depart : null,
      });
    } else {
      res.status(200).send({
        message: "No Receipts Available",
        access: false,
        all_requests: [],
        count: 0,
        department_account: null,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneReceiptStatus = async (req, res) => {
  try {
    const { aid, rid } = req.params;
    const { status, reqId } = req.query;
    const { reason } = req.body;
    // console.log(status);
    if (!aid && !rid && !reqId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var ads_admin = await Admission.findById({ _id: aid }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var one_receipt = await FeeReceipt.findById({ _id: rid }).populate({
      path: "student",
      select: "user",
    });
    var student = await Student.findById({
      _id: `${one_receipt?.student?._id}`,
    }).populate({
      path: "fee_structure",
    });
    var user = await User.findById({ _id: `${student?.user}` });
    var one_app = await NewApplication.findById({
      _id: `${one_receipt?.application}`,
    });
    var one_status = await Status.findOne({
      receipt: one_receipt?._id,
    });
    var remaining_lists = await RemainingList.findOne({
      $and: [{ student: student?._id }, { appId: one_app?._id }],
    });
    if (status === "Approved") {
      for (var ele of ads_admin?.fee_receipt_request) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_request.pull(reqId);
          if (ads_admin?.fee_receipt_request_count > 0) {
            ads_admin.fee_receipt_request_count -= 1;
          }
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_approve.push({
        receipt: one_receipt?._id,
        status: "Approved",
      });
      ads_admin.fee_receipt_approve_count += 1;
      if (one_status) {
        one_status.receipt_status = "Approved";
      }
      if (remaining_lists) {
        for (var ref of remaining_lists?.remaining_array) {
          if (`${ref?._id}` == `${one_receipt?.fee_request_remain_card}`) {
            ref.status = "Not Paid";
            ref.reject_reason = null;
          }
        }
        await remaining_lists.save();
      }
      one_receipt.fee_request_remain_card = "";
      await one_receipt.save();
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "offline";
        }
      }
      await one_app.save();
    } else if (status === "Rejected") {
      for (var ele of ads_admin?.fee_receipt_request) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_request.pull(reqId);
          if (ads_admin?.fee_receipt_request_count > 0) {
            ads_admin.fee_receipt_request_count -= 1;
          }
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_reject.push({
        receipt: one_receipt?._id,
        status: "Rejected",
        reason: reason,
      });
      ada_admin.fee_receipt_reject_count += 1;
      if (remaining_lists) {
        for (var ref of remaining_lists?.remaining_array) {
          if (`${ref?._id}` == `${one_receipt?.fee_request_remain_card}`) {
            ref.status = "Receipt Rejected";
            ref.reject_reason = reason;
          }
        }
        await remaining_lists.save();
      }

      one_receipt.reason = reason;
      if (one_status) {
        one_status.receipt_status = "Rejected";
      }
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "Receipt Rejected";
        }
      }
      await Promise.all([one_receipt.save(), one_app.save()]);
    } else if (status === "Over_Rejection") {
      for (var ele of ads_admin?.fee_receipt_reject) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_reject.pull(reqId);
          if (ads_admin?.fee_receipt_request_count > 0) {
            ads_admin.fee_receipt_request_count -= 1;
          }
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_approve.push({
        receipt: one_receipt?._id,
        status: "Approved",
        over_status: "After Rejection Approved By Admission Admin",
      });
      ads_admin.fee_receipt_approve_count += 1;
      if (one_status) {
        one_status.receipt_status = "Approved";
      }
      one_receipt.re_apply = false;
      if (remaining_lists) {
        for (var ref of remaining_lists?.remaining_array) {
          if (`${ref?._id}` == `${one_receipt?.fee_request_remain_card}`) {
            ref.status = "Not Paid";
            ref.reject_reason = null;
          }
        }
        await remaining_lists.save();
      }
      one_receipt.fee_request_remain_card = "";
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "offline";
        }
      }
      await Promise.all([one_receipt.save(), one_app.save()]);
    } else if (status === "Rejection_Notify") {
      if (one_status) {
        one_status.receipt_status = "Rejected";
      }
      one_receipt.re_apply = false;
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "Receipt Rejected";
        }
      }
      for (var ele of ads_admin?.fee_receipt_reject) {
        if (`${ele._id}` === `${reqId}`) {
          ele.reason = reason;
        }
      }
      if (remaining_lists) {
        for (var ref of remaining_lists?.remaining_array) {
          if (`${ref?._id}` == `${one_receipt?.fee_request_remain_card}`) {
            ref.status = "Receipt Rejected";
            ref.reject_reason = reason;
          }
        }
        await remaining_lists.save();
      }
      one_receipt.reason = reason;
      await Promise.all([one_receipt.save(), one_app.save()]);
      const notify = new StudentNotification({});
      notify.notifyContent = `Your Receipt was cancelled By Admission Admin`;
      notify.notifySender = ads_admin?.admissionAdminHead?.user;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = one_receipt?.student?._id;
      user.activity_tab.push(notify._id);
      notify.notifyByAdmissionPhoto = ads_admin._id;
      notify.notifyCategory = "Receipt Reject";
      notify.redirectIndex = 28;
      invokeMemberTabNotification(
        "Admission Status",
        `Payment Receipt Reject`,
        "Application Status",
        user._id,
        user.deviceToken
      );
      await Promise.all([user.save(), notify.save()]);
    } else {
    }
    if (one_status) {
      await Promise.all([ads_admin.save(), one_status.save(), one_app.save()]);
    } else {
      await Promise.all([ads_admin.save(), one_app.save()]);
    }
    res
      .status(200)
      .send({ message: `Receipts ${status} by Admission Admin`, access: true });

    // console.log(one_receipt?.fee_payment_type);
    var valid_receipt = await handle_undefined(one_receipt?.fee_payment_type);
    if (
      (status === "Approved" || status === "Over_Rejection") &&
      valid_receipt != ""
    ) {
      console.log("In Exist Fee Receipt", valid_receipt);
      const pay_mode =
        one_receipt?.fee_payment_mode === "By Cash" ? "Offline" : "Online";
      await request_mode_query_by_student(
        ads_admin?._id,
        student?._id,
        one_app?._id,
        one_receipt?.fee_payment_amount,
        pay_mode,
        one_receipt?.fee_payment_type,
        one_receipt?._id
      );
    } else if (status === "Approved" || status === "Over_Rejection") {
      var is_install;
      console.log("In Without Fee Receipt");
      var price = one_receipt?.fee_payment_amount;
      var mode =
        one_receipt?.fee_payment_mode === "By Cash" ? "Offline" : "Online";
      var total_amount = await add_total_installment(student);
      const notify = new StudentNotification({});
      if (
        price <= student?.fee_structure?.total_admission_fees &&
        price <= student?.fee_structure?.one_installments?.fees
      ) {
        is_install = true;
      } else {
        is_install = false;
      }
      if (price > 0 && is_install) {
        ads_admin.remainingFee.push(student._id);
        student.admissionRemainFeeCount += total_amount - price;
        one_app.remainingFee += total_amount - price;
        ads_admin.remainingFeeCount += total_amount - price;
        var new_remainFee = new RemainingList({
          appId: one_app._id,
          applicable_fee: total_amount,
          institute: institute?._id,
        });
        new_remainFee.access_mode_card = "Installment_Wise";
        new_remainFee.remaining_array.push({
          remainAmount: price,
          appId: one_app._id,
          status: "Paid",
          instituteId: institute._id,
          installmentValue: "First Installment",
          mode: mode,
          isEnable: true,
          fee_receipt: one_receipt?._id,
        });
        new_remainFee.active_payment_type = "First Installment";
        new_remainFee.paid_fee += price;
        new_remainFee.fee_structure = student?.fee_structure?._id;
        new_remainFee.remaining_fee += total_amount - price;
        student.remainingFeeList.push(new_remainFee?._id);
        student.remainingFeeList_count += 1;
        new_remainFee.student = student?._id;
        new_remainFee.fee_receipts.push(one_receipt?._id);
        if (new_remainFee.remaining_fee > 0) {
          await add_all_installment(
            one_app,
            institute._id,
            new_remainFee,
            price,
            student
          );
        }
        if (
          new_remainFee.remaining_fee > 0 &&
          `${student?.fee_structure?.total_installments}` === "1"
        ) {
          new_remainFee.remaining_array.push({
            remainAmount: new_remainFee?.remaining_fee,
            appId: one_app._id,
            instituteId: institute._id,
            installmentValue: "Installment Remain",
            isEnable: true,
          });
        }
      } else if (price > 0 && !is_install) {
        var new_remainFee = new RemainingList({
          appId: one_app._id,
          applicable_fee: student?.fee_structure?.total_admission_fees,
          institute: institute?._id,
        });
        new_remainFee.access_mode_card = "One_Time_Wise";
        new_remainFee.remaining_array.push({
          remainAmount: price,
          appId: one_app._id,
          status: "Paid",
          instituteId: institute._id,
          installmentValue: "One Time Fees",
          mode: mode,
          isEnable: true,
          fee_receipt: one_receipt?._id,
        });
        new_remainFee.active_payment_type = "One Time Fees";
        new_remainFee.paid_fee += price;
        new_remainFee.fee_structure = student?.fee_structure?._id;
        new_remainFee.remaining_fee +=
          student?.fee_structure?.total_admission_fees - price;
        student.remainingFeeList.push(new_remainFee?._id);
        student.remainingFeeList_count += 1;
        new_remainFee.student = student?._id;
        new_remainFee.fee_receipts.push(one_receipt?._id);
        ads_admin.remainingFee.push(student._id);
        student.admissionRemainFeeCount +=
          student?.fee_structure?.total_admission_fees - price;
        one_app.remainingFee +=
          student?.fee_structure?.total_admission_fees - price;
        ads_admin.remainingFeeCount +=
          student?.fee_structure?.total_admission_fees - price;
        const valid_one_time_fees =
          student?.fee_structure?.total_admission_fees - price == 0
            ? true
            : false;
        if (valid_one_time_fees) {
          ads_admin.remainingFee.pull(student._id);
        } else {
          new_remainFee.remaining_array.push({
            remainAmount: student?.fee_structure?.total_admission_fees - price,
            appId: one_app._id,
            status: "Not Paid",
            instituteId: institute._id,
            installmentValue: "One Time Fees Remain",
            isEnable: true,
          });
        }
      }
      if (mode === "Offline") {
        ads_admin.offlineFee += price;
        one_app.collectedFeeCount += price;
        one_app.offlineFee += price;
        ads_admin.collected_fee += price;
        finance.financeAdmissionBalance += price;
        finance.financeTotalBalance += price;
        finance.financeSubmitBalance += price;
      } else if (mode === "Online") {
        ads_admin.onlineFee += price;
        one_app.collectedFeeCount += price;
        one_app.onlineFee += price;
        finance.financeAdmissionBalance += price;
        finance.financeTotalBalance += price;
        finance.financeBankBalance += price;
      } else {
      }
      if (one_receipt?.fee_payment_mode === "Government/Scholarship") {
        // New Logic
      } else {
        await set_fee_head_query_redesign(
          student,
          one_receipt?.fee_payment_amount,
          one_app?._id,
          one_receipt
        );
        // await set_fee_head_query(student, price, one_app, one_receipt);
      }
      if (is_install) {
        one_app.confirmedApplication.push({
          student: student._id,
          payment_status: mode,
          install_type: "First Installment Paid",
          fee_remain: total_amount - price,
        });
      } else {
        one_app.confirmedApplication.push({
          student: student._id,
          payment_status: mode,
          install_type: "One Time Fees Paid",
          fee_remain: student?.fee_structure?.total_admission_fees - price,
        });
      }
      for (let app of one_app?.selectedApplication) {
        if (`${app.student}` === `${student._id}`) {
          one_app.selectedApplication.pull(app?._id);
        } else {
        }
      }
      one_app.confirmCount += 1;
      student.admissionPaidFeeCount += price;
      student.paidFeeList.push({
        paidAmount: price,
        appId: one_app._id,
      });
      const status = new Status({});
      const order = new OrderPayment({});
      order.payment_module_type = "Admission Fees";
      order.payment_to_end_user_id = institute?._id;
      order.payment_by_end_user_id = user._id;
      order.payment_module_id = one_app._id;
      order.payment_amount = price;
      order.payment_status = "Captured";
      order.payment_flag_to = "Credit";
      order.payment_flag_by = "Debit";
      order.payment_mode = mode;
      order.payment_admission = one_app._id;
      order.payment_from = student._id;
      order.payment_student = student?._id;
      order.payment_student_name = student?.valid_full_name;
      order.payment_student_gr = student?.studentGRNO;
      institute.invoice_count += 1;
      order.payment_invoice_number = one_receipt?.invoice_count;
      user.payment_history.push(order._id);
      order.fee_receipt = one_receipt?._id;
      institute.payment_history.push(order._id);
      status.content = `Your seat has been confirmed, You will be alloted your class shortly, Stay Updated!`;
      status.group_by = "Admission_Confirmation";
      status.applicationId = one_app._id;
      user.applicationStatus.push(status._id);
      status.instituteId = institute._id;
      status.fee_receipt = one_receipt?._id;
      status.document_visible = false;
      notify.notifyContent = `Your seat has been confirmed, You will be alloted your class shortly, Stay Updated!`;
      notify.notifySender = ads_admin?.admissionAdminHead?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      notify.fee_receipt = one_receipt?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = ads_admin?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      await Promise.all([
        ads_admin.save(),
        one_app.save(),
        student.save(),
        finance.save(),
        user.save(),
        order.save(),
        institute.save(),
        s_admin.save(),
        new_remainFee.save(),
        one_receipt.save(),
        status.save(),
        notify.save(),
      ]);
      invokeMemberTabNotification(
        "Admission Status",
        status.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneReceiptReApply = async (req, res) => {
  try {
    const { sid, rid } = req.params;
    const { delete_pic } = req.query;
    const { transaction_date } = req.body;
    const image = await handle_undefined(delete_pic);
    if (!sid && !rid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_receipt = await FeeReceipt.findByIdAndUpdate(rid, req.body);
    one_receipt.fee_transaction_date = new Date(`${transaction_date}`);
    if (image) {
      await deleteFile(image);
    }
    const one_app = await NewApplication.findById({
      _id: `${one_receipt?.application}`,
    });
    const ads_admin = await Admission.findById({
      _id: `${one_app?.admissionAdmin}`,
    }).select("fee_receipt_reject");
    var status = await Status.findOne({ receipt: one_receipt?._id });
    if (status) {
      status.receipt_status = "Requested";
    } else {
      var student = await Student.findById({ _id: sid });
      if (student) {
        var remaining_lists = await RemainingList.findOne({
          $and: [{ student: student?._id }, { appId: one_app?._id }],
        });
      }
    }
    one_receipt.re_apply = true;
    if (remaining_lists) {
      for (var ref of remaining_lists?.remaining_array) {
        if (`${ref?._id}` == `${one_receipt?.fee_request_remain_card}`) {
          ref.status = "Receipt Requested";
        }
      }
    }
    if (status) {
      await Promise.all([status.save(), one_receipt.save()]);
    } else if (remaining_lists) {
      await Promise.all([remaining_lists.save(), one_receipt.save()]);
    } else {
    }
    res
      .status(200)
      .send({ message: "Your Receipts Under Processing", access: true });
    if (status) {
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "Receipt Requested";
        }
      }
      await one_app.save();
    }
    for (var all of ads_admin?.fee_receipt_reject) {
      if (`${all?.receipt}` === `${one_receipt?._id}`) {
        ads_admin.fee_receipt_reject.pull(all?._id);
        ads_admin.fee_receipt_reject.unshift({
          receipt: one_receipt?._id,
          status: "Rejected",
        });
      }
    }
    await ads_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderTriggerAlarmQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { alarm_mode } = req.query;
    const { all_arr, title, doc, content } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid }).select(
      "alarm_count institute"
    );
    var all_student = await Student.find({ _id: { $in: all_arr } })
      .select(
        "studentFirstName studentMiddleName studentLastName valid_full_name"
      )
      .populate({
        path: "user",
        select: "deviceToken userEmail",
      })
      .populate({
        path: "institute",
        select: "insName",
      });

    // if (alarm_count > 3) {
    //   res.status(200).send({
    //     message:
    //       "You have only three attempts of sending notification to students for more contact Qviple",
    //     access: false,
    //   });
    // } else {
    if (alarm_mode === "APP_NOTIFICATION") {
      await dueDateAlarm(aid, alarm_mode, content, all_student, title, doc);
    } else if (alarm_mode === "EMAIL_NOTIFICATION") {
      await dueDateAlarm(aid, alarm_mode, content, all_student, title, doc);
    } else if (alarm_mode === "SMS_NOTIFICATION") {
    } else {
    }
    // ads_admin.alarm_count += 1;
    // await ads_admin.save();
    // remaining ${ads_admin.alarm_count} attempts
    res.status(200).send({
      message: `Fees Alarm is triggered successfully`,
      access: true,
      alarm_mode,
    });
    // }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdminSelectMode = async (req, res) => {
  try {
    const { aid, sid } = req.params;
    if (!aid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const apply = await NewApplication.findById({ _id: aid }).select(
      "selectedApplication admissionAdmin"
    );
    const student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });
    const aStatus = new Status({});
    const status = await Status.findOne({
      $and: [{ _id: student?.active_status }, { applicationId: apply?._id }],
    });
    const user = await User.findById({ _id: `${student.user}` });
    var admin_ins = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    const notify = new StudentNotification({});
    const institute = await InstituteAdmin.findById({
      _id: `${admin_ins?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart?.[0]}`,
    });
    if (status) {
      if (apply?.selectedApplication?.length > 0) {
        apply?.selectedApplication?.forEach((ele) => {
          if (`${ele.student}` === `${student._id}`) {
            ele.payment_status = "offline";
          }
        });
        await apply.save();
      }
      status.payMode = "offline";
      status.sub_payment_mode = "By Cash";
      status.isPaid = "Not Paid";
      status.docs_status = "Yes";
      status.for_docs = "Yes";
      // status.for_selection = "No";
      aStatus.admission_process = "Yes";
      aStatus.content = `Your admission process has been started. 

Visit ${institute?.insName} with required documents (Click to view Documents) and applicable fees Rs.${student?.fee_structure?.applicable_fees} (Click to view in detail).
          
Payment modes available:`;
      aStatus.feeStructure = student?.fee_structure?._id;
      aStatus.document_visible = true;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      aStatus.studentId = student._id;
      aStatus.student = student?._id;
      aStatus.finance = finance?._id;
      aStatus.admissionFee = student?.fee_structure.total_admission_fees;
      notify.notifyContent = `Your admission is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees. or contact institute if neccessory`;
      notify.notifySender = admin_ins?.admissionAdminHead?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admin_ins?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      // student.active_status.pull(status?._id);
      await Promise.all([
        status.save(),
        aStatus.save(),
        user.save(),
        notify.save(),
        // student.save(),
      ]);
      res.status(200).send({
        message: "Lets do some excercise visit institute",
        access: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
    } else {
      res.status(200).send({
        message: "You lost in space",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdminStudentCancelSelectQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    const notify = new StudentNotification({});
    const aStatus = await Status.findOne({
      $and: [{ _id: student?.active_status }, { applicationId: apply?._id }],
    });
    for (let app of apply.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.selectedApplication.pull(app._id);
      } else {
      }
    }
    for (let app of admission_admin.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        admission_admin.selectedApplication.pull(app._id);
      } else {
      }
    }
    if (apply.selectCount > 0) {
      apply.selectCount -= 1;
    }
    aStatus.isPaid = "Not Paid";
    aStatus.for_selection = "No";
    status.content = `You admission is cancelled for ${apply.applicationName}. Due to no further activity `;
    status.applicationId = apply._id;
    status.studentId = student._id;
    status.student = student?._id;
    user.applicationStatus.push(status._id);
    status.instituteId = admission_admin?.institute;
    notify.notifyContent = `You admission is cancelled for ${apply.applicationName}. Due to no further activity`;
    notify.notifySender = admission_admin?.admissionAdminHead?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByAdmissionPhoto = admission_admin?._id;
    notify.notifyCategory = "Status Alert";
    notify.redirectIndex = 29;
    // student.active_status.pull(aStatus?._id);
    await Promise.all([
      apply.save(),
      // student.save(),
      user.save(),
      status.save(),
      aStatus.save(),
      notify.save(),
      admission_admin.save(),
    ]);
    res.status(200).send({
      message: `Best of luck for next time 😥`,
      cancel_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderInstituteCompletedAppQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { search } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });

    const ads_admin = await Admission.findById({
      _id: aid,
    }).select("newApplication");

    const all_completed = await NewApplication.find({
      $and: [
        { _id: { $in: ads_admin?.newApplication } },
        { applicationStatus: "Completed" },
      ],
      $or: [{ applicationName: { $regex: search, $options: "i" } }],
    }).select(
      "applicationName applicationDepartment applicationMaster applicationBatch"
    );
    if (all_completed?.length > 0) {
      res.status(200).send({
        message: "Explore All Completed Array",
        access: true,
        all_completed: all_completed,
      });
    } else {
      res.status(200).send({
        message: "Explore All Completed Array",
        access: false,
        all_completed: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEditStudentFeeStructureQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { fee_struct, staffId } = req.body;
    if (!sid && !aid && !fee_struct)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const student = await Student.findById({ _id: sid });
    const remain_list = await RemainingList.findOne({
      $and: [
        { _id: { $in: student?.remainingFeeList } },
        { appId: apply?._id },
      ],
    });
    const structure = await FeeStructure.findById({ _id: fee_struct });
    const status = await Status.find({
      $and: [
        { applicationId: apply?._id },
        { structure_edited: "Edited" },
        { studentId: `${student?._id}` },
      ],
    });
    // console.log(status)
    var flag = false;
    if (remain_list) {
      for (var ref of remain_list?.remaining_array) {
        if (`${ref?.appId}` === `${apply?._id}` && ref.status === "Paid") {
          flag = true;
          break;
        } else {
          flag = false;
        }
      }
    }
    if (flag) {
      res.status(200).send({
        message: `Student Already Paid the Fees Sorry Structure Change is not possible`,
        access: true,
      });
    } else {
      for (let app of apply.selectedApplication) {
        if (`${app.student}` === `${student._id}`) {
          app.fee_remain = structure.total_admission_fees;
        }
      }
      for (var ref of status) {
        ref.admissionFee = structure.total_admission_fees;
        ref.feeStructure = structure?._id;
        await ref.save();
      }
      student.fee_structure = structure?._id;
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "assign_by",
      });
      await Promise.all([apply.save(), student.save()]);
      res.status(200).send({
        message: `congrats for new fee structure `,
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAddDocumentQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { doc_name, doc_key, applicable_to } = req.body;
    if (!aid && !doc_name && !doc_key)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid });
    const new_doc = new RequiredDocument({ ...req?.body });
    ads_admin.required_document.push(new_doc?._id);
    ads_admin.required_document_count += 1;
    new_doc.admission = ads_admin?._id;
    await Promise.all([ads_admin.save(), new_doc.save()]);
    res.status(200).send({
      message: "New Document Added to Required Document",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllDocumentArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid }).select(
      "required_document"
    );

    const all_doc = await RequiredDocument.find({
      _id: { $in: ads_admin?.required_document },
    })
      .limit(limit)
      .skip(skip);

    if (all_doc?.length > 0) {
      res.status(200).send({
        message: "Explore All Documents",
        access: true,
        all_docs: all_doc,
        count: ads_admin?.required_document?.length,
      });
    } else {
      res.status(200).send({
        message: "No Document Available",
        access: false,
        all_docs: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEditDocumentQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { doc } = req.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    await RequiredDocument.findByIdAndUpdate(doc, req?.body);
    res.status(200).send({
      message: "Document Updated",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDeleteExistingDocument = async (req, res) => {
  try {
    const { aid, docId } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid });

    const docs = await RequiredDocument.findById({ _id: docId });
    ads_admin.required_document.pull(docs?._id);
    if (ads_admin?.required_document_count > 0) {
      ads_admin.required_document_count -= 1;
    }
    await ads_admin.save();
    await RequiredDocument.findByIdAndDelete(docs?._id);
    res.status(200).send({
      message: "Deletion Operation Completed",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderRefundArrayQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { search } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (search) {
      var filter_refund = [];
      var ads_admin = await Admission.findById({ _id: aid })
        .select("refundCount")
        .populate({
          path: "refundFeeList",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: search, $options: "i" },
              // studentGRNO: { $regex: search, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO remainingFeeList refund",
            populate: {
              path: "remainingFeeList",
              select: "applicable_card government_card",
              populate: {
                path: "applicable_card government_card",
                select: "paid_fee applicable_fee",
              },
            },
          },
        });
      for (let data of ads_admin?.refundFeeList) {
        if (data.student !== null) {
          filter_refund.push(data);
        }
      }
      var all_refund_list = [...filter_refund];
    } else {
      var ads_admin = await Admission.findById({ _id: aid })
        .select("refundCount")
        .populate({
          path: "refundFeeList",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO remainingFeeList refund",
            populate: {
              path: "remainingFeeList",
              select: "applicable_card government_card",
              populate: {
                path: "applicable_card government_card",
                select: "paid_fee applicable_fee",
              },
            },
          },
        });
      var filter_refund = [];
      for (let data of ads_admin?.refundFeeList) {
        if (data.student !== null) {
          filter_refund.push(data);
        }
      }

      var all_refund_list = [...filter_refund];
    }
    var total = 0;
    if (all_refund_list?.length > 0) {
      for (var stu of all_refund_list) {
        if (stu?.student?.remainingFeeList?.length > 0) {
          for (var val of stu?.student?.remainingFeeList) {
            stu.student.refund +=
              (val?.applicable_card?.paid_fee >
              val?.applicable_card?.applicable_fee
                ? val?.applicable_card?.paid_fee -
                  val?.applicable_card?.applicable_fee
                : 0) +
              (val?.government_card?.paid_fee >
              val?.government_card?.applicable_fee
                ? val?.government_card?.paid_fee -
                  val?.government_card?.applicable_fee
                : 0);
          }
          stu.refund = stu.student.refund;
          total += stu.student.refund;
        }
      }
      let nest_list = all_refund_list?.filter((val) => {
        if (val?.refund > 0) return val;
      });
      let nest_lists = await nested_document_limit(
        page,
        limit,
        nest_list?.reverse()
      );
      // ads_admin.refundCount = total
      // await ads_admin.save()
      res.status(200).send({
        message: "Explore All Returns",
        access: true,
        all_refund_list: nest_lists,
        refundCount: total,
        array: nest_lists?.length,
      });
    } else {
      res.status(200).send({
        message: "No Returns",
        access: false,
        all_refund_list: [],
        refundCount: total,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.paidRemainingFeeStudentFinanceQuery = async (req, res) => {
  try {
    const { sid, appId } = req.params;
    const { amount, mode, type, rid } = req.body;
    if (!sid && !appId && !amount && !mode && !type)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    var extra_price = 0;
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });

    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var apply = await NewApplication.findById({ _id: appId });
    var admin_ins = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.receipt_generated_from = "BY_ADMISSION";
    new_receipt.scholarship_status = "MARK_AS_SCHOLARSHIP";
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    const notify = new StudentNotification({});
    const remaining_fee_lists = await RemainingList.findById({
      _id: rid,
    }).populate({
      path: "applicable_card",
    });
    new_receipt.fee_structure = remaining_fee_lists?.fee_structure;
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    if (req?.body?.fee_payment_mode === "Government/Scholarship") {
      finance.government_receipt.push(new_receipt?._id);
      finance.financeGovernmentScholarBalance += price;
      finance.scholarship_candidates.push(new_receipt?._id);
      finance.scholarship_candidates_count += 1;

      finance.government_receipt_count += 1;
      // if (price >= remaining_fee_lists?.remaining_fee) {
      //   extra_price += price - remaining_fee_lists?.remaining_fee;
      //   price = remaining_fee_lists?.remaining_fee;
      //   remaining_fee_lists.paid_fee += extra_price;
      //   student.admissionPaidFeeCount += extra_price;
      //   for (var stu of student.paidFeeList) {
      //     if (`${stu.appId}` === `${apply._id}`) {
      //       stu.paidAmount += extra_price;
      //     }
      //   }
      //   // await remain_one_time_query_government(
      //   //   admin_ins,
      //   //   remaining_fee_lists,
      //   //   apply,
      //   //   institute,
      //   //   student,
      //   //   price + extra_price,
      //   //   new_receipt
      //   // );
      // }
      // else {
      //   if (type === "One Time Fees Remain") {
      //   } else {
      //     // await remain_government_installment(
      //     //   admin_ins,
      //     //   remaining_fee_lists,
      //     //   apply,
      //     //   institute,
      //     //   student,
      //     //   price,
      //     //   new_receipt,
      //     //   type
      //     // );
      //   }
      // }
    }
    var order = new OrderPayment({});
    order.payment_module_type = "Admission Fees";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    fee_receipt_count_query(institute, new_receipt, order);
    user.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    institute.payment_history.push(order._id);
    if (req?.body?.fee_payment_mode === "Government/Scholarship") {
      remaining_fee_lists.paid_fee += price;
      // if (remaining_fee_lists.remaining_fee >= price) {
      //   remaining_fee_lists.remaining_fee -= price;
      // }
    }
    if (remaining_fee_lists?.applicable_card?._id) {
      var nest_app = await NestedCard.findById({
        _id: `${remaining_fee_lists?.applicable_card?._id}`,
      });
    }
    if (remaining_fee_lists?.government_card) {
      const nest_card = await NestedCard.findById({
        _id: `${remaining_fee_lists?.government_card}`,
      });
      remaining_fee_lists.active_payment_type = `${type}`;
      nest_card.active_payment_type = `${type}`;
      nest_card.paid_fee += price;
      if (nest_card?.remaining_fee >= price) {
        // if(remaining_fee_lists?.remaining_fee >= price){
        //   remaining_fee_lists.remaining_fee -= price
        // }
        nest_card.remaining_fee -= price;
      } else {
        // if(remaining_fee_lists?.remaining_fee >= nest_card.remaining_fee){
        //   remaining_fee_lists.remaining_fee -= nest_card.remaining_fee
        // }
        // else{
        //   remaining_fee_lists.remaining_fee = 0
        // }
        nest_card.remaining_fee = 0;
      }
      if (student.admissionRemainFeeCount >= price) {
        student.admissionRemainFeeCount -= price;
      }
      if (apply.remainingFee >= price) {
        apply.remainingFee -= price;
      }
      if (admin_ins.remainingFeeCount >= price) {
        admin_ins.remainingFeeCount -= price;
      }
      await nest_card.save();
      console.log("Enter");
      // console.log(nest_app)
      await render_government_installment_query(
        type,
        student,
        mode,
        price,
        admin_ins,
        student?.fee_structure,
        remaining_fee_lists,
        new_receipt,
        apply,
        institute,
        nest_card,
        nest_app
      );
      console.log("Exit");
    }
    student.admissionPaidFeeCount += price;
    if (mode === "Online") {
      admin_ins.onlineFee += price + extra_price;
      apply.onlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      // finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeBankBalance += price + extra_price;
      if (finance?.financeIncomeBankBalance >= price + extra_price) {
        finance.financeIncomeBankBalance -= price + extra_price;
      }
    } else if (mode === "Offline") {
      admin_ins.offlineFee += price + extra_price;
      apply.offlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      admin_ins.collected_fee += price + extra_price;
      // finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeSubmitBalance += price + extra_price;
      if (finance?.financeIncomeCashBalance >= price + extra_price) {
        finance.financeIncomeCashBalance -= price + extra_price;
      }
    } else {
    }
    if (finance?.financeTotalBalance >= price + extra_price) {
      finance.financeTotalBalance -= price + extra_price;
    }
    await lookup_applicable_grant(
      req?.body?.fee_payment_mode,
      price,
      remaining_fee_lists,
      new_receipt
    );
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price;
      }
    }
    await Promise.all([
      admin_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      remaining_fee_lists.save(),
      new_receipt.save(),
      // scholar.save(),
      // corpus.save(),
    ]);
    res.status(200).send({
      message: "Balance Pool increasing with price Operation complete",
      paid: true,
    });
    var is_refund =
      remaining_fee_lists?.paid_fee - remaining_fee_lists?.applicable_fee;
    if (is_refund > 0) {
      const filter_student_refund = admin_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          admin_ins.refundCount += is_refund;
        }
      } else {
        admin_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        admin_ins.refundCount += is_refund;
      }
    }
    await admin_ins.save();
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = admin_ins?.admissionAdminHead?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByAdmissionPhoto = admin_ins._id;
    notify.notifyCategory = "Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Application Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentRemarkQuery = async (req, res) => {
  try {
    const { rid } = req.params;
    if (!rid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });

    await RemainingList.findByIdAndUpdate(rid, req.body);
    res.status(200).send({ message: "Explore Current Remark", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentGoOfflineReceiptQuery = async (req, res) => {
  try {
    const { sid, appId } = req.params;
    const { fee_payment_mode, rid, raid } = req.body;
    if (!sid && !appId && !fee_payment_mode && !rid && !raid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");

    const apply = await NewApplication.findById({ _id: appId });

    const ads_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    });

    const institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });

    const student = await Student.findById({ _id: sid });

    const remain_list = await RemainingList.findById({ _id: rid });

    if (fee_payment_mode === "By Cash") {
    } else {
      var receipt = new FeeReceipt({ ...req.body });
      receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
      receipt.student = student?._id;
      receipt.receipt_generated_from = "BY_ADMISSION";
      receipt.application = apply?._id;
      receipt.finance = institute?.financeDepart[0];
      if (ads_admin?.request_array?.includes(`${receipt?._id}`)) {
      } else {
        ads_admin.request_array.push(receipt?._id);
        ads_admin.fee_receipt_request.push({
          receipt: receipt?._id,
          status: "Requested",
        });
        for (var ref of remain_list?.remaining_array) {
          if (`${ref?._id}` === `${raid}`) {
            ref.status = "Receipt Requested";
            ref.fee_receipt = receipt?._id;
          }
        }
      }
      receipt.fee_request_remain_card = raid;
      remain_list.fee_receipts.push(receipt?._id);
      institute.invoice_count += 1;
      receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${institute.invoice_count}`;
      await Promise.all([receipt.save(), institute.save()]);
    }
    await Promise.all([ads_admin.save(), remain_list.save()]);
    res.status(200).send({ message: "Wait For Approval", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllExportExcelArrayQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid }).select(
      "export_collection"
    );

    var all_excel = await nested_document_limit(
      page,
      limit,
      ads_admin?.export_collection.reverse()
    );
    if (all_excel?.length > 0) {
      res.status(200).send({
        message: "Explore All Exported Excel",
        access: true,
        all_excel: all_excel,
        count: ads_admin?.export_collection?.length,
      });
    } else {
      res.status(200).send({
        message: "No Exported Excel Available",
        access: false,
        all_excel: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEditOneExcel = async (req, res) => {
  try {
    const { aid, exid } = req.params;
    const { excel_file_name } = req.body;
    if (!aid && !exid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid }).select(
      "export_collection"
    );
    for (var exe of ads_admin?.export_collection) {
      if (`${exe?._id}` === `${exid}`) {
        exe.excel_file_name = excel_file_name;
      }
    }
    await ads_admin.save();
    res.status(200).send({
      message: "Exported Excel Updated",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDeleteOneExcel = async (req, res) => {
  try {
    const { aid, exid } = req.params;
    if (!aid && !exid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid }).select(
      "export_collection export_collection_count"
    );
    for (var exe of ads_admin?.export_collection) {
      if (`${exe?._id}` === `${exid}`) {
        ads_admin?.export_collection.pull(exid);
        if (ads_admin?.export_collection_count > 0) {
          ads_admin.export_collection_count -= 1;
        }
      }
    }
    await ads_admin.save();
    res.status(200).send({
      message: "Exported Excel Deletion Operation Completed",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderData = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById({ _id: id }).select(
      "active_fee_heads"
    );
    // var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}`})
    // const institute = await InstituteAdmin.findById({ _id: id})
    // .select("ApproveStudent")

    // const all_student = await Student.find({ _id: { $in: institute?.ApproveStudent }})
    // .select("studentFirstName")

    // for(var ref of all_student){
    //   var receipt = await FeeReceipt.find({ student: ref?._id})
    //   for(var val of receipt){
    //     s_admin.invoice_count += 1
    //     val.invoice_count = `${
    //       new Date().getMonth() + 1
    //     }${new Date().getFullYear()}${s_admin.invoice_count}`;
    //     await Promise.all([ s_admin.save(), val.save()])
    //   }
    // }

    res
      .status(200)
      .send({ message: "Download receipt", access: true, student });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllFeeStructureQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid })
      .select("institute")
      .populate({
        path: "institute",
        select: "depart",
      });

    const all_structures = await FeeStructure.find({
      department: { $in: ads_admin?.institute?.depart },
    })
      .limit(limit)
      .skip(skip)
      .select(
        "structure_name unique_structure_name total_admission_fees applicable_fees"
      )
      .populate({
        path: "category_master",
        select: "category_name",
      })
      .populate({
        path: "class_master",
        select: "className",
      });

    if (all_structures?.length > 0) {
      res.status(200).send({
        message: "Explore All Structures Array",
        access: true,
        all_structures: all_structures,
      });
    } else {
      res.status(200).send({
        message: "No Structures Array",
        access: false,
        all_structures: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewScholarShipQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { category_array } = req.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid });
    const scholar = new ScholarShip({ ...req.body });
    scholar.scholarship_fee_category.push(...category_array);
    scholar.admission = ads_admin?._id;
    ads_admin.scholarship.push(scholar?._id);
    ads_admin.scholarship_count += 1;
    await Promise.all([ads_admin.save(), scholar.save()]);
    res.status(200).send({ message: "Explore New Scholar Ship", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllScholarShipQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid }).select(
      "scholarship"
    );

    const all_scholar = await ScholarShip.find({
      $and: [
        { _id: { $in: ads_admin?.scholarship } },
        { scholarship_status: status },
      ],
    })
      .limit(limit)
      .skip(skip)
      .select(
        "scholarship_name scholarship_about created_at scholarship_notification scholarship_apply scholarship_status scholarship_candidates_count"
      )
      .populate({
        path: "fund_corpus",
        select: "unused_corpus total_corpus created_at fund_history_count",
      });

    if (all_scholar?.length > 0) {
      res.status(200).send({
        message: "Explore All ScholarShip",
        access: true,
        all_scholar: all_scholar,
      });
    } else {
      res.status(200).send({
        message: "No ScholarShip",
        access: false,
        all_scholar: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderScholarShipQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const scholar = await ScholarShip.findById({ _id: sid })
      .select(
        "scholarship_name scholarship_about created_at scholarship_notification scholarship_apply scholarship_status scholarship_candidates_count"
      )
      .populate({
        path: "scholarship_fee_category",
        select: "category_name",
      })
      .populate({
        path: "fund_corpus",
        select: "unused_corpus total_corpus created_at fund_history_count",
      });

    res.status(200).send({
      message: "Explore One ScholarShip",
      access: true,
      scholar: scholar,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderScholarShipNewFundCorpusQuery = async (req, res) => {
  try {
    const { aid, sid } = req.params;
    const { user_query } = req.query;
    if (!aid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid }).populate({
      path: "institute",
      select: "financeDepart",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute?._id}`,
    });
    const finance = await Finance.findById({
      _id: `${ads_admin?.institute?.financeDepart[0]}`,
    });
    const scholar = await ScholarShip.findById({ _id: sid });
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var f_user = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    if (user_query) {
      var user = await User.findOne({
        _id: `${user_query}`,
      }).select("_id payment_history");
    }
    var incomes = new Income({ ...req.body });
    const corpus = new FundCorpus({});
    corpus.total_corpus += incomes?.incomeAmount;
    corpus.unused_corpus += incomes?.incomeAmount;
    corpus.scholarship = scholar?._id;
    scholar.fund_corpus = corpus?._id;
    corpus.fund_history.push(incomes?._id);
    corpus.fund_history_count += 1;
    var order = new OrderPayment({});
    finance.incomeDepartment.push(incomes._id);
    incomes.finances = finance._id;
    incomes.invoice_number = finance.incomeDepartment?.length;
    order.payment_module_type = "Income";
    order.payment_to_end_user_id = f_user._id;
    order.payment_module_id = incomes._id;
    order.payment_amount = incomes.incomeAmount;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_mode = incomes.incomeAccount;
    order.payment_income = incomes._id;
    f_user.payment_history.push(order._id);
    institute.invoice_count += 1;
    order.payment_invoice_number = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    if (user) {
      order.payment_by_end_user_id = user._id;
      order.payment_flag_by = "Debit";
      user.payment_history.push(order._id);
      incomes.incomeFromUser = user._id;
      await user.save();
    } else {
      incomes.incomeFromUser = null;
    }
    if (req.body?.incomeFrom) {
      incomes.incomeFrom = req.body?.incomeFrom;
      order.payment_by_end_user_id_name = req.body?.incomeFrom;
    }
    if (req.body.incomeAccount === "By Cash") {
      finance.financeIncomeCashBalance =
        finance.financeIncomeCashBalance + incomes.incomeAmount;
      finance.financeTotalBalance += incomes.incomeAmount;
    } else if (req.body.incomeAccount === "By Bank") {
      finance.financeIncomeBankBalance =
        finance.financeIncomeBankBalance + incomes.incomeAmount;
      finance.financeTotalBalance += incomes.incomeAmount;
    }
    if (incomes?.gstSlab > 0) {
      finance.gst_format.liability.push(incomes._id);
    }
    await Promise.all([
      finance.save(),
      incomes.save(),
      order.save(),
      f_user.save(),
      s_admin.save(),
      corpus.save(),
      scholar.save(),
    ]);
    res.status(200).send({
      message: "Add New Income",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewFundCorpusIncomeQuery = async (req, res) => {
  try {
    const { fcid } = req.params;
    const { user_query } = req.query;
    if (!fcid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const corpus = await FundCorpus.findById({ _id: fcid });
    const scholar = await ScholarShip.findById({
      _id: `${corpus?.scholarship}`,
    });
    const ads_admin = await Admission.findById({
      _id: `${scholar?.admission}`,
    }).populate({
      path: "institute",
      select: "financeDepart",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute?._id}`,
    });
    const finance = await Finance.findById({
      _id: `${ads_admin?.institute?.financeDepart[0]}`,
    });
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var f_user = await InstituteAdmin.findById({ _id: `${finance.institute}` });
    if (user_query) {
      var user = await User.findOne({
        _id: `${user_query}`,
      }).select("_id payment_history");
    }
    var incomes = new Income({ ...req.body });
    corpus.total_corpus += incomes?.incomeAmount;
    corpus.unused_corpus += incomes?.incomeAmount;
    corpus.scholarship = scholar?._id;
    scholar.fund_corpus = corpus?._id;
    corpus.fund_history.push(incomes?._id);
    corpus.fund_history_count += 1;
    var order = new OrderPayment({});
    finance.incomeDepartment.push(incomes._id);
    incomes.finances = finance._id;
    incomes.invoice_number = finance.incomeDepartment?.length;
    order.payment_module_type = "Income";
    order.payment_to_end_user_id = f_user._id;
    order.payment_module_id = incomes._id;
    order.payment_amount = incomes.incomeAmount;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_mode = incomes.incomeAccount;
    order.payment_income = incomes._id;
    f_user.payment_history.push(order._id);
    institute.invoice_count += 1;
    order.payment_invoice_number = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    if (user) {
      order.payment_by_end_user_id = user._id;
      order.payment_flag_by = "Debit";
      user.payment_history.push(order._id);
      incomes.incomeFromUser = user._id;
      await user.save();
    } else {
      incomes.incomeFromUser = null;
    }
    if (req.body?.incomeFrom) {
      incomes.incomeFrom = req.body?.incomeFrom;
      order.payment_by_end_user_id_name = req.body?.incomeFrom;
    }
    if (req.body.incomeAccount === "By Cash") {
      finance.financeIncomeCashBalance =
        finance.financeIncomeCashBalance + incomes.incomeAmount;
      finance.financeTotalBalance += incomes.incomeAmount;
    } else if (req.body.incomeAccount === "By Bank") {
      finance.financeIncomeBankBalance =
        finance.financeIncomeBankBalance + incomes.incomeAmount;
      finance.financeTotalBalance += incomes.incomeAmount;
    }
    if (incomes?.gstSlab > 0) {
      finance.gst_format.liability.push(incomes._id);
    }
    await Promise.all([
      finance.save(),
      incomes.save(),
      order.save(),
      f_user.save(),
      s_admin.save(),
      corpus.save(),
      scholar.save(),
      institute.save(),
    ]);
    res.status(200).send({
      message: "Add New Income",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllCandidatesGovernment = async (req, res) => {
  try {
    const { sid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search, flow } = req.query;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    if (flow === "BY_FINANCE") {
      var scholar = await Finance.findById({ _id: sid }).select(
        "scholarship_candidates scholarship_candidates_count"
      );
    } else {
      var scholar = await ScholarShip.findById({ _id: sid }).select(
        "scholarship_candidates scholarship_candidates_count"
      );
    }
    if (search) {
      var all_exempt = await FeeReceipt.find({
        _id: { $in: scholar?.scholarship_candidates },
      })
        .populate({
          path: "student",
          match: {
            studentFirstName: { $regex: search, $options: "i" },
            // studentGRNO: { $regex: search, $options: "i" } ,
          },
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "fee_structure",
            select:
              "category_master structure_name unique_structure_name applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationName",
        });
    } else {
      var all_exempt_query = await FeeReceipt.find({
        _id: { $in: scholar?.scholarship_candidates },
      })
        // .limit(limit)
        // .skip(skip)
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "fee_structure",
            select:
              "category_master structure_name unique_structure_name applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationName",
        });

      var all_exempt = await nested_document_limit(
        page,
        limit,
        all_exempt_query?.reverse()
      );
    }
    if (all_exempt?.length > 0) {
      res.status(200).send({
        message: "Lot's of Government / Scholarships Volume Receipts",
        access: true,
        all_exempt: all_exempt,
        all_exempt_count: scholar?.scholarship_candidates_count,
      });
    } else {
      res.status(200).send({
        message: "No Government / Scholarships Volume Receipts",
        access: false,
        all_exempt: [],
        all_exempt_count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneFundCorpusHistory = async (req, res) => {
  try {
    const { sid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const scholar = await ScholarShip.findById({ _id: sid }).select(
      "fund_corpus"
    );

    if (scholar?.fund_corpus) {
      const corpus = await FundCorpus.findById({
        _id: `${scholar?.fund_corpus}`,
      }).select("fund_history");

      var all_incomes = await Income.find({
        _id: { $in: corpus?.fund_history },
      })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "incomeFromUser",
          select: "username userLegalName photoId profilePhoto",
        });
    } else {
      var all_incomes = [];
    }
    if (all_incomes?.length > 0) {
      res.status(200).send({
        message: "Explore All Incomes In Take History",
        access: true,
        all_incomes: all_incomes,
      });
    } else {
      res.status(200).send({
        message: "No Income In Take History",
        access: false,
        all_incomes: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneScholarShipStatusQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const scholar = await ScholarShip.findById({ _id: sid });
    const ads_admin = await Admission.findById({
      _id: `${scholar?.admission}`,
    });
    scholar.scholarship_status = "Completed";
    if (ads_admin?.scholarship_count > 0) {
      ads_admin.scholarship_count -= 1;
    }
    ads_admin.scholarship_completed_count += 1;
    await Promise.all([scholar.save(), ads_admin.save()]);
    res.status(200).send({ message: "Explore Completed ScholarShip" });
  } catch (e) {
    console.log(e);
  }
};

exports.renderRetroOneStudentStructureQuery = async (req, res) => {
  try {
    const { aid, appId, sid } = req.params;
    const { old_fee_struct, new_fee_struct, rid } = req.body;
    if (!aid && !appId && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var one_app = await NewApplication.findById({ _id: appId });

    var one_student = await Student.findById({ _id: sid });
    var old_struct = await FeeStructure.findById({ _id: old_fee_struct });
    var new_struct = await FeeStructure.findById({ _id: new_fee_struct });
    var one_remain_list = await RemainingList.findById({
      _id: rid,
    });
    one_remain_list.applicable_fee = new_struct?.total_admission_fees;
    one_remain_list.fee_structure = new_struct?._id;
    if (one_remain_list?.applicable_card) {
      var nest_app = await NestedCard.findById({
        _id: `${one_remain_list?.applicable_card}`,
      });
      nest_app.applicable_fee = new_struct?.applicable_fees;
      nest_app.remaining_fee =
        nest_app?.applicable_fee > nest_app?.paid_fee
          ? nest_app?.applicable_fee - nest_app?.paid_fee
          : 0;
      one_remain_list.remaining_fee =
        nest_app?.applicable_fee > nest_app?.paid_fee
          ? nest_app?.applicable_fee - nest_app?.paid_fee
          : 0;
      for (var val of nest_app?.remaining_array) {
        if (`${val?.status}` === "Paid") {
        } else {
          val.remainAmount =
            nest_app?.remaining_fee > 0 ? nest_app?.remaining_fee : 0;
          if (val.remainAmount <= 0) {
            nest_app?.remaining_array.pull(val?._id);
          }
          if (nest_app?.remaining_fee > 0 && val) {
          } else {
            nest_app.remaining_array.push({
              status: "Not Paid",
              remainAmount: nest_app?.remaining_fee,
              appId: one_remain_list?.appId,
              instituteId: one_remain_list?.institute,
              isEnable: true,
              installmentValue: "Installment Remain",
            });
          }
        }
      }
      await nest_app.save();
    }
    if (one_remain_list?.government_card) {
      var nest_gov = await NestedCard.findById({
        _id: `${one_remain_list?.government_card}`,
      });
      nest_gov.applicable_fee =
        new_struct?.total_admission_fees - new_struct?.applicable_fees;
      nest_gov.remaining_fee =
        nest_gov?.applicable_fee > nest_gov?.paid_fee
          ? nest_gov?.applicable_fee - nest_gov?.paid_fee
          : 0;
      for (var val of nest_gov?.remaining_array) {
        if (`${val?.status}` === "Paid") {
        } else {
          val.remainAmount =
            nest_gov?.remaining_fee > 0 ? nest_gov?.remaining_fee : 0;
          if (val.remainAmount <= 0) {
            nest_gov?.remaining_array.pull(val?._id);
          }
          if (nest_gov?.remaining_fee > 0 && val) {
          } else {
            nest_gov.remaining_array.push({
              status: "Not Paid",
              remainAmount: nest_gov?.remaining_fee,
              appId: one_remain_list?.appId,
              instituteId: one_remain_list?.institute,
              isEnable: true,
              installmentValue: "Installment Remain",
            });
          }
        }
      }
      await nest_gov.save();
    }

    await one_remain_list.save();
    res
      .status(200)
      .send({ message: "Zero Paid Fees Structure Edited", access: true });
    var all_fees = await FeeReceipt.find({
      $and: [{ student: one_student?._id }, { fee_structure: old_struct?._id }],
    });
    for (var val of all_fees) {
      val.fee_structure = new_struct?._id;
      for (var ele of val?.fee_heads) {
        ele.fee_structure = new_struct?._id;
      }
      await val.save();
    }
    for (var val of one_student?.active_fee_heads) {
      if (`${val?.appId}` === `${one_app?._id}`)
        val.fee_structure = new_struct?._id;
    }
    await one_student.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllRefundedArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid })
      .select("refundedFeeList refundedCount")
      .populate({
        path: "refundedFeeList",
        populate: {
          path: "student fee_receipt",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO fee_payment_mode refund_status invoice_count fee_bank_name fee_bank_holder fee_utr_reference fee_payment_acknowledge fee_payment_amount fee_transaction_date created_at",
        },
      });

    var all_refunded = await nested_document_limit(
      page,
      limit,
      ads_admin?.refundedFeeList?.reverse()
    );
    if (all_refunded?.length > 0) {
      res.status(200).send({
        message: "Explore All Refunded Array",
        access: true,
        all_refunded: all_refunded,
        count: ads_admin?.refundedCount,
      });
    } else {
      res.status(200).send({
        message: "No Refunded Array",
        access: true,
        all_refunded: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderRemainingSetOffQuery = async (req, res) => {
  try {
    const { rcid, sid } = req.params;
    const { amount, mode, type, nsid } = req.body;
    if (!sid && !rcid && !amount && !mode && !type)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    var extra_price = 0;
    var remain_card = await RemainingList.findById({ _id: rcid });
    var s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var apply = await NewApplication.findById({ _id: `${remain_card?.appId}` });
    var admin_ins = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var all_remain_list = await RemainingList.find({
      _id: { $in: student?.remainingFeeList },
    })
      .populate({
        path: "applicable_card",
      })
      .populate({
        path: "government_card",
      });
    var valid_price = await set_off_amount(all_remain_list);
    console.log(valid_price);
    // console.log("Valid Set Off", valid_price);
    if (valid_price?.total > 0) {
      var filtered_card = valid_price?.set_off_arr?.filter((val) => {
        if (val?.excess_fee > 0) return val;
      });
      if (filtered_card?.length >= 1) {
        var valid_remain_card = await RemainingList.findById({
          _id: filtered_card?.[0]?.remain,
        }).populate({
          path: "appId",
          select: "applicationName",
        });
        var nest_card_set = await NestedCard.findById({
          _id: `${valid_remain_card?.applicable_card}`,
        });
        var nest_gov_card_set = await NestedCard.findById({
          _id: `${valid_remain_card?.government_card}`,
        });

        // console.log("Enter in This Zone");
        const new_receipt = new FeeReceipt({ ...req.body });
        new_receipt.student = student?._id;
        new_receipt.application = apply?._id;
        new_receipt.receipt_generated_from = "BY_ADMISSION";
        new_receipt.finance = finance?._id;
        new_receipt.set_off_status = "Set Off";
        new_receipt.fee_transaction_date = new Date();
        const notify = new StudentNotification({});
        if (valid_remain_card?.paid_fee >= price) {
          valid_remain_card.paid_fee -= price;
        }
        const remaining_fee_lists = await RemainingList.findOne({
          $and: [{ student: student?._id }, { appId: apply?._id }],
        });
        var nest_card = await NestedCard.findById({
          _id: `${remaining_fee_lists?.applicable_card}`,
        });
        new_receipt.fee_structure = remaining_fee_lists?.fee_structure;
        remaining_fee_lists.fee_receipts.push(new_receipt?._id);
        var order = new OrderPayment({});
        order.payment_module_type = "Admission Fees";
        order.payment_to_end_user_id = institute._id;
        order.payment_by_end_user_id = user._id;
        order.payment_module_id = apply._id;
        order.payment_amount = extra_price;
        order.payment_status = "Captured";
        order.payment_flag_to = "Credit";
        order.payment_flag_by = "Debit";
        order.payment_mode = mode;
        order.payment_admission = apply._id;
        order.payment_from = student._id;
        order.payment_student = student?._id;
        order.payment_student_name = student?.valid_full_name;
        order.payment_student_gr = student?.studentGRNO;
        fee_receipt_count_query(institute, new_receipt, order);
        user.payment_history.push(order._id);
        institute.payment_history.push(order._id);
        order.fee_receipt = new_receipt?._id;
        remaining_fee_lists.paid_fee += price;
        if (remaining_fee_lists.remaining_fee >= price) {
          remaining_fee_lists.remaining_fee -= price;
        }
        if (nest_card.remaining_fee >= price) {
          nest_card.remaining_fee -= price;
        }
        nest_card.paid_fee += price;
        let excess_fee =
          nest_card_set?.paid_fee - nest_card_set?.applicable_fee;
        let g_excess_fee =
          nest_gov_card_set?.paid_fee - nest_gov_card_set?.applicable_fee;
        // nest_card.applicable_fee += price;
        if (nest_card_set?.paid_fee - nest_card_set?.applicable_fee > 0) {
          if (nest_card_set.paid_fee >= excess_fee) {
            nest_card_set.paid_fee -= excess_fee;
          }
          nest_card_set.remaining_array.push({
            appId: valid_remain_card?.appId,
            instituteId: valid_remain_card?.institute,
            remainAmount: excess_fee,
            isEnable: true,
            installmentValue: `Excess Fees Set Off`,
            status: "Paid",
            receipt_status: "Setoff",
          });
        }
        if (
          nest_gov_card_set?.paid_fee - nest_gov_card_set?.applicable_fee >
          0
        ) {
          if (nest_gov_card_set.paid_fee >= g_excess_fee) {
            nest_gov_card_set.paid_fee -= g_excess_fee;
          }
          nest_gov_card_set.remaining_array.push({
            appId: valid_remain_card?.appId,
            instituteId: valid_remain_card?.institute,
            remainAmount: g_excess_fee,
            isEnable: true,
            installmentValue: `Excess Fees Set Off`,
            status: "Paid",
            receipt_status: "Setoff",
          });
        }
        await render_installment(
          type,
          student,
          mode,
          price,
          admin_ins,
          student?.fee_structure,
          remaining_fee_lists,
          new_receipt,
          apply,
          institute,
          nest_card
        );
        if (admin_ins?.remainingFeeCount >= price) {
          admin_ins.remainingFeeCount -= price;
        }
        if (apply?.remainingFee >= price) {
          apply.remainingFee -= price;
        }
        if (student?.admissionRemainFeeCount >= price) {
          student.admissionRemainFeeCount -= price;
        }
        student.admissionPaidFeeCount += price;
        if (req?.body?.fee_payment_mode === "Government/Scholarship") {
        } else {
          if (
            remaining_fee_lists?.is_splited &&
            remaining_fee_lists?.is_splited === "Yes"
          ) {
            console.log("Update Split");
            await update_fee_head_query_redesign_split(
              student,
              new_receipt?.fee_payment_amount,
              apply?._id,
              new_receipt,
              nest_card,
              nsid
            );
            console.log("Update Split");
          } else {
            await update_fee_head_query_redesign(
              student,
              new_receipt?.fee_payment_amount,
              apply?._id,
              new_receipt
            );
          }
        }
        await lookup_applicable_grant(
          req?.body?.fee_payment_mode,
          price,
          remaining_fee_lists,
          new_receipt
        );
        for (var stu of student.paidFeeList) {
          if (`${stu.appId}` === `${apply._id}`) {
            stu.paidAmount += price;
          }
        }
        await Promise.all([
          admin_ins.save(),
          student.save(),
          apply.save(),
          finance.save(),
          institute.save(),
          order.save(),
          s_admin.save(),
          remaining_fee_lists.save(),
          new_receipt.save(),
          valid_remain_card.save(),
          nest_card.save(),
          nest_card_set.save(),
          nest_gov_card_set.save(),
        ]);
        res.status(200).send({
          message: "Price set off is under processing...",
          access: true,
          remaining_fee_lists,
          nest_card,
          valid_remain_card,
        });
        for (let ele of all_remain_list) {
          ele.setOffPrice = 0;
          await ele.save();
        }
        var is_refund =
          remaining_fee_lists?.paid_fee - remaining_fee_lists?.applicable_fee;
        if (is_refund > 0) {
          const filter_student_refund = admin_ins?.refundFeeList?.filter(
            (stu) => {
              if (`${stu.student}` === `${student?._id}`) return stu;
            }
          );
          if (filter_student_refund?.length > 0) {
            for (var data of filter_student_refund) {
              data.refund += is_refund;
              admin_ins.refundCount += is_refund;
            }
          } else {
            admin_ins.refundFeeList.push({
              student: student?._id,
              refund: is_refund,
            });
            admin_ins.refundCount += is_refund;
          }
        }
        await admin_ins.save();
        notify.notifyContent = `${student.studentFirstName} ${
          student.studentMiddleName ? `${student.studentMiddleName} ` : ""
        } ${student.studentLastName} your transaction is successfull for ${
          apply?.applicationName
        } ${price}`;
        notify.notifySender = admin_ins?.admissionAdminHead?.user;
        notify.notifyReceiever = user._id;
        notify.notifyType = "Student";
        notify.notifyPublisher = student._id;
        user.activity_tab.push(notify._id);
        notify.notifyByAdmissionPhoto = admin_ins._id;
        notify.notifyCategory = "Remain Fees";
        notify.redirectIndex = 18;
        invokeMemberTabNotification(
          "Admission Status",
          `Payment Installment paid Successfully `,
          "Application Status",
          user._id,
          user.deviceToken
        );
        await Promise.all([user.save(), notify.save()]);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderRemainingScholarNewNumberQuery = async (req, res) => {
  try {
    const { rcid } = req.params;
    if (!rcid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    await RemainingList.findByIdAndUpdate(rcid, req.body);
    res.status(200).send({
      message: "Explore New Added or Edited Scholar ship Number",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

const auto_scholar_query = async (
  sid,
  appId,
  amount,
  mode,
  type,
  rcid,
  fee_payment_mode,
  date_query,
  remark_query,
  txn_id,
  SCH_NUMBER
) => {
  try {
    // const { sid, appId } = req.params;
    // const { amount, mode, type, scid } = req.body;
    if (!sid && !appId && !amount && !mode && !type)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    var extra_price = 0;
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });

    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var apply = await NewApplication.findById({ _id: appId });
    var admin_ins = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    const new_receipt = new FeeReceipt({
      fee_payment_mode: fee_payment_mode,
      fee_payment_amount: amount,
    });
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.receipt_generated_from = "BY_ADMISSION";
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = date_query
      ? new Date(`${date_query}`)
      : new Date();
    new_receipt.scholarship_status = "MARK_AS_SCHOLARSHIP";
    const notify = new StudentNotification({});
    const remaining_fee_lists = await RemainingList.findById({ _id: rcid });
    new_receipt.fee_structure = remaining_fee_lists?.fee_structure;
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    remaining_fee_lists.remark = remaining_fee_lists?.remark
      ? `${remaining_fee_lists.remark} ${remark_query}`
      : `${remark_query}`;
    new_receipt.txn_id = txn_id ?? "";
    remaining_fee_lists.scholar_ship_number = SCH_NUMBER ?? "";
    if (fee_payment_mode === "Government/Scholarship") {
      finance.government_receipt.push(new_receipt?._id);
      finance.financeGovernmentScholarBalance += price;
      finance.scholarship_candidates.push(new_receipt?._id);
      finance.scholarship_candidates_count += 1;
      finance.government_receipt_count += 1;
      // if (price >= remaining_fee_lists?.remaining_fee) {
      //   extra_price += price - remaining_fee_lists?.remaining_fee;
      //   price = remaining_fee_lists?.remaining_fee;
      //   remaining_fee_lists.paid_fee += extra_price;
      //   student.admissionPaidFeeCount += extra_price;
      //   for (var stu of student.paidFeeList) {
      //     if (`${stu.appId}` === `${apply._id}`) {
      //       stu.paidAmount += extra_price;
      //     }
      //   }
      //   await remain_one_time_query_government(
      //     admin_ins,
      //     remaining_fee_lists,
      //     apply,
      //     institute,
      //     student,
      //     price + extra_price,
      //     new_receipt
      //   );
      // } else {
      //   if (type === "One Time Fees Remain") {
      //   } else {
      //     await remain_government_installment(
      //       admin_ins,
      //       remaining_fee_lists,
      //       apply,
      //       institute,
      //       student,
      //       price,
      //       new_receipt,
      //       type
      //     );
      //   }
      // }
    }
    var order = new OrderPayment({});
    order.payment_module_type = "Admission Fees";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = extra_price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    fee_receipt_count_query(institute, new_receipt, order);
    order.fee_receipt = new_receipt?._id;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    if (new_receipt?.fee_payment_mode === "Government/Scholarship") {
      remaining_fee_lists.paid_fee += price;
      // if (remaining_fee_lists.remaining_fee >= price) {
      //   remaining_fee_lists.remaining_fee -= price;
      // }
    }
    if (remaining_fee_lists?.applicable_card) {
      var nest_app = await NestedCard.findById({
        _id: `${remaining_fee_lists?.applicable_card}`,
      });
    }
    if (remaining_fee_lists?.government_card) {
      const nest_card = await NestedCard.findById({
        _id: `${remaining_fee_lists?.government_card}`,
      });
      remaining_fee_lists.active_payment_type = `${type}`;
      nest_card.active_payment_type = `${type}`;
      nest_card.paid_fee += price;
      if (nest_card?.remaining_fee >= price) {
        // if(remaining_fee_lists?.remaining_fee >= price){
        //   remaining_fee_lists.remaining_fee -= price
        // }
        nest_card.remaining_fee -= price;
      } else {
        // if(remaining_fee_lists?.remaining_fee >= nest_card.remaining_fee){
        //   remaining_fee_lists.remaining_fee -= nest_card.remaining_fee
        // }
        // else{
        //   remaining_fee_lists.remaining_fee = 0
        // }
        nest_card.remaining_fee = 0;
      }
      if (student.admissionRemainFeeCount >= price) {
        student.admissionRemainFeeCount -= price;
      }
      if (apply.remainingFee >= price) {
        apply.remainingFee -= price;
      }
      if (admin_ins.remainingFeeCount >= price) {
        admin_ins.remainingFeeCount -= price;
      }
      await nest_card.save();
      console.log("Enter");
      await render_government_installment_query(
        type,
        student,
        mode,
        price,
        admin_ins,
        student?.fee_structure,
        remaining_fee_lists,
        new_receipt,
        apply,
        institute,
        nest_card,
        nest_app
      );
      console.log("Exit");
    }
    student.admissionPaidFeeCount += price;
    if (mode === "Online") {
      admin_ins.onlineFee += price + extra_price;
      apply.onlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      // finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeBankBalance += price + extra_price;
      if (finance?.financeIncomeBankBalance >= price + extra_price) {
        finance.financeIncomeBankBalance -= price + extra_price;
      }
    } else if (mode === "Offline") {
      admin_ins.offlineFee += price + extra_price;
      apply.offlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      admin_ins.collected_fee += price + extra_price;
      // finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeSubmitBalance += price + extra_price;
      if (finance?.financeIncomeCashBalance >= price + extra_price) {
        finance.financeIncomeCashBalance -= price + extra_price;
      }
    } else {
    }
    if (finance?.financeTotalBalance >= price + extra_price) {
      finance.financeTotalBalance -= price + extra_price;
    }
    await lookup_applicable_grant(
      new_receipt?.fee_payment_mode,
      price,
      remaining_fee_lists,
      new_receipt
    );
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price;
      }
    }
    await Promise.all([
      admin_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      remaining_fee_lists.save(),
      new_receipt.save(),
    ]);
    // res.status(200).send({
    //   message: "Balance Pool increasing with price Operation complete",
    //   paid: true,
    // });
    var is_refund =
      remaining_fee_lists?.paid_fee - remaining_fee_lists?.applicable_fee;
    if (is_refund > 0) {
      const filter_student_refund = admin_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          admin_ins.refundCount += is_refund;
        }
      } else {
        admin_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        admin_ins.refundCount += is_refund;
      }
    }
    await admin_ins.save();
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = admin_ins?.admissionAdminHead?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByAdmissionPhoto = admin_ins._id;
    notify.notifyCategory = "Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Application Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
  } catch (e) {
    console.log(e);
  }
};

const type_calc = async (r_args) => {
  try {
    var count = r_args?.fee_structure?.total_installments
      ? parseInt(r_args?.fee_structure?.total_installments)
      : 0;
    var type;
    if (count > 1) {
      for (var i = 2; i <= count; i++) {
        type =
          r_args?.active_payment_type === "No process"
            ? "First Installment"
            : r_args?.active_payment_type === "First Installment" && i == 2
            ? "Second Installment"
            : r_args?.active_payment_type === "Second Installment" && i == 3
            ? "Third Installment"
            : r_args?.active_payment_type === "Third Installment" && i == 4
            ? "Four Installment"
            : r_args?.active_payment_type === "Four Installment" && i == 5
            ? "Five Installment"
            : r_args?.active_payment_type === "Five Installment" && i == 6
            ? "Six Installment"
            : r_args?.active_payment_type === "Six Installment" && i == 7
            ? "Seven Installment"
            : r_args?.active_payment_type === "Seven Installment" && i == 8
            ? "Eight Installment"
            : r_args?.active_payment_type === "Eight Installment" && i == 9
            ? "Nine Installment"
            : r_args?.active_payment_type === "Nine Installment" && i == 10
            ? "Ten Installment"
            : r_args?.active_payment_type === "Ten Installment" && i == 11
            ? "Eleven Installment"
            : r_args?.active_payment_type === "Eleven Installment" && i == 12
            ? "Tweleve Installment"
            : r_args?.active_payment_type === "Tweleve Installment"
            ? "Installment Remain"
            : r_args?.active_payment_type === "Installment Remain"
            ? "Installment Remain"
            : "";
      }
      return type;
    } else {
      return "";
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdmissionNewScholarNumberAutoQuery = async (
  arr,
  id,
  excel_sheet_name,
  scholar_batch
) => {
  try {
    var num_arr = [];
    if (arr?.length > 0) {
      for (var ref of arr) {
        let names = ref?.Name?.split(" ");
        for (let ele of names) {
          ref.combine_name = `${ref?.combine_name ?? ""}${ele}`;
        }
        let sp_name = ref?.combine_name?.toLowerCase();
        var students = await Student.find({
          $and: [
            { scholar_name: `${sp_name}` },
            { studentStatus: "Approved" },
            { institute: id },
          ],
        });
        var student = students?.filter((val) => {
          if (val?.hostel_fee_structure || val?.hostel_renewal) {
          } else {
            return val;
          }
        });
        if (student?.length > 1) {
          ref.Remark = "Student With Same Name is more than 1";
          num_arr.push(ref);
        } else {
          const batch = await Batch.findById({ _id: scholar_batch });
          const apps = await NewApplication.find({
            applicationBatch: { $in: batch?.merged_batches },
          });
          // console.log("Apps", apps)
          var valid_remain = await RemainingList.findOne({
            $and: [{ student: { $in: student } }, { appId: { $in: apps } }],
          }).populate({
            path: "fee_structure",
          });
          // console.log("Valid", valid_remain)
          if (valid_remain) {
            const num_type = "Installment Remain";
            const num_id = ref?.TXNID ?? "";
            // if (valid_remain?.access_mode_card === "One_Time_Wise") {
            //   var valid_type =
            //     valid_remain?.active_payment_type === "No Process"
            //       ? "One Time Fees"
            //       : valid_remain?.active_payment_type === "One Time Fees"
            //       ? "One Time Fees Remain"
            //       : "";
            // } else if (valid_remain?.access_mode_card === "Installment_Wise") {
            //   var valid_type = await type_calc(valid_remain);
            // } else {
            // }s
            await auto_scholar_query(
              valid_remain?.student,
              valid_remain?.appId,
              ref?.Amount,
              "Offline",
              num_type,
              valid_remain?._id,
              "Government/Scholarship",
              ref?.Date,
              ref?.Remark,
              num_id,
              ref?.SCH_NUMBER ?? ""
            );
          } else {
            ref.Remark = "Fees Card Not Find With Same Batch As Entered";
            num_arr.push(ref);
          }
        }
      }
      await mismatch_scholar_transaction_json_to_excel_query(
        num_arr,
        "Mismatch",
        id,
        excel_sheet_name
      );
    } else {
      console.log("Bug In Excel");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAutoStudentNameQuery = async (req, res) => {
  try {
    const all_student = await Student.find({}).select(
      "studentFirstName studentMiddleName studentLastName studentFatherName scholar_name"
    );
    var i = 0;
    for (let ele of all_student) {
      let names = `${ele?.studentFirstName?.trim()?.toLowerCase()}${
        ele?.studentMiddleName?.trim()?.toLowerCase() ??
        ele?.studentFatherName?.trim()?.toLowerCase()
      }${ele?.studentLastName?.trim()?.toLowerCase()}`;
      ele.scholar_name = names?.trim();
      await ele.save();
      console.log(i);
      i += 1;
    }
    res.status(200).send({ message: "All Student Name" });
  } catch (e) {
    console.log(e);
  }
};

exports.renderInstituteScholarNumberAutoQuery = async (id, arr) => {
  try {
    if (arr?.length > 0) {
      for (var ref of arr) {
        var one_student = await Student.findOne({
          studentGRNO: `${ref?.GRNO}`,
        });
        var all_remain = await RemainingList.find({
          student: `${one_student?._id}`,
        }).populate({
          path: "fee_structure",
        });
        for (var ele of all_remain) {
          if (
            `${ele?.fee_structure?.batch_master}` === `${ref?.batchId?._id}`
          ) {
            ele.scholar_ship_number = `${ref?.ScholarNumber}`;
            await ele.save();
            console.log("Add");
          }
        }
        console.log("push");
      }
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderApplicationAutoQRCodeQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { qr_code } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });

    var new_app = await NewApplication.findById({ _id: aid });
    new_app.app_qr_code = qr_code;
    await new_app.save();
    res
      .status(200)
      .send({ message: "Explore New Application QR Code Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDropFeesStudentQuery = async (req, res) => {
  try {
    const { rid, sid } = req.params;
    if (!rid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: true,
      });

    var valid_remain_card = await RemainingList.findById({ _id: rid });
    var valid_app = await NewApplication.findById({
      _id: `${valid_remain_card?.appId}`,
    });
    var valid_admission = await Admission.findById({
      _id: `${valid_app?.admissionAdmin}`,
    });
    var valid_student = await Student.findById({ _id: sid });
    var drop_status =
      valid_remain_card?.applicable_fee === valid_remain_card?.remaining_fee
        ? true
        : false;
    if (drop_status) {
      if (
        valid_student?.admissionRemainFeeCount >=
        valid_remain_card?.remaining_fee
      ) {
        valid_student.admissionRemainFeeCount -=
          valid_remain_card.remaining_fee;
      }
      valid_student.remainingFeeList.pull(valid_remain_card?._id);
      // if (valid_student?.remainingFeeList_count > 0) {
      //   valid_student.remainingFeeList_count -= 1;
      // }
      if (valid_student?.admissionRemainFeeCount <= 0) {
        valid_admission.remainingFee.pull(valid_student?._id);
      }
      if (valid_app?.remainingFee >= valid_remain_card?.remaining_fee) {
        valid_app.remainingFee -= valid_remain_card.remaining_fee;
      }
      if (
        valid_admission?.remainingFeeCount >= valid_remain_card?.remaining_fee
      ) {
        valid_admission.remainingFeeCount -= valid_remain_card?.remaining_fee;
      }
      await RemainingList.findByIdAndDelete(valid_remain_card?._id);
      await Promise.all([
        valid_student.save(),
        valid_admission.save(),
        valid_app.save(),
      ]);
      res.status(200).send({
        message: "Drop becomes flood. Operations Execute with full DB Access",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "Drop becomes drought. No Operation Execute",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAddFeesCardStudentQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { appId, struct } = req.body;
    if (!sid && !appId && !struct)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await render_new_fees_card(sid, appId, struct, "", "");
    res
      .status(200)
      .send({ message: "Explore New Remaining Fees Card Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.paidAlreadyCardRemainingFeeStudent = async (req, res) => {
  try {
    try {
      const { aid, sid, appId } = req.params;
      const { amount, mode, type, remain_1, rid } = req.body;
      const { receipt_status } = req.query;
      if (!sid && !aid && !appId && !amount && !mode && !type && !remain_1)
        return res.status(200).send({
          message: "Their is a bug need to fix immediately 😡",
          paid: false,
        });
      var price = parseInt(amount);
      var extra_price = 0;
      const s_admin = await Admin.findById({
        _id: `${process.env.S_ADMIN_ID}`,
      }).select("invoice_count");
      var admin_ins = await Admission.findById({ _id: aid }).populate({
        path: "admissionAdminHead",
        select: "user",
      });
      var student = await Student.findById({ _id: sid }).populate({
        path: "fee_structure",
      });
      var institute = await InstituteAdmin.findById({
        _id: `${admin_ins.institute}`,
      });
      var finance = await Finance.findById({
        _id: `${institute?.financeDepart[0]}`,
      });
      var user = await User.findById({ _id: `${student.user}` }).select(
        "deviceToken payment_history activity_tab"
      );
      var apply = await NewApplication.findById({ _id: appId });
      var valid_remain_list = await RemainingList.findById({
        _id: rid,
      });
      // console.log(valid_remain_list)
      const new_receipt = new FeeReceipt({ ...req.body });
      new_receipt.student = student?._id;
      new_receipt.application = apply?._id;
      new_receipt.finance = finance?._id;
      new_receipt.receipt_generated_from = "BY_ADMISSION";
      new_receipt.fee_transaction_date = new Date(
        `${req.body.transaction_date}`
      );
      new_receipt.receipt_status = receipt_status
        ? receipt_status
        : "Already Generated";
      new_receipt.fee_structure = valid_remain_list?.fee_structure;
      const notify = new StudentNotification({});
      var order = new OrderPayment({});
      order.payment_module_type = "Admission Fees";
      order.payment_to_end_user_id = institute._id;
      order.payment_by_end_user_id = user._id;
      order.payment_module_id = apply._id;
      order.payment_amount = price;
      order.payment_status = "Captured";
      order.payment_flag_to = "Credit";
      order.payment_flag_by = "Debit";
      order.payment_mode = mode;
      order.payment_admission = apply._id;
      order.payment_from = student._id;
      order.payment_student = student?._id;
      order.payment_student_name = student?.valid_full_name;
      order.payment_student_gr = student?.studentGRNO;
      institute.invoice_count += 1;
      new_receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${institute.invoice_count}`;
      order.payment_invoice_number = new_receipt?.invoice_count;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      order.fee_receipt = new_receipt?._id;
      if (valid_remain_list?.access_mode_card === "Installment_Wise") {
        if (valid_remain_list?.remaining_fee >= price) {
          valid_remain_list.remaining_fee -= price;
        }
        valid_remain_list.paid_fee += price;
        if (remain_1) {
          var card_1 = valid_remain_list?.remaining_array?.filter((val) => {
            if (`${val?._id}` === `${remain_1}` && val?.status === "Not Paid")
              return val;
          });
        }
        // console.log("Card 1", card_1)
        var card_2 = valid_remain_list?.remaining_array?.filter((val) => {
          if (`${val?._id}` != `${remain_1}` && val?.status === "Not Paid")
            return val;
        });
        // console.log("Card 2", card_2)
        if (type === "First Installment") {
          await set_fee_head_query_redesign(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt
          );
          // await set_fee_head_query(student, price, apply, new_receipt);
          student.paidFeeList.push({
            paidAmount: price,
            appId: apply?._id,
          });
          valid_remain_list.active_payment_type = "First Installment";
          if (
            valid_remain_list?.re_admission_class != null &&
            valid_remain_list?.re_admission_flow
          ) {
            var classes = await Class.findById({
              _id: `${valid_remain_list?.re_admission_class}`,
            });
            var batch = await Batch.findById({ _id: `${classes?.batch}` });
            var depart = await Department.findById({
              _id: `${batch?.department}`,
            });
            if (classes?.ApproveStudent?.includes(student._id)) {
            } else {
              classes?.ApproveStudent.push(student._id);
              classes?.UnApproveStudent.pull(student._id);
            }
            if (batch?.ApproveStudent?.includes(student._id)) {
            } else {
              batch?.ApproveStudent.push(student._id);
              batch?.UnApproveStudent.pull(student._id);
            }
            if (depart?.ApproveStudent?.includes(student._id)) {
            } else {
              depart?.ApproveStudent.push(student._id);
              depart?.UnApproveStudent.pull(student._id);
            }
            classes.studentCount += 1;
            if (student.studentGender === "Male") {
              classes.boyCount += 1;
            } else if (student.studentGender === "Female") {
              classes.girlCount += 1;
            } else if (student.studentGender === "Other") {
              classes.otherCount += 1;
            } else {
            }
            student.studentROLLNO = classes.ApproveStudent?.length + 1;
            await Promise.all([classes.save(), batch.save(), depart.save()]);
          }
        } else {
          await update_fee_head_query_redesign(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt
          );
          // await update_fee_head_query(student, price, apply, new_receipt);
          for (var match of student?.paidFeeList) {
            if (`${match.appId}` === `${apply._id}`) {
              match.paidAmount += price;
            }
          }
          valid_remain_list.active_payment_type = type;
        }
        await lookup_applicable_grant(
          new_receipt?.fee_payment_mode,
          price,
          valid_remain_list,
          new_receipt
        );
        var valid_price =
          card_1[0]?.remainAmount >= price
            ? card_1[0]?.remainAmount - price
            : 0;
        if (card_1?.length > 0) {
          card_1[0].status = "Paid";
          card_1[0].mode = new_receipt?.fee_payment_mode;
          card_1[0].fee_receipt = new_receipt?._id;
          card_1[0].remainAmount = price;
        }
        console.log("Valid Price", valid_price);
        if (card_2?.length > 0) {
          card_2[0].remainAmount += valid_price;
          card_2[0].isEnable = true;
        } else {
          if (valid_price > 0) {
            valid_remain_list.remaining_array.push({
              remainAmount: valid_price,
              appId: apply?._id,
              instituteId: institute._id,
              installmentValue: "Installment Remain",
              isEnable: true,
            });
          }
        }
        valid_remain_list.fee_receipts.push(new_receipt?._id);
        if (valid_remain_list?.remaining_fee == 0) {
          admin_ins.remainingFee.pull(student?._id);
          valid_remain_list.status = "Paid";
        }
        new_receipt.order_history = order?._id;
        order.fee_receipt = new_receipt?._id;
      }
      if (req?.body?.fee_payment_mode === "Exempted/Unrecovered") {
        await exempt_installment(
          req?.body?.fee_payment_mode,
          valid_remain_list,
          student,
          admin_ins,
          apply,
          finance,
          price,
          new_receipt
        );
      }
      if (admin_ins?.remainingFeeCount >= price) {
        admin_ins.remainingFeeCount -= price;
      }
      if (apply?.remainingFee >= price) {
        apply.remainingFee -= price;
      }
      if (student?.admissionRemainFeeCount >= price) {
        student.admissionRemainFeeCount -= price;
      }
      student.admissionPaidFeeCount += price;
      if (mode === "Online") {
        admin_ins.onlineFee += price + extra_price;
        apply.onlineFee += price + extra_price;
        apply.collectedFeeCount += price + extra_price;
        finance.financeTotalBalance += price + extra_price;
        finance.financeAdmissionBalance += price + extra_price;
        finance.financeBankBalance += price + extra_price;
      } else if (mode === "Offline") {
        admin_ins.offlineFee += price + extra_price;
        apply.offlineFee += price + extra_price;
        apply.collectedFeeCount += price + extra_price;
        admin_ins.collected_fee += price + extra_price;
        finance.financeTotalBalance += price + extra_price;
        finance.financeAdmissionBalance += price + extra_price;
        finance.financeSubmitBalance += price + extra_price;
      } else {
      }
      await Promise.all([
        admin_ins.save(),
        student.save(),
        apply.save(),
        finance.save(),
        institute.save(),
        order.save(),
        s_admin.save(),
        new_receipt.save(),
        valid_remain_list.save(),
      ]);
      res.status(200).send({
        message: "Balance Pool increasing with price Operation complete",
        paid: true,
      });
      var is_refund =
        valid_remain_list?.paid_fee - valid_remain_list?.applicable_fee;
      if (is_refund > 0) {
        const filter_student_refund = admin_ins?.refundFeeList?.filter(
          (stu) => {
            if (`${stu.student}` === `${student?._id}`) return stu;
          }
        );
        if (filter_student_refund?.length > 0) {
          for (var data of filter_student_refund) {
            data.refund += is_refund;
            admin_ins.refundCount += is_refund;
          }
        } else {
          admin_ins.refundFeeList.push({
            student: student?._id,
            refund: is_refund,
          });
          admin_ins.refundCount += is_refund;
        }
      }
      await admin_ins.save();
      notify.notifyContent = `${student.studentFirstName} ${
        student.studentMiddleName ? `${student.studentMiddleName} ` : ""
      } ${student.studentLastName} your transaction is successfull for ${
        apply?.applicationName
      } ${price}`;
      notify.notifySender = admin_ins?.admissionAdminHead?.user;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      user.activity_tab.push(notify._id);
      notify.notifyByAdmissionPhoto = admin_ins._id;
      notify.notifyCategory = "Remain Fees";
      notify.redirectIndex = 18;
      invokeMemberTabNotification(
        "Admission Status",
        `Payment Installment paid Successfully `,
        "Application Status",
        user._id,
        user.deviceToken
      );
      await Promise.all([user.save(), notify.save()]);
      if (apply?.allottedApplication?.length > 0) {
        apply?.allottedApplication.forEach((ele) => {
          if (`${ele.student}` === `${student._id}`) {
            // ele.fee_remain = ele.fee_remain >= price ? ele.fee_remain - price : 0;
            ele.paid_status = "Paid";
            ele.second_pay_mode = mode;
          }
        });
        await apply.save();
      }
      if (apply?.confirmedApplication?.length > 0) {
        apply?.confirmedApplication.forEach((ele) => {
          if (`${ele.student}` === `${student._id}`) {
            ele.fee_remain =
              req?.body?.fee_payment_mode === "Exempted/Unrecovered"
                ? 0
                : ele.fee_remain >= price
                ? ele.fee_remain - price
                : 0;
            ele.paid_status = "Paid";
            ele.second_pay_mode = mode;
          }
        });
        await apply.save();
      }
      if (apply?.gstSlab > 0) {
        var business_data = new BusinessTC({});
        business_data.b_to_c_month = new Date().toISOString();
        business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
        business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
        business_data.finance = finance._id;
        business_data.b_to_c_name = "Admission Fees";
        finance.gst_format.b_to_c.push(business_data?._id);
        business_data.b_to_c_total_amount = price + extra_price;
        await Promise.all([finance.save(), business_data.save()]);
      }
    } catch (e) {
      console.log(e);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.paidAlreadyCardRemainingFeeStudentFinanceQuery = async (req, res) => {
  try {
    const { sid, appId } = req.params;
    const { amount, mode, type, scid, remain_1, rid } = req.body;
    if (!sid && !appId && !amount && !mode && !type && !remain_1)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    var extra_price = 0;
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });

    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var apply = await NewApplication.findById({ _id: appId });
    var admin_ins = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    if (flow === "BY_FINANCE") {
    } else {
      var scholar = await ScholarShip.findById({ _id: scid });
      var corpus = await FundCorpus.findById({
        _id: `${scholar?.fund_corpus}`,
      });
    }
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.receipt_generated_from = "BY_ADMISSION";
    new_receipt.scholarship_status = "MARK_AS_SCHOLARSHIP";
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    const notify = new StudentNotification({});
    const valid_remain_list = await RemainingList.findById({
      _id: rid,
    });
    new_receipt.fee_structure = valid_remain_list?.fee_structure;
    valid_remain_list.fee_receipts.push(new_receipt?._id);
    if (req?.body?.fee_payment_mode === "Government/Scholarship") {
      finance.government_receipt.push(new_receipt?._id);
      finance.financeGovernmentScholarBalance += price;
      if (flow === "BY_FINANCE") {
        finance.scholarship_candidates.push(new_receipt?._id);
        finance.scholarship_candidates_count += 1;
      } else {
        scholar.scholarship_candidates.push(new_receipt?._id);
        scholar.scholarship_candidates_count += 1;
      }
      finance.government_receipt_count += 1;
      if (price >= valid_remain_list?.remaining_fee) {
        extra_price += price - valid_remain_list?.remaining_fee;
        price = valid_remain_list?.remaining_fee;
        valid_remain_list.paid_fee += extra_price;
        student.admissionPaidFeeCount += extra_price;
      }
    }
    var order = new OrderPayment({});
    order.payment_module_type = "Admission Fees";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = extra_price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    order.payment_student = student?._id;
    order.payment_student_name = student?.valid_full_name;
    order.payment_student_gr = student?.studentGRNO;
    institute.invoice_count += 1;
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${institute.invoice_count}`;
    order.payment_invoice_number = new_receipt?.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    order.fee_receipt = new_receipt?._id;
    if (req?.body?.fee_payment_mode === "Exempted/Unrecovered") {
      await exempt_installment(
        req?.body?.fee_payment_mode,
        valid_remain_list,
        student,
        admin_ins,
        apply,
        finance,
        price,
        new_receipt
      );
    } else {
      if (req?.body?.fee_payment_mode === "Government/Scholarship") {
        valid_remain_list.paid_fee += price;
        if (valid_remain_list.remaining_fee >= price) {
          valid_remain_list.remaining_fee -= price;
        }
      }
    }
    if (admin_ins?.remainingFeeCount >= price) {
      admin_ins.remainingFeeCount -= price;
    }
    if (apply?.remainingFee >= price) {
      apply.remainingFee -= price;
    }
    if (student?.admissionRemainFeeCount >= price) {
      student.admissionRemainFeeCount -= price;
    }
    student.admissionPaidFeeCount += price;
    if (mode === "Online") {
      admin_ins.onlineFee += price + extra_price;
      apply.onlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      // finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeBankBalance += price + extra_price;
      if (finance?.financeIncomeBankBalance >= price + extra_price) {
        finance.financeIncomeBankBalance -= price + extra_price;
      }
    } else if (mode === "Offline") {
      admin_ins.offlineFee += price + extra_price;
      apply.offlineFee += price + extra_price;
      apply.collectedFeeCount += price + extra_price;
      admin_ins.collected_fee += price + extra_price;
      // finance.financeTotalBalance += price + extra_price;
      finance.financeAdmissionBalance += price + extra_price;
      finance.financeSubmitBalance += price + extra_price;
      if (finance?.financeIncomeCashBalance >= price + extra_price) {
        finance.financeIncomeCashBalance -= price + extra_price;
      }
    } else {
    }
    if (valid_remain_list?.access_mode_card === "Installment_Wise") {
      if (remain_1) {
        var card_1 = valid_remain_list?.remaining_array?.filter((val) => {
          if (`${val?._id}` === `${remain_1}` && val?.status === "Not Paid")
            return val;
        });
      }
      var card_2 = valid_remain_list?.remaining_array?.filter((val) => {
        if (`${val?._id}` != `${remain_1}` && val?.status === "Not Paid")
          return val;
      });
      if (type === "First Installment") {
        await set_fee_head_query_redesign(
          student,
          new_receipt?.fee_payment_amount,
          apply?._id,
          new_receipt
        );
        // await set_fee_head_query(student, price, apply, new_receipt);
        student.paidFeeList.push({
          paidAmount: price,
          appId: apply?._id,
        });
        valid_remain_list.active_payment_type = "First Installment";
        if (
          valid_remain_list?.re_admission_class != null &&
          valid_remain_list?.re_admission_flow
        ) {
          var classes = await Class.findById({
            _id: `${valid_remain_list?.re_admission_class}`,
          });
          var batch = await Batch.findById({ _id: `${classes?.batch}` });
          var depart = await Department.findById({
            _id: `${batch?.department}`,
          });
          if (classes?.ApproveStudent?.includes(student._id)) {
          } else {
            classes?.ApproveStudent.push(student._id);
            classes?.UnApproveStudent.pull(student._id);
          }
          if (batch?.ApproveStudent?.includes(student._id)) {
          } else {
            batch?.ApproveStudent.push(student._id);
            batch?.UnApproveStudent.pull(student._id);
          }
          if (depart?.ApproveStudent?.includes(student._id)) {
          } else {
            depart?.ApproveStudent.push(student._id);
            depart?.UnApproveStudent.pull(student._id);
          }
          classes.studentCount += 1;
          if (student.studentGender === "Male") {
            classes.boyCount += 1;
          } else if (student.studentGender === "Female") {
            classes.girlCount += 1;
          } else if (student.studentGender === "Other") {
            classes.otherCount += 1;
          } else {
          }
          student.studentROLLNO = classes.ApproveStudent?.length + 1;
          await Promise.all([classes.save(), batch.save(), depart.save()]);
        }
      } else {
        await update_fee_head_query_redesign(
          student,
          new_receipt?.fee_payment_amount,
          apply?._id,
          new_receipt
        );
        // await update_fee_head_query(student, price, apply, new_receipt);
        for (var match of student?.paidFeeList) {
          if (`${match.appId}` === `${apply._id}`) {
            match.paidAmount += price;
          }
        }
        valid_remain_list.active_payment_type = type;
      }
      await lookup_applicable_grant(
        new_receipt?.fee_payment_mode,
        price,
        valid_remain_list,
        new_receipt
      );
      var valid_price =
        card_1[0]?.remainAmount >= price ? card_1[0]?.remainAmount - price : 0;
      if (card_1?.length > 0) {
        card_1[0].status = "Paid";
        card_1[0].mode = new_receipt?.fee_payment_mode;
        card_1[0].fee_receipt = new_receipt?._id;
        card_1[0].remainAmount = price;
      }
      // console.log("Valid Price", valid_price);
      if (card_2?.length > 0) {
        card_2[0].remainAmount += valid_price;
        card_2[0].isEnable = true;
      } else {
        if (valid_price > 0) {
          valid_remain_list.remaining_array.push({
            remainAmount: valid_price,
            appId: apply?._id,
            instituteId: institute._id,
            installmentValue: "Installment Remain",
            isEnable: true,
          });
        }
      }
      valid_remain_list.fee_receipts.push(new_receipt?._id);
      if (valid_remain_list?.remaining_fee == 0) {
        admin_ins.remainingFee.pull(student?._id);
        valid_remain_list.status = "Paid";
      }
      new_receipt.order_history = order?._id;
      order.fee_receipt = new_receipt?._id;
    }
    if (flow === "BY_FINANCE") {
    } else {
      if (corpus.unused_corpus >= price) {
        corpus.unused_corpus -= price;
      }
    }
    if (finance?.financeTotalBalance >= price + extra_price) {
      finance.financeTotalBalance -= price + extra_price;
    }
    if (flow === "BY_FINANCE") {
      await Promise.all([
        admin_ins.save(),
        student.save(),
        apply.save(),
        finance.save(),
        institute.save(),
        order.save(),
        s_admin.save(),
        valid_remain_list.save(),
        new_receipt.save(),
        // scholar.save(),
        // corpus.save(),
      ]);
    } else {
      await Promise.all([
        admin_ins.save(),
        student.save(),
        apply.save(),
        finance.save(),
        institute.save(),
        order.save(),
        s_admin.save(),
        valid_remain_list.save(),
        new_receipt.save(),
        scholar.save(),
        corpus.save(),
      ]);
    }
    res.status(200).send({
      message: "Balance Pool increasing with price Operation complete",
      paid: true,
    });
    var is_refund =
      valid_remain_list?.paid_fee - valid_remain_list?.applicable_fee;
    if (is_refund > 0) {
      const filter_student_refund = admin_ins?.refundFeeList?.filter((stu) => {
        if (`${stu.student}` === `${student?._id}`) return stu;
      });
      if (filter_student_refund?.length > 0) {
        for (var data of filter_student_refund) {
          data.refund += is_refund;
          admin_ins.refundCount += is_refund;
        }
      } else {
        admin_ins.refundFeeList.push({
          student: student?._id,
          refund: is_refund,
        });
        admin_ins.refundCount += is_refund;
      }
    }
    await admin_ins.save();
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = admin_ins?.admissionAdminHead?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByAdmissionPhoto = admin_ins._id;
    notify.notifyCategory = "Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Application Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
    if (apply?.allottedApplication?.length > 0) {
      apply?.allottedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          // ele.fee_remain = ele.fee_remain >= price ? ele.fee_remain - price : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await apply.save();
    }
    if (apply?.confirmedApplication?.length > 0) {
      apply?.confirmedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.fee_remain =
            req?.body?.fee_payment_mode === "Exempted/Unrecovered"
              ? 0
              : ele.fee_remain >= price
              ? ele.fee_remain - price
              : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
        }
      });
      await apply.save();
    }
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.finance = finance._id;
      business_data.b_to_c_name = "Admission Fees";
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = price + extra_price;
      await Promise.all([finance.save(), business_data.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFilterByThreeFunctionQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { departId, masterId, search, batchId } = req.query;
    if (!id && !departId && !masterId && !batchId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: true,
      });

    var ads_admin = await Admission.findOne({ institute: id });
    if (departId && masterId && batchId) {
      var all_apps = await NewApplication.find({
        $and: [
          { _id: { $in: ads_admin?.newApplication } },
          { applicationDepartment: departId },
          { applicationBatch: batchId },
          { applicationMaster: masterId },
        ],
        // $or: [{ applicationName: { $regex: `${search}`, $options: "i" } }],
      })
        .select(
          "applicationName applicationDepartment applicationBatch applicationMaster application_flow applicationType applicationStatus"
        )
        .populate({
          path: "admissionAdmin",
          select: "_id",
        });
    } else {
      var all_apps = await NewApplication.find({
        $and: [{ _id: { $in: ads_admin?.newApplication } }],
      })
        .limit(limit)
        .skip(skip)
        .select(
          "applicationName applicationDepartment applicationBatch applicationMaster application_flow applicationType applicationStatus"
        )
        .populate({
          path: "admissionAdmin",
          select: "_id",
        });
    }

    if (all_apps?.length > 0) {
      res.status(200).send({
        message: "Explore All Applications Query",
        access: true,
        all_apps: all_apps,
      });
    } else {
      res.status(200).send({
        message: "No Applications Query",
        access: false,
        all_apps: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderPendingListStudentQuery = async (req, res) => {
  try {
    var student = await Student.find({
      $and: [
        { institute: "6449c83598fec071fbffd3ad" },
        { studentStatus: "Approved" },
      ],
    });
    var ads_admin = await Admission.findById({
      _id: "644a09e3d1679fcd6e76e606",
    });
    var institute = await InstituteAdmin.findById({
      _id: ads_admin?.institute,
    });
    for (var val of student) {
      var all_remain = await RemainingList.find({
        $and: [{ _id: { $in: val?.remainingFeeList } }],
      });
      for (var ref of all_remain) {
        // val.admissionRemainFeeCount += ref?.remaining_fee;
        ref.institute = institute?._id;
        await ref.save();
      }
      // val.admissionRemainFeeCount = 0;
      // await val.save();
    }
    // await ads_admin.save();
    res.status(200).send({ message: "Added Student Remaining Fees Query" });
  } catch (e) {
    console.log(e);
  }
  // try {
  //   const all_card = await RemainingList.find({});
  //   for (var val of all_card) {
  //     // val.drop_status = "Disable";
  //     // val.already_made = false;
  //     // val.button_status = "Collect Fees"
  //     val.institute = institute?._id
  //     await val.save();
  //   }
  //   res.status(200).send({ message: "Added Student Remaining Fees Query" });
  // } catch (e) {
  //   console.log(e);
  // }
};

exports.renderPendingCustomFilterQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { flow } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (flow === "Admission_Filter") {
      var ads_admin = await Admission.findById({ _id: aid }).select(
        "pending_fee_custom_filter"
      );
      var dynamic = {
        pending_fee_custom_filter: {
          ...ads_admin?.pending_fee_custom_filter,
        },
      };
    } else if (flow === "Institute_Filter") {
      var ads_admin = await InstituteAdmin.findById({ _id: aid }).select(
        "pending_fee_custom_filter"
      );
      var dynamic = {
        pending_fee_custom_filter: {
          ...ads_admin?.pending_fee_custom_filter,
        },
      };
    } else if (flow === "Finance_Student_Filter") {
      var ads_admin = await Finance.findById({ _id: aid }).select(
        "pending_all_student_fee_custom_filter"
      );
      var dynamic = {
        pending_fee_custom_filter: {
          ...ads_admin?.pending_all_student_fee_custom_filter,
        },
      };
    } else if (flow === "Admission_Student_Filter") {
      var ads_admin = await Admission.findById({ _id: aid }).select(
        "pending_all_student_fee_custom_filter"
      );
      var dynamic = {
        pending_fee_custom_filter: {
          ...ads_admin?.pending_all_student_fee_custom_filter,
        },
      };
    } else if (flow === "Student_Section_Filter") {
      var ads_admin = await FinanceModerator.findById({ _id: aid }).select(
        "pending_all_student_fee_custom_filter"
      );
      var dynamic = {
        pending_fee_custom_filter: {
          ...ads_admin?.pending_all_student_fee_custom_filter,
        },
      };
    } else if (flow === "Certificate_Section_Filter") {
      var ads_admin = await FinanceModerator.findById({ _id: aid }).select(
        "pending_all_student_fee_cert_custom_filter"
      );
      var dynamic = {
        pending_fee_custom_filter: {
          ...ads_admin?.pending_all_student_fee_cert_custom_filter,
        },
      };
    } else if (flow === "Id_Card_Section_Filter") {
      var ads_admin = await FinanceModerator.findById({ _id: aid }).select(
        "pending_all_student_fee_id_card_custom_filter"
      );
      var dynamic = {
        pending_fee_custom_filter: {
          ...ads_admin?.pending_all_student_fee_id_card_custom_filter,
        },
      };
    } else {
      var dynamic = "" || null;
    }

    res.status(200).send({
      message: "Explore New Custom Filter",
      access: true,
      ads_admin: dynamic,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderPendingCustomFilterBatchMasterQuery = async (req, res) => {
  try {
    const { arr } = req.body;
    if (arr?.length > 0) {
      var all_batch = await Batch.find({ department: { $in: arr } }).select(
        "batchName batchStatus createdAt"
      );

      var all_master = await ClassMaster.find({
        department: { $in: arr },
      }).select("className classCount");

      res.status(200).send({
        message: "Explore One Department All Dynamic Batch + Master",
        access: false,
        batch: all_batch,
        master: all_master,
      });
    } else {
      res.status(200).send({
        message: "Continue Searching",
        access: false,
        batch: [],
        master: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionSelectedRevertedApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { statusId, staffId } = req.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        select_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const ads_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    });
    const student = await Student.findById({ _id: sid });
    var user = await User.findById({ _id: `${student?.user}` });
    var status = await Status.findById({ _id: statusId });
    for (let app of apply?.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.selectedApplication.pull(app._id);
      } else {
      }
    }
    for (let app of ads_admin?.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        ads_admin.selectedApplication.pull(app._id);
      } else {
      }
    }
    apply.receievedApplication.push({
      student: student._id,
    });
    apply.receieved_array.push(student?._id);
    if (apply.selectCount > 0) {
      apply.selectCount -= 1;
    }
    student.student_application_obj.push({
      app: apply?._id,
      staff: staffId,
      flow: "reverted_by",
    });
    user.applicationStatus.pull(status?._id);
    await Status.findByIdAndDelete(statusId);
    await Promise.all([
      apply.save(),
      user.save(),
      ads_admin.save(),
      student.save(),
    ]);
    res.status(200).send({
      message: `${student.studentFirstName} Revert Back To Receieved Application`,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionCollectDocsRevertedQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { statusId, fcid, rid, revert_status, staffId } = req.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        docs_status: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var ads_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    });
    var student = await Student.findById({ _id: sid });
    var user = await User.findById({ _id: `${student?.user}` });
    var status = await Status.findById({ _id: statusId });
    var remain_card = await RemainingList.findById({ _id: rid });
    if (remain_card?.paid_fee >= 0) {
      apply.FeeCollectionApplication.pull(fcid);
      for (let ele of ads_admin?.FeeCollectionApplication) {
        if (`${ele?.student}` === `${student?._id}`) {
          ads_admin?.FeeCollectionApplication?.pull(ele?._id);
        }
      }
      if (apply?.fee_collect_count > 0) {
        apply.fee_collect_count -= 1;
      }
      apply.selectedApplication.push({
        student: student?._id,
        fee_remain: remain_card?.applicable_fee,
        revert_request_status: revert_status,
      });
      ads_admin.selectedApplication.push({
        student: student?._id,
        fee_remain: remain_card?.applicable_fee,
        revert_request_status: revert_status,
        application: apply?._id,
      });
      apply.selectCount += 1;
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "reverted_by",
      });
      student.remainingFeeList.pull(remain_card?._id);
      if (student?.remainingFeeList_count > 0) {
        student.remainingFeeList_count -= 1;
      }
      user.applicationStatus.pull(status?._id);
      await Status.findByIdAndDelete(statusId);
      if (remain_card?.applicable_card) {
        await NestedCard.findByIdAndDelete(remain_card?.applicable_card);
      }
      if (remain_card?.government_card) {
        await NestedCard.findByIdAndDelete(remain_card?.government_card);
      }
      await RemainingList.findByIdAndDelete(remain_card?._id);
      await Promise.all([
        apply.save(),
        user.save(),
        ads_admin.save(),
        student.save(),
      ]);
      res.status(200).send({
        message: "Look like a party mood Reverted Query",
        access: true,
      });
    } else {
      res.status(200).send({
        message:
          "Fees Already Collected By Admission Admin Revert Opts Not Working",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDemandChequeApprovalQuery = async (req, res) => {
  try {
    const { aid, rid } = req.params;
    const { status, reqId } = req.query;
    const { reason } = req.body;
    if (!aid && !rid && !reqId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var ads_admin = await Admission.findById({ _id: aid }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var one_receipt = await FeeReceipt.findById({ _id: rid }).populate({
      path: "student",
      select: "user",
    });
    var student = await Student.findById({
      _id: `${one_receipt?.student?._id}`,
    }).populate({
      path: "fee_structure",
    });
    var user = await User.findById({ _id: `${student?.user}` });
    var one_app = await NewApplication.findById({
      _id: `${one_receipt?.application}`,
    });
    var one_status = await Status.findOne({
      receipt: one_receipt?._id,
    });
    if (status === "Approved") {
      for (var ele of ads_admin?.fee_receipt_request) {
        if (`${ele._id}` === `${reqId}`) {
          if (ele?.nested_card) {
            const nest_card = await NestedCard.findById({
              _id: `${ele?.nested_card}`,
            });
            for (var val of nest_card?.remaining_array) {
              if (`${val?._id}` === `${ele?.nest_remain}`) {
                val.receipt_status = "Approved";
              }
            }
            await nest_card.save();
          }
          ads_admin.fee_receipt_request.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_approve.push({
        receipt: one_receipt?._id,
        demand_cheque_status: "Approved",
      });
      if (one_status) {
        one_status.receipt_status = "Approved";
      }
      one_receipt.fee_transaction_date = new Date();
      await one_receipt.save();
    } else if (status === "Rejected") {
      for (var ele of ads_admin?.fee_receipt_request) {
        if (`${ele._id}` === `${reqId}`) {
          if (ele?.nested_card) {
            const nest_card = await NestedCard.findById({
              _id: `${ele?.nested_card}`,
            });
            for (var val of nest_card?.remaining_array) {
              if (`${val?._id}` === `${ele?.nest_remain}`) {
                val.receipt_status = "Rejected";
                val.reason = reason;
              }
            }
            await nest_card.save();
          }
          ads_admin.fee_receipt_request.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_reject.push({
        receipt: one_receipt?._id,
        demand_cheque_status: "Rejected",
        reason: reason,
      });
      one_receipt.reason = reason;
      if (one_status) {
        one_status.receipt_status = "Rejected";
      }
      await one_receipt.save();
    } else if (status === "Over_Rejection") {
      for (var ele of ads_admin?.fee_receipt_reject) {
        if (`${ele._id}` === `${reqId}`) {
          if (ele?.nested_card) {
            const nest_card = await NestedCard.findById({
              _id: `${ele?.nested_card}`,
            });
            for (var val of nest_card?.remaining_array) {
              if (`${val?._id}` === `${ele?.nest_remain}`) {
                val.receipt_status = "Approved";
              }
            }
            await nest_card.save();
          }
          ads_admin.fee_receipt_reject.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_approve.push({
        receipt: one_receipt?._id,
        demand_cheque_status: "Approved",
        over_status: "After Rejection Approved By Admission Admin",
      });
      one_receipt.fee_transaction_date = new Date();
      if (one_status) {
        one_status.receipt_status = "Approved";
      }
      one_receipt.re_apply = false;
      await one_receipt.save();
    } else if (status === "Rejection_Notify") {
      if (one_status) {
        one_status.receipt_status = "Rejected";
      }
      one_receipt.re_apply = false;
      for (var ele of ads_admin?.fee_receipt_reject) {
        if (`${ele._id}` === `${reqId}`) {
          if (ele?.nested_card) {
            const nest_card = await NestedCard.findById({
              _id: `${ele?.nested_card}`,
            });
            for (var val of nest_card?.remaining_array) {
              if (`${val?._id}` === `${ele?.nest_remain}`) {
                val.receipt_status = "Rejected";
                val.reason = reason;
              }
            }
            await nest_card.save();
          }
          ele.reason = reason;
        }
      }
      one_receipt.reason = reason;
      await Promise.all([one_receipt.save(), one_app.save()]);
      const notify = new StudentNotification({});
      notify.notifyContent = `Your Fees Receipt was cancelled By Admission Admin`;
      notify.notifySender = ads_admin?.admissionAdminHead?.user;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = one_receipt?.student?._id;
      user.activity_tab.push(notify._id);
      notify.notifyByAdmissionPhoto = ads_admin._id;
      notify.notifyCategory = "Receipt Reject";
      notify.redirectIndex = 28;
      invokeMemberTabNotification(
        "Admission Status",
        `Payment Receipt Reject`,
        "Application Status",
        user._id,
        user.deviceToken
      );
      await Promise.all([user.save(), notify.save()]);
    } else {
    }
    if (one_status) {
      await Promise.all([ads_admin.save(), one_status.save(), one_app.save()]);
    } else {
      await Promise.all([ads_admin.save(), one_app.save()]);
    }
    res
      .status(200)
      .send({ message: `Receipts ${status} by Admission Admin`, access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneReceiptReApplyDeChequeQuery = async (req, res) => {
  try {
    const { sid, rid } = req.params;
    const { delete_pic } = req.query;
    const image = await handle_undefined(delete_pic);
    if (!sid && !rid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_receipt = await FeeReceipt.findByIdAndUpdate(rid, req.body);
    if (image) {
      await deleteFile(image);
    }
    const one_app = await NewApplication.findById({
      _id: `${one_receipt?.application}`,
    });
    const ads_admin = await Admission.findById({
      _id: `${one_app?.admissionAdmin}`,
    }).select("fee_receipt_reject");
    var status = await Status.findOne({ receipt: one_receipt?._id });
    if (status) {
      status.receipt_status = "Requested";
    }
    one_receipt.re_apply = true;
    await Promise.all([status.save(), one_receipt.save()]);
    res
      .status(200)
      .send({ message: "Your Receipts Under Processing", access: true });
    for (var all of ads_admin?.fee_receipt_reject) {
      if (`${all?.receipt}` === `${one_receipt?._id}`) {
        ads_admin.fee_receipt_reject.pull(all?._id);
        ads_admin.fee_receipt_reject.unshift({
          receipt: one_receipt?._id,
          demand_cheque_status: "Rejected",
        });
      }
    }
    await ads_admin.save();
  } catch (e) {
    console.log(e);
  }
};

// exports.renderTransferAppsQuery = async (req, res) => {
//   try {
//     const { aid } = req.params;
//     const { app_array, oaid, student_array } = req.body;
//     if (!aid && !app_array && !oaid)
//       return res.status(200).send({
//         message: "Their is a bug need to fixed immediately",
//         access: false,
//       });

//     var valid_new_app = await NewApplication.findById({ _id: aid });
//     var valid_old_app = await NewApplication.findById({ _id: oaid });
//     // var valid_struct = await FeeStructure.find({ $and: [{batch_master: `${valid_new_app?.applicationBatch}`}, { class_master: `${valid_new_app?.applicationMaster}`}, { department: `${valid_new_app?.applicationDepartment}`}] })

//     for (var ref of app_array) {
//       valid_old_app.confirmedApplication.pull(ref);
//       if (valid_old_app?.confirmCount > 0) {
//         valid_old_app.confirmCount -= 1;
//       }
//     }
//     await valid_old_app.save();
//     res.status(200).send({
//       message: `Explore ${student_array?.length} transferred to New Application`,
//       access: true,
//     });

//     for (var ele of student_array) {
//       var valid_student = await Student.findById({ _id: `${ele?.studentId}` })
//       .populate({
//         path: "fee_structure"
//       })
//       var valid_user = await User.findById({ _id: `${valid_student?.user}` });
//       var valid_struct = await FeeStructure.find({
//         $and: [
//           { batch_master: `${valid_new_app?.applicationBatch}` },
//           { class_master: `${valid_new_app?.applicationMaster}` },
//           { department: `${valid_new_app?.applicationDepartment}` },
//           { category_master: `${valid_student?.fee_structure?.category_master?._id}`}
//         ],
//       });

//       valid_new_app.confirmedApplication.push({
//         student: valid_student?._id,
//         payment_status: ele?.mode,
//         install_type: ele?.type,
//         fee_remain: ele?.price,
//         transfer_status: "Transferred",
//         transfer_from_app: valid_old_app?._id,
//       });
//       if(valid_struct?.length > 1){
//         valid_student.fee_structure = valid_struct[0]?._id
//       }
//       else{
//         valid_student.fee_structure = valid_struct[0]?._id
//       }
//       valid_new_app.confirmCount += 1;
//       valid_new_app.transferCount += 1;
//       valid_new_app.transferApplication.push({
//         student: valid_student?._id,
//       });
//       var all_remain = await RemainingList.find({
//         $and: [
//           { _id: { $in: valid_student?.remainingFeeList } },
//           { appId: valid_old_app?._id },
//         ],
//       });
//       for (var ref of all_remain) {
//         ref.appId = valid_new_app?._id;
//         ref.fee_structure = valid_struct[0]?._id
//         ref.applicable_fee = valid_struct[0]?.total_admission_fees
//         for (var val of ref?.remaining_array) {
//           val.appId = valid_new_app?._id;
//         }
//         await ref.save();
//       }

//       var all_receipt = await FeeReceipt.find({
//         $and: [{ application: valid_old_app?._id }],
//       });
//       for (var val of all_receipt) {
//         val.application = valid_new_app?._id;
//         await val.save();
//       }

//       var all_status = await Status.find({
//         $and: [{ applicationId: valid_old_app?._id }],
//       });
//       for (var ele of all_status) {
//         ele.applicationId = valid_new_app?._id;
//         ele.feeStructure = valid_struct[0]?._id
//         ele.admissionFee = valid_struct[0]?.total_admission_fees
//         await ele.save();
//       }

//       if (valid_user?.applyApplication?.includes(`${valid_old_app?._id}`)) {
//         valid_user?.applyApplication.pull(valid_old_app?._id);
//       }
//       valid_user?.applyApplication.push(valid_new_app?._id);

//       var all_orders = await OrderPayment.find({
//         $and: [{ payment_admission: valid_old_app?._id }],
//       });
//       for (var all of all_orders) {
//         all.payment_admission = valid_new_app?._id;
//         await all.save();
//       }

//       for (var ref of valid_student?.paidFeeList) {
//         if (`${ref?.appId}` === `${valid_old_app?._id}`) {
//           ref.appId = valid_new_app?._id;
//         }
//       }

//       await Promise.all([
//         valid_student.save(),
//         valid_user.save(),
//         valid_old_app.save(),
//         valid_new_app.save(),
//       ]);
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };

exports.renderRemainCardRemovalQuery = async (req, res) => {
  try {
    const { rid } = req.params;
    const { raid } = req.query;
    if (!rid && !raid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_card = await RemainingList.findById({ _id: rid }).select(
      "remaining_array"
    );

    valid_card.remaining_array.pull(raid);
    await valid_card.save();

    res
      .status(200)
      .send({ message: "Explore Card Removal Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeHeadsQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var receipt = await FeeReceipt.findById({
      _id: id,
    }).populate({
      path: "student",
      populate: {
        path: "fee_structure",
      },
    });
    await set_fee_head_query_redesign(
      receipt?.student,
      receipt?.fee_payment_amount,
      receipt?.application,
      receipt
    );
    res.status(200).send({
      message: "Explore All Student Fee Heads Query",
      access: true,
      receipt,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFindReceiptQuery = async (req, res) => {
  try {
    // if (`${process.env.CONNECT_DB}` === "PROD") {
    //   var arr = ["6449c83598fec071fbffd3ad"];
    //   for (var ref of arr) {
    //     var ins = await InstituteAdmin.findById({ _id: `${ref}` });
    var ins = await InstituteAdmin.findById({ _id: req?.params?.id });
    var finance = await Finance.findById({
      _id: `${ins?.financeDepart?.[0]}`,
    });
    const g_date = new Date(`2023-11-01T00:00:00.000Z`);
    const l_date = new Date(`2023-11-30T00:00:00.000Z`);
    var receipt = await FeeReceipt.find({
      $and: [
        {
          finance: finance?._id,
        },
        {
          created_at: {
            $gte: g_date,
            $lte: l_date,
          },
        },
      ],
    })
      // .select("fee_payment_amount created_at")
      // .populate({
      //   path: "student",
      //   select:
      //     "studentFirstName studentLastName studentMiddleName valid_full_name",
      //   populate: {
      //     path: "fee_structure",
      //     select: "unique_structure_name",
      //   },
      // })
      .populate({
        path: "order_history",
        // select:
        //   "paytm_query razor_query razorpay_payment_id payment_mode payment_invoice_number",
      });
    var num = 0;
    for (var ref of receipt) {
      ref.invoice_count = `112023${num + 1}`;
      if (ref?.order_history) {
        ref.order_history.payment_invoice_number = `${ref.invoice_count}`;
        await ref.order_history.save();
      }
      await ref.save();
      num += 1;
    }
    //   }
    // }
    res.status(200).send({
      message: "Explore New Fee Receipt",
      access: true,
      // receipt,
      count: receipt?.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOrder = async (req, res) => {
  try {
    var all_order = await OrderPayment.find({}).populate({
      path: "payment_student",
      select: "valid_full_name studentGRNO",
    });
    console.log(all_order?.length);
    var i = 0;
    for (var ref of all_order) {
      if (ref?.payment_student) {
        ref.payment_student_name = ref?.payment_student?.valid_full_name;
        ref.payment_student_gr = ref?.payment_student?.studentGRNO ?? "";
        await ref.save();
        console.log(i);
        i += 1;
      }
    }

    res
      .status(200)
      .send({ message: "Explore New Student Order", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionReceievedValidApplicationQuery = async (req, res) => {
  try {
    const { uid, aid } = req.params;
    if (!uid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    let valid_email = uid?.includes("@");
    if (uid?.length == 10) {
      var user = await User.findOne({ userPhoneNumber: uid });
    } else if (valid_email) {
      var user = await User.findOne({ userEmail: uid });
    } else {
      var user = await User.findOne({ _id: uid });
    }
    if (user?.applyApplication?.includes(`${aid}`)) {
      res.status(200).send({
        message: "You have already applied for this application",
        status: false,
        denied: true,
      });
    } else {
      res.status(200).send({
        message: "You are good to go",
        status: true,
        denied: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllOrderQuery = async (req, res) => {
  try {
    var all_receipt = await FeeReceipt.find({}).populate({
      path: "order_history",
    });
    for (var ref of all_receipt) {
      ref.invoice_count = ref?.order_history?.payment_invoice_number
        ? ref?.order_history?.payment_invoice_number
        : ref.invoice_count;
      await ref.save();
    }

    res
      .status(200)
      .send({ message: "Explore New Fee Receipt Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFindStudentReceiptQuery = async (req, res) => {
  try {
    var nums = ["6501a1fcdf2fe86f89504caa"];
    // var fine = ["644a09d6d1679fcd6e76e5ef"]
    // var all_struct = await FeeStructure.find({ $and: [{ finance: { $in: fine }} ]})

    // var all_remain = await RemainingList.find({ fee_structure: { $in: all_struct } })
    var all_remain = await RemainingList.find({ _id: { $in: nums } })
      .populate({
        path: "fee_structure",
      })
      .populate({
        path: "student",
      });
    var i = 0;
    for (var sub of all_remain) {
      if (sub?.applicable_card) {
        var nest_app = await NestedCard.findById({
          _id: `${sub?.applicable_card}`,
        }).populate({
          path: "remaining_array",
          populate: {
            path: "fee_receipt",
            populate: {
              path: "fee_structure",
            },
          },
        });
        var filtered = [];
        for (var qwe of nest_app?.remaining_array) {
          if (`${qwe?.status}` === "Paid" && qwe?.fee_receipt) {
            filtered.push(qwe);
          }
        }
        console.log("SET");
        await set_fee_head_query_redesign(
          sub?.student,
          filtered?.[0]?.remainAmount,
          sub?.appId,
          filtered?.[0]?.fee_receipt
        );
        filtered.splice(filtered?.[0], 1);

        for (var dtw of filtered) {
          console.log("UPDATE");
          await update_fee_head_query_redesign(
            sub?.student,
            dtw?.remainAmount,
            sub?.appId,
            dtw?.fee_receipt
          );
        }
      }
      console.log(i);
      i += 1;
    }

    res.status(200).send({
      message: "Explore All Student Fee Heads Insertion Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentHeadsQuery = async (req, res) => {
  try {
    var nums = ["6501a1fcdf2fe86f89504caa"];
    // var fine = ["644a09d6d1679fcd6e76e5ef"]
    // var all_struct = await FeeStructure.find({ $and: [{ finance: { $in: fine }} ]})

    // var all_remain = await RemainingList.find({ fee_structure: { $in: all_struct } })
    var all_remain = await RemainingList.find({ _id: { $in: nums } })
      .populate({
        path: "fee_structure",
      })
      .populate({
        path: "student",
      });
    var i = 0;
    for (var sub of all_remain) {
      if (sub?.applicable_card) {
        var nest_app = await NestedCard.findById({
          _id: `${sub?.applicable_card}`,
        }).populate({
          path: "remaining_array",
          populate: {
            path: "fee_receipt",
          },
        });
        var filtered = [];
        for (var qwe of nest_app?.remaining_array) {
          if (`${qwe?.status}` === "Paid" && qwe?.fee_receipt) {
            filtered.push(qwe);
          }
        }
        for (var dtw of filtered) {
          dtw.fee_receipt.fee_heads = [];
          await dtw.fee_receipt.save();
        }
      }
      if (sub.student) {
        sub.student.active_fee_heads = [];
        await sub.student.save();
      }
      console.log(i);
      i += 1;
    }

    res.status(200).send({
      message: "Explore All Student Fee Heads Set TO ZERO Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

const delete_fee_heads = async (rec, all) => {
  try {
    for (var ele of rec?.fee_heads) {
      if (`${ele?.fee_structure}` === `${all?.fee_structure}`) {
        ref.fee_heads.pull(ele?._id);
      } else {
        console.log("not match");
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelBugQuery = async (req, res) => {
  try {
    var all_remain = await RemainingList.findById({
      _id: "6501a224df2fe86f89505380",
    });
    for (var ref of all_remain?.fee_receipts) {
      const receipt = await FeeReceipt.findById({ _id: `${ref}` });
      await delete_fee_heads(receipt, all_remain);
    }
    res.status(200).send({ message: "Explore Receipt Bug", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentStructureBugQuery = async (req, res) => {
  try {
    var { cid } = req.query;
    const classes = await Class.findById(cid);
    const all_student = await Student.find({
      _id: { $in: classes?.promoteStudent },
    });

    // For Fee Structure Collect To OLD

    // for (var ref of all_student) {
    //   ref.old_fee_structure = ref?.fee_structure;
    //   await ref.save();
    // }

    // Assign New Structure To Remaining Card

    for (var ref of all_student) {
      var struct = await FeeStructure.findById({
        _id: `${ref?.fee_structure}`,
      });
      var remain = await RemainingList.findOne({
        $and: [
          { student: `${ref?._id}` },
          { fee_structure: ref?.old_fee_structure },
        ],
      });
      remain.fee_structure = struct?._id;
      remain.applicable_fee = struct?.total_admission_fees;
      await remain.save();
    }

    // Fee Receipt + Card Amount Re-Order

    // for (var ref of all_student) {
    //   var remain = await RemainingList.findOne({
    //     $and: [
    //       { student: `${ref?._id}` },
    //       { fee_structure: ref?.fee_structure },
    //     ],
    //   });
    //   for (var ele of remain?.fee_receipts) {
    //     var receipt = await FeeReceipt.findById({ _id: `${ele}` });
    //     // if(remain?.status = "Paid"){
    //     // remain.paid_fee = remain?.
    //     // }
    //   }
    //   remain.fee_structure = struct?._id;
    //   remain.applicable_fee = struct?.total_admission_fees;
    //   await remain.save();
    // }

    //
    res
      .status(200)
      .send({ message: "Explore Student Structure ", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentsStructureBugQuery = async (req, res) => {
  try {
    const student = await Student.findById({ _id: req?.query.sid });
    student.fee_structure = req?.query.structure;
    await student.save();
    res.status(200).send({ message: "Explore" });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentDataQuery = async (req, res) => {
  try {
    var { cid } = req.query;
    const classes = await Class.findById(cid);
    const all_student = await Student.find({
      _id: { $in: classes?.promoteStudent },
    }).select("fee_structure");

    var arr = [];
    for (var ref of all_student) {
      var remain = await RemainingList.findOne({
        $and: [
          { student: `${ref?._id}` },
          { fee_structure: ref?.fee_structure },
        ],
      })
        .select("applicable_fee remaining_array remaining_fee")
        // .select("applicable_fee")
        .populate({
          path: "fee_receipts",
          select: "fee_payment_amount fee_heads", //fee_heads
        })
        .populate({
          path: "fee_structure",
          select: "total_admission_fees one_installments",
        })
        .populate({
          path: "student",
          select: "valid_full_name",
        });
      if (remain?.fee_receipts?.length > 0) {
      } else {
        arr.push(remain);
        //   remain.remaining_fee = remain?.fee_structure?.total_admission_fees;
        // remain.remaining_array[0].remainAmount =
        //   remain?.fee_structure?.one_installments?.fees;
        // await remain.save();
      }
    }
    res
      .status(200)
      .send({ message: "Exlplore", access: true, all: arr, num: arr?.length });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentDataHeadsQuery = async (req, res) => {
  try {
    var { cid } = req.query;
    const classes = await Class.findById(cid);
    const all_student = await Student.find({
      _id: { $in: classes?.promoteStudent },
    }).populate({
      path: "fee_structure",
    });

    // for (var ref of all_student) {
    //   for (var ele of ref?.active_fee_heads) {
    //     if (`${ele?.fee_structure}` === `${ref?.old_fee_structure}`) {
    //       console.log("match");
    //       ref.active_fee_heads.pull(ele?._id);
    //     }
    //   }
    //   await ref.save();
    // }

    // for (var ref of all_student) {
    //   var remain = await RemainingList.findOne({ $and: [{ student: `${ref?._id}`}, { fee_structure: ref?.fee_structure}]})
    //   for(var ele of remain?.fee_receipts){
    //     var receipt = await FeeReceipt.findById({ _id: `${ele}`})
    //     receipt.fee_heads = []
    //     await receipt.save()
    //   }
    // }

    for (var ref of all_student) {
      var remain = await RemainingList.findOne({
        $and: [
          { student: `${ref?._id}` },
          { fee_structure: ref?.fee_structure },
        ],
      });
      for (var ele of remain?.fee_receipts) {
        var receipt = await FeeReceipt.findById({ _id: `${ele}` });
        await set_fee_head_query_redesign(
          ref,
          receipt?.fee_payment_amount,
          receipt?.application,
          receipt
        );
      }
    }
    res.status(200).send({ message: "Deleted Fee Heads", access: true });
  } catch (e) {
    console.log(e);
  }
};

// exports.renderRetroOneStudentStructureQuery = async (req, res) => {
//   try {
//     const { new_fee_struct } = req.params;
//     if (!new_fee_struct)
//       return res.status(200).send({
//         message: "Their is a bug need to fixed immediately",
//         access: false,
//       });
//     const new_struct = await FeeStructure.findById({ _id: new_fee_struct });
//     res.status(200).send({
//       message: "Explore New Fee Structure Edit",
//       access: true,
//       results,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

exports.renderCardUpdateQuery = async (req, res) => {
  try {
    const { id } = req.query;
    var all_student = await Student.find({ institute: id });
    for (var ref of all_student) {
      var all_card = await RemainingList.find({ student: `${ref?._id}` });
      var count = 0;
      for (var ele of all_card) {
        count += ele?.remaining_fee;
      }
      ref.admissionRemainFeeCount = count;
      await ref.save();
      count = 0;
    }
    res
      .status(200)
      .send({ message: "Explore Remaining Fees Updated Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderCardFeeHeadsQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { arr, block } = req?.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var array = [];
    var ins = await InstituteAdmin.findById({ _id: id });
    // var finance = await Finance.findById({ _id: `${ins?.financeDepart?.[0]}` });
    var receipt = await RemainingList.find({
      _id: { $in: arr },
    })
      .populate({
        path: "student",
        populate: {
          path: "fee_structure",
        },
      })
      .populate({
        path: "fee_structure",
      });
    // for (var ref of receipt) {
    //   if (block) {
    //     if (ref?.student?.active_fee_heads?.length > 0) {
    //       for (var ele of ref?.student?.active_fee_heads) {
    //         if (`${ele?.appId}` === `${ref?.appId}`) {
    //           console.log("match");
    //           ref.student.active_fee_heads.pull(ele?._id);
    //         } else {
    //           // console.log("Not Match")
    //         }
    //       }
    //       await ref.student.save();
    //     }
    //   }
    //   if (ref?.applicable_card) {
    //     var nest_app = await NestedCard.findById({ _id: `${ref?.applicable_card}` })
    //       .populate({
    //         path: "remaining_array",
    //         populate: {
    //           path: "fee_receipt"
    //         }
    //     })
    //     for (var ele of nest_app?.remaining_array) {
    //       await receipt_set_fee_head_query_redesign(
    //         ref?.student,
    //         ref?.paid_fee,
    //         ref?.appId,
    //         ref
    //       );
    //     }
    //   }
    // }
    // // else {
    //   await set_fee_head_query_redesign(
    //     student,
    //     ref?.fee_payment_amount,
    //     ref?.application,
    //     ref
    //   );

    res.status(200).send({
      message: "Explore All Student Fee Heads Query",
      access: true,
      count: receipt?.length,
      receipt,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_remove_dup_heads = async (req, res) => {
  try {
    var all_card = await RemainingList.findById({
      _id: "65146143762226337a0d9c1d",
    }).populate({
      path: "fee_receipts",
    });
    for (var ref of all_card?.fee_receipts) {
      for (var ele of ref?.fee_heads) {
        if (`${ele?.fee_structure}` === `${ref?.fee_structure}`) {
          console.log("match");
        } else {
          // ref.fee_heads.pull(ele?._id)
          console.log("NOT MATCH");
        }
      }
      await ref.save();
    }
    res.status(200).send({ message: "Explore Data", all_card });
  } catch (e) {
    console.log(e);
  }
};

exports.render_old_data_receipt_query = async (req, res) => {
  try {
    // var all_remain_card = await RemainingList.findById({
    //   _id: "6501a891df2fe86f89506e7b",
    // });
    const { id } = req?.query;
    var all_remain_card = await RemainingList.find({ institute: id });
    for (var val of all_remain_card) {
      for (var ref of val?.fee_receipts) {
        var receipt = await FeeReceipt.findById({ _id: `${ref}` });
        for (var ele of receipt?.fee_heads) {
          if (`${ele?.fee_structure}` === `${val?.fee_structure}`) {
            console.log("Exist + Match");
            ele.appId = receipt?.application;
          } else {
            console.log("no..............:");
          }
        }
        await receipt.save();
      }
    }

    res
      .status(200)
      .send({ message: "Explore Remaining Fee Receipt Exporting Query Fixed" });
  } catch (e) {
    console.log(e);
  }
};

exports.renderArrangeClassQuery = async (req, res) => {
  try {
    const { cid } = req?.params;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const classes = await Class.findById({ _id: cid });

    const all_student = await Student.find({
      _id: { $in: classes?.ApproveStudent },
    });

    var total = 0;
    for (var ele of all_student) {
      total += 1;
      ele.studentROLLNO = `${total}`;
      ele.studentGRNO = `PH0${total}`;
      await ele.save();
    }
    res.status(200).send({ message: "Explore Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderManageTabQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await Admission.findByIdAndUpdate(aid, req?.body);
    res
      .status(200)
      .send({ message: "Explore Available Tabs Queyr", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderReviewStudentQuery = async (req, res) => {
  try {
    const { aid } = req?.params;
    const { student_arr, staffId } = req?.body;
    if (!aid && !student_arr)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var app = await NewApplication.findById({ _id: aid });
    if (student_arr?.length > 0) {
      for (var val of student_arr) {
        const student = await Student.findById({ _id: val?.sid });
        if (app?.reviewApplication?.includes(`${val?.sid}`)) {
          app.confirmedApplication.pull(val?.cid);
          if (app?.confirmCount > 0) {
            app.confirmCount -= 1;
          }
        } else {
          app.reviewApplication.push(val?.sid);
          app.review_count += 1;
          app.confirmedApplication.pull(val?.cid);
          if (app?.confirmCount > 0) {
            app.confirmCount -= 1;
          }
        }
        student.student_application_obj.push({
          app: app?._id,
          staff: staffId,
          flow: "confirm_by",
        });
        await student.save();
      }
      await app.save();
    }
    res
      .status(200)
      .send({ message: "Explore Student Review Status Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderShiftGovernmentApplicableQuery = async (req, res) => {
  try {
    const { rid } = req?.params;
    const { price } = req?.body;
    if (!rid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var remain_list = await RemainingList.findById({ _id: rid });
    if (remain_list?.government_card) {
      var nest_gov_card = await NestedCard.findById({
        _id: `${remain_list?.government_card}`,
      });
      var nest_app_card = await NestedCard.findById({
        _id: `${remain_list?.applicable_card}`,
      });
      var shift_num = 0;
      for (var val of nest_gov_card?.remaining_array) {
        if (price && price > 0) {
          if (`${val?.status}` === "Not Paid") {
            if (price <= val?.remainAmount) {
              val.remainAmount =
                val.remainAmount - price == 0
                  ? val.remainAmount
                  : val.remainAmount - price;
            }
            shift_num += price;
            if (val.remainAmount - price == 0) {
              val.status = "Paid";
            } else if (val.remainAmount > 0) {
              val.status = "Not Paid";
            } else {
              val.status = "Paid";
            }
            val.revert_status = "Government Fees Shifted To Applicable Fees";
            if (nest_gov_card?.remaining_fee >= price) {
              nest_gov_card.remaining_fee -= price;
            }
            if (nest_gov_card?.applicable_fee >= price) {
              nest_gov_card.applicable_fee -= price;
            }
          }
        } else {
          if (`${val?.status}` === "Not Paid") {
            shift_num += val?.remainAmount;
            val.status = "Paid";
            val.revert_status = "Government Fees Shifted To Applicable Fees";
            if (nest_gov_card?.remaining_fee >= val?.remainAmount) {
              nest_gov_card.remaining_fee -= val?.remainAmount;
            }
            if (nest_gov_card?.applicable_fee >= val?.remainAmount) {
              nest_gov_card.applicable_fee -= val?.remainAmount;
            }
          }
        }
      }
      if (
        nest_app_card?.remaining_array[
          nest_app_card?.remaining_array?.length - 1
        ]?.status === "Not Paid"
      ) {
        nest_app_card.remaining_array[
          nest_app_card?.remaining_array?.length - 1
        ].component.app =
          nest_app_card.remaining_array[
            nest_app_card?.remaining_array?.length - 1
          ].remainAmount;
        nest_app_card.remaining_array[
          nest_app_card?.remaining_array?.length - 1
        ].component.gov = shift_num;
        nest_app_card.remaining_array[
          nest_app_card?.remaining_array?.length - 1
        ].remainAmount += shift_num;
        nest_app_card.applicable_fee += shift_num;
        nest_app_card.remaining_fee += shift_num;
      } else {
        var valid_count =
          remain_list?.paid_fee > nest_app_card?.applicable_fee
            ? remain_list?.paid_fee - nest_app_card?.applicable_fee
            : 0;
        // console.log(valid_count)
        // console.log(shift_num)
        if (valid_count > 0) {
          console.log("VALID COUNT EXIST", valid_count);
          if (valid_count > shift_num) {
            console.log("VALID COUNT GREATER SHIFT NUM");
            if (
              nest_app_card?.remaining_array[
                nest_app_card?.remaining_array?.length - 1
              ]?.cover_status
            ) {
              nest_app_card.remaining_array.push({
                remainAmount: shift_num,
                appId: remain_list?.appId,
                instituteId: remain_list?.institute,
                installmentValue: "Installment Remain",
                isEnable: true,
                status: "Paid",
                revert_status: "Government Fees (Pay By Student)",
                mode: nest_app_card?.remaining_array[
                  nest_app_card?.remaining_array?.length - 1
                ]?.mode,
                fee_receipt:
                  nest_app_card?.remaining_array[
                    nest_app_card?.remaining_array?.length - 1
                  ]?.fee_receipt,
                cover_status: `${
                  nest_app_card?.remaining_array[
                    nest_app_card?.remaining_array?.length - 1
                  ]?.cover_status
                } - Government Fees Set Off With the Excess Fees ${shift_num}`,
              });
              // if (remain_list.paid_fee > valid_count) {
              //   remain_list.paid_fee -= valid_count
              // }
            } else {
              console.log("ENTER IN COVER ELSE");
              var set_clear;
              if (nest_app_card?.paid_fee > nest_app_card?.applicable_fee) {
                set_clear =
                  nest_app_card?.paid_fee -
                    nest_app_card?.applicable_fee -
                    shift_num ==
                  0
                    ? "CLEAR"
                    : "NOT CLEAR";
              }
              if (set_clear === "CLEAR") {
                console.log("ENTER CLEAR");
                nest_app_card.remaining_array.push({
                  remainAmount: shift_num,
                  appId: remain_list?.appId,
                  instituteId: remain_list?.institute,
                  installmentValue: "Installment Remain",
                  isEnable: true,
                  status: "Paid",
                  revert_status: "Government Fees (Pay By Student)",
                  set_off_message:
                    "Govt/Scholarship transferred to applicable adjusted against fees paid",
                  set_off: shift_num,
                });

                if (nest_app_card?.remaining_fee >= shift_num) {
                  nest_app_card.remaining_fee - shift_num;
                }
                if (remain_list?.remaining_fee >= shift_num) {
                  remain_list.remaining_fee - shift_num;
                }
                if (remain_list?.remaining_fee <= 0) {
                  remain_list.status = "Paid";
                }
              } else {
                console.log("NOT CLEAR");
                var set_nclear = {
                  p: 0,
                  s: "",
                };
                var sets = {
                  p: 0,
                  s: "",
                };
                if (nest_app_card?.paid_fee > nest_app_card?.applicable_fee) {
                  set_nclear.p =
                    nest_app_card?.paid_fee - nest_app_card?.applicable_fee;
                }
                console.log(set_nclear.p);
                if (set_nclear.p > shift_num) {
                  sets.p = set_nclear.p - shift_num;
                  sets.s = "Paid";
                } else if (set_nclear.p < shift_num) {
                  sets.p = shift_num - set_nclear.p;
                  sets.s = "Not Paid";
                } else {
                  sets.p = set_nclear.p;
                  sets.s = "Paid";
                }
                nest_app_card.remaining_array.push({
                  remainAmount: sets.p,
                  appId: remain_list?.appId,
                  instituteId: remain_list?.institute,
                  installmentValue: "Installment Remain",
                  isEnable: true,
                  status: sets.s,
                  revert_status: "Government Fees (Pay By Student)",
                });

                if (sets.s === "Paid") {
                  nest_app_card.remaining_fee = 0;
                  remain_list.remaining_fee = 0;
                  remain_list.status = "Not Paid";
                }
              }
            }
          } else if (valid_count < shift_num) {
            console.log("VALID COUNT LESS SHIFT NUM");
            nest_app_card.remaining_array.push({
              remainAmount: shift_num,
              appId: remain_list?.appId,
              instituteId: remain_list?.institute,
              installmentValue: "Installment Remain",
              isEnable: true,
              revert_status: "Government Fees (Pay By Student)",
              set_off: valid_count,
            });
            nest_app_card.remaining_fee += shift_num;
            remain_list.remaining_fee += shift_num;
            remain_list.status = "Not Paid";
            // if (remain_list.paid_fee > valid_count) {
            //   remain_list.paid_fee -= valid_count
            // }
          } else {
            console.log("Bug Generated");
          }
        } else {
          console.log("ENTER IN ELSE");
          nest_app_card.remaining_array.push({
            remainAmount: shift_num,
            appId: remain_list?.appId,
            instituteId: remain_list?.institute,
            installmentValue: "Installment Remain",
            isEnable: true,
            revert_status: "Government Fees (Pay By Student)",
          });
          nest_app_card.remaining_fee += shift_num;
          remain_list.remaining_fee += shift_num;
          remain_list.status = "Not Paid";
        }
        nest_app_card.applicable_fee += shift_num;
      }
      await Promise.all([
        nest_gov_card.save(),
        nest_app_card.save(),
        remain_list.save(),
      ]);
    }
    res.status(200).send({
      message: "Explore New Shifted Card Back To Applicable Fees Section",
      access: true,
      nest_app_card,
      nest_gov_card,
    });
    var student = await Student.findById({ _id: `${remain_list?.student}` });
    for (let ele of nest_app_card?.remaining_array) {
      if (`${ele?.revert_status}` === "Government Fees (Pay By Student)") {
        student.apps_fees_obj.appId = remain_list?.appId;
        student.apps_fees_obj.struct = remain_list?.fee_structure;
        student.apps_fees_obj.gta = ele?.remainAmount;
      }
    }
    await student.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderShiftApplicableToGovernmentQuery = async (req, res) => {
  try {
    const { rid } = req?.params;
    const { raid, amount } = req?.body;
    if (!rid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var remain_list = await RemainingList.findById({ _id: rid });
    if (remain_list?.government_card) {
      var nest_gov_card = await NestedCard.findById({
        _id: `${remain_list?.government_card}`,
      });
      var nest_app_card = await NestedCard.findById({
        _id: `${remain_list?.applicable_card}`,
      });
      for (var val of nest_app_card?.remaining_array) {
        if (`${val?.status}` === "Not Paid" && `${val?._id}` === `${raid}`) {
          if (val?.remainAmount - amount > 0) {
            val.status = "Not Paid";
          } else {
            val.status = "Paid";
          }
          val.remainAmount -= amount;
          val.revert_status = "Applicable Fees Shifted To Government Fees";
          val.set_off += amount;
          val.set_off_message = `Applicable Fees set off ${val.set_off} with government fees`;
          if (nest_app_card?.remaining_fee >= amount) {
            nest_app_card.remaining_fee -= amount;
          }
          if (remain_list?.remaining_fee >= amount) {
            remain_list.remaining_fee -= amount;
          }
          if (nest_app_card?.applicable_fee >= amount) {
            nest_app_card.applicable_fee -= amount;
          }
          nest_gov_card.applicable_fee += amount;
          if (remain_list?.remaining_fee <= 0) {
            remain_list.status = "Paid";
          }
          if (amount > 0) {
            nest_gov_card.remaining_array.push({
              status: "Not Paid",
              instituteId: remain_list?.institute,
              appId: remain_list?.appId,
              isEnable: true,
              installmentValue: "Installment Remain",
              remainAmount: amount,
            });
          }
        }
      }
      await Promise.all([
        nest_gov_card.save(),
        nest_app_card.save(),
        remain_list.save(),
      ]);
    }
    res.status(200).send({
      message: "Explore New Shifted Card Back To Government Fees Section",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

const remove_duplicated = (arr) => {
  jsonObject = arr.map(JSON.stringify);
  uniqueSet = new Set(jsonObject);
  uniqueArray = Array.from(uniqueSet).map(JSON.parse);
  return uniqueArray;
};

exports.renderAllOutstandingQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { all_depart, batch_status, master, depart, batch } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    var ads_admin = await Admission.findById({ _id: aid }).select(
      "alarm_count institute"
    );
    if (all_depart === "ALL") {
      var arr = [];
      var all_dept = await Department.find({ institute: ads_admin?.institute });
      var all_student = await Student.find({ department: { $in: all_dept } })
        .select(
          "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO"
        )
        .populate({
          path: "user",
          select: "deviceToken userEmail",
        })
        .populate({
          path: "institute",
          select: "insName",
        });
      var all_remain = await RemainingList.find({
        student: { $in: all_student },
      })
        .populate({
          path: "fee_structure",
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO",
          populate: {
            path: "user",
            select: "userEmail deviceToken",
          },
        });
      for (var ref of all_remain) {
        if (ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0) {
          arr.push(ref?.student);
        }
      }
      all_student = remove_duplicated(arr);
      res.status(200).send({
        message: "Explore All Student Query",
        access: true,
        all_student: all_student,
        count: all_student?.length,
      });
    } else if (all_depart === "PARTICULAR") {
      if (batch_status === "ALL_BATCH") {
        var arr = [];
        var valid_dept = await Department.findById({ _id: depart });
        const all_classes = await Class.find({
          masterClassName: { $in: master },
        });
        if (all_classes?.length > 0) {
          var all_student = await Student.find({
            $and: [
              { department: valid_dept?._id },
              { batches: { $in: valid_dept?.batches } },
              { studentClass: { $in: all_classes } },
            ],
          })
            .select(
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO"
            )
            .populate({
              path: "user",
              select: "deviceToken userEmail",
            })
            .populate({
              path: "institute",
              select: "insName",
            });
          var all_remain = await RemainingList.find({
            student: { $in: all_student },
          })
            .populate({
              path: "fee_structure",
            })
            .populate({
              path: "student",
              select:
                "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO",
              populate: {
                path: "user",
                select: "userEmail deviceToken",
              },
            });
          for (var ref of all_remain) {
            if (ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0) {
              arr.push(ref?.student);
            }
          }
          all_student = remove_duplicated(arr);
          res.status(200).send({
            message: "Explore All For All Batch With Standard Student Query",
            access: true,
            all_student: all_student,
            count: all_student?.length,
          });
        }
        var all_student = await Student.find({
          $and: [
            { department: valid_dept?._id },
            { batches: { $in: valid_dept?.batches } },
          ],
        })
          .select(
            "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO"
          )
          .populate({
            path: "user",
            select: "deviceToken userEmail",
          })
          .populate({
            path: "institute",
            select: "insName",
          });
        var all_remain = await RemainingList.find({
          student: { $in: all_student },
        })
          .populate({
            path: "fee_structure",
          })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO",
            populate: {
              path: "user",
              select: "userEmail deviceToken",
            },
          });
        for (var ref of all_remain) {
          if (ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0) {
            arr.push(ref?.student);
          }
        }
        all_student = remove_duplicated(arr);
        res.status(200).send({
          message: "Explore All Student For All Batch Query",
          access: true,
          all_student: all_student,
          count: all_student?.length,
        });
      } else if (batch_status === "PARTICULAR_BATCH") {
        var arr = [];
        const all_classes = await Class.find({
          masterClassName: { $in: master },
        });
        if (all_classes?.length > 0) {
          var all_student = await Student.find({
            $and: [
              { department: depart },
              { batches: batch },
              { studentClass: { $in: all_classes } },
            ],
          })
            .select(
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO"
            )
            .populate({
              path: "user",
              select: "deviceToken userEmail",
            })
            .populate({
              path: "institute",
              select: "insName",
            });
          var all_remain = await RemainingList.find({
            student: { $in: all_student },
          })
            .populate({
              path: "fee_structure",
            })
            .populate({
              path: "student",
              select:
                "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO",
              populate: {
                path: "user",
                select: "userEmail deviceToken",
              },
            });
          for (var ref of all_remain) {
            if (ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0) {
              arr.push(ref?.student);
            }
          }
          all_student = remove_duplicated(arr);
          res.status(200).send({
            message:
              "Explore All For Particular Batch with Standard Student Query",
            access: true,
            all_student: all_student,
            count: all_student?.length,
          });
        } else {
          var all_student = await Student.find({
            $and: [{ department: depart }, { batches: batch }],
          })
            .select(
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO"
            )
            .populate({
              path: "user",
              select: "deviceToken userEmail",
            })
            .populate({
              path: "institute",
              select: "insName",
            });
          var all_remain = await RemainingList.find({
            student: { $in: all_student },
          })
            .populate({
              path: "fee_structure",
            })
            .populate({
              path: "student",
              select:
                "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO",
              populate: {
                path: "user",
                select: "userEmail deviceToken",
              },
            });
          for (var ref of all_remain) {
            if (ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0) {
              arr.push(ref?.student);
            }
          }
          all_student = remove_duplicated(arr);
          res.status(200).send({
            message: "Explore All For Particular Batch Student Query",
            access: true,
            all_student: all_student,
            count: all_student?.length,
          });
        }
      }
      if (!batch_status) {
        var arr = [];
        var valid_dept = await Department.findById({ _id: depart });
        const all_classes = await Class.find({
          masterClassName: { $in: master },
        });
        if (all_classes?.length > 0) {
          var all_student = await Student.find({
            $and: [
              { department: valid_dept?._id },
              { studentClass: { $in: all_classes } },
            ],
          })
            .select(
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO"
            )
            .populate({
              path: "user",
              select: "deviceToken userEmail",
            })
            .populate({
              path: "institute",
              select: "insName",
            });
        }
        var all_student = await Student.find({
          $and: [{ department: valid_dept?._id }],
        })
          .select(
            "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO"
          )
          .populate({
            path: "user",
            select: "deviceToken userEmail",
          })
          .populate({
            path: "institute",
            select: "insName",
          });

        var all_remain = await RemainingList.find({
          student: { $in: all_student },
        })
          .populate({
            path: "fee_structure",
          })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO",
            populate: {
              path: "user",
              select: "userEmail deviceToken",
            },
          });
        for (var ref of all_remain) {
          if (ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0) {
            arr.push(ref?.student);
          }
        }
        all_student = remove_duplicated(arr);
        console.log("Alert");
        res.status(200).send({
          message: "Explore All Student Query",
          access: true,
          all_student: all_student,
          count: all_student?.length,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderReAdmissionQuery = async (req, res) => {
  try {
    const { fid, sid } = req?.params;
    if (!fid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const remain_card = await RemainingList.findOne({
      $and: [{ fee_structure: fid }, { student: sid }],
    })
      .populate({
        path: "fee_structure",
        populate: {
          path: "category_master",
          select: "category_name",
        },
      })
      .populate({
        path: "applicable_card",
      })
      .populate({
        path: "government_card",
      });
    res.status(200).send({
      message: "Explore New One Re-Admission Fee Structure Query",
      access: true,
      remain_card: remain_card,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderInstituteChargesQuery = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const new_charges = await Charges.findOne({ institute: id });
    res.status(200).send({
      message: "Explore One Institute Charges Query",
      access: true,
      new_charges: new_charges,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.government_card_removal_query = async (req, res) => {
  try {
    const { card_arr } = req?.body;
    // const { aid } = req?.params
    // if (!aid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    // var fine = ["64bd56efac3512e4520fb9fa", "644a09d6d1679fcd6e76e5ef"]
    // var all_struct = await FeeStructure.find({ $and: [{ finance: { $in: fine} }, { total_installments: "1" }] })
    // var nums = []
    // var cards = []
    // // var all_remain = await RemainingList.find({ _id: { $in: nums } })
    // .populate({
    //   path: "fee_structure"
    // })

    var all_remain = await RemainingList.find({
      _id: { $in: card_arr },
    }).populate({
      path: "fee_structure",
    });
    // .populate({
    //   path: "student",
    //   select: "studentFirstName studentMiddleName studentLastName"
    // })

    var i = 0;
    for (var val of all_remain) {
      if (val?.applicable_card) {
        var n_app = await NestedCard.findById({
          _id: `${val?.applicable_card}`,
        });
        n_app.remaining_array.push({
          remainAmount: n_app?.remaining_fee,
          isEnable: true,
          instituteId: val?.institute,
          appId: val?.appId,
          installmentValue: "Installment Remain",
        });
        val.remaining_fee = n_app?.remaining_fee;
        if (val?.remaining_fee > 0) {
          val.status = "Not Paid";
        }
        // .populate({
        //   path: "remaining_array",
        //   populate: {
        //     path: "fee_receipt"
        //   }
        // })
        // if (n_app?.paid_fee > 0 && n_app?.paid_fee < n_app?.applicable_fee) {
        //   // n_app.remaining_fee = 0
        //   // val.remaining_fee = 0
        console.log(i);
        i += 1;
        // }
        // for (var ele of n_app?.remaining_array) {
        //   if (ele?.fee_receipt?.fee_payment_mode === "Government/Scholarship") {
        //     // if (n_app?.paid_fee >= ele?.remainAmount) {
        //     //   n_app.paid_fee -= ele?.remainAmount
        //     // }
        //     // if (val?.paid_fee >= ele?.remainAmount) {
        //     //   val.paid_fee -= ele?.remainAmount
        //     // }
        //     // n_app.remaining_array.pull(ele?._id)
        //     nums.push(val?.student)
        //     cards.push(val?._id)
        //       console.log(i)
        //       i += 1
        //   }
        // }
        // if (val?.remaining_fee <= 0) {
        //   val.status = "Paid"
        // }
        await n_app.save();
      }
      await val.save();
    }
    res.status(200).send({
      message:
        "Explore All Student Nested Government Remaining Card + Installment Modify + Clear",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllFeeStructureListQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    // const all_struct = await FeeStructure.findById({ _id: "6480700bbff5c201991d438f"})
    //   all_struct.total_installments = "1"
    //   all_struct.two_installments.fees = 0
    //   await all_struct.save()

    const all_struct = await FeeStructure.find({
      $and: [{ finance: fid }, { total_installments: "2" }],
    });
    // .select("structure_name unique_structure_name total_installments")
    for (var val of all_struct) {
      val.total_installments = "1";
      val.two_installments.fees = 0;
      await val.save();
    }
    if (all_struct?.length > 0) {
      res.status(200).send({
        message: "Explore All Fee Structures greater than 2 or equal ",
        access: true,
        all_struct: all_struct,
        count: all_struct?.length,
      });
    } else {
      res.status(200).send({
        message: "No Fee Structure Available",
        access: false,
        all_struct: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllStudentQuery = async (req, res) => {
  try {
    // const { aid } = req?.params
    // const { fee_arr } = req?.body
    // if (!aid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    // 648144d2bff5c2019924603f, 64814215bff5c20199240782
    // var nums = ["64809b0dbff5c201991f3aed"]
    var fine = ["64bd56efac3512e4520fb9fa", "644a09d6d1679fcd6e76e5ef"];
    var all_struct = await FeeStructure.find({
      $and: [{ finance: { $in: fine } }, { total_installments: "1" }],
    });
    // var nums = []
    // for (var val of all_struct) {
    //   nums.push(val?._id)
    // }
    var all_remain = await RemainingList.find({
      fee_structure: { $in: all_struct },
    }).populate({
      path: "fee_structure",
    });

    //   var all_remain = await RemainingList.find({ _id: { $in: nums }})
    //   .populate({
    //   path: "fee_structure"
    // })

    var i = 0;
    for (var val of all_remain) {
      if (val?.applicable_card) {
        var n_app = await NestedCard.findById({
          _id: `${val?.applicable_card}`,
        });

        if (n_app?.paid_fee <= n_app?.applicable_fee) {
          if (`${val?.access_mode_card}` === "One_Time_Wise") {
            console.log("INSERTED IR");
            const numss = n_app?.applicable_fee - n_app?.paid_fee;
            if (numss > 0) {
              // ele.remainAmount = numss
              n_app.remaining_array.push({
                remainAmount: numss,
                isEnable: true,
                instituteId: val?.institute,
                appId: val?.appId,
                installmentValue: "Installment Remain",
              });
            }
            n_app.remaining_fee = n_app?.applicable_fee - n_app?.paid_fee;
            val.remaining_fee = n_app?.applicable_fee - n_app?.paid_fee;
            if (val?.remaining_fee <= 0) {
              val.status = "Paid";
            } else {
              val.status = "Not Paid";
            }
            console.log(i);
            i += 1;
          }
          // if (`${ele?.installmentValue}` === "Installment Remain") {
          //   console.log("INSERTED IR")
          //   const numss = n_app?.applicable_fee - n_app?.paid_fee
          //   if (numss > 0) {
          //     ele.remainAmount = numss
          //   }
          //     n_app.remaining_fee = n_app?.applicable_fee - n_app?.paid_fee
          //     val.remaining_fee = n_app?.applicable_fee - n_app?.paid_fee
          //   if (val?.remaining_fee <= 0) {
          //     val.status = "Paid"
          //   }
          //   else {
          //     val.status = "Not Paid"
          //   }
          // }
        }
        // var n_gov = await NestedCard.findById({ _id: `${val?.government_card}` })
        // if (val?.fee_structure?.total_installments === "1") {
        //   // for (var ele of n_app.remaining_array) {
        //   //   // if (ele?.status === "Paid") {

        //   //   // }
        //   //   // else {
        //   //   //   // if (`${ele?.installmentValue}` === "First Installment") {
        //   //   //   //   n_app.remaining_array.push({
        //   //   //   //     remainAmount: val?.fee_structure?.one_installments?.fees - ele?.remainAmount,
        //   //   //   //     isEnable: true,
        //   //   //   //     instituteId: val?.institute,
        //   //   //   //     appId: val?.appId,
        //   //   //   //     installmentValue: "Installment Remain"
        //   //   //   //   })
        //   //   //   // }
        //   //   //   // if (n_app?.paid_fee == n_app?.applicable_fee) {
        //   //   //   //   if (`${ele?.installmentValue}` === "Second Installment") {
        //   //   //   //     console.log("INSERTED SI")
        //   //   //   //     n_app.remaining_array.pull(ele?._id)
        //   //   //   //     if (n_app?.remaining_fee >= ele?.remainAmount) {
        //   //   //   //       n_app.remaining_fee -= ele?.remainAmount
        //   //   //   //     }
        //   //   //   //     if (val?.remaining_fee >= ele?.remainAmount) {
        //   //   //   //       val.remaining_fee -= ele?.remainAmount
        //   //   //   //     }
        //   //   //   //     if (val?.remaining_fee <= 0) {
        //   //   //   //       val.status = "Paid"
        //   //   //   //     }
        //   //   //   //     else {
        //   //   //   //       val.status = "Not Paid"
        //   //   //   //     }
        //   //   //   //   }
        //   //   //   //   if (`${ele?.installmentValue}` === "Installment Remain") {
        //   //   //   //     console.log("INSERTED IR")
        //   //   //   //     n_app.remaining_array.pull(ele?._id)
        //   //   //   //     if (n_app?.remaining_fee >= ele?.remainAmount) {
        //   //   //   //       n_app.remaining_fee -= ele?.remainAmount
        //   //   //   //     }
        //   //   //   //     if (val?.remaining_fee >= ele?.remainAmount) {
        //   //   //   //       val.remaining_fee -= ele?.remainAmount
        //   //   //   //     }
        //   //   //   //     if (val?.remaining_fee <= 0) {
        //   //   //   //       val.status = "Paid"
        //   //   //   //     }
        //   //   //   //     else {
        //   //   //   //       // val.status = "Not Paid"
        //   //   //   //     }
        //   //   //   //   }
        //   //   //   // }
        //   //   //   // else if (n_app?.paid_fee >= n_app?.applicable_fee) {
        //   //   //   //   if (`${ele?.installmentValue}` === "Second Installment") {
        //   //   //   //     console.log("INSERTED SI")
        //   //   //   //     n_app.remaining_array.pull(ele?._id)
        //   //   //   //     if (n_app?.remaining_fee >= ele?.remainAmount) {
        //   //   //   //       n_app.remaining_fee -= ele?.remainAmount
        //   //   //   //     }
        //   //   //   //     if (val?.remaining_fee >= ele?.remainAmount) {
        //   //   //   //       val.remaining_fee -= ele?.remainAmount
        //   //   //   //     }
        //   //   //   //     if (val?.remaining_fee <= 0) {
        //   //   //   //       val.status = "Paid"
        //   //   //   //     }
        //   //   //   //     else {
        //   //   //   //       // val.status = "Not Paid"
        //   //   //   //     }
        //   //   //   //   }
        //   //   //   //   if (`${ele?.installmentValue}` === "Installment Remain") {
        //   //   //   //     console.log("INSERTED IR")
        //   //   //   //     n_app.remaining_array.pull(ele?._id)
        //   //   //   //     if (n_app?.remaining_fee >= ele?.remainAmount) {
        //   //   //   //       n_app.remaining_fee -= ele?.remainAmount
        //   //   //   //     }
        //   //   //   //     if (val?.remaining_fee >= ele?.remainAmount) {
        //   //   //   //       val.remaining_fee -= ele?.remainAmount
        //   //   //   //     }
        //   //   //   //     if (val?.remaining_fee <= 0) {
        //   //   //   //       val.status = "Paid"
        //   //   //   //     }
        //   //   //   //     else {
        //   //   //   //       // val.status = "Not Paid"
        //   //   //   //     }
        //   //   //   //   }
        //   //   //   // }

        //   //   // }
        //   // }
        // }
        await n_app.save();
      }
      await val.save();
    }
    res.status(200).send({
      message: "Explore All Student Nested Remaining Card Modify + Clear + One",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderTransferAllCardQuery = async (req, res) => {
  try {
    var ins = ["64b63a46c1b160cdcedbb85d", "6449c83598fec071fbffd3ad"];
    const all_remain = await RemainingList.find({ institute: { $in: ins } });
    var i = 0;
    for (var val of all_remain) {
      // await render_new_fees_card_install(val?.fee_structure, val)
      await val.save();
      console.log(i);
      i += 1;
    }
    res
      .status(200)
      .send({ message: "Explore One Fees Card Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllStudentStatusQuery = async (req, res) => {
  try {
    var ins = ["64b63a46c1b160cdcedbb85d", "6449c83598fec071fbffd3ad"];
    const all_student = await Student.find({ institute: { $in: ins } });

    var i = 0;
    for (var val of all_student) {
      val.admission_amount_stats.total_fees = 0;
      val.admission_amount_stats.total_paid_fees = 0;
      val.admission_amount_stats.total_os_fees = 0;
      val.admission_amount_stats.total_app_fees = 0;
      val.admission_amount_stats.total_app_paid_fees = 0;
      val.admission_amount_stats.total_app_os_fees = 0;
      val.admission_amount_stats.total_gov_fees = 0;
      val.admission_amount_stats.total_gov_paid_fees = 0;
      val.admission_amount_stats.total_gov_os_fees = 0;
      await val.save();
      console.log(i);
      i += 1;
    }
    res.status(200).send({
      message: "Explore Student Admission Amount Status Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllStudentQueryNestedRemove = async (req, res) => {
  try {
    // const { aid } = req?.params
    // if (!aid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })
    // var ins = ["64b63a46c1b160cdcedbb85d", "6449c83598fec071fbffd3ad"]
    var fine = ["64bd56efac3512e4520fb9fa", "644a09d6d1679fcd6e76e5ef"];
    var all_struct = await FeeStructure.find({
      $and: [{ finance: { $in: fine } }, { total_installments: "1" }],
    });
    var nums = [];
    var all_remain = await RemainingList.find({
      fee_structure: { $in: all_struct },
    });

    var i = 0;
    for (var val of all_remain) {
      if (val?.applicable_card) {
        // var n_app = await NestedCard.findById({ _id: `${val?.applicable_card}` })
        // if (n_app?.remaining_array?.length > 0) {
        // }
        // else {
        //   n_app.remaining_fee = val?.paid_fee >= val?.applicable_fee ? val?.paid_fee - val?.applicable_fee : val?.applicable_fee - val?.paid_fee;
        //   for (var ele of val?.remaining_array) {
        //     n_app.remaining_array.push(ele)
        //   }
        //   await n_app.save()
        // }
      } else {
        // var n_app = await NestedCard.findById({ _id: `${val?.applicable_card}` })
        // if (n_app?.remaining_array?.length > 0) {

        // }
        // else {
        await render_new_fees_card_install(val?.fee_structure, val);
        // n_app.remaining_fee = val?.paid_fee >= val?.applicable_fee ? val?.paid_fee - val?.applicable_fee : val?.applicable_fee - val?.paid_fee;
        // for (var ele of val?.remaining_array) {
        //   n_app.remaining_array.push(ele)
        // }
        // await n_app.save()
        // }
        nums.push(val);
        console.log(i);
        i += 1;
      }
      // await Promise.all([n_app.save(), val.save()])
    }
    res.status(200).send({
      message: "Explore All Student Nested Remaining Card Clear",
      access: true,
      nums,
      count: nums?.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllStudentArray = async (req, res) => {
  try {
    const { arr } = req?.body;
    // 64bd56efac3512e4520fb9fa
    // 644a09d6d1679fcd6e76e5ef
    // var fine = ["644a09d6d1679fcd6e76e5ef"]
    // var all_struct = await FeeStructure.find({ $and: [{ finance: { $in: fine }}, { total_installments: "1" }]})
    // var nums = []
    // var all_remain = await RemainingList.find({ fee_structure: { $in: all_struct } })

    var all_remain = await RemainingList.find({ _id: { $in: arr } });

    var i = 0;
    for (var val of all_remain) {
      if (val?.applicable_card) {
        var n_app = await NestedCard.findById({
          _id: `${val?.applicable_card}`,
        });
        // if (n_app?.paid_fee >= n_app?.applicable_fee && n_app?.remaining_fee > 0) {
        // n_app.remaining_fee = 0
        // val.remaining_fee = 0
        // if (val?.remaining_fee <= 0) {
        //   val.status = "Paid"
        // }
        // await n_app.save()
        // }
        // if (n_app?.paid_fee < n_app?.applicable_fee && n_app?.remaining_fee > 0 && val?.status === "Paid") {
        // n_app.paid_fee += n_app.remaining_fee
        // n_app.remaining_fee = 0
        // val.remaining_fee = 0
        // if (val?.remaining_fee <= 0) {
        //   val.status = "Paid"
        // }
        // await n_app.save()
        // nums.push(val)
        //   console.log("I", i)
        //   i+= 1
        // }
        n_app.remaining_array.push({
          remainAmount: n_app?.remaining_fee,
          isEnable: true,
          instituteId: val?.institute,
          appId: val?.appId,
          installmentValue: "Installment Remain",
        });
        await n_app.save();
        console.log("I", i);
        i += 1;
        // if (n_app?.paid_fee < n_app?.applicable_fee && n_app?.remaining_fee > 0 && val?.status === "Not Paid") {
        //   for (var stu of n_app?.remaining_array) {

        //   }
        // }
      }
      // await val.save()
    }
    res.status(200).send({
      message: "Explore All Student Outstanding Fees Matching Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderChargesCardQuery = async (req, res) => {
  try {
    let nums = ["65c48434896ca745f41b7381"];
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const all_ins = await InstituteAdmin.find({ _id: { $in: nums } });

    for (var val of all_ins) {
      const new_charge = new Charges({});
      new_charge.institute = val?._id;
      new_charge.admin = admin?._id;
      admin.charges.push(new_charge?._id);
      val.charges = new_charge?._id;
      admin.charges_count += 1;
      await Promise.all([val.save(), new_charge.save()]);
    }
    await admin.save();
    res
      .status(200)
      .send({ message: "Put Institute Charges In Queue", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderValidateAppQuery = async (req, res) => {
  try {
    const exist_app = await NewApplication.find({
      $and: [
        { applicationDepartment: `${req.body?.depart}` },
        { applicationMaster: `${req.body?.master}` },
        { applicationBatch: `${req.body?.batch}` },
      ],
    });
    if (exist_app?.length > 0) {
      res.status(200).send({
        message: "Fee Application Already Exists",
        access: false,
        avail_app: exist_app?.length,
        exist_app: exist_app,
      });
    } else {
      res.status(200).send({
        message: "Proceed with new Application",
        access: true,
        avail_app: 0,
        exist_app: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

// exports.renderRemainingCardQuery = async (req, res) => {
//   try {
//     const { sid } = req?.query
//     const arr = ["652793596e3e6e615a0eae74", "648141adbff5c2019923f9ac"]
//     const remain_all = await RemainingList.find({ _id: { $in: arr }})
//       .populate({
//       path: "fee_structure"
//       })
//       .populate({
//         path: "student"
//       })
//       .populate({
//         path: "applicable_card"
//       })

//     var  i = 0
//     for (var val of remain_all) {
//       console.log(i)
//       i+=1
//       // if (val?.student?.active_fee_heads?.length > 0) {
//       //   console.log("Fee Heads Exists")
//       //   val.student.active_fee_heads = []
//       //   await val.student.save()
//       // }
//       // if {
//         console.log("Fee Heads Added New")
//         for (var ele of val?.applicable_card?.remaining_array) {
//           if (`${ele?.status}` === "Paid" && String(ele?._id) === String(val?.applicable_card?.remaining_array?.[0]?._id)) {
//             console.log("Enter & Set");
//             await set_fee_head_query2(val?.student, ele?.remainAmount, val?.appId, val?.fee_structure);
//             console.log("Exit & Set");
//           }
//           else {
//             if (`${ele?.status}` === "Paid") {
//               console.log("Update & Enter")
//               await update_fee_head_query2(val?.student, ele?.remainAmount, val?.appId);
//               console.log("Update & Exit")
//             }
//           }
//         }
//       }
//     // }

//     res.status(200).send({ message: "Fee Heads Insertion"})
//   }
//   catch (e) {
//     console.log(e)
//   }
// }

exports.renderRemainingCardQuery = async (req, res) => {
  try {
    const remain_all = await RemainingList.find({});

    var i = 0;
    for (var val of remain_all) {
      if (val?.remaining_fee <= 0) {
        val.status = "Paid";
      }
      await val.save();
      console.log(i);
      i += 1;
    }

    res.status(200).send({ message: "Fee Heads Insertion" });
  } catch (e) {
    console.log(e);
  }
};

exports.renderGovernmentCardUpdateQuery = async (req, res) => {
  try {
    var fine = ["64bd56efac3512e4520fb9fa", "644a09d6d1679fcd6e76e5ef"];
    var all_struct = await FeeStructure.find({
      $and: [{ finance: { $in: fine } }, { total_installments: "1" }],
    });
    var nums = [];
    var all_remain = await RemainingList.find({
      fee_structure: { $in: all_struct },
    }).populate({
      path: "institute",
      select: "financeDepart invoice_count random_institute_code",
    });

    var i = 0;
    for (var val of all_remain) {
      if (val?.government_card) {
        var nest_gov = await NestedCard.findById({ _id: val?.government_card });
        if (nest_gov?.paid_fee > 0 && nest_gov?.applicable_fee <= 0) {
          const new_receipt = new FeeReceipt({});
          new_receipt.fee_payment_amount = nest_gov?.paid_fee;
          new_receipt.paid_by_government = nest_gov?.paid_fee;
          new_receipt.fee_payment_mode = "Government/Scholarship";
          new_receipt.student = val?.student;
          new_receipt.fee_transaction_date = new Date();
          new_receipt.application = val?.appId;
          new_receipt.receipt_generated_from = "BY_ADMISSION";
          new_receipt.finance = val?.institute?.financeDepart?.[0];
          new_receipt.receipt_status = "Already Generated";
          new_receipt.fee_update = true;
          await fee_receipt_count_query_new(val?.institute, new_receipt);
          nest_gov.remaining_array.push({
            remainAmount: nest_gov?.paid_fee,
            appId: val?.appId,
            status: "Paid",
            instituteId: val?.institute?._id,
            installmentValue: "First Installment",
            isEnable: true,
            fee_update: true,
            fee_receipt: new_receipt?._id,
            mode: "Government/Scholarship",
          });
          nest_gov.fee_update = true;
          await nest_gov.save();
          // nums.push(val?._id)
          console.log(i);
          i += 1;
        }
      }
    }
    res.status(200).send({
      message: "Explore All Paid Government Card Fees Update Query",
      access: true,
      all_remain: all_remain,
      count: all_remain?.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.cancelAllottedAdmissionApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { amount, mode, remainAmount, struct, classId, staffId } = req.body;
    if (!sid && !aid && !amount && !remainAmount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        refund_status: false,
      });
    var price = parseInt(amount);
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const apply = await NewApplication.findById({ _id: aid }).populate({
      path: "applicationDepartment",
      select: "dName",
    });
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const aStatus = new Status({});
    const notify = new StudentNotification({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.refund_status = "Refunded";
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.receipt_generated_from = "BY_ADMISSION";
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date();
    if (
      price &&
      mode === "Offline" &&
      price > finance.financeTotalBalance &&
      price > admission.offlineFee &&
      price > finance.financeSubmitBalance
    ) {
      res.status(200).send({
        message:
          "insufficient Cash Balance in Finance Department to make refund",
      });
    } else if (
      price &&
      mode === "Online" &&
      price > finance.financeTotalBalance &&
      price > admission.onlineFee &&
      price > finance.financeBankBalance
    ) {
      res.status(200).send({
        message:
          "insufficient Bank Balance in Finance Department to make refund",
      });
    } else {
      const order = new OrderPayment({});
      apply.cancelCount += 1;
      if (apply.remainingFee >= parseInt(remainAmount)) {
        apply.remainingFee -= parseInt(remainAmount);
      }
      if (mode === "Offline") {
        if (finance.financeAdmissionBalance >= price) {
          finance.financeAdmissionBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeSubmitBalance >= price) {
          finance.financeSubmitBalance -= price;
        }
        if (admission.offlineFee >= price) {
          admission.offlineFee -= price;
        }
        if (admission.collected_fee >= price) {
          admission.collected_fee -= price;
        }
        if (apply.offlineFee >= price) {
          apply.offlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
      } else if (mode === "Online") {
        if (admission.onlineFee >= price) {
          admission.onlineFee -= price;
        }
        if (apply.onlineFee >= price) {
          apply.onlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
        if (finance.financeAdmissionBalance >= price) {
          finance.financeAdmissionBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeBankBalance >= price) {
          finance.financeBankBalance -= price;
        }
      }
      if (admission.remainingFeeCount >= parseInt(remainAmount)) {
        admission.remainingFeeCount -= parseInt(remainAmount);
      }
      aStatus.content = `your admission has been cancelled successfully with refund of Rs. ${price}`;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      notify.notifyContent = `your admission has been cancelled successfully with refund of Rs. ${price}`;
      notify.notifySender = admission?.admissionAdminHead?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      student.admissionRemainFeeCount = 0;
      student.refundAdmission.push({
        refund_status: "Refund",
        refund_reason: "Cancellation of Admission",
        refund_amount: price,
        refund_from: apply?._id,
      });
      const all_remain_fee_list = await RemainingList.findOne({
        $and: [{ fee_structure: struct }, { student: student?._id }],
      });
      new_receipt.fee_structure = all_remain_fee_list?.fee_structure;
      const nest_app_card = await NestedCard.findById({
        _id: `${all_remain_fee_list?.applicable_card}`,
      });
      const filter_student_install = nest_app_card?.remaining_array?.filter(
        (stu) => {
          if (`${stu.appId}` === `${apply._id}` && stu.status === "Not Paid")
            return stu;
        }
      );
      for (var can = 0; can < filter_student_install?.length; can++) {
        nest_app_card?.remaining_array.pull(filter_student_install[can]);
      }
      all_remain_fee_list.fee_receipts.push(new_receipt?._id);
      all_remain_fee_list.refund_fee += price;
      if (all_remain_fee_list.paid_fee >= price) {
        all_remain_fee_list.paid_fee -= price;
      }
      if (nest_app_card.paid_fee >= price) {
        nest_app_card.paid_fee -= price;
      }
      all_remain_fee_list.remaining_fee = 0;
      nest_app_card.remaining_fee = 0;
      for (var ele of student?.active_fee_heads) {
        if (`${ele?.appId}` === `${apply?._id}`) {
          ele.paid_fee = 0;
          ele.remain_fee = 0;
        }
      }
      nest_app_card.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "Cancellation & Refunded",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
        refund_status: "Refunded",
      });
      student.student_application_obj.push({
        app: apply?._id,
        staff: staffId,
        flow: "cancel_by",
      });
      all_remain_fee_list.status = "Cancel";
      order.payment_module_type = "Expense";
      order.payment_to_end_user_id = institute._id;
      order.payment_by_end_user_id = user._id;
      order.payment_module_id = apply._id;
      order.payment_amount = price;
      order.payment_status = "Captured";
      order.payment_flag_to = "Debit";
      order.payment_flag_by = "Credit";
      order.payment_mode = mode;
      order.payment_admission = apply._id;
      order.payment_from = student._id;
      order.payment_student = student?._id;
      order.payment_student_name = student?.valid_full_name;
      order.payment_student_gr = student?.studentGRNO;
      fee_receipt_count_query(institute, new_receipt, order);
      order.fee_receipt = new_receipt?._id;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      await renderAllStudentToUnApprovedAutoCatalogQuery(
        student?.studentClass,
        [sid]
      );
      await Promise.all([
        apply.save(),
        student.save(),
        finance.save(),
        admission.save(),
        aStatus.save(),
        user.save(),
        order.save(),
        institute.save(),
        s_admin.save(),
        all_remain_fee_list.save(),
        new_receipt.save(),
        notify.save(),
        nest_app_card.save(),
      ]);
      res.status(200).send({
        message: "Refund & Cancellation of Admission",
        refund_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      if (apply.allottedApplication?.length > 0) {
        for (var val of apply.allottedApplication) {
          if (`${val?.student}` === `${student?._id}`) {
            apply.allottedApplication.pull(val?._id);
          }
        }
        apply.cancelApplication.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
          from: "Allotted_Tab",
        });
        admission.cancel_admission.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
          from: "Allotted_Tab",
        });
        admission.cancel_admission_count += price;
        await Promise.all([apply.save(), admission.save()]);
      }
      if (admission?.remainingFee?.length > 0) {
        if (admission.remainingFee?.includes(`${student._id}`)) {
          admission.remainingFee.pull(student._id);
        }
        await admission.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.one_fees_card_query = async (req, res) => {
  try {
    var fine = ["64bd56efac3512e4520fb9fa", "644a09d6d1679fcd6e76e5ef"];
    var all_struct = await FeeStructure.find({
      $and: [{ finance: { $in: fine } }, { total_installments: "1" }],
    });
    var nums = [];
    var all_remain = await RemainingList.find({
      fee_structure: { $in: all_struct },
    })
      .populate({
        path: "institute",
        select: "financeDepart invoice_count random_institute_code",
      })
      .populate({
        path: "student",
        select: "studentFirstName studentMiddleName studentLastName",
      });

    var i = 0;
    for (var val of all_remain) {
      if (val?.applicable_card) {
        var n_app = await NestedCard.findById({
          _id: `${val?.applicable_card}`,
        });
        if (n_app?.applicable_fee - n_app?.paid_fee == 1) {
          nums.push(val?.student);
          console.log(i);
          i += 1;
        }
      }
    }
    res
      .status(200)
      .send({ message: "Explore 1 Rs. diff Card", access: true, nums });
  } catch (e) {
    console.log(e);
  }
};

// Fee Heads Move To Applicable Fee Heads
exports.renderFeeHeadsMoveGovernmentCardUpdateQuery = async (req, res) => {
  try {
    // var fine = ["64bd56efac3512e4520fb9fa", "644a09d6d1679fcd6e76e5ef"]
    var fine = ["644a09d6d1679fcd6e76e5ef"];
    var all_struct = await FeeStructure.find({
      $and: [{ finance: { $in: fine } }],
    });
    // var nums = []
    // var all_remain = await RemainingList.find({ fee_structure: { $in: all_struct } })
    var i = 0;
    for (var val of all_struct) {
      for (var ele of val?.fees_heads) {
        // ele.head_type = "BY_APPLICABLE"
        val.applicable_fees_heads.push(ele);
        val.applicable_fees_heads_count += 1;
      }
      console.log(i);
      i += 1;
      await val.save();
    }

    res.status(200).send({
      message: "Explore Fees Structure Applicable Fees Heads Move Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

// Excel Government Fee Heads Query
exports.renderGovernmentHeadsMoveGovernmentCardUpdateQuery = async (
  fid,
  structures
) => {
  try {
    if (structures?.length > 0) {
      // console.log(structures, "jkahdkjhd")
      var i = 0;
      for (var val of structures) {
        var codes = await FeeStructure.findOne({
          fee_structure_code: `${val?.fee_structure_code}`,
        });
        if (codes?._id) {
          for (var ele of val?.heads) {
            codes.government_fees_heads.push(ele);
            codes.government_fees_heads_count += 1;
            console.log(i);
            i += 1;
          }
          await codes.save();
        }
      }
    }
    console.log("DONE");
    // res.status(200).send({ message: "Explore Fees Structure Applicable Fees Heads Move Query", access: true })
  } catch (e) {
    console.log(e);
  }
};

// Remove transfer Applicable + Government ALSO
exports.removeTTOAQuery = async (req, res) => {
  try {
    var fine = ["64bd56efac3512e4520fb9fa", "644a09d6d1679fcd6e76e5ef"];
    // var fine = ["651ba371e39dbdf817dd5285"]
    var all_struct = await FeeStructure.find({
      $and: [{ finance: { $in: fine } }],
    });
    var nums_app = [];
    var nums_gov = [];
    var all_remain = await RemainingList.find({
      fee_structure: { $in: all_struct },
    }).select("applicable_card government_card");
    // .populate({
    //   path: "student",
    //   select: "studentFirstName studentMiddleName studentLastName valid_full_name"
    // })

    var i = 0;
    for (var val of all_remain) {
      if (val?.applicable_card) {
        var nest_app = await NestedCard.findById({
          _id: `${val?.applicable_card}`,
        });
        for (var ele of nest_app?.remaining_array) {
          if (ele?.revert_status) {
            if (nums_app?.includes(`${val?._id}`)) {
            } else {
              nums_app.push(val?._id);
            }
          }
        }
      }
      if (val?.government_card) {
        var nest_gov = await NestedCard.findById({
          _id: `${val?.government_card}`,
        });
        for (var ele of nest_gov?.remaining_array) {
          if (ele?.revert_status) {
            if (nums_gov?.includes(`${val?._id}`)) {
            } else {
              nums_gov.push(val?._id);
            }
          }
        }
      }
      console.log(i);
      i += 1;
    }
    res.status(200).send({
      message: "Explore Fees Structure Applicable Fees Heads Move Query",
      access: true,
      nums_app,
      nums_gov,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.removeTTOAQuery = async (req, res) => {
  try {
    var nums_app = [
      "6480830bbff5c201991de8dc", // ISSUE WITH GOV/OS
      "64809531bff5c201991ede83", // DONE
      "64809635bff5c201991eee20", // DONE
      "64809e55bff5c201991f6f21", // DONE
      "6480a58ebff5c201991fdb94", // DONE
      "6480b398bff5c2019920c718", // DONE
      "6480b299bff5c2019920a2f5", // DONE
      "6480b55dbff5c20199212ee5", // DONE
      "6480bca4bff5c2019922dbb1", // DONE
      "6480949fbff5c201991ed54c", // DONE
      "64809495bff5c201991ed4d9", // DONE
    ];
    var all_remain = await RemainingList.find({ _id: { $in: nums_app } })
      .select("applicable_card government_card")
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName valid_full_name",
      });

    var i = 0;
    for (var val of all_remain) {
    }
    res.status(200).send({
      message: "Explore Fees Structure Applicable Fees Heads Move Query",
      access: true,
      nums_app,
      nums_gov,
    });
  } catch (e) {
    console.log(e);
  }
};

// Fee Structure Set To Fee Receipt
exports.setFeeStructureToFeeReceiptAQuery = async (req, res) => {
  try {
    // var fine = ["644a09d6d1679fcd6e76e5ef"]
    var nums = ["6501a1fcdf2fe86f89504caa"];
    // var nums = ["6481449fbff5c201992459c0", "64d8a21332c4819d5ee626a9", "6501fa70b830dd56a617afee"]
    // var all_struct = await FeeStructure.find({ $and: [{ finance: { $in: fine }} ]})
    // var all_remain = await RemainingList.find({ fee_structure: { $in: all_struct } })
    var all_remain = await RemainingList.find({ _id: { $in: nums } });

    var i = 0;
    for (var val of all_remain) {
      var all_receipt = await FeeReceipt.find({
        $and: [{ student: val?.student }, { application: val?.appId }],
      });
      for (var ele of all_receipt) {
        ele.fee_structure = val?.fee_structure;
        console.log(i);
        i += 1;
        await ele.save();
      }
    }
    res
      .status(200)
      .send({ message: "Explore Fee Receipt Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllCancelAppsQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      var filter_cancel = [];
      var apply = await Admission.findById({ _id: aid })
        .select("cancel_admission_count")
        .populate({
          path: "cancel_admission",
          populate: {
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentGRNO: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName studentGRNO paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user fee_receipt valid_full_name",
            populate: {
              path: "user fee_receipt",
              select: "userPhoneNumber userEmail receipt_file",
            },
          },
        });
      for (let data of apply?.cancel_admission) {
        if (data.student !== null) {
          filter_cancel.push(data);
        }
      }
      if (filter_cancel?.length > 0) {
        res.status(200).send({
          message: "Lots of Cancel Application from DB 😂😂",
          cancel: filter_cancel?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          cancel: [],
        });
      }
    } else {
      var apply = await Admission.findById({ _id: aid })
        .select("cancel_admission_count")
        .populate({
          path: "cancel_admission",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber user fee_receipt",
            populate: {
              path: "user fee_receipt",
              select: "userPhoneNumber userEmail receipt_file",
            },
          },
        });
      var all_cancel_query = nested_document_limit(
        page,
        limit,
        apply?.cancel_admission?.reverse()
      );
      if (all_cancel_query?.length > 0) {
        res.status(200).send({
          message: "Lots of Cancel Application from DB 😂😂",
          cancel: all_cancel_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          cancel: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllCancelAppsSequenceQuery = async (req, res) => {
  try {
    const { aid } = req?.params;
    if (!aid) return res.status(200).send({ message: "Bug" });
    var nums = [];
    const ads_admin = await Admission.findById({ _id: aid }).select(
      "cancel_admission institute"
    );

    const ins = await InstituteAdmin.findById({ _id: req?.query?.id }).select(
      "ApproveStudent"
    );
    var i = 0;
    for (var val of ads_admin?.cancel_admission) {
      if (ins?.ApproveStudent?.includes(`${val?.student}`)) {
        nums.push(val?.student);
        console.log(i);
        i += 1;
      }
    }

    const all_student = await Student.find({ _id: { $in: nums } });
    res.status(200).send({ message: "Explore Mismatch Query", all_student });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDepositQuery = async (req, res) => {
  try {
    var fine = ["644a09d6d1679fcd6e76e5ef"];
    var all_struct = await FeeStructure.find({
      $and: [{ finance: { $in: fine } }],
    });
    // var nums = ["6507f64850f6dfea855c2af5"]

    // var all_remain = await RemainingList.find({ _id: { $in: nums } })
    var all_remain = await RemainingList.find({
      fee_structure: { $in: all_struct },
    })
      .populate({
        path: "fee_structure",
      })
      .populate({
        path: "student",
      });
    var i = 0;
    for (var sub of all_remain) {
      if (sub?.applicable_card) {
        var nest_app = await NestedCard.findById({
          _id: `${sub?.applicable_card}`,
        }).populate({
          path: "remaining_array",
          populate: {
            path: "fee_receipt",
            populate: {
              path: "fee_structure",
            },
          },
        });
        var filtered = [];
        for (var qwe of nest_app?.remaining_array) {
          if (`${qwe?.status}` === "Paid" && qwe?.fee_receipt) {
            filtered.push(qwe);
          }
        }
        console.log("SET");
        await set_fee_head_query_deposit(
          sub?.student,
          filtered?.[0]?.remainAmount,
          filtered?.[0]?.fee_receipt
        );
        filtered.splice(filtered?.[0], 1);

        for (var dtw of filtered) {
          console.log("UPDATE");
          await update_fee_head_query_deposit(
            sub?.student,
            dtw?.remainAmount,
            sub?.appId
            // dtw?.fee_receipt
          );
        }
      }
      console.log(i);
      i += 1;
    }

    res.status(200).send({
      message: "Explore All Student Fee Deposit Insertion Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDepositToZeroQuery = async (req, res) => {
  try {
    var one_master = await FeeMaster.findOne({
      $and: [
        { _id: "644a0b07d1679fcd6e76e7f5" },
        { finance: "644a09d6d1679fcd6e76e5ef" },
        { master_status: "Linked" },
      ],
    });
    var i = 0;
    for (var val of one_master?.deleted_student) {
      const one_student = await Student.findById({ _id: `${val}` });
      if (one_student?._id) {
        one_student.deposit_pending_amount = 0;
        await one_student.save();
        // one_master.deleted_student.push(val)
        console.log(i);
        i += 1;
      }
    }

    // one_master.paid_student = []
    // one_master.paid_student_count = 0
    // one_master.deposit_amount = 0
    // await one_master.save()
    res.status(200).send({
      message: "Explore All Student Fee Deposit To ZERO Insertion Query",
      access: true,
      one_master,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderMultipleInstallmentQuery = async (req, res) => {
  try {
    const { pid } = req?.params;
    const { inst_arr, raid } = req?.body;
    if (!raid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const p_card = await NestedCard.findById({ _id: pid }).populate({
      path: "parent_card",
    });
    var price = 0;
    const remain = await RemainingList.findById({
      _id: `${p_card?.parent_card?._id}`,
    });
    if (inst_arr?.length > 0) {
      for (let ele of inst_arr) {
        p_card.remaining_array.push({
          remainAmount: ele?.inst_price,
          dueDate: ele?.inst_date,
          status: "Not Paid",
          instituteId: remain?.institute,
          appId: remain?.appId,
          isEnable: true,
          installmentValue: ele?.inst_type,
          fee_heads: [...ele?.fee_heads],
        });
        price += ele?.inst_price;
      }
    }
    for (var val of p_card.remaining_array) {
      if (`${val?._id}` === `${raid}` && val?.status == "Not Paid") {
        val.remainAmount -= price;
        if (val?.remainAmount <= 0) {
          p_card.remaining_array?.pull(val?._id);
        }
      }
    }
    remain.is_splited = "Yes";
    await Promise.all([p_card.save(), remain.save()]);
    res.status(200).send({
      message: "Explore One Student Single Installment Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeStructureUpdate = async (req, res) => {
  try {
    const { fsid } = req?.params;
    if (!fsid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const structure = await FeeStructure.findById({ _id: fsid });
    var nums = [];
    var all = await RemainingList.find({ fee_structure: structure?._id })
      .populate({
        path: "applicable_card",
      })
      .populate({
        path: "government_card",
      })
      .populate({
        path: "student",
        select: "studentGRNO",
      });

    for (var val of all) {
      nums.push(val?._id);
      // val.applicable_card.applicable_fee = structure?.applicable_fees
      // val.government_card.applicable_fee = structure?.total_admission_fees - structure?.applicable_fees
      // await Promise.all([ val.applicable_card.save(),val.government_card.save() ])
    }
    res.status(200).send({ message: "Fees", nums });
  } catch (e) {}
};

exports.renderAllReadmissionQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_select = [];
      const apply = await Admission.findById({ _id: aid })
        .select("re_admission_list_count")
        .populate({
          path: "re_admission_list",
          populate: {
            path: "student fee_struct appId app_card gov_card",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            // select:
            //   "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber total_admission_fees one_installments structure_name unique_structure_name applicable_card government_card applicable_fees structure_month applicationName",
          },
        });
      for (let data of apply.re_admission_list) {
        if (data.student !== null) {
          filter_select.push(data);
        }
      }
      if (filter_select?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Fees Collection required make sure you come up with Tea and Snack from DB 🙌",
          fees: filter_select?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          fees: [],
        });
      }
    } else {
      var apply = await Admission.findById({ _id: aid })
        .select("re_admission_list_count")
        .populate({
          path: "re_admission_list",
          populate: {
            path: "student fee_struct appId app_card gov_card",
            // select:
            //   "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month applicationName",
          },
        });
      var all_select_query = nested_document_limit(
        page,
        limit,
        apply?.re_admission_list?.reverse()
      );
      if (all_select_query?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Fees Collection Selection required make sure you come up with Tea and Snack from DB 🙌",
          fees: all_select_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          fees: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllConfirmedReadmissionQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_select = [];
      const apply = await Admission.findById({ _id: aid })
        .select("re_admission_list_count")
        .populate({
          path: "confirmedApplication",
          populate: {
            path: "student fee_struct appId class",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month applicationName className classTitle fee_receipt",
            // populate: {
            //   path: "fee_receipt",
            //   select: "receipt_file"
            //   }
          },
        });
      for (let data of apply.confirmedApplication) {
        if (data.student !== null) {
          filter_select.push(data);
        }
      }
      if (filter_select?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Fees Collection required make sure you come up with Tea and Snack from DB 🙌",
          fees: filter_select?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          fees: [],
        });
      }
    } else {
      var apply = await Admission.findById({ _id: aid }).populate({
        path: "confirmedApplication",
        populate: {
          path: "student fee_struct appId class",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month applicationName className classTitle fee_receipt",
          // populate: {
          //   path: "fee_receipt",
          //   select: "receipt_file"
          //   }
        },
      });
      var all_select_query = nested_document_limit(
        page,
        limit,
        apply?.confirmedApplication?.reverse()
      );
      if (all_select_query?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message: "Lots of Confirmed Admission From DB 🙌",
          fees: all_select_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          fees: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderReAdmissionFeesQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { receipt_status } = req.query;
    const { amount, mode, card_id, rid, type, pay_remain, flow, appId } =
      req.body;
    if (!sid && !aid && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        confirm_status: false,
      });
    var price = parseInt(amount);
    const apply = await NewApplication.findById({ _id: appId });
    const admission = await Admission.findById({
      _id: aid,
    }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });
    var all_status = await Status.find({
      $and: [
        { applicationId: apply?._id },
        { student: student?._id },
        { payment_status: "Not Paid" },
      ],
    });
    var new_remainFee = await RemainingList.findById({ _id: rid })
      .populate({
        path: "applicable_card",
      })
      .populate({
        path: "government_card",
      });
    if (flow === "RE_ADMISSION") {
      const user = await User.findById({ _id: `${student.user}` });
      const status = new Status({});
      const order = new OrderPayment({});
      const notify = new StudentNotification({});
      const new_receipt = new FeeReceipt({ ...req.body });
      new_receipt.student = student?._id;
      new_receipt.fee_structure = new_remainFee?.fee_structure;
      new_receipt.fee_transaction_date = new Date(
        `${req.body.transaction_date}`
      );
      new_receipt.application = apply?._id;
      new_receipt.receipt_generated_from = "BY_ADMISSION";
      new_receipt.finance = finance?._id;
      new_receipt.receipt_status = receipt_status
        ? receipt_status
        : "Already Generated";
      order.payment_module_type = "Admission Fees";
      order.payment_to_end_user_id = institute?._id;
      order.payment_by_end_user_id = user._id;
      order.payment_module_id = apply._id;
      order.payment_amount = price;
      order.payment_status = "Captured";
      order.payment_flag_to = "Credit";
      order.payment_flag_by = "Debit";
      order.payment_mode = mode;
      order.payment_admission = apply._id;
      order.payment_from = student._id;
      order.payment_student = student?._id;
      order.payment_student_name = student?.valid_full_name;
      order.payment_student_gr = student?.studentGRNO;
      order.fee_receipt = new_receipt?._id;
      fee_receipt_count_query(institute, new_receipt, order);
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      if (`${new_remainFee?.applicable_card?._id}` === `${card_id}`) {
        const nest_card = await NestedCard.findById({ _id: `${card_id}` });
        new_remainFee.active_payment_type = `${type}`;
        nest_card.active_payment_type = `${type}`;
        new_remainFee.paid_fee += price;
        nest_card.paid_fee += price;
        if (new_remainFee?.remaining_fee >= price) {
          new_remainFee.remaining_fee -= price;
        }
        if (nest_card?.remaining_fee >= price) {
          nest_card.remaining_fee -= price;
        } else {
          nest_card.remaining_fee = 0;
        }
        if (student.admissionRemainFeeCount >= price) {
          student.admissionRemainFeeCount -= price;
        }
        if (apply.remainingFee >= price) {
          apply.remainingFee -= price;
        }
        if (admission.remainingFeeCount >= price) {
          admission.remainingFeeCount -= price;
        }
        var valid_one_time_fees =
          student?.fee_structure?.applicable_fees - price == 0 ? true : false;
        if (valid_one_time_fees) {
          admission.remainingFee.pull(student._id);
        } else {
        }
        if (pay_remain) {
          await all_installment_paid(
            new_remainFee,
            student?.fee_structure,
            mode,
            price,
            admission,
            student,
            new_receipt,
            apply,
            institute,
            nest_card,
            type
          );
        } else {
          await render_installment(
            type,
            student,
            mode,
            price,
            admission,
            student?.fee_structure,
            new_remainFee,
            new_receipt,
            apply,
            institute,
            nest_card
          );
        }
        await nest_card.save();
        if (req.body?.fee_payment_mode === "Government/Scholarship") {
          // New Logic
        } else {
          console.log("Enter");
          await set_fee_head_query_redesign(
            student,
            new_receipt?.fee_payment_amount,
            apply?._id,
            new_receipt
          );
          // await set_fee_head_query(student, price, apply, new_receipt);
          console.log("Exit");
        }
      }
      new_remainFee.fee_receipts.push(new_receipt?._id);
      if (mode === "Offline") {
        admission.offlineFee += price;
        apply.collectedFeeCount += price;
        apply.offlineFee += price;
        admission.collected_fee += price;
        finance.financeAdmissionBalance += price;
        finance.financeTotalBalance += price;
        finance.financeSubmitBalance += price;
      } else if (mode === "Online") {
        admission.onlineFee += price;
        apply.collectedFeeCount += price;
        apply.onlineFee += price;
        finance.financeAdmissionBalance += price;
        finance.financeTotalBalance += price;
        finance.financeBankBalance += price;
      } else {
      }
      if (new_remainFee?.remaining_fee > 0) {
      } else {
        new_remainFee.status = "Paid";
      }
      await lookup_applicable_grant(
        req.body?.fee_payment_mode,
        price,
        new_remainFee,
        new_receipt
      );
      for (let app of admission.re_admission_list) {
        if (`${app.student}` === `${student._id}`) {
          admission.re_admission_list.pull(app?._id);
        } else {
        }
      }
      for (var val of all_status) {
        val.payment_status = "Paid";
        val.fee_receipt = new_receipt?._id;
        await val.save();
      }
      student.admissionPaidFeeCount += price;
      student.paidFeeList.push({
        paidAmount: price,
        appId: apply._id,
      });
      status.content = `Your seat has been confirmed, You will be alloted your class shortly, Stay Updated!`;
      status.group_by = "Admission_Confirmation";
      status.applicationId = apply._id;
      user.applicationStatus.push(status._id);
      status.instituteId = institute._id;
      status.fee_receipt = new_receipt?._id;
      notify.notifyContent = `Your seat has been confirmed, You will be alloted your class shortly, Stay Updated!`;
      notify.notifySender = admission?.admissionAdminHead?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      notify.fee_receipt = new_receipt?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      if (
        `${new_receipt?.fee_payment_mode}` === "Demand Draft" ||
        `${new_receipt?.fee_payment_mode}` === "Cheque"
      ) {
        status.receipt_status = "Requested";
        status.receipt = new_receipt?._id;
        if (admission?.request_array?.includes(`${new_receipt?._id}`)) {
        } else {
          admission.request_array.push(new_receipt?._id);
          admission.fee_receipt_request.push({
            receipt: new_receipt?._id,
            demand_cheque_status: "Requested",
          });
          admission.fee_receipt_request_count += 1;
        }
      }
      if (
        new_remainFee?.re_admission_class != null &&
        new_remainFee?.re_admission_flow
      ) {
        var classes = await Class.findById({
          _id: `${new_remainFee?.re_admission_class}`,
        });
        var batch = await Batch.findById({ _id: `${classes?.batch}` });
        var depart = await Department.findById({
          _id: `${batch?.department}`,
        });
        if (classes?.ApproveStudent?.includes(student._id)) {
        } else {
          classes?.ApproveStudent.push(student._id);
          classes?.UnApproveStudent.pull(student._id);
        }
        if (batch?.ApproveStudent?.includes(student._id)) {
        } else {
          batch?.ApproveStudent.push(student._id);
          batch?.UnApproveStudent.pull(student._id);
        }
        if (depart?.ApproveStudent?.includes(student._id)) {
        } else {
          depart?.ApproveStudent.push(student._id);
          depart?.UnApproveStudent.pull(student._id);
        }
        classes.studentCount += 1;
        if (student.studentGender === "Male") {
          classes.boyCount += 1;
        } else if (student.studentGender === "Female") {
          classes.girlCount += 1;
        } else if (student.studentGender === "Other") {
          classes.otherCount += 1;
        } else {
        }
        student.studentROLLNO = classes.ApproveStudent?.length + 1;
        admission.confirmedApplication.push({
          student: student?._id,
          fee_struct: new_remainFee?.fee_structure,
          appId: apply?._id,
          class: classes?._id,
        });
        await class_status(apply, institute, depart, user, classes);
        await Promise.all([classes.save(), batch.save(), depart.save()]);
      }
      await Promise.all([
        admission.save(),
        apply.save(),
        student.save(),
        finance.save(),
        user.save(),
        order.save(),
        institute.save(),
        new_remainFee.save(),
        new_receipt.save(),
        status.save(),
        notify.save(),
      ]);
      res.status(200).send({
        message: "Look like a party mood",
        confirm_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        status.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_student_fees_mapping = async (map) => {
  try {
    if (map?.length > 0) {
      for (let ele of map) {
        const student = await Student.findOne({
          studentGRNO: `${ele?.studentGRNO}`,
        });
        student.fee_category = ele?.fee_category;
        await student.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDeleteInstallmentCardQuery = async (req, res) => {
  try {
    const { nid, rid } = req?.params;
    const { fid } = req?.body;
    if (!nid && !rid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var nest = await NestedCard.findById({ _id: nid });
    var new_fees = await RemainingList.findById({
      _id: `${nest?.parent_card}`,
    });
    const finance = await Finance.findById({ _id: fid });
    for (var ele of nest?.remaining_array) {
      if (`${ele?._id}` === `${rid}`) {
        if (nest?.paid_fee >= nest?.applicable_fee) {
          const logs = new DeleteLogs({});
          if (ele?.fee_receipt) {
            var fees = await FeeReceipt.findById({ _id: ele?.fee_receipt });
            fees.visible_status = "Hide";
            await fees.save();
          }
          if (fees?.order_history) {
            const order = await OrderPayment.findById({
              _id: fees?.order_history,
            });
            order.payment_visible_status = "Hide";
            await order.save();
          }
          logs.fee_receipt = ele?.fee_receipt;
          logs.nested_card = nest?._id;
          ele.status = "Not Paid";
          ele.installmentValue =
            ele.installmentValue === "All Installment Paid" ||
            ele.installmentValue === "All Installment Paid"
              ? "Installment Remain"
              : ele.installmentValue;
          ele.mode = "";
          ele.fee_receipt = null;
          if (nest?.paid_fee >= ele?.remainAmount) {
            nest.paid_fee -= ele?.remainAmount;
          }
          nest.remaining_fee += ele?.remainAmount;
          if (new_fees?.paid_fee >= ele?.remainAmount) {
            new_fees.paid_fee -= ele?.remainAmount;
          }
          new_fees.remaining_fee += ele?.remainAmount;
          finance.delete_logs.push(logs?._id);
          nest?.remaining_array.pull(ele?._id);
          await logs.save();
          if (nest?.remaining_fee > 0) {
            nest.remaining_array.push({
              installmentValue: "Installment Remain",
              status: "Not Paid",
              isEnable: true,
              appId: new_fees?.appId,
              instituteId: new_fees?.institute,
              remainAmount: nest?.remaining_fee,
            });
          }
        } else {
          const logs = new DeleteLogs({});
          if (ele?.fee_receipt) {
            var fees = await FeeReceipt.findById({ _id: ele?.fee_receipt });
            fees.visible_status = "Hide";
            await fees.save();
          }
          if (fees?.order_history) {
            const order = await OrderPayment.findById({
              _id: fees?.order_history,
            });
            order.payment_visible_status = "Hide";
            await order.save();
          }
          logs.fee_receipt = ele?.fee_receipt;
          logs.nested_card = nest?._id;
          ele.status = "Not Paid";
          ele.installmentValue =
            ele.installmentValue === "All Installment Paid" ||
            ele.installmentValue === "All Installment Paid"
              ? "Installment Remain"
              : ele.installmentValue;
          ele.mode = "";
          ele.fee_receipt = null;
          if (nest?.paid_fee >= ele?.remainAmount) {
            nest.paid_fee -= ele?.remainAmount;
          }
          nest.remaining_fee += ele?.remainAmount;
          if (new_fees?.paid_fee >= ele?.remainAmount) {
            new_fees.paid_fee -= ele?.remainAmount;
          }
          new_fees.remaining_fee += ele?.remainAmount;
          finance.delete_logs.push(logs?._id);
          nest?.remaining_array.pull(ele?._id);
          await logs.save();
        }
        if (nest?.remaining_fee > 0) {
          console.log("Enter");
          if (ele?.status === "Not Paid") {
            ele.remainAmount += nest?.remaining_fee;
          } else {
            console.log("Enter Else");
            nest.remaining_array.push({
              installmentValue: "Installment Remain",
              status: "Not Paid",
              isEnable: true,
              appId: new_fees?.appId,
              instituteId: new_fees?.institute,
              remainAmount: nest?.remaining_fee,
            });
          }
        }
      }
    }
    await Promise.all([nest.save(), new_fees.save(), finance.save()]);
    res
      .status(200)
      .send({ message: "I Think you press the wrong button", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllDeleteLogsQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var finance = await Finance.findById({ _id: fid }).select("delete_logs");

    var all_logs = await DeleteLogs.find({ _id: { $in: finance?.delete_logs } })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "fee_receipt",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO",
        },
      })
      .populate({
        path: "nested_card",
      });

    if (all_logs?.length > 0) {
      res.status(200).send({
        message: "Explore All Delete Logs Query",
        access: true,
        all_logs: all_logs,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Deleted Logs", access: false, all_logs: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_new_student_form_section_query = async (req, res) => {
  try {
    const { fcid } = req?.params;
    const { form } = req?.body;
    if (!fcid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var iaf = await InstituteApplicationForm.findById({ _id: fcid });
    for (var val of form) {
      iaf.form_section.push({
        section_name: val?.section_name,
        section_visibilty: val?.section_visibilty,
        section_key: val?.section_key,
      });
    }
    await iaf.save();
    res.status(200).send({
      message: "Explore One Application Form Section Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_new_student_form_checklist_query = async (req, res) => {
  try {
    const { fcid } = req?.params;
    const { checklist, fsid } = req?.body;
    if (!fcid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var iaf = await InstituteApplicationForm.findById({ _id: fcid });
    for (var val of iaf?.form_section) {
      if (`${val?._id}` === `${fsid}`) {
        for (var ele of checklist) {
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
            form_checklist_key_status: "DYNAMIC",
          });
          if (
            ele?.form_checklist_typo_option_pl &&
            ele?.form_checklist_typo_option_pl?.length > 0
          ) {
            ele.form_checklist_typo_option_pl = [
              ...ele?.form_checklist_typo_option_pl,
            ];
          }
          fc.application_form = iaf?._id;
          fc.form_section = val?._id;
          val.form_checklist.push(fc?._id);
          await fc.save();
        }
      }
    }
    await iaf.save();
    res.status(200).send({
      message: "Explore One Application Form Section Nested Checklist Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_edit_student_form_section_query = async (req, res) => {
  try {
    const { fcid } = req?.params;
    const { fsid, section_name, section_key, section_visibilty } = req?.body;
    if (!fcid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var iaf = await InstituteApplicationForm.findById({ _id: fcid });
    for (var val of iaf?.form_section) {
      if (`${val?._id}` === `${fsid}`) {
        val.section_name = section_name ? section_name : val?.section_name;
        val.section_key = section_key ? section_key : val?.section_key;
        val.section_visibilty = section_visibilty;
      }
    }
    await iaf.save();
    res.status(200).send({
      message: "Edit One Application Form Section + Nested Checklist Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_edit_student_form_section_checklist_query = async (req, res) => {
  try {
    const { fcid } = req?.params;
    const {
      checkID,
      fsid,
      form_checklist_visibility,
      form_checklist_required,
    } = req?.body;
    if (!fcid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var iaf = await InstituteApplicationForm.findById({ _id: fcid })
      .select("form_section")
      .populate({
        path: "form_section.form_checklist",
      });
    for (var val of iaf?.form_section) {
      if (`${val?._id}` === `${fsid}`) {
        for (var ele of val?.form_checklist) {
          if (`${ele?._id}` === `${checkID}`) {
            ele.form_checklist_visibility = form_checklist_visibility;
            ele.form_checklist_required = form_checklist_required;
            await ele.save();
            if (ele?.form_common_key) {
              let exist = await FormChecklist.find({
                $and: [
                  { application_form: iaf?._id },
                  { form_checklist_key: ele?.form_common_key },
                ],
              });
              for (let stu of exist) {
                stu.form_checklist_visibility = ele?.form_checklist_visibility;
                await stu.save();
              }
            }
          }
        }
      }
    }
    await iaf.save();
    res.status(200).send({
      message: "Edit One Application Form Section + Nested Checklist Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_shuffle_student_form_section_query = async (req, res) => {
  try {
    const { fcid } = req?.params;
    const { shuffle_arr } = req?.body;
    if (!fcid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (shuffle_arr?.length > 0) {
      var iaf = await InstituteApplicationForm.findById({ _id: fcid });
      iaf.form_section = [];
      await iaf.save();
      for (var val of shuffle_arr) {
        iaf.form_section.push(val);
      }
      await iaf.save();
      res.status(200).send({
        message: "Explore Application Form Section Shuffling Query",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No Application Form Section Shuffling Query",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_student_form_section_query = async (req, res) => {
  try {
    const { fcid } = req?.params;
    if (!fcid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var iaf = await InstituteApplicationForm.findById({ _id: fcid })
      .select("form_section image_content")
      .populate({
        path: "form_section.form_checklist",
      });
    iaf?.form_section?.splice(0, 1);
    for (let nums of iaf?.form_section) {
      if (
        `${nums?.section_key}` === "undertakings" ||
        `${nums?.section_key}` === "antiragging_affidavit" ||
        `${nums?.section_key}` === "antiragging_affidavit_parents"
      ) {
        nums.form_checklist = [];
      }
      if (`${nums?.section_key}` === "contactDetails") {
        for (let ele of nums?.form_checklist) {
          if (`${ele?.form_checklist_typo}` === "Same As") {
            nums?.form_checklist?.pull(ele?._id);
          }
        }
      }
      if (`${nums?.section_key}` === "documents") {
        for (let ele of nums?.form_checklist) {
          if (`${ele?.form_checklist_enable}` === "true") {
            nums?.form_checklist?.pull(ele?._id);
          }
        }
      }
      if (`${nums?.section_key}` === "social_reservation_information_section") {
        for (let ele of nums?.form_checklist) {
          if (`${ele?.form_checklist_enable}` === "true") {
            nums?.form_checklist?.pull(ele?._id);
          }
        }
      }
    }
    iaf.form_section.push({
      section_name: "Form Images / Attachment",
      section_visibilty: true,
      section_key: "form_attach",
      section_view: "View Sample",
      section_pdf: "",
      section_stats: "form_attach",
      section_value: "",
      form_checklist: [...iaf?.image_content],
    });
    res.status(200).send({
      message: "Explore One Application Student Form Section Query",
      access: true,
      section: iaf?.form_section,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_student_form_section_enable_query = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var app = await NewApplication.findById({ _id: id }).select(
      "student_form_setting"
    );
    var iaf = await InstituteApplicationForm.findById({
      _id: `${app?.student_form_setting}`,
    })
      .select("form_section")
      .populate({
        path: "form_section.form_checklist",
      });

    var all_section = iaf?.form_section?.filter((val) => {
      if (val?.section_visibilty) return val;
    });

    for (var ele of all_section) {
      for (var stu of ele?.form_checklist) {
        if (stu?.form_checklist_visibility) {
        } else {
          ele?.form_checklist?.pull(stu?._id);
        }
      }
    }
    res.status(200).send({
      message: "Explore One Department Student Form Section Enable Query",
      access: true,
      section: all_section,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_fee_receipt_query = async (req, res) => {
  try {
    await generateFeeReceipt("663c9573f2b92516a81bfb10");
  } catch (e) {
    console.log(e);
  }
};

exports.render_add_subject_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid });
    const new_group = new SubjectGroup({ ...req?.body });
    new_group.admission = ads_admin?._id;
    ads_admin.subject_groups.push(new_group?._id);
    await Promise.all([new_group.save(), ads_admin.save()]);
    res.status(200).send({ message: "New Group Section Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.render_delete_subject_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    const { sgid } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid });
    const new_group = await SubjectGroup.findById({ _id: sgid });
    ads_admin.subject_groups.pull(new_group?._id);
    await ads_admin.save();
    await SubjectGroup.findByIdAndDelete(sgid);
    res
      .status(200)
      .send({ message: "New Group Section Delete Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.render_all_subject_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid }).select(
      "subject_groups"
    );
    const all_group = await SubjectGroup.find({
      _id: { $in: ads_admin?.subject_groups },
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .select("subject_group_name no_of_group");
    if (all_group?.length > 0) {
      res.status(200).send({
        message: "All Group Section Query",
        access: true,
        all_group: all_group,
      });
    } else {
      res.status(200).send({
        message: "No Group Section Query",
        access: false,
        all_group: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_subject_query = async (req, res) => {
  try {
    const { osid } = req?.params;
    if (!osid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const group = await SubjectGroup.findById({ _id: osid }).select(
      "subject_group_name no_of_group"
    );
    res.status(200).send({ message: "One Group Query", access: false, group });
  } catch (e) {
    console.log(e);
  }
};

exports.render_add_subject_group_query = async (req, res) => {
  try {
    const { sgid } = req?.params;
    const { group_name } = req?.body;
    if (!sgid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const group = await SubjectGroup.findById({ _id: sgid });
    const group_select = new SubjectGroupSelect({ ...req?.body });
    group_select.group_name = group_name;
    group_select.subject_group = group?._id;
    group.subject_group_select.push(group_select?._id);
    await Promise.all([group_select.save(), group.save()]);
    res
      .status(200)
      .send({ message: "New Group Select Section Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.render_delete_subject_group_query = async (req, res) => {
  try {
    const { sgid } = req?.params;
    const { ssid } = req?.body;
    if (!sgid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const group = await SubjectGroup.findById({ _id: sgid });
    const group_select = await SubjectGroupSelect.findById({ _id: ssid });
    group.subject_group_select.pull(group_select?._id);
    await group.save();
    await SubjectGroupSelect.findByIdAndDelete(ssid);
    res
      .status(200)
      .send({ message: "New Group Select Section Delete Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.render_all_subject_group_query = async (req, res) => {
  try {
    const { sgid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sgid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const group = await SubjectGroup.findById({ _id: sgid }).select(
      "subject_group_select"
    );
    const all_group_select = await SubjectGroupSelect.find({
      _id: { $in: group?.subject_group_select },
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .select(
        "group_name compulsory_subject_count optional_subject_count subject_group created_at fixed_subject_count"
      );
    if (all_group_select?.length > 0) {
      res.status(200).send({
        message: "All Group Section Query",
        access: true,
        all_group_select: all_group_select,
      });
    } else {
      res.status(200).send({
        message: "No Group Section Query",
        access: false,
        all_group_select: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_subject_group_query = async (req, res) => {
  try {
    const { osid } = req?.params;
    if (!osid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const group = await SubjectGroupSelect.findById({ _id: osid })
      .select(
        "group_name compulsory_subject_count optional_subject_count subject_group created_at fixed_subject_count"
      )
      .populate({
        path: "compulsory_subject",
        select: "subjectName",
      })
      .populate({
        path: "optional_subject",
        populate: {
          path: "optional_subject_options optional_subject_options_or.options",
          select: "subjectName",
        },
      })
      .populate({
        path: "fixed_subject",
        populate: {
          path: "fixed_subject_options",
          select: "subjectName",
        },
      })
      .populate({
        path: "subject_group",
        select: "subject_group_name no_of_group",
      });
    res
      .status(200)
      .send({ message: "One Group Select Query", access: false, group });
  } catch (e) {
    console.log(e);
  }
};

exports.render_all_subject_list_query = async (req, res) => {
  try {
    const { did } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var subject = [];
    // const ins = await InstituteAdmin.findById({ _id: id })
    // .select("depart")
    const all_master = await SubjectMaster.find({ department: did }).select(
      "subjectName"
    );
    // var all_subjects = await nested_document_limit(page, limit, subject)
    res.status(200).send({
      message: "All Subjects Query",
      access: false,
      all_subjects: all_master,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_add_subject_group_select_query = async (req, res) => {
  try {
    const { ssid } = req?.params;
    const { cs, os, fs } = req?.body;
    if (!ssid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const group = await SubjectGroupSelect.findById({ _id: ssid });
    if (cs?.length > 0) {
      for (var ele of cs) {
        group.compulsory_subject.push(ele);
        group.compulsory_subject_count += 1;
      }
    }
    if (os?.length > 0) {
      for (var ele of os) {
        group.optional_subject.push({
          optional_subject_rule: ele?.optional_subject_rule,
          optional_subject_name: ele?.optional_subject_name,
          optional_subject_options: [...ele?.optional_subject_options],
          optional_subject_rule_max: ele?.optional_subject_rule_max,
          optional_subject_options_or: [...ele?.optional_subject_options_or],
          major_type: ele?.major_type,
          major_select_max: ele?.major_select_max,
          nested_select_name: ele?.nested_select_name,
          nested_select_min: ele?.nested_select_min,
        });
        group.optional_subject_count += 1;
      }
    }
    if (fs?.length > 0) {
      for (var ele of fs) {
        group.fixed_subject.push({
          fixed_subject_rule: ele?.fixed_subject_rule,
          fixed_subject_name: ele?.fixed_subject_name,
          fixed_subject_options: [...ele?.fixed_subject_options],
          fixed_subject_rule_max: ele?.fixed_subject_rule_max,
          major_type: ele?.major_type,
          major_select_max: ele?.major_select_max,
          nested_select_name: ele?.nested_select_name,
          nested_select_min: ele?.nested_select_min,
        });
        group.fixed_subject_count += 1;
      }
    }
    await group.save();
    res.status(200).send({
      message: "New Group Select Subject Section Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_all_subject_data_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid }).select(
      "subject_groups"
    );
    const all_group = await SubjectGroup.find({
      _id: { $in: ads_admin?.subject_groups },
    }).select("subject_group_name no_of_group");
    if (all_group?.length > 0) {
      res.status(200).send({
        message: "All Group Section Query",
        access: true,
        all_group: all_group,
      });
    } else {
      res.status(200).send({
        message: "No Group Section Query",
        access: false,
        all_group: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_select_group_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    const { select } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const app = await NewApplication.findById({ _id: aid });
    for (let ele of select) {
      app.subject_selected_group.push(ele);
    }
    await app.save();
    res.status(200).send({ message: "Explore Selected Subject " });
  } catch (e) {
    console.log(e);
  }
};

exports.renderApplicationPinnedQuery = async (req, res) => {
  try {
    const { id } = req?.params;
    const { did, type, flow } = req?.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_ins = await Admission.findById({ _id: id });
    var app = await NewApplication.findById({ _id: did });
    if (flow === "INDEPENDENT") {
      one_ins.independent_pinned_application.push(did);
      app.pin.status = "Pinned";
      app.pin.flow = "INDEPENDENT";
      app.pin.flow_id = app?._id;
      await Promise.all([one_ins.save(), app.save()]);
    } else if (flow === "DEPENDENT") {
      let is_avail = one_ins?.dependent_pinned_application?.filter((val) => {
        if (`${val?.section_type}` === `${type}`) return val;
      });
      if (is_avail?.length > 0) {
        for (let ele of is_avail) {
          ele.application.push(did);
          app.pin.status = "Pinned";
          app.pin.flow = "DEPENDENT";
          app.pin.flow_id = app?._id;
        }
      } else {
        one_ins.dependent_pinned_application.push({
          section_type: type,
          application: did,
        });
        app.pin.status = "Pinned";
        app.pin.flow = "DEPENDENT";
        app.pin.flow_id = app?._id;
      }
      // if (one_ins?.dependent_pinned_application?.length > 0) {

      // }
      // else {
      //   one_ins.dependent_pinned_application.push({
      //     section_type: type,
      //     application: did
      //   })
      // }
      for (let ele of one_ins.dependent_pinned_application) {
        if (`${ele?.application}` === `${app?._id}`) {
          app.pin.flow_id = ele?._id;
        }
      }
      await Promise.all([one_ins.save(), app.save()]);
    }
    res
      .status(200)
      .send({ message: "Explore One Application Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.db_delete = async (req, res) => {
  try {
    const ads = await Admission.findById({ _id: "6618a8d3f96be29bdeddf5ba" });
    ads.dependent_pinned_application = [];
    await ads.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderApplicationUnPinnedQuery = async (req, res) => {
  try {
    const { id } = req?.params;
    const { did, flow } = req?.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_ins = await Admission.findById({ _id: id });
    if (flow === "INDEPENDENT") {
      var app = await NewApplication.findById({ _id: did });
      one_ins.independent_pinned_application.pull(did);
      app.pin.status = "";
      app.pin.flow = "";
      app.pin.flow_id = null;
      await Promise.all([one_ins.save(), app.save()]);
    } else if (flow === "DEPENDENT") {
      for (var ele of one_ins?.dependent_pinned_application) {
        if (ele?.application?.includes(`${did}`)) {
          var app = await NewApplication.findById({ _id: did });
          ele.application.pull(did);
          app.pin.status = "";
          app.pin.flow = "";
          app.pin.flow_id = null;
          await app.save();
        } else if (`${ele?._id}` === `${did}`) {
          for (let val of ele?.application) {
            var app = await NewApplication.findById({ _id: `${val}` });
            app.pin.status = "";
            app.pin.flow = "";
            app.pin.flow_id = null;
            await app.save();
          }
          one_ins.dependent_pinned_application.pull(did);
        }
      }
      await one_ins.save();
    }
    res
      .status(200)
      .send({ message: "Explore One Un Pin Application Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.retieveAdmissionAdminAllApplicationPinned = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const ins = await InstituteAdmin.findById({ _id: id }).select(
      "admissionDepart"
    );
    const apply = await Admission.findById({
      _id: `${ins?.admissionDepart?.[0]}`,
    }).populate({
      path: "dependent_pinned_application",
      populate: {
        path: "application",
        populate: {
          path: "applicationDepartment",
          select: "dName photoId photo",
        },
      },
    });
    var nums = await NewApplication.find({
      $and: [{ _id: { $in: apply?.independent_pinned_application } }],
    })
      .select(
        "applicationName applicationEndDate applicationTypeStatus receievedApplication pin selectedApplication confirmedApplication admissionAdmin selectCount confirmCount receievedCount allottedApplication allotCount applicationStatus applicationSeats applicationMaster applicationAbout admissionProcess application_flow applicationBatch gr_initials cancelApplication cancelCount reviewApplication review_count FeeCollectionApplication fee_collect_count student_form_setting"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName photoId photo",
      });
    var list = [];
    // const unique = [...new Set(apply?.dependent_pinned_application.map(item => item.section_type))]
    for (let val of apply?.dependent_pinned_application) {
      list.push({
        type: val?.section_type,
        apps: val?.application,
      });
    }

    const ongoing = [...list, ...nums];
    const ads_obj = {
      message: "All Ongoing Application from DB 🙌",
      // depend: apply?.dependent_pinned_application,
      // independ: nums,
      ongoing: ongoing,
    };
    const adsEncrypt = await encryptionPayload(ads_obj);
    res.status(200).send({
      encrypt: adsEncrypt,
      ads_obj,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retieveAdmissionAdminAllMergedApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const apply = await Admission.findById({ _id: aid }).select(
      "newApplication"
    );
    const ongoing = await NewApplication.find({
      $and: [
        { _id: { $in: apply.newApplication } },
        { applicationStatus: "Ongoing" },
        { applicationTypeStatus: "Normal Application" },
      ],
    })
      .sort("-createdAt")
      .select(
        "applicationName applicationEndDate applicationTypeStatus receievedApplication selectedApplication confirmedApplication admissionAdmin selectCount confirmCount receievedCount allottedApplication allotCount applicationStatus applicationSeats applicationMaster applicationAbout admissionProcess application_flow applicationBatch gr_initials cancelApplication cancelCount reviewApplication review_count FeeCollectionApplication fee_collect_count student_form_setting pin"
      );

    if (ongoing?.length > 0) {
      const custom_obj = {
        selectCount: 0,
        confirmCount: 0,
        receievedCount: 0,
        allotCount: 0,
        cancelCount: 0,
        review_count: 0,
        fee_collect_count: 0,
        docs_enable: "Yes",
        fee_collect_enable: "Yes",
        confirm_enable: "Yes",
      };
      for (var ref of ongoing) {
        custom_obj.selectCount += ref?.selectedApplication?.length ?? 0;
        custom_obj.confirmCount += ref?.confirmedApplication?.length ?? 0;
        custom_obj.receievedCount += ref?.receievedApplication?.length ?? 0;
        custom_obj.allotCount += ref?.allottedApplication?.length ?? 0;
        custom_obj.cancelCount += ref?.cancelApplication?.length ?? 0;
        custom_obj.review_count += ref?.reviewApplication?.length ?? 0;
        custom_obj.fee_collect_count +=
          ref?.FeeCollectionApplication?.length ?? 0;
      }

      const ads_obj = {
        message: "All Ongoing Application from DB 🙌",
        custom_obj: custom_obj,
      };
      res.status(200).send({
        ads_obj,
      });
    } else {
      const ads_obj = {
        message: "Dark side in depth nothing to find",
        custom_obj: null,
      };
      res.status(200).send({
        ads_obj,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllSelectMergedApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_select = [];
      const apply = await Admission.findById({ _id: aid })
        // .select("selectCount")
        .populate({
          path: "selectedApplication",
          populate: {
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber valid_full_name form_no new_app",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          },
        });
      for (let data of apply.selectedApplication) {
        if (data.student !== null) {
          filter_select.push(data);
        }
      }
      for (let data of filter_select) {
        if (data?.application) {
          const apps = await NewApplication.findById({
            _id: `${data?.application}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationDepartment =
            apps?.applicationDepartment;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
          data.student.new_app.collect_docs = apps?.collect_docs;
        }
      }
      if (filter_select?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Selection required make sure you come up with Tea and Snack from DB 🙌",
          select: filter_select?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          select: [],
        });
      }
    } else {
      var apply = await Admission.findById({ _id: aid })
        // .select("selectCount")
        .populate({
          path: "selectedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber form_no new_app",
            populate: {
              path: "fee_structure hostel_fee_structure",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          },
        });
      var all_select_query = nested_document_limit(
        page,
        limit,
        apply?.selectedApplication?.reverse()
      );
      for (let data of all_select_query) {
        if (data?.application) {
          const apps = await NewApplication.findById({
            _id: `${data?.application}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationDepartment =
            apps?.applicationDepartment;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
          data.student.new_app.collect_docs = apps?.collect_docs;
        }
      }
      if (all_select_query?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Selection required make sure you come up with Tea and Snack from DB 🙌",
          select: all_select_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          select: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllFeeCollectedMergedApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_select = [];
      const apply = await Admission.findById({ _id: aid })
        .select("FeeCollectionApplication")
        .populate({
          path: "FeeCollectionApplication",
          populate: {
            path: "student payment_flow app_card gov_card fee_struct application",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            // select:
            //   "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber valid_full_name",
            // populate: {
            //   path: "fee_structure",
            //   select:
            //     "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
            //   populate: {
            //     path: "category_master",
            //     select: "category_name",
            //   },
            // },
          },
        });
      for (let data of apply.FeeCollectionApplication) {
        if (data.student !== null) {
          filter_select.push(data);
        }
      }
      for (let data of filter_select) {
        if (data?.application?._id) {
          const apps = await NewApplication.findById({
            _id: `${data?.application?._id}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationDepartment =
            apps?.applicationDepartment;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
        }
      }
      if (filter_select?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Fees Collection required make sure you come up with Tea and Snack from DB 🙌",
          fees: filter_select?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          fees: [],
        });
      }
    } else {
      var apply = await Admission.findById({ _id: aid })
        // .select("fee_collect_count")
        .select("FeeCollectionApplication")
        .populate({
          path: "FeeCollectionApplication",
          populate: {
            path: "student payment_flow app_card gov_card fee_struct application",
            // select:
            //   "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber",
            // populate: {
            //   path: "fee_structure",
            //   select:
            //     "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month",
            //   populate: {
            //     path: "category_master",
            //     select: "category_name",
            //   },
            // },
          },
        });
      var all_select_query = nested_document_limit(
        page,
        limit,
        apply?.FeeCollectionApplication?.reverse()
      );
      for (let data of all_select_query) {
        if (data?.application?._id) {
          const apps = await NewApplication.findById({
            _id: `${data?.application?._id}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationDepartment =
            apps?.applicationDepartment;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
        }
      }
      if (all_select_query?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Fees Collection Selection required make sure you come up with Tea and Snack from DB 🙌",
          fees: all_select_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          fees: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllConfirmedMergedApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_confirm = [];
      const apply = await Admission.findById({ _id: aid })
        // .select("confirmCount")
        .populate({
          path: "confirmedApplication_query",
          populate: {
            path: "student",
            match: {
              $or: [
                { studentFirstName: { $regex: `${search}`, $options: "i" } },
                {
                  studentMiddleName: { $regex: `${search}`, $options: "i" },
                },
                {
                  studentLastName: { $regex: `${search}`, $options: "i" },
                },
                {
                  valid_full_name: { $regex: `${search}`, $options: "i" },
                },
                {
                  form_no: { $regex: `${search}`, $options: "i" },
                },
              ],
            },
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt valid_full_name institute form_no new_app",
            populate: {
              path: "fee_structure hostel_fee_structure fee_receipt",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
              // populate: {
              //   path: "category_master",
              //   select: "category_name",
              // },
            },
          },
        });
      for (let data of apply.confirmedApplication_query) {
        if (data.student !== null) {
          filter_confirm.push(data);
        }
      }
      for (let data of filter_confirm) {
        if (data?.application) {
          const apps = await NewApplication.findById({
            _id: `${data?.application}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationDepartment =
            apps?.applicationDepartment;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
        }
      }
      if (filter_confirm?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: filter_confirm?.reverse(),
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    } else {
      const apply = await Admission.findById({ _id: aid })
        // .select("confirmCount")
        .populate({
          path: "confirmedApplication_query",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto application_print studentGender studentPhoneNumber studentParentsPhoneNumber fee_receipt institute form_no new_app",
            populate: {
              path: "fee_structure hostel_fee_structure fee_receipt",
              select:
                "total_admission_fees one_installments structure_name unique_structure_name applicable_fees structure_month receipt_file",
              // populate: {
              //   path: "category_master",
              //   select: "category_name",
              // },
            },
          },
        });
      var all_confirm_query = nested_document_limit(
        page,
        limit,
        apply?.confirmedApplication_query?.reverse()
      );
      for (let data of all_confirm_query) {
        if (data?.application) {
          const apps = await NewApplication.findById({
            _id: `${data?.application}`,
          });
          data.student.new_app.appId = apps?._id;
          data.student.new_app.appName = apps?.applicationName;
          data.student.new_app.applicationDepartment =
            apps?.applicationDepartment;
          data.student.new_app.applicationBatch = apps?.applicationBatch;
          data.student.new_app.applicationMaster = apps?.applicationMaster;
        }
      }
      if (all_confirm_query?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: all_confirm_query,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.form = async (req, res) => {
  try {
    const { sid } = req?.params;
    const { id, aid } = req?.body;
    const student = await Student.findById({ _id: sid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const apply = await NewApplication.findById({ _id: aid });
    await generateStudentAdmissionForm(
      student?._id,
      institute?._id,
      `${student?.studentFirstName} ${
        student?.studentMiddleName
          ? student?.studentMiddleName
          : student?.studentFatherName
          ? student?.studentFatherName
          : ""
      } ${student?.studentLastName}`,
      `${apply?.applicationName}`
    );
  } catch (e) {
    console.log(e);
  }
};

exports.retieveAdmissionAdminInsertion = async (req, res) => {
  try {
    const { aid } = req.params;
    const apply = await Admission.findById({ _id: aid });
    var ongoing = await NewApplication.find({
      $and: [
        { _id: { $in: apply.newApplication } },
        { applicationStatus: "Ongoing" },
        { applicationTypeStatus: "Normal Application" },
      ],
    })
      .sort("-createdAt")
      .select(
        "selectedApplication confirmedApplication admissionProcess application_flow applicationBatch gr_initials cancelApplication cancelCount reviewApplication review_count FeeCollectionApplication fee_collect_count student_form_setting pin"
      );

    // apply.selectedApplication = []
    // apply.confirmedApplication_query = []
    // apply.FeeCollectionApplication = []
    for (let all of ongoing) {
      for (let ele of all?.selectedApplication) {
        apply.selectedApplication.push({
          student: ele?.student,
          fee_remain: ele?.fee_remain,
          revert_request_status: ele?.revert_request_status,
          application: all?._id,
          staff: ele?.staff,
        });
      }
    }
    for (let all of ongoing) {
      for (let ele of all?.FeeCollectionApplication) {
        apply.FeeCollectionApplication.push({
          student: ele?.student,
          fee_remain: ele?.fee_remain,
          payment_flow: ele?.payment_flow,
          app_card: ele?.app_card,
          gov_card: ele?.gov_card,
          status_id: ele?.status_id,
          revert_request_status: ele?.revert_request_status,
          fee_struct: ele?.fee_struct,
          application: all?._id,
        });
      }
    }
    for (let all of ongoing) {
      for (let ele of all?.confirmedApplication) {
        apply.confirmedApplication_query.push({
          student: ele?.student,
          payment_status: ele?.payment_status,
          install_type: ele?.install_type,
          fee_remain: ele?.fee_remain,
          application: all?._id,
        });
      }
    }
    await apply.save();
    res.status(200).send({ message: "Insertion Completed", apply });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieve_admission_revertion_query = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        select_status: false,
      });
    var new_apply = await NewApplication.findById({ _id: aid });
    var ads_admin = await Admission.findById({
      _id: `${new_apply?.admissionAdmin}`,
    });
    for (let ele of new_apply?.selectedApplication) {
      // console.log(ele?.revert_request_status)
      const student = await Student.findById({ _id: ele?.student });
      var user = await User.findById({ _id: `${student?.user}` });
      var status = await Status.findById({ _id: ele?.revert_request_status });
      if (`${ele.student}` === `${student._id}`) {
        new_apply.selectedApplication.pull(ele._id);
      }
      if (`${ele.student}` === `${student._id}`) {
        ads_admin.selectedApplication.pull(ele._id);
      }
      new_apply.receievedApplication.push({
        student: student._id,
      });
      if (new_apply.selectCount > 0) {
        new_apply.selectCount -= 1;
      }
      user.applicationStatus.pull(status?._id);
      await Status.findByIdAndDelete(status?._id);
      await user.save();
    }
    await Promise.all([ads_admin.save(), new_apply.save()]);
    res.status(200).send({
      message: `Revert Back To Receieved Application`,
      access: true,
      new_apply: new_apply?.selectedApplication,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieve_admission_revertion_reject_query = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    })
      .populate({
        path: "admissionAdminHead",
        select: "user",
      })
      .populate({
        path: "institute",
        select: "insName",
      });
    for (let ele of apply?.receievedApplication) {
      const student = await Student.findById({ _id: ele?.student });
      var user = await User.findById({ _id: `${student?.user}` });
      const status = new Status({});
      const notify = new StudentNotification({});
      if (`${ele.student}` === `${student._id}`) {
        apply.receievedApplication.pull(ele._id);
        user.applyApplication.pull(apply?._id);
      }
      if (apply.receievedCount > 0) {
        apply.receievedCount -= 1;
      }
      status.content = `You have been rejected for ${apply.applicationName}. Reason - Time limit for document submission is over.`;
      status.applicationId = apply._id;
      status.studentId = student._id;
      status.student = student._id;
      user.applicationStatus.push(status._id);
      if (user?.applyApplication?.includes(`${apply?._id}`)) {
        user.applyApplication.pull(apply?._id);
      }
      apply.reject_student.push({
        student: student?._id,
        reason: "Time limit for document submission is over.",
      });
      status.instituteId = admission_admin?.institute;
      notify.notifyContent = `You have been rejected for ${apply.applicationName}. Reason - Time limit for document submission is over.`;
      notify.notifySender = admission_admin?.admissionAdminHead?.user;
      notify.notifyReceiever = user?._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByAdmissionPhoto = admission_admin?._id;
      notify.notifyCategory = "Status Alert";
      notify.redirectIndex = 29;
      await Promise.all([
        apply.save(),
        student.save(),
        user.save(),
        status.save(),
        notify.save(),
      ]);
      invokeMemberTabNotification(
        "Admission Status",
        status.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      let name = `${student?.studentFirstName} ${
        student?.studentMiddleName ?? ""
      } ${student?.studentLastName}`;
      if (student?.studentEmail) {
        email_sms_designation_application(
          student?.studentEmail,
          name,
          apply?.applicationName,
          "Time limit for document submission is over.",
          admission_admin?.institute?.insName
        );
      }
    }
    await apply.save();
    res.status(200).send({
      message: `Best of luck for next time 😥`,
      cancel_status: true,
      apply: apply?.receievedApplication,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionCancelApplicationModify = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { reason, staffId } = req?.body;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    })
      .populate({
        path: "admissionAdminHead",
        select: "user",
      })
      .populate({
        path: "institute",
        select: "insName",
      });
    const student = await Student.findById({ _id: sid });
    var user = await User.findById({ _id: `${student?.user}` });
    const status = new Status({});
    const notify = new StudentNotification({});
    const all_status = await Status.find({
      $and: [
        { _id: { $in: user?.applicationStatus } },
        { applicationId: apply?._id },
        { group_by: "Admission_Application_Applied" },
      ],
    });
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        app.reject_status = reason;
        // apply.receievedApplication.pull(app._id);
        // user.applyApplication.pull(apply?._id);
      } else {
      }
    }
    if (apply.receievedCount > 0) {
      apply.receievedCount -= 1;
    }
    status.content = `You have been rejected for ${apply.applicationName}. ${reason}`;
    status.applicationId = apply._id;
    status.studentId = student._id;
    status.student = student._id;
    user.applicationStatus.push(status._id);
    // if (user?.applyApplication?.includes(`${apply?._id}`)) {
    //   user.applyApplication.pull(apply?._id);
    // }
    student.student_application_obj.push({
      app: apply?._id,
      staff: staffId,
      flow: "reject_by",
    });
    status.instituteId = admission_admin?.institute;
    notify.notifyContent = `You have been rejected for ${apply.applicationName}. ${reason}`;
    notify.notifySender = admission_admin?.admissionAdminHead?.user;
    notify.notifyReceiever = user?._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student?._id;
    user.activity_tab.push(notify?._id);
    notify.notifyByAdmissionPhoto = admission_admin?._id;
    notify.notifyCategory = "Status Alert";
    notify.redirectIndex = 29;
    for (let ele of all_status) {
      ele.rejection_modification = "Enable";
      ele.rejection_reason = reason;
      await ele.save();
    }
    await Promise.all([
      apply.save(),
      student.save(),
      user.save(),
      status.save(),
      notify.save(),
    ]);
    res.status(200).send({
      message: `Best of luck for next time 😥`,
      cancel_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
    let name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    if (student?.studentEmail) {
      email_sms_designation_application(
        student?.studentEmail,
        name,
        apply?.applicationName,
        reason,
        admission_admin?.institute?.insName
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_subject_select_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const apply = await NewApplication.findById({ _id: aid }).select(
      "subject_selected_group"
    );
    if (apply?.subject_selected_group?.length > 0) {
      const all_group = await SubjectGroup.findById({
        _id: `${apply?.subject_selected_group}`,
      });
      const all_group_select = await SubjectGroupSelect.find({
        subject_group: { $in: all_group },
      })
        .populate({
          path: "compulsory_subject",
          select: "subjectName",
        })
        .populate({
          path: "optional_subject",
          populate: {
            path: "optional_subject_options optional_subject_options_or.options",
            select: "subjectName",
          },
        })
        .populate({
          path: "fixed_subject",
          populate: {
            path: "fixed_subject_options",
            select: "subjectName",
          },
        });
      var subject_list = [];
      for (let ele of all_group_select) {
        subject_list.push(...ele?.compulsory_subject);
      }
      for (let ele of all_group_select) {
        for (let val of ele?.fixed_subject) {
          subject_list.push(...val?.fixed_subject_options);
        }
      }
      for (let ele of all_group_select) {
        for (let val of ele?.optional_subject) {
          subject_list.push(...val?.optional_subject_options);
        }
        for (let val of ele?.optional_subject) {
          for (let stu of val?.optional_subject_options_or) {
            subject_list.push(...stu?.options);
          }
        }
      }
      const unique = [...new Set(subject_list.map((item) => item._id))];
      const all_subjects = await SubjectMaster.find({
        _id: { $in: unique },
      }).select("subjectName");
      res.status(200).send({
        message: "Explore All Subject Master Query",
        access: true,
        subject: all_subjects,
      });
    } else {
      res.status(200).send({
        message: "No Explore All Subject Master Query",
        access: true,
        subject: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_subject_student_query = async (req, res) => {
  try {
    const { sid, aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_subject = await SubjectMaster.findById({ _id: sid });
    const apply = await NewApplication.findById({ _id: aid });
    // const nums = [aid]
    // const all_user = await User.find({ applyApplication: { $in: nums } })
    let numss = [];
    for (let ele of apply?.confirmedApplication) {
      numss.push(ele?.student);
    }
    for (let ele of apply?.allottedApplication) {
      numss.push(ele?.student);
    }
    let subject_num = [...numss, ...apply?.reviewApplication];
    const all_student = await Student.find({ _id: { $in: subject_num } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (`${ele?._id}` === `${one_subject?._id}`) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (`${ele?._id}` === `${one_subject?._id}`) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (`${ele?._id}` === `${one_subject?._id}`) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = await Student.find({ _id: { $in: unique } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      });
    const all_students = await nested_document_limit(page, limit, all);
    res.status(200).send({
      message: "Explore All Students Master Query",
      access: true,
      student: all_students?.length > 0 ? all_students : [],
      student_count: unique?.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.spce_student_name_sequencing = async (list) => {
  try {
    var i = 0;
    for (let ele of list) {
      const student = await Student.findOne({ studentGRNO: ele?.studentGRNO });
      if (student?._id) {
        student.studentFirstName = ele?.studentFirstName;
        student.studentFatherName = ele?.studentFatherName;
        student.studentMiddleName = ele?.studentFatherName;
        student.studentLastName = ele?.studentLastName;
        await student.save();
        console.log(i);
        i += 1;
      } else {
        console.log("Student Data Not Updated", student?._id);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_subject_change_student_query = async (req, res) => {
  try {
    const { sid } = req?.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await Student.findByIdAndUpdate(sid, req?.body);
    res
      .status(200)
      .send({ message: "Explore Student Subject Change Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.render_one_fee_receipt_change_student_query = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const receipt = await FeeReceipt.findById({ _id: fid });
    const student = await Student.findById({ _id: `${receipt?.student}` });
    const order = await OrderPayment.findOne({ fee_receipt: receipt?._id });
    const remaining = await RemainingList.findOne({
      $and: [{ appId: receipt?.application }, { student: student?._id }],
    });
    const nest_app = await NestedCard.findById({
      _id: remaining?.applicable_card,
    });
    const nest_gov = await NestedCard.findById({
      _id: remaining?.government_card,
    });
    if (nest_app?.paid_fee > nest_app?.applicable_fee) {
      nest_app.paid_fee -= receipt?.fee_payment_amount;
    }
    if (remaining?.paid_fee > remaining?.applicable_fee) {
      remaining.paid_fee -= receipt?.fee_payment_amount;
    }
    if (nest_gov?.paid_fee > nest_gov?.applicable_fee) {
      nest_gov.paid_fee -= receipt?.fee_payment_amount;
    }
    for (let ele of nest_app?.remaining_array) {
      if (`${ele?.fee_receipt}` === `${receipt?._id}`) {
        if (nest_app?.paid_fee >= ele?.remainAmount) {
          nest_app.paid_fee -= ele?.remainAmount;
        }
        if (remaining?.paid_fee >= ele?.remainAmount) {
          remaining.paid_fee -= ele?.remainAmount;
        }
        nest_app.remaining_fee += ele?.remainAmount;
        remaining.remaining_fee += ele?.remainAmount;
        nest_app.remaining_array.pull(ele?._id);
        if (nest_app?.remaining_fee > 0) {
          if (ele?.status === "Not Paid") {
          } else {
            nest_app.remaining_array.push({
              installmentValue: "Installment Remain",
              status: "Not Paid",
              isEnable: true,
              appId: remaining?.appId,
              instituteId: remaining?.institute,
              remainAmount: nest_app?.remaining_fee,
            });
          }
        }
      }
    }
    for (let ele of nest_gov?.remaining_array) {
      if (`${ele?.fee_receipt}` === `${receipt?._id}`) {
        if (nest_gov?.paid_fee >= ele?.remainAmount) {
          nest_gov.paid_fee -= ele?.remainAmount;
        }
        if (remaining?.paid_fee >= ele?.remainAmount) {
          remaining.paid_fee -= ele?.remainAmount;
        }
        nest_gov.remaining_fee += ele?.remainAmount;
        remaining.remaining_fee += ele?.remainAmount;
        nest_gov.remaining_array.pull(ele?._id);
        if (nest_gov?.remaining_fee > 0) {
          if (ele?.status === "Not Paid") {
          } else {
            nest_gov.remaining_array.push({
              installmentValue: "Installment Remain",
              status: "Not Paid",
              isEnable: true,
              appId: remaining?.appId,
              instituteId: remaining?.institute,
              remainAmount: nest_gov?.remaining_fee,
            });
          }
        }
      }
    }
    await Promise.all([nest_app.save(), nest_gov.save(), remaining.save()]);
    await FeeReceipt.findByIdAndDelete(receipt?._id);
    await OrderPayment.findByIdAndDelete(order?._id);
    res
      .status(200)
      .send({ message: "Explore Student Subject Change Query", access: true });
    for (let ele of student?.active_fee_heads) {
      if (`${ele?.appId}` === `${receipt?.application}`) {
        student?.active_fee_heads?.pull(ele);
      }
    }
    await student.save();
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveClassAllotQueryReverse = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        allot_status: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    }).select("institute");
    var institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    var depart = await Department.findById({
      _id: `${apply.applicationDepartment}`,
    });
    var batch = await Batch.findById({ _id: `${apply.applicationBatch}` });
    var nums = [];
    for (let ele of apply?.allottedApplication) {
      nums.push(ele?.student);
    }
    if (nums?.length > 0) {
      for (var sid of nums) {
        const student = await Student.findById({ _id: sid });
        if (student?.studentClass != null) {
          var classes = await Class.findById({ _id: student?.studentClass });
          const all_subjects = await Subject.find({
            $and: [
              { class: classes?._id },
              { subjectMasterName: { $in: student?.student_optional_subject } },
            ],
          });
          // apply.reviewApplication.pull(student._id);
          apply.undo_student.push(student?._id);
          apply.reviewApplication.push(student?._id);
          // apply.allottedApplication.push({
          //   student: student._id,
          //   payment_status: "offline",
          //   alloted_class: `${classes.className} - ${classes.classTitle}`,
          //   alloted_status: "Alloted",
          //   fee_remain: student.admissionRemainFeeCount,
          //   paid_status:
          //     student.admissionRemainFeeCount == 0 ? "Paid" : "Not Paid",
          // });
          // apply.allotCount += 1;
          // student.confirmApplication.pull(apply._id)
          student.studentStatus = "Not Approved";
          institute.ApproveStudent.pull(student._id);
          student.institute = null;
          admins.studentArray.pull(student._id);
          if (admins.studentCount > 0) {
            admins.studentCount -= 1;
          }
          if (institute.studentCount > 0) {
            institute.studentCount -= 1;
          }
          if (classes.strength > 0) {
            classes.strength -= 1;
          }
          classes.ApproveStudent.pull(student._id);
          if (classes.studentCount > 0) {
            classes.studentCount -= 1;
          }
          student.studentGRNO = "";
          student.studentROLLNO = "";
          student.studentClass = null;
          student.studentAdmissionDate = new Date().toISOString();
          depart.ApproveStudent.pull(student._id);
          if (depart.studentCount > 0) {
            depart.studentCount -= 1;
          }
          student.department = null;
          batch.ApproveStudent.pull(student._id);
          student.batches = null;
          if (all_subjects?.length > 0) {
            student.student_optional_subject_access = "Yes";
            for (let ele of all_subjects) {
              ele.optionalStudent.pull(student?._id);
              await ele.save();
            }
          }
          student.academic_subject = [];
          await Promise.all([
            apply.save(),
            student.save(),
            admins.save(),
            institute.save(),
            classes.save(),
            depart.save(),
            batch.save(),
          ]);
          if (student.studentGender === "Male") {
            classes.boyCount -= 1;
            batch.student_category.boyCount -= 1;
          } else if (student.studentGender === "Female") {
            classes.girlCount -= 1;
            batch.student_category.girlCount -= 1;
          } else if (student.studentGender === "Other") {
            classes.otherCount -= 1;
            batch.student_category.otherCount -= 1;
          } else {
          }
          if (student.studentCastCategory === "General") {
            batch.student_category.generalCount -= 1;
          } else if (student.studentCastCategory === "OBC") {
            batch.student_category.obcCount -= 1;
          } else if (student.studentCastCategory === "SC") {
            batch.student_category.scCount -= 1;
          } else if (student.studentCastCategory === "ST") {
            batch.student_category.stCount -= 1;
          } else if (student.studentCastCategory === "NT-A") {
            batch.student_category.ntaCount -= 1;
          } else if (student.studentCastCategory === "NT-B") {
            batch.student_category.ntbCount -= 1;
          } else if (student.studentCastCategory === "NT-C") {
            batch.student_category.ntcCount -= 1;
          } else if (student.studentCastCategory === "NT-D") {
            batch.student_category.ntdCount -= 1;
          } else if (student.studentCastCategory === "VJ") {
            batch.student_category.vjCount -= 1;
          } else {
          }
          await Promise.all([classes.save(), batch.save()]);
          for (let ele of apply?.allottedApplication) {
            if (`${ele?.student}` === `${student?._id}`) {
              apply.allottedApplication.pull(ele?._id);
              apply.allot_array.pull(student?._id);
              if (apply?.allotCount > 0) {
                apply.allotCount -= 1;
              }
            }
          }
          await apply.save();
        }
      }
      res.status(200).send({
        message: `Distribute sweets to all family members`,
        allot_status: true,
        // apply: apply?.undo_student,
      });
    } else {
      res.status(200).send({
        message: `Take sweets to all family members. No Student Found`,
        allot_status: false,
        // apply: [],
      });
    }
    // var i =0
    // for (let ele of apply?.undo_student) {
    //   if (apply.reviewApplication?.includes(`${ele?._id}`)) {

    //   }
    //   else {
    //     apply.reviewApplication.push(ele?._id)
    //   }
    //   console.log(i)
    //   i+=1
    // }
    // await apply.save()
    // res.status(200).send({
    //   message: `Distribute sweets to all family members`,
    //   allot_status: true,
    //   apply: apply?.undo_student
    // });
  } catch (e) {
    console.log(e);
  }
};

exports.subject_student_class = async (req, res) => {
  try {
    // let nums = ["6653fe0b0e7630f3c0ca26dd"]
    // const apps = await NewApplication.find({ subject_selected_group: { $in: nums } })
    //   .select("_id")
    // let nums = [
    //   "6654ecb3367fb22e2d22c48f",
    //   "665abaaf18ce55bfd5477436",
    //   "665c8c4ced5b038fa0f185a5",
    //   "665d9b7b8ccb86845ad26198",
    //   "6660799111db27577deb9767",
    //   "666098f3d8fd9817b7599e19",
    //   "66617eae1409ddf7a9ab1ae0",
    //   "6661807ed8fd9817b75c9931",
    //   "6661b6af40f1f8d0d05c7c10",
    //   "6661c7521def169acf9e5303",
    //   "6661f885d3fc4fd9ec0df86e",
    //   "6662e3c12b6eda0086207cda",
    //   "66646225e6dd6bbe8832b321",
    //   "6666c89abc3db0d80c0dfbcd",
    //   "6666f007b8e26221ed03c701",
    //   "66670b0b0cc627f95e9d435c",
    //   "666816b898c7a5e7d2f6afbe",
    //   "6668694c5f25de640340e60e",
    //   "666a9fc38a25f504d23909b1",
    //   "666aac8e7b7f82aa1d9f9c4d",
    //   "666aaf6fd5db98ae0768227c",
    //   "666ac46e2921e51fb3fa54ae",
    //   "666b1bdd438f32cf20307acf",
    //   "666bdd38380adf8aea8d711f",
    //   "666f04f25c4f745988a5006a",
    //   "6671370faca0ae8d1780c9b6",
    //   "66713e4baca0ae8d1780ff14",
    //   "66715c83a1a3cc99e82d2062",
    //   "6673c1fa6c3f5b158e11681b",
    //   "6673f3017c5d6b9d3cd3081c",
    //   "6673f78413645f6224f2217b",
    //   "66755797da1297a6b9ff3aa2",
    //   "66759331b3d60fc2b7543864",
    //   "667a6c792b6329957433f4f5",
    //   "667bc3967964c3659bf3e03f",
    //   "667d2d0962f9a83c4fb71464",
    //   "667e8826059be654d96d778b",
    //   "667e8a17059be654d96d8422",
    //   "667ec6f68e98c621475a1205",
    //   "6682237fc1775c56bcd8adb1",
    //   "6682447cee0f23e006e16dae",
    //   "66826be4c1aac0115ca07816",
    //   "66829a5e04076da2fc636b14",
    //   "6683a40076fdc6699a9e79e1",
    //   "668e3c47e473898a9096f8c3",
    //   "668e5f83f45ccd2d45d283e6",
    //   "668f99ded8e2ed1572b14087",
    //   "6690eab2cc7120d68e9d1aeb"
    // ]
    const all_student = await Student.find({ _id: { $in: nums } }).select(
      "_id student_optional_subject"
    );
    var subject_2 = "6640d3950728cf14e8bfab1f";
    for (let ele of all_student) {
      // if (ele?.student_optional_subject?.includes(`${subject}`)) {
      ele.student_optional_subject.push(subject_2);
      await ele.save();
      // }
    }
    res
      .status(200)
      .send({ message: "Explore Apps", all_student, len: all_student?.length });
  } catch (e) {
    console.log(e);
  }
};

exports.staff_name_only = async (req, res) => {
  try {
    const { sid } = req?.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const student = await Student.findById({ _id: sid })
      .select("student_application_obj student_form_flow")
      .populate({
        path: "student_application_obj.staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      })
      .lean()
      .exec();

    let list = [];
    // let nums = [
    //   { request_by: "Accepted By"},
    //   { select_by: "Selected By"},
    //   { confirm_by: "Confirmed By"},
    //   { fee_collect_by: "Fee Collected By"},
    //   { review_by: "Reviewed By"},
    //   { allot_by: "Allotted By"},
    //   { cancel_by: "Cancelled By"},
    //   { reverted_by: "Reverted By"},
    //   { docs_by: "Docs Verified By"},
    //   { reject_by: "Rejected By"},
    //   { assign_by: "Fee Structure Assign By"},
    // ]
    if (student?.student_application_obj?.length > 0) {
      for (let ele of student?.student_application_obj?.reverse()) {
        if (`${student?.student_form_flow?.did}` === `${ele?.app}`) {
          list.push({
            key:
              ele?.flow === "request_by"
                ? "Accepted By"
                : ele?.flow === "select_by"
                ? "Selected By"
                : ele?.flow === "confirm_by"
                ? "Confirmed By"
                : ele?.flow === "fee_collect_by"
                ? "Fee Collected By"
                : ele?.flow === "review_by"
                ? "Reviewed By"
                : ele?.flow === "allot_by"
                ? "Allotted By"
                : ele?.flow === "cancel_by"
                ? "Cancelled By"
                : ele?.flow === "reverted_by"
                ? "Reverted By"
                : ele?.flow === "docs_by"
                ? "Docs Verified By"
                : ele?.flow === "reject_by"
                ? "Rejected By"
                : ele?.flow === "assign_by"
                ? "Fee Structure Assign By"
                : "",
            value: `${ele?.staff?.staffFirstName} ${
              ele?.staff?.staffMiddleName ?? ""
            } ${ele?.staff?.staffLastName}`,
            latest: ele?.created_at,
          });
        }
      }
      res
        .status(200)
        .send({ message: "Explore Staff Name Only", access: true, only: list });
    } else {
      res
        .status(200)
        .send({ message: "No Staff Name Only", access: true, only: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_admission_intake_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await NewApplication.findByIdAndUpdate(aid, req?.body);

    res.status(200).send({ message: "Explore New Application InTake Query" });
  } catch (e) {
    console.log(e);
  }
};

exports.render_admission_docs_collect_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await NewApplication.findByIdAndUpdate(aid, req?.body);

    res
      .status(200)
      .send({ message: "Explore New Application Collect Docs Query" });
  } catch (e) {
    console.log(e);
  }
};

exports.render_all_move_to_confirm = async (req, res) => {
  try {
    const nums = [
      "66866ac748bcd4555dd23684",
      "6687ca05e0a07f2ba2aa759e",
      "66881bd6e0a07f2ba2ac2d33",
      "668b8774d65eae5968f405ad",
      "666bdf1623dd2820dd62b970",
      "6663eb3115c994e9112bc445",
      "665ddaa5467341ec95e69031",
      "667d50584bb061c24301dedc",
      "666860c6e48bba3b26abb4c2",
      "6688d3b2ed5a562f9ff9a70f",
      "668903e53a73a0ee9f580612",
      "667fc7d38e98c621475d6aa8",
      "667aa82cf4345c2cc2b6e1b5",
      "66655b82c158f217f7005dd7",
      "66598d634e300b805b0160fd",
      "6661b6fd40f1f8d0d05c7ff2",
      "668cfb2835a5932c764eb0d2",
      "6684f4c2cf9bf8669c0c3b90",
      "668e251ee473898a909664af",
      "6689016dd5246b6e1de07747",
      "668bec17b11c7a84ed1733fb",
    ];
    const all_student = await Student.find({ _id: { $in: nums } }).select(
      "student_form_flow studentFirstName studentMiddleName studentLastName"
    );

    var i = 0;
    for (let ele of all_student) {
      if (ele?.student_form_flow?.flow === "APPLICATION") {
        const app = await NewApplication.findById({
          _id: ele?.student_form_flow?.did,
        });
        app.confirmedApplication.push({
          student: ele?._id,
          payment_status: "Offline",
          install_type: "First Installment Paid",
          fee_remain: 0,
        });
        app.confirmCount += 1;
        for (let val of app?.FeeCollectionApplication) {
          if (`${val?.student}` === `${ele?._id}`) {
            app?.FeeCollectionApplication?.pull(val?._id);
          }
        }
        await app.save();
        console.log(i);
        i += 1;
      }
    }
    res.status(200).send({
      message: "Explore All Student Query",
      access: true,
      all_student,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_excess = async (req, res) => {
  try {
    const all_struct = await FeeStructure.find({
      finance: "662e8ff2a73be706305ec252",
    });
    const all = await RemainingList.find({ fee_structure: all_struct })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName studentFatherName",
      })
      .populate({
        path: "applicable_card government_card",
      });

    var nums = [];
    for (let ele of all) {
      if (
        ele?.applicable_card?.paid_fee > ele?.applicable_card?.applicable_fee
      ) {
        nums.push({
          student: ele?.student,
          excess:
            ele?.applicable_card?.paid_fee -
            ele?.applicable_card?.applicable_fee,
        });
      }
    }
    res
      .status(200)
      .send({ message: "Explore All Excess Fees", access: true, nums });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveInstituteNewGRNO = async (gr) => {
  try {
    var i = 0;
    for (let ele of gr) {
      let fName = ele?.Name?.replaceAll(" ", "")?.toLowerCase();
      const student = await Student.findOne({
        $and: [
          { studentGRNO: `${ele?.RegistrationID}` },
          { scholar_name: `${fName}` },
        ],
      });
      if (student?._id) {
        student.studentGRNO = ele?.NewID;
        await student.save();
      }
      console.log(i);
      i += 1;
    }
    console.log("DONE");
    // res.status(200).send({ message: "Explore All New GRNO", access: true})
  } catch (e) {
    console.log(e);
  }
};

// exports.renderAllCancelAppsQuery = async (req, res) => {
//   try {
//     const { aid } = req?.params
//     if (!aid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false })

//     const ads_admin = await Admission.findById({ _id: aid })
//       .select("newApplication cancel_admission cancel_admission_count")

//     const all_apps = await NewApplication.find({ _id: { $in: ads_admin?.newApplication } })
//     .select("cancelApplication")

//     for (var val of all_apps) {
//       for (var ele of val?.cancelApplication) {
//         ads_admin.cancel_admission.push(ele)
//         ads_admin.cancel_admission_count += ele?.refund_amount
//       }
//     }
//     await ads_admin.save()
//     res.status(200).send({ message: "Explore All Cancel Move To Admission Query"})
//   }
//   catch (e) {
//     console.log(e)
//   }
// }

exports.admission_form_print_case_query = async (req, res) => {
  try {
    const { aid } = req.params;
    const { admission_form_print_case } = req.body;

    if (!aid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const admission = await Admission.findById(aid);
    admission.admission_form_print_case = admission_form_print_case;
    if (admission.institute) {
      const institute = await InstituteAdmin.findById(admission.institute);
      institute.admission_form_print_case = admission_form_print_case;
      await institute.save();
    }
    await admission.save();
    res.status(200).send({
      message: "Print case is updated successfully.",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

// exports.render_all_subject_query = async (req, res) => {
//   try {
//     const { aid } = req?.params;
//     if (!aid)
//       return res.status(200).send({
//         message: "Their is a bug need to fixed immediately",
//         access: false,
//       });

//     const ads_admin = await Admission.findById({ _id: aid });
//     const apply = await NewApplication.find({
//       $and: [
//         { _id: { $in: ads_admin?.newApplication } },
//         { applicationStatus: "Ongoing" },
//         { applicationTypeStatus: "Normal Application" },
//       ],
//     }).select(
//       "applicationName applicationStatus applicationTypeStatus subject_selected_group"
//     );
//     var nums = [];
//     for (let ele of apply) {
//       if (ele?.subject_selected_group?.length > 0) {
//         nums.push(ele);
//       }
//     }
//     res.status(200).send({
//       message: "Explore All Application Having Subject Group Query",
//       access: true,
//       apps: nums ?? [],
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };
exports.render_one_application_subject_sequence_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const apply = await NewApplication.findById({ _id: aid }).select(
      "subject_selected_group"
    );
    const all_group = await SubjectGroup.findById({
      _id: `${apply?.subject_selected_group}`,
    });
    const all_group_select = await SubjectGroupSelect.find({
      subject_group: { $in: all_group },
    })
      .populate({
        path: "compulsory_subject",
        select: "subjectName",
      })
      .populate({
        path: "optional_subject",
        populate: {
          path: "optional_subject_options optional_subject_options_or.options",
          select: "subjectName",
        },
      })
      .populate({
        path: "fixed_subject",
        populate: {
          path: "fixed_subject_options",
          select: "subjectName",
        },
      });
    var subject_list = [];
    for (let ele of all_group_select) {
      subject_list.push(...ele?.compulsory_subject);
    }
    for (let ele of all_group_select) {
      for (let val of ele?.fixed_subject) {
        subject_list.push(...val?.fixed_subject_options);
      }
    }
    for (let ele of all_group_select) {
      for (let val of ele?.optional_subject) {
        subject_list.push(...val?.optional_subject_options);
      }
      for (let val of ele?.optional_subject) {
        for (let stu of val?.optional_subject_options_or) {
          subject_list.push(...stu?.options);
        }
      }
    }
    const unique_sub = [...new Set(subject_list.map((item) => item._id))];
    const all_subjects = await SubjectMaster.find({
      _id: { $in: unique_sub },
    }).select("subjectName studentCount");

    res.status(200).send({
      message: "Explore All Student With Subject Master Query",
      access: true,
      subject_student: all_subjects ?? [],
    });
  } catch (e) {
    console.log(e);
  }
};

// RH Sapat Fee Structure One Head Breaks Into MH
exports.check_global = async (req, res) => {
  try {
    // const list_1 = [
    //   {
    //     head_name: "Gymkhana Fee",
    //     head_amount: 250,
    //     master: "66c4d18a8b20aaefc2b44f71",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Student Welfare Fund",
    //     head_amount: 120,
    //     master: "66c4d19c8b20aaefc2b44fd9",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Medical Examination",
    //     head_amount: 40,
    //     master: "66c4d1ae8b20aaefc2b45037",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Development Fee - University",
    //     head_amount: 250,
    //     master: "66c4d3438b20aaefc2b45709",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Prorata Contribution Ashwamegh",
    //     head_amount: 26,
    //     master: "66c4d1e88b20aaefc2b45181",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Disaster Management",
    //     head_amount: 20,
    //     master: "66c4d2008b20aaefc2b45230",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Computerization Fees",
    //     head_amount: 100,
    //     master: "66c4d2158b20aaefc2b452b4",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Registration Fee",
    //     head_amount: 75,
    //     master: "66c4d2248b20aaefc2b452cc",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Student Safety Insurance",
    //     head_amount: 20,
    //     master: "66c4d23b8b20aaefc2b45342",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Admission Fee",
    //     head_amount: 50,
    //     master: "66c4d24b8b20aaefc2b4539a",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Library Fee",
    //     head_amount: 200,
    //     master: "66c4d2588b20aaefc2b45408",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Student Aid Fund",
    //     head_amount: 20,
    //     master: "66c4d2668b20aaefc2b45429",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Sport Fund - Fit India",
    //     head_amount: 200,
    //     master: "66c4d27d8b20aaefc2b45430",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "NSS",
    //     head_amount: 10,
    //     master: "66c4d2898b20aaefc2b45460",
    //     is_society: false,
    //   },
    //   {
    //     head_name: "Corpus Fund - Ashwamegh",
    //     head_amount: 4,
    //     master: "66c4d2a28b20aaefc2b454e8",
    //     is_society: false,
    //   },
    // ];

    const list_1 = [
      {
        head_name: "Gymkhana Fee",
        head_amount: 250,
        master: "66c4d18a8b20aaefc2b44f71",
        is_society: false,
      },
      {
        head_name: "Student Welfare Fund",
        head_amount: 100,
        master: "66c4d19c8b20aaefc2b44fd9",
        is_society: false,
      },
      {
        head_name: "Medical Examination",
        head_amount: 40,
        master: "66c4d1ae8b20aaefc2b45037",
        is_society: false,
      },
      {
        head_name: "Development Fee - University",
        head_amount: 250,
        master: "66c4d3438b20aaefc2b45709",
        is_society: false,
      },
      {
        head_name: "Prorata Contribution Ashwamegh",
        head_amount: 26,
        master: "66c4d1e88b20aaefc2b45181",
        is_society: false,
      },
      {
        head_name: "Disaster Management",
        head_amount: 20,
        master: "66c4d2008b20aaefc2b45230",
        is_society: false,
      },
      {
        head_name: "Computerization Fees",
        head_amount: 100,
        master: "66c4d2158b20aaefc2b452b4",
        is_society: false,
      },
      {
        head_name: "Registration Fee",
        head_amount: 75,
        master: "66c4d2248b20aaefc2b452cc",
        is_society: false,
      },
      {
        head_name: "Student Safety Insurance",
        head_amount: 20,
        master: "66c4d23b8b20aaefc2b45342",
        is_society: false,
      },
      {
        head_name: "Admission Fee",
        head_amount: 50,
        master: "66c4d24b8b20aaefc2b4539a",
        is_society: false,
      },
      {
        head_name: "Library Fee",
        head_amount: 300,
        master: "66c4d2588b20aaefc2b45408",
        is_society: false,
      },
      {
        head_name: "Student Aid Fund",
        head_amount: 50,
        master: "66c4d2668b20aaefc2b45429",
        is_society: false,
      },
      {
        head_name: "Sport Fund - Fit India",
        head_amount: 200,
        master: "66c4d27d8b20aaefc2b45430",
        is_society: false,
      },
      {
        head_name: "NSS",
        head_amount: 10,
        master: "66c4d2898b20aaefc2b45460",
        is_society: false,
      },
      {
        head_name: "Corpus Fund - Ashwamegh",
        head_amount: 4,
        master: "66c4d2a28b20aaefc2b454e8",
        is_society: false,
      },
    ];
    const all_struct = await FeeStructure.find({
      $and: [
        { finance: "668ecf51f762c228aa0848d7" },
        { document_update: false },
      ],
    }).select("applicable_fees_heads applicable_fees_heads_count fees_heads");
    let nums = [];
    // for (let ele of all_struct) {
    //   nums.push(ele);
    //   ele.fees_heads = [];
    //   // for (let cls of ele?.fees_heads) {
    //   //   if (cls?.is_society == true) {
    //   //     // console.log(cls?.is_society);
    //   //     ele.applicable_fees_heads.push({
    //   //       head_name: cls?.head_name,
    //   //       head_amount: cls?.head_amount,
    //   //       master: cls?.master,
    //   //       is_society: cls?.is_society,
    //   //     });
    //   //     // ele.applicable_fees_heads.pull(cls?._id);
    //   //     // nums.push(ele);
    //   //   }
    //   // }
    //   await ele.save();
    // }
    // let total = 0
    // for (let ele of all_struct) {
    //   for (let val of ele?.applicable_fees_heads) {
    //     total += val?.head_amount
    //     // if (`${val?.head_name}` === "University Fee" && val?.head_amount == 1495) {
    //     //   nums.push({
    //     //     name: val?.head_name,
    //     //     price: val?.head_amount
    //     //   })
    //     //   ele?.applicable_fees_heads?.pull(val?._id)
    //     //   for (let ref of list_1) {
    //     //     ele.applicable_fees_heads.push({
    //     //       head_name: ref?.head_name,
    //     //       head_amount: ref?.head_amount,
    //     //       master: ref?.master,
    //     //       is_society: ref?.is_society
    //     //     });
    //     //     ele.applicable_fees_heads_count += 1
    //     //   }
    //     // }
    //   }
    //   if (total == ele?.applicable_fees) {
    //     // nums.push()
    //     // console.log(total, ele?.applicable_fees)
    //   } else {
    //     nums.push(ele?._id)
    //   }
    //   total = 0
    //   // await ele.save()
    // }
    // const all_student = await Student.find({ fee_structure: { $in: all_struct } })
    //   .select("scholar_name remainingFeeList")
    //   .populate({
    //     path: "fee_structure",
    //     select: "structure_name"
    //   })
    // const all_student = await RemainingList.find({ fee_structure: { $in: all_struct } })
    //   .select("paid_fee remaining_fee applicable_fee")
    //   .populate({
    //     path: "fee_structure",
    //     select: "applicable_fees"
    //   })

    // const all_student = await FeeReceipt.find({
    //   fee_structure: { $in: all_struct },
    // })
    //   .select("fee_payment_amount fee_heads finance")
    //   .populate({
    //     path: "finance",
    //     select: "institute",
    //   });
    // // 1. Fee Receipt Heads
    // // 2. Student Active Heads
    // // 3. file
    // var i = 0;
    // for (let ele of all_student) {
    //   nums.push(ele?._id);
    //   await societyAdmissionFeeReceipt(ele?._id, ele?.finance?.institute);
    //   // if (ele?.remaining_fee > 0) {
    //   // for (let stu of ele?.fee_heads) {
    //   //   if (
    //   //     `${stu?.head_name}` === "University Fee" &&
    //   //     stu?.remain_fee > 0 &&
    //   //     stu?.applicable_fee == 1495
    //   //   ) {
    //   //     nums.push(ele);
    //   //     // for (let cls of list_1) {
    //   //     //   ele.fee_heads.push({
    //   //     //     head_id: stu?.head_id,
    //   //     //     head_name: cls?.head_name,
    //   //     //     paid_fee: 0,
    //   //     //     applicable_fee: cls?.head_amount,
    //   //     //     remain_fee: cls?.head_amount,
    //   //     //     fee_structure: ele?.fee_structure?._id,
    //   //     //     master: cls?.master,
    //   //     //     original_paid: 0,
    //   //     //     appId: ele?.application,
    //   //     //     is_society: false,
    //   //     //   });
    //   //     // }
    //   //     // ele.fee_heads?.pull(stu?._id);
    //   //   }
    //   // }
    //   // await ele.save();
    //   console.log(i);
    //   i += 1;
    // }

    res.status(200).send({
      message: "All Student",
      access: true,
      all_student: nums,
      count: nums?.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.check_structure = async (req, res) => {
  try {
    let list_1 = [
      "64807c44bff5c201991d78f3",
      "64807c55bff5c201991d7a47",
      "64807c7cbff5c201991d7d25",
      "64807ce0bff5c201991d8493",
      "64807d2bbff5c201991d8a56",
      "64807d8cbff5c201991d9188",
      "64807d9dbff5c201991d92dc",
      "64807e35bff5c201991d9ec3",
      "64807e96bff5c201991da5fd",
      "64807f15bff5c201991dafd0",
      "64808004bff5c201991dc1c1",
      "6480816ebff5c201991dc9c4",
      "648081f3bff5c201991dd3d4",
      "64808203bff5c201991dd528",
      "64808271bff5c201991ddd70",
      "64808281bff5c201991ddec4",
      "648082f8bff5c201991de776",
      "64808945bff5c201991e3429",
      "648089a7bff5c201991e3b96",
      "64808acebff5c201991e51a7",
      "64808bc5bff5c201991e6449",
      "64808c13bff5c201991e6a35",
      "64808c24bff5c201991e6b91",
      "64808c4bbff5c201991e6e69",
      "64808ca2bff5c201991e7553",
      "64814177bff5c2019923f2e8",
      "64814195bff5c2019923f6de",
      "64814207bff5c20199240580",
      "6481422fbff5c20199240ae8",
      "64814242bff5c20199240d0f",
      "6481427dbff5c2019924148b",
      "648142a1bff5c2019924192d",
      "648142c5bff5c20199241dfd",
      "648142d3bff5c20199241fc5",
      "648142f5bff5c20199242468",
      "64814311bff5c201992427d6",
      "64814332bff5c20199242c72",
      "64814331bff5c20199242c69",
      "648143a9bff5c20199243b2d",
      "648143d9bff5c201992441a1",
      "64814485bff5c201992456f7",
      "6481450ebff5c201992467f2",
      "64814524bff5c20199246a75",
      "6481453ebff5c20199246da7",
      "6481457dbff5c20199247615",
      "64814679bff5c20199249620",
      "648146aabff5c20199249c2b",
      "648146e5bff5c2019924a418",
      "64814770bff5c2019924b643",
      "6481477cbff5c2019924b7ea",
      "648147a5bff5c2019924bd07",
      "648147edbff5c2019924c6dd",
      "6481481ebff5c2019924cd4a",
      "64814830bff5c2019924d01e",
      "64814859bff5c2019924d521",
      "6481485fbff5c2019924d670",
      "6481486bbff5c2019924d807",
      "6481487ebff5c2019924daca",
      "648148bdbff5c2019924e376",
      "648148e2bff5c2019924e8be",
      "64814909bff5c2019924ef71",
      "6481491bbff5c2019924f1fc",
      "64814924bff5c2019924f381",
      "648149c3bff5c20199250bb7",
      "648149ecbff5c20199251192",
      "648149ecbff5c2019925118e",
      "64814ac1bff5c201992523fc",
      "64814b51bff5c20199252d5d",
      "64814b6cbff5c20199252f1d",
      "64814b99bff5c20199253244",
      "64814c0bbff5c201992539b7",
      "64814d2fbff5c20199254c85",
      "648150edbff5c20199258da0",
      "64815110bff5c2019925905a",
      "64815163bff5c20199259657",
      "64815189bff5c2019925993d",
      "6481519fbff5c20199259ac7",
      "64dc901923a6329705359132",
      "64da0371a4054284428ab927",
      "64d9edbea4054284428a583e",
      "64d9ec19a4054284428a4e30",
      "64d9cb3049eb55594590abbd",
      "64d9be2984b34e17e24ad6b2",
      "64d8797532c4819d5ee57e32",
      "64cdf28f94b0fccea22d8701",
      "64ccbddd92ba0e709c5a19ba",
      "64e71ef1d069ff4febdb9470",
      "64e87c2f09b29a204bf919eb",
      "64e5fed9180b61ce19cca3dc",
      "64ddf536354806dd672d9469",
      "64dc7cc7f3f5bc3d3c55d810",
      "64d9e6bba4054284428a3387",
      "64d9de7aa4054284428a0f21",
      "64d8803fcba67a16364ab0b6",
      "64e8768509b29a204bf903b0",
      "64d9f0a9a4054284428a6621",
      "64d9dba4a4054284428a033d",
      "64d9d23d0234d3a85b39d94a",
      "64d9d19cb34f658f185392dc",
      "64d8909e32c4819d5ee5e2aa",
      "64d86c2932c4819d5ee54498",
      "64cf37fe4bc2f1d9efe4bffb",
      "64cdea2ef4e6e65d0637a8c7",
      "64f6f44996bb08f87e0f4d12",
      "64f556616f2f36b00a9a009b",
      "64ec63298c657eddf5b57977",
      "64e9c4d6a1c66ce3d5f1999d",
      "64e9b283a1c66ce3d5f153bd",
      "64f571b077395365ecb0b071",
      "64eafb2336a5878630d709b0",
      "64f57ef077395365ecb0f6ab",
      "64eaf05e36a5878630d6e94a",
      "64ead717ae7d93e078f38640",
    ];
    // let list = ["66bafec95e67b13f50efd829", "66bdf274930b0e77adf974ab"];
    // const all_cat = await FeesCategory.find({
    //   $and: [
    //     { finance: "644a09d6d1679fcd6e76e5ef" },
    //     { category_name: { $regex: `VJNT`, $options: "i" } },
    //     // { _id: { $in: list } },
    //   ],
    // });
    // const all_struct = await FeeStructure.find({
    //   $and: [
    //     { finance: "644a09d6d1679fcd6e76e5ef" },
    //     { document_update: true },
    //     { category_master: { $in: all_cat } },
    //   ],
    // }).select("applicable_fees_heads_count structure_name");
    const all_student = await Student.find({
      _id: { $in: list_1 },
    })
      .select("studentGRNO active_fee_heads")
      .populate({
        path: "fee_structure",
        select: "document_update applicable_fees_heads",
      });
    let nums = [];
    let numss = [];
    for (let ele of all_student) {
      for (let val of ele?.active_fee_heads) {
        if (`${val?.fee_structure}` == `${ele?.fee_structure?._id}`) {
          numss.push(val);
        }
      }
      nums.push({
        gr: ele?.studentGRNO,
        fee_count: ele?.fee_structure?.applicable_fees_heads?.length,
        student_count: numss?.length,
        fees: ele?.fee_structure?._id,
      });
      numss = [];
    }
    // let nums = [...all_student];
    res.status(200).send({
      message: "Explore All Structure Query",
      access: true,
      nums: nums,
      count: all_student?.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.all_documents_export_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const apply = await NewApplication.findById({ _id: aid }).select("_id");
    const all_student = await Student.find({
      "student_form_flow.did": `${apply?._id}`,
    }).populate({
      path: "collect_docs.docs",
    });
    var excel_list = [];
    var numss = {};
    for (let ele of all_student) {
      if (ele?.collect_docs?.length > 0) {
        for (let val of ele?.collect_docs) {
          numss[val?.docs?.document_name] = val?.not_filled ?? "No";
        }
        excel_list.push({
          RegistrationID: ele?.studentGRNO ?? "#NA",
          Name: `${ele?.studentFirstName} ${
            ele?.studentMiddleName
              ? ele?.studentMiddleName ?? ele?.studentFatherName
              : ""
          } ${ele?.studentLastName}`,
          FirstName: ele?.studentFirstName ?? "#NA",
          MiddleName: ele?.studentMiddleName
            ? ele?.studentMiddleName ?? ele?.studentFatherName
            : "#NA",
          LastName: ele?.studentLastName ?? "#NA",
          DOB: ele?.studentDOB ?? "#NA",
          FormNo: ele?.form_no ?? "#NA",
          Gender: ele?.studentGender ?? "#NA",
          CasteCategory: ele?.studentCastCategory ?? "#NA",
          ContactNo: ele?.studentPhoneNumber ?? "#NA",
          Email: ele?.studentEmail ?? "#NA",
          ...numss,
        });
        numss = {};
      }
    }
    var valid_back = await json_to_excel_admission_application_query(
      excel_list,
      "Required",
      aid,
      "Document-List"
    );
    if (valid_back?.back) {
      res.status(200).send({
        message: "Explore New Collect Docs Excel On Hostel Export TAB",
        access: true,
        excel_list: excel_list?.length,
      });
    } else {
      res.status(200).send({
        message: "No New Collect Docs Excel Exports ",
        access: false,
        excel_list: excel_list,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderTriggerAlarmDocumentQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { alarm_mode } = req.query;
    const { all_arr, title, doc, content } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid }).select(
      "alarm_count institute"
    );
    var all_student = await Student.find({ _id: { $in: all_arr } })
      .select(
        "studentFirstName studentMiddleName studentLastName valid_full_name"
      )
      .populate({
        path: "user",
        select: "deviceToken userEmail",
      })
      .populate({
        path: "institute",
        select: "insName",
      })
      .populate({
        path: "collect_docs.docs",
      });
    if (alarm_mode === "APP_NOTIFICATION") {
      await document_alarm(aid, alarm_mode, content, all_student, title, doc);
    } else if (alarm_mode === "EMAIL_NOTIFICATION") {
      await document_alarm(aid, alarm_mode, content, all_student, title, doc);
    } else if (alarm_mode === "SMS_NOTIFICATION") {
    } else {
    }
    res.status(200).send({
      message: `Document Alarm is triggered successfully`,
      access: true,
      alarm_mode,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.all_documents_export_students_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const apply = await NewApplication.findById({ _id: aid }).select(
      "confirmedApplication allottedApplication reviewApplication"
    );
    let nums = [];
    for (let ele of apply?.confirmedApplication) {
      nums.push(ele?.student);
    }
    for (let ele of apply?.allottedApplication) {
      nums.push(ele?.student);
    }
    for (let ele of apply?.reviewApplication) {
      nums.push(ele);
    }

    const all_student = await Student.find({ _id: { $in: nums } }).select(
      "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO studentROLLNO"
    );
    all_student = all_student?.filter((val) => {
      if (val?.collect_docs?.length > 0) return val;
    });
    if (all_student?.length > 0) {
      res.status(200).send({
        message: "Explore All Student List",
        access: true,
        all_student: all_student,
      });
    } else {
      res.status(200).send({
        message: "No All Student List",
        access: true,
        all_student: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

// exports.new_app = async (req, res) => {
//   try {
//     let nums = ["66bc5594f9019dacfa1f2ebd", "66bc6a08232694c6d384bdd1", "66bc6be0f9019dacfa1fdae0", "66bc87c77cb3669abc1aa46a"]
//     const stu = await Student.find({ _id: { $in: nums } })
//     .select("new_app")
//     for (let ele of stu) {
//       ele.new_app.appId = null
//       ele.new_app.applicationDepartment = null
//       ele.new_app.applicationBatch = null
//       ele.new_app.applicationMaster = null
//       ele.new_app.applicationUnit = null
//       await ele.save()
//     }
//     res.status(200).send({ message: "New App", access: true})
//   }
//   catch (e) {
//     console.log(e)
//   }
// }
