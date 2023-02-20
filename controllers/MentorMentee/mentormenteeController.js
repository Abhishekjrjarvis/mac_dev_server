const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const Department = require("../../models/Department");
const Mentor = require("../../models/MentorMentee/mentor");
const Notification = require("../../models/notification");
const User = require("../../models/User");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const StudentNotification = require("../../models/Marks/StudentNotification");

exports.renderNewMentorQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { sid } = req.body;
    if (!did && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: staff?.user });
    const mentor_query = new Mentor({});
    const notify = new Notification({});
    mentor_query.mentor_head = staff?._id;
    depart.mentor.push(mentor_query?._id);
    depart.mentor_count += 1;
    mentor_query.department = depart?._id;
    staff.mentorDepartment.push(mentor_query?._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = "Mentor";
    notify.notifyContent = `you got the designation of as Mentor`;
    notify.notifySender = depart?._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Mentor Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByDepartPhoto = depart?._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      depart?.dName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      depart.save(),
      user.save(),
      notify.save(),
      staff.save(),
      mentor_query.save(),
    ]);
    res.status(200).send({ message: "Explore new designation", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllMentorQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did }).select("mentor");

    const all_mentor = await Mentor.find({ _id: { $in: depart?.mentor } })
      .limit(limit)
      .skip(skip)
      .select("pending_query_count mentees_count")
      .populate({
        path: "mentor_head",
        select:
          "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
      });

    if (all_mentor?.length > 0) {
      res.status(200).send({
        message: "Explore all mentors by your preference",
        access: true,
        all_mentor: all_mentor,
      });
    } else {
      res
        .status(200)
        .send({ message: "You lost in space", access: false, all_mentor: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneMentorQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const mentor = await Mentor.findById({ _id: mid }).select(
      "mentees_count total_query_count pending_query_count rating"
    );

    res
      .status(200)
      .send({ message: "Explore your details", access: true, mentor });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneMentorAllMenteesQuery = async (req, res) => {
  try {
    const { mid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const mentor = await Mentor.findById({ _id: mid });

    const all_mentees = await Student.find({ _id: { $in: mentor?.mentees } })
      .limit(limit)
      .skip(skip)
      .select(
        "query_count studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto"
      );

    if (all_mentees?.length > 0) {
      res.status(200).send({
        message: "Explore all Mentees by your preference",
        access: true,
        all_mentees: all_mentees,
      });
    } else {
      res
        .status(200)
        .send({ message: "You lost in space", access: false, all_mentees: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewMentorMenteeQuery = async (req, res) => {
  try {
    const { did, mid } = req.params;
    const { sid } = req.body;
    if (!did && !sid && !mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: student?.user });
    const mentor_query = await Mentor.findById({ _id: mid }).populate({
      path: "mentor_head",
      select: "staffFirstName staffLastName",
    });
    depart.mentees_count += 1;
    student.mentor = mentor_query?._id;
    mentor_query.mentees_count += 1;
    mentor_query.mentees.push(student?._id);
    const notify = new StudentNotification({});
    notify.notifyContent = `${mentor_query?.mentor_head?.staffFirstName} ${mentor_query?.mentor_head?.staffLastName} is assigned as your Mentor`;
    notify.notifySender = depart._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    notify.mentorId = mentor_query._id;
    user.activity_tab.push(notify._id);
    notify.notifyByDepartPhoto = depart._id;
    notify.notifyCategory = "Assigned Mentor";
    notify.redirectIndex = 29;

    await Promise.all([
      depart.save(),
      student.save(),
      user.save(),
      notify.save(),
      mentor_query.save(),
    ]);
    res.status(200).send({ message: "Congrats for new mentees", access: true });
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      "Assigned Mentor",
      user._id,
      user.deviceToken,
      "Student",
      notify
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderDestroyMentorMenteeQuery = async (req, res) => {
  try {
    const { did, mid } = req.params;
    const { sid } = req.body;
    if (!did && !sid && !mid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did });
    const student = await Student.findById({ _id: sid });
    const mentor_query = await Mentor.findById({ _id: mid });
    if (depart.mentees_count > 0) {
      depart.mentees_count -= 1;
    }
    student.mentor = null;
    if (mentor_query.mentees_count > 0) {
      mentor_query.mentees_count -= 1;
    }
    mentor_query.mentees.pull(student?._id);

    await Promise.all([depart.save(), student.save(), mentor_query.save()]);
    res.status(200).send({ message: "Removal of mentees", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewMenteeQuery = async (req, res) => {
  try {
    const { mid, sid } = req.params;
    if (!mid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const student = await Student.findById({ _id: sid });
    const mentor = await Mentor.findById({ _id: mid });
    const new_query = new Queries({ ...req.body });
  } catch (e) {
    console.log(e);
  }
};
