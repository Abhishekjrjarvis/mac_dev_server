const User = require("../../models/User");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Admin = require("../../models/superAdmin");
const FeedBack = require("../../models/Feedbacks/Feedback");
const Student = require("../../models/Student");
const Staff = require("../../models/Staff");
const { shuffleArray } = require("../../Utilities/Shuffle");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const ReplyComment = require("../../models/ReplyComment/ReplyComment");
const Answer = require("../../models/Question/Answer");
const AnswerReply = require("../../models/Question/AnswerReply");
const Poll = require("../../models/Question/Poll");
const moment = require("moment");
const Department = require("../../models/Department");
const Class = require("../../models/Class");
const Subject = require("../../models/Subject");
const invokeSpecificRegister = require("../../Firebase/specific");
const Finance = require("../../models/Finance");
const Admission = require("../../models/Admission/Admission");
const { chatCount } = require("../../Firebase/dailyChat");
const { getFirestore } = require("firebase-admin/firestore");
const StudentNotification = require("../../models/Marks/StudentNotification");
const { valid_initials } = require("../../Custom/checkInitials");
const InternalQuery = require("../../models/Content/InternalQuery");
const {
  simple_object,
  uploadFile,
  uploadDocsFile,
  uploadDocFile,
  getFileStream,
  rename_objects,
} = require("../../S3Configuration");
const Hostel = require("../../models/Hostel/hostel");
const ClassMaster = require("../../models/ClassMaster");
const {
  generate_excel_to_json,
  generate_excel_to_json_fee_category,
  generate_excel_to_json_fee_head_master,
  generate_excel_to_json_fee_structure,
  generate_excel_to_json_direct_staff,
  generate_excel_to_json_direct_hostelities,
  generate_excel_to_json_scholarship_query,
  generate_excel_to_json_scholarship_gr_batch_query,
  generate_excel_to_json_library_offline_book_query,
  generate_excel_to_json_login_query,
  generate_excel_to_json_un_approved,
  generate_excel_to_json_subject_chapter_query,
  generate_excel_to_json_fee_query,
  generate_excel_to_json_department_query,
  generate_excel_to_json_class_master_query,
  generate_excel_to_json_subject_master_query,
  generate_excel_to_json_class_query,
  generate_excel_to_json_subject_query,
  generate_excel_to_json_attendence_query,
  generate_excel_to_json_class_time_table_query,
} = require("../../Custom/excelToJSON");
const {
  retrieveInstituteDirectJoinQueryPayload,
  retrieveInstituteDirectJoinStaffAutoQuery,
  retrieveUnApprovedDirectJoinQuery,
  retrieveInstituteDirectJoinPayloadFeesQuery,
} = require("../Authentication/AuthController");
const {
  renderFinanceAddFeeCategoryAutoQuery,
  renderFinanceAddFeeMasterAutoQuery,
  renderFinanceAddFeeStructureAutoQuery,
} = require("../Finance/financeController");
const {
  renderDirectHostelJoinExcelQuery,
} = require("../Hostel/hostelController");
const { applicable_pending_calc_singleton } = require("../../Functions/SetOff");
const {
  renderAdmissionNewScholarNumberAutoQuery,
  renderInstituteScholarNumberAutoQuery,
} = require("../Admission/admissionController");
const {
  renderNewOfflineBookAutoQuery,
} = require("../Library/libraryController");
const Library = require("../../models/Library/Library");
const { retrieveEmailReplaceQuery } = require("../Edit/studentMember");
const fs = require("fs");
const util = require("util");
const {
  renderNewOneChapterTopicQuery,
} = require("../Academics/academicController");
const {
  custom_date_time,
  custom_date_time_birthday,
} = require("../../helper/dayTimer");
const unlinkFile = util.promisify(fs.unlink);
const Notification = require("../../models/notification");
const RemainingList = require("../../models/Admission/RemainingList");
const {
  download_file,
  next_call,
  remove_call,
  createZipArchive,
  remove_assets,
  all_s3_objects,
} = require("../../Archive/IdCard");
const { all_upper_case_query } = require("../../FormatCase/UpperCase");
const { all_lower_case_query } = require("../../FormatCase/LowerCase");
const { all_title_case_query } = require("../../FormatCase/TitleCase");
const { all_new_designation_query } = require("../../Designation/functions");
const { nested_document_limit } = require("../../helper/databaseFunction");
const {
  render_new_department_query,
  render_new_class_master_query,
  render_new_subject_master_query,
  render_new_class_query,
  render_new_subject_query,
} = require("../../Import/ExcelImport");
const { render_mark_attendence_query } = require("../Attendence");
const CertificateQuery = require("../../models/Certificate/CertificateQuery");
const Batch = require("../../models/Batch");
const StudentMessage = require("../../models/Content/StudentMessage");
const { addTimeTableExcelQuery } = require("../Timetable/timetableController");
const InstituteLog = require("../../models/InstituteLog/InstituteLog");
const InstituteCertificateLog = require("../../models/InstituteLog/InstituteCertificateLog");
const NewApplication = require("../../models/Admission/NewApplication");
const generateStudentAdmissionForm = require("../../scripts/studentAdmissionForm");
const NotExistStudentCertificate = require("../../models/Certificate/NotExistStudentCertificate");
const { admissionFeeReceipt } = require("../../scripts/admissionFeeReceipt");
const societyAdmissionFeeReceipt = require("../../scripts/societyAdmissionFeeReceipt");
const staffLeaveRequest = require("../../scripts/staffLeaveRequest");
const feeReceipt = require("../../models/RazorPay/feeReceipt");
const normalAdmissionFeeReceipt = require("../../scripts/normalAdmissionFeeReceipt");
const NestedCard = require("../../models/Admission/NestedCard");
const studentOtherFeeReceipt = require("../../scripts/studentOtherFeeReceipt");
const OtherFees = require("../../models/Finance/Other/OtherFees");
const combinedBankDaybook = require("../../scripts/combinedBankDaybook");
const combinedSummaryBankDaybook = require("../../scripts/combinedSummaryBankDaybook");
const staffLeaveRequestReport = require("../../scripts/leaveReport/staffLeaveRequestReport");
const combinedSummaryDetailBankDaybook = require("../../scripts/combinedSummaryDetailBankDaybook");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

exports.validateUserAge = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid });
    if (user.ageRestrict === "Yes") {
      var date = new Date();
      var p_date = date.getDate();
      var p_month = date.getMonth() + 1;
      if (p_month < 10) {
        p_month = parseInt(`0${p_month}`);
      }
      var p_year = date.getFullYear();
      var month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      var b_date = user.userDateOfBirth.slice(8, 10);
      var b_month = user.userDateOfBirth.slice(5, 7);
      var b_year = user.userDateOfBirth.slice(0, 4);

      if (b_date > p_date) {
        p_date = p_date + month[b_month - 1];
        p_month = p_month - 1;
      }

      if (b_month > p_month) {
        p_year = p_year - 1;
        p_month = p_month + 12;
      }

      var get_cal_year = p_year - b_year;
      if (get_cal_year > 13) {
        user.ageRestrict = "No";
        await user.save();
      }
      // const ageEncrypt = await encryptionPayload(user.ageRestrict);
      res.status(200).send({
        message: "Age Restriction Disabled ",
        restrict: user.ageRestrict,
      });
    } else if (user.ageRestrict === "No") {
      user.ageRestrict = "Yes";
      await user.save();
      // const ageEncrypt = await encryptionPayload(user.ageRestrict);
      res.status(200).send({
        message: "Age Restriction Enabled",
        restrict: user.ageRestrict,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAgeRestrict = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid });
    // const ageEncrypt = await encryptionPayload(user.ageRestrict);
    res
      .status(200)
      .send({ message: "Get Age Rstrict", status: user.ageRestrict });
  } catch {}
};

exports.retrieveRandomInstituteQuery = async (req, res) => {
  try {
    const institute = await InstituteAdmin.find({ status: "Approved" }).select(
      "insName name photoId insProfilePhoto status blockStatus"
    );
    var random = Math.floor(Math.random() * institute.length);
    var r_Ins = institute[random];
    // const encrypt_random = await encryptionPayload(r_Ins);
    res.status(200).send({ message: "Random Institute", r_Ins });
  } catch {}
};

exports.retrieveReferralQuery = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid })
      .select("id userCommission userEarned")
      .populate({
        path: "referralArray",
        populate: {
          path: "referralBy",
          select: "unlockAmount activateStatus insName name",
        },
      });
    // const refEncrypt = await encryptionPayload(user);
    res.status(200).send({ message: "Referral", user });
  } catch {}
};

exports.retrieveFeedBackUser = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const user = await User.findById({ _id: req.body.userId });
    const feed = new FeedBack({ ...req.body });
    feed.feedBy = user._id;
    admin.feedbackArray.push(feed._id);
    await Promise.all([feed.save(), admin.save()]);
    res.status(200).send({ message: `Thanks for feedback ${user.username}` });
  } catch {}
};

