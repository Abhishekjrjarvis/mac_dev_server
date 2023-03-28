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
const Post = require("../../models/Post");
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
const { designation_alarm } = require("../../WhatsAppSMS/payload");
const {
  render_institute_current_role,
} = require("../Moderator/roleController");
const { announcement_feed_query } = require("../../Post/announceFeed");

exports.getDashOneQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { mod_id } = req.query;
    const institute = await InstituteAdmin.findById({ _id: id }).select(
      "insName name insAbout photoId blockStatus original_copy gr_initials moderator_role moderator_role_count insProfileCoverPhoto coverId block_institute blockedBy sportStatus sportClassStatus sportDepart sportClassDepart staff_privacy email_privacy followers_critiria initial_Unlock_Amount contact_privacy sms_lang followersCount tag_privacy status activateStatus insProfilePhoto recoveryMail insPhoneNumber financeDetailStatus financeStatus financeDepart admissionDepart admissionStatus unlockAmount transportStatus transportDepart libraryActivate library accessFeature activateStatus eventManagerStatus eventManagerDepart careerStatus careerDepart career_count tenderStatus tenderDepart tender_count aluminiStatus aluminiDepart hostelDepart hostelStatus"
    );
    // const encrypt = await encryptionPayload(institute);
    if (req?.query?.mod_id) {
      var value = await render_institute_current_role(
        finance?.moderator_role,
        mod_id
      );
    }
    res.status(200).send({
      message: "limit Ins Data",
      institute: institute,
      roles: req?.query?.mod_id ? value : null,
      // eData: encrypt,
    });
  } catch {}
};

exports.getProfileOneQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select(
        "insName status photoId insProfilePhoto gr_initials sub_domain_link_up_status application_fee_charges sportStatus sms_lang sportClassStatus blockStatus one_line_about staff_privacy email_privacy contact_privacy tag_privacy questionCount pollCount insAffiliated insEditableText insEditableTexts activateStatus accessFeature coverId insRegDate departmentCount announcementCount admissionCount insType insMode insAffiliated insAchievement joinedCount staffCount studentCount insProfileCoverPhoto followersCount name followingCount postCount insAbout insEmail insAddress insEstdDate createdAt insPhoneNumber insAffiliated insAchievement followers userFollowersList admissionCount request_at affiliation_by block_institute blockedBy"
      )
      .populate({
        path: "request_at",
        select: "affiliation_name photo",
      })
      .populate({
        path: "affiliation_by",
        select: "affiliation_name photo",
      })
      .populate({
        path: "sub_domain",
        select: "sub_domain_path sub_domain_name status",
      })
      .lean()
      .exec();
    const encrypt = await encryptionPayload(institute);
    res
      .status(200)
      .send({ message: "Limit Post Ins", institute, eData: encrypt });
  } catch {}
};

exports.getSettingPersonal = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select(
        "insName name photoId insProfilePhoto insEmail status insAddress insMode insType insAbout insAffiliated insAchievement insEstdDate createdAt insEditableText insEditableTexts insPhoneNumber"
      )
      .lean()
      .exec();
    if (institute) {
      // const iEncrypt = await encryptionPayload(institute);
      res
        .status(200)
        .send({ message: "Success for retrieving Setting ✨", institute });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.getSwitchAccounts = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({
        path: "addInstituteUser",
        select: "userLegalName username photoId profilePhoto",
      })
      .populate({
        path: "addInstitute",
        select: "insName name photoId insProfilePhoto",
      })
      .select("_id")
      .lean()
      .exec();
    if (institute) {
      // const iEncrypt = await encryptionPayload(institute);
      res.status(200).send({ message: "Success", institute });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.getCQCoins = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select(
        "insFreeLastData insPaymentLastDate insType insFreeCredit referalPercentage transferCredit rejectReason -insPassword"
      )
      .populate({
        path: "ApproveStudent",
        select: "studentFirstName",
      })
      .populate({
        path: "instituteReferral",
        select: "insName name photoId insProfilePhoto",
      })
      .populate({
        path: "userReferral",
        select: "userLegalName username photoId profilePhoto",
      })
      .lean()
      .exec();
    if (institute) {
      // const iEncrypt = await encryptionPayload(institute);
      res.status(200).send({ message: "Success", institute });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.getAnnouncementArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { id } = req.params;
    const skip = (page - 1) * limit;
    const institute = await InstituteAdmin.findById({ _id: id });
    const announcement = await InsAnnouncement.find({
      _id: { $in: institute?.announcement },
    })
      .select(
        "insAnnPhoto photoId insAnnTitle insAnnVisibilty insAnnDescription createdAt"
      )
      .populate({
        path: "reply",
        select: "replyText createdAt replyAuthorAsUser replyAuthorAsIns",
      })
      .populate({
        path: "institute",
        select: "insName name photoId insProfilePhoto",
      })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip);
    // const aEncrypt = await encryptionPayload(announcement);
    res.status(200).send({ message: "all announcement list", announcement });
  } catch (e) {
    console.log(e);
  }
};

exports.getNotificationIns = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { id } = req.params;
    const skip = (page - 1) * limit;
    const institute = await InstituteAdmin.findById({ _id: id }).select(
      "iNotify"
    );
    const notify = await Notification.find({ _id: { $in: institute?.iNotify } })
      .sort("-notifyTime")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "notifyByInsPhoto",
        select: "photoId insProfilePhoto",
      })
      .populate({
        path: "notifyByPhoto",
        select: "photoId profilePhoto",
      })
      .populate({
        path: "notifyByStaffPhoto",
        select: "photoId staffProfilePhoto",
      })
      .populate({
        path: "notifyByStudentPhoto",
        select: "photoId studentProfilePhoto",
      })
      .populate({
        path: "notifyByDepartPhoto",
        select: "photoId photo",
      });
    // const nEncrypt = await encryptionPayload(notify);
    res.status(200).send({ message: "Notification Data ✨", notify });
  } catch (e) {
    console.log("Error", e.message);
  }
};

exports.getAllTotalCount = async (req, res) => {
  try {
    const id = req.params.id;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("_id iNotify")
      .populate({
        path: "iNotify",
      });
    var total = 0;
    const notify = await Notification.find({
      $and: [
        { _id: { $in: institute?.iNotify } },
        { notifyViewStatus: "Not View" },
      ],
    });
    total = total + notify?.length;
    // const tEncrypt = await encryptionPayload(total);
    res.status(200).send({ message: "Not Viewed Notification", count: total });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveMarkAllView = async (req, res) => {
  try {
    const id = req.params.id;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("_id")
      .populate({ path: "iNotify" });
    const notify = await Notification.find({
      $and: [
        { _id: { $in: institute?.iNotify } },
        { notifyViewStatus: "Not View" },
      ],
    });
    if (notify?.length >= 1) {
      notify.forEach(async (ele) => {
        ele.notifyViewStatus = "View";
        await ele.save();
      });
    }
    res.status(200).send({ message: "Mark All To Be Viewed" });
  } catch (e) {
    console.log(e);
  }
};

exports.getNotifyReadIns = async (req, res) => {
  try {
    const { rid } = req.params;
    const read = await Notification.findById({ _id: rid });
    read.notifyReadStatus = "Read";
    await read.save();
    res.status(200).send({ message: "updated" });
  } catch (e) {
    console.log(e);
  }
};

exports.getDeleteNotifyIns = async (req, res) => {
  try {
    const { id, nid } = req.params;
    await InstituteAdmin.findByIdAndUpdate(id, {
      $pull: { iNotify: nid },
    });
    await Notification.findByIdAndDelete({ _id: nid });
    res.status(200).send({ message: "Deleted Notification 😀" });
  } catch (e) {
    console.log(e);
  }
};

exports.getHideNotifyIns = async (req, res) => {
  try {
    const { nid } = req.params;
    const notify = await Notification.findById({ _id: nid });
    notify.notifyVisibility = "hide";
    await notify.save();
    res.status(200).send({ message: "Hide Notification 😀" });
  } catch (e) {
    console.log(e);
  }
};

exports.getUpdatePhone = async (req, res) => {
  try {
    const { id } = req.params;
    const { insPhoneNumber } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.insPhoneNumber = insPhoneNumber;
    await institute.save();
    res.status(200).send({ message: "Mobile No Updated", status: true });
  } catch (e) {
    console.log(e);
  }
};

exports.getUpdatePersonalIns = async (req, res) => {
  try {
    const { id } = req.params;
    const { old_initials } = req.query;
    await InstituteAdmin.findByIdAndUpdate(id, req.body);
    res.status(200).send({ message: "Personal Info Updated" });
    var institute = await InstituteAdmin.findById({ _id: id });
    const post = await Post.find({ author: `${institute._id}` });
    post.forEach(async (ele) => {
      ele.authorOneLine = institute.one_line_about;
      ele.authorName = institute.insName;
      await ele.save();
    });
    const comment = await Comment.find({ author: `${institute._id}` });
    comment.forEach(async (com) => {
      com.authorOneLine = institute.one_line_about;
      com.authorName = institute.insName;
      await com.save();
    });
    const replyComment = await ReplyComment.find({
      author: `${institute._id}`,
    });
    replyComment.forEach(async (reply) => {
      reply.authorOneLine = institute.one_line_about;
      reply.authorName = institute.insName;
      await reply.save();
    });
    const all_students = await Student.find({
      $and: [{ studentStatus: "Approved" }, { institute: `${institute._id}` }],
    }).select("studentGRNO");
    for (var all of all_students) {
      if (all?.studentGRNO?.startsWith(`${old_initials}`)) {
        all.studentGRNO =
          institute?.gr_initials +
          all?.studentGRNO?.slice(old_initials?.length);
        await all.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getUpdateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const announcements = new InsAnnouncement({ ...req.body });
    institute.announcement.unshift(announcements._id);
    institute.announcementCount += 1;
    announcements.institute = institute._id;
    for (let file of req.files) {
      const insDocument = new InsDocument({});
      insDocument.documentType = file.mimetype;
      insDocument.documentName = file.originalname;
      insDocument.documentEncoding = file.encoding;
      insDocument.documentSize = file.size;
      const results = await uploadDocFile(file);
      insDocument.documentKey = results.Key;
      announcements.announcementDocument.push(insDocument._id);
      await insDocument.save();
      await unlinkFile(file.path);
    }
    await Promise.all([institute.save(), announcements.save()]);
    // const aEncrypt = await encryptionPayload(announcements);
    res.status(200).send({ message: "Successfully Created", announcements });
    await announcement_feed_query(institute?._id, announcements?._id);
    for (var num of institute.userFollowersList) {
      const user = await User.findById({ _id: `${num}` });
      if (user?.followInsAnnouncement?.includes(announcements?._id)) {
      } else {
        user.followInsAnnouncement.push(announcements?._id);
        await user.save();
      }
    }
    for (var arr of institute.joinedUserList) {
      const user = await User.findById({ _id: `${arr}` });
      if (user?.followInsAnnouncement?.includes(announcements?._id)) {
      } else {
        user.followInsAnnouncement.push(announcements?._id);
        await user.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await InsAnnouncement.findById({ _id: id })
      .populate({
        path: "institute",
        select: "insName photoId insProfilePhoto",
      })
      .lean()
      .exec();
    // const aEncrypt = await encryptionPayload(announcement);

    res.status(200).send({ message: "Announcement Detail", announcement });
  } catch (e) {
    console.log(e);
  }
};

exports.updateFollowIns = async (req, res) => {
  try {
    var institute_session = req.tokenData && req.tokenData.insId;
    const institutes = await InstituteAdmin.findById({
      _id: institute_session,
    });
    const sinstitute = await InstituteAdmin.findById({
      _id: req.body.followId,
    });

    if (institutes.status === "Approved" && sinstitute.status === "Approved") {
      if (institutes.following.includes(req.body.followId)) {
        res
          .status(200)
          .send({ message: "You Already Following This Institute" });
      } else {
        const notify = new Notification({});
        sinstitute.followers.push(institute_session);
        institutes.following.push(req.body.followId);
        institutes.followingCount += 1;
        sinstitute.followersCount += 1;
        notify.notifyContent = `${institutes.insName} started following you`;
        notify.notifyReceiever = sinstitute._id;
        notify.notifyCategory = "Institute Follow";
        sinstitute.iNotify.push(notify._id);
        notify.institute = sinstitute._id;
        notify.notifyByInsPhoto = institutes._id;
        await Promise.all([
          institutes.save(),
          sinstitute.save(),
          notify.save(),
        ]);
        res.status(200).send({ message: "Following This Institute" });
        if (sinstitute.isUniversal === "Not Assigned") {
          const post = await Post.find({
            $and: [{ author: sinstitute._id, postStatus: "Anyone" }],
          });
          post.forEach(async (pt) => {
            institutes.posts.push(pt);
          });
          await institutes.save();
        } else {
        }
      }
    } else {
      res
        .status(200)
        .send({ message: "Institute is Not Approved, you will not follow" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.removeFollowIns = async (req, res) => {
  try {
    var institute_session = req.tokenData && req.tokenData.insId;
    const institutes = await InstituteAdmin.findById({
      _id: institute_session,
    });
    const sinstitute = await InstituteAdmin.findById({
      _id: req.body.followId,
    });

    if (institutes.status === "Approved" && sinstitute.status === "Approved") {
      if (institutes.following.includes(req.body.followId)) {
        sinstitute.followers.pull(institute_session);
        institutes.following.pull(req.body.followId);
        if (institutes.followingCount >= 1) {
          institutes.followingCount -= 1;
        }
        if (sinstitute.followersCount >= 1) {
          sinstitute.followersCount -= 1;
        }
        await Promise.all([sinstitute.save(), institutes.save()]);
        res.status(200).send({ message: "UnFollow This Institute" });
        if (sinstitute.isUniversal === "Not Assigned") {
          const post = await Post.find({
            $and: [{ author: sinstitute._id, postStatus: "Anyone" }],
          });
          post.forEach(async (pt) => {
            institutes.posts.pull(pt);
          });
          await institutes.save();
        } else {
        }
      } else {
        res
          .status(200)
          .send({ message: "You Already UnFollow This Institute" });
      }
    } else {
      res
        .status(200)
        .send({ message: "Institute is Not Approved, you will not follow" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.updateApproveStaff = async (req, res) => {
  try {
    const { id, sid, uid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const notify = new Notification({});
    const aStatus = new Status({});
    const staffs = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: uid });
    staffs.staffStatus = req.body.status;
    institute.ApproveStaff.push(staffs._id);
    institute.staffCount += 1;
    admins.staffArray.push(staffs._id);
    admins.staffCount += 1;
    institute.staff.pull(sid);
    institute.joinedUserList.push(user._id);
    staffs.staffROLLNO = institute.ApproveStaff.length;
    staffs.staffJoinDate = new Date().toISOString();
    notify.notifyContent = `Congrats ${staffs.staffFirstName} ${
      staffs.staffMiddleName ? `${staffs.staffMiddleName}` : ""
    } ${staffs.staffLastName} for joined as a staff at ${institute.insName}`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Approve Staff";
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByStaffPhoto = staffs._id;
    aStatus.content = `Welcome to ${institute.insName}.Your application for joining as staff  has been accepted by ${institute.insName}.`;
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    invokeFirebaseNotification(
      "Staff Approval",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      staffs.save(),
      institute.save(),
      admins.save(),
      user.save(),
      notify.save(),
      aStatus.save(),
    ]);
    // const iEncrypt = await encryptionPayload(institute.ApproveStaff);
    res.status(200).send({
      message: `Welcome To The Institute ${staffs.staffFirstName} ${staffs.staffLastName}`,
      institute: institute.ApproveStaff,
    });
    if (institute.isUniversal === "Not Assigned") {
      const post = await Post.find({ author: institute._id });
      post.forEach(async (pt) => {
        if (user.userPosts.length >= 1 && user.userPosts.includes(String(pt))) {
        } else {
          user.userPosts.push(pt);
        }
      });
      await user.save();
    } else {
    }
    if (staffs.staffGender === "Male") {
      institute.staff_category.boyCount += 1;
    } else if (staffs.staffGender === "Female") {
      institute.staff_category.girlCount += 1;
    } else if (staffs.staffGender === "Other") {
      institute.staff_category.otherCount += 1;
    } else {
    }
    if (staffs.staffCastCategory === "General") {
      institute.staff_category.generalCount += 1;
    } else if (staffs.staffCastCategory === "OBC") {
      institute.staff_category.obcCount += 1;
    } else if (staffs.staffCastCategory === "SC") {
      institute.staff_category.scCount += 1;
    } else if (staffs.staffCastCategory === "ST") {
      institute.staff_category.stCount += 1;
    } else if (staffs.staffCastCategory === "NT-A") {
      institute.staff_category.ntaCount += 1;
    } else if (staffs.staffCastCategory === "NT-B") {
      institute.staff_category.ntbCount += 1;
    } else if (staffs.staffCastCategory === "NT-C") {
      institute.staff_category.ntcCount += 1;
    } else if (staffs.staffCastCategory === "NT-D") {
      institute.staff_category.ntdCount += 1;
    } else if (staffs.staffCastCategory === "VJ") {
      institute.staff_category.vjCount += 1;
    } else {
    }
    await Promise.all([institute.save()]);
  } catch (e) {}
};

exports.updateRejectStaff = async (req, res) => {
  try {
    const { id, sid, uid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const staffs = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: uid });
    const aStatus = new Status({});
    const notify = new Notification({});
    staffs.staffStatus = req.body.status;
    institute.staff.pull(sid);
    notify.notifyContent = `your request for the role of staff is rejected contact at connect@qviple.com`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify._id);
    notify.user = user;
    notify.notifyPid = "1";
    notify.notifyPhoto = institute.insProfilePhoto;
    aStatus.content = `Your application for joining as staff in ${institute.insName} is being rejected. Please follow up with institute for any queries.`;
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      institute.save(),
      staffs.save(),
      user.save(),
      notify.save(),
      aStatus.save(),
    ]);
    // const iEncrypt = await encryptionPayload(institute);
    res.status(200).send({
      message: `Application Rejected ${staffs.staffFirstName} ${staffs.staffLastName}`,
      institute,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getNewDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { sid } = req.body;
    const staff = await Staff.findById({ _id: sid }).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${staff.user._id}` });
    const institute = await InstituteAdmin.findById({ _id: id });
    const department = new Department({ ...req.body });
    const notify = new Notification({});
    institute.depart.push(department._id);
    institute.departmentCount += 1;
    department.institute = institute._id;
    staff.staffDepartment.push(department._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = req.body.dTitle;
    staff.designation_array.push({
      role: "Department Head",
      role_id: department?._id,
    });
    department.dHead = staff._id;
    department.staffCount += 1;
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
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      institute.save(),
      staff.save(),
      department.save(),
      user.save(),
      notify.save(),
    ]);
    // const dEncrypt = await encryptionPayload(department._id);
    res.status(200).send({
      message: "Successfully Created Department",
      department: department._id,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "DHEAD",
      institute?.sms_lang,
      department?.dName,
      department?.dTitle,
      ""
    );
  } catch (e) {}
};

exports.getNewStaffJoinCodeIns = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    const all_ins = await InstituteAdmin.find({ staffJoinCode: `${code}` });
    if (all_ins?.length > 0) {
      const institute = await InstituteAdmin.findById({ _id: id });
      institute.staffJoinCode = await randomSixCode();
      await institute.save();
      // const iEncrypt = await encryptionPayload(institute.staffJoinCode);
      res.status(200).send({
        message: "New Random Staff joining code",
        institute: institute.staffJoinCode,
      });
    } else {
      const institute = await InstituteAdmin.findById({ _id: id });
      institute.staffJoinCode = code;
      await institute.save();
      // const iEncrypt = await encryptionPayload(institute.staffJoinCode);
      res.status(200).send({
        message: "Staff joining code",
        institute: institute.staffJoinCode,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.AddAccountByIns = async (req, res) => {
  try {
    const { id, iid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const instituteNew = await InstituteAdmin.findById({ _id: iid });
    institute.addInstitute.push(instituteNew);
    instituteNew.addInstitute.push(institute);
    await Promise.all([institute.save(), instituteNew.save()]);
    // Add Another Encryption
    res.status(200).send({ message: "Added", institute, instituteNew });
  } catch (e) {
    console.log(e);
  }
};

exports.AddAccountByUser = async (req, res) => {
  try {
    const { id, iid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const user = await User.findById({ _id: iid });
    institute.addInstituteUser.push(user);
    user.addUserInstitute.push(institute);
    await Promise.all([institute.save(), user.save()]);
    // Add Another Encryption
    res.status(200).send({ message: "Added", institute, user });
  } catch (e) {
    console.log(e);
  }
};

exports.reportPostByUser = async (req, res) => {
  try {
    const { id, uid } = req.params;
    const { reportStatus } = req.body;
    const user = await User.findById({ _id: id });
    const post = await Post.findById({ _id: uid });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const report = new Report({ reportStatus: reportStatus });
    admin.reportList.push(report._id);
    admin.reportPostQueryCount += 1;
    report.reportInsPost = post._id;
    report.reportBy = user._id;
    user.userPosts?.pull(post?._id);
    await Promise.all([admin.save(), report.save(), user.save()]);
    // const rEncrypt = await encryptionPayload(reportStatus);
    res.status(200).send({ message: "reported", report: reportStatus });
  } catch (e) {
    console.log(e);
  }
};

exports.sendForPrintID = async (req, res) => {
  try {
    const { id, bid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({ _id: `62596c3a47690fe0d371f5b4` });
    const notify = new Notification({});
    admin.idCardPrinting.push(batch);
    batch.idCardStatus = status;
    notify.notifyContent = `Id Card for ${batch.batchName} is send for Printing`;
    notify.notifySender = admin._id;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyPid = "1";
    notify.notifyByInsPhoto = institute;
    await admin.save();
    await batch.save();
    await institute.save();
    await notify.save();
    res.status(200).send({ message: "Send for Printing", admin, batch });
  } catch (e) {
    console.log(e);
  }
};

exports.unSendForPrintID = async (req, res) => {
  try {
    const { id, bid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({ _id: `62596c3a47690fe0d371f5b4` });
    const notify = new Notification({});
    admin.idCardPrinting.pull(batch);
    batch.idCardStatus = "";
    notify.notifyContent = `Id Card for ${batch.batchName} is not send for Printing Contact at connect@qviple.com`;
    notify.notifySender = admin._id;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyByInsPhoto = institute;
    await admin.save();
    await batch.save();
    await institute.save();
    await notify.save();
    res.status(200).send({ message: "Un Send for Printing", admin, batch });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.printedBySuperAdmin = async (req, res) => {
  try {
    const { id, bid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({ _id: `62596c3a47690fe0d371f5b4` });
    const notify = new Notification({});
    admin.idCardPrinted.push(batch);
    admin.idCardPrinting.pull(batch);
    batch.idCardStatus = status;
    notify.notifyContent = `Id Card for ${batch.batchName} is being Printed`;
    notify.notifySender = admin._id;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyByInsPhoto = institute;
    await admin.save();
    await batch.save();
    await institute.save();
    await notify.save();
    res.status(200).send({ message: "Id Card Printed", admin, batch });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.fillStaffForm = async (req, res) => {
  try {
    const { uid, id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const user = await User.findById({ _id: uid });
    const staff = new Staff({ ...req.body });
    for (var file of req.body?.fileArray) {
      if (file.name === "file") {
        staff.photoId = "0";
        staff.staffProfilePhoto = file.key;
      } else if (file.name === "addharFrontCard")
        staff.staffAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        staff.staffAadharBackCard = file.key;
      else if (file.name === "bankPassbook") staff.staffBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        staff.staffCasteCertificatePhoto = file.key;
      else {
        staff.staffDocuments.push({
          documentName: file.name,
          documentKey: file.key,
          documentType: file.type,
        });
      }
    }
    const notify = new Notification({});
    const aStatus = new Status({});
    institute.staff.push(staff._id);
    user.staff.push(staff._id);
    user.is_mentor = true;
    institute.joinedPost.push(user._id);
    if (institute.userFollowersList.includes(uid)) {
    } else {
      user.userInstituteFollowing.push(id);
      user.followingUICount += 1;
      institute.userFollowersList.push(uid);
      institute.followersCount += 1;
    }
    staff.institute = institute._id;
    staff.staffApplyDate = new Date().toISOString();
    staff.user = user._id;
    notify.notifyContent = `${staff.staffFirstName}${
      staff.staffMiddleName ? ` ${staff.staffMiddleName}` : ""
    } ${staff.staffLastName} has been applied for role of Staff`;
    notify.notifySender = staff._id;
    notify.notifyReceiever = institute._id;
    notify.notifyCategory = "Request Staff";
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    notify.notifyByStaffPhoto = staff._id;
    aStatus.content = `Your application for joining as staff in ${institute.insName} is filled successfully..`;
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    await Promise.all([
      staff.save(),
      institute.save(),
      user.save(),
      notify.save(),
      aStatus.save(),
    ]);
    // const sEncrypt = await encryptionPayload(staff);
    res
      .status(201)
      .send({ message: "Staff form is applied", staff, status: true });
  } catch (e) {
    console.log(e);
  }
};

exports.fillStudentForm = async (req, res) => {
  try {
    const { uid, id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const user = await User.findById({ _id: uid });
    const student = new Student({ ...req.body });
    const classes = await Class.findOne({ classCode: req.body.studentCode });
    const classStaff = await Staff.findById({ _id: `${classes.classTeacher}` });
    const classUser = await User.findById({ _id: `${classStaff.user}` });
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
      student.studentOptionalSubject.push(...studentOptionalSubject);
    }
    const notify = new StudentNotification({});
    const aStatus = new Status({});
    institute.student.push(student._id);
    user.student.push(student._id);
    user.is_mentor = true;
    institute.joinedPost.push(user._id);
    classes.student.push(student._id);
    student.studentClass = classes._id;
    if (institute.userFollowersList.includes(uid)) {
    } else {
      user.userInstituteFollowing.push(id);
      user.followingUICount += 1;
      institute.userFollowersList.push(uid);
      institute.followersCount += 1;
    }
    student.institute = institute._id;
    student.user = user._id;
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} has been applied for role of student`;
    notify.notifySender = student._id;
    notify.notifyReceiever = classUser._id;
    institute.iNotify.push(notify._id);
    notify.notifyType = "Staff";
    notify.notifyPublisher = classStaff._id;
    classUser.activity_tab.push(notify._id);
    notify.notifyByStudentPhoto = student._id;
    notify.notifyCategory = "Student Request";
    notify.redirectIndex = 9;
    notify.classId = classes?._id;
    notify.departmentId = classes?.department;
    notify.batchId = classes?.batch;
    aStatus.content = `Your application for joining as student in ${institute.insName} is filled successfully. Stay updated to check status of your application.`;
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    //
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      "Request for Joining",
      classUser._id,
      classUser.deviceToken,
      "Staff",
      notify
    );
    //
    await Promise.all([
      student.save(),
      institute.save(),
      user.save(),
      classes.save(),
      notify.save(),
      aStatus.save(),
      classUser.save(),
    ]);
    // const sEncrypt = await encryptionPayload(student);
    res
      .status(201)
      .send({ message: "student form is applied", student, status: true });
  } catch (e) {
    console.log(e);
  }
};

exports.retrievePendingStaffList = async (req, res) => {
  try {
    const { id } = req.params;
    const staffIns = await InstituteAdmin.findById({ _id: id })
      .select("insName")
      .populate({
        path: "staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffPhoneNumber staffApplyDate",
        populate: {
          path: "user",
          select: "userLegalName userEmail",
        },
      })
      .lean()
      .exec();
    if (staffIns) {
      // const sEncrypt = await encryptionPayload(staffIns);
      res.status(200).send({ message: "Success", staffIns });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveApproveStaffList = async (req, res) => {
  try {
    var { id } = req.params;
    if (req.query.limit) {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      const staff_ins = await InstituteAdmin.findById({ _id: id }).select(
        "ApproveStaff insName"
      );
      const staffIns = await Staff.find({
        _id: { $in: staff_ins?.ApproveStaff },
      })
        .limit(limit)
        .skip(skip)
        .select(
          "staffFirstName staffMiddleName staff_biometric_id recentDesignation staffLastName photoId staffProfilePhoto staffPhoneNumber staffJoinDate staffROLLNO staffGender"
        )
        .populate({
          path: "user",
          select: "userLegalName userEmail userPhoneNumber",
        });
      if (staffIns) {
        // const sEncrypt = await encryptionPayload(staffIns);
        staffIns.sort(function (st1, st2) {
          return parseInt(st1.staffROLLNO) - parseInt(st2.staffROLLNO);
        });
        res.status(200).send({ message: "All Staff With Limit ", staffIns });
      } else {
        res.status(404).send({ message: "Failure", staffIns: [] });
      }
    } else {
      if (req.query.date) {
        const staff_ins = await InstituteAdmin.findById({ _id: id }).select(
          "ApproveStaff insName"
        );
        const staffIns = await Staff.find({
          _id: { $in: staff_ins?.ApproveStaff },
        })
          .select(
            "staffFirstName staffMiddleName staff_biometric_id recentDesignation staffLastName photoId staffProfilePhoto staffPhoneNumber staffJoinDate staffROLLNO staffGender"
          )
          .populate({
            path: "user",
            select: "userLegalName userEmail userPhoneNumber",
          })
          .populate({
            path: "staffLeave",
            match: {
              date: { $eq: req.query?.date },
            },
            select: "_id date",
          });
        if (staffIns) {
          // const sEncrypt = await encryptionPayload(staffIns);
          staffIns.sort(function (st1, st2) {
            return parseInt(st1.staffROLLNO) - parseInt(st2.staffROLLNO);
          });
          res.status(200).send({ message: "Without Limit", staffIns });
        } else {
          res.status(404).send({ message: "Failure", staffIns: [] });
        }
      } else {
        const staff_ins = await InstituteAdmin.findById({ _id: id }).select(
          "ApproveStaff insName"
        );
        const staffIns = await Staff.find({
          _id: { $in: staff_ins?.ApproveStaff },
        })
          .select(
            "staffFirstName staffMiddleName staff_biometric_id recentDesignation staffLastName photoId staffProfilePhoto staffPhoneNumber staffJoinDate staffROLLNO staffGender"
          )
          .populate({
            path: "user",
            select: "userLegalName userEmail userPhoneNumber",
          });
        if (staffIns) {
          // const sEncrypt = await encryptionPayload(staffIns);
          staffIns.sort(function (st1, st2) {
            return parseInt(st1.staffROLLNO) - parseInt(st2.staffROLLNO);
          });
          res.status(200).send({ message: "Without Limit", staffIns });
        } else {
          res.status(404).send({ message: "Failure", staffIns: [] });
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveApproveStudentList = async (req, res) => {
  try {
    var { id } = req.params;
    if (req.query.limit) {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      const student_ins = await InstituteAdmin.findById({ _id: id }).select(
        "ApproveStudent insName gr_initials"
      );
      const studentIns = await Student.find({
        _id: { $in: student_ins?.ApproveStudent },
      })
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentPhoneNumber studentGRNO studentROLLNO studentAdmissionDate studentGender"
        )
        .populate({
          path: "user",
          select: "userLegalName userEmail userPhoneNumber",
        })
        .populate({
          path: "studentClass",
          select: "className classStatus",
        });
      if (studentIns) {
        // const sEncrypt = await encryptionPayload(studentIns);
        studentIns.sort(function (st1, st2) {
          return (
            parseInt(st1.studentGRNO.slice(student_ins?.gr_initials?.length)) -
            parseInt(st2.studentGRNO.slice(student_ins?.gr_initials?.length))
          );
        });
        res.status(200).send({ message: "All Student with limit", studentIns });
      } else {
        res.status(404).send({ message: "Failure", studentIns: [] });
      }
    } else {
      const student_ins = await InstituteAdmin.findById({ _id: id }).select(
        "ApproveStudent insName gr_initials"
      );
      const studentIns = await Student.find({
        _id: { $in: student_ins?.ApproveStudent },
      })
        .select(
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentPhoneNumber studentGRNO studentROLLNO studentAdmissionDate"
        )
        .populate({
          path: "user",
          select: "userLegalName userEmail userPhoneNumber",
        })
        .populate({
          path: "studentClass",
          select: "className classStatus",
        });
      if (studentIns) {
        // const sEncrypt = await encryptionPayload(studentIns);
        studentIns.sort(function (st1, st2) {
          return (
            parseInt(st1.studentGRNO.slice(student_ins?.gr_initials?.length)) -
            parseInt(st2.studentGRNO.slice(student_ins?.gr_initials?.length))
          );
        });
        res.status(200).send({ message: "Without Limit", studentIns });
      } else {
        res.status(404).send({ message: "Failure", studentIns: [] });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getFullStaffInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApk } = req.query;
    if (isApk) {
      var staff = await Staff.findById({ _id: id })
        .select(
          "staffFirstName staffDesignationCount staffMiddleName staffDepartment staffClass staffSubject staffLastName photoId staffProfilePhoto staffDOB staffGender staffNationality staffMotherName staffMTongue staffCast staffCastCategory staffReligion staffBirthPlace staffBirthPlacePincode staffBirthPlaceState staffBirthPlaceDistrict staffDistrict staffPincode staffState staffAddress staffCurrentPincode staffCurrentDistrict staffCurrentState staffCurrentAddress staffPhoneNumber staffAadharNumber staffQualification staffDocuments staffAadharFrontCard staffAadharBackCard staffPreviousSchool staffBankName staffBankAccount staffBankAccountHolderName staffBankIfsc staffBankPassbook staffCasteCertificatePhoto staffStatus staffROLLNO staffPhoneNumber"
        )
        .populate({
          path: "user",
          select: "userLegalName userEmail",
        })
        .populate({
          path: "institute",
          select: "insName",
        })
        .lean()
        .exec();
      for (var docs of staff.staffDocuments) {
        staff.incomeCertificate =
          docs.documentName === "incomeCertificate"
            ? docs.documentKey
            : staff.incomeCertificate;
        staff.leavingTransferCertificate =
          docs.documentName === "leavingTransferCertificate"
            ? docs.documentKey
            : staff.leavingTransferCertificate;
        staff.nonCreamyLayerCertificate =
          docs.documentName === "nonCreamyLayerCertificate"
            ? docs.documentKey
            : staff.nonCreamyLayerCertificate;
        staff.domicileCertificate =
          docs.documentName === "domicileCertificate"
            ? docs.documentKey
            : staff.domicileCertificate;
        staff.nationalityCertificate =
          docs.documentName === "nationalityCertificate"
            ? docs.documentKey
            : staff.nationalityCertificate;
        staff.lastYearMarksheet =
          docs.documentName === "lastYearMarksheet"
            ? docs.documentKey
            : staff.lastYearMarksheet;
        staff.joiningTransferLetter =
          docs.documentName === "joiningTransferLetter"
            ? docs.documentKey
            : staff.joiningTransferLetter;
        staff.identityDocument =
          docs.documentName === "identityDocument"
            ? docs.documentKey
            : staff.identityDocument;
      }
    } else {
      var staff = await Staff.findById({ _id: id })
        .select(
          "staffFirstName staffDesignationCount staffMiddleName staffDepartment staffClass staffSubject staffLastName photoId staffProfilePhoto staffDOB staffGender staffNationality staffMotherName staffMTongue staffCast staffCastCategory staffReligion staffBirthPlace staffBirthPlacePincode staffBirthPlaceState staffBirthPlaceDistrict staffDistrict staffPincode staffState staffAddress staffCurrentPincode staffCurrentDistrict staffCurrentState staffCurrentAddress staffPhoneNumber staffAadharNumber staffQualification staffDocuments staffAadharFrontCard staffAadharBackCard staffPreviousSchool staffBankName staffBankAccount staffBankAccountHolderName staffBankIfsc staffBankPassbook staffCasteCertificatePhoto staffStatus staffROLLNO staffPhoneNumber"
        )
        .populate({
          path: "user",
          select: "userLegalName userEmail",
        })
        .populate({
          path: "institute",
          select: "insName",
        })
        .lean()
        .exec();
    }
    if (staff) {
      // const sEncrypt = await encryptionPayload(staff);
      res.status(200).send({ message: "Staff Data To Member", staff });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getFullStudentInfo = async (req, res) => {
  try {
    var average_points = 0;
    const { id } = req.params;
    const { isApk } = req.query;
    if (isApk) {
      var student = await Student.findById({ _id: id })
        .select(
          "studentFirstName extraPoints batchCount student_prn_enroll_number studentMiddleName studentBankAccountHolderName studentLastName photoId studentProfilePhoto studentDOB studentGender studentNationality studentMotherName studentMTongue studentCast studentCastCategory studentReligion studentBirthPlace studentBirthPlacePincode studentBirthPlaceState studentBirthPlaceDistrict studentDistrict studentState studentPincode studentAddress studentCurrentPincode studentCurrentDistrict studentCurrentState studentCurrentAddress studentPhoneNumber studentAadharNumber studentParentsName studentParentsPhoneNumber studentFatherRationCardColor studentParentsOccupation studentParentsAnnualIncom studentDocuments studentAadharFrontCard studentAadharBackCard studentPreviousSchool studentBankName studentBankAccount studentBankIfsc studentBankPassbook studentCasteCertificatePhoto studentStatus studentGRNO studentROLLNO"
        )
        .populate({
          path: "user",
          select: "userLegalName userEmail",
        })
        .populate({
          path: "institute",
          select: "insName",
        })
        .populate({
          path: "studentClass",
          select: "className classStatus",
        })
        .lean()
        .exec();

      for (var docs of student.studentDocuments) {
        student.incomeCertificate =
          docs.documentName === "incomeCertificate"
            ? docs.documentKey
            : student.incomeCertificate;
        student.leavingTransferCertificate =
          docs.documentName === "leavingTransferCertificate"
            ? docs.documentKey
            : student.leavingTransferCertificate;
        student.nonCreamyLayerCertificate =
          docs.documentName === "nonCreamyLayerCertificate"
            ? docs.documentKey
            : student.nonCreamyLayerCertificate;
        student.domicileCertificate =
          docs.documentName === "domicileCertificate"
            ? docs.documentKey
            : student.domicileCertificate;
        student.nationalityCertificate =
          docs.documentName === "nationalityCertificate"
            ? docs.documentKey
            : student.nationalityCertificate;
        student.lastYearMarksheet =
          docs.documentName === "lastYearMarksheet"
            ? docs.documentKey
            : student.lastYearMarksheet;
        student.joiningTransferLetter =
          docs.documentName === "joiningTransferLetter"
            ? docs.documentKey
            : student.joiningTransferLetter;
        student.identityDocument =
          docs.documentName === "identityDocument"
            ? docs.documentKey
            : student.identityDocument;
      }
    } else {
      var student = await Student.findById({ _id: id })
        .select(
          "studentFirstName extraPoints batchCount studentMiddleName studentBankAccountHolderName studentLastName photoId studentProfilePhoto studentDOB studentGender studentNationality studentMotherName studentMTongue studentCast studentCastCategory studentReligion studentBirthPlace studentBirthPlacePincode studentBirthPlaceState studentBirthPlaceDistrict studentDistrict studentState studentPincode studentAddress studentCurrentPincode studentCurrentDistrict studentCurrentState studentCurrentAddress studentPhoneNumber studentAadharNumber studentParentsName studentParentsPhoneNumber studentFatherRationCardColor studentParentsOccupation studentParentsAnnualIncom studentDocuments studentAadharFrontCard studentAadharBackCard studentPreviousSchool studentBankName studentBankAccount studentBankIfsc studentBankPassbook studentCasteCertificatePhoto studentStatus studentGRNO studentROLLNO"
        )
        .populate({
          path: "user",
          select: "userLegalName userEmail",
        })
        .populate({
          path: "institute",
          select: "insName",
        })
        .populate({
          path: "studentClass",
          select: "className classStatus",
        })
        .lean()
        .exec();
    }
    average_points += student.extraPoints / student.batchCount;
    if (student) {
      // Add Another Encryption
      res
        .status(200)
        .send({ message: "Student Data To Member", student, average_points });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveDepartmentList = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("insName")
      .populate({
        path: "depart",
        select: "dName photo photoId dTitle classMasterCount classCount",
        populate: {
          path: "dHead",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto user",
          populate: {
            path: "user",
            select: "userBio userAbout",
          },
        },
      })
      .lean()
      .exec();
    if (institute) {
      // const iEncrypt = await encryptionPayload(institute);
      res.status(200).send({ message: "Success", institute });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.getOneDepartment = async (req, res) => {
  try {
    const { did } = req.params;
    if (did === "undefined") {
    } else {
      const department = await Department.findById({ _id: did })
        .select(
          "dName dAbout dTitle dEmail staffCount studentCount classCount dPhoneNumber photoId photo coverId cover election_date_setting"
        )
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
          path: "batches",
          select: "batchName batchStatus createdAt",
        })
        .populate({
          path: "departmentSelectBatch",
          select: "batchName batchStatus createdAt ApproveStudent",
          populate: {
            path: "classroom",
            select: "className classTitle",
            populate: {
              path: "ApproveStudent",
              select:
                "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
            },
          },
        })
        .populate({
          path: "displayPersonList",
          select: "displayTitle createdAt",
          populate: {
            path: "displayUser",
            select: "userLegalName username photoId profilePhoto",
          },
        })
        .lean()
        .exec();
      if (department) {
        // const oneEncrypt = await encryptionPayload(department);
        res.status(200).send({ message: "Success", department });
      } else {
        res.status(404).send({ message: "Failure" });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveCurrentBatchData = async (req, res) => {
  try {
    const { bid } = req.params;
    const batches = await Batch.findById({ _id: bid })
      .select("batchName batchStatus createdAt")
      .populate({
        path: "ApproveStudent",
        select: "studentFirstName studentLastName",
      })
      .lean()
      .exec();
    if (batches) {
      // const bEncrypt = await encryptionPayload(batches);
      res.status(200).send({ message: "Success", batches });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveClassMaster = async (req, res) => {
  try {
    const { did } = req.params;
    const classMaster = await ClassMaster.find({ department: did })
      .select("className classTitle classDivision")
      .populate({
        path: "department",
        select: "dName",
      })
      .lean()
      .exec();
    if (classMaster) {
      // const cEncrypt = await encryptionPayload(classMaster);
      res.status(200).send({ message: "ClassMaster Are here", classMaster });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveNewClass = async (req, res) => {
  var classRandomCodeHandler = () => {
    const c_1 = Math.floor(Math.random() * 9) + 1;
    const c_2 = Math.floor(Math.random() * 9) + 1;
    const c_3 = Math.floor(Math.random() * 9) + 1;
    const c_4 = Math.floor(Math.random() * 9) + 1;
    const c_5 = Math.floor(Math.random() * 9) + 1;
    const c_6 = Math.floor(Math.random() * 9) + 1;
    var r_class_code = `${c_1}${c_2}${c_3}${c_4}${c_5}${c_6}`;
    return r_class_code;
  };

  var result = classRandomCodeHandler();
  try {
    const { id, did, bid } = req.params;
    const {
      sid,
      classTitle,
      classHeadTitle,
      mcId,
      aggregatePassingPercentage,
      optionalSubjectCount,
    } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const masterClass = await ClassMaster.findById({ _id: mcId });
    const mCName = masterClass.className;
    const batch = await Batch.findById({ _id: bid });
    const staff = await Staff.findById({ _id: sid }).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${staff.user._id}` });
    const depart = await Department.findById({ _id: did }).populate({
      path: "dHead",
    });
    if (institute.classCodeList.includes(`${result}`)) {
    } else {
      const notify = new Notification({});
      const date = await todayDate();
      const classRoom = new Class({
        masterClassName: mcId,
        className: mCName,
        classTitle: classTitle,
        classHeadTitle: classHeadTitle,
        classCode: `${result}`,
        classStartDate: date,
        finalReportsSettings: {
          aggregatePassingPercentage: aggregatePassingPercentage,
        },
        optionalSubjectCount: optionalSubjectCount,
      });
      institute.classCodeList.push(`${result}`);
      institute.classRooms.push(classRoom._id);
      classRoom.institute = institute._id;
      batch.classroom.push(classRoom._id);
      batch.classCount += 1;
      masterClass.classDivision.push(classRoom._id);
      masterClass.classCount += 1;
      if (
        depart.departmentChatGroup.length >= 1 &&
        depart.departmentChatGroup.includes(`${staff._id}`)
      ) {
      } else {
        depart.departmentChatGroup.push(staff._id);
        depart.staffCount += 1;
      }
      classRoom.batch = batch._id;
      // batch.batchStaff.push(staff._id);
      // staff.batches = batch._id;
      staff.staffClass.push(classRoom._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = classHeadTitle;
      staff.designation_array.push({
        role: "Class Teacher",
        role_id: classRoom?._id,
      });
      classRoom.classTeacher = staff._id;
      depart.class.push(classRoom._id);
      depart.classCount += 1;
      user.classChat.push({
        isClassTeacher: "Yes",
        classes: classRoom._id,
      });
      classRoom.department = depart._id;
      notify.notifyContent = `you got the designation of ${classRoom.className} as ${classRoom.classHeadTitle}`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Class Designation";
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = institute._id;
      invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        institute.insName,
        user._id,
        user.deviceToken
      );
      await Promise.all([
        institute.save(),
        batch.save(),
        masterClass.save(),
        staff.save(),
        classRoom.save(),
        depart.save(),
        user.save(),
        notify.save(),
      ]);
      // const classEncrypt = await encryptionPayload(classRoom._id);
      res.status(200).send({
        message: "Successfully Created Class",
        classRoom: classRoom._id,
      });
      designation_alarm(
        user?.userPhoneNumber,
        "CLASS",
        institute?.sms_lang,
        classRoom?.className,
        classRoom?.classTitle,
        ""
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveNewSubject = async (req, res) => {
  try {
    const { id, cid, bid, did } = req.params;
    const { sid, subjectTitle, msid, subjectPassingMarks } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const classes = await Class.findById({ _id: cid }).populate({
      path: "classTeacher",
    });
    const subjectMaster = await SubjectMaster.findById({ _id: msid });
    // const batch = await Batch.findById({ _id: bid });
    const staff = await Staff.findById({ _id: sid }).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${staff.user._id}` });
    const depart = await Department.findById({ _id: did }).populate({
      path: "dHead",
    });
    const notify = new Notification({});
    const subject = new Subject({
      subjectTitle: subjectTitle,
      subjectName: subjectMaster.subjectName,
      subjectMasterName: subjectMaster._id,
      subjectOptional: subjectMaster.subjectType,
      setting: {
        subjectPassingMarks: subjectPassingMarks,
      },
    });
    classes.subject.push(subject._id);
    classes.subjectCount += 1;
    subjectMaster.subjects.push(subject._id);
    subjectMaster.subjectCount += 1;
    subject.class = classes._id;
    // if (String(classes.classTeacher._id) === String(staff._id)) {
    // } else {
    //   batch.batchStaff.push(staff._id);
    //   staff.batches = batch._id;
    // }
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
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      depart.dName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      subjectMaster.save(),
      classes.save(),
      // batch.save(),
      staff.save(),
      subject.save(),
      depart.save(),
      user.save(),
      notify.save(),
    ]);
    // const sEncrypt = await encryptionPayload(subject);
    res.status(200).send({
      message: "Successfully Created Subject",
      subject,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "DHEAD",
      institute?.sms_lang,
      subject?.subjectName,
      subject?.subjectTitle,
      classes?.className
    );
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveSubjectMaster = async (req, res) => {
  try {
    const { did } = req.params;
    const subjectMaster = await SubjectMaster.find({ department: did })
      .select("subjectName subjects subjectType")
      .lean()
      .exec();
    if (subjectMaster) {
      // const sEncrypt = await encryptionPayload(subjectMaster);
      res
        .status(200)
        .send({ message: "SubjectMaster Are here", subjectMaster });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveClassArray = async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid })
      .select("batchName batchStatus")
      .populate({
        path: "classroom",
        select:
          "className classDisplayPerson classStatus classAbout classTitle classCode photoId photo coverId cover",
        populate: {
          path: "classTeacher",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
      })
      .lean()
      .exec();
    if (batch) {
      // const bEncrypt = await encryptionPayload(batch);
      res.status(200).send({ message: "Classes Are here", batch });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveClassProfileSubject = async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
      .select(
        "className classTitle classHeadTitle classAbout subjectCount studentCount photoId photo coverId cover classStatus"
      )
      .populate({
        path: "classTeacher",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      })
      .populate({
        path: "batch",
        select: "batchName",
      })
      .populate({
        path: "department",
        select: "staffCount",
      })
      .populate({
        path: "displayPersonList",
        select: "displayTitle createdAt",
        populate: {
          path: "displayUser",
          select: "userLegalName username photoId profilePhoto",
        },
      })
      .lean()
      .exec();
    if (classes) {
      // const cEncrypt = await encryptionPayload(classes);
      res.status(200).send({ message: "create class data", classes });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveClassSubject = async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
      .select("className classTitle classHeadTitle classAbout classStatus")
      .populate({
        path: "subject",
        select: "subjectName subjectTitle subjectStatus subjectOptional",
      })
      .lean()
      .exec();
    if (classes) {
      // const cEncrypt = await encryptionPayload(classes);
      res.status(200).send({ message: "create class data", classes });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.fetchOneStaffDepartmentInfo = async (req, res) => {
  try {
    const { did } = req.params;
    const department = await Department.findById({ _id: did })
      .select(
        "dName dTitle photoId photo coverId staffCount classCount studentCount cover dAbout dEmail dPhoneNumber dSpeaker dVicePrinciple dAdminClerk dStudentPresident"
      )
      .populate({
        path: "dHead",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      })
      .populate({
        path: "institute",
        select: "insName financeStatus",
      })
      .populate({
        path: "userBatch",
        select: "batchName batchStatus createdAt classCount",
        populate: {
          path: "classroom",
          select: "className classTitle classStatus",
        },
      })
      .populate({
        path: "displayPersonList",
        select: "displayTitle createdAt",
        populate: {
          path: "displayUser",
          select: "userLegalName username photoId profilePhoto",
        },
      })
      .lean()
      .exec();
    if (department) {
      // const dEncrypt = await encryptionPayload(department);
      res.status(200).send({ message: "Department Profile Data", department });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.updateOneStaffDepartmentInfo = async (req, res) => {
  try {
    const { did } = req.params;
    const { dAbout, dEmail, dPhoneNumber } = req.body;
    const departmentInfo = await Department.findById({ _id: did });
    departmentInfo.dAbout = dAbout;
    departmentInfo.dEmail = dEmail;
    departmentInfo.dPhoneNumber = dPhoneNumber;
    await Promise.all([departmentInfo.save()]);
    res.status(200).send({ message: "Department Info Updates" });
  } catch (e) {
    console.log(e);
  }
};

exports.updateOneStaffClassInfo = async (req, res) => {
  try {
    const { cid } = req.params;
    await Class.findByIdAndUpdate(cid, req.body);
    // const cEncrypt = await encryptionPayload(classInfo);
    res.status(200).send({ message: "Class Info Updated" });
  } catch (e) {
    console.log(e);
  }
};

exports.allStaffDepartmentClassList = async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid })
      .select("batchName batchStatus")
      .populate({
        path: "classroom",
        select: "className classTitle classStatus photoId photo coverId cover",
        populate: {
          path: "classTeacher",
          select:
            "staffFirstName staffMiddleName staffLastName staffProfilePhoto",
        },
      })
      .lean()
      .exec();
    if (batch) {
      // const bEncrypt = await encryptionPayload(batch);
      res.status(200).send({ message: "Success", batch });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveNewBatch = async (req, res) => {
  try {
    const { did, id } = req.params;
    const department = await Department.findById({ _id: did });
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = new Batch({ ...req.body });
    department.batches.push(batch);
    department.batchCount += 1;
    batch.department = department;
    institute.batches.push(batch._id);
    batch.institute = institute;
    await Promise.all([department.save(), batch.save(), institute.save()]);
    // const bEncrypt = await encryptionPayload(batch._id);
    res.status(200).send({ message: "batch data", batch: batch._id });
  } catch {}
};

exports.retrieveNewClassMaster = async (req, res) => {
  try {
    const { id, did } = req.params;
    const { className } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const department = await Department.findById({ _id: did });
    const classroomMaster = new ClassMaster({
      className: className,
      institute: institute._id,
      department: did,
    });
    department.departmentClassMasters.push(classroomMaster._id);
    department.classMasterCount += 1;
    await Promise.all([classroomMaster.save(), department.save()]);
    // const cEncrypt = await encryptionPayload(classroomMaster);
    res.status(200).send({
      message: "Successfully Created MasterClasses",
      classroomMaster,
    });
  } catch {}
};

exports.retrieveNewSubjectMaster = async (req, res) => {
  try {
    const { id, did, bid } = req.params;
    const { subjectName, subjectType } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const departmentData = await Department.findById({ _id: did });
    const subjectMaster = new SubjectMaster({
      subjectName: subjectName,
      institute: institute._id,
      department: did,
      subjectType: subjectType,
    });
    departmentData.departmentSubjectMasters.push(subjectMaster._id);
    departmentData.subjectMasterCount += 1;
    await Promise.all([departmentData.save(), subjectMaster.save()]);
    // const sEncrypt = await encryptionPayload(subjectMaster);
    res.status(200).send({
      message: "Successfully Created Master Subject",
      subjectMaster,
    });
  } catch {}
};

exports.retrieveCurrentSelectBatch = async (req, res) => {
  try {
    const { did, bid } = req.params;
    const department = await Department.findById({ _id: did });
    const batches = await Batch.findById({ _id: bid });
    department.departmentSelectBatch = batches._id;
    department.userBatch = batches._id;
    batches.activeBatch = "Active";
    await Promise.all([department.save(), batches.save()]);
    // Add Another Encryption
    res.status(200).send({
      message: "Batch Detail Data",
      batches: batches._id,
      department: department.departmentSelectBatch,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveClass = async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
      .select(
        "className classTitle classCode classStartDate classStatus classHeadTitle studentCount photoId photo coverId cover subjectCount classAbout classDisplayPerson classStudentTotal"
      )
      .populate({
        path: "subject",
        select: "subjectName subjectTitle subjectStatus",
        populate: {
          path: "subjectTeacherName",
          select:
            "staffFirstName staffMiddleName staffLastName staffProfilePhoto",
        },
      })
      .populate({
        path: "batch",
        select: "batchName batchStatus",
      })
      .populate({
        path: "classTeacher",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      })
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "displayPersonList",
        select: "displayTitle createdAt",
        populate: {
          path: "displayUser",
          select: "userLegalName username photoId profilePhoto",
        },
      })
      .populate({
        path: "institute",
        select: "insName",
      })
      .lean()
      .exec();
    if (classes) {
      // const cEncrypt = await encryptionPayload(classes);
      res.status(200).send({ message: "Class Profile Data", classes });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveClassRequestArray = async (req, res) => {
  try {
    const { cid, fid } = req.params;
    var offline = 0;
    var online = 0;
    var exempt = 0;
    const fee = await Fees.findById({ _id: fid });
    const classes = await Class.findById({ _id: cid }).select(
      "offlineFeeCollection requestFeeStatus onlineFeeCollection exemptFeeCollection"
    );
    classes.offlineFeeCollection.forEach((off) => {
      if (off.feeId === `${fee._id}`) {
        offline += off.fee;
      }
    });
    classes.onlineFeeCollection.forEach((on) => {
      if (on.feeId === `${fee._id}`) {
        online += on.fee;
      }
    });
    classes.exemptFeeCollection.forEach((exe) => {
      if (exe.feeId === `${fee._id}`) {
        exempt += exe.fee;
      }
    });
    // Add Another Encryption
    res.status(200).send({
      message: "Class One Fee Amount Details",
      oneFeeRequestStatus: classes.requestFeeStatus,
      on: online,
      off: offline,
      exe: exempt,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveSubject = async (req, res) => {
  try {
    const { suid } = req.params;
    const subData = await Subject.findById({ _id: suid })
      .select("subjectName subjectStatus subjectTitle")
      .populate({
        path: "class",
        select: "className classStatus classTitle",
        populate: {
          path: "ApproveStudent",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO",
        },
      })
      .lean()
      .exec();
    if (subData) {
      // const sEncrypt = await encryptionPayload(subData);
      res
        .status(200)
        .send({ message: " Subject same as class catalog", subData });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveStaffCode = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("staffJoinCode insName")
      .lean()
      .exec();
    if (institute) {
      // const iEncrypt = await encryptionPayload(institute);
      res.status(200).send({ message: "Success", institute });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {}
};

exports.retrieveStudentCode = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("classCodeList insName")
      .lean()
      .exec();
    if (institute) {
      // const iEncrypt = await encryptionPayload(institute);
      res.status(200).send({ message: "Success", institute });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.replyAnnouncement = async (req, res) => {
  try {
    var institute_session = req.tokenData && req.tokenData.insId;
    var user_session = req.tokenData && req.tokenData.userId;
    const { aid } = req.params;
    const institute = await InstituteAdmin.findOne({ _id: institute_session });
    const user = await User.findOne({ _id: user_session });
    var replyAnn = await InsAnnouncement.findById({ _id: aid });
    var replyData = new ReplyAnnouncement({ ...req.body });
    replyAnn.reply.push(replyData._id);

    if (institute) {
      replyData.replyAuthorAsIns = institute._id;
      await Promise.all([replyData.save(), replyAnn.save()]);
      res.status(200).send({ message: "Reply" });
    } else if (user) {
      replyData.replyAuthorAsUser = user._id;
      await Promise.all([replyData.save(), replyAnn.save()]);
      res.status(200).send({ message: "Reply" });
    } else {
    }
  } catch {}
};

exports.retrieveStaffProfileStatus = async (req, res) => {
  try {
    const { sid } = req.params;
    const staff = await Staff.findById({ _id: sid })
      .select("staffStatus")
      .lean()
      .exec();
    if (staff) {
      // const sEncrypt = await encryptionPayload(staff);
      res.status(200).send({ message: "Success", staff });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveStudentProfileStatus = async (req, res) => {
  try {
    const { sid } = req.params;
    const student = await Student.findById({ _id: sid })
      .select("studentStatus")
      .lean()
      .exec();
    if (student) {
      // const sEncrypt = await encryptionPayload(student);
      res.status(200).send({ message: "Success", student });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveDisplayPersonArray = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("id")
      .populate({
        path: "displayPersonList",
        select: "displayTitle createdAt",
        populate: {
          path: "displayUser",
          select: "userLegalName username photoId profilePhoto",
        },
      })
      .lean()
      .exec();
    if (institute) {
      // const iEncrypt = await encryptionPayload(institute);
      res.status(200).send({ message: "Success", institute });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.updateDisplayPersonArray = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const user = await User.findById({ _id: `${req.body.displayUser}` });
    const notify = new Notification({});
    const display = new DisplayPerson({});

    display.displayTitle = req.body.displayTitle;
    display.displayUser = user._id;
    institute.displayPersonList.push(display._id);
    display.displayBy = institute._id;
    user.displayPersonArray.push(display._id);

    notify.notifyContent = `Congrats 🎉 for ${req.body.displayTitle} of the ${institute.insName}`;
    notify.notifySender = institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Display Person";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByPhoto = user._id;
    await Promise.all([
      institute.save(),
      display.save(),
      user.save(),
      notify.save(),
    ]);
    // const dEncrypt = await encryptionPayload(display);
    res.status(200).send({ message: "Success", display });
  } catch (e) {
    console.log(e);
  }
};

exports.updateDisplayPersonIns = async (req, res) => {
  try {
    const { did } = req.params;
    const display = await DisplayPerson.findById({ _id: did });
    display.displayTitle = req.body.displayTitle;
    display.displayUser = req.body.displayUser;
    await Promise.all([display.save()]);
    res.status(200).send({ message: "update Display Person" });
  } catch (e) {}
};

exports.deleteDisplayPersonArray = async (req, res) => {
  try {
    const { id, did, uid } = req.params;
    await InstituteAdmin.findByIdAndUpdate(id, {
      $pull: { displayPersonList: did },
    });
    await User.findByIdAndUpdate(uid, { $pull: { displayPersonArray: did } });
    await DisplayPerson.findByIdAndDelete({ _id: did });
    res.status(200).send({ message: "Deleted" });
  } catch {}
};

exports.retrieveStarAnnouncementArray = async (req, res) => {
  try {
    const { aid } = req.params;
    var institute_session = req.tokenData && req.tokenData.insId;
    var user_session = req.tokenData && req.tokenData.userId;
    const insAnn = await InsAnnouncement.findById({ _id: aid });
    if (institute_session) {
      var institute = await InstituteAdmin.findById({ _id: institute_session });
      if (
        insAnn.starList.length >= 1 &&
        insAnn.starList.includes(String(institute._id))
      ) {
        insAnn.starList.pull(institute._id);
        institute.starAnnouncement.pull(insAnn._id);
        await Promise.all([insAnn.save(), institute.save()]);
        res.status(200).send({ message: "Remove from Star By Ins" });
      } else {
        insAnn.starList.push(institute._id);
        institute.starAnnouncement.push(insAnn._id);
        await Promise.all([insAnn.save(), institute.save()]);
        res.status(200).send({ message: "Added to Star By Ins" });
      }
    } else if (user_session) {
      var user = await User.findById({ _id: user_session });
      if (
        insAnn.starList.length >= 1 &&
        insAnn.starList.includes(String(user._id))
      ) {
        insAnn.starList.pull(user._id);
        user.starAnnouncement.pull(insAnn._id);
        await Promise.all([insAnn.save(), user.save()]);
        res.status(200).send({ message: "Remove from Star By User" });
      } else {
        insAnn.starList.push(user._id);
        user.starAnnouncement.push(insAnn._id);
        await Promise.all([insAnn.save(), user.save()]);
        res.status(200).send({ message: "Added to Star By User" });
      }
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllStarArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { id } = req.params;
    const skip = (page - 1) * limit;
    const institute = await InstituteAdmin.findById({ _id: id }).populate({
      path: "starAnnouncement",
    });
    const announcement = await InsAnnouncement.find({
      _id: { $in: institute.starAnnouncement },
    })
      .select(
        "insAnnTitle insAnnPhoto insAnnDescription insAnnVisibility createdAt"
      )
      .populate({
        path: "reply",
        select: "replyText replyAuthorByIns replyAuthorByUser createdAt",
      })
      .populate({
        path: "institute",
        select: "insName photoId insProfilePhoto",
      })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip);
    // const aEncrypt = await encryptionPayload(announcement);
    res.status(200).send({ message: "Success", announcement });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllStarAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("id")
      .populate({
        path: "starAnnouncement",
        select:
          "insAnnTitle insAnnPhoto insAnnDescription insAnnVisibility createdAt",
        populate: {
          path: "reply",
          select: "replyText replyAuthorByIns replyAuthorByUser createdAt",
        },
      })
      .populate({
        path: "starAnnouncement",
        select:
          "insAnnTitle insAnnPhoto insAnnDescription insAnnVisibility createdAt",
        populate: {
          path: "institute",
          select: "insName photoId insProfilePhoto",
        },
      })
      .lean()
      .exec();
    // const iEncrypt = await encryptionPayload(institute);
    res.status(200).send({ message: "Success", institute });
  } catch {}
};

exports.retrieveRecoveryMailIns = async (req, res) => {
  try {
    const { id } = req.params;
    const { recoveryMail } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.recoveryMail = recoveryMail;
    await Promise.all([institute.save()]);
    // const iEncrypt = await encryptionPayload(institute.recoveryMail);
    res.status(200).send({
      message: "Recovery Mail updated",
      mail: institute.recoveryMail,
      status: true,
    });
  } catch {}
};

exports.retrieveInsFollowersArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { id } = req.params;
    const skip = (page - 1) * limit;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({ path: "followers" })
      .populate({ path: "userFollowersList" });

    const followers = await InstituteAdmin.find({
      _id: { $in: institute.followers },
    })
      .select("insName photoId insProfilePhoto name blockStatus")
      .limit(limit)
      .skip(skip);

    const uFollowers = await User.find({
      _id: { $in: institute.userFollowersList },
    })
      .select("userLegalName photoId profilePhoto username blockStatus")
      .limit(limit)
      .skip(skip);
    // Add Another Encryption
    var mergeArray = [...followers, ...uFollowers];
    var get_array = shuffleArray(mergeArray);
    res.status(200).send({
      message: "Followers List",
      iFollowers: followers,
      uFollowers: uFollowers,
      mergerArray: get_array,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveInsFollowersArrayWithId = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("followers")
      .lean()
      .exec();
    // const iEncrypt = await encryptionPayload(institute?.followers);
    res.status(200).send({
      message: "Followers List",
      iFollowers: institute?.followers ? institute?.followers : [],
    });
  } catch (e) {
    console.log(e);
  }
};
exports.retrieveInsFollowingArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { id } = req.params;
    const skip = (page - 1) * limit;

    const institute = await InstituteAdmin.findById({ _id: id }).populate({
      path: "following",
    });

    const following = await InstituteAdmin.find({
      _id: { $in: institute.following },
    })
      .select("insName photoId insProfilePhoto name blockStatus")
      .limit(limit)
      .skip(skip);
    // const iEncrypt = await encryptionPayload(following);
    res.status(200).send({ message: "Following List", following: following });
  } catch {}
};

exports.retrieveInsFollowingArrayWithId = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("following")
      .lean()
      .exec();

    res.status(200).send({
      message: "Following List",
      following: institute?.following ? institute?.following : [],
    });
  } catch {}
};
exports.retrieveDepartmentAllBatch = async (req, res) => {
  try {
    const { did } = req.params;
    const department = await Department.findById({ _id: did })
      .select("id")
      .populate({
        path: "batches",
        select: "batchName batchStatus createdAt",
      })
      .populate({
        path: "departmentSelectBatch",
        select: "batchName batchStatus createdAt",
      })
      .lean()
      .exec();
    if (department) {
      // Add Another Encryption
      res.status(200).send({
        message: "Success",
        departmentActiveBatch: department.departmentSelectBatch,
        allBatch: department.batches,
      });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveApproveStudentRequest = async (req, res) => {
  try {
    const { id, sid, cid, did, bid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var student = await Student.findById({ _id: sid }).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${student.user._id}` });
    var classes = await Class.findById({ _id: cid });
    const depart = await Department.findById({ _id: did });
    var batch = await Batch.findById({ _id: bid });
    const notify = new Notification({});
    const aStatus = new Status({});
    for (let subjChoose of student?.studentOptionalSubject) {
      const subject = await Subject.findById(subjChoose);
      subject.optionalStudent.push(student?._id);
      await subject.save();
    }
    student.studentStatus = req.body.status;
    institute.ApproveStudent.push(student._id);
    admins.studentArray.push(student._id);
    admins.studentCount += 1;
    institute.student.pull(sid);
    institute.studentCount += 1;
    classes.strength += 1;
    classes.ApproveStudent.push(student._id);
    classes.studentCount += 1;
    classes.student.pull(sid);
    student.studentGRNO = `${
      institute?.gr_initials ? institute?.gr_initials : `Q`
    }${institute.ApproveStudent.length}`;
    student.studentROLLNO = classes.ApproveStudent.length;
    student.studentClass = classes._id;
    student.studentAdmissionDate = new Date().toISOString();
    depart.ApproveStudent.push(student._id);
    depart.studentCount += 1;
    student.department = depart._id;
    batch.ApproveStudent.push(student._id);
    student.batches = batch._id;
    student.batchCount += 1;
    notify.notifyContent = `${student.studentFirstName}${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} joined as a Student of Class ${
      classes.className
    } of ${batch.batchName}`;
    notify.notifySender = cid;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Approve Student";
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    aStatus.content = `Welcome to ${institute.insName}. Your application for joining as student  has been accepted by ${institute.insName}. Enjoy your learning in ${classes.className} - ${classes.classTitle}.`;
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    invokeFirebaseNotification(
      "Student Approval",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      admins.save(),
      classes.save(),
      depart.save(),
      batch.save(),
      student.save(),
      institute.save(),
      user.save(),
      notify.save(),
      aStatus.save(),
    ]);
    // const cEncrypt = await encryptionPayload(classes._id);
    res.status(200).send({
      message: `Welcome To The Institute ${student.studentFirstName} ${student.studentLastName}`,
      classes: classes._id,
    });
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
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveRejectStudentRequest = async (req, res) => {
  try {
    const { id, sid, cid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const classes = await Class.findById({ _id: cid });
    const aStatus = new Status({});
    student.studentStatus = req.body.status;
    institute.student.pull(sid);
    classes.student.pull(sid);
    aStatus.content = `Your application for joining as student in ${institute.insName} is being rejected. Please follow up with institute for any queries.`;
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    await Promise.all([
      institute.save(),
      classes.save(),
      student.save(),
      user.save(),
      aStatus.save(),
    ]);
    // const cEncrypt = await encryptionPayload(classes._id);
    res.status(200).send({
      message: `Application Rejected ${student.studentFirstName} ${student.studentLastName}`,
      classes: classes._id,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrievePendingRequestArray = async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
      .select("className classStatus classTitle")
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
      })
      .lean()
      .exec();
    // const cEncrypt = await encryptionPayload(classes);
    res.status(200).send({ message: "Pending Request", classes });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveApproveCatalogArray = async (req, res) => {
  try {
    const { cid } = req.params;
    const currentDate = new Date();
    const currentDateLocalFormat = currentDate.toISOString().split("-");
    const day =
      +currentDateLocalFormat[2].split("T")[0] > 9
        ? +currentDateLocalFormat[2].split("T")[0]
        : `0${+currentDateLocalFormat[2].split("T")[0]}`;
    const month =
      +currentDateLocalFormat[1] > 9
        ? +currentDateLocalFormat[1]
        : `0${+currentDateLocalFormat[1]}`;
    const year = +currentDateLocalFormat[0];
    const classes = await Class.findById({ _id: cid })
      .select(
        "className classStatus classTitle exams boyCount girlCount studentCount"
      )
      .populate({
        path: "ApproveStudent",
        select: "leave",
        populate: {
          path: "leave",
          match: {
            date: { $in: [`${day}/${month}/${year}`] },
          },
          select: "date",
        },
      })
      .populate({
        path: "ApproveStudent",
        select:
          "studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO",
        populate: {
          path: "user",
          select: "userLegalName username",
        },
      })
      .lean()
      .exec();

    classes?.ApproveStudent.sort(function (st1, st2) {
      return parseInt(st1.studentROLLNO) - parseInt(st2.studentROLLNO);
    });
    // const cEncrypt = await encryptionPayload(classes);
    res.status(200).send({ message: "Approve catalog", classes: classes });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveDepartmentStaffArray = async (req, res) => {
  try {
    const { did } = req.params;
    const department = await Department.findById({ _id: did })
      .select("dName")
      .populate({
        path: "departmentChatGroup",
        select:
          "staffFirstName staff_biometric_id staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
        populate: {
          path: "user",
          select: "username userLegalName photoId profilePhoto",
        },
      });
    // const dEncrypt = await encryptionPayload(department);
    res.status(200).send({ message: "Department Staff List", department });
  } catch {}
};

exports.retrieveInstituteTwoArray = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).select(
      "id followers following"
    );
    // const iEncrypt = await encryptionPayload(institute);
    res.status(200).send({ message: "2-List Array", institute });
  } catch {}
};

exports.retrieveOneAnnouncement = async (req, res) => {
  try {
    const { aid } = req.params;
    const announcement = await InsAnnouncement.findById({ _id: aid })
      .select(
        "insAnnTitle insAnnDescription insAnnPhoto insAnnVisibilty starList createdAt"
      )
      .populate({
        path: "reply",
        select: "replyText createdAt",
        populate: {
          path: "replyAuthorAsIns",
          select: "insName name photoId insProfilePhoto",
        },
      })
      .populate({
        path: "institute",
        select: "insName name photoId insProfilePhoto",
      })
      .populate({
        path: "reply",
        select: "replyText createdAt",
        populate: {
          path: "replyAuthorAsUser",
          select: "userLegalName username photoId profilePhoto",
        },
      })
      .populate({
        path: "announcementDocument",
        select: "documentType documentName documentKey",
      });
    // const aEncrypt = await encryptionPayload(announcement);
    res.status(200).send({ message: "One Announcement", announcement });
  } catch (e) {
    console.log(e);
  }
};

exports.updateDepartmentDisplayPersonArray = async (req, res) => {
  try {
    const { did } = req.params;
    const department = await Department.findById({ _id: did });
    const user = await User.findById({ _id: `${req.body.displayUser}` });
    const notify = new Notification({});
    const display = new DisplayPerson({});

    display.displayTitle = req.body.displayTitle;
    display.displayUser = user._id;
    department.displayPersonList.push(display._id);
    display.displayBy = department._id;
    user.displayPersonArray.push(display._id);

    notify.notifyContent = `Congrats 🎉 for ${req.body.displayTitle} of the ${department.dName}`;
    notify.notifySender = department._id;
    notify.notifyCategory = "Display Person";
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByPhoto = user._id;
    await Promise.all([
      department.save(),
      display.save(),
      user.save(),
      notify.save(),
    ]);
    // const dEncrypt = await encryptionPayload(display);
    res.status(200).send({ message: "Success", display });
  } catch (e) {
    console.log(e);
  }
};

exports.updateClassDisplayPersonArray = async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid });
    const user = await User.findById({ _id: `${req.body.displayUser}` });
    const notify = new Notification({});
    const display = new DisplayPerson({});

    display.displayTitle = req.body.displayTitle;
    display.displayUser = user._id;
    classes.displayPersonList.push(display._id);
    display.displayBy = classes._id;
    user.displayPersonArray.push(display._id);

    notify.notifyContent = `Congrats 🎉 for ${req.body.displayTitle} of the ${classes.className}`;
    notify.notifySender = classes._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Display Person";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByPhoto = user._id;
    await Promise.all([
      classes.save(),
      display.save(),
      user.save(),
      notify.save(),
    ]);
    // const dEncrypt = await encryptionPayload(display);
    res.status(200).send({ message: "Success", display });
  } catch (e) {
    console.log(e);
  }
};

exports.updateLeavingCertificateQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findByIdAndUpdate(id, req.body);
    await institute.save();
    res.status(200).send({ message: "Editable Leaving Info Updated" });
  } catch {}
};

exports.retrieveLocationPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findByIdAndUpdate(id, req.body);
    await institute.save();
    res.status(200).send({ message: "Location Permission Updated" });
  } catch (e) {
    console.log(e);
  }
};

exports.getProfileOneQueryUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const institute = await InstituteAdmin.findOne({ name: username })
      .select(
        "insName status photoId insProfilePhoto questionCount pollCount insAffiliated insEditableText insEditableTexts activateStatus accessFeature coverId insRegDate departmentCount announcementCount admissionCount insType insMode insAffiliated insAchievement joinedCount staffCount studentCount insProfileCoverPhoto followersCount name followingCount postCount insAbout insEmail insAddress insEstdDate createdAt insPhoneNumber insAffiliated insAchievement "
      )
      .lean()
      .exec();
    // const iEncrypt = await encryptionPayload(institute);
    res.status(200).send({ message: "Limit Post Ins", institute });
  } catch {}
};

exports.deactivateInstituteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ddate, password } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const comparePassword = bcrypt.compareSync(password, institute.insPassword);
    if (comparePassword) {
      institute.activeStatus = status;
      institute.activeDate = ddate;
      await institute.save();
      // const iEncrypt = await encryptionPayload(institute.activeStatus);
      res.status(200).send({
        message: "Deactivated Account",
        status: institute.activeStatus,
      });
    } else {
      res.status(404).send({ message: "Bad Request" });
    }
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.retrieveMergeStaffStudent = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { did } = req.params;
    const skip = (page - 1) * limit;
    const depart = await Department.findById({ _id: did }).select(
      "id departmentChatGroup ApproveStudent"
    );

    const staff = await Staff.find({ _id: { $in: depart.departmentChatGroup } })
      .limit(limit)
      .skip(skip)
      .select(
        "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
      )
      .populate({
        path: "user",
        select: "username userLegalName photoId profilePhoto",
      });

    const student = await Student.find({ _id: { $in: depart.ApproveStudent } })
      .limit(limit)
      .skip(skip)
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO"
      )
      .populate({
        path: "user",
        select: "username userLegalName photoId profilePhoto",
      });

    var mergeDepart = [...staff, ...student];
    // const mEncrypt = await encryptionPayload(mergeDepart);
    res
      .status(200)
      .send({ message: "Merge Staff and Student", merge: mergeDepart });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveCertificateEditableDetailQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await InstituteAdmin.findById(id)
      .select("insAffiliated insEditableText_one insEditableText_two")
      .lean()
      .exec();
    // const dEncrypt = await encryptionPayload(detail);
    res.status(200).send({ message: "Editable Detail 👏", detail: detail });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveCertificateEditableQuery = async (req, res) => {
  try {
    const { id } = req.params;
    await InstituteAdmin.findByIdAndUpdate(id, req.body);
    res.status(200).send({ message: "Thanks for Editable 👏", status: true });
  } catch (e) {
    console.log(e);
  }
};

exports.getStudentFormQuery = async (req, res) => {
  try {
    if (!req.params.id)
      throw "Please send institute id to perform task of student form setting";
    const { id } = req.params;
    const institute = await InstituteAdmin.findById(id).select(
      "studentFormSetting admissionDepart"
    );
    // const sEncrypt = await encryptionPayload(institute.studentFormSetting);
    res.status(200).send({
      message: "Student form setting details",
      studentFormSetting: institute.studentFormSetting,
      admissionId: institute?.admissionDepart,
    });
  } catch (e) {
    res.status(400).send({
      message: e,
    });
  }
};

exports.getStaffFormQuery = async (req, res) => {
  try {
    if (!req.params.id)
      throw "Please send institute id to perform task of staff form setting";
    const { id } = req.params;
    const institute = await InstituteAdmin.findById(id).select(
      "staffFormSetting"
    );
    // const sEncrypt = await encryptionPayload(institute.staffFormSetting);
    res.status(200).send({
      message: "Staff form setting details",
      staffFormSetting: institute.staffFormSetting,
    });
  } catch (e) {
    res.status(400).send({
      message: e,
    });
  }
};

exports.settingFormUpdate = async (req, res) => {
  try {
    if (!req.params.id) throw "Please send institute id to perform task";
    const one_ins = await InstituteAdmin.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.status(200).send({
      message: "form updated successfully 👏",
    });
    const all_student = await Student.find({
      $and: [
        { _id: { $in: one_ins?.ApproveStudent } },
        { studentStatus: "Approved" },
      ],
    }).select("form_status");
    for (var ref of all_student) {
      ref.form_status = "Not Filled";
      await ref.save();
    }
  } catch (e) {
    res.status(400).send({
      message: e,
    });
  }
};

exports.updateInstituteUnBlock = async (req, res) => {
  try {
    var institute_session = req.tokenData && req.tokenData.insId;
    const { blockId } = req.query;
    var institute = await InstituteAdmin.findById({ _id: institute_session });
    var sinstitute = await InstituteAdmin.findById({ _id: blockId });

    if (institute?.block_institute?.includes(`${sinstitute._id}`)) {
      institute.block_institute.pull(sinstitute._id);
      sinstitute.blockedBy.pull(institute._id);
      if (institute.blockCount >= 1) {
        institute.blockCount -= 1;
      }
      await Promise.all([institute.save(), sinstitute.save()]);
      res
        .status(200)
        .send({ message: "You are UnBlocked able to follow ", unblock: true });
    } else {
      res
        .status(200)
        .send({ message: "You are Already UnBlocked", unblock: false });
    }
  } catch (e) {
    console.log("UIBU", e);
  }
};

exports.retrieveInstituteReportBlock = async (req, res) => {
  try {
    var institute_session = req.tokenData && req.tokenData.insId;
    const { blockId } = req.query;
    var institute = await InstituteAdmin.findById({ _id: institute_session });
    var sinstitute = await InstituteAdmin.findById({ _id: blockId });

    if (sinstitute?.isUniversal === "Universal") {
      res.status(200).send({ message: "You're unable to block universal A/c" });
    } else {
      if (institute?.block_institute?.includes(`${sinstitute._id}`)) {
        res.status(200).send({ message: "You are Already Blocked" });
      } else {
        institute.block_institute.push(sinstitute._id);
        sinstitute.blockedBy.push(institute._id);
        if (institute.blockCount >= 1) {
          institute.blockCount += 1;
        }
        await Promise.all([institute.save(), sinstitute.save()]);
        res.status(200).send({
          message: "You are Blocked not able to follow ",
          block: true,
        });
        try {
          sinstitute.followers?.pull(institute_session);
          institute.following?.pull(blockId);
          if (institute.followingCount > 0) {
            institute.followingCount -= 1;
          }
          if (sinstitute.followersCount > 0) {
            sinstitute.followersCount -= 1;
          }

          const post = await Post.find({ author: `${sinstitute._id}` });
          post.forEach(async (ele) => {
            if (institute?.posts?.includes(`${ele._id}`)) {
              institute.posts.pull(ele._id);
            }
          });
          await institute.save();

          const posts = await Post.find({ author: `${institute._id}` });
          posts.forEach(async (ele) => {
            if (sinstitute?.posts?.includes(`${ele._id}`)) {
              sinstitute.posts.pull(ele._id);
            }
          });
          await sinstitute.save();

          const post_count = await Post.find({ author: `${sinstitute._id}` });
          post_count.forEach(async (ele) => {
            ele.authorFollowersCount = sinstitute.followersCount;
            await ele.save();
          });
          const post_counts = await Post.find({ author: `${institute._id}` });
          post_counts.forEach(async (ele) => {
            ele.authorFollowersCount = institute.followersCount;
            await ele.save();
          });
          //
        } catch {
          res.status(500).send({ error: "error" });
        }
      }
    }
  } catch (e) {
    console.log("UIBU", e);
  }
};

exports.renderStats = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😡",
        access: false,
      });
    const stats = await InstituteAdmin.findById({ _id: id }).select(
      "departmentCount staffCount studentCount insProfileCoverPhoto insProfilePhoto"
    );
    // const statsEncrypt = await encryptionPayload(stats);
    res.status(200).send({
      message: "Check some stats 😀",
      stats,
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};
