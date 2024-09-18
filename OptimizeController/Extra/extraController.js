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
  generate_excel_to_json_biometric_query,
  generate_excel_to_json_staff_leave_query,
  generate_excel_to_json_fee_structure_exist_query,
  generate_excel_to_json_student_fees_mapping,
  generate_excel_to_json_staff_department,
  generate_excel_to_json_student_ongoing_query,
  generate_excel_to_json_spce,
  generate_excel_to_json_grno,
  generate_excel_to_json_roll_no_query,
} = require("../../Custom/excelToJSON");
const {
  retrieveInstituteDirectJoinQueryPayload,
  retrieveInstituteDirectJoinStaffAutoQuery,
  retrieveUnApprovedDirectJoinQuery,
  retrieveInstituteDirectJoinPayloadFeesQuery,
  retrieveDirectJoinAdmissionQueryApplication,
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
  renderGovernmentHeadsMoveGovernmentCardUpdateQuery,
  render_student_fees_mapping,
  spce_student_name_sequencing,
  retrieveInstituteNewGRNO,
} = require("../Admission/admissionController");
const {
  renderNewOfflineBookAutoQuery,
} = require("../Library/libraryController");
const Library = require("../../models/Library/Library");
const {
  retrieveEmailReplaceQuery,
  retrieveROLLGRNOReplaceQuery,
} = require("../Edit/studentMember");
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
const LMS = require("../../models/Leave/LMS");
const {
  fetchBiometricStaffQuery,
} = require("../../controllers/LMS/LMSController");
const {
  renderAutoStaffLeaveConfigQuery,
} = require("../../controllers/ComplaintLeaveTransfer/ComplaintController");
const {
  render_staff_add_department,
} = require("../../controllers/InstituteAdmin/InstituteController");
const { send_email_student_message_query } = require("../../helper/functions");
const NewApplication = require("../../models/Admission/NewApplication");
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
          "insName insAddress insState insDistrict insPhoneNumber insPincode photoId insProfilePhoto certificate_issued_count",
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
      reason,
      study,
      previous,
      l_date,
      behaviour,
      remark,
      uidaiNumber,
      bookNO,
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
        "studentFirstName studentLeavingPreviousYear studentEmail duplicate_copy applicable_fees_pending studentPreviousSchool studentLeavingBehaviour studentUidaiNumber studentGRNO studentMiddleName certificateLeavingCopy studentAdmissionDate studentReligion studentCast studentCastCategory studentMotherName studentNationality studentBirthPlace studentMTongue studentLastName photoId studentProfilePhoto studentDOB admissionRemainFeeCount"
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
          "insName insAddress certificate_issued_count insState studentFormSetting.previousSchoolAndDocument.previousSchoolDocument insEditableText_one insEditableText_two insDistrict insAffiliated insEditableText insEditableTexts insPhoneNumber insPincode photoId insProfilePhoto affliatedLogo insEmail",
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
      previous
    ) {
      student.studentPreviousSchool = previous ? previous : null;
    } else {
    }
    if (behaviour) {
      student.studentLeavingBehaviour = behaviour;
      if (institute?.original_copy) {
        student.duplicate_copy = "Duplicate Copy";
        // await student.save();
      }
    }
    if (study) {
      student.studentLeavingStudy = study;
    }
    if (reason) {
      student.studentLeavingReason = reason;
    }
    if (remark) {
      student.studentLeavingRemark = remark;
    }
    if (uidaiNumber) {
      student.studentUidaiNumber = uidaiNumber;
    }
    if (l_date) {
      student.studentLeavingInsDate = new Date(`${l_date}`);
    }
    if (bookNO) {
      student.studentBookNo = bookNO;
    }
    student.studentCertificateNo = institute.leavingArray.length + 1;
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
      var all_students = await Student.find({
        $and: [{ batches: { $in: sorted_batch } }],
      })
        .select(
          "studentClass batches department studentGender studentCastCategory"
        )
        .populate({
          path: "fee_structure",
        });
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
        "studentFirstName studentMiddleName remainingFeeList_count studentLastName studentDOB studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto admissionRemainFeeCount"
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
    var active_user = await User.findById({ _id: uid });
    const role =
      active_user?.staff?.length > 0
        ? active_user?.staff[0]
        : active_user?.student?.length > 0
        ? active_user?.student[0]
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
        .select("_id staffROLLNO staffStatus member_module_unique")
        .populate({
          path: "institute",
          select: "insName insProfilePhoto alias_pronounciation",
        });
      const active_student = await Student.findOne({
        _id: active_user?.active_member_role,
      })
        .select(
          "_id studentGRNO studentROLLNO studentStatus member_module_unique"
        )
        .populate({
          path: "institute",
          select: "insName insProfilePhoto alias_pronounciation",
        });
      if (active_staff) {
        res.status(200).send({
          message: "Active Role for Dashboard Feed 👻👻 (staff)",
          role: {
            activeRole: active_staff?._id,
            institute: active_staff?.institute ? active_staff?.institute : "",
            member: "Staff",
            active_role_data: active_staff,
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
            active_role_data: active_student,
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
    const {
      excel_file,
      excel_sheet_name,
      scholar_batch,
      excel_arr,
      excel_count,
    } = req.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_ads = await Admission.findById({ _id: aid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_ads?.institute}`,
    });
    // one_ins.excel_data_query.push({
    //   excel_file: excel_file,
    //   admissionId: one_ads?._id,
    //   status: "Uploaded",
    // });
    // await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    // const update_ins = await InstituteAdmin.findById({
    //   _id: `${one_ads?.institute}`,
    // });
    // var key;
    // for (var ref of update_ins?.excel_data_query) {
    //   if (
    //     `${ref.status}` === "Uploaded" &&
    //     `${ref?.admissionId}` === `${one_ads?._id}`
    //   ) {
    //     key = ref?.excel_file;
    //   }
    // }
    // const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_scholarship_query(
      excel_file,
      excel_count
    );
    if (is_converted?.value) {
      await renderAdmissionNewScholarNumberAutoQuery(
        is_converted?.scholar_array,
        one_ins?._id,
        excel_sheet_name,
        scholar_batch
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
    // const is_converted = await generate_excel_to_json_login_query(val);
    const is_converted = await generate_excel_to_json_roll_no_query(val);
    if (is_converted?.value) {
      // await retrieveEmailReplaceQuery(is_converted?.email_array);
      await retrieveROLLGRNOReplaceQuery(is_converted?.email_array);
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
    const { excel_file } = req.body;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_subject = await Subject.findById({ _id: sid });
    const one_class = await Class.findById({ _id: `${one_subject?.class}` });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_class?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      subjectId: one_subject?._id,
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
        `${ref?.subjectId}` === `${one_subject?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_subject_chapter_query(
      val
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
    const { from, type, flow, m_title, m_doc, status, message, filtered_arr } =
      req.body;
    const { id } = req.query;
    // let filtered_arr = [
    //   "6656ce1529964b9fb5f75ae5",
    //   "66582f889ec999ce933a05aa",
    //   "665abaaf18ce55bfd5477436",
    //   "665ac058464bdcfcb07243f7",
    //   "665c8005ed5b038fa0f158a1",
    //   "665d9b7b8ccb86845ad26198",
    //   "665dabc9a97704b262ff7dad",
    //   "665dd352b26286e0467f2adf",
    //   "665df274b26286e0467f8b33",
    //   "665eaa824e56f6f829390fca",
    //   "665ecb324e56f6f829399e85",
    //   "665ee9271be5a8add1621bbd",
    //   "665ef2b24e56f6f8293a3c72",
    //   "665f27344e56f6f8293aee26",
    //   "665f34a24e56f6f8293b1c62",
    //   "665f3af7fb6f986014a94c6e",
    //   "6660166cf9007de11abb5f93",
    //   "66602258a28b68b6a6b0befc",
    //   "666028aea28b68b6a6b0d68a",
    //   "66603eb6bb80a72ffb4025de",
    //   "6660409f5e93b28e7ece6beb",
    //   "6660526d5e93b28e7eceae8c",
    //   "6660799111db27577deb9767",
    //   "666093081409ddf7a9a81a08",
    //   "666098f3d8fd9817b7599e19",
    //   "66615710bd8e17f1d0ded9e1",
    //   "666160581409ddf7a9aa9c8d",
    //   "666166d31409ddf7a9aaba50",
    //   "66617128bd8e17f1d0df4844",
    //   "6661743c1409ddf7a9aaeecc",
    //   "666178e3bd8e17f1d0df644e",
    //   "6661807ed8fd9817b75c9931",
    //   "66618ae1d8fd9817b75cd36a",
    //   "6661a0e0c7ceb9826cbda63d",
    //   "6661b45a1def169acf9e1624",
    //   "6661b6af40f1f8d0d05c7c10",
    //   "6661c7ac1def169acf9e56c5",
    //   "6661d970c7ceb9826cbe68e2",
    //   "6661f885d3fc4fd9ec0df86e",
    //   "6662a1e60fa8694c41012771",
    //   "6662c17aa80c442208869617",
    //   "6662f6d32b6eda008620df5e",
    //   "6663dec1d2e6080fa5768e9a",
    //   "6663eb3115c994e9112bc445",
    //   "666412a0d52ac4bcf89f2ed5",
    //   "66642db3d52ac4bcf89fa0bb",
    //   "66643184e6dd6bbe8831fcac",
    //   "66643b1dc158f217f7fccf21",
    //   "66646225e6dd6bbe8832b321",
    //   "66667707c158f217f703ca85",
    //   "6666b6c10cc627f95e9bec1d",
    //   "6666c89abc3db0d80c0dfbcd",
    //   "6666cc20bc3db0d80c0e0e15",
    //   "6666f007b8e26221ed03c701",
    //   "66670d020cc627f95e9d4d52",
    //   "66670dfa28e88af96d97d092",
    //   "6667dfa652df1d457f74bf8d",
    //   "6667e4be98c7a5e7d2f5da01",
    //   "6667eeaa98c7a5e7d2f6074e",
    //   "6667f3e998c7a5e7d2f61ed8",
    //   "666809295f25de64033f391d",
    //   "666819c55f25de64033f7b34",
    //   "6668395dda6c6b8cb8970d40",
    //   "66686c1ae48bba3b26abe321",
    //   "666879b2e48bba3b26ac1844",
    //   "66696c481c39d8fc5b365c2e",
    //   "6669737f1c39d8fc5b367baf",
    //   "666975971c39d8fc5b368777",
    //   "66697e2cd280c1168458eb1e",
    //   "6669873bd280c11684591f17",
    //   "6669be4dfe9467d95ea508ed",
    //   "666a6d050e3e6a9642379b7d",
    //   "666a7985fe9467d95ea76931",
    //   "666a9ff302ff881cc541e128",
    //   "666aaf6fd5db98ae0768227c",
    //   "666ab442d5db98ae07683a69",
    //   "666ab449a16abb6db062d92d",
    //   "666ac385a16abb6db0633974",
    //   "666ac46e2921e51fb3fa54ae",
    //   "666ac91ea16abb6db0635363",
    //   "666ad2a8a16abb6db0638543",
    //   "666adcccd5db98ae0768e7a2",
    //   "666b0530138be86d66628fd9",
    //   "666b1bdd438f32cf20307acf",
    //   "666b2c41438f32cf2030b4c6",
    //   "666b3a8f438f32cf2030e542",
    //   "666b3bf9ec9d76b6d3cb2645",
    //   "666bd4402d36f1c277295670",
    //   "666bdf1623dd2820dd62b970",
    //   "666bf31fefc9a9ca58883c4e",
    //   "666bff58efc9a9ca58887bf9",
    //   "666c20e14272e4c6bdea13f7",
    //   "666c899aeac388f0cf614446",
    //   "666d27169e6c6bd4d987fced",
    //   "666d3c02dfd5c437cd147cc2",
    //   "666d62e15c4f7459889fbf3c",
    //   "666da43f1312e70be5b04a69",
    //   "666db3dc9b434b407b86231b",
    //   "666e86b29b434b407b88b761",
    //   "66709982a19b4cd82b3ccd84",
    //   "667128fe16b6737bef10cc17",
    //   "6671370faca0ae8d1780c9b6",
    //   "667137e245e9ff510271d6b7",
    //   "66713e4baca0ae8d1780ff14",
    //   "66715c83a1a3cc99e82d2062",
    //   "66724f06faa2f3812c7419b6",
    //   "66729065b570d87a939cd303",
    //   "6672a5a28b7a4d809f437b1d",
    //   "6672b8d5d23058c26673bd6f",
    //   "6673c1fa6c3f5b158e11681b",
    //   "6673d3b1ad0c9e364e4214a5",
    //   "6673e5916c3f5b158e121c20",
    //   "6673ef56b7e10e457d4847f9",
    //   "6673f52a7c5d6b9d3cd313d8",
    //   "6673f78413645f6224f2217b",
    //   "66741e3ebd16a01f536121ab",
    //   "66745471da1297a6b9fb33dc",
    //   "66745cefda1297a6b9fb51b0",
    //   "66753973da1297a6b9fea451",
    //   "66753a9d5c211c4bd533ff4c",
    //   "66753bdc1c20990d18a7763f",
    //   "66753caab3d60fc2b752d798",
    //   "66753dd4b3d60fc2b752e182",
    //   "6675559e5c211c4bd53464ee",
    //   "66755797da1297a6b9ff3aa2",
    //   "66759331b3d60fc2b7543864",
    //   "66766d2a7ea072004fc28542",
    //   "6676766b7ea072004fc2acd9",
    //   "66767d097ea072004fc2c5d2",
    //   "667684b87ea072004fc2e400",
    //   "6676953b989882e0a0d3e017",
    //   "6676ca26989882e0a0d517fc",
    //   "6677d87e989882e0a0d85f84",
    //   "6677f757989882e0a0d8bebd",
    //   "66781e59ee0e2299fa84f6fa",
    //   "6678d4bee17fbc67e9bb1578",
    //   "667911287ea072004fcafa78",
    //   "66792f6105df9220695c9bbb",
    //   "6679385106a14571750788e3",
    //   "667a632b555015ac8b9457f8",
    //   "667a69d6f4345c2cc2b5d9d0",
    //   "667a73b8555015ac8b94d618",
    //   "667a93692b6329957434e933",
    //   "667bc3967964c3659bf3e03f",
    //   "667bcdc1f24213817285b950",
    //   "667be651a5150095b400630c",
    //   "667bf8ad20f96b70dfd674ae",
    //   "667c4175a5150095b401a0ab",
    //   "667c45d3bbe771f8e623b0eb",
    //   "667d2491d39a6374758dfde4",
    //   "667d2d0962f9a83c4fb71464",
    //   "667d475eaf9960bc6dcc0532",
    //   "667e7c1f1bfb2ab496849c02",
    //   "667e8a17059be654d96d8422",
    //   "667e90158e98c62147595059",
    //   "667fae4fee0f23e006d866d9",
    //   "667fbe21c17a9d33ac48e9b6",
    //   "667fc156c17a9d33ac48f8f9",
    //   "667fec386fd3780d125210a8",
    //   "66800763c1775c56bcd14ca1",
    //   "668032c804076da2fc5b8a40",
    //   "6680f80cee0f23e006dd2ed1",
    //   "668256afee0f23e006e1c8f4",
    //   "6682db0aee0f23e006e3f41d",
    //   "6683a40076fdc6699a9e79e1",
    //   "6683cadd1727c9dcd1fc79ff",
    //   "66843f2c4efef56be5f20ad7",
    //   "6684d7bacf9bf8669c0bc071",
    //   "66851d41d4ae35ef88346c49",
    //   "66852078d4ae35ef88347d7a",
    //   "66852273cf9bf8669c0d838e",
    //   "66862e56d9cbacccf38942c5",
    //   "668634d8b64eaf34e5d40ab5",
    //   "66864ae348bcd4555dd18411",
    //   "6686691c48bcd4555dd22a1d",
    //   "6687799bb98831af264360b5",
    //   "6687adbc63ba2315c810646f",
    //   "6687b2ddd1459abc544bf8c5",
    //   "6687ce8f48eb32b9827792d8",
    //   "6689575cd4c7c23438df4116",
    //   "668b8e5ad65eae5968f42ace",
    //   "668b8f7d5edce44b8a94935e",
    //   "668b9d97ac8f75226373713a",
    //   "668b9f99ac8f7522637382aa",
    //   "668ba8bd6653a6da93fe4a58",
    //   "668bb3aeb11c7a84ed165bbf",
    //   "668bbb35df6857f1eedd65a6",
    //   "668bd812df6857f1eedddb7e",
    //   "668be97b3e289ec0d82df62c",
    //   "668c1408f4df9a2423b5b112",
    //   "668e5f83f45ccd2d45d283e6",
    //   "668e67a0174d39813bb49437",
    //   "668e9cc1fb0b885654835953",
    //   "668f85a6a85cb7aa8dc4cf2d",
    //   "668f963fd8e2ed1572b11eea",
    //   "6690eab2cc7120d68e9d1aeb",
    //   "6690f7a44ce9bedd7ca37b75",
    //   "669113def9ff4f5425010a4c",
    //   "66923a50c5a562fb09733bbd",
    //   "66923a56c5a562fb09733d13",
    //   "669244b50eef71695bf1e02e",
    //   "6692489b24e69e561f1a9716",
    //   "669266188f03eab7184b94ec",
    //   "6693869d8f03eab7184f2e13",
    //   "6694c78109d5d3ffeaba8fc5",
    //   "6694da89207e2bad53136049",
    //   "6694defd2d76fa9e687df25d",
    //   "669772d1d7d3856024e6e744",
    //   "6698bb6a79b8d4b7b34f24e4",
    //   "6698c41f39470c3f966c17ee",
    //   "669900fc79b8d4b7b3503eec",
    //   "669a121dc1023538f043d5cd",
    //   "669a4068ad85bd78fd217156",
    //   "669ba84b1e89111d656c4366",
    //   "669e2ba314cd94b137eb9f97",
    //   "669e2fb114cd94b137ebb574",
    //   "669e341111745cccf3444455",
    //   "669f4020d87721965f324c8e",
    //   "669fa9e3659cc301c4ca1cee",
    //   "66a0becc9bf79d410c050e9e",
    //   "66a0eecb9bf79d410c05da52",
    //   "66a1423d9bf79d410c070d8f",
    //   "66a1d9eeb484ca779fe9eaa7",
    //   "66a1f48c0446140a06cc8f79",
    //   "66a1f7c61121f78594f4864a",
    //   "66a2675e0446140a06ce4644",
    //   "66a60ccb033e90f7d73b88f9",
    //   "66a8bb7e84687b9a4aaef7a7",
    //   "66a9dc1430b085fbb759607a",
    //   "66ab4b554f0cbdcc826a119e",
    //   "66ac80f8aa74f613d883be45",
    //   "66ac9254aa74f613d8840d8e",
    //   "66aca34baa74f613d8845c07",
    //   "66adf6f6df696242821b9e2a",
    //   "66b0783ee40ece488c9d217b",
    //   "66b09728e91139a6e3637e35",
    //   "66b0c8fb8199e15c4151ff46"
    // ]
    if (!filtered_arr)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var all_student = await Student.find({ _id: { $in: filtered_arr } });
    // var message = `All F.Y.B.Sc. students should note that Open Elective / Generic Elective subject is compulsory subject to be selected from FACULTY OTHER THAN SCIENCE.
    // Our college has provided a Basket of three subjects from ARTS FACULTY & are as follows:-
    // 1. Hindi
    // 2. Sanskrit
    // 3. Geography

    // All students should select ONLY ONE subject from the above mentioned subjects
    // All students should fill the attached Google form carefully and submit it by 8th August 2024 before 5.00pm.

    // Google Form Link: https://forms.gle/1jur7dtXY2nfYdoH9

    // Please ask your friends to fill this form within scheduled time.

    // Principal.`
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
        if (status === "EMAIL_NOTIFICATION") {
          send_email_student_message_query(
            ref?.studentEmail ?? user?.userEmail,
            message
          );
        } else {
          if (user?.deviceToken) {
            await invokeSpecificRegister(
              "Specific Notification",
              `${m_title} - ${type} Institute Admin`,
              "Student Alert",
              user._id,
              user.deviceToken
            );
          } else {
            console.log("NO TOKEN");
          }
        }
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
        if (status === "EMAIL_NOTIFICATION") {
          send_email_student_message_query(
            ref?.studentEmail ?? user?.userEmail,
            message
          );
        } else {
          if (user?.deviceToken) {
            await invokeSpecificRegister(
              "Specific Notification",
              `${m_title} - ${type},
             ${valid_staff?.staffFirstName} ${
                valid_staff?.staffMiddleName ?? ""
              } ${valid_staff?.staffLastName}`,
              "Student Alert",
              user._id,
              user.deviceToken
            );
          } else {
            console.log("NO TOKEN");
          }
        }
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

exports.auto_messages = async (req, res) => {
  try {
    let nums = [
      "662a3a3fc73639c8ad2b16ef",
      "662a3a9bc73639c8ad2b1b98",
      "663073966fdbbbc36cba981d",
    ];
    let all_mess = await StudentMessage.find({ _id: { $in: nums } });
    for (var val of all_mess) {
      var valid_staff = await Staff.findById({ _id: `${val?.from}` });
      var all_student = await Student.find({ _id: { $in: val?.student_list } });
      var i = 0;
      for (var ref of all_student) {
        var user = await User.findById({
          _id: `${ref?.user}`,
        });
        var notify = new StudentNotification({});
        notify.notifyContent = `${val?.message} - From ${val?.message_type},
    ${valid_staff?.staffFirstName} ${valid_staff?.staffMiddleName ?? ""} ${
          valid_staff?.staffLastName
        }`;
        notify.notifySender = `${valid_staff?.user}`;
        notify.notifyReceiever = `${user?._id}`;
        notify.notifyType = "Student";
        notify.notifyPublisher = ref?._id;
        user.activity_tab.push(notify?._id);
        user.student_message.push(val?._id);
        notify.notifyByStaffPhoto = valid_staff?._id;
        notify.notifyCategory = "Reminder Alert";
        notify.redirectIndex = 59;
        notify.student_message = val?._id;
        await Promise.all([user.save(), notify.save()]);
        console.log(i, val?._id);
        i += 1;
        if (user?.deviceToken) {
          invokeSpecificRegister(
            "Specific Notification",
            `${val?.message_title} - ${val?.message_type},
    ${valid_staff?.staffFirstName} ${valid_staff?.staffMiddleName ?? ""} ${
              valid_staff?.staffLastName
            }`,
            "Student Alert",
            user._id,
            user.deviceToken
          );
        }
      }
    }
    res
      .status(200)
      .send({ message: "Explore Filtered Message Query", access: true });
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
      for (var ref of valid_ins?.ApproveStudent) {
        format = await all_upper_case_query(ref);
      }
    } else if (`${valid_ins?.name_case_format_query}` === "SMALL_FORMAT") {
      for (var ref of valid_ins?.ApproveStudent) {
        format = await all_lower_case_query(ref);
      }
    } else if (`${valid_ins?.name_case_format_query}` === "TITLE_FORMAT") {
      for (var ref of valid_ins?.ApproveStudent) {
        format = await all_title_case_query(ref);
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
    const { sid, message, from, type, flow, m_title, m_doc, status } = req.body;
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
      if (status === "EMAIL_NOTIFICATION") {
        send_email_student_message_query(
          student?.studentEmail ?? user?.userEmail,
          message
        );
      } else {
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
      if (status === "EMAIL_NOTIFICATION") {
        send_email_student_message_query(
          student?.studentEmail ?? user?.userEmail,
          message
        );
      } else {
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
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { status } = req?.query;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var ins = await InstituteAdmin.findById({ _id: id });
    var all_cert = await CertificateQuery.find({
      $and: [{ institute: ins?._id }, { certificate_status: `${status}` }],
    })
      .sort({ created_at: "-1" })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "institute",
        select: "insName name certificate_issued_count",
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO studentROLLNO studentGender",
      });
    res.status(200).send({
      message: `Explore All ${status} Certificate Query`,
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
    var { status, attach } = req?.query;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_cert = await CertificateQuery.findById({ _id: cid });
    var ins = await InstituteAdmin.findById({
      _id: `${valid_cert?.institute}`,
    });
    if (`${status}` === "Issued") {
      valid_cert.certificate_status = `${status}`;
      valid_cert.certificate_issued_date = new Date();
      valid_cert.certificate_attach = `${attach}`;
      ins.certificate_issued_count += 1;
    } else if (`${status}` === "Rejected") {
      valid_cert.certificate_status = `${status}`;
    } else {
    }
    await valid_cert.save();
    res
      .status(200)
      .send({ message: `Explore New ${status} Query`, access: true });
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

exports.renderAllUniqueIdQuery = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_ins = await InstituteAdmin.findById({ _id: id }).select(
      "ApproveStudent"
    );

    res.status(200).send({
      message: "Explore All Student Unique id",
      access: true,
      one_ins: one_ins?.ApproveStudent,
    });
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

exports.renderExcelToJSONLMSBiometricQuery = async (req, res) => {
  try {
    const { lmid } = req.params;
    const { excel_file } = req.body;
    if (!lmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_lms = await LMS.findById({ _id: lmid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_lms?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      lmsId: one_lms?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${one_lms?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.lmsId}` === `${one_lms?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_biometric_query(val);
    if (is_converted?.value) {
      await fetchBiometricStaffQuery(lmid, is_converted?.biometric_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONLMSStaffLeaveQuery = async (req, res) => {
  try {
    const { lmid } = req.params;
    const { excel_file } = req.body;
    if (!lmid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_lms = await LMS.findById({ _id: lmid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${one_lms?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      lmsId: one_lms?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${one_lms?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.lmsId}` === `${one_lms?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_staff_leave_query(val);
    if (is_converted?.value) {
      await renderAutoStaffLeaveConfigQuery(is_converted?.staff_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONGovernmentQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { excel_file } = req.body;

    const val = await simple_object(excel_file);

    const is_converted = await generate_excel_to_json_fee_structure_exist_query(
      val,
      fid
    );
    if (is_converted?.value) {
      await renderGovernmentHeadsMoveGovernmentCardUpdateQuery(
        fid,
        is_converted?.structure_array
      );
      res
        .status(200)
        .send({ message: "Excel Imported Successfully", access: true });
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONStudentFeesMappingQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { excel_file } = req.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      financeId: finance?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.financeId}` === `${finance?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_student_fees_mapping(val);
    if (is_converted?.value) {
      await render_student_fees_mapping(is_converted?.student_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONAddStaffDepartmentQuery = async (req, res) => {
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

    const is_converted = await generate_excel_to_json_staff_department(val, id);
    if (is_converted?.value) {
      await render_staff_add_department(is_converted?.student_array, id);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderExcelToJSONAddExistApplicationStudentQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { excel_file } = req.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const ads = await Admission.findById({ _id: aid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${ads?.institute}`,
    });
    one_ins.excel_data_query.push({
      excel_file: excel_file,
      admissionId: ads?._id,
      status: "Uploaded",
    });
    await one_ins.save();
    res.status(200).send({
      message: "Update Excel To Backend Wait for Operation Completed",
      access: true,
    });

    const update_ins = await InstituteAdmin.findById({
      _id: `${ads?.institute}`,
    });
    var key;
    for (var ref of update_ins?.excel_data_query) {
      if (
        `${ref.status}` === "Uploaded" &&
        `${ref?.admissionId}` === `${ads?._id}`
      ) {
        key = ref?.excel_file;
      }
    }
    const val = await simple_object(key);

    const is_converted = await generate_excel_to_json_student_ongoing_query(
      val,
      aid
    );
    if (is_converted?.value) {
      await retrieveDirectJoinAdmissionQueryApplication(
        is_converted?.student_array
      );
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log("eeeee", e);
  }
};

exports.renderExcelToJSONSPCEQuery = async (req, res) => {
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

    const is_converted = await generate_excel_to_json_spce(val, id);
    if (is_converted?.value) {
      await spce_student_name_sequencing(is_converted?.student_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log("eeeee", e);
  }
};

exports.renderExcelToJSONGRNOQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { excel_file } = req.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const classes = await Class.findById({ _id: id });
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

    const is_converted = await generate_excel_to_json_grno(val);
    if (is_converted?.value) {
      await retrieveInstituteNewGRNO(is_converted?.category_array);
    } else {
      console.log("false");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllFilteredDocumentMessageQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    // const { flow } = req.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    // if (flow === "INSTITUTE_ADMIN") {
    var valid_ins = await InstituteAdmin.findById({ _id: sid }).select(
      "student_reminder"
    );
    var all_message = await StudentMessage.find({
      $and: [
        { _id: { $in: valid_ins?.student_reminder } },
        { message_mode: "DOCUMENT_STUDENT_REMINDER" },
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
    // }
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

exports.send_notification = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ins = await InstituteAdmin.findById({ _id: id }).select(
      "admissionDepart"
    );

    const all_app = await NewApplication.find({
      $and: [
        { admissionAdmin: ins?.admissionDepart?.[0] },
        { applicationStatus: "Ongoing" },
        { applicationTypeStatus: "Normal Application" },
      ],
    }).select("confirmedApplication reviewApplication");
    let nums = [];
    for (let ele of all_app) {
      if (ele?.confirmedApplication?.length > 0) {
        for (let cls of ele?.confirmedApplication) {
          nums.push(cls?.student);
        }
      }
      if (ele?.reviewApplication?.length > 0) {
        for (let cls of ele?.reviewApplication) {
          nums.push(cls);
        }
      }
    }

    const all_student = await Student.find({ _id: { $in: nums } }).select(
      "studentFirstName studentMiddleName studentLastName studentProfilePhoto user"
    );

    res.status(200).send({
      message: "Explore All Student",
      all_student: all_student?.length,
    });
    let cls = [];
    for (var ref of all_student) {
      var user = await User.findById({
        _id: `${ref?.user}`,
      });
      var notify = new StudentNotification({});
      notify.notifyContent = `Those who admitted in spot round kindly come tomorrow for submission of original document. 
And those who cancelled admission kindly come tomorrow for collect their original document as well as complete refund of fees procedure.
As 17th & 18th September there will be holiday, so college will remain closed.`;
      notify.notifySender = `${ins?._id}`;
      notify.notifyReceiever = `${user?._id}`;
      notify.notifyType = "Student";
      notify.notifyPublisher = ref?._id;
      user.activity_tab.push(notify?._id);
      notify.notifyByInsPhoto = ins?._id;
      notify.notifyCategory = "CUSTOM_MESSAGE";
      notify.redirectIndex = 59;
      await Promise.all([user.save(), notify.save()]);
      if (user?.deviceToken) {
        await invokeSpecificRegister(
          "Specific Notification",
          `For Spot Round Admitted Students`,
          "Student Message",
          user._id,
          user.deviceToken
        );
        console.log("TOKEN");
      } else {
        console.log("NO TOKEN");
        cls.push(ref);
      }
    }
    console.log(cls);
  } catch (e) {
    console.log(e);
  }
};

exports.roll_alignment = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fixed immediately",
          access: false,
        });
  } catch (e) {
    console.log(e);
  }
};