exports.retrieveBonafideGRNO = async (req, res) => {
  try {
    const { gr, id } = req.params;
    var download = true;
    const { reason, student_bona_message } = req.body;
    const institute = await InstituteAdmin.findById({
      _id: id,
    });
    const validGR = await valid_initials(institute?.gr_initials, gr);
    if (!validGR)
      return res.status(200).send({ message: "I Think you lost in space" });
    const student = await Student.findOne({
      $and: [{ studentGRNO: `${validGR}` }, { institute: id }],
    })
      .select(
        "studentFirstName studentGRNO studentMiddleName studentReason studentBonaStatus student_bona_message certificateBonaFideCopy studentAdmissionDate studentLastName photoId studentProfilePhoto studentDOB"
      )
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      })
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "institute",
        select:
          "insName insAddress insState insDistrict insPhoneNumber insPincode photoId insProfilePhoto certificate_issued_count insAffiliated is_dublicate_bonafide certificate_bonafide_count",
      });
    student.studentReason = reason;
    student.student_bona_message = student_bona_message;
    student.studentBonaStatus = "Ready";
    institute.b_certificate_count += 1;
    institute.certificate_issued_count += 1;
    if (student.certificateBonaFideCopy.trueCopy) {
      if (student.certificateBonaFideCopy.secondCopy) {
        if (student.certificateBonaFideCopy.thirdCopy) {
          download = false;
        } else {
          student.certificateBonaFideCopy.thirdCopy = true;
          download = true;
        }
      } else {
        student.certificateBonaFideCopy.secondCopy = true;
        download = true;
      }
    } else {
      student.certificateBonaFideCopy.trueCopy = true;
      download = true;
    }
    await Promise.all([student.save(), institute.save()]);
    // Add Another Encryption
    res
      .status(200)
      .send({ message: "Student Bonafide Certificate", student, download });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveLeavingGRNO = async (req, res) => {
  try {
    const { gr, id } = req.params;
    var download = true;
    const {
      studentCertificateNo,
      leaving_date,
      bookNo,
      studentUidaiNumber,
      studentPreviousSchool,
      studentLeavingBehaviour,
      studentLeavingStudy,
      studentLeavingReason,
      studentRemark,
      instituteJoinDate,
      instituteLeavingDate,
      leaving_degree,
      leaving_since_date,
      leaving_course_duration,
      elective_subject_one,
      elective_subject_second,
      leaving_project_work,
      leaving_guide_name,
      lcRegNo,
      lcCaste,
      lcBirth,
      lcDOB,
      lcAdmissionDate,
      lcInstituteDate,
      leaving_student_name,
      leaving_nationality,
      leaving_religion,
      leaving_previous_school,
      leaving_certificate_attach,
      is_dublicate,

      certificate_type,
      certificate_attachment,
      student_name,
      staffId,
      certificate_original_leaving_count,
    } = req.body;
    const institute = await InstituteAdmin.findById({
      _id: id,
    });
    const validGR = await valid_initials(institute?.gr_initials, gr);
    if (!validGR)
      return res.status(200).send({ message: "I Think you lost in space" });
    const student = await Student.findOne({
      $and: [{ studentGRNO: `${validGR}` }, { institute: id }],
    })
      .select(
        "studentFirstName studentLeavingPreviousYear studentEmail leaving_guide_name leaving_certificate_attach leaving_previous_school leaving_religion leaving_nationality leaving_student_name studentLeavingInsDate studentRemark student_prn_enroll_number studentCertificateNo studentLeavingStudy studentLeavingReason studentRemark leaving_project_work elective_subject_second elective_subject_one leaving_course_duration leaving_since_date leaving_degree leaving_date instituteJoinDate duplicate_copy applicable_fees_pending studentPreviousSchool studentLeavingBehaviour studentUidaiNumber studentGRNO studentMiddleName certificateLeavingCopy studentAdmissionDate studentReligion studentCast studentCastCategory studentMotherName studentNationality studentBirthPlace studentMTongue studentLastName photoId studentProfilePhoto studentDOB admissionRemainFeeCount lcRegNo lcCaste lcBirth lcDOB lcAdmissionDate lcInstituteDate studentLeavingRemark certificate_logs"
      )
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      })
      .populate({
        path: "institute",
        select:
          "insName insAddress certificate_issued_count insState studentFormSetting.previousSchoolAndDocument.previousSchoolDocument insEditableText_one insEditableText_two insDistrict insAffiliated insEditableText insEditableTexts insPhoneNumber insPincode photoId insProfilePhoto affliatedLogo insEmail leave_certificate_selection certificate_original_leaving_count",
      })
      .populate({
        path: "remainingFeeList",
        select: "paid_fee fee_structure",
        populate: {
          path: "fee_structure",
          select: "applicable_fees",
        },
      });
    if (
      institute.studentFormSetting.previousSchoolAndDocument
        .previousSchoolDocument &&
      studentPreviousSchool
    ) {
      student.studentPreviousSchool = studentPreviousSchool
        ? studentPreviousSchool
        : null;
    } else {
    }
    if (studentLeavingBehaviour) {
      student.studentLeavingBehaviour = studentLeavingBehaviour;
      if (institute?.original_copy) {
        student.duplicate_copy = "Duplicate Copy";
        // await student.save();
      }
    }
    if (leaving_date) {
      student.leaving_date = leaving_date;
    }
    if (instituteJoinDate) {
      student.instituteJoinDate = instituteJoinDate;
    }
    if (studentLeavingStudy) {
      student.studentLeavingStudy = studentLeavingStudy;
    }
    if (studentLeavingReason) {
      student.studentLeavingReason = studentLeavingReason;
    }
    if (studentRemark) {
      student.studentLeavingRemark = studentRemark;
    }
    if (studentUidaiNumber) {
      student.studentUidaiNumber = studentUidaiNumber;
    }
    if (instituteLeavingDate) {
      student.studentLeavingInsDate = new Date(`${instituteLeavingDate}`);
    }
    if (bookNo) {
      student.studentBookNo = bookNo;
    }
    if (leaving_degree) {
      student.leaving_degree = leaving_degree;
    }
    if (leaving_since_date) {
      student.leaving_since_date = leaving_since_date;
    }
    if (leaving_course_duration) {
      student.leaving_course_duration = leaving_course_duration;
    }
    if (elective_subject_one) {
      student.elective_subject_one = elective_subject_one;
    }
    if (elective_subject_second) {
      student.elective_subject_second = elective_subject_second;
    }
    if (leaving_project_work) {
      student.leaving_project_work = leaving_project_work;
    }
    if (lcRegNo) {
      student.lcRegNo = lcRegNo;
    }
    if (lcCaste) {
      student.lcCaste = lcCaste;
    }
    if (leaving_guide_name) {
      student.leaving_guide_name = leaving_guide_name;
    }
    if (lcDOB) {
      student.lcDOB = lcDOB;
    }
    if (lcBirth) {
      student.lcBirth = lcBirth;
    }
    if (lcAdmissionDate) {
      student.lcAdmissionDate = lcAdmissionDate;
    }
    if (lcInstituteDate) {
      student.lcInstituteDate = lcInstituteDate;
    }

    if (studentCertificateNo) {
      student.studentCertificateNo = studentCertificateNo;
    }
    if (leaving_student_name) {
      student.leaving_student_name = leaving_student_name;
    }
    if (leaving_nationality) {
      student.leaving_nationality = leaving_nationality;
    }
    if (leaving_religion) {
      student.leaving_religion = leaving_religion;
    }
    if (leaving_previous_school) {
      student.leaving_previous_school = leaving_previous_school;
    }
    if (leaving_certificate_attach) {
      student.leaving_certificate_attach = leaving_certificate_attach;
    }
    institute.l_certificate_count += 1;
    institute.certificate_issued_count += 1;
    student.studentLeavingStatus = "Ready";
    if (institute?.original_copy) {
      student.certificateLeavingCopy.thirdCopy = false;
      student.certificateLeavingCopy.secondCopy = false;
      student.certificateLeavingCopy.trueCopy = true;
      student.certificateLeavingCopy.originalCopy = true;
      download = true;
    } else {
      student.certificateLeavingCopy.originalCopy = false;
      if (student.certificateLeavingCopy.trueCopy) {
        if (student.certificateLeavingCopy.secondCopy) {
          if (student.certificateLeavingCopy.thirdCopy) {
            download = false;
          } else {
            student.certificateLeavingCopy.thirdCopy = true;
            download = true;
          }
        } else {
          student.certificateLeavingCopy.secondCopy = true;
          download = true;
        }
      } else {
        student.certificateLeavingCopy.trueCopy = true;
        download = true;
      }
    }
    if (
      !is_dublicate &&
      certificate_original_leaving_count &&
      certificate_attachment
    ) {
      institute.certificate_original_leaving_count =
        certificate_original_leaving_count;
    }

    await Promise.all([student.save(), institute.save()]);
    // Add Another Encryption
    var valid_student = await applicable_pending_calc_singleton(student);
    res.status(200).send({
      message: "Student Leaving Certificate",
      student: valid_student,
      download: institute?.original_copy ? true : download,
      original_copy: student.certificateLeavingCopy?.originalCopy
        ? true
        : false,
    });

    if (institute?.institute_log && student?._id && certificate_attachment) {
      const i_log = await InstituteLog.findById(institute?.institute_log);
      const c_logs = new InstituteCertificateLog({
        instituteId: institute?._id,
        institute_log_id: i_log?._id,
        student_name: student_name,
        student: student?._id,
        certificate_attachment: certificate_attachment,
        certificate_type: certificate_type,
        certificate_issue_type: is_dublicate ? "Dublicate" : "Original",
        other_data: [
          {
            studentCertificateNo,
            leaving_date,
            bookNo,
            studentUidaiNumber,
            studentPreviousSchool,
            studentLeavingBehaviour,
            studentLeavingStudy,
            studentLeavingReason,
            studentRemark,
            instituteJoinDate,
            instituteLeavingDate,
            leaving_degree,
            leaving_since_date,
            leaving_course_duration,
            elective_subject_one,
            elective_subject_second,
            leaving_project_work,
            leaving_guide_name,
            lcRegNo,
            lcCaste,
            lcBirth,
            lcDOB,
            lcAdmissionDate,
            lcInstituteDate,
            leaving_student_name,
            leaving_nationality,
            leaving_religion,
            leaving_previous_school,
            leaving_certificate_attach,
            is_dublicate,

            certificate_type,
            certificate_attachment,
            student_name,
            staffId,
            certificate_original_leaving_count,
          },
        ],
      });
      if (staffId) {
        c_logs.issue_by_staff = staffId;
      } else {
        c_logs.issue_by_institute = "NIL";
      }

      i_log.certificate_logs.push(c_logs?._id);
      student.certificate_logs.push(c_logs?._id);
      await Promise.all([c_logs.save(), i_log.save(), student.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveCertificateStatus = async (req, res) => {
  try {
    const { gr, type } = req.params;
    const student = await Student.findOne({ studentGRNO: `${gr}` });
    const institute = await InstituteAdmin.findById({
      _id: `${student.institute}`,
    });
    if (type === "Bona") {
      student.studentBonaStatus = "Downloaded True Copy";
      institute.bonaArray.push(student._id);
      await Promise.all([student.save(), institute.save()]);
      res.status(200).send({ message: "Downloaded True Copy" });
    } else if (type === "Leaving") {
      student.studentLeavingStatus = "Downloaded True Copy";
      institute.leavingArray.push(student._id);
      await Promise.all([student.save(), institute.save()]);
      res.status(200).send({ message: "Downloaded True Copy" });
    } else {
      res.status(204).send({ message: "Looking for a new Keyword..." });
    }
  } catch {}
};

exports.retrieveUserBirthPrivacy = async (req, res) => {
  try {
    const { uid } = req.params;
    const { birthStatus, addressStatus, circleStatus, tagStatus } = req.body;
    const user = await User.findById({ _id: uid });
    if (birthStatus !== "") {
      user.user_birth_privacy = birthStatus;
    }
    if (addressStatus !== "") {
      user.user_address_privacy = addressStatus;
    }
    if (circleStatus !== "") {
      user.user_circle_privacy = circleStatus;
    }
    if (tagStatus !== "") {
      user.tag_privacy = tagStatus;
    }
    await user.save();
    res.status(200).send({ message: `Privacy Updated` });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveInstituteBirthPrivacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffStatus, contactStatus, emailStatus, tagStatus, sms_lang } =
      req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    if (staffStatus !== "") {
      institute.staff_privacy = staffStatus;
    }
    if (contactStatus !== "") {
      institute.contact_privacy = contactStatus;
    }
    if (emailStatus !== "") {
      institute.email_privacy = emailStatus;
    }
    if (tagStatus !== "") {
      institute.tag_privacy = tagStatus;
    }
    if (sms_lang) {
      institute.sms_lang = sms_lang;
    }
    await institute.save();
    res.status(200).send({ message: `Privacy Updated Institute` });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserUpdateNotification = async (req, res) => {
  try {
    const { uid } = req.params;
    const { follower_notify, comment_notify, answer_notify, institute_notify } =
      req.body;
    const user = await User.findById({ _id: uid });
    if (follower_notify !== "") {
      user.user_follower_notify = follower_notify;
    }
    if (comment_notify !== "") {
      user.user_comment_notify = comment_notify;
    }
    if (answer_notify !== "") {
      user.user_answer_notify = answer_notify;
    }
    if (institute_notify !== "") {
      user.user_institute_notify = institute_notify;
    }
    await user.save();
    res.status(200).send({ message: `Update Notification Updated` });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveCommentFeatureQuery = async (req, res) => {
  try {
    const { pid } = req.params;
    const post = await Post.findByIdAndUpdate(pid, req.body);
    res.status(200).send({
      message: `Comments are turned ${post.comment_turned}`,
      turned: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveMergeStaffStudent = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { id } = req.params;
    const merge_ins = await InstituteAdmin.findById({ _id: id }).select(
      "id ApproveStaff ApproveStudent"
    );

    const staff = await Staff.find({ _id: { $in: merge_ins.ApproveStaff } })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select("id")
      .populate({
        path: "user",
        select: "userLegalName username photoId profilePhoto",
      });

    const student = await Student.find({
      _id: { $in: merge_ins.ApproveStudent },
    })
      .limit(limit)
      .skip(skip)
      .select("id")
      .populate({
        path: "user",
        select: "userLegalName username photoId profilePhoto",
      });

    var mergeArray = [...staff, ...student];
    var get_array = shuffleArray(mergeArray);
    // const arrayEncrypt = await encryptionPayload(get_array);
    res
      .status(200)
      .send({ message: "Shuffle Staff Student Collection", get_array });
  } catch (e) {
    console.log(e);
  }
};

exports.fetchLangTranscriptPost = async (req, res) => {
  try {
    const { pid } = req.params;
    await Post.findByIdAndUpdate(pid, req.body);
    res
      .status(200)
      .send({ message: "Language Transcription Processed ✨✨✨✨" });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveLangModeQuery = async (req, res) => {
  try {
    const { uid } = req.params;
    const { mode } = req.query;
    const user = await User.findOne({ _id: uid });
    const institute = await InstituteAdmin.findOne({ _id: uid });
    if (mode !== "") {
      if (user) {
        user.lang_mode = mode;
        await user.save();
      } else if (institute) {
        institute.lang_mode = mode;
        await institute.save();
      } else {
      }
      res.status(200).send({
        message: "Better communication mode is selected",
        lang_status: true,
      });
    } else {
      res.status(200).send({
        message: "No Better communication mode is selected",
        lang_status: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchLangTranscriptAnswer = async (req, res) => {
  try {
    const { aid } = req.params;
    await Answer.findByIdAndUpdate(aid, req.body);
    res.status(200).send({
      message: "Answer Language Transcription Processed ✨✨✨✨",
      answer_status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.fetchLangTranscriptPoll = async (req, res) => {
  try {
    const { pid } = req.params;
    const { quest_lang, poll_answer_lang } = req.body;
    const poll = await Poll.findById({ _id: pid });
    poll.poll_question_transcript = quest_lang;
    poll.poll_answer?.forEach(async (ele, index) => {
      ele.content_script = poll_answer_lang[index];
    });
    await poll.save();
    res.status(200).send({
      message:
        "Poll Language Transcription Processed ✨✨✨✨, poll_status: true",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.fetchBiometricStaffQuery = async (req, res) => {
  try {
    const { staff_ref } = req.body;
    if (staff_ref?.length > 0) {
      staff_ref?.forEach(async (ele) => {
        const staff = await Staff.findById({ _id: `${ele.staffId}` });
        staff.staff_biometric_id = ele.bioId;
        await staff.save();
      });
      res
        .status(200)
        .send({ message: "All Staff Get Unique Biometric Id", status: true });
    } else {
      res.status(200).send({ message: "Need a staff", status: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchBiometricStudentQuery = async (req, res) => {
  try {
    const { student_ref } = req.body;
    if (student_ref?.length > 0) {
      student_ref?.forEach(async (ele) => {
        const student = await Student.findById({ _id: `${ele.studentId}` });
        student.student_biometric_id = ele.bioId;
        await student.save();
      });
      res
        .status(200)
        .send({ message: "All Student Get Unique Biometric Id", status: true });
    } else {
      res.status(200).send({ message: "Need a student", status: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchExportStaffIdCardQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const ins = await InstituteAdmin.findById({ _id: did }).select(
      "staffCount ApproveStaff"
    );

    const all_staff = await Staff.find({
      _id: { $in: ins?.ApproveStaff },
    }).select(
      "staffFirstName staffMiddleName staffROLLNO staffLastName staffProfilePhoto photoId staffCast staffCastCategory staffReligion staffBirthPlace staffNationality staffMotherName staffMTongue staffGender staffDOB staffDistrict staffState staffAddress staffQualification staffAadharNumber staffPhoneNumber"
    );

    // const lEncrypt = await encryptionPayload(live_data);
    res.status(200).send({
      message: "Exported Staff Format Pattern Save",
      staff_card: all_staff,
      export_format: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.fetchExportStudentIdCardQuery = async (req, res) => {
  try {
    const { request } = req.body;
    const { id } = req.query;
    var query_data = [];
    const valid_ins = await InstituteAdmin.findById({ _id: id });
    const classes = await Class.find({ _id: { $in: request } }).select(
      "ApproveStudent"
    );

    classes.forEach((ele) => {
      query_data.push(...ele?.ApproveStudent);
    });
    const student_query = await Student.find({
      _id: { $in: query_data },
    })
      // .select(
      //   "studentFirstName studentMiddleName studentGRNO studentLastName studentProfilePhoto photoId studentCast studentCastCategory studentReligion studentBirthPlace studentNationality studentMotherName studentMTongue studentGender studentDOB studentDistrict studentState studentAddress  studentAadharNumber studentPhoneNumber studentParentsName studentParentsPhoneNumber student_blood_group studentEmail"
      // )
      .populate({
        path: "studentClass",
        select: "className classTitle classStatus",
      })
      .populate({
        path: "batches",
        select: "batchName",
      })
      .populate({
        path: "institute",
        select: "insName name",
      });
    // await download_file(student_query, `${valid_ins?.name}`);
    // const liveEncrypt = await encryptionPayload(live_data);
    res.status(200).send({
      message: "Exported Student Format Pattern Save",
      student_card: student_query,
      export_format: true,
    });
    // var stats = await createZipArchive(`${valid_ins?.name}`)

    // await createZipArchive(`${valid_ins?.name}`);
    // await remove_assets();
  } catch (e) {
    console.log(e);
  }
};

exports.fetchExportOneStudentIdCardQuery = async (req, res) => {
  try {
    const { sid } = req.body;
    const student_query = await Student.findById({
      _id: sid,
    })
      // .select(
      //   "studentFirstName studentMiddleName studentGRNO studentLastName studentProfilePhoto photoId studentCast studentCastCategory studentReligion studentBirthPlace studentNationality studentMotherName studentMTongue studentGender studentDOB studentDistrict studentState studentAddress  studentAadharNumber studentPhoneNumber studentEmail studentParentsName studentParentsPhoneNumber student_blood_group"
      // )
      .populate({
        path: "studentClass",
        select: "className classTitle",
      });

    // const liveEncrypt = await encryptionPayload(live_data);
    res.status(200).send({
      message: "Exported One Student Format Pattern Save",
      student_card: student_query,
      export_format: true,
    });
  } catch (e) {
    console.log(e);
  }
};

// exports.fetchExportStudentAllQuery = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const export_ins = await InstituteAdmin.findById({ _id: id }).select(
//       "ApproveStudent"
//     );

//     const student_query = await Student.find({
//       _id: { $in: export_ins?.ApproveStudent },
//     }).select("studentFirstName studentMiddleName studentGRNO studentLastName studentProfilePhoto photoId studentCast studentCastCategory studentReligion studentBirthPlace studentNationality studentMotherName studentMTongue studentGender studentDOB studentDistrict studentState studentAddress studentAadharNumber studentPhoneNumber"
//     );

//     // const sEncrypt = await encryptionPayload(live_data);
//     res.status(200).send({
//       message: "Exported Student Format Pattern Save",
//       student_card: student_query,
//       export_format: true,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

exports.fetchExportStudentAllQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { gender, category, all_depart, batch_status, religion } = req.query;
    const { depart, batch, master, fee_struct } = req.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var institute = await InstituteAdmin.findById({ _id: id });

    if (all_depart === "All") {
      var sorted_batch = [];
      if (batch_status === "All") {
        var all_department = await Department.find({
          _id: { $in: institute?.depart },
        }).select("batches");
        for (var ref of all_department) {
          sorted_batch.push(...ref?.batches);
        }
      } else if (batch_status === "Current") {
        var all_department = await Department.find({
          _id: { $in: institute?.depart },
        }).select("departmentSelectBatch");
        for (var ref of all_department) {
          sorted_batch.push(ref?.departmentSelectBatch);
        }
      }
      var all_studentsv1 = await Student.find({
        $and: [{ batches: { $in: sorted_batch } }],
      })
        .select(
          "studentClass batches department studentGender studentCastCategory"
        )
        .populate({
          path: "fee_structure",
        });

      var all_studentsv2 = await Student.find({
        $and: [
          { batches: { $nin: sorted_batch } },
          { institute: institute?._id },
          { studentStatus: "Approved" },
        ],
      })
        .select(
          "studentClass batches department studentGender studentCastCategory"
        )
        .populate({
          path: "fee_structure",
        });

      var all_students = [...all_studentsv1, ...all_studentsv2];
    } else if (all_depart === "Particular") {
      var all_students = await Student.find({
        $and: [{ _id: { $in: institute?.ApproveStudent } }],
      })
        .select(
          "studentClass batches department studentGender studentCastCategory"
        )
        .populate({
          path: "fee_structure",
        });

      // console.log("All Students", all_students?.length);
      if (depart) {
        all_students = all_students?.filter((ref) => {
          if (`${ref?.department}` === `${depart}`) return ref;
        });
      }

      // console.log("All Depart", all_students?.length);
      if (batch) {
        all_students = all_students?.filter((ref) => {
          if (`${ref?.batches}` === `${batch}`) return ref;
        });
      }

      // console.log("All batch", all_students?.length);
      var select_classes = [];
      // if (master) {
      //   var all_master = await ClassMaster.find({
      //     _id: { $in: master },
      //   }).select("classDivision");
      // }

      // if (all_master?.length > 0) {
      //   for (var ref of all_master) {
      //     select_classes.push(...ref?.classDivision);
      //   }
      // }
      // console.log(select_classes);
      // console.log(all_students)
      // all_students = all_students?.filter((ref) => {
      //   if (select_classes?.includes(ref?.studentClass)) {
      //     return ref;
      //   } else {
      //     return false;
      //   }
      // });
      // console.log("All Master", all_students?.length);
    }

    if (category) {
      all_students = all_students?.filter((ref) => {
        if (`${ref?.studentCastCategory}` === `${category}`) return ref;
      });
    }

    if (gender) {
      all_students = all_students?.filter((ref) => {
        if (`${ref?.studentGender}` === `${gender}`) return ref;
      });
    }

    if (religion) {
      all_students = all_students?.filter((ref) => {
        if (`${ref?.studentReligion}` === `${religion}`) return ref;
      });
    }

    if (fee_struct) {
      all_students = all_students?.filter((ref) => {
        if (`${ref?.fee_structure?.category_master}` === `${fee_struct}`)
          return ref;
      });
    }

    var sorted_list = [];
    for (var ref of all_students) {
      sorted_list.push(ref?._id);
    }

    const valid_all_students = await Student.find({ _id: { $in: sorted_list } })
      .select(
        "studentFirstName studentMiddleName remainingFeeList_count studentLastName studentDOB studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto admissionRemainFeeCount studentPhoneNumber studentEmail"
      )
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "user",
        select: "userEmail userPhoneNumber username userLegalName",
      })
      .populate({
        path: "batches",
        select: "batchName",
      })
      .populate({
        path: "fee_structure",
        select: "structure_name unique_structure_name applicable_fees",
      });

    valid_all_students.sort(function (st1, st2) {
      return (
        parseInt(st1?.studentGRNO?.slice(1)) -
        parseInt(st2?.studentGRNO?.slice(1))
      );
    });

    if (valid_all_students?.length > 0) {
      res.status(200).send({
        message: "Explore New Excel Exports Wait for Some Time To Process",
        student_card: valid_all_students,
        export_format: true,
      });
    } else {
      res.status(200).send({
        message: "No New Excel Exports ",
        student_card: [],
        export_format: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchExportStaffIdCardFormat = async (req, res) => {
  try {
    const { id } = req.params;
    await InstituteAdmin.findByIdAndUpdate(id, req.body);
    res.status(200).send({
      message: "Exported Staff Format Pattern Save",
      export_format: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.fetchExportStudentIdCardFormat = async (req, res) => {
  try {
    const { id } = req.params;
    await InstituteAdmin.findByIdAndUpdate(id, req.body);
    res.status(200).send({
      message: "Exported Student Format Pattern Save",
      export_format: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.fetchExportStudentRemainFeeQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    var refactor_response = [];
    const finance = await Finance.findById({ _id: fid }).select("institute");
    const export_ins = await InstituteAdmin.findById({
      _id: `${finance.institute}`,
    }).select("ApproveStudent");

    const student_query = await Student.find({
      _id: { $in: export_ins?.ApproveStudent },
    })
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentRemainingFeeCount studentPaidFeeCount studentGRNO"
      )
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "user",
        select: "userEmail userPhoneNumber username userLegalName",
      });

    for (var ref of student_query) {
      refactor_response.push({
        GRNO: ref?.studentGRNO,
        FullName: `${ref?.studentFirstName ? ref?.studentFirstName : ""} ${
          ref?.studentMiddleName ? ref?.studentMiddleName : ""
        } ${ref?.studentLastName ? ref?.studentLastName : ""}`,
        ProfilePhoto: ref?.studentProfilePhoto,
        RemainAmount: ref?.studentRemainingFeeCount,
        PaidAmount: ref?.studentPaidFeeCount,
        Class: `${ref?.studentClass?.className} - ${ref?.studentClass?.classTitle}`,
        Department: `${ref?.department?.dName}`,
      });
    }

    // const fEncrypt = await encryptionPayload(live_data);
    res.status(200).send({
      message: "Exported Student Finance Remain Fee",
      student_card: refactor_response,
      export_format: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.fetchExportAdmissionStudentRemainFeeQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    var refactor_response = [];
    const ads = await Admission.findById({ _id: aid }).select("remainingFee");

    const student_query = await Student.find({
      _id: { $in: ads?.remainingFee },
    })
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionRemainFeeCount admissionPaidFeeCount studentGRNO"
      )
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "user",
        select: "userEmail userPhoneNumber username userLegalName",
      });

    for (var ref = 0; ref < student_query?.length; ref++) {
      refactor_response.push({
        GRNO: student_query[ref]?.studentGRNO
          ? student_query[ref]?.studentGRNO
          : ref + 1,
        FullName: `${
          student_query[ref]?.studentFirstName
            ? student_query[ref]?.studentFirstName
            : ""
        } ${
          student_query[ref]?.studentMiddleName
            ? student_query[ref]?.studentMiddleName
            : ""
        } ${
          student_query[ref]?.studentLastName
            ? student_query[ref]?.studentLastName
            : ""
        }`,
        ProfilePhoto: student_query[ref]?.studentProfilePhoto,
        RemainAmount: student_query[ref]?.admissionRemainFeeCount,
        PaidAmount: student_query[ref]?.admissionPaidFeeCount,
        Class: student_query[ref]?.studentClass?.className
          ? `${student_query[ref]?.studentClass?.className} - ${student_query[ref]?.studentClass?.classTitle}`
          : "",
        Department: student_query[ref]?.department?.dName
          ? `${student_query[ref]?.department?.dName}`
          : "",
      });
    }

    // const fEncrypt = await encryptionPayload(live_data);
    res.status(200).send({
      message: "Exported Student Admission Remain Fee",
      student_card: refactor_response,
      export_format: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.fetchExportStudentRemainFeeFormat = async (req, res) => {
  try {
    const { id } = req.params;
    await Finance.findByIdAndUpdate(id, req.body);
    res.status(200).send({
      message: "Exported Student Remain Fee Format Pattern Save",
      export_format: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.reportAccountByEndUser = async (req, res) => {
  try {
    const { to, by } = req.params;
    const { accountStatus } = req.query;
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    admin.reported_end_user.push({
      end_user: to,
      report_by: by,
      account_status: accountStatus,
    });
    admin.reported_end_user_count += 1;
    await Promise.all([admin.save()]);
    res
      .status(200)
      .send({ message: "Thanks for letting us Know", report: true });
    const users_query = [...process.env.REPORT_NOTIFY];
    for (let i = 0; i < users_query?.length; i++) {
      var user = await User.findById({ _id: users_query[i] }).select(
        "deviceToken"
      );
      invokeSpecificRegister(
        "Specific Notification",
        `you're reported by ${user.username} related to ${accountStatus}`,
        "Reported End User",
        user._id,
        user.deviceToken
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveActiveMemberRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const { active_member_role } = req.query;
    const active_user = await User.findById({ _id: uid });
    const role =
      active_user?.staff?.length > 0
        ? active_user?.staff[0]
        : active_user?.student?.length > 0
        ? active_user?.student[0]
        : active_user?.linked_student?.length > 0
        ? active_user?.linked_student[0]
        : "";
    if (active_user?.active_member_role) {
      active_user.active_member_role = active_member_role
        ? active_member_role
        : active_user.active_member_role;
      await active_user.save();
    } else {
      active_user.active_member_role = role;
      await active_user.save();
    }

    if (active_user?.active_member_role) {
      const active_staff = await Staff.findOne({
        _id: active_user?.active_member_role,
      })
        .select("_id")
        .populate({
          path: "institute",
          select: "insName insProfilePhoto",
        });
      const active_student = await Student.findOne({
        _id: active_user?.active_member_role,
      })
        .select("_id")
        .populate({
          path: "institute",
          select: "insName insProfilePhoto",
        });
      if (active_staff) {
        res.status(200).send({
          message: "Active Role for Dashboard Feed 👻👻 (staff)",
          role: {
            activeRole: active_staff?._id,
            institute: active_staff?.institute ? active_staff?.institute : "",
            member: "Staff",
          },
          active: true,
        });
      } else if (active_student) {
        res.status(200).send({
          message: "Active Role for Dashboard Feed 👻👻 (student)",
          role: {
            activeRole: active_student?._id,
            institute: active_student?.institute
              ? active_student?.institute
              : "",
            member: "Student",
          },
          active: true,
        });
      }
    } else {
      res.status(200).send({
        message: "No Active Role for Dashboard Feed 👻👻",
        role: {},
        active: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

// var data = 0;

// const chatCountQuery = async (uid) => {
//   const db = getFirestore();
//   const shotChat = await db.collection(`users/${uid}/chats`).get();
//   shotChat?.forEach((shot) => {
//     messageCount(uid, shot?.id).then((res) => {
//       data += res;
//     });
//   });
//   return data;
// };

// const messageCount = async (uid, cid) => {
//   const db = getFirestore();
//   var count = 0;
//   const shotMessage = await db
//     .collection(`users/${uid}/chats/${cid}/messages`)
//     .get();
//   shotMessage?.forEach((snap) => {
//     if (`${uid}` !== `${snap?.data()?.senderId}` && !snap?.data()?.isSeen) {
//       count = count + 1;
//     }
//   });
//   return count + 1;
// };

exports.retrieveRecentChatCount = async (req, res) => {
  try {
    const { uid } = req.params;
    // var num = 0;
    // var tNum = 0;
    // var dNum = 0;
    // var sNum = 0;
    // const db = getFirestore();
    // const sfRef = db.collection("users").doc(`${uid}`);
    // const collections = await sfRef.listCollections();
    // collections.forEach(async (collection) => {
    //   const data = await collection.get();
    //   data.docs.forEach(async (snap) => {
    //     const map_data = await db
    //       .collection(`/users/${uid}/chats/${snap.id}/messages`)
    //       .listDocuments();
    //     map_data.forEach(async (count) => {
    //       const add = await count?.get();
    //       if (`${uid}` !== `${add?.data()?.senderId}` && !add?.data()?.isSeen) {
    //         num = num + 1;
    //       }
    //       tNum += num;
    //     });
    //     sNum += tNum;
    //   });
    //   dNum += sNum;
    // });
    const data = await chatCount(uid);
    res.status(200).send({
      message: "New Recents Chats🙄",
      show: true,
      data,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderCertificateOriginalCopyQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { original } = req.query;
    if (!id && !original)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: true,
      });

    var new_original = original === "false" ? false : true;
    const one_ins = await InstituteAdmin.findById({ _id: id });
    one_ins.original_copy = new_original;
    await one_ins.save();
    res.status(200).send({ message: "Explore Original Copy", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { excel_file } = req.body;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_class = await Class.findById({ _id: cid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_class?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      classId: one_class?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${one_class?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.classId}` === `${one_class?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json(
      val,
      one_ins?.admissionDepart,
      one_ins?.financeDepart,
      one_class?.department
    );
    if (is_converted?.value) {
      await retrieveInstituteDirectJoinQueryPayload(
        cid,
        is_converted?.student_array
      );
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONFinanceQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { excel_file } = req.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_finance = await Finance.findById({ _id: fid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_finance?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      financeId: one_finance?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${one_finance?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.financeId}` === `${one_finance?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_fee_category(val);
    if (is_converted?.value) {
      await renderFinanceAddFeeCategoryAutoQuery(
        fid,
        is_converted?.category_array
      );
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONFinanceHeadMasterQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { excel_file } = req.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_finance = await Finance.findById({ _id: fid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_finance?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      financeId: one_finance?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${one_finance?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.financeId}` === `${one_finance?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_fee_head_master(val);
    if (is_converted?.value) {
      await renderFinanceAddFeeMasterAutoQuery(fid, is_converted?.master_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONFinanceStructureQuery = async (req, res) => {
  try {
    const { fid, did } = req.params;
    const { excel_file } = req.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_finance = await Finance.findById({ _id: fid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_finance?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      financeId: one_finance?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${one_finance?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.financeId}` === `${one_finance?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_fee_structure(
      val,
      fid,
      did
    );
    if (is_converted?.value) {
      console.log(true);
      // console.log(is_converted?.structure_array);
      await renderFinanceAddFeeStructureAutoQuery(
        fid,
        did,
        is_converted?.structure_array
      );
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONStaffQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { excel_file } = req.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_ins = await InstituteAdmin.findById({
      _id: id,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      status: "Uploaded",
      flow: "STAFF",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: id,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (`${ref.status}` === "Uploaded" && `${ref?.flow}` === `STAFF`) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_direct_staff(val);
    if (is_converted?.value) {
      await retrieveInstituteDirectJoinStaffAutoQuery(
        id,
        is_converted?.staff_array
      );
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONHostelitiesQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const { excel_file } = req.body;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_hostel = await Hostel.findById({ _id: hid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_hostel?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      status: "Uploaded",
      flow: "HOSTELITIES",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${one_hostel?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (`${ref.status}` === "Uploaded" && `${ref?.flow}` === `HOSTELITIES`) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_direct_hostelities(
      val,
      hid,
      one_ins?.financeDepart?.[0]
    );
    if (is_converted?.value) {
      await renderDirectHostelJoinExcelQuery(hid, is_converted?.student_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONAdmissionScholarshipQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { excel_file, scid } = req.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_ads = await Admission.findById({ _id: aid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_ads?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      admissionId: one_ads?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${one_ads?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.admissionId}` === `${one_ads?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_scholarship_query(val);
    if (is_converted?.value) {
      await renderAdmissionNewScholarNumberAutoQuery(
        aid,
        is_converted?.scholar_array,
        scid,
        one_ins?._id
      );
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONScholarshipGRBatchQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { excel_file } = req.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_ins = await InstituteAdmin.findById({
      _id: id,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      instituteId: id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: id,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (`${ref.status}` === "Uploaded" && `${ref?.instituteId}` === `${id}`) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted =
      await generate_excel_to_json_scholarship_gr_batch_query(id, val);
    if (is_converted?.value) {
      await renderInstituteScholarNumberAutoQuery(id, is_converted?.gr_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONLibraryBookQuery = async (req, res) => {
  try {
    const { lid } = req.params;
    const { excel_file } = req.body;
    // console.log(req.body, req.params)
    if (!lid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const lib = await Library.findById({ _id: lid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${lib?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      libraryId: lib?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${lib?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.libraryId}` === `${lib?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted =
      await generate_excel_to_json_library_offline_book_query(val);
    if (is_converted?.value) {
      await renderNewOfflineBookAutoQuery(lid, is_converted?.book_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderChangeExistingUserPhoneQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { userPhoneNumber } = req.body;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: true,
      });

    const valid_student = await Student.findById({ _id: sid });
    const valid_user = await User.findById({ _id: `${student?.user}` });
    valid_user.userPhoneNumber = userPhoneNumber
      ? parseInt(userPhoneNumber)
      : valid_user?.userPhoneNumber;
    await valid_user.save();
    res
      .status(200)
      .send({ message: "Explore New User Phone Number Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONEmailReplaceQuery = async (req, res) => {
  try {
    const { excel_file } = req.body;

    const val = await simple_object(excel_file);

    res.status(200).send({ message: "Email Replace " });
    const is_converted = await generate_excel_to_json_login_query(val);
    if (is_converted?.value) {
      await retrieveEmailReplaceQuery(is_converted?.email_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllStudentAccessFeesEditableQuery = async (req, res) => {
  try {
    const { flow } = req.query;
    const { id, sid, online_amount_edit_access } = req.body;
    if (!flow && !online_amount_edit_access)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately",
        access: false,
      });

    if (flow === "Institute_Admin") {
      var valid_institute = await InstituteAdmin.findById({ _id: id }).select(
        "ApproveStudent online_amount_edit_access"
      );

      valid_institute.online_amount_edit_access = online_amount_edit_access;
      await valid_institute.save();
      res.status(200).send({
        message: "Explore Institute Editable Fee Access to all",
        access: true,
      });
      var all_student = await Student.find({
        _id: { $in: valid_institute?.ApproveStudent },
      });

      for (var ref of all_student) {
        ref.online_amount_edit_access = online_amount_edit_access;
        await ref.save();
      }
    } else if (flow === "Finance_Manager" || flow === "Admission_Admin") {
      var one_student = await Student.findById({ _id: sid });
      one_student.online_amount_edit_access = online_amount_edit_access;
      await one_student.save();
      res.status(200).send({
        message: `Explore ${flow} Editable Fee Access to all`,
        access: false,
      });
    } else {
      res.status(200).send({ message: "You are lost in space", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONUnApprovedStudentQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { excel_file } = req.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_ins = await InstituteAdmin.findById({
      _id: id,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      status: "Uploaded",
      flow: "UNAPPROVED STUDENT",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: id,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.flow}` === `UNAPPROVED STUDENT`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_un_approved(val);
    if (is_converted?.value) {
      // console.log(is_converted?.student_array);
      await retrieveUnApprovedDirectJoinQuery(id, is_converted?.student_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderApplicationCDNQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { isApk } = req.query;
    var file = req.file;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var student = await Student.findById({ _id: sid });
    if (isApk) {
      var results = await uploadDocFile(file);
    } else {
      var results = await uploadDocsFile(file);
    }
    student.application_print.push({
      value: results.Key,
      flow: isApk ? "APK" : "WEB",
      from: isApk ? true : false,
    });
    await student.save();
    res.status(200).send({
      message: "Explore Application Print ",
      access: true,
      student: student.application_print,
    });
    await unlinkFile(file.path);
  } catch (e) {
    console.log(e);
  }
};

exports.renderActiveDesignationRoleQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { flow, flow_id } = req.query;
    if (!sid && !flow && !flow_id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_staff = await Staff.findById({ _id: sid });
    one_staff.active_designation.flow = flow;
    one_staff.active_designation.flow_id = flow_id;
    await one_staff.save();
    res.status(200).send({
      message: "Explore Current Active Staff Designation Role 😀",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONSubjectChapterQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { excel_file, excel_count } = req.body;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    // const one_subject = await Subject.findById({ _id: sid });
    // const one_class = await Class.findById({ _id: `${one_subject?.class}` });
    // const one_ins = await InstituteAdmin.findById({
    //   _id: `${one_class?.institute}`,
    // });
    // one_ins.excel_data_query.push({
    //   excel_file: excel_file,
    //   subjectId: one_subject?._id,
    //   status: "Uploaded",
    // });
    // await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    // const update_ins = await InstituteAdmin.findById({
    //   _id: `${one_class?.institute}`,
    // });
    // var key;
    // for (var ref of update_ins?.excel_data_query) {
    //   if (
    //     `${ref.status}` === "Uploaded" &&
    //     `${ref?.subjectId}` === `${one_subject?._id}`
    //   ) {
    //     key = ref?.excel_file;
    //   }
    // }
    // const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_subject_chapter_query(
      excel_file,
      excel_count
    );
    if (is_converted?.value) {
      await renderNewOneChapterTopicQuery(sid, is_converted?.chapter_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderProfile = async (req, res) => {
  try {
    const { id } = req.params;
    var maleAvatar = [
      "3D2.jpg",
      "3D4.jpg",
      "3D6.jpg",
      "3D19.jpg",
      "3D20.jpg",
      "3D26.jpg",
      "3D21.jpg",
      "3D12.jpg",
      "3D13.jpg",
    ];
    var femaleAvatar = [
      "3D1.jpg",
      "3D3.jpg",
      "3D10.jpg",
      "3D11.jpg",
      "3D14.jpg",
      "3D15.jpg",
      "3D22.jpg",
      "3D31.jpg",
      "3D24.jpg",
    ];
    const one_ins = await InstituteAdmin.findById({ _id: id }).select(
      "UnApprovedStudent un_approved_student_count"
    );

    // var all_staff = await Staff.find({ _id: { $in: one_ins?.ApproveStaff } });
    var all_staff = await Student.find({
      _id: { $in: one_ins?.UnApprovedStudent },
    });

    for (var ref of all_staff) {
      var user = await User.findById({ _id: `${ref?.user}` });
      ref.studentGRNO = ref?.student_prn_enroll_number;
      if (ref?.studentGender?.toLowerCase() === "male") {
        ref.studentProfilePhoto = maleAvatar[Math.floor(Math.random() * 8)];
        user.profilePhoto = maleAvatar[Math.floor(Math.random() * 8)];
      } else if (ref?.studentGender?.toLowerCase() === "female") {
        ref.studentProfilePhoto = femaleAvatar[Math.floor(Math.random() * 8)];
        user.profilePhoto = femaleAvatar[Math.floor(Math.random() * 8)];
      } else {
      }
      await Promise.all([ref.save(), user.save()]);
    }
    one_ins.un_approved_student_count = one_ins?.UnApprovedStudent?.length;
    await one_ins.save();
    res
      .status(200)
      .send({ message: "Explore All Staff || Student Profile Photo" });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllClassMatesQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_student = await Student.findById({ _id: sid }).select(
      "studentClass"
    );

    var all_mates = await Student.find({
      studentClass: `${one_student?.studentClass}`,
    })
      .limit(limit)
      .skip(skip)
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender user studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "username userLegalName profilePhoto photoId",
      });

    for (var val of all_mates) {
      if (`${val?._id}` === `${one_student?._id}`) {
        val.you_default = true;
      }
    }

    if (all_mates?.length > 0) {
      res.status(200).send({
        message: "Explore One Student All Class Mates Query",
        access: true,
        all_mates: all_mates,
      });
    } else {
      res.status(200).send({
        message: "You're lost in space",
        access: false,
        all_mates: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFilteredMessageQuery = async (req, res) => {
  try {
    const { filtered_arr, message, from, type, flow, m_title, m_doc } =
      req.body;
    const { id } = req.query;
    if (!filtered_arr)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var all_student = await Student.find({ _id: { $in: filtered_arr } });

    if (flow === "INSTITUTE_ADMIN") {
      var valid_ins = await InstituteAdmin.findById({ _id: `${from}` });
      const new_message = new StudentMessage({
        message: `${message}`,
        student_list: [...filtered_arr],
        student_list_count: filtered_arr?.length,
        message_type: `${type}`,
        from_name: "Institute Admin",
        message_title: m_title,
        message_document: m_doc,
        institute: valid_ins?._id,
        message_mode: "STUDENT_MESSAGE",
      });
      valid_ins.student_message.push(new_message?._id);
      valid_ins.student_message_count += 1;
      await Promise.all([new_message.save(), valid_ins.save()]);
      res
        .status(200)
        .send({ message: "Explore Filtered Message Query", access: true });
      for (var ref of all_student) {
        var user = await User.findById({
          _id: `${ref?.user}`,
        });
        var notify = new StudentNotification({});
        notify.notifyContent = `${message} - From ${type},
      Institute Admin`;
        notify.notifySender = `${valid_ins?._id}`;
        notify.notifyReceiever = `${user?._id}`;
        notify.notifyType = "Student";
        notify.notifyPublisher = ref?._id;
        user.activity_tab.push(notify?._id);
        user.student_message.push(new_message?._id);
        notify.notifyByInsPhoto = valid_ins?._id;
        notify.notifyCategory = "Reminder Alert";
        notify.redirectIndex = 59;
        notify.student_message = new_message?._id;
        await Promise.all([user.save(), notify.save()]);
        invokeSpecificRegister(
          "Specific Notification",
          `${m_title} - ${type},
      Institute Admin`,
          "Student Alert",
          user._id,
          user.deviceToken
        );
      }
    } else {
      var valid_staff = await Staff.findById({ _id: `${from}` });
      var institute = await InstituteAdmin.findById({ _id: id });
      const new_message = new StudentMessage({
        message: `${message}`,
        student_list: [...filtered_arr],
        student_list_count: filtered_arr?.length,
        message_type: `${type}`,
        from: valid_staff?._id,
        message_title: m_title,
        message_document: m_doc,
        institute: institute?._id,
        message_mode: "STUDENT_MESSAGE",
      });
      institute.student_message.push(new_message?._id);
      institute.student_message_count += 1;
      await Promise.all([new_message.save(), institute.save()]);
      res
        .status(200)
        .send({ message: "Explore Filtered Message Query", access: true });
      for (var ref of all_student) {
        var user = await User.findById({
          _id: `${ref?.user}`,
        });
        var notify = new StudentNotification({});
        notify.notifyContent = `${message} - From ${type},
      ${valid_staff?.staffFirstName} ${valid_staff?.staffMiddleName ?? ""} ${
          valid_staff?.staffLastName
        }`;
        notify.notifySender = `${valid_staff?.user}`;
        notify.notifyReceiever = `${user?._id}`;
        notify.notifyType = "Student";
        notify.notifyPublisher = ref?._id;
        user.activity_tab.push(notify?._id);
        user.student_message.push(new_message?._id);
        notify.notifyByStaffPhoto = valid_staff?._id;
        notify.notifyCategory = "Reminder Alert";
        notify.redirectIndex = 59;
        notify.student_message = new_message?._id;
        await Promise.all([user.save(), notify.save()]);
        invokeSpecificRegister(
          "Specific Notification",
          `${m_title} - ${type},
      ${valid_staff?.staffFirstName} ${valid_staff?.staffMiddleName ?? ""} ${
            valid_staff?.staffLastName
          }`,
          "Student Alert",
          user._id,
          user.deviceToken
        );
      }

      // valid_staff.student_message.push({
      //   message: `${message}`,
      //   student_list: [...filtered_arr],
      //   student_list_count: filtered_arr?.length,
      //   message_type: `${type}`,
      // });
      // await valid_staff.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllFilteredMessageQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { flow } = req.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    if (flow === "INSTITUTE_ADMIN") {
      var valid_ins = await InstituteAdmin.findById({ _id: sid }).select(
        "student_message"
      );
      var all_message = await StudentMessage.find({
        $and: [
          { _id: { $in: valid_ins?.student_message } },
          { message_mode: "STUDENT_MESSAGE" },
        ],
      })
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "from student_list",
          select:
            "studentFirstName studentMiddleName studentLastName studentProfilePhoto photoId valid_full_name staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId studentGRNO",
        });
    } else {
      var valid_staff = await Staff.findById({ _id: sid }).select(
        "student_message"
      );
      var all_message = await StudentMessage.find({
        $and: [
          { _id: { $in: valid_staff?.student_message } },
          { message_mode: "STUDENT_MESSAGE" },
        ],
      })
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip)
        .populate({
          path: "from student_list",
          select:
            "studentFirstName studentMiddleName studentLastName studentProfilePhoto photoId valid_full_name staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId studentGRNO",
        });
    }

    if (all_message?.length > 0) {
      res.status(200).send({
        message: "Explore New All Message Query",
        access: true,
        all_message: all_message,
      });
    } else {
      res.status(200).send({
        message: "No New All Message Query",
        access: false,
        all_message: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderBirthdaySurpriseQuery = async (req, res) => {
  // const all_depart = await RemainingList.find({});
  // for (var val of all_depart) {
  //   val.applicable_fees_pending = 0;
  //   // val.ug_undertakings_admission = false;
  //   // val.pg_undertakings_admission = false;
  //   await val.save();
  // }
  // res.status(200).send({ message: "Updated" });
  try {
    var valid_date = custom_date_time_birthday(0);
    var user = await User.find({
      userDateOfBirth: { $regex: `${valid_date}`, $options: "i" },
    });
    for (var ref of user) {
      invokeSpecificRegister(
        "Specific Notification",
        `Wishing you a very happy birthday! May all your dreams come true - From Qviple Teams.`,
        "Birthday Surprise",
        ref._id,
        ref.deviceToken
      );
      for (var val of ref?.userFollowers) {
        var valid_user = await User.findById({ _id: `${val}` });
        var notify = new Notification({});
        notify.notifyContent = `Wish a very happy birthday to ${
          ref?.userLegalName
        } on ${moment(ref?.userDateOfBirth).format("LL")}. - say congrats`;
        notify.notifyReceiever = valid_user?._id;
        notify.notifyCategory = "Birthday Surprise";
        valid_user.uNotify.push(notify._id);
        notify.notifyByPhoto = ref?._id;
        // console.log(notify?.notifyContent);
        await Promise.all([valid_user.save(), notify.save()]);
      }
    }
    res
      .status(200)
      .send({ message: "Explore Birthday Boy || Girl", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneStudentGRNumberQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_student = await Student.findById({ _id: sid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_student?.institute}`,
    });
    const query = new InternalQuery({
      ...req.body,
    });
    query.query_by_student = one_student?._id;
    query.query_to_admin = one_ins?._id;
    one_ins.internal_query.push(query?._id);
    one_ins.internal_query_count += 1;
    one_student.query_lock_status = "Locked";
    await Promise.all([one_student.save(), one_ins.save(), query.save()]);
    res
      .status(200)
      .send({ message: "Explore New Internal Query By Student", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneQueryStatus = async (req, res) => {
  try {
    const { qid } = req.params;
    const { status } = req.query;
    if (!qid && !status)
      return res.status(200).send({
        message: "Their is a bug nedd to fixed immediately",
        access: false,
      });

    const one_query = await InternalQuery.findById({ _id: qid });
    const one_student = await Student.findById({
      _id: `${one_query?.query_by_student}`,
    });
    const exist_gr = await Student.find({
      $and: [
        { institute: `${one_query?.query_to_admin}` },
        { studentStatus: "Approved" },
        { studentGRNO: `${one_query?.query_gr}` },
      ],
    });
    if (exist_gr?.length > 0) {
      res
        .status(200)
        .send({ message: "GR Number Already Exists", access: false });
    } else {
      if (status === "Approved") {
        one_student.studentGRNO = `${one_query?.query_gr}`;
      } else {
      }
      one_query.query_status = status;
      one_student.query_lock_status = "Unlocked";
      await Promise.all([one_query.save(), one_student.save()]);
      res
        .status(200)
        .send({ message: `Explore New GR Number ${status}`, access: true });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllInternalQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_ins = await InstituteAdmin.findById({ _id: id }).select(
      "internal_query"
    );

    var all_query = await InternalQuery.find({
      _id: { $in: one_ins?.internal_query },
    })
      .sort({ created_at: "-1" })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "query_by_student",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
      });

    if (all_query?.length > 0) {
      res.status(200).send({
        message: "Explore All Internal Query",
        access: true,
        all_query: all_query,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Internal Query", access: false, all_query: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderProfileUploadQuery = async (req, res) => {
  try {
    const { suid, role } = req.query;
    const file = req?.file;
    if (!suid && !role)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (role === "ONLY_USER") {
      const user = await User.findById({ _id: suid });
      const profile = await uploadDocsFile(file);
      user.profilePhoto = profile?.Key;
      user.profile_modification = new Date();
      await user.save();
      await unlinkFile(file?.path);
      res
        .status(200)
        .send({ message: "Explore New User Profile", access: true });
      const post = await Post.find({ author: user._id });
      post.forEach(async (ele) => {
        ele.authorPhotoId = "0";
        ele.authorProfilePhoto = user.profilePhoto;
        await ele.save();
      });
      const comment = await Comment.find({ author: user._id });
      comment.forEach(async (com) => {
        com.authorPhotoId = "0";
        com.authorProfilePhoto = user.profilePhoto;
        await com.save();
      });
      const replyComment = await ReplyComment.find({ author: user._id });
      replyComment.forEach(async (reply) => {
        reply.authorPhotoId = "0";
        reply.authorProfilePhoto = user.profilePhoto;
        await reply.save();
      });
      const answers = await Answer.find({ author: user._id });
      answers.forEach(async (ans) => {
        ans.authorPhotoId = "0";
        ans.authorProfilePhoto = user.profilePhoto;
        await ans.save();
      });
      const answerReply = await AnswerReply.find({ author: user._id });
      answerReply.forEach(async (ansRep) => {
        ansRep.authorPhotoId = "0";
        ansRep.authorProfilePhoto = user.profilePhoto;
        await ansRep.save();
      });
    } else if (role === "USER_AND_STUDENT") {
      const user = await User.findById({ _id: suid });
      var valid_student = await Student.find({ _id: { $in: user?.student } });
      var profile = await uploadDocsFile(file);
      user.profilePhoto = profile?.Key;
      user.profile_modification = new Date();
      for (var val of valid_student) {
        if (val) {
          val.studentProfilePhoto = profile?.Key;
          await val.save();
        }
      }
      await user.save();
      await unlinkFile(file?.path);
      res
        .status(200)
        .send({ message: "Explore New User + Student Profile", access: true });
      const post = await Post.find({ author: user._id });
      post.forEach(async (ele) => {
        ele.authorPhotoId = "0";
        ele.authorProfilePhoto = user.profilePhoto;
        await ele.save();
      });
      const comment = await Comment.find({ author: user._id });
      comment.forEach(async (com) => {
        com.authorPhotoId = "0";
        com.authorProfilePhoto = user.profilePhoto;
        await com.save();
      });
      const replyComment = await ReplyComment.find({ author: user._id });
      replyComment.forEach(async (reply) => {
        reply.authorPhotoId = "0";
        reply.authorProfilePhoto = user.profilePhoto;
        await reply.save();
      });
      const answers = await Answer.find({ author: user._id });
      answers.forEach(async (ans) => {
        ans.authorPhotoId = "0";
        ans.authorProfilePhoto = user.profilePhoto;
        await ans.save();
      });
      const answerReply = await AnswerReply.find({ author: user._id });
      answerReply.forEach(async (ansRep) => {
        ansRep.authorPhotoId = "0";
        ansRep.authorProfilePhoto = user.profilePhoto;
        await ansRep.save();
      });
    } else {
      res
        .status(200)
        .send({ message: "You're are lost in space", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentSectionFormShowQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const valid_ins = await InstituteAdmin.findById({ _id: id }).select(
      "student_section_form_show_query"
    );
    res.status(200).send({
      message: "Explore Show Form Visibility For All Students",
      access: true,
      show: valid_ins,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentSectionFormShowEditQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await InstituteAdmin.findByIdAndUpdate(id, req?.body);
    res.status(200).send({
      message: "Explore New Form Visibility For All Students",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentNameCaseQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_case_format_query } = req.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_ins = await InstituteAdmin.findById({ _id: id })
      .select("name_case_format_query ApproveStudent")
      .populate({
        path: "ApproveStudent",
      });

    var format;
    if (`${valid_ins?.name_case_format_query}` === "CAPS_FORMAT") {
      // console.log("NN");
      // let i = 0;
      for (var ref of valid_ins?.ApproveStudent) {
        format = await all_upper_case_query(ref);
        // console.log(i);
        // i += 1;
      }
    } else if (`${valid_ins?.name_case_format_query}` === "SMALL_FORMAT") {
      for (var ref of valid_ins?.ApproveStudent) {
        format = await all_lower_case_query(ref);
      }
    } else if (`${valid_ins?.name_case_format_query}` === "TITLE_FORMAT") {
      // let i = 0;
      for (var ref of valid_ins?.ApproveStudent) {
        format = await all_title_case_query(ref);
        // console.log(i);
        // i += 1;
      }
    } else {
    }
    valid_ins.name_case_format_query = name_case_format_query;
    await valid_ins.save();
    res.status(200).send({
      message: "Explore Name Case Query",
      access: true,
      format: format,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONExistFeesQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { excel_file } = req.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${one_ins?.financeDepart?.[0]}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      admissionId: ads_admin?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.admissionId}` === `${ads_admin?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_fee_query(
      val,
      ads_admin?._id,
      finance?._id
    );
    if (is_converted?.value) {
      await retrieveInstituteDirectJoinPayloadFeesQuery(
        aid,
        is_converted?.student_array
      );
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderZipFileQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var valid_student = await Student.findById({ _id: id }).select(
      "studentFirstName studentGRNO studentProfilePhoto"
    );
    var allow;
    // if (
    //   `${valid_student?.studentProfilePhoto}` ==
    //   `${valid_student?.studentFirstName}_${valid_student?.studentGRNO}`
    // ) {
    //   allow = false;
    // } else {
    await rename_objects(
      `${valid_student?.studentProfilePhoto}`,
      `${valid_student?.studentFirstName}_${valid_student?.studentGRNO}`
    );
    allow = true;
    // }
    valid_student.studentProfilePhoto = `${valid_student?.studentFirstName}_${valid_student?.studentGRNO}.jpg`;
    await valid_student.save();
    var valid_students = await Student.findById({ _id: id });
    var data = {
      profile_pic: valid_students?.studentProfilePhoto,
      name: valid_students?.valid_full_name,
      gr: valid_students?.studentGRNO,
    };
    res.status(200).send({
      message: "Explore Id Card File",
      access: true,
      allow,
      Key: `${valid_student.studentProfilePhoto}`,
      data: data,
    });
    // cdn_link_last_key: `${valid_ins?.name}.zip`,
    // await next_call(`${valid_ins?.name}.zip`);
    // await remove_call(`${valid_ins?.name}.zip`);
    // await remove_assets();
  } catch (e) {
    console.log(e);
  }
};

exports.renderDesignationCheckQuery = async (req, res) => {
  try {
    const { sid, id } = req.params;
    const { desig_array } = req.body;
    if (desig_array?.length > 0) {
      await all_new_designation_query(desig_array, sid, id);
      res.status(200).send({
        message: "Explore New Flow Model Of Checkbox Designation",
        access: true,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Designation available for staff", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDesignationAllQuery = async (req, res) => {
  try {
    const { id } = req.params;
    // const { search, flow } = req.query
    if (!id)
      return res
        .status(200)
        .send({ message: "Explore All Designation with heads", access: false });
    var valid_institute = await InstituteAdmin.findById({ _id: id })
      .select(
        "insName name financeDepart admissionDepart hostelDepart transportDepart library eventManagerDepart aluminiDepart"
      )
      .populate({
        path: "financeDepart",
        select: "financeHead",
        populate: {
          path: "financeHead",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
      })
      .populate({
        path: "admissionDepart",
        select: "admissionAdminHead",
        populate: {
          path: "admissionAdminHead",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
      })
      .populate({
        path: "hostelDepart",
        select: "hostel_manager",
        populate: {
          path: "hostel_manager",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
      })
      .populate({
        path: "transportDepart",
        select: "transport_manager",
        populate: {
          path: "transport_manager",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
      })
      .populate({
        path: "library",
        select: "libraryHead",
        populate: {
          path: "libraryHead",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
      })
      .populate({
        path: "eventManagerDepart",
        select: "event_head",
        populate: {
          path: "event_head",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
      })
      .populate({
        path: "aluminiDepart",
        select: "alumini_head",
        populate: {
          path: "alumini_head",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
      });

    res.status(200).send({
      message: "Explore New / All Designations with all heads / manager",
      access: true,
      valid_institute: valid_institute,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONDepartmentQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { excel_file } = req.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_ins = await InstituteAdmin.findById({
      _id: id,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      instituteId: one_ins?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: id,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.instituteId}` === `${update_ins?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_department_query(val);
    if (is_converted?.value) {
      await render_new_department_query(is_converted?.depart_array, id);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONClassMasterQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { excel_file } = req.body;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    const one_ins = await InstituteAdmin.findById({
      _id: `${depart?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      departId: depart?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${depart?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.departId}` === `${depart?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_class_master_query(val);
    if (is_converted?.value) {
      await render_new_class_master_query(
        is_converted?.class_master_array,
        did
      );
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONSubjectMasterQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { excel_file } = req.body;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    const one_ins = await InstituteAdmin.findById({
      _id: `${depart?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      departId: depart?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${depart?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.departId}` === `${depart?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_subject_master_query(val);
    if (is_converted?.value) {
      await render_new_subject_master_query(
        is_converted?.subject_master_array,
        did
      );
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONClassQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { excel_file } = req.body;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    const one_ins = await InstituteAdmin.findById({
      _id: `${depart?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      departId: depart?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${depart?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.departId}` === `${depart?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_class_query(val, did);
    if (is_converted?.value) {
      await render_new_class_query(is_converted?.class_array, did);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONSubjectQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { excel_file } = req.body;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const classes = await Class.findById({ _id: cid });
    const depart = await Department.findById({ _id: `${classes?.department}` });
    const one_ins = await InstituteAdmin.findById({
      _id: `${classes?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      classId: classes?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${classes?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.classId}` === `${classes?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_subject_query(
      val,
      depart?._id,
      classes?._id
    );
    if (is_converted?.value) {
      await render_new_subject_query(is_converted?.subject_array, cid);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneStudentFilteredMessageQuery = async (req, res) => {
  try {
    const { sid, message, from, type, flow, m_title, m_doc } = req.body;
    const { id } = req?.query;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (flow === "INSTITUTE_ADMIN") {
      var student = await Student.findById({ _id: sid });
      var valid_ins = await InstituteAdmin.findById({ _id: `${from}` });
      var user = await User.findById({
        _id: `${student?.user}`,
      });
      const new_message = new StudentMessage({
        message: `${message}`,
        student_list: [sid],
        student_list_count: 1,
        message_type: `${type}`,
        from_name: "Institute Admin",
        message_title: m_title,
        message_document: m_doc,
        institute: valid_ins?._id,
        message_mode: "STUDENT_MESSAGE",
      });
      valid_ins.student_message.push(new_message?._id);
      valid_ins.student_message_count += 1;
      await Promise.all([new_message.save(), valid_ins.save()]);
      res
        .status(200)
        .send({ message: "Explore Filtered Message Query", access: true });
      var notify = new StudentNotification({});
      notify.notifyContent = `${message} - From ${type},
    Institute Admin`;
      notify.notifySender = `${valid_ins?._id}`;
      notify.notifyReceiever = `${user?._id}`;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      user.student_message.push(new_message?._id);
      notify.notifyByInsPhoto = valid_ins?._id;
      notify.notifyCategory = "Reminder Alert";
      notify.redirectIndex = 59;
      notify.student_message = new_message?._id;
      await Promise.all([user.save(), notify.save()]);
      invokeSpecificRegister(
        "Specific Notification",
        `${m_title} - ${type},
    Institute Admin`,
        "Student Alert",
        user._id,
        user.deviceToken
      );
    } else {
      var student = await Student.findById({ _id: sid });
      var valid_staff = await Staff.findById({ _id: `${from}` });
      var institute = await InstituteAdmin.findById({ _id: id });
      var user = await User.findById({
        _id: `${student?.user}`,
      });
      const new_message = new StudentMessage({
        message: `${message}`,
        student_list: [sid],
        student_list_count: 1,
        message_type: `${type}`,
        from: valid_staff?._id,
        message_title: m_title,
        message_document: m_doc,
        institute: institute?._id,
        message_mode: "STUDENT_MESSAGE",
      });
      institute.student_message.push(new_message?._id);
      institute.student_message_count += 1;
      await Promise.all([new_message.save(), institute.save()]);
      res
        .status(200)
        .send({ message: "Explore Filtered Message Query", access: true });
      var notify = new StudentNotification({});
      notify.notifyContent = `${message} - From ${type},
      ${valid_staff?.staffFirstName} ${valid_staff?.staffMiddleName ?? ""} ${
        valid_staff?.staffLastName
      }`;
      notify.notifySender = `${valid_staff?.user}`;
      notify.notifyReceiever = `${user?._id}`;
      notify.notifyType = "Student";
      notify.notifyPublisher = student?._id;
      user.activity_tab.push(notify?._id);
      user.student_message.push(new_message?._id);
      notify.notifyByStaffPhoto = valid_staff?._id;
      notify.notifyCategory = "Reminder Alert";
      notify.redirectIndex = 59;
      notify.student_message = new_message?._id;
      await Promise.all([user.save(), notify.save()]);
      invokeSpecificRegister(
        "Specific Notification",
        `${m_title} - ${type},
      ${valid_staff?.staffFirstName} ${valid_staff?.staffMiddleName ?? ""} ${
          valid_staff?.staffLastName
        }`,
        "Student Alert",
        user._id,
        user.deviceToken
      );

      // valid_staff.student_message.push({
      //   message: `${message}`,
      //   student_list: [sid],
      //   student_list_count: 1,
      //   message_type: `${type}`,
      // });
      // await valid_staff.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderThreeDesignationQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const staff = await Staff.findById({ _id: sid }).select(
      "staffDepartment staffSubject staffClass staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
    );

    res.status(200).send({
      message: "Explore Three Designation Query",
      access: true,
      staff: staff,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONAttendenceQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { excel_file } = req.body;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_class = await Class.findById({ _id: cid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_class?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      classId: one_class?._id,
      status: "Uploaded Attendence",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${one_class?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded Attendence" &&
        `${ref?.classId}` === `${one_class?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_attendence_query(val);
    if (is_converted?.value) {
      await render_mark_attendence_query(cid, is_converted?.student_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAddCertificateQuery = async (req, res) => {
  try {
    const { sid } = req?.params;
    const { id } = req?.query;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var student = await Student.findById({ _id: sid });
    var ins = await InstituteAdmin.findById({ _id: id });
    var new_cert = new CertificateQuery({ ...req?.body });
    new_cert.student = student?._id;
    new_cert.institute = ins?._id;
    student.certificate.push(new_cert?._id);
    student.certificate_count += 1;
    await Promise.all([student.save(), new_cert.save()]);
    res
      .status(200)
      .send({ message: "Explore New Certificate Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentAllCertificateQuery = async (req, res) => {
  try {
    const { sid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var student = await Student.findById({ _id: sid }).select(
      "certificate certificate_count"
    );
    var all_cert = await CertificateQuery.find({
      _id: { $in: student?.certificate },
    })
      .sort({ created_at: "-1" })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "institute",
        select: "insName name certificate_issued_count",
      })
      .populate({
        path: "fee_receipt",
        select: "fee_payment_amount fee_payment_mode invoice_count",
      });
    res.status(200).send({
      message: "Explore All Certificate Query",
      access: true,
      all_cert: all_cert,
      count: student?.certificate_count,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentAllCertificateQueryStatus = async (req, res) => {
  try {
    const { id } = req?.params;

    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    let all_cert = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      const student = await Student.find({
        $or: [
          {
            studentFirstName: {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            studentMiddleName: {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            studentLastName: {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            studentGRNO: {
              $regex: req.query.search,
              $options: "i",
            },
          },
        ],
      }).select("_id");

      let ids = [];
      if (student?.length > 0) {
        for (let dt of student) {
          ids.push(dt?._id);
        }
      }

      all_cert = await CertificateQuery.find({
        $and: [
          { institute: { $eq: `${id}` } },
          { certificate_status: `Requested` },
          { student: { $in: ids } },
        ],
      })
        .populate({
          path: "institute",
          select: "insName name certificate_issued_count",
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO studentROLLNO studentGender",
        })
        .populate({
          path: "fee_receipt",
          select: "fee_payment_amount fee_payment_mode invoice_count",
        });
    } else {
      all_cert = await CertificateQuery.find({
        $and: [
          { institute: { $eq: `${id}` } },
          { certificate_status: `Requested` },
        ],
      })
        .sort({ created_at: "-1" })
        .skip(dropItem)
        .limit(itemPerPage)
        .populate({
          path: "institute",
          select: "insName name certificate_issued_count",
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO studentROLLNO studentGender",
        })
        .populate({
          path: "fee_receipt",
          select: "fee_payment_amount fee_payment_mode invoice_count",
        });
    }

    res.status(200).send({
      message: `Explore All Requested Certificate Query`,
      access: true,
      all_cert: all_cert,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderMarkCertificateQueryStatus = async (req, res) => {
  try {
    const { cid } = req?.params;
    const {
      attach,
      status,
      is_bonafide,
      certificate_bonafide_count,
      certificate_type,
      certificate_attachment,
      student_name,
      staffId,
      student_bonafide,
      // for leaving type and other also
      other_data,
      certificate_original_leaving_count,
      is_dublicate,
    } = req?.body;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (is_bonafide) {
      const valid_cert = await CertificateQuery.findById(cid);
      valid_cert.certificate_status = `${status}`;
      valid_cert.certificate_issued_date = new Date();
      valid_cert.certificate_attach = `${attach}`;
      await valid_cert.save();

      const institute = await InstituteAdmin.findById({
        _id: `${valid_cert?.institute}`,
      });
      institute.certificate_issued_count += 1;
      institute.certificate_bonafide_count = certificate_bonafide_count;
      await institute.save();

      res
        .status(200)
        .send({ message: `Explore New ${status} Query`, access: true });

      const student = await Student.findById(valid_cert.student);
      if (institute?.institute_log && student?._id) {
        const i_log = await InstituteLog.findById(institute?.institute_log);
        const c_logs = new InstituteCertificateLog({
          instituteId: institute?._id,
          institute_log_id: i_log?._id,
          student_name: student_name,
          student: student?._id,
          certificate_attachment: certificate_attachment,
          certificate_type: certificate_type,
          certificate_issue_type: "",
          other_data: [student_bonafide],
        });
        if (staffId) {
          c_logs.issue_by_staff = staffId;
        } else {
          c_logs.issue_by_institute = "NIL";
        }
        i_log.certificate_logs.push(c_logs?._id);
        student.certificate_logs.push(c_logs?._id);
        await Promise.all([c_logs.save(), i_log.save(), student.save()]);
      }
    } else {
      const valid_cert = await CertificateQuery.findById({ _id: cid });
      valid_cert.certificate_status = `${status}`;
      valid_cert.certificate_issued_date = new Date();
      valid_cert.certificate_attach = `${attach}`;
      await valid_cert.save();

      const institute = await InstituteAdmin.findById({
        _id: `${valid_cert?.institute}`,
      });
      institute.certificate_issued_count += 1;
      if (
        !is_dublicate &&
        certificate_original_leaving_count &&
        certificate_attachment
      ) {
        institute.certificate_original_leaving_count =
          certificate_original_leaving_count;
      }
      await institute.save();

      res
        .status(200)
        .send({ message: `Explore New ${status} Query`, access: true });
      const student = await Student.findById(valid_cert.student);
      if (institute?.institute_log && student?._id) {
        const i_log = await InstituteLog.findById(institute?.institute_log);
        const c_logs = new InstituteCertificateLog({
          instituteId: institute?._id,
          institute_log_id: i_log?._id,
          student_name: student_name,
          student: student?._id,
          certificate_attachment: certificate_attachment,
          certificate_type: certificate_type,
          certificate_issue_type: is_dublicate ? "Dublicate" : "Original",
          other_data: [other_data],
        });
        if (staffId) {
          c_logs.issue_by_staff = staffId;
        } else {
          c_logs.issue_by_institute = "NIL";
        }
        i_log.certificate_logs.push(c_logs?._id);
        student.certificate_logs.push(c_logs?._id);
        await Promise.all([c_logs.save(), i_log.save(), student.save()]);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderUpdateCertificateFundQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      bona_charges,
      leaving_charges,
      transfer_charges,
      migration_charges,
    } = req?.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ins = await InstituteAdmin.findById({ _id: id });
    if (bona_charges) {
      ins.certificate_fund_charges.bona_charges = bona_charges;
    }
    if (leaving_charges) {
      ins.certificate_fund_charges.leaving_charges = leaving_charges;
    }
    if (transfer_charges) {
      ins.certificate_fund_charges.transfer_charges = transfer_charges;
    }
    if (migration_charges) {
      ins.certificate_fund_charges.migration_charges = migration_charges;
    }
    await ins.save();
    res.status(200).send({
      message: "Explore New Certificate Fund Charges Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllExportExcelArrayQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ins_admin = await InstituteAdmin.findById({ _id: id }).select(
      "student_export_collection"
    );

    var all_excel = await nested_document_limit(
      page,
      limit,
      ins_admin?.student_export_collection.reverse()
    );
    if (all_excel?.length > 0) {
      res.status(200).send({
        message: "Explore All Exported Excel",
        access: true,
        all_excel: all_excel,
        count: ins_admin?.student_export_collection?.length,
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
    const { id, exid } = req.params;
    const { excel_file_name } = req.body;
    if (!id && !exid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ins_admin = await InstituteAdmin.findById({ _id: id }).select(
      "student_export_collection"
    );
    for (var exe of ins_admin?.student_export_collection) {
      if (`${exe?._id}` === `${exid}`) {
        exe.excel_file_name = excel_file_name;
      }
    }
    await ins_admin.save();
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
    const { id, exid } = req.params;
    if (!id && !exid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ins_admin = await InstituteAdmin.findById({ _id: id }).select(
      "student_export_collection student_export_collection_count"
    );
    for (var exe of ins_admin?.student_export_collection) {
      if (`${exe?._id}` === `${exid}`) {
        ins_admin?.student_export_collection.pull(exid);
        if (ins_admin?.student_export_collection_count > 0) {
          ins_admin.student_export_collection_count -= 1;
        }
      }
    }
    await ins_admin.save();
    res.status(200).send({
      message: "Exported Excel Deletion Operation Completed",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderShuffledStudentQuery = async (req, res) => {
  try {
    const { cid, bid, flow, shuffle_arr } = req.body;
    if (!flow)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    if (flow === "CLASS_WISE") {
      if (shuffle_arr?.length > 0) {
        const classes = await Class.findById({ _id: cid });
        classes.ApproveStudent = [];
        await classes.save();
        var i = 0;
        for (var val of shuffle_arr) {
          classes.ApproveStudent.push(val);
          const student = await Student.findById({ _id: `${val}` });
          student.studentROLLNO = i + 1;
          i += 1;
          await student.save();
        }
        classes.shuffle_on = true;
        await classes.save();
        res.status(200).send({
          message: "Explore Class Wise Shuffling Query",
          access: true,
        });
      }
    } else if (flow === "BATCH_WISE") {
      if (shuffle_arr?.length > 0) {
        const batch = await Batch.findById({ _id: bid });
        batch.class_student_query = [];
        await batch.save();
        for (var val of shuffle_arr) {
          batch.class_student_query.push(val);
        }
        await batch.save();
        res.status(200).send({
          message: "Explore Batch Wise Shuffling Query",
          access: true,
        });
      }
    } else {
      res.status(200).send({ message: "Invalid Flow Query", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllFilteredAlarmQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var valid_ins = await InstituteAdmin.findById({ _id: id }).select(
      "student_reminder"
    );
    var all_message = await StudentMessage.find({
      $and: [
        { _id: { $in: valid_ins?.student_reminder } },
        { message_mode: "STUDENT_REMINDER" },
      ],
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "from student_list",
        select:
          "studentFirstName studentMiddleName studentLastName studentProfilePhoto photoId valid_full_name staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId studentGRNO",
      });

    if (all_message?.length > 0) {
      res.status(200).send({
        message: "Explore New All Alarm Query",
        access: true,
        all_message: all_message,
      });
    } else {
      res.status(200).send({
        message: "No New All Alarm Query",
        access: false,
        all_message: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.instituteidCardRequiredField = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const institute = await InstituteAdmin.findById({ _id: id }).select(
      "institute_id_setting"
    );

    res.status(200).send({
      message: "Explore id card setting",
      access: true,
      institute_id_setting: institute?.institute_id_setting,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.instituteidCardRequiredFieldUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    await InstituteAdmin.findByIdAndUpdate(id, req.body);

    res.status(200).send({
      message: "Institute id card field is updated.",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllInstituteFundChargesQuery = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const ins = await InstituteAdmin.findById({ _id: id }).select(
      "certificate_fund_collection certificate_fund_charges"
    );
    res.status(200).send({
      message: "Explore All Institute Fund Charges + Collection",
      access: true,
      certificate: ins,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOldMessageQuery = async (req, res) => {
  try {
    var valid_ins = await InstituteAdmin.find({ status: "Approved" }).select(
      "ApproveStaff"
    );

    var i = 0;
    for (var val of valid_ins) {
      var all_staff = await Staff.find({ _id: { $in: val?.ApproveStaff } });
      for (var ele of all_staff) {
        ele.student_message = [];
        await ele.save();
      }
      console.log(i);
      i += 1;
      val.student_message = [];
      await val.save();
    }
    res.status(200).send({
      message: "Explore Institute Side Filtered Message Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderShuffledStaffQuery = async (req, res) => {
  try {
    const { id, shuffle_arr } = req.body;
    if (!shuffle_arr)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    if (shuffle_arr?.length > 0) {
      const institute = await InstituteAdmin.findById({ _id: id });
      institute.ApproveStaff = [];
      await institute.save();
      var i = 0;
      for (var val of shuffle_arr) {
        institute.ApproveStaff.push(val);
        const staff = await Staff.findById({ _id: `${val}` });
        staff.staffROLLNO = i + 1;
        i += 1;
        await staff.save();
      }
      await institute.save();
      res.status(200).send({
        message: "Explore Institute Wise Shuffling Query",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONTimeTableQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { excel_file, excel_count } = req.body;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const is_converted = await generate_excel_to_json_class_time_table_query(
      excel_file,
      excel_count
    );
    if (is_converted?.value) {
      for (var val of is_converted?.chapter_array) {
        await addTimeTableExcelQuery(val, cid);
      }
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.customGenerateInstituteLogsQuery = async (req, res) => {
  try {
    const inst = await InstituteAdmin.find({
      status: "Approved",
    });
    for (let st of inst) {
      if (st?._id) {
        if (st?.institute_log) {
        } else {
          console.log(st?._id);
          const lt = new InstituteLog({
            instituteId: st?._id,
          });
          st.institute_log = lt?._id;
          await Promise.all([lt.save(), st.save()]);
        }
      }
    }

    res.status(200).send({
      message: "All institute logs schema is created.",
    });
  } catch (e) {
    // console.log(e);
  }
};

exports.issueCertificateInstituteLogsQuery = async (req, res) => {
  try {
    const { gr, id } = req.params;

    const {
      certificate_type,
      certificate_attachment,
      is_dublicate,
      student_name,
      staffId,
      is_bonafide,
      certificate_bonafide_count,
    } = req.body;
    if (!gr || !id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const institute = await InstituteAdmin.findById({
      _id: id,
    });
    const validGR = await valid_initials(institute?.gr_initials, gr);
    if (!validGR)
      return res.status(200).send({ message: "I Think you lost in space" });

    if (is_bonafide) {
      institute.certificate_bonafide_count = certificate_bonafide_count;
      await institute.save();
    }
    const student = await Student.findOne({
      $and: [{ studentGRNO: `${validGR}` }, { institute: id }],
    });

    res.status(200).send({
      message: "All institute logs schema is created.",
    });

    if (institute?.institute_log && student?._id) {
      const i_log = await InstituteLog.findById(institute?.institute_log);
      const c_logs = new InstituteCertificateLog({
        instituteId: institute?._id,
        institute_log_id: i_log?._id,
        student_name: student_name,
        student: student?._id,
        certificate_attachment: certificate_attachment,
        certificate_type: certificate_type,
        certificate_issue_type: is_dublicate ? "Dublicate" : "Original",
      });
      if (staffId) {
        c_logs.issue_by_staff = staffId;
      } else {
        c_logs.issue_by_institute = "NIL";
      }
      i_log.certificate_logs.push(c_logs?._id);
      student.certificate_logs.push(c_logs?._id);
      await Promise.all([c_logs.save(), i_log.save(), student.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.customGenerateApplicationFormQuery = async (req, res) => {
  try {
    const { aid } = req.params;

    if (!aid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const new_app = await NewApplication.findById(aid).populate({
      path: "admissionAdmin",
      select: "institute",
    });
    if (new_app?.admissionAdmin?.institute) {
      for (let st of new_app?.receievedApplication) {
        if (st?.student) {
          const stu = await Student.findById(st?.student);
          await generateStudentAdmissionForm(
            st?.student,
            new_app?.admissionAdmin?.institute,
            `${stu?.studentFirstName ?? ""} ${stu?.studentLastName ?? ""}`,
            new_app?.applicationName
          );
        }
      }
      for (let st of new_app?.selectedApplication) {
        if (st?.student) {
          const stu = await Student.findById(st?.student);
          await generateStudentAdmissionForm(
            st?.student,
            new_app?.admissionAdmin?.institute,
            `${stu?.studentFirstName ?? ""} ${stu?.studentLastName ?? ""}`,
            new_app?.applicationName
          );
        }
      }
      for (let st of new_app?.FeeCollectionApplication) {
        if (st?.student) {
          const stu = await Student.findById(st?.student);
          await generateStudentAdmissionForm(
            st?.student,
            new_app?.admissionAdmin?.institute,
            `${stu?.studentFirstName ?? ""} ${stu?.studentLastName ?? ""}`,
            new_app?.applicationName
          );
        }
      }
      for (let st of new_app?.confirmedApplication) {
        if (st?.student) {
          const stu = await Student.findById(st?.student);
          await generateStudentAdmissionForm(
            st?.student,
            new_app?.admissionAdmin?.institute,
            `${stu?.studentFirstName ?? ""} ${stu?.studentLastName ?? ""}`,
            new_app?.applicationName
          );
        }
      }
      for (let st of new_app?.reviewApplication) {
        if (st?.student) {
          const stu = await Student.findById(st?.student);
          await generateStudentAdmissionForm(
            st?.student,
            new_app?.admissionAdmin?.institute,
            `${stu?.studentFirstName ?? ""} ${stu?.studentLastName ?? ""}`,
            new_app?.applicationName
          );
        }
      }
    }

    res.status(200).send({
      message: "All application form is created.",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.notExistStudentCertificateQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const {
      studentCertificateNo,
      leaving_date,
      bookNo,
      studentUidaiNumber,
      studentPreviousSchool,
      studentLeavingBehaviour,
      studentLeavingStudy,
      studentLeavingReason,
      studentRemark,
      instituteJoinDate,
      instituteLeavingDate,
      leaving_degree,
      leaving_since_date,
      leaving_course_duration,
      elective_subject_one,
      elective_subject_second,
      leaving_project_work,
      leaving_guide_name,
      lcRegNo,
      lcCaste,
      lcBirth,
      lcDOB,
      lcAdmissionDate,
      lcInstituteDate,
      leaving_student_name,
      leaving_nationality,
      leaving_religion,
      leaving_previous_school,
      leaving_certificate_attach,
      is_dublicate,

      certificate_type,
      certificate_attachment,
      student_name,
      staffId,
      certificate_original_leaving_count,
    } = req.body;
    const institute = await InstituteAdmin.findById({
      _id: id,
    });
    if (!is_dublicate && certificate_original_leaving_count) {
      institute.certificate_original_leaving_count =
        certificate_original_leaving_count;
    }

    const not_exist_certificate = new NotExistStudentCertificate({
      institute: id,
      studentCertificateNo: studentCertificateNo ?? "",
      leaving_date: leaving_date ?? "",
      studentBookNo: bookNo ?? "",
      studentUidaiNumber: studentUidaiNumber ?? "",
      studentPreviousSchool: studentPreviousSchool ?? "",
      studentLeavingBehaviour: studentLeavingBehaviour ?? "",
      studentLeavingStudy: studentLeavingStudy ?? "",
      studentLeavingReason: studentLeavingReason ?? "",
      studentRemark: studentRemark ?? "",
      instituteJoinDate: instituteJoinDate ?? "",
      leaving_degree: leaving_degree ?? "",
      leaving_since_date: leaving_since_date ?? "",
      leaving_course_duration: leaving_course_duration ?? "",
      elective_subject_one: elective_subject_one ?? "",
      elective_subject_second: elective_subject_second ?? "",
      leaving_project_work: leaving_project_work ?? "",
      leaving_guide_name: leaving_guide_name ?? "",
      lcRegNo: lcRegNo ?? "",
      lcCaste: lcCaste ?? "",
      lcBirth: lcBirth ?? "",
      lcDOB: lcDOB ?? "",
      lcAdmissionDate: lcAdmissionDate ?? "",
      lcInstituteDate: lcInstituteDate ?? "",
      leaving_student_name: leaving_student_name ?? "",
      leaving_nationality: leaving_nationality ?? "",
      leaving_religion: leaving_religion ?? "",
      leaving_previous_school: leaving_previous_school ?? "",
      leaving_certificate_attach: leaving_certificate_attach ?? "",
      certificate_type: certificate_type ?? "",
      certificate_attachment: certificate_attachment ?? "",
      is_dublicate: is_dublicate ? "Dublicate" : "Original",
    });

    if (instituteLeavingDate) {
      not_exist_certificate.studentLeavingInsDate = new Date(
        `${instituteLeavingDate}`
      );
    }

    institute.l_certificate_count += 1;
    institute.certificate_issued_count += 1;

    await Promise.all([not_exist_certificate.save(), institute.save()]);
    // Add Another Encryption
    res.status(200).send({
      message: "Student Leaving Certificate",
    });

    if (institute?.institute_log && not_exist_certificate?._id) {
      const i_log = await InstituteLog.findById(institute?.institute_log);
      const c_logs = new InstituteCertificateLog({
        instituteId: institute?._id,
        institute_log_id: i_log?._id,
        student_name: student_name,
        not_exist_student: not_exist_certificate?._id,
        certificate_attachment: certificate_attachment,
        certificate_type: certificate_type,
        certificate_issue_type: is_dublicate ? "Dublicate" : "Original",
        other_data: [
          {
            studentCertificateNo,
            leaving_date,
            bookNo,
            studentUidaiNumber,
            studentPreviousSchool,
            studentLeavingBehaviour,
            studentLeavingStudy,
            studentLeavingReason,
            studentRemark,
            instituteJoinDate,
            instituteLeavingDate,
            leaving_degree,
            leaving_since_date,
            leaving_course_duration,
            elective_subject_one,
            elective_subject_second,
            leaving_project_work,
            leaving_guide_name,
            lcRegNo,
            lcCaste,
            lcBirth,
            lcDOB,
            lcAdmissionDate,
            lcInstituteDate,
            leaving_student_name,
            leaving_nationality,
            leaving_religion,
            leaving_previous_school,
            leaving_certificate_attach,
            is_dublicate,

            certificate_type,
            certificate_attachment,
            student_name,
            staffId,
            certificate_original_leaving_count,
          },
        ],
      });
      if (staffId) {
        c_logs.issue_by_staff = staffId;
        not_exist_certificate.issue_by_staff = staffId;
      } else {
        c_logs.issue_by_institute = "NIL";
        not_exist_certificate.issue_by_institute = staffId;
      }

      i_log.certificate_logs.push(c_logs?._id);
      not_exist_certificate.certificate_logs.push(c_logs?._id);
      await Promise.all([
        c_logs.save(),
        i_log.save(),
        not_exist_certificate.save(),
      ]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.notExistStudentInstituteProfileQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const institute = await InstituteAdmin.findById({
      _id: id,
    }).select(
      "insName insAddress certificate_issued_count insState studentFormSetting.previousSchoolAndDocument.previousSchoolDocument insEditableText_one insEditableText_two insDistrict insAffiliated insEditableText insEditableTexts insPhoneNumber insPincode photoId insProfilePhoto affliatedLogo insEmail leave_certificate_selection certificate_original_leaving_count"
    );

    res.status(200).send({
      message: "Student Leaving Certificate",
      institute: institute,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.certificateInstituteLogsListQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    var logs = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      logs = await InstituteCertificateLog.find({
        $and: [
          {
            instituteId: { $eq: `${id}` },
          },
          {
            student_name: { $regex: req.query.search, $options: "i" },
          },
        ],
      })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentProfilePhoto photoId",
        })
        .populate({
          path: "issue_by_staff",
          select:
            "staffFirstName staffMiddleName staffLastName staffROLLNO staffProfilePhoto photoId",
        })
        .select(
          "student_name student certificate_attachment certificate_issue_type certificate_type created_at issue_by_institute issue_by_staff"
        );
    } else {
      logs = await InstituteCertificateLog.find({
        $and: [
          {
            instituteId: { $eq: `${id}` },
          },
        ],
      })
        .sort({ created_at: -1 })
        .skip(dropItem)
        .limit(itemPerPage)
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentProfilePhoto photoId",
        })
        .populate({
          path: "issue_by_staff",
          select:
            "staffFirstName staffMiddleName staffLastName staffROLLNO staffProfilePhoto photoId",
        })
        .select(
          "student_name student certificate_attachment certificate_issue_type certificate_type created_at issue_by_institute issue_by_staff"
        );
    }
    res.status(200).send({
      message: "All institute logs schema is created.",
      logs: logs,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.customGenerateOneApplicationFormQuery = async (req, res) => {
  try {
    const { aid } = req.params;

    if (!aid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let new_app = await NewApplication.findById(aid).populate({
      path: "admissionAdmin",
      select: "institute",
    });

    if (new_app?.admissionAdmin?.institute) {
      res.status(200).send({
        message: "All application form is created.",
      });
      for (let st of new_app?.receievedApplication) {
        if (st?.student) {
          const stu = await Student.findById(st?.student);
          if (stu?._id) {
            if (stu?.application_print?.length > 0) {
            } else {
              await generateStudentAdmissionForm(
                stu?._id,
                new_app?.admissionAdmin?.institute,
                `${stu?.studentFirstName ?? ""} ${
                  stu?.studentMiddleName ?? ""
                } ${stu?.studentLastName ?? ""}`,
                new_app?.applicationName
              );
            }
          }
        }
      }
      for (let st of new_app?.selectedApplication) {
        if (st?.student) {
          const stu = await Student.findById(st?.student);
          if (stu?._id) {
            if (stu?.application_print?.length > 0) {
            } else {
              await generateStudentAdmissionForm(
                stu?._id,
                new_app?.admissionAdmin?.institute,
                `${stu?.studentFirstName ?? ""} ${
                  stu?.studentMiddleName ?? ""
                } ${stu?.studentLastName ?? ""}`,
                new_app?.applicationName
              );
            }
          }
        }
      }
      // for (let st of new_app?.FeeCollectionApplication) {
      //   if (st?.student) {
      //     const stu = await Student.findById(st?.student);
      //     if (stu?._id) {
      //       if (stu?.application_print?.length > 0) {
      //       } else {
      //         await generateStudentAdmissionForm(
      //           stu?._id,
      //           new_app?.admissionAdmin?.institute,
      //           `${stu?.studentFirstName ?? ""} ${
      //             stu?.studentMiddleName ?? ""
      //           } ${stu?.studentLastName ?? ""}`,
      //           new_app?.applicationName
      //         );
      //       }
      //     }
      //   }
      // }
      // for (let st of new_app?.confirmedApplication) {
      //   if (st?.student) {
      //     const stu = await Student.findById(st?.student);
      //     if (stu?._id) {
      //       if (stu?.application_print?.length > 0) {
      //       } else {
      //         await generateStudentAdmissionForm(
      //           stu?._id,
      //           new_app?.admissionAdmin?.institute,
      //           `${stu?.studentFirstName ?? ""} ${
      //             stu?.studentMiddleName ?? ""
      //           } ${stu?.studentLastName ?? ""}`,
      //           new_app?.applicationName
      //         );
      //       }
      //     }
      //   }
      // }
      // for (let st of new_app?.reviewApplication) {
      //   if (st) {
      //     const stu = await Student.findById(st);
      //     if (stu?._id) {
      //       if (stu?.application_print?.length > 0) {
      //       } else {
      //         await generateStudentAdmissionForm(
      //           stu?._id,
      //           new_app?.admissionAdmin?.institute,
      //           `${stu?.studentFirstName ?? ""} ${
      //             stu?.studentMiddleName ?? ""
      //           } ${stu?.studentLastName ?? ""}`,
      //           new_app?.applicationName
      //         );
      //       }
      //     }
      //   }
      // }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.customGenerateCheckAllApplicationFormQuery = async (req, res) => {
  try {
    const { aid } = req.params;

    if (!aid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    // console.log("Hit");
    let not_generate_student_list = [];
    let a_app = [];
    let all_app = [];
    const admission = await Admission.findById(aid);
    all_app = await NewApplication.find({
      $and: [
        {
          admissionAdmin: { $eq: `${aid}` },
        },
        {
          applicationStatus: { $eq: "Ongoing" },
        },
        {
          applicationTypeStatus: { $eq: "Normal Application" },
        },
      ],
    });
    // all_app = await NewApplication.findById("666a78c330ee0b50462c00ef");

    for (let i = 0; i < all_app?.length; i++) {
      // for (let dfg of all_app) {
      // let new_app = all_app;
      let new_app = all_app[i];
      // let new_app = dfg;
      a_app.push(new_app?.applicationName);
      console.log(new_app?.applicationName);
      if (
        false
        // new_app?.applicationName === "F.Y. M.Sc (Analytical Chemistry - 2024-25)"
      ) {
      } else {
        if (admission?.institute) {
          for (let st of new_app?.receievedApplication) {
            if (st?.student) {
              const stu = await Student.findById(st?.student);
              if (stu?._id) {
                if (stu?.application_print?.length > 0) {
                } else {
                  not_generate_student_list.push(stu?._id);
                  await generateStudentAdmissionForm(
                    stu?._id,
                    admission?.institute,
                    `${stu?.studentFirstName ?? ""} ${
                      stu?.studentMiddleName ?? ""
                    } ${stu?.studentLastName ?? ""}`,
                    new_app?.applicationName
                  );
                }
              }
            }
          }
          for (let st of new_app?.selectedApplication) {
            if (st?.student) {
              const stu = await Student.findById(st?.student);
              if (stu?._id) {
                if (stu?.application_print?.length > 0) {
                } else {
                  not_generate_student_list.push(stu?._id);
                  await generateStudentAdmissionForm(
                    stu?._id,
                    admission?.institute,
                    `${stu?.studentFirstName ?? ""} ${
                      stu?.studentMiddleName ?? ""
                    } ${stu?.studentLastName ?? ""}`,
                    new_app?.applicationName
                  );
                }
              }
            }
          }
          for (let st of new_app?.FeeCollectionApplication) {
            if (st?.student) {
              const stu = await Student.findById(st?.student);
              if (stu?._id) {
                if (stu?.application_print?.length > 0) {
                } else {
                  not_generate_student_list.push(stu?._id);
                  await generateStudentAdmissionForm(
                    stu?._id,
                    admission?.institute,
                    `${stu?.studentFirstName ?? ""} ${
                      stu?.studentMiddleName ?? ""
                    } ${stu?.studentLastName ?? ""}`,
                    new_app?.applicationName
                  );
                }
              }
            }
          }
          for (let st of new_app?.confirmedApplication) {
            if (st?.student) {
              const stu = await Student.findById(st?.student);
              if (stu?._id) {
                if (stu?.application_print?.length > 0) {
                } else {
                  not_generate_student_list.push(stu?._id);
                  await generateStudentAdmissionForm(
                    stu?._id,
                    admission?.institute,
                    `${stu?.studentFirstName ?? ""} ${
                      stu?.studentMiddleName ?? ""
                    } ${stu?.studentLastName ?? ""}`,
                    new_app?.applicationName
                  );
                }
              }
            }
          }
          for (let st of new_app?.reviewApplication) {
            if (st) {
              const stu = await Student.findById(st);
              if (stu?._id) {
                if (stu?.application_print?.length > 0) {
                } else {
                  not_generate_student_list.push(stu?._id);
                  await generateStudentAdmissionForm(
                    stu?._id,
                    admission?.institute,
                    `${stu?.studentFirstName ?? ""} ${
                      stu?.studentMiddleName ?? ""
                    } ${stu?.studentLastName ?? ""}`,
                    new_app?.applicationName
                  );
                }
              }
            }
          }
          for (let st of new_app?.allottedApplication) {
            if (st) {
              const stu = await Student.findById(st?.student);
              if (stu?._id) {
                if (stu?.application_print?.length > 0) {
                } else {
                  not_generate_student_list.push(stu?._id);
                  await generateStudentAdmissionForm(
                    stu?._id,
                    admission?.institute,
                    `${stu?.studentFirstName ?? ""} ${
                      stu?.studentMiddleName ?? ""
                    } ${stu?.studentLastName ?? ""}`,
                    new_app?.applicationName
                  );
                }
              }
            }
          }
        }
      }
    }

    res.status(200).send({
      message: "All application form is created.",
      not_generate_student_list: not_generate_student_list,
      a_app: a_app,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.customGenerateCheckAllPayReceiptQuery = async (req, res) => {
  try {
    const { aid } = req.params;

    if (!aid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let not_generate_student_list = [];
    let a_app = [];
    let all_app = [];
    const admission = await Admission.findById(aid).populate({
      path: "institute",
      populate: {
        path: "financeDepart",
        select: "show_receipt",
      },
      select: "_id financeDepart",
    });
    all_app = await NewApplication.find({
      $and: [
        {
          admissionAdmin: { $eq: `${aid}` },
        },
        {
          applicationStatus: { $eq: "Ongoing" },
        },
        {
          applicationTypeStatus: { $eq: "Normal Application" },
        },
      ],
    });
    console.log(
      "admission",
      admission?.institute?.financeDepart?.[0]?.show_receipt
    );
    for (let dfg of all_app) {
      let new_app = dfg;
      a_app.push(new_app?.applicationName);
      console.log(new_app?.applicationName);
      if (admission?.institute?._id) {
        // for (let st of new_app?.confirmedApplication) {
        //   if (st?.student) {
        //     const stu = await Student.findById(st?.student).populate({
        //       path: "fee_receipt",
        //     });
        //     if (stu?._id && stu?.fee_receipt?.length > 0) {
        //       for (let dgt of stu?.fee_receipt) {
        //         if (dgt?.receipt_file) {
        //         } else {
        //           not_generate_student_list.push(dgt?._id);
        //           // if (
        //           //   admission?.institute?.financeDepart?.[0]?.show_receipt ===
        //           //   "Normal"
        //           // ) {
        //           //   await admissionFeeReceipt(dgt?._id, new_app?._id);
        //           // } else if (
        //           //   admission?.institute?.financeDepart?.[0]?.show_receipt ===
        //           //   "Society"
        //           // ) {
        //           //   await societyAdmissionFeeReceipt(
        //           //     dgt?._id,
        //           //     admission?.institute?._id
        //           //   );
        //           // } else {
        //           //   console.log("null");
        //           // }
        //         }
        //       }
        //     }
        //   }
        // }

        for (let st of new_app?.reviewApplication) {
          if (st) {
            const stu = await Student.findById(st).populate({
              path: "fee_receipt",
            });
            if (stu?._id && stu?.fee_receipt?.length > 0) {
              for (let dgt of stu?.fee_receipt) {
                console.log(dgt);
                if (dgt?.receipt_file) {
                } else {
                  not_generate_student_list.push(dgt?._id);

                  // if (
                  //   admission?.institute?.financeDepart?.[0]?.show_receipt ===
                  //   "Normal"
                  // ) {
                  //   await admissionFeeReceipt(dgt?._id, new_app?._id);
                  // } else if (
                  //   admission?.institute?.financeDepart?.[0]?.show_receipt ===
                  //   "Society"
                  // ) {
                  //   await societyAdmissionFeeReceipt(
                  //     dgt?._id,
                  //     admission?.institute?._id
                  //   );
                  // } else {
                  //   console.log("null");
                  // }
                }
              }
            }
          }
        }
      }
    }

    res.status(200).send({
      message: "All application form is created.",
      not_generate_student_list: not_generate_student_list,
      a_app: a_app,
    });
  } catch (e) {
    console.log(e);
  }
};

// for generated duumy pdf
exports.generateDummyPdfQuery = async (req, res) => {
  try {
    // await staffLeaveRequest();
    // await combinedBankDaybook();
    // await combinedSummaryBankDaybook();
    await combinedSummaryDetailBankDaybook();
    // await staffLeaveRequestReport(
    //   "670da804c26612d9989c7917",
    //   "651ba22de39dbdf817dd520c"
    // );

    res.status(200).send({
      message: "Dummy pdf generate",
    });
  } catch (e) {
    console.log(e);
  }
};
// for insert department status
exports.insertDepartmentStatusQuery = async (req, res) => {
  try {
    const dept = await Department.find({});
    // const dept = await Department.findById("64a7a847a59e4e19fe7cff4f");

    let list = [];
    if (dept?.length > 0) {
      for (let i = 0; i < dept?.length; i++) {
        console.log(i);
        let dt = dept[i];
        if (dt?.department_status) {
        } else {
          list.push(dt?._id);
          dt.department_status = "Normal";
          await dt.save();
        }
      }
    }
    res.status(200).send({
      message: "Inserted data to department",
      list: dept?.length,
      dt: list,
      // dept: dept.department_status,
    });
  } catch (e) {
    console.log(e);
  }
};

// for setting control of student fill form or not

exports.certificateLeavingStudentFormSettingQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { certificate_leaving_form_student } = req.body;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const institute = await InstituteAdmin.findById(id);

    institute.certificate_leaving_form_student =
      certificate_leaving_form_student;
    await institute.save();
    res.status(200).send({
      message: "Certificate setting form updated",
    });
  } catch (e) {
    console.log(e);
  }
};

// for hostel all application form
exports.customGenerateCheckHostelAllApplicationFormQuery = async (req, res) => {
  try {
    const { hid } = req.params;

    if (!hid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let not_generate_student_list = [];
    let a_app = [];
    let all_app = [];
    const hostel = await Hostel.findById(hid);
    // all_app = await NewApplication.find({
    //   $and: [
    //     {
    //      _id: { $in: hostel?.newApplication },
    //     },
    //     {
    //       applicationStatus: { $eq: "Ongoing" },
    //     },
    //     {
    //       applicationTypeStatus: { $eq: "Normal Application" },
    //     },
    //     {
    //      application_flow: "Hostel Application"
    //     },
    //   ],
    // });
    all_app = await NewApplication.findById("66a924421e1bc45b685554c7");
    // for (let i = 0; i < all_app?.length; i++) {
    // for (let dfg of all_app) {
    let new_app = all_app;
    // let new_app = all_app[i];
    // let new_app = dfg;
    a_app.push(new_app?.applicationName);
    console.log(new_app?.applicationName);
    if (
      false
      // new_app?.applicationName === "F.Y. M.Sc (Analytical Chemistry - 2024-25)"
    ) {
    } else {
      if (hostel?.institute) {
        for (let st of new_app?.receievedApplication) {
          if (st?.student) {
            const stu = await Student.findById(st?.student);
            if (stu?._id) {
              if (stu?.application_print?.length > 0) {
              } else {
                console.log("Application");
                not_generate_student_list.push(stu?._id);
                await generateStudentAdmissionForm(
                  stu?._id,
                  hostel?.institute,
                  `${stu?.studentFirstName ?? ""} ${
                    stu?.studentMiddleName ?? ""
                  } ${stu?.studentLastName ?? ""}`,
                  new_app?.applicationName
                );
              }
            }
          }
        }
        for (let st of new_app?.selectedApplication) {
          if (st?.student) {
            const stu = await Student.findById(st?.student);
            if (stu?._id) {
              if (stu?.application_print?.length > 0) {
              } else {
                console.log("Document");

                not_generate_student_list.push(stu?._id);
                await generateStudentAdmissionForm(
                  stu?._id,
                  hostel?.institute,
                  `${stu?.studentFirstName ?? ""} ${
                    stu?.studentMiddleName ?? ""
                  } ${stu?.studentLastName ?? ""}`,
                  new_app?.applicationName
                );
              }
            }
          }
        }
        for (let st of new_app?.FeeCollectionApplication) {
          if (st?.student) {
            const stu = await Student.findById(st?.student);
            if (stu?._id) {
              if (stu?.application_print?.length > 0) {
              } else {
                console.log("FEE");

                not_generate_student_list.push(stu?._id);
                await generateStudentAdmissionForm(
                  stu?._id,
                  hostel?.institute,
                  `${stu?.studentFirstName ?? ""} ${
                    stu?.studentMiddleName ?? ""
                  } ${stu?.studentLastName ?? ""}`,
                  new_app?.applicationName
                );
              }
            }
          }
        }
        for (let st of new_app?.confirmedApplication) {
          if (st?.student) {
            const stu = await Student.findById(st?.student);
            if (stu?._id) {
              if (stu?.application_print?.length > 0) {
              } else {
                console.log("CONFIRM");

                not_generate_student_list.push(stu?._id);
                await generateStudentAdmissionForm(
                  stu?._id,
                  hostel?.institute,
                  `${stu?.studentFirstName ?? ""} ${
                    stu?.studentMiddleName ?? ""
                  } ${stu?.studentLastName ?? ""}`,
                  new_app?.applicationName
                );
              }
            }
          }
        }
        for (let st of new_app?.reviewApplication) {
          if (st) {
            const stu = await Student.findById(st);
            if (stu?._id) {
              if (stu?.application_print?.length > 0) {
              } else {
                console.log("REVIEW");

                not_generate_student_list.push(stu?._id);
                await generateStudentAdmissionForm(
                  stu?._id,
                  hostel?.institute,
                  `${stu?.studentFirstName ?? ""} ${
                    stu?.studentMiddleName ?? ""
                  } ${stu?.studentLastName ?? ""}`,
                  new_app?.applicationName
                );
              }
            }
          }
        }
      }
    }
    // }

    res.status(200).send({
      message: "All application form is created.",
      not_generate_student_list: not_generate_student_list,
      a_app: a_app,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.spceAllFeeReceiptReGenrateQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var nums = [];
    const institute = await InstituteAdmin.findById(id);
    console.log(institute?.ApproveStudent?.[0]);
    if (institute?.ApproveStudent?.length > 0) {
      for (let stu of institute?.ApproveStudent) {
        const student = await Student.findById(stu);
        console.log(student?._id);
        if (student?.remainingFeeList?.length > 0) {
          for (let remain of student?.remainingFeeList) {
            const re_list = await RemainingList.findById(remain);
            if (re_list?.applicable_card) {
              const app_ca = await NestedCard.findById({
                _id: re_list?.applicable_card,
              });
              if (app_ca?.remaining_array?.length > 0) {
                for (let r_inner of app_ca?.remaining_array) {
                  if (r_inner?.fee_receipt) {
                    await normalAdmissionFeeReceipt(
                      r_inner?.fee_receipt,
                      r_inner?.appId
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
    res.status(200).send({ message: "DONE" });
  } catch (e) {
    console.log(e);
  }
};

exports.customGenerateOneStudentApplicationFormQuery = async (req, res) => {
  try {
    const { aid, appId, sid } = req.params;

    if (!aid || !appId || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let all_app = null;
    const admission = await Admission.findById(aid);
    all_app = await NewApplication.findById(appId);
    let new_app = all_app;
    console.log(new_app?.applicationName);
    if (admission?.institute) {
      if (sid) {
        const stu = await Student.findById(sid);
        if (stu?._id) {
          if (stu?.application_print?.length > 0) {
          } else {
            await generateStudentAdmissionForm(
              stu?._id,
              admission?.institute,
              `${stu?.studentFirstName ?? ""} ${stu?.studentMiddleName ?? ""} ${
                stu?.studentLastName ?? ""
              }`,
              new_app?.applicationName
            );
          }
        }
      }
    }

    res.status(200).send({
      message: "All application form is created.",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.customAmountStudentOtherFeeReceiptQuery = async (req, res) => {
  try {
    const { ofid } = req.params;
    if (!ofid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const other_fee = await OtherFees.findById(ofid).populate({
      path: "finance",
      select: "institute",
    });
    let list = [...other_fee?.paid_students];

    let all_student = await Student.find({ _id: { $in: list } })
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO studentROLLNO qviple_student_pay_id other_fees_remain_price other_fees_obj other_fees_paid_price"
      )
      .populate({
        path: "other_fees",
        populate: {
          path: "fee_receipt fees",
          select: "receipt_file fee_payment_amount payable_amount",
        },
      });

    let all_fee_receipt = [];
    for (let ele of all_student) {
      for (let val of ele?.other_fees) {
        if (`${val?.fees?._id}` === `${other_fee?._id}` && val?.fee_receipt) {
          all_fee_receipt.push(val?.fee_receipt?._id);
        }
      }
    }
    let i = 0;
    if (other_fee?.finance?.institute) {
      if (all_fee_receipt?.length > 0) {
        for (let frid of all_fee_receipt) {
          await studentOtherFeeReceipt(frid, other_fee?.finance?.institute);
          i += 1;
          console.log(i);
        }
      }
    }

    res.status(200).send({
      message: "Miscellaneous Fee receipt amount changes.",
      count: all_fee_receipt?.length,
      all_fee_receipt: all_fee_receipt,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.certificate_bonafide_dublicate_query = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_dublicate_bonafide } = req.body;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const institute = await InstituteAdmin.findById(id);
    institute.is_dublicate_bonafide = is_dublicate_bonafide;
    await institute.save();
    res.status(200).send({
      message: "Data updated successfully.",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

// const all_student = await Student.find({
//   _id: { $in: valid_ins?.ApproveStudent },
// });
// let list_1 = {
//   HINDU: "Hindu",
//   MUSLIM: "Muslim",
//   SIKH: "Sikh",
//   CHRISTIAN: "Christian",
//   PARSI: "Parsi",
//   JEWS: "Jews",
//   "INDIGENOUS FAITH": "Indigenous Faith",
//   BUDDHISM: "Buddhism",
//   JAINISM: "Jainism",
//   OTHER: "Other",
// };
// let list_2 = {
//   HINDU: "General",
//   OBC: "OBC",
//   SC: "SC",
//   ST: "ST",
//   "NT-A": "NT-A",
//   "NT-B": "NT-B",
//   "NT-C": "NT-C",
//   "NT-D": "NT-D",
//   VJ: "VJ",
//   SBC: "SBC",
// };
// let i = 0;
// for (let ele of all_student) {
//   ele.studentNationality = "Indian";
//   ele.studentReligion = `${list_1[`${ele?.studentReligion}`]}`;
//   ele.studentCastCategory = `${list_2[`${ele?.studentCastCategory}`]}`;
//   await ele.save();
//   console.log(
//     i,
//     ele.studentNationality,
//     ele.studentReligion,
//     ele.studentCastCategory
//   );
//   i += 1;
// }
// res.status(200).send({ message: "Done" });

const auto_society_receipt_generate_query = async (list) => {
  try {
    if (list?.length === 0) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    if (list?.length > 0) {
      let i = 0;
      for (let rt of list) {
        await societyAdmissionFeeReceipt(rt?.frid, rt?.instituteId);
        ++i;
        console.log(i);
      }
    }
    res.status(200).send({
      message: "Miscellaneous Fee receipt amount changes.",
    });
  } catch (e) {
    console.log(e);
  }
};

// for certificate authority -> changes

exports.student_bonafide_detail_query = async (req, res) => {
  try {
    const { sid } = req.params;
    const { id } = req.query;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let student = await Student.findById(sid)
      .select(
        "studentFirstName studentGRNO studentMiddleName  studentLastName studentProfilePhoto studentDOB student_bonafide"
      )
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      })
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "institute",
        select:
          "insName insAddress insPhoneNumber insEmail insEditableText_one insEditableText_two insProfilePhoto affliatedLogo authority_signature autority_stamp_profile insAffiliated is_dublicate_bonafide certificate_bonafide_count authority",
      });

    if (student?.institute) {
    } else {
      const inst = await InstituteAdmin.findById(id).select(
        "insName insAddress insPhoneNumber insEmail insEditableText_one insEditableText_two insProfilePhoto affliatedLogo authority_signature autority_stamp_profile insAffiliated is_dublicate_bonafide certificate_bonafide_count authority"
      );
      student.institute = inst;
    }
    res.status(200).send({
      message: "Data updated successfully.",
      access: true,
      student: student,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.student_bonafide_update_detail_query = async (req, res) => {
  try {
    const { sid } = req.params;
    const {
      student_bonafide,
      isLogs,
      certificate_type,
      certificate_attachment,
      student_name,
      staffId,
      certificate_bonafide_count,
      instituteId,
    } = req.body;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    await Student.findByIdAndUpdate(sid, { student_bonafide });

    if (isLogs) {
      const institute = await InstituteAdmin.findById(instituteId);
      institute.certificate_bonafide_count = certificate_bonafide_count;
      await institute.save();
      const student = await Student.findById(sid);
      if (institute?.institute_log && student?._id) {
        const i_log = await InstituteLog.findById(institute?.institute_log);
        const c_logs = new InstituteCertificateLog({
          instituteId: institute?._id,
          institute_log_id: i_log?._id,
          student_name: student_name,
          student: student?._id,
          certificate_attachment: certificate_attachment,
          certificate_type: certificate_type,
          certificate_issue_type: "",
          other_data: [student_bonafide],
        });
        if (staffId) {
          c_logs.issue_by_staff = staffId;
        } else {
          c_logs.issue_by_institute = "NIL";
        }
        i_log.certificate_logs.push(c_logs?._id);
        student.certificate_logs.push(c_logs?._id);
        await Promise.all([c_logs.save(), i_log.save(), student.save()]);
        res.status(200).send({
          message: "Data updated successfully.",
          access: true,
        });
      }
    } else {
      res.status(200).send({
        message: "Data updated successfully.",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.customOneStudentOtherFeeReceiptQuery = async (req, res) => {
  try {
    const { frid, id } = req.params;
    if (!frid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    await studentOtherFeeReceipt(frid, id);
    res.status(200).send({
      message: "Miscellaneous Fee receipt amount changes.",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.institute_student_login_detail_query = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    let students = [];

    const user = await User.findById(uid);
    let staff_id = null;
    staff_id = user?.staff?.[0];

    if (staff_id) {
      const staff = await Staff.findById(staff_id);

      if (!["", undefined, ""]?.includes(req.query?.search)) {
        students = await Student.find({
          $and: [
            {
              institute: { $eq: `${staff?.institute}` },
            },
            {
              $or: [
                {
                  studentFirstName: { $regex: req.query.search, $options: "i" },
                },
                {
                  studentMiddleName: {
                    $regex: req.query.search,
                    $options: "i",
                  },
                },
                {
                  studentLastName: { $regex: req.query.search, $options: "i" },
                },
                {
                  studentGRNO: { $regex: req.query.search, $options: "i" },
                },
              ],
            },
          ],
        })
          .populate({
            path: "user",
            select: "userPhoneNumber userEmail",
          })
          .populate({
            path: "parents_user",
            select: "userPhoneNumber userEmail",
          })
          .select(
            "studentFirstName studentLastName studentMiddleName studentGRNO studentProfilePhoto studentParentsPhoneNumber studentParentsEmail"
          );
      } else {
        students = await Student.find({
          institute: { $eq: `${staff?.institute}` },
        })
          .populate({
            path: "user",
            select: "userPhoneNumber userEmail",
          })
          .populate({
            path: "parents_user",
            select: "userPhoneNumber userEmail",
          })
          .select(
            "studentFirstName studentLastName studentMiddleName studentGRNO studentProfilePhoto studentParentsPhoneNumber studentParentsEmail"
          )
          .skip(dropItem)
          .limit(itemPerPage);
      }
    }

    res.status(200).send({
      message: "One Institute student login details",
      access: true,
      students: students,
    });
  } catch (e) {
    console.log(e);
  }
};
