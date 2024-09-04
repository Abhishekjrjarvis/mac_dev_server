const InstituteAdmin = require("../../models/InstituteAdmin");
const Student = require("../../models/Student");
const Staff = require("../../models/Staff");
const User = require("../../models/User");
const Notification = require("../../models/notification");
const Admin = require("../../models/superAdmin");
const Class = require("../../models/Class");
const Department = require("../../models/Department");
const EventManager = require("../../models/Event/eventManager");
const Events = require("../../models/Event/events");
const Seminar = require("../../models/Event/seminar");
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
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const { nested_document_limit } = require("../../helper/databaseFunction");
const {
  designation_alarm,
  email_sms_designation_alarm,
} = require("../../WhatsAppSMS/payload");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");
const moment = require("moment");
const { handle_undefined } = require("../../Handler/customError");
const Election = require("../../models/Elections/Election");
const Participate = require("../../models/ParticipativeEvent/participate");
const { date_renew, generate_date } = require("../../helper/dayTimer");
const { universal_random_password } = require("../../Custom/universalId");

exports.renderNewEventManagerQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { sid } = req.body;
    var institute = await InstituteAdmin.findById({ _id: id });
    var event_manager = new EventManager({});
    const codess = universal_random_password();
    event_manager.member_module_unique = `${codess}`;
    if (sid) {
      var staff = await Staff.findById({ _id: sid });
      var user = await User.findById({ _id: `${staff.user}` });
      var notify = new Notification({});
      staff.eventManagerDepartment.push(event_manager._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = "Events / Seminar Administrator";
      staff.designation_array.push({
        role: "Events / Seminar Administrator",
        role_id: event_manager?._id,
      });
      event_manager.event_head = staff._id;
      notify.notifyContent = `you got the designation of as Events / Seminar Administrator`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Event Manager Designation";
      user.uNotify.push(notify._id);
      notify.user = user._id;
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
        event_manager.save(),
        user.save(),
        notify.save(),
      ]);
      designation_alarm(
        user?.userPhoneNumber,
        "EVENT_MANAGER",
        institute?.sms_lang,
        "",
        "",
        ""
      );
      if (user?.userEmail) {
        email_sms_designation_alarm(
          user?.userEmail,
          "EVENT_MANAGER",
          institute?.sms_lang,
          "",
          "",
          ""
        );
      }
    } else {
      event_manager.event_head = null;
    }
    institute.eventManagerDepart.push(event_manager._id);
    institute.eventManagerStatus = "Enable";
    event_manager.institute = institute._id;
    await Promise.all([institute.save(), event_manager.save()]);
    res.status(200).send({
      message: "Successfully Assigned Staff",
      manager: event_manager._id,
      status: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const manager = await EventManager.findById({ _id: eid })
      .select(
        "event_count created_at seminar_count election_count participate_count remaining_fee event_photo"
      )
      .populate({
        path: "event_head",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      })
      .populate({
        path: "institute",
        select: "insName photoId insProfilePhoto",
      });

    res.status(200).send({
      message: "Explore Event Manager Process",
      access: true,
      manager: manager,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerAllEvents = async (req, res) => {
  try {
    const { eid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const manager = await EventManager.findById({ _id: eid }).select(
      "events event_count"
    );

    if (search) {
      var all_events = await Events.find({
        $and: [{ _id: { $in: manager?.events } }],
        $or: [
          { event_name: { $regex: search, $options: "i" } },
          { event_place: { $regex: search, $options: "i" } },
        ],
      }).select(
        "event_banner event_name event_guest event_date event_time event_status"
      );
    } else {
      var all_events = await Events.find({ _id: { $in: manager?.events } })
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip)
        .select(
          "event_banner event_name event_guest event_date event_time event_status"
        );
    }
    if (all_events?.length > 0) {
      res.status(200).send({
        message: "Explore All Events",
        access: true,
        all_events: all_events,
        count: manager?.event_count,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Event",
        access: false,
        all_events: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerAllSeminars = async (req, res) => {
  try {
    const { eid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const manager = await EventManager.findById({ _id: eid }).select(
      "seminars seminar_count"
    );
    if (search) {
      var all_seminars = await Seminar.find({
        $and: [{ _id: { $in: manager?.seminars } }],
        $or: [
          { seminar_name: { $regex: search, $options: "i" } },
          { seminar_place: { $regex: search, $options: "i" } },
        ],
      }).select(
        "seminar_banner seminar_name seminar_guest seminar_date seminar_time seminar_status seminar_mode"
      );
    } else {
      var all_seminars = await Seminar.find({ _id: { $in: manager?.seminars } })
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(skip)
        .select(
          "seminar_banner seminar_name seminar_guest seminar_date seminar_time seminar_status seminar_mode"
        );
    }

    if (all_seminars?.length > 0) {
      res.status(200).send({
        message: "Explore All Seminars",
        access: true,
        all_seminars: all_seminars,
        count: manager?.seminar_count,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Seminar",
        access: false,
        all_seminars: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerNewEvent = async (req, res) => {
  try {
    const { eid } = req.params;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const seconds = new Date().getSeconds();
    const mill = new Date().getMilliseconds();
    const manager = await EventManager.findById({ _id: eid });
    const new_event = new Events({ ...req.body });
    for (var ref of req?.body?.depart) {
      var depart = await Department.findById({ _id: ref });
      depart.events.push(new_event?._id);
      depart.events_count += 1;
      new_event.for_department.push(depart?._id);
      await depart.save();
    }
    new_event.event_manager = manager?._id;
    new_event.event_date = new Date(`${req.body?.event_date}`);
    new_event.event_time = new Date(
      `${req.body?.event_date}T${req.body?.event_time}:${seconds}.${mill}Z`
    );
    manager.events.push(new_event?._id);
    manager.event_count += 1;
    await Promise.all([manager.save(), new_event.save()]);
    res.status(200).send({ message: "Explore New Event", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerNewSeminar = async (req, res) => {
  try {
    const { eid } = req.params;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const seconds = new Date().getSeconds();
    const mill = new Date().getMilliseconds();
    const manager = await EventManager.findById({ _id: eid });
    const new_seminar = new Seminar({ ...req.body });
    for (var ref of req?.body?.depart) {
      var depart = await Department.findById({ _id: ref });
      depart.seminars.push(new_seminar?._id);
      depart.seminars_count += 1;
      new_seminar.for_department.push(depart?._id);
      await depart.save();
    }
    new_seminar.event_manager = manager?._id;
    new_seminar.seminar_date = new Date(`${req.body?.seminar_date}`);
    new_seminar.seminar_time = new Date(
      `${req.body?.seminar_date}T${req.body?.seminar_time}:${seconds}.${mill}Z`
    );
    manager.seminars.push(new_seminar?._id);
    manager.seminar_count += 1;
    await Promise.all([manager.save(), new_seminar.save()]);
    res.status(200).send({ message: "Explore New Seminar", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerNewElection = async (req, res) => {
  try {
    const { eid } = req.params;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var manager = await EventManager.findById({ _id: eid });
    var elect = new Election({
      election_position: req?.body.election_position,
      election_visible: req?.body.election_visible,
    });
    manager.election.push(elect?._id);
    manager.election_count += 1;
    elect.event_manager = manager?._id;
    elect.election_app_start_date = generate_date(`${req.body?.date}`);
    for (var ref of req?.body?.depart) {
      var depart = await Department.findById({ _id: ref });
      depart.election_event.push(elect?._id);
      depart.election_event_count += 1;
      elect.department.push(depart._id);
      await depart.save();
    }
    await Promise.all([elect.save(), manager.save()]);
    elect.election_app_end_date = await date_renew(
      elect?.election_app_start_date,
      "End",
      depart?.election_date_setting
    );
    // console.log("End", elect.election_app_end_date);
    elect.election_selection_date = await date_renew(
      elect?.election_app_end_date,
      "Select",
      depart?.election_date_setting
    );
    // console.log("Select", elect.election_selection_date);
    elect.election_campaign_date = await date_renew(
      elect?.election_selection_date,
      "Compaign",
      depart?.election_date_setting
    );
    // console.log("Compaign", elect.election_campaign_date);
    elect.election_campaign_last_date = await date_renew(
      elect?.election_campaign_date,
      "Compaign_Last",
      depart?.election_date_setting
    );
    await elect.save();
    res.status(201).send({
      message: "New Election Application will be available",
      status: true,
      elect,
    });
    // console.log("Last", elect?.election_campaign_last_date);
    elect.election_voting_date = await date_renew(
      elect?.election_campaign_last_date,
      "Vote",
      depart?.election_date_setting
    );
    await elect.save();
    // console.log("Vote", elect?.election_voting_date);
    elect.election_result_date = await date_renew(
      elect?.election_voting_date,
      "Result",
      depart?.election_date_setting
    );
    // console.log("res", elect.election_result_date);
    await elect.save();
    if (elect?.election_visible === "Only Institute") {
      var all_student = await Student.find({
        $and: [
          { institute: manager?.institute },
          { studentStatus: "Approved" },
        ],
      }).select("user notification department");
    } else if (elect?.election_visible === "Only Department") {
      var all_students = [];
      for (var ref of req?.body?.depart) {
        const depart = await Department.findById({ _id: `${ref}` }).select(
          "ApproveStudent"
        );
        all_students.push(...depart?.ApproveStudent);
      }
      var all_student = await Student.find({
        _id: { $in: all_students },
      }).select("user notification department");
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
      notify.notifySender = ele?.department?._id;
      notify.notifyReceiever = user._id;
      notify.electionId = elect?._id;
      notify.notifyType = "Student";
      notify.election_type = "New Election App";
      notify.notifyPublisher = ele._id;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = ele?.department?._id;
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
      await Promise.all([notify.save(), user.save()]);
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerInstituteQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    const { search } = req.query;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const manager = await EventManager.findById({ _id: eid });
    const one_ins = await InstituteAdmin.findById({
      _id: `${manager?.institute}`,
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

exports.renderOneEventManagerNewParticipate = async (req, res) => {
  try {
    const { eid } = req.params;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const manager = await EventManager.findById({ _id: eid });
    var part = new Participate({ ...req.body });
    manager.participate.push(part?._id);
    manager.participate_count += 1;
    for (var ref of req?.body?.depart) {
      var depart = await Department.findById({ _id: ref });
      depart.participate_event.push(part?._id);
      depart.participate_event_count += 1;
      part.department.push(depart._id);
      await depart.save();
    }
    part.event_manager = manager?._id;
    part.event_fee = parseInt(req.body?.event_fee);
    part.event_app_last_date = new Date(`${req.body?.lastDate}`).toISOString();
    part.event_date = new Date(`${req.body?.date}`).toISOString();
    part.event_classes.push(...req.body?.classes);
    await Promise.all([manager.save(), part.save()]);
    res.status(200).send({
      message: "New Participate Event Application will be available",
      status: true,
    });
    var all_students = [];
    for (var ref of req?.body?.depart) {
      const depart = await Department.findById({ _id: `${ref}` }).select(
        "ApproveStudent"
      );
      all_students.push(...depart?.ApproveStudent);
    }
    var all_student = await Student.find({
      _id: { $in: all_students },
    }).select("user notification department");
    all_student?.forEach(async (ele) => {
      const notify = new StudentNotification({});
      const user = await User.findById({ _id: `${ele?.user}` }).select(
        "activity_tab deviceToken"
      );
      notify.notifyContent = `New ${part.event_name} Event will be held on ${part.event_date}`;
      notify.notifySender = ele?.department?._id;
      notify.notifyReceiever = user._id;
      notify.participateEventId = part?._id;
      notify.notifyType = "Student";
      notify.participate_event_type = "New Participate Event App";
      notify.notifyPublisher = ele._id;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = ele?.department?._id;
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

exports.renderOneEventManagerAllElections = async (req, res) => {
  try {
    const { eid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const manager = await EventManager.findById({ _id: eid }).select(
      "election election_count"
    );

    if (search) {
      var all_elections = await Election.find({
        $and: [{ _id: { $in: manager?.election } }],
        $or: [{ event_position: { $regex: search, $options: "i" } }],
      }).select(
        "election_position election_visible election_app_start_date election_app_end_date election_status election_voting_date"
      );
    } else {
      var all_elections = await Election.find({
        _id: { $in: manager?.election },
      })
        .limit(limit)
        .skip(skip)
        .select(
          "election_position election_visible election_app_start_date election_app_end_date election_status election_voting_date"
        );
    }
    if (all_elections?.length > 0) {
      res.status(200).send({
        message: "Explore All Elections",
        access: true,
        all_elections: all_elections,
        count: manager?.election_count,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Elections",
        access: false,
        all_elections: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventManagerAllParticipate = async (req, res) => {
  try {
    const { eid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const manager = await EventManager.findById({ _id: eid }).select(
      "participate participate_count"
    );

    if (search) {
      var all_participate = await Participate.find({
        $and: [{ _id: { $in: manager?.participate } }],
        $or: [{ event_position: { $regex: search, $options: "i" } }],
      }).select(
        "event_name event_date event_about event_app_last_date event_fee"
      );
    } else {
      var all_participate = await Participate.find({
        _id: { $in: manager?.participate },
      })
        .limit(limit)
        .skip(skip)
        .select(
          "event_name event_date event_about event_app_last_date event_fee"
        );
    }
    if (all_participate?.length > 0) {
      res.status(200).send({
        message: "Explore All Participate",
        access: true,
        all_participate: all_participate,
        count: manager?.participate_count,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Participate",
        access: false,
        all_participate: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventQuery = async (req, res) => {
  try {
    const { evid } = req.params;
    if (!evid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_event = await Events.findById({ _id: evid }).populate({
      path: "for_department",
      select: "dName dTitle photo ",
    });

    res.status(200).send({
      message: "Explore One Event",
      access: true,
      one_event: one_event,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneSeminarQuery = async (req, res) => {
  try {
    const { smid } = req.params;
    if (!smid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_seminar = await Seminar.findById({ _id: smid }).populate({
      path: "for_department",
      select: "dName dTitle photo ",
    });

    res.status(200).send({
      message: "Explore One Seminar",
      access: true,
      one_seminar: one_seminar,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneDepartmentAllEvents = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did }).select(
      "events events_count"
    );
    if (search) {
      var all_events = await Events.find({
        $and: [{ _id: { $in: depart?.events } }],
        $or: [
          { event_name: { $regex: search, $options: "i" } },
          { event_place: { $regex: search, $options: "i" } },
        ],
      }).select(
        "event_banner event_name event_guest event_date event_time event_status"
      );
    } else {
      var all_events = await Events.find({ _id: { $in: depart?.events } })
        .limit(limit)
        .skip(skip)
        .select(
          "event_banner event_name event_guest event_date event_time event_status"
        );
    }
    if (all_events?.length > 0) {
      res.status(200).send({
        message: "Explore All Events",
        access: true,
        all_events: all_events,
        count: depart?.events_count,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Event",
        access: false,
        all_events: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneDepartmentAllSeminars = async (req, res) => {
  try {
    const { did } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const depart = await Department.findById({ _id: did }).select(
      "seminars seminars_count"
    );

    if (search) {
      var all_seminars = await Seminar.find({
        $and: [{ _id: { $in: depart?.seminars } }],
        $or: [
          { event_name: { $regex: search, $options: "i" } },
          { event_place: { $regex: search, $options: "i" } },
        ],
      }).select(
        "seminar_banner seminar_name seminar_guest seminar_date seminar_time seminar_status seminar_mode"
      );
    } else {
      var all_seminars = await Seminar.find({ _id: { $in: depart?.seminars } })
        .limit(limit)
        .skip(skip)
        .select(
          "seminar_banner seminar_name seminar_guest seminar_date seminar_time seminar_status seminar_mode"
        );
    }
    if (all_seminars?.length > 0) {
      res.status(200).send({
        message: "Explore All Seminars",
        access: true,
        all_seminars: all_seminars,
        count: depart?.seminars_count,
      });
    } else {
      res.status(200).send({
        message: "No Upcoming Seminar",
        access: false,
        all_seminars: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventUpdateQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    const { date, time, new_depart, deleteDepart, delete_pic } = req.body;
    const image = await handle_undefined(delete_pic);
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const seconds = new Date().getSeconds();
    const mill = new Date().getMilliseconds();
    const event_query = await Events.findByIdAndUpdate(eid, req.body);
    if (date) {
      event_query.event_date = new Date(`${date}`);
    }
    if (time) {
      event_query.event_time = new Date(`${date}T${time}:${seconds}.${mill}Z`);
    }
    if (image) {
      await deleteFile(image);
    }
    res
      .status(200)
      .send({ message: "Update Successfully Event", access: true });
    if (new_depart?.length > 0) {
      for (var ele of new_depart) {
        const department = await Department.findById({ _id: ele });
        event_query.for_department.push(department?._id);
        department.events.push(event_query?._id);
        department.events_count += 1;
        await department.save();
      }
    }
    if (deleteDepart?.length > 0) {
      for (var ref of deleteDepart) {
        const department = await Department.findById({ _id: ref });
        event_query.for_department.pull(department?._id);
        department.events.pull(event_query?._id);
        if (department.events_count > 0) {
          department.events_count -= 1;
        }
        await department.save();
      }
    }
    await event_query.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneSeminarUpdateQuery = async (req, res) => {
  try {
    const { smid } = req.params;
    const { date, time, new_depart, deleteDepart, delete_pic } = req.body;
    const image = await handle_undefined(delete_pic);
    if (!smid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const seconds = new Date().getSeconds();
    const mill = new Date().getMilliseconds();
    const seminar_query = await Seminar.findByIdAndUpdate(smid, req.body);
    if (date) {
      seminar_query.seminar_date = new Date(`${date}`);
    }
    if (time) {
      seminar_query.seminar_time = new Date(
        `${date}T${time}:${seconds}.${mill}Z`
      );
    }
    if (image) {
      await deleteFile(image);
    }
    res
      .status(200)
      .send({ message: "Update Successfully Seminar", access: true });
    if (new_depart?.length > 0) {
      for (var ele of new_depart) {
        const department = await Department.findById({ _id: ele });
        seminar_query.for_department.push(department?._id);
        department.seminars.push(seminar_query?._id);
        department.seminars_count += 1;
        await department.save();
      }
    }
    if (deleteDepart?.length > 0) {
      for (var ref of deleteDepart) {
        const department = await Department.findById({ _id: ref });
        seminar_query.for_department.pull(department?._id);
        department.seminars.pull(seminar_query?._id);
        if (department.seminars_count > 0) {
          department.seminars_count -= 1;
        }
        await department.save();
      }
    }
    await seminar_query.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneEventDestroyQuery = async (req, res) => {
  try {
    const { eid } = req.params;
    if (!eid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const event_query = await Events.findById({ _id: eid });
    const manager = await EventManager.findById({
      _id: `${event_query?.event_manager}`,
    });
    manager.events.pull(event_query?._id);
    if (manager?.event_count > 0) {
      manager.event_count -= 1;
    }
    await manager.save();
    for (var ref of event_query?.for_department) {
      const depart = await Department.findById({ _id: ref });
      depart.events.pull(event_query?._id);
      if (depart?.events_count > 0) {
        depart.events_count -= 1;
      }
      await depart.save();
    }
    await Events.findByIdAndDelete(eid);
    res
      .status(200)
      .send({ message: "Event Deletion Operation Completed", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneSeminarDestroyQuery = async (req, res) => {
  try {
    const { smid } = req.params;
    if (!smid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const seminar_query = await Seminar.findById({ _id: smid });
    const manager = await EventManager.findById({
      _id: `${seminar_query?.event_manager}`,
    });
    manager.seminars.pull(seminar_query?._id);
    if (manager?.seminar_count > 0) {
      manager.seminar_count -= 1;
    }
    await manager.save();
    for (var ref of seminar_query?.for_department) {
      const depart = await Department.findById({ _id: ref });
      depart.seminars.pull(seminar_query?._id);
      if (depart?.seminars_count > 0) {
        depart.seminars_count -= 1;
      }
      await depart.save();
    }
    await Seminar.findByIdAndDelete(smid);
    res
      .status(200)
      .send({ message: "Seminar Deletion Operation Completed", access: true });
  } catch (e) {
    console.log(e);
  }
};
