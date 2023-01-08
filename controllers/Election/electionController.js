const Election = require("../../models/Elections/Election");
const Notification = require("../../models/notification");
const invokeSpecificRegister = require("../../Firebase/specific");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const Department = require("../../models/Department");
const User = require("../../models/User");
const Student = require("../../models/Student");
const StudentNotification = require("../../models/Marks/StudentNotification");
const moment = require("moment");
const InstituteAdmin = require("../../models/InstituteAdmin");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

const date_renew = (s_date, type) => {
  var r_l_date = new Date(s_date);
  if (type === "End") {
    r_l_date.setDate(r_l_date.getDate() + 3);
  } else if (type === "Select") {
    r_l_date.setDate(r_l_date.getDate() + 2);
  } else if (type === "Compaign") {
    r_l_date.setDate(r_l_date.getDate() + 7);
  } else if (type === "Vote") {
    r_l_date.setDate(r_l_date.getDate() + 1);
  } else if (type === "Result") {
    r_l_date.setDate(r_l_date.getDate() + 1);
  } else {
  }
  var r_l_day = r_l_date.getDate();
  var r_l_month = r_l_date.getMonth() + 1;
  var r_l_year = r_l_date.getFullYear();
  if (r_l_month < 10) {
    r_l_month = `0${r_l_month}`;
  }
  if (r_l_day <= 9) {
    r_l_day = `0${r_l_day}`;
  }
  return new Date(`${r_l_year}-${r_l_month}-${r_l_day}`);
};

