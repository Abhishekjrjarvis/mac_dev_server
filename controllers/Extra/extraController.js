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
          "insName insAddress insState insDistrict insPhoneNumber insPincode photoId insProfilePhoto",
      });
    student.studentReason = reason;
    student.student_bona_message = student_bona_message;
    student.studentBonaStatus = "Ready";
    institute.b_certificate_count += 1;
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
        "studentFirstName studentLeavingPreviousYear duplicate_copy applicable_fees_pending studentPreviousSchool studentLeavingBehaviour studentUidaiNumber studentGRNO studentMiddleName certificateLeavingCopy studentAdmissionDate studentReligion studentCast studentCastCategory studentMotherName studentNationality studentBirthPlace studentMTongue studentLastName photoId studentProfilePhoto studentDOB admissionRemainFeeCount"
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
          "insName insAddress insState studentFormSetting.previousSchoolAndDocument.previousSchoolDocument insDistrict insAffiliated insEditableText insEditableTexts insPhoneNumber insPincode photoId insProfilePhoto affliatedLogo",
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
      .select(
        "studentFirstName studentMiddleName studentGRNO studentLastName studentProfilePhoto photoId studentCast studentCastCategory studentReligion studentBirthPlace studentNationality studentMotherName studentMTongue studentGender studentDOB studentDistrict studentState studentAddress  studentAadharNumber studentPhoneNumber studentParentsName studentParentsPhoneNumber student_blood_group studentEmail"
      )
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
      .select(
        "studentFirstName studentMiddleName studentGRNO studentLastName studentProfilePhoto photoId studentCast studentCastCategory studentReligion studentBirthPlace studentNationality studentMotherName studentMTongue studentGender studentDOB studentDistrict studentState studentAddress  studentAadharNumber studentPhoneNumber studentEmail studentParentsName studentParentsPhoneNumber student_blood_group"
      )
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
    const active_user = await User.findById({ _id: uid });
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
    const { aid, scid } = req.params;
    const { excel_file } = req.body;
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
        scid
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
    const { filtered_arr, message, from, type } = req.body;
    if (!filtered_arr)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var all_student = await Student.find({ _id: { $in: filtered_arr } });
    var valid_staff = await Staff.findById({ _id: `${from}` });

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
      notify.notifyByStaffPhoto = valid_staff?._id;
      notify.notifyCategory = "Reminder Alert";
      notify.redirectIndex = 59;
      await Promise.all([user.save(), notify.save()]);
      invokeSpecificRegister(
        "Specific Notification",
        `${message} - From ${type},
      ${valid_staff?.staffFirstName} ${valid_staff?.staffMiddleName ?? ""} ${
          valid_staff?.staffLastName
        }`,
        "Fees Reminder",
        user._id,
        user.deviceToken
      );
    }
    res
      .status(200)
      .send({ message: "Explore Filtered Message Query", access: true });
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
    var valid_students = await Student.findById({ _id: id })
    var data = {
      profile_pic: valid_students?.studentProfilePhoto,
      name: valid_students?.valid_full_name,
      gr: valid_students?.studentGRNO
    }
    res.status(200).send({
      message: "Explore Id Card File",
      access: true,
      allow,
      Key: `${valid_student.studentProfilePhoto}`,
      data: data
    });
    // cdn_link_last_key: `${valid_ins?.name}.zip`,
    // await next_call(`${valid_ins?.name}.zip`);
    // await remove_call(`${valid_ins?.name}.zip`);
    // await remove_assets();
  } catch (e) {
    console.log(e);
  }
};
