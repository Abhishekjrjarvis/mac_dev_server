const Department = require("../../models/Department");
const User = require("../../models/User");
const Student = require("../../models/Student");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const Participate = require("../../models/ParticipativeEvent/participate");
const Class = require("../../models/Class");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

exports.retrieveNewParticipateQuery = async (req, res) => {
  try {
    const { did } = req.params;
    var depart = await Department.findById({ _id: did });
    var part = new Participate({ ...req.body });
    depart.participate_event.push(part._id);
    depart.participate_event_count += 1;
    part.event_fee = parseInt(req.body?.event_fee);
    part.department = depart._id;
    part.event_app_last_date = new Date(`${req.body?.lastDate}`).toISOString();
    part.event_date = new Date(`${req.body?.date}`).toISOString();
    part.event_classes.push(...req.body?.classes);
    await Promise.all([depart.save(), part.save()]);
    res.status(200).send({
      message: "New Participate Event Application will be available",
      status: true,
    });

    var all_student = await Student.find({
      _id: { $in: depart?.ApproveStudent },
    }).select("user notification");
    all_student?.forEach(async (ele) => {
      const notify = new StudentNotification({});
      const user = await User.findById({ _id: `${ele?.user}` }).select(
        "activity_tab deviceToken"
      );
      notify.notifyContent = `New ${part.event_name} Event will be held on ${part.event_date}`;
      notify.notifySender = depart._id;
      notify.notifyReceiever = user._id;
      notify.participateEventId = part?._id;
      notify.notifyType = "Student";
      notify.participate_event_type = "New Participate Event App";
      notify.notifyPublisher = ele._id;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = depart._id;
      notify.notifyCategory = "Participate Event App";
      notify.redirectIndex = 13;
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "New Participative Event Application",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([notify.save(), user.save()]);
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllParticipateEventQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const depart = await Department.findById({ _id: did });
    const part = await Participate.find({
      _id: { $in: depart?.participate_event },
    })
      .sort("-created_at")
      .limit(limit)
      .skip(skip)
      .select(
        "event_name event_fee event_app_last_date event_date result_notification"
      );
    if (part?.length > 0) {
      // const partEncrypt = await encryptionPayload(part);
      res
        .status(200)
        .send({ message: "All Upcoming Participate Event", part: part });
    } else {
      res
        .status(200)
        .send({ message: "No Upcoming Participate Event", part: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveOneParticipateEventQuery = async (req, res) => {
  try {
    const { pid } = req.params;
    const part = await Participate.findById({ _id: pid })
      .select(
        "event_name event_date event_fee result_notification event_about event_app_last_date event_fee_critiria event_checklist_critiria event_ranking_critiria apply_student_count"
      )
      .populate({
        path: "event_classes",
        select: "className classTitle studentCount",
      })
      .populate({
        path: "department",
        select: "institute",
      });
    // const partEncrypt = await encryptionPayload(part);
    res
      .status(200)
      .send({ message: "One Participate Event Process Query ", part: part });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllParticipateEventStudent = async (req, res) => {
  try {
    var event = [];
    const { pid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const part = await Participate.findById({ _id: pid })
      .select("id")
      .populate({
        path: "event_classes",
        select: "_id ApproveStudent",
      });
    part?.event_classes?.forEach(async (classId) => {
      event.push(...classId?.ApproveStudent);
    });

    const all_students = await Student.find({ _id: { $in: event } })
      .limit(limit)
      .skip(skip)
      .select(
        "studentFirstName studentMiddleName participate_result studentLastName photoId studentProfilePhoto studentGRNO participate_event checkList_participate_event"
      );
    if (all_students?.length > 0) {
      // const eventEncrypt = await encryptionPayload(all_students);
      res.status(200).send({
        message: "All Participate Event Student",
        access: true,
        all_students: all_students,
      });
    } else {
      res.status(200).send({
        message: "No Participate Event Student",
        access: false,
        all_students: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveChecklistParticipateEventStudent = async (req, res) => {
  try {
    const { pid, sid } = req.params;
    var part = await Participate.findById({ _id: pid });
    // var depart = await Department.findById({ _id: `${part.department}` });
    var student = await Student.findById({ _id: sid });
    if (part.event_checklist_critiria === "Yes") {
      part.event_checklist.push({
        student: student._id,
        checklist_status: "Alloted",
      });
      student.checkList_participate_event.push(part?._id);
      part.assigned_checklist_count += 1;
      await part.save();
      res.status(200).send({
        message:
          "Checklist Assigned By Department Head for Participative Event",
        check: true,
      });
      const notify = new StudentNotification({});
      const user = await User.findById({ _id: `${student?.user}` }).select(
        "activity_tab deviceToken"
      );
      notify.notifyContent = `New Checklist Item assigned for ${part.event_name} on ${part.event_date}`;
      notify.notifySender = part?.event_manager;
      notify.notifyReceiever = user._id;
      notify.participateEventId = part?._id;
      notify.notifyType = "Student";
      notify.participate_event_type = "New Participate Event Checklist";
      notify.notifyPublisher = student._id;
      user.activity_tab.push(notify._id);
      notify.notifyByEventManagerPhoto = part?.event_manager;
      notify.notifyCategory = "Participate Event Assign";
      notify.redirectIndex = 13;
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "Assigned Participative Event Checklist",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([student.save(), notify.save(), user.save()]);
    } else {
      res.status(200).send({ message: "Checklist Not Enable", check: false });
    }
  } catch (e) {
    console.log(e);
  }
};

// Student Participant Extra Point Remain Given Result Declare (AutoRefresh)
exports.retrieveResultParticipateEventStudent = async (req, res) => {
  try {
    const { pid, did } = req.params;
    var result_array = [];
    const { result_set } = req.body;
    var part = await Participate.findById({ _id: pid });
    var depart = await Department.findById({ _id: did });
    if (part.event_ranking_critiria === "Yes" && result_set?.length > 0) {
      for (var ref of result_set) {
        var student = await Student.findById({ _id: ref?.sid });
        part.event_rank.push({
          student: student._id,
          rank_title: ref.rank,
          points:
            ref.rank === "Winner"
              ? 25
              : ref.rank === "Ist Runner"
              ? 15
              : ref.rank === "IInd Runner"
              ? 5
              : 5,
        });
        student.participate_result.push({
          event: part?._id,
          rank: ref?.rank,
        });
        result_array.push({
          _id: student?._id,
          name: `${student?.studentFirstName} ${
            student?.studentMiddleName ?? ""
          } ${student?.studentLastName}`,
          rank: ref?.rank,
        });
        if (ref.rank === "Winner") {
          student.extraPoints += 25;
        } else if (ref.rank === "Ist Runner") {
          student.extraPoints += 15;
        } else if (ref.rank === "IInd Runner") {
          student.extraPoints += 5;
        } else {
        }
        await student.save();
      }
      part.result_notification = "Declared";
      await part.save();
      res
        .status(200)
        .send({ message: "Explore The Announced Result ", result: true });
      var all_student = await Student.find({
        _id: { $in: depart?.ApproveStudent },
      }).select("user studentFirstName notification");
      all_student?.forEach(async (ele) => {
        const notify = new StudentNotification({});
        const user = await User.findById({ _id: `${ele?.user}` }).select(
          "activity_tab deviceToken"
        );
        notify.notifyContent = `${
          result_array ? result_array[0]?.name : ""
        } is the ${result_array ? result_array[0]?.rank : ""} of ${
          part.event_name
        }`;
        notify.notifySender = part?.event_manager;
        notify.notifyReceiever = user._id;
        notify.participateEventId = part?._id;
        notify.notifyType = "Student";
        notify.participate_event_type = "Result Participate Event";
        notify.notifyPublisher = ele._id;
        notify.participate_winner = result_array ? result_array[0]?._id : "";
        user.activity_tab.push(notify._id);
        notify.notifyByEventManagerPhoto = part?.event_manager;
        notify.notifyCategory = "Participate Event Result";
        notify.redirectIndex = 13;
        invokeMemberTabNotification(
          "Student Activity",
          notify,
          "Result Declaration",
          user._id,
          user.deviceToken,
          "Student",
          notify
        );
        await Promise.all([notify.save(), user.save()]);
      });
    } else {
      res.status(200).send({ message: "Result Not Declared", result: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveApplyParticipateEventStudent = async (req, res) => {
  try {
    const { pid, sid, statusId } = req.params;
    if (!pid && !sid && !statusId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const part = await Participate.findById({ _id: pid });
    const student = await Student.findById({ _id: sid });
    const status = await StudentNotification.findById({ _id: statusId });
    status.event_payment_status = "Applied";
    part.apply_student.push(student?._id);
    part.apply_student_count += 1;
    // student.participate_event.push(part?._id);

    await Promise.all([part.save(), status.save()]);

    res
      .status(200)
      .send({ message: "Explore Current Participate", access: true });
  } catch (e) {
    console.log(e);
  }
};