exports.retrieveNewElectionQuery = async (req, res) => {
  try {
    const { did } = req.params;
    var depart = await Department.findById({ _id: did });
    var elect = new Election({ ...req.body });
    depart.election_event.push(elect._id);
    depart.election_event_count += 1;
    elect.department = depart._id;
    elect.election_app_start_date = new Date(`${req.body?.date}`).toISOString();
    await Promise.all([depart.save(), elect.save()]);
    res.status(201).send({
      message: "New Election Application will be available",
      status: true,
    });
    elect.election_app_end_date = date_renew(
      elect.election_app_start_date,
      "End"
    ).toISOString();
    elect.election_selection_date = date_renew(
      elect.election_app_end_date,
      "Select"
    ).toISOString();
    elect.election_campaign_date = date_renew(
      elect.election_selection_date,
      "Compaign"
    ).toISOString();
    elect.election_voting_date = date_renew(
      elect.election_campaign_date,
      "Vote"
    ).toISOString();
    elect.election_result_date = date_renew(
      elect.election_voting_date,
      "Result"
    ).toISOString();
    await elect.save();

    if (elect?.election_visible === "Only Institute") {
      var all_student = await Student.find({
        $and: [{ institute: depart?.institute }, { studentStatus: "Approved" }],
      }).select("user notification");
    } else if (elect?.election_visible === "Only Department") {
      var all_student = await Student.find({
        _id: { $in: depart?.ApproveStudent },
      }).select("user notification");
    } else {
    }

    all_student?.forEach(async (ele) => {
      const notify = new StudentNotification({});
      const user = await User.findById({ _id: `${ele?.user}` }).select(
        "activity_tab deviceToken"
      );
      notify.notifyContent = `Apply from ${moment(
        elect?.election_app_start_date
      ).format("LL")} to ${moment(elect?.election_app_end_date).format(
        "LL"
      )} , Voting Date ${moment(elect?.election_voting_date).format("LL")}.`;
      notify.notifySender = depart._id;
      notify.notifyReceiever = user._id;
      notify.electionId = elect?._id;
      notify.notifyType = "Student";
      notify.election_type = "New Election App";
      notify.notifyPublisher = ele._id;
      user.activity_tab.push(notify._id);
      ele.notification.push(notify._id);
      notify.notifyByDepartPhoto = depart._id;
      notify.notifyCategory = "Election";
      notify.redirectIndex = 12;
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "New Election Application",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([ele.save(), notify.save(), user.save()]);
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllElectionQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const depart = await Department.findById({ _id: did }).select(
      "election_event"
    );
    const elect = await Election.find({ _id: { $in: depart?.election_event } })
      .sort("-created_at")
      .limit(limit)
      .skip(skip)
      .select(
        "election_position election_app_start_date election_voting_date election_status"
      );
    if (elect?.length > 0) {
      // const electEncrypt = await encryptionPayload(elect);
      res
        .status(200)
        .send({ message: "All Upcoming Election Event", elect: elect });
    } else {
      res
        .status(200)
        .send({ message: "No Upcoming Election Event", elect: [] });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.retrieveOneElectionQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    const elect = await Election.findById({ _id: eid })
      .select(
        "election_position election_app_start_date election_app_end_date election_selection_date election_campaign_date election_result_date election_voting_date election_status"
      )
      .populate({
        path: "election_candidate",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO",
        },
        select:
          "election_candidate_status election_result_status election_vote_receieved election_tag_line election_description",
      });
    // const oneElectEncrypt = await encryptionPayload(elect);
    res
      .status(200)
      .send({ message: "One Election Event Process Query ", elect: elect });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveOneElectionQueryCandidate = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { eid } = req.params;
    const all_candidate = await Election.findById({ _id: eid }).populate({
      path: "election_candidate",
      options: {
        limit: limit,
        skip: skip,
      },
      populate: {
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO",
      },
    });
    if (all_candidate?.election_candidate?.length > 0) {
      // const allEncrypt = await encryptionPayload(all_candidate);
      res.status(200).send({
        message: "All Candidate List 😀",
        all_candidate,
        status: true,
      });
    } else {
      res.status(200).send({
        message: "No Candidate List 😀",
        all_candidate: [],
        status: false,
      });
    }
  } catch {}
};
exports.retrieveApplyElectionQuery = async (req, res) => {
  try {
    const { eid, sid } = req.params;
    const { tagLine, description, members } = req.body;
    var elect = await Election.findById({ _id: eid });
    var student = await Student.findById({ _id: sid });
    elect.election_candidate.push({
      student: student?._id,
      election_tag_line: tagLine,
      election_description: description,
      election_supporting_member: [...members],
    });
    await elect.save();
    res.status(200).send({
      message: "One Election Event Process Query ",
      apply_elect: true,
    });

    members?.forEach(async (ele) => {
      const student_support = await Student.findById({ _id: `${ele}` }).select(
        "user notification"
      );
      const notify = new StudentNotification({});
      const user = await User.findById({
        _id: `${student_support?.user}`,
      }).select("activity_tab deviceToken");
      notify.notifyContent = `You have been choosen as supporting member for ${
        elect?.election_position
      } by ${student.studentFirstName} ${
        student.studentMiddleName ? student.studentMiddleName : ""
      } ${
        student.studentLastName
      }. (If you have not supporting please contact with respectiv department)`;
      notify.notifySender = student._id;
      notify.notifyReceiever = user._id;
      notify.electionId = elect?._id;
      notify.election_type = "Supporting Member";
      notify.notifyType = "Student";
      notify.notifyPublisher = student_support._id;
      user.activity_tab.push(notify._id);
      student_support.notification.push(notify._id);
      notify.notifyByStudentPhoto = student._id;
      notify.notifyCategory = "Election Member";
      notify.redirectIndex = 12;
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "Election Nomination",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([student_support.save(), notify.save(), user.save()]);
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStatusElectionQuery = async (req, res) => {
  try {
    const { eid, applyId, sid } = req.params;
    const { status } = req.query;
    var elect = await Election.findById({ _id: eid });
    var depart = await Department.findById({
      _id: `${elect?.department}`,
    }).select("institute ApproveStudent");
    if (status === "Approved") {
      elect.election_total_voter += 1;
    }
    elect?.election_candidate?.forEach(async (ele) => {
      if (`${ele?._id}` === `${applyId}`) {
        ele.election_candidate_status = status;
      }
    });
    await elect.save();
    res.status(200).send({ message: "Enjoy Election 😀", status: true });

    const student = await Student.findById({ _id: sid }).select(
      "user notification"
    );
    const notify = new StudentNotification({});
    const user = await User.findById({ _id: `${student?.user}` }).select(
      "activity_tab deviceToken"
    );
    notify.notifyContent = `Apply from ${moment(
      elect?.election_app_start_date
    ).format("LL")} to ${moment(elect?.election_app_end_date).format(
      "LL"
    )} , Voting Date ${moment(elect?.election_voting_date).format("LL")}.
        Your application for ${
          elect?.election_position
        } is ${status} by authorities`;
    notify.notifySender = depart._id;
    notify.notifyReceiever = user._id;
    notify.electionId = elect?._id;
    notify.notifyType = "Student";
    notify.election_type = "Election App Status";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    student.notification.push(notify._id);
    notify.notifyByDepartPhoto = depart._id;
    notify.notifyCategory = "Election Status";
    notify.redirectIndex = 12;
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      "Nomination Status",
      user._id,
      user.deviceToken,
      "Student",
      notify
    );
    await Promise.all([student.save(), notify.save(), user.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveVoteElectionQuery = async (req, res) => {
  try {
    const { eid, applyId, sid, nid } = req.params;
    var elect = await Election.findById({ _id: eid });
    var student = await Student.findById({ _id: sid });
    const notify = await StudentNotification.findById({ _id: nid });
    elect?.election_candidate?.forEach(async (ele) => {
      if (`${ele?._id}` === `${applyId}`) {
        ele.election_vote_receieved += 1;
        ele.voted_student.push(student?._id);
      }
    });
    elect.election_total_voter += 1;
    elect.election_vote_cast += 1;
    notify.vote_status = "Voted";
    await Promise.all([notify.save(), elect.save()]);
    res.status(200).send({ message: "Vote Done 👍✨😀 ", voted: true });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveVoteElectionDepartment = async (req, res) => {
  try {
    const { did } = req.params;
    const { search } = req.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const depart = await Department.findById({ _id: did });
    const one_ins = await InstituteAdmin.findById({
      _id: `${depart?.institute}`,
    }).select("ApproveStudent");

    if (search) {
      var all_student = await Student.find({
        $and: [
          {
            institute: one_ins?._id,
          },
          {
            studentStatus: "Approved",
          },
        ],
        $or: [
          { studentFirstName: { $regex: search, $options: "i" } },
          {
            studentMiddleName: { $regex: search, $options: "i" },
          },
          { studentLastName: { $regex: search, $options: "i" } },
        ],
      }).select(
        "studentFirstName studentMiddleName studentLastName status studentGRNO photoId studentProfilePhoto"
      );
    } else {
      var all_student = await Student.find({
        _id: { $in: one_ins?.ApproveStudent },
      })
        .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select(
          "studentFirstName studentMiddleName studentLastName studentGRNO photoId studentProfilePhoto"
        );
    }
    if (all_student?.length > 0) {
      // const allStudentEncrypt = await encryptionPayload(all_student);
      res.status(200).send({
        message: "All Supporting Member Array 😀",
        all: all_student,
        status: true,
      });
    } else {
      res.status(200).send({
        message: "No Supporting Member Array 😡",
        all: [],
        status: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
