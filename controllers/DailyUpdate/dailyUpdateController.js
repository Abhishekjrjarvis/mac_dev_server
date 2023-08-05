const Subject = require("../../models/Subject");
const Student = require("../../models/Student");
const User = require("../../models/User");
const SubjectUpdate = require("../../models/SubjectUpdate");
const { uploadDocFile, deleteFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
// const { customMergeSort } = require("../../Utilities/Sort/custom_sort");
const { dailyChatFirebaseQuery } = require("../../Firebase/dailyChat");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const StudentNotification = require("../../models/Marks/StudentNotification");
const ChapterTopic = require("../../models/Academics/ChapterTopic");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const { dailyUpdateTimer } = require("../../Service/close");

exports.getAlldailyUpdate = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send subject id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const subject = await Subject.findById(req.params.sid)
      .select("dailyUpdate")
      .lean()
      .exec();

    const dailyUpdate = await SubjectUpdate.find({
      _id: { $in: subject.dailyUpdate },
    })
      .select("updateDate updateDescription date upadateImage createdAt")
      .skip(dropItem)
      .limit(itemPerPage)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    // const dailyEncrypt = await encryptionPayload(dailyUpdate);
    res.status(200).send({
      message: "all daily subject update list",
      dailyUpdate,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.createDailyUpdate = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send subject id to perform task";
    const { arr, rec_status } = req.body;
    const subject = await Subject.findById(req.params.sid)
      .populate({
        path: "subjectTeacherName",
        select: "id",
        populate: {
          path: "user",
          select: "id",
        },
      })
      .populate({
        path: "class",
        select: "ApproveStudent",
      });
    const dailyUpdate = new SubjectUpdate({
      subject: req.params.sid,
      updateDescription: req.body?.updateDescription,
      date: req.body?.date,
    });
    var all_topic = await ChapterTopic.find({ _id: { $in: arr } });
    for (var val of all_topic) {
      dailyUpdate.daily_topic.push({
        topic: val?._id,
        status: rec_status,
      });
      if (`${rec_status}` === "Lecture") {
        subject.lecture_analytic.lecture_complete += 1;
      } else if (`${rec_status}` === "Practical") {
        subject.practical_analytic.practical_complete += 1;
      } else if (`${rec_status}` === "Tutorial") {
        subject.tutorial_analytic.tutorial_complete += 1;
      } else {
      }
    }
    if (req?.files) {
      for (let file of req?.files) {
        const obj = {
          documentType: "",
          documentName: "",
          documentSize: "",
          documentKey: "",
          documentEncoding: "",
        };
        obj.documentType = file.mimetype;
        obj.documentName = file.originalname;
        obj.documentEncoding = file.encoding;
        obj.documentSize = file.size;
        var results = await uploadDocFile(file);
        obj.documentKey = results.Key;
        dailyUpdate?.upadateImage.push(obj);
        await dailyChatFirebaseQuery(
          `${subject?.id}`,
          `${results.Key}`,
          "dailyUpdate",
          `${subject.subjectTeacherName?.user._id}`,
          `${dailyUpdate.updateDescription}`
        );
        await unlinkFile(file.path);
      }
    }
    subject.dailyUpdate?.push(dailyUpdate._id);
    for (let stu of subject?.class?.ApproveStudent) {
      var notify = new StudentNotification({});
      const student = await Student.findById({ _id: `${stu}` });
      const student_user = await User.findById({ _id: `${student?.user}` });
      notify.notifyContent = `Check out the recent daily updates of ${subject?.subjectName}`;
      notify.notifySender = subject._id;
      notify.notifyReceiever = student_user._id;
      notify.dailyUpdateId = dailyUpdate._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      student_user.activity_tab.push(notify._id);
      notify.notifyBySubjectPhoto.subject_id = subject?._id;
      notify.notifyBySubjectPhoto.subject_name = subject.subjectName;
      notify.notifyBySubjectPhoto.subject_cover = "subject-cover.png";
      notify.notifyBySubjectPhoto.subject_title = subject.subjectTitle;
      notify.notifyCategory = "Daily Update";
      notify.redirectIndex = 14;
      //
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "Daily Update",
        student_user._id,
        student_user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([student.save(), student_user.save(), notify.save()]);
    }
    await Promise.all([dailyUpdate.save(), subject.save()]);
    // const dEncrypt = await encryptionPayload(dailyUpdate);
    res.status(201).send({
      message: "Daily updates created successfully 👍",
      dailyUpdate,
      access: true,
    });

    subject?.class?.ApproveStudent?.forEach(async (sutId) => {
      const students = await Student.findById(sutId);
      students.dailyUpdate?.push(dailyUpdate._id);
      await students.save();
    });
  } catch (e) {
    console.log(e);
  }
};

exports.editDailyUpdate = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send daily update id to perform task";
    const dailyUpdate = await SubjectUpdate.findById(req.params.sid);
    if (req.body?.updateDescription) {
      dailyUpdate.updateDescription = req.body?.updateDescription;
    }
    if (req.body?.deleteImage?.length) {
      for (let dimage of req.body?.deleteImage) {
        await deleteFile(dimage);
        dailyUpdate?.upadateImage?.pull(dimage);
      }
    }
    if (req?.files) {
      for (let file of req.files) {
        const results = await uploadPostImageFile(file);
        answer.answerImage.push(results.Key);
        await unlinkFile(file.path);
      }
    }

    await dailyUpdate.save();
    res.status(201).send({
      message: "Daily updates edited successfully 👍",
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.getAlldailyUpdateStudent = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send student id to perform task";
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const student = await Student.findById(req.params.sid);
    if (req.query?.subjectId) {
      const dailyUpdate = await SubjectUpdate.find({
        _id: { $in: student.dailyUpdate },
        subject: { $eq: `${req.query?.subjectId}` },
      })
        .sort({ createdAt: -1 })
        .limit(itemPerPage)
        .skip(dropItem)
        .select("updateDate updateDescription date upadateImage createdAt")
        .populate({
          path: "subject",
          select: "subjectTeacherName",
          populate: {
            path: "subjectTeacherName",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        });
      // const allEncrypt = await encryptionPayload(dailyUpdate);
      res.status(200).send({
        message: "all daily subject update list in student side",
        dailyUpdate,
      });
    } else {
      const dailyUpdate = await SubjectUpdate.find({
        _id: { $in: student.dailyUpdate },
      })
        .sort({ createdAt: -1 })
        .limit(itemPerPage)
        .skip(dropItem)
        .select("updateDate updateDescription date upadateImage createdAt")
        .populate({
          path: "subject",
          select: "subjectTeacherName",
          populate: {
            path: "subjectTeacherName",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        });
      // const allEncrypt = await encryptionPayload(dailyUpdate);
      res.status(200).send({
        message: "all daily subject update list in student side",
        dailyUpdate,
      });
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};
