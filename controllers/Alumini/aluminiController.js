const InstituteAdmin = require("../../models/InstituteAdmin");
const Student = require("../../models/Student");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const Notification = require("../../models/notification");
const Admin = require("../../models/superAdmin");
const Department = require("../../models/Department");
const {
  uploadDocFile,
  getFileStream,
  deleteFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const Alumini = require("../../models/Alumini/Alumini");
const AluminiRegister = require("../../models/Alumini/AluminiRegister");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const { nested_document_limit } = require("../../helper/databaseFunction");
const { designation_alarm } = require("../../WhatsAppSMS/payload");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");
const { handle_undefined } = require("../../Handler/customError");
const { generate_hash_pass } = require("../../helper/functions");

exports.renderNewAluminiQuery = async (req, res) => {
  try {
    const { id, sid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff.user}` });
    const alumini = new Alumini({ ...req.body });
    const notify = new Notification({});
    staff.aluminiDepartment.push(alumini?._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = "Alumini Head";
    alumini.alumini_head = staff._id;
    institute.aluminiDepart.push(alumini?._id);
    institute.aluminiStatus = "Enable";
    alumini.institute = institute._id;
    notify.notifyContent = `you got the designation of as Alumini Head`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Alumini Designation";
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
      staff.save(),
      alumini.save(),
      user.save(),
      notify.save(),
    ]);
    // const fEncrypt = await encryptionPayload(alumini._id);
    res.status(200).send({
      message: "Successfully Assigned Staff",
      alumini: alumini?._id,
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "ALUMINI",
      institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderAluminiDashboardQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_alumini = await Alumini.findById({ _id: aid })
      .select(
        "certifcate_given_count register_form_count success_story_count alumini_passage created_at "
      )
      .populate({
        path: "alumini_head",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      })
      .populate({
        path: "institute",
        select: "insName",
      });

    res.status(200).send({
      message: "Explore Alumini Dashboard",
      access: true,
      one_alumini: one_alumini,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAluminiNewRegisterFormQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_alumini = await Alumini.findById({ _id: aid });
    const new_query = new AluminiRegister({ ...req.body });
    new_query.alumini = one_alumini?._id;
    one_alumini.register_form.push(new_query?._id);
    one_alumini.register_form_count += 1;
    await Promise.all([one_alumini.save(), new_query.save()]);

    res
      .status(200)
      .send({ message: "Explore New Register Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAluminiAllRegistrationArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;
    if (!aid && !status)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_alumini = await Alumini.findById({ _id: aid }).select(
      "register_form"
    );
    const all_register = await AluminiRegister.find({
      $and: [
        { _id: { $in: one_alumini?.register_form } },
        { certificate_status: status },
      ],
    })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "alumini",
        select: "_id",
      });

    if (all_register?.length > 0) {
      res.status(200).send({
        message: "Explore All Registration",
        access: true,
        all_register: all_register,
      });
    } else {
      res.status(200).send({
        message: "No Registration",
        access: false,
        all_register: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderGiveAluminiCertificateQuery = async (req, res) => {
  try {
    const { rid } = req.params;
    if (!rid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const register = await AluminiRegister.findById({ _id: rid });
    const one_alumini = await Alumini.findById({ _id: `${register?.alumini}` });
    register.certificate_status = "Given";
    one_alumini.certifcate_given_count += 1;
    if (one_alumini?.register_form_count > 0) {
      one_alumini.register_form_count -= 1;
    }
    await Promise.all([register.save(), one_alumini.save()]);
    res.status(200).send({
      message: "Explore New Alumini with Certificate Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAluminiAllProminentArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_alumini = await Alumini.findById({ _id: aid })
      .select("prominent_alumini")
      .populate({
        path: "prominent_alumini",
        populate: {
          path: "department",
          select: "dName",
        },
      });
    const all_prominent = await nested_document_limit(
      page,
      limit,
      one_alumini?.prominent_alumini
    );

    if (all_prominent?.length > 0) {
      res.status(200).send({
        message: "Explore All Prominent",
        access: true,
        all_prominent: all_prominent,
      });
    } else {
      res.status(200).send({
        message: "No Prominent",
        access: false,
        all_prominent: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAluminiNewProminentQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_alumini = await Alumini.findById({ _id: aid });
    one_alumini.prominent_alumini.push({
      name: req.body?.name,
      profile_photo: req.body?.profile_photo,
      department: req.body?.department,
      batch: req.body?.batch,
      company_name: req.body?.company_name,
      job_profile: req.body?.job_profile,
    });
    one_alumini.success_story_count += 1;
    res
      .status(200)
      .send({ message: "Explore New Success Story", access: true });
  } catch (e) {
    console.log(e);
  }
};

// exports.retrievePollQuestionText = async (req, res) => {
//   try {
//     const { aid } = req.params;
//     if (!aid)
//       return res.status(200).send({
//         message: "Their is a bug need to fixed immediately",
//         access: false,
//       });
//     const one_alumini = await Alumini.findById({ _id: aid })
//     if (req.body.pollAnswer.length >= 2 && req.body.pollAnswer.length <= 5) {
//       var poll = new Poll({ ...req.body });
//       for (let i = 0; i < req.body.pollAnswer.length; i++) {
//         poll.poll_answer.push({
//           content: req.body.pollAnswer[i].content,
//         });
//       }
//       one_alumini.feed_question.push(poll?._id)
//       one_alumini.feed
//       poll.duration_date = Close.end_poll(req.body.day);
//       await Promise.all([user.save(), post.save(), poll.save()]);
//       // Add Another Encryption
//       res.status(201).send({ message: "Poll is create", poll, post });
//       if (user.userFollowers.length >= 1) {
//         user.userFollowers.forEach(async (ele) => {
//           ele.userPosts.push(post._id);
//           await ele.save();
//         });
//       }
//       if (user.userCircle.length >= 1) {
//         user.userCircle.forEach(async (ele) => {
//           ele.userPosts.push(post._id);
//           await ele.save();
//         });
//       }
//       if (req.body?.hashtag?.length > 0) {
//         req.body?.hashtag?.forEach(async (ele) => {
//           const hash = await HashTag.findById({ _id: `${ele}` }).select(
//             "hashtag_follower"
//           );
//           const users = await User.find({
//             _id: { $in: hash?.hashtag_follower },
//           });
//           users?.forEach(async (user) => {
//             if (user.userPosts?.includes(post._id)) {
//             } else {
//               user.userPosts.push(post._id);
//             }
//             await user.save();
//           });
//         });
//       }
//     } else {
//       res
//         .status(422)
//         .send({ message: "Not Valid Poll Option Min Max Critiriea" });
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };
